var FB = require('fb')
var facebook = require('facebook-node-sdk')
var q = require("q")
var https = require('https')
var fs = require('fs')
var utilities = require('./utilities.js')
var FBpost = new facebook({fileUpload: true})

exports.getPhotos = getPhotos
function getPhotos(options) {
    var deferred = q.defer()
    options.imagesPath = options.imagesPath || "./images"
    FB.setAccessToken(options.token)
    console.log("get photos begin")
    getAllPhotoUrls().then(function (urls) {
        console.log("get photos retrieved urls " + urls)
        return downloadPhotos(urls, options.imagesPath).then(function () {
            console.log("get photos urls downloaded")
            return deferred.resolve("success")
        })
    }).fail(function (err) {
        return deferred.reject("ERROR")
    })
    return deferred.promise
}

exports.uploadVideo = uploadVideo
function uploadVideo(options) {
    options.outputFile = options.outputFile || "output.mkv"
    var deferred = q.defer()
    FBpost.setAccessToken(options.token)
    FBpost.api("/me/videos", 'POST', {
      source: '@' + './' + options.outputFile,
      title: "visaudio",
      description: "http://www.visaudio.me"
    }, function (err, res) {
      if (err) {
        console.log(err)
        return deferred.reject(err)
      }
      console.log(res)
      return deferred.resolve(res)
    })

    return deferred.promise
}

exports.upgradeToken = upgradeToken
function upgradeToken(token) {
  var deferred = q.defer()
  FB.api('/oauth/access_token?grant_type=fb_exchange_token&client_id=' + process.env.VISAUDIO_FACEBOOK_APP_ID + '&client_secret=' + process.env.VISAUDIO_FACEBOOK_APP_SECRET + '&fb_exchange_token=' + token, {}, function(res) {
    if (!res || res.error) {
      return deferred.reject(!res ? "ERROR" : res.error)
    }
    return deferred.resolve(res.access_token)
  })
  return deferred.promise
}

function downloadPhotos(urls, dirName) {
    utilities.rmdir(dirName)
    fs.mkdirSync(dirName)
    var deferred = q.defer(), processed = 0
    urls.forEach(function (url, i) {
        var file = fs.createWriteStream(dirName + "/" + (i + 1) + ".jpg")
        https.get(url, function (response) {
            if (response.statusCode == 200) {
                response.pipe(file).on('finish', function () {
                    if (++processed == urls.length) {
                        deferred.resolve("success")
                    }
                }).on('error', function () {
                    deferred.reject("error")
                })
            } else {
                return deferred.reject("error")
            }
        })
    })
    return deferred.promise
}

function getAllPhotoUrls() {
    var deferred = q.defer(), photoUrls = []
    getPhotoUrls("tagged").then(function (photos) {
        photoUrls = photoUrls.concat(photos)
        return getPhotoUrls("uploaded").then(function (photos) {
            photoUrls = photoUrls.concat(photos)
            return deferred.resolve(photoUrls)
        })
    }).fail(function(err) {
        console.log("ERROR getting photo urls", err)
        return deferred.reject(err)
    })
    return deferred.promise
}

function getPhotoUrls(type) {
    var deferred = q.defer(), processed = 0, photoUrls = []
    FB.api('me/photos/' + type + '?fields=picture,images', 'get', {}, function (res) {
        if (!res || res.error) {
            return deferred.reject(!res ? "ERROR" : res.error)
        }
        if (res.data) {
            res.data.forEach(function (photo) {
                if (photo.images.length > 0) {
                    photoUrls.push(photo.images[0].source)
                }
            })
            deferred.resolve(photoUrls)
        }
    })
    return deferred.promise
}
