var fs = require('fs')
var q = require('q')
var gm = require('gm')
gm = gm.subClass({ imageMagick: true });
var facebook = require('./facebook.js')
var utilities = require('./utilities.js')
var ffmpeg = require('./ffmpeg.js')
var spawn = require('child_process').spawn

var times = [253,600,1026,251,223,577,524,476,472,579,497,525,476,574,501,524,474,1126,976,524,526,550,473,527,501,547,479,549,497,550,499,251,275,275,249,275,225,277,248,276,249,250,250,525,775,255,270,251,276,251,249,250,273,250,250,277,498,253,797,1028,522,525,500,525,525,251,250,274,250,277,249,251,248,525,501,528,522,277,248,251,250,250,273,376,274,250,300,225,301,224,250,276,374,250,400,500,350,325,250,226,224,251,324,275,251,250,276,250,400,399,249,250,252,250,249,373,426,250,252,272,250,228,298,249,375,300,350,525,500,401,250,274,250,251,400,251,273,252,526,523,226,274,250,249,278,274,253,271,224,277,500,277,272,502,272,250,376,274,250,400,227,273,275,376,400,250,250,275,525,224,278,223,299,251,249,350,578,372,255,522,498,553,497,275,250,276,251,249,250,250,424,377,249,250,274,251,274,227,273,250,277,250,251,272,251,374,402,250,400,349,301,250,275,248,250,277,248,251,251,423,376,249,301,223,250,277,249,249,277,249,250,275,250,251,779,398,399,250,775,250,549,226,248,274,251,275,249,252,273,250,400,250,276,374,250,250,276,249,251,399,300,226,251,274,375,254,247,274,249,251,278,249,249,273,251,249,275,253,249,273,400,250,276,351,273,250,277,250,250,250,273,425,325,1003,248,249,276,349,401,400,226,399,401,249,374,375,250,253,272,227,799,449,275,227,348,325,250,425,400,325,428,272,225,525,225,251,300,226,250,273,377,600,273,325,378,324,449,351,223,299,226,300,229,295,327,398,252,500,299,502,322,375,226,450,579,246,400,526,503,248,249,273,277,773,250,250,275,250,260,516,501,273,252,250,273,525,252,248,275,251,274,250,500,276,251,523,250,278,499,278,246,249,278,249,250,523,276,251,250,523,250,275,252,373,400,275,2554,497,551,525,251,249,274,248,250,276,253,422,350,275,225,277,251,271,251,275,251,251,272,251,252,248,399,400,251,250,275,250,250,250,275,249,276,251,249,276,224,427,373,250,299,227,524,249,276,252,250,249,273,250,250,276,524,375,401,250,776,249,578,222,250,249,255,271,249,275,252,250,273,250,250,279,249,248,274,250,250,275,250,252,273,250,251,274,252,250,273,250,250,277,250,249,274,250,400,275,250,250,250,400,251,250,277,249,249,301,223,251,277,250,249,273,250,250,226,251,451,376,246,225,300,525,249,277,500,524,475,575,500,526,478,321,750,1025,777,273,224,278,522,250,276,502,525,474,576,500,524,499,301,752,498,524,251,524,477,300,776,801,496,475,551,550,501,499,298,753,522,250,250,250,276,249,476,300,526,249,276,524,500,477,575,501,522,499,1050,501,400,399,251,274,250,425,350,251,525,252,249,250,274,249,277,250,250,272,252,248,279,249,247,275,250,251,276,249,252,273,249,251,276,249,274,250,250,251,276,252,274,248,249,275,250,251,278,251,246,275,249,251,276,251,250,274,248,278,249,250,273,250,250,277,248,252,523,275,250,252,250,523,251,399,401,249,376,275,374,250,276,250,274,251,251,275,251,249,398,378,252,273,249,273,251,249,277,250,250,423,350,275,250,252,273,250,400,380,270,250,250,250,275,250,275,250,250,400,375,276,399,375,250,275,502,398,400,980,646]
var videoLimit = 200
var audioTrack = 'audio/Zhu_Hold-Up-Wait-A-Minute.mp4'
var extension = 'mp4'
var imagesPath = 'images'
var tempPath = 'temp'
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
  if (options.imagesPath) {
    imagesPath = options.imagesPath
  }
  if (options.tempPath) {
    tempPath = options.tempPath
  }
  if (options.scale) {
    scaleWidth = Number(options.scale.split('x')[0])
    scaleHeight = Number(options.scale.split('x')[1])
  }

  if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath)
  }

  var deferred = q.defer()
  imageNames = fs.readdirSync(imagesPath)
  var begin = new Date().getTime()
  console.log("slideshow modifying images")
  modifyImages(imageNames).then(function () {
    var modifiedImages = new Date().getTime()
    console.log("modified images " + (modifiedImages - begin))
    console.log("slideshow creating video stills")
    return createVideoStills(times).then(function () {
      var createdVideoStills = new Date().getTime()
      console.log("created video stills " + (createdVideoStills - modifiedImages))
      console.log("slideshow concatenating video stills")
      return concatenateVideoStills().then(function () {
        var concatenatedStills = new Date().getTime()
        console.log("concatenated video stills " + (concatenatedStills - createdVideoStills))
        console.log("slideshow adding audio track")
        return addAudioTrack(audioTrack).then(function () {
          var addAudioTrack = new Date().getTime()
          console.log("added audio track " + (addAudioTrack - concatenatedStills))
          console.log("total video rendering time" + (addAudioTrack - begin))
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
  utilities.rmdir(tempPath)
  fs.mkdirSync(tempPath)
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
          var destination = tempPath + '/' + (i + '') + '.' + (j + '') + '.' + extension
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
          videoPaths.push(tempPath + '/' + (i + '') + '.' + (j + '') + '.' + extension)
        }
      }
      ffmpeg.concatenateVideos(videoPaths, tempPath + '/conc' + i + '.' + extension).then(function (message) {
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
    videoPaths.push(tempPath + '/conc' + i + '.' + extension)
  }
  ffmpeg.concatenateVideos(videoPaths, tempPath + '/conc' + '.' + extension).then(function (message) {
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
  ffmpeg.addAudioToVideo(tempPath + '/conc' + '.' + extension, audioPath, tempPath + '/output' + '.' + extension).then(function (message) {
    console.log(message)
    deferred.resolve('success')
  }).fail(function (message) {
    console.log(message)
    deferred.reject('failure')
  })
  return deferred.promise
}
