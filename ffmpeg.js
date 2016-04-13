var spawn = require('child_process').spawn
var spawnSync = require('child_process').spawnSync
var q = require('q')
var sync = true

exports.imageToVideo = imageToVideo

function imageToVideo(imagePath, duration, destination, width, height) {
  var deferred = q.defer()
  var args = ['-loop', '1', '-i', imagePath, '-y', '-an', '-r', '25', '-t', duration, '-vf', 'scale=' + width + 'x' + height + ',setsar=1:1', destination]
  var success = 'converted ' + imagePath + ' to ' + destination + ' for duration ' + duration
  call(deferred, args, success)
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
  args = args.concat(['-y', '-filter_complex', 'concat=n=' + videoPaths.length + ':v=1:a=0', destination])
  var success = 'concatenated ' + videoPaths.length + ' video(s) to ' + destination
  call(deferred, args, success)
  return deferred.promise
}

exports.addAudioToVideo = addAudioToVideo

function addAudioToVideo(videoPath, audioPath, destination) {
  var deferred = q.defer()
  var args = ['-i', videoPath, '-i', audioPath, '-y', '-codec', 'copy', '-shortest', '-strict', '-2', destination]
  var success = 'combined audio ' + audioPath + ' and video ' + videoPath + ' to ' + destination
  call(deferred, args, success)
  return deferred.promise
}

function call(deferred, args, success) {
  console.log('ffmpeg ' + args.join(' '))
  if (sync) {
    var result = spawnSync('ffmpeg', args)
    if (result.status === 0) {
      deferred.resolve(success)
    } else {
      deferred.reject([result.stdout ? result.stdout.toString() : '', result.stderr ? result.stderr.toString() : ''])
    }
  } else {
    var command = spawn('ffmpeg', args)
    command.on('error', function(err) {
      console.log('ffmpeg err ' + err)
      return deferred.reject(err)
    })
    command.on('exit', function (code, signal) {
      if (signal) {
        return deferred.reject(signal)
      } else if (code !== 0) {
        return deferred.reject(code)
      } else {
        return deferred.resolve(success)
      }
    })
  }
}
