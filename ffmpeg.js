var spawn = require('child_process').spawn
var q = require('q')

exports.imageToVideo = imageToVideo

function imageToVideo(imagePath, duration, destination, width, height) {
  var deferred = q.defer()
  var command = spawn('ffmpeg', ['-loop', '1', '-i', imagePath, '-y', '-an', '-r', '25', '-t', duration, '-vf', 'scale=' + width + 'x' + height + ',setsar=1:1', destination])
  var stderr
  command.stderr.on('data', function (chunk) {
    if (chunk) {
      stderr += chunk.toString()
    }
  })
  command.stderr.on('end', function () {
    //console.log(stderr)
  })
  command.on('exit', function (code, signal) {
    if (signal) {
      return deferred.reject(signal)
    } else if (code) {
      return deferred.reject(code)
    } else {
      return deferred.resolve('converted ' + imagePath + ' to ' + destination + ' for duration ' + duration)
    }
  })
  return deferred.promise
}

exports.concatenateVideos = concatenateVideos

function concatenateVideos(videoPaths, destination) {
  var deferred = q.defer()
  var args = []
  videoPaths.forEach(function (videoPath) {
    args.push('-i')
    args.push(videoPath)
  })
  var command = spawn('ffmpeg', args.concat(['-y', '-filter_complex', 'concat=n=' + videoPaths.length + ':v=1:a=0', destination]))
  var stderr
  command.stderr.on('data', function (chunk) {
    if (chunk) {
      stderr += chunk.toString()
    }
  })
  command.stderr.on('end', function () {
    //console.log(stderr)
  })
  command.on('exit', function (code, signal) {
    if (signal) {
      return deferred.reject(signal)
    } else if (code) {
      return deferred.reject(code)
    } else {
      return deferred.resolve('concatenated ' + videoPaths.length + ' video(s) to ' + destination)
    }
  })
  return deferred.promise
}

exports.addAudioToVideo = addAudioToVideo

function addAudioToVideo(videoPath, audioPath, destination) {
  var deferred = q.defer()
  var command = spawn('ffmpeg', ['-i', videoPath, '-i', audioPath, '-y', '-codec', 'copy', '-shortest', '-strict', '-2', destination])
  var stderr
  command.stderr.on('data', function (chunk) {
    if (chunk) {
      stderr += chunk.toString()
    }
  })
  command.stderr.on('end', function () {
    //console.log(stderr)
  })
  command.on('exit', function (code, signal) {
    if (signal) {
      return deferred.reject(signal)
    } else if (code) {
      return deferred.reject(code)
    } else {
      return deferred.resolve('combined audio ' + audioPath + ' and video ' + videoPath + ' to ' + destination)
    }
  })
  return deferred.promise
}
