var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs")
var path = require("path")
var q = require("q")

var times = [2001, 1642, 135, 174, 282, 2001, 2002, 2001, 2004, 2001, 2001, 2001, 2002, 2000, 278, 634, 1234, 1263, 371, 866, 1254, 1235, 643, 611, 205, 170, 270, 278, 136, 204, 269, 767, 200, 1244, 1280, 632, 594, 1054, 206, 646, 595, 1252, 313, 337, 276, 606, 352, 374, 242, 1258, 1238, 341, 937, 1229, 626, 310, 305, 625, 639, 273, 980, 309, 923, 1284, 977, 269, 312, 909, 1019, 235, 342, 308, 624, 613, 618, 279, 372, 138, 475, 948, 274, 33, 1221, 640, 279, 337, 1263, 607, 628, 1256, 905, 349, 1265, 950, 270, 33, 1230, 939, 317, 1251, 943, 302, 1246, 908, 350, 1253, 995, 2001, 588, 467, 952, 304, 821, 136, 607, 308, 312, 1254, 276, 337, 169, 478, 310, 304, 384, 235, 1265, 575, 419, 238, 1258, 310, 944, 630, 605, 34, 1236, 272, 505, 778, 954, 1225, 1265, 1254, 615, 632, 1252, 1227, 34, 1230, 1273, 1225, 625, 644, 1248, 1222, 34, 1227, 1259, 1260, 408, 177, 2001, 2002, 415, 2000, 2005]
var numImages = 25
var audioTrack = "./audio/02_How_Did_I_Get_Here.mkv"

createVideoStills(times, numImages).then(function(onFulfilled) {
    if (!!onFulfilled) {
        concatenateVideoStills(times.length).then(function(onFulfilled) {
            if (!!onFulfilled) {
                addAudioTrack(audioTrack)
            }
        })
    }
})

function addAudioTrack(audioTrack) {
    var deferred = q.defer()
   ffmpeg("./temp/conc.mkv").input(audioTrack)
        .addOption("-codec", "copy")
        .addOption("-shortest")
        .addOption("-strict")
        .addOption("-2")
    .on("end", function() {
        console.log("files have been merged succesfully");
        deferred.resolve("success")
    }).on("error", function(err, stdout, stderr) {
        console.log("failure \n")
        console.log("ffmpeg err:\n" + err)
        console.log("ffmpeg stdout:\n" + stdout)
        console.log("ffmpeg stderr:\n" + stderr)
        deferred.reject("error")
    }).save("./output.mkv")
    return deferred.promise
}

function concatenateVideoStills(numVideos) {
    var deferred = q.defer()
    var proc = ffmpeg("./temp/1.mkv")
    for (var i = 1; i < numVideos; i+=1) {
        proc = proc.input("./temp/" + (i + 1) + ".mkv")
    }
    proc.on("end", function() {
        console.log("files have been merged succesfully");
        deferred.resolve("success")
    }).on("error", function(err, stdout, stderr) {
        console.log("failure \n")
        console.log("ffmpeg err:\n" + err)
        console.log("ffmpeg stdout:\n" + stdout)
        console.log("ffmpeg stderr:\n" + stderr)
        deferred.reject("error")
    })
    .mergeToFile("./temp/conc.mkv");

    return deferred.promise
}

function createVideoStills(times, numImages) {
    var deferred = q.defer()
    var finished = 0

    rmdir("./temp")
    fs.mkdirSync("./temp")

    var lastImageName = ""
    for (var i = 0; i < times.length; ++i) {
        var seconds = Math.floor(times[i] / 1000) + ""
        var milliseconds = times[i] % 1000 + ""
        var time = ""
        for (var j = 0; j < 3 - milliseconds.length; ++j) {
            time += "0"
        }
        time = seconds + "." + time + milliseconds

        var imageName = "./images/" + (Math.floor(Math.random() * (numImages - 1) + 1)) + ".jpg"
        while (imageName == lastImageName) {
            imageName = "./images/" + (Math.floor(Math.random() * (numImages - 1) + 1)) + ".jpg"
        }
        lastImageName = imageName
        var destination = "./temp/" + (i+1) + ".mkv"

        saveVideo(imageName, time, destination)
    }
    return deferred.promise

    function saveVideo(imageName, time, destination) {
        ffmpeg(imageName).loop(time).fps(25).on("end", function() {
            console.log("success " + imageName + " " + destination)
            if (++finished == times.length) {
                deferred.resolve("success")
            }
        })
        .on("error", function(err, stdout, stderr) {
            console.log("failure " + imageName + " " + destination)
            console.log("ffmpeg err:\n" + err)
            console.log("ffmpeg stdout:\n" + stdout)
            console.log("ffmpeg stderr:\n" + stderr)
            deferred.reject("error")
        })
        .addOption("-vf", "scale=960x720,setsar=1:1")
        .noAudio()
        //.size("960x720")
        //.aspect("9:16")
        .save(destination)
    }
}

function rmdir(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
}