var express = require('express')
var bodyParser = require('body-parser')
var FB = require('fb')
var q = require("q")
var https = require('https')
var fs = require('fs')
var path = require('path')
var execSync = require('child_process').execSync;
var makeSlideShow = require('./slideshow.js').makeSlideShow

var serverSettings = {
    port: process.env.PORT || 3000
}

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.set('port', (serverSettings.port))

app.post('/generate-slideshow', (req, res) => {
    FB.setAccessToken(req.body.token)

    getAllPhotoUrls().then(function (urls) {
        downloadPhotos(urls).then(function () {
            makeSlideShow()
        })
    })

    res.status(200).send()
})

app.listen(serverSettings.port, () => {
    console.log(`Server listening on port ${serverSettings.port}`)
})

function downloadPhotos(urls) {
    rmdir("./images")
    fs.mkdirSync("./images")
    var deferred = q.defer(), processed = 0
    urls.forEach(function (url, i) {
        var file = fs.createWriteStream("./images/" + (i + 1) + ".jpg")
        https.get(url, function (response) {
            if (response.statusCode == 200) {
                response.pipe(file)
                if (++processed == urls.length) {
                    deferred.resolve("success")
                }
            } else {
                console.log("ERROR")
                process.exit(-1)
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
    FB.api('me/photos/' + type + '?fields=picture', 'get', {}, function (res) {
        if (!res || res.error) {
            process.exit()
        }
        if (res.data) {
            res.data.forEach(function (photo) {
                photoUrls.push(photo.picture)
            })
            deferred.resolve(photoUrls)
        }
    })
    return deferred.promise
}

function rmdir(dir) {
    var list = fs.readdirSync(dir)
    for (var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i])
        var stat = fs.statSync(filename)

        if (filename == "." || filename == "..") {
            // pass these files
        } else if (stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename)
        } else {
            // rm fiilename
            fs.unlinkSync(filename)
        }
    }
    fs.rmdirSync(dir)
}