var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs")
var path = require("path")
var q = require("q")

// modest mouse var times = [116, 3645, 882, 302, 302, 279, 302, 302, 301, 302, 302, 581, 302, 139, 139, 116, 488, 580, 116, 488, 581, 603, 604, 116, 465, 603, 604, 580, 117, 487, 581, 116, 186, 301, 604, 232, 349, 325, 116, 162, 163, 139, 279, 209, 395, 255, 325, 604, 162, 441, 279, 325, 163, 116, 302, 603, 163, 418, 186, 418, 139, 441, 604, 139, 465, 139, 441, 116, 139, 349, 580, 209, 116, 140, 139, 302, 116, 186, 278, 302, 488, 93, 139, 163, 139, 186, 278, 302, 604, 279, 301, 604, 116, 488, 162, 418, 325, 256, 162, 116, 93, 233, 603, 232, 186, 163, 278, 209, 116, 117, 139, 186, 139, 255, 349, 302, 301, 279, 302, 162, 209, 233, 603, 256, 302, 325, 93, 185, 140, 464, 604, 116, 464, 302, 302, 116, 116, 163, 209, 603, 581, 580, 302, 93, 209, 279, 325, 139, 441, 279, 116, 209, 209, 372, 580, 139, 163, 325, 581, 139, 441, 604, 139, 441, 186, 418, 116, 464, 627, 116, 465, 302, 302, 255, 163, 92, 674, 116, 395, 1277, 557, 395, 186, 418, 92, 488, 93, 139, 581, 325, 93, 185, 558, 627, 301, 302, 302, 232, 349, 905, 604, 302, 302, 209, 278, 674, 511, 92, 163, 372, 371, 255, 326, 209, 673, 325, 279, 580, 302, 162, 117, 603, 418, 186, 255, 326, 209, 232, 162, 232, 186, 163, 302, 92, 209, 256, 673, 93, 186, 580, 302, 163, 139, 279, 93, 232, 116, 464, 163, 418, 139, 465, 162, 441, 302, 93, 163, 278, 372, 557, 720, 209, 162, 116, 279, 139, 186, 209, 372, 348, 255, 116, 465, 279, 139, 186, 139, 139, 140, 162, 256, 185, 163, 580, 163, 441, 163, 441, 371, 209, 604, 604, 232, 186, 139, 627, 232, 348, 233, 209, 162, 395, 186, 278, 511, 116, 116, 163, 302, 302, 580, 279, 348, 116, 464, 604, 581, 278, 209, 116, 140, 162, 116, 163, 604, 580, 256, 162, 163, 209, 116, 93, 185, 279, 325, 163, 92, 326, 255, 348, 163, 139, 93, 186, 604, 232, 371, 209, 395, 162, 418, 604, 163, 418, 325, 278, 163, 418, 232, 93, 302, 395, 162, 604, 604, 162, 418, 372, 232, 766, 418, 232, 232, 116, 326, 209, 417, 140, 139, 581, 580, 325, 116, 186, 1161, 604, 255, 116, 93, 395, 232, 395, 302, 302, 301, 1765, 1463, 302, 604, 603, 581, 302, 302, 603, 581, 255, 93, 232, 1184, 442, 185, 581, 209, 975, 581, 627, 394, 163, 511, 696, 418, 163, 603, 581, 441, 139, 604, 1208, 441, 93, 441, 209, 1184, 418, 186, 580, 441, 767, 325, 139, 116, 279, 162, 163, 302, 278, 604, 325, 279, 580, 325, 117, 162, 93, 116, 673, 1487, 325, 859, 302, 882, 906, 301, 2973, 464, 139, 604, 395, 186, 255, 348, 256, 928, 418, 186, 418, 139, 627, 581, 580, 604, 279, 743, 139, 627, 302, 139, 697, 650, 557, 627, 441, 116, 627, 325, 256, 604, 325, 116, 162, 604, 581, 603, 209, 256, 557, 139, 395, 209, 464, 93, 604, 511, 116, 557, 627, 1208, 580, 279, 162, 140, 510, 326, 371, 581, 603, 256, 209, 719, 465, 139, 557, 627, 581, 418, 186, 418, 162, 256, 696, 256, 394, 209, 372, 209, 487, 325, 93, 93, 209, 581, 580, 302, 255, 326, 301, 558, 650, 604, 6524, 1486, 7686]
var times = [3622, 302, 302, 18274, 371, 2717, 2322, 209, 2484, 2276, 2717, 2531, 1230, 279, 650, 256, 1253, 697, 2995, 2578, 2461, 2345, 2624, 2299, 279, 1555, 883, 2322, 278, 627, 279, 348, 627, 279, 325, 1881, 325, 278, 1533, 395, 255, 325, 1904, 325, 302, 627, 627, 604, 302, 325, 1880, 326, 301, 627, 627, 441, 2555, 580, 2508, 2531, 2554, 4900, 2438, 209, 2438, 2345, 139, 1370, 1022, 139, 2253, 278, 1602, 627, 232, 2346, 116, 1347, 1021, 163, 2275, 279, 1556, 766, 116, 1788, 8150, 766]
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