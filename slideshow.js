var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs")
var path = require("path")
var q = require("q")

// modest mouse var times = [3157, 302, 302, 882, 302, 302, 581, 302, 301, 302, 302, 116, 465, 441, 743, 580, 604, 604, 604, 580, 581, 603, 604, 580, 604, 581, 603, 604, 116, 465, 441, 162, 302, 279, 209, 395, 603, 581, 603, 604, 279, 302, 603, 581, 604, 580, 604, 604, 580, 139, 465, 580, 325, 279, 604, 580, 302, 279, 627, 580, 604, 580, 604, 604, 580, 859, 929, 140, 162, 279, 487, 116, 256, 325, 604, 603, 279, 302, 232, 372, 603, 140, 441, 302, 302, 580, 604, 580, 604, 232, 372, 603, 117, 464, 580, 604, 604, 580, 604, 116, 465, 580, 302, 325, 581, 580, 604, 580, 604, 604, 603, 140, 441, 302, 302, 255, 163, 162, 604, 511, 93, 1184, 557, 395, 186, 418, 116, 464, 232, 581, 325, 278, 302, 256, 627, 603, 302, 581, 302, 603, 604, 302, 302, 1764, 302, 604, 279, 302, 278, 604, 325, 279, 580, 302, 279, 603, 418, 186, 255, 326, 278, 604, 325, 279, 325, 232, 348, 325, 279, 580, 302, 302, 279, 325, 580, 604, 581, 603, 302, 256, 650, 116, 441, 325, 882, 279, 325, 581, 441, 162, 581, 279, 325, 139, 139, 302, 256, 348, 580, 604, 604, 580, 604, 604, 255, 302, 627, 580, 604, 581, 278, 325, 302, 279, 302, 302, 580, 279, 348, 580, 604, 581, 278, 325, 302, 279, 604, 116, 464, 325, 279, 302, 278, 604, 163, 418, 325, 278, 302, 279, 604, 301, 302, 604, 580, 604, 581, 325, 278, 604, 604, 116, 441, 604, 604, 580, 372, 232, 580, 604, 464, 116, 326, 255, 371, 140, 139, 581, 603, 302, 302, 557, 604, 604, 464, 720, 302, 302, 603, 140, 116, 325, 1184, 488, 975, 302, 464, 140, 603, 1185, 603, 581, 348, 1161, 255, 627, 604, 209, 952, 581, 627, 557, 325, 186, 696, 581, 603, 581, 580, 326, 278, 557, 349, 302, 441, 139, 604, 1184, 604, 580, 511, 697, 325, 278, 302, 140, 139, 580, 604, 604, 580, 325, 279, 116, 8801, 464, 139, 604, 581, 255, 348, 256, 928, 604, 302, 882, 233, 348, 580, 604, 279, 580, 163, 139, 627, 302, 139, 140, 185, 372, 650, 557, 627, 302, 255, 627, 581, 604, 325, 278, 186, 418, 581, 603, 465, 557, 139, 279, 325, 1207, 93, 511, 441, 140, 580, 836, 372, 580, 581, 1207, 581, 325, 278, 256, 557, 371, 604, 465, 116, 325, 278, 1185, 580, 325, 883, 603, 581, 487, 418, 302, 581, 603, 279, 302, 302, 1486, 604, 6524, 9172]
var times = [3622, 139, 163, 302, 18274, 371, 93, 1393, 1231, 1904, 627, 1254, 278, 952, 2276, 1486, 906, 325, 2531, 1230, 279, 906, 998, 325, 163, 464, 464, 2322, 209, 2578, 1300, 302, 859, 2345, 256, 464, 1904, 1997, 581, 1300, 255, 883, 2322, 278, 627, 279, 348, 627, 302, 325, 1858, 325, 278, 581, 952, 395, 278, 302, 1254, 650, 325, 302, 627, 627, 604, 302, 325, 1880, 326, 301, 627, 233, 394, 441, 2555, 418, 162, 2508, 3924, 1161, 2369, 2531, 2438, 209, 1230, 1208, 1091, 882, 511, 1370, 906, 255, 2531, 1300, 302, 859, 1347, 627, 279, 209, 1370, 1161, 1973, 581, 1300, 256, 673, 209, 1788, 116, 8800]
var videoLimit = 200
var numImages = 25
//var audioTrack = "./audio/Modest_Mouse_-_Float_On.mkv"
var audioTrack = "./audio/02_How_Did_I_Get_Here.mkv"

createVideoStills(times, numImages).then(function () {
    concatenateVideoStills().then(function () {
        addAudioTrack(audioTrack)
    })
})

