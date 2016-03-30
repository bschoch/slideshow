var express = require('express')
var bodyParser = require('body-parser')
var FB = require('fb')
var q = require("q")
var https = require('https')
var fs = require('fs')
var path = require('path')
var request = require('request')
var execSync = require('child_process').execSync;
var slideshow = require('./slideshow.js')

var serverSettings = {
    port: process.env.PORT || 3000
}

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname));

app.set('port', (serverSettings.port))
app.post('/generate-slideshow', (req, res) => {
    FB.setAccessToken(req.body.token)
    var options = {}
    getAllPhotoUrls().then(function (urls) {
        downloadPhotos(urls).then(function () {
            slideshow.create(options).then(function () {
                uploadVideo()
            })
        })
    }).fail(function (err) {
        console.log("slideshow failed")
        console.log(err)
    })

    res.status(200).send()
})

app.listen(serverSettings.port, () => {
    console.log(`Server listening on port ${serverSettings.port}`)
})

function uploadVideo() {
    var deferred = q.defer()
    FB.api("/me/videos", 'post', {
        source: '@' + __dirname + "/output.mkv",
        title: "my video",
        description: "awesome video, all my friends need to see it"
    }, function (res) {

        if (!res || res.error) {
            console.log(res.body)
            deferred.reject(!res ? "ERROR" : res.error)
            return
        }

        deferred.resolve("success")
    })

    return deferred.promise
}

function downloadPhotos(urls) {
    slideshow.rmdir("./images")
    fs.mkdirSync("./images")
    var deferred = q.defer(), processed = 0
    urls.forEach(function (url, i) {
        var file = fs.createWriteStream("./images/" + (i + 1) + ".jpg")
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
