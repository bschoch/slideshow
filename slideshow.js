var fs = require('fs')
var q = require('q')
var gm = require('gm')
gm = gm.subClass({ imageMagick: true });
var facebook = require('./facebook.js')
var utilities = require('./utilities.js')
var ffmpeg = require('./ffmpeg.js')
var spawn = require('child_process').spawn

var times = [3622, 139, 163, 302, 18274, 371, 93, 1393, 1231, 1904, 627, 1254, 278, 952, 2276, 1486, 906, 325, 2531, 1230, 279, 906, 998, 325, 163, 464, 464, 2322, 209, 2578, 1300, 302, 859, 2345, 256, 464, 1904, 1997, 581, 1300, 255, 883, 2322, 278, 627, 279, 348, 627, 302, 325, 1858, 325, 278, 581, 952, 395, 278, 302, 1254, 650, 325, 302, 627, 627, 604, 302, 325, 1880, 326, 301, 627, 233, 394, 441, 2555, 418, 162, 2508, 3924, 1161, 2369, 2531, 2438, 209, 1230, 1208, 1091, 882, 511, 1370, 906, 255, 2531, 1300, 302, 859, 1347, 627, 279, 209, 1370, 1161, 1973, 581, 1300, 256, 673, 209, 1788, 116, 8800]
var videoLimit = 200
var audioTrack = 'audio/Shakey-Graves_Family-and-Genus.mp4'
var extension = 'mp4'
var imagesPath = 'images'
var scaleWidth = 960
var scaleHeight = 720
var imageNames = []

// options
// track <path to track> uses extension of of track as final video format
// times [2000, 399, 123, 1234] json array of times in ms to show each image
// imagesPath <path to image directory> defaults to 'images'
// scale 960x720 the scale to the final video and what the images will be cropped too

exports.create = function (options) {
  if (options.track) {
    audioTrack = options.track
    extension = audioTrack.split('.').pop()
  }
  if (options.times) {
    times = options.times
  }
  if (options.imagePath) {
    imagePath = options.imagePath
  }
  if (options.scale) {
    scaleWidth = Number(options.scale.split('x')[0])
    scaleHeight = Number(options.scale.split('x')[1])
  }

  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath)
  }

  var deferred = q.defer()
  var begin = new Date().getTime()
  imageNames = fs.readdirSync(imagesPath)
  var begin = new Date().getTime()
  console.log("slideshow modifying images")
  modifyImages(imageNames).then(function () {
    var modifiedImages = new Date().getTime()
    console.log("slideshow creating video stills " + modifiedImages - begin)
    createVideoStills(times).then(function () {
      var createdVideoStills = new Date().getTime()
      console.log("slideshow concatenating video stills " + createdVideoStills - modifiedImages)
      concatenateVideoStills().then(function () {
        var concatenatedStills = new Date().getTime()
        console.log("slideshow adding audio track " + concatenatedStills - createdVideoStills)
        addAudioTrack(audioTrack).then(function () {
          var addAudioTrack = new Date().getTime()
          console.log("added audio track " + addAudioTrack - concatenatedStills)
          deferred.resolve('success')
        })
      })
    })
  }).fail(function (err) {
    console.log(err)
    deferred.reject('fail')
  })

  return deferred.promise
}

function modifyImages(names) {
  var deferred = q.defer()
  var processed = 0
  names.forEach(function (imageName, i) {
    var imagePath = imagesPath + '/' + imageName
    gm(imagePath).size(function (err, size) {
      if (err) {
        console.log('Error getting image size ' + imageName)
        console.log(err)
        return deferred.reject(err)
      }
      var scaleX = true
      var xRatio = scaleWidth / size.width
      var yRatio = scaleHeight / size.height

      if (size.height < scaleHeight && size.width >= scaleWidth) {
        scaleX = false
      } else if (size.width >= scaleWidth || size.height < scaleHeight) {
        if (yRatio > xRatio) {
          scaleX = false
        }
      }

      if (scaleX) {
        img = gm(imagePath).resize(scaleWidth)
      } else {
        img = gm(imagePath).resize(null, scaleHeight)
      }

      var xOffset, yOffset
      xOffset = yOffset = 0
      var img

      img.crop(scaleWidth, scaleHeight, xOffset, yOffset).write(imagePath, function (err, value) {
        if (err) {
          console.log('Error resizing image ' + imageName)
          console.log(err)
          return deferred.reject(err)
        }
        if (++processed == names.length) {
          deferred.resolve('success')
        }
      })
    })

  })
  return deferred.promise
}