function createVideoStills(times, numImages) {
    var deferred = q.defer()
    var batches = 0
    rmdir("./temp")
    fs.mkdirSync("./temp")
    batchVideos(0, "")
    return deferred.promise

    function batchVideos(i, lastImageName) {
        var finishedVideos = 0
        if (i < times.length / videoLimit) {
            for (var j = 0; j < videoLimit; j += 1) {
                var timesIndex = i * videoLimit + j
                if (timesIndex < times.length) {
                    var seconds = Math.floor(times[timesIndex] / 1000) + ""
                    var milliseconds = times[timesIndex] % 1000 + ""
                    var time = ""
                    for (var k = 0; k < 3 - milliseconds.length; ++k) {
                        time += "0"
                    }
                    time = seconds + "." + time + milliseconds
                    var imageName = "./images/" + (Math.floor(Math.random() * (numImages - 1) + 1)) + ".jpg"
                    while (imageName == lastImageName) {
                        imageName = "./images/" + (Math.floor(Math.random() * (numImages - 1) + 1)) + ".jpg"
                    }
                    lastImageName = imageName
                    var destination = "./temp/" + (i + "") + "." + (j + "") + ".mkv"
                    saveVideo(imageName, time, destination)
                }
            }
        }

        function saveVideo(imageName, time, destination) {
            ffmpeg(imageName).loop(time).fps(25).on("end", function () {
                console.log("success " + imageName + " " + destination)
                if (++finishedVideos == (i == Math.floor(times.length / videoLimit) ? times.length % videoLimit : videoLimit)) {
                    if (++batches == Math.ceil(times.length / videoLimit)) {
                        console.log("successfully created all video stills")
                        deferred.resolve("success")
                    } else {
                        batchVideos(i + 1, lastImageName)
                    }
                }
            }).on("error", function (err, stdout, stderr) {
                console.log("failure " + imageName + " " + destination)
                console.log("ffmpeg err:\n" + err)
                console.log("ffmpeg stdout:\n" + stdout)
                console.log("ffmpeg stderr:\n" + stderr)
                deferred.reject("error")
            }).addOption("-vf", "scale=960x720,setsar=1:1")
                .noAudio()
                //.size("960x720")
                //.aspect("9:16")
                .save(destination)
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
            var proc
            for (var j = 0; j < videoLimit; j += 1) {
                if (i * videoLimit + j < times.length) {
                    var filePath = "./temp/" + (i + "") + "." + (j + "") + ".mkv"
                    proc = !!proc ? proc.input(filePath) : ffmpeg(filePath)
                }
            }
            proc.on("end", function () {
                console.log("video still files have been merged succesfully")
                if (++finished == Math.ceil(times.length / videoLimit)) {
                    return concatenateFinalVideo().then(function () {
                        console.log("successfully merged all video still files")
                        deferred.resolve("success")
                    })
                } else {
                    concatenate(i + 1)
                }
            }).on("error", function (err, stdout, stderr) {
                console.log("failure \n")
                console.log("ffmpeg err:\n" + err)
                console.log("ffmpeg stdout:\n" + stdout)
                console.log("ffmpeg stderr:\n" + stderr)
                deferred.reject("error")
            }).mergeToFile("./temp/conc" + i + ".mkv")
        }
    }
}

function concatenateFinalVideo() {
    var deferred = q.defer()
    var proc
    for (var i = 0; i < times.length / videoLimit; i += 1) {
        var filePath = "./temp/conc" + i + ".mkv"
        console.log(filePath)
        proc = !!proc ? proc.input(filePath) : ffmpeg(filePath)
    }
    proc.on("end", function () {
        console.log("final video has been merged succesfully")
        deferred.resolve("success")
    }).on("error", function (err, stdout, stderr) {
        console.log("failure \n")
        console.log("ffmpeg err:\n" + err)
        console.log("ffmpeg stdout:\n" + stdout)
        console.log("ffmpeg stderr:\n" + stderr)
        deferred.reject("error")
    }).mergeToFile("./temp/conc.mkv")
    return deferred.promise
}

function addAudioTrack(audioTrack) {
    var deferred = q.defer()
    ffmpeg("./temp/conc.mkv").input(audioTrack)
        .addOption("-codec", "copy")
        .addOption("-shortest")
        .addOption("-strict")
        .addOption("-2")
        .on("end", function () {
            console.log("final video with audio has been merged succesfully");
            deferred.resolve("success")
        }).on("error", function (err, stdout, stderr) {
            console.log("failure \n")
            console.log("ffmpeg err:\n" + err)
            console.log("ffmpeg stdout:\n" + stdout)
            console.log("ffmpeg stderr:\n" + stderr)
            deferred.reject("error")
        }).save("./output.mkv")
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