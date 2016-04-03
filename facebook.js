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
    options.imagePath = options.imagePath || "./images"
    FB.setAccessToken(options.token)
    FBpost.setAccessToken(options.token)
    getAllPhotoUrls().then(function (urls) {
        downloadPhotos(urls, options.imagePath).then(function () {
            return deferred.resolve("success")
        })
    }).fail(function (err) {
        deferred.reject("ERROR")
        console.log("slideshow failed")
        console.log(err)
    })
    return deferred.promise
}

exports.uploadVideo = uploadVideo
function uploadVideo(options) {
    options.outputFile = options.outputFile || "output.mkv"
    var deferred = q.defer()
    FBpost.api("/me/videos", 'post', {
        source: '@' + __dirname + "/" + options.outputFile,
        title: "my video",
        description: "awesome video, all my friends need to see it"
    }, function (res) {
        if (res && (res.error || res.statusCode && res.statusCode !== 200)) {
            deferred.reject("ERROR")
            return
        }
        deferred.resolve("success")
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
                console.log("ERROR")
                return deferred.reject("ERROR")
            }
        })
    })
    return deferred.promise
}

function getAllPhotoUrls() {
    var deferred = q.defer(), photoUrls = []
    getPhotoUrls("tagged").then(function (photos) {
        photoUrls = photoUrls.concat(photos)
        getPhotoUrls("uploaded").then(function (photos) {
            photoUrls = photoUrls.concat(photos)
            deferred.resolve(photoUrls)
        })
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
