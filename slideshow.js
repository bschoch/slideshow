var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs")
var path = require("path")
var q = require("q")

// command line arguments
// -track=<path to track> uses extension of of track as final video format
// -times=[2000,399,123,1234] json array (cannot contain spaces) of times in ms to show each image

var times = [3622, 139, 163, 302, 18274, 371, 93, 1393, 1231, 1904, 627, 1254, 278, 952, 2276, 1486, 906, 325, 2531, 1230, 279, 906, 998, 325, 163, 464, 464, 2322, 209, 2578, 1300, 302, 859, 2345, 256, 464, 1904, 1997, 581, 1300, 255, 883, 2322, 278, 627, 279, 348, 627, 302, 325, 1858, 325, 278, 581, 952, 395, 278, 302, 1254, 650, 325, 302, 627, 627, 604, 302, 325, 1880, 326, 301, 627, 233, 394, 441, 2555, 418, 162, 2508, 3924, 1161, 2369, 2531, 2438, 209, 1230, 1208, 1091, 882, 511, 1370, 906, 255, 2531, 1300, 302, 859, 1347, 627, 279, 209, 1370, 1161, 1973, 581, 1300, 256, 673, 209, 1788, 116, 8800]
var videoLimit = 200
var audioTrack = "audio/how_did_i_get_here.mkv"
var extension = "mkv"
var numImages = fs.readdirSync("./images").length

var commandLineArguments = process.argv.slice(2);
commandLineArguments.forEach(function (arg) {
    var args = arg.split("=")
    if (args.length > 1) {
        switch (args[0]) {
            case "-track":
                audioTrack = args[1];
                extension = audioTrack.split(".").pop()
                break;
            case "-times":
                times = JSON.parse(args[1])
                break;
        }
    }
})

createVideoStills(times).then(function () {
    concatenateVideoStills().then(function () {
        addAudioTrack(audioTrack)
    })
})

function createVideoStills(times) {
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
                    var destination = "./temp/" + (i + "") + "." + (j + "") + "." + extension
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
                    var filePath = "./temp/" + (i + "") + "." + (j + "") + "." + extension
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
            }).mergeToFile("./temp/conc" + i + "." + extension)
        }
    }
}

function concatenateFinalVideo() {
    var deferred = q.defer()
    var proc
    for (var i = 0; i < times.length / videoLimit; i += 1) {
        var filePath = "./temp/conc" + i + "." + extension
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
    }).mergeToFile("./temp/conc" + "." + extension)
    return deferred.promise
}

function addAudioTrack(audioTrack) {
    var deferred = q.defer()
    ffmpeg("./temp/conc" + "." + extension).input(audioTrack)
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
        }).save("./output" + "." + extension)
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