function createVideoStills(times) {
  var deferred = q.defer()
  var batches = 0
  utilities.rmdir('./temp')
  fs.mkdirSync('./temp')
  batchVideos(0, '')
  return deferred.promise

  function batchVideos(i, lastImageName) {
    var finishedVideos = 0
    if (i < times.length / videoLimit) {
      for (var j = 0; j < videoLimit; j += 1) {
        var timesIndex = i * videoLimit + j
        if (timesIndex < times.length) {
          var seconds = Math.floor(times[timesIndex] / 1000) + ''
          var milliseconds = times[timesIndex] % 1000 + ''
          var time = ''
          for (var k = 0; k < 3 - milliseconds.length; ++k) {
            time += '0'
          }
          time = seconds + '.' + time + milliseconds
          var imageName = imagesPath + '/' + (Math.floor(Math.random() * (imageNames.length - 1) + 1)) + '.jpg'
          while (imageName == lastImageName) {
            imageName = imagesPath + '/' + (Math.floor(Math.random() * (imageNames.length - 1) + 1)) + '.jpg'
          }
          lastImageName = imageName
          var destination = './temp/' + (i + '') + '.' + (j + '') + '.' + extension
          saveVideo(imageName, time, destination)
        }
      }
    }

    function saveVideo(imageName, time, destination) {
      ffmpeg.imageToVideo(imageName, time, destination, scaleWidth, scaleHeight).then(function (message) {
        console.log(message)
        if (++finishedVideos == (i == Math.floor(times.length / videoLimit) ? times.length % videoLimit : videoLimit)) {
          if (++batches == Math.ceil(times.length / videoLimit)) {
            console.log('created all video stills')
            deferred.resolve('success')
          } else {
            batchVideos(i + 1, lastImageName)
          }
        }
      }).fail(function (message) {
        console.log(message)
        return deferred.reject('failure')
      })
    }
  }
}

function concatenateVideoStills() {
  var deferred = q.defer()
  var finished = 0
  concatenate(0)
  return deferred.promise

  function concatenate(i) {
    if (i < times.length / videoLimit) {
      var videoPaths = []
      for (var j = 0; j < videoLimit; j += 1) {
        if (i * videoLimit + j < times.length) {
          videoPaths.push('./temp/' + (i + '') + '.' + (j + '') + '.' + extension)
        }
      }
      ffmpeg.concatenateVideos(videoPaths, './temp/conc' + i + '.' + extension).then(function (message) {
        if (++finished == Math.ceil(times.length / videoLimit)) {
          return concatenateFinalVideo().then(function () {
            console.log('successfully merged all video still files')
            return deferred.resolve('success')
          })
        } else {
          concatenate(i + 1)
        }
      }).fail(function (message) {
        console.log(message)
        return deferred.reject('failure')
      })
    }
  }
}

function concatenateFinalVideo() {
  var deferred = q.defer()
  var videoPaths = []
  for (var i = 0; i < times.length / videoLimit; i += 1) {
    videoPaths.push('./temp/conc' + i + '.' + extension)
  }
  ffmpeg.concatenateVideos(videoPaths, './temp/conc' + '.' + extension).then(function (message) {
    console.log(message)
    return deferred.resolve('success')
  }).fail(function (message) {
    console.log(message)
    return deferred.reject('failure')
  })
  return deferred.promise
}

function addAudioTrack(audioPath) {
  var deferred = q.defer()
  ffmpeg.addAudioToVideo('./temp/conc' + '.' + extension, audioPath, './output' + '.' + extension).then(function (message) {
    console.log(message)
    deferred.resolve('success')
  }).fail(function (message) {
    console.log(message)
    deferred.reject('failure')
  })
  return deferred.promise
}
