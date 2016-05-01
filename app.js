var kue = require('kue')
var jobs = kue.createQueue({
  redis: {
    host: '159.203.212.134',
    options: {
      socket_keepalive: true,
      retry_strategy: function (options) {
        return 300
      }
    }
  }
})
jobs.watchStuckJobs()

global.jobs = jobs
var facebook = require('./facebook.js')
var slideshow = require('./slideshow.js')

var timesMap = {
  "Shakey-Graves_Family-and-Genus.mp4": [8450,576,878,3100,546,9051,851,2274,4476,850,9626,247,300,551,278,296,274,300,276,575,275,302,249,574,274,277,298,250,300,300,250,300,276,550,300,300,225,1175,276,273,301,426,699,552,297,275,277,576,824,299,274,275,301,274,577,277,571,552,552,272,576,299,275,575,825,299,300,225,325,250,302,1376,297,326,551,273,300,250,299,300,278,273,251,1426,1124,574,299,275,830,597,550,273,575,552,552,272,854,272,602,571,276,276,299,549,579,271,278,272,550,579,850,571,555,320,251,300,578,272,550,302,1949,275,275,275,299,274,300,250,300,579,300,246,576,576,552,274,600,223,900,827,625,776,574,1098,575,325,275,1051,625,273,274,300,280,270,250,326,275,299,226,324,276,300,275,300,275,551,573,276,225,601,300,274,576,274,249,351,249,551,578,221,300,450,705,321,250,300,274,276,324,804,875,272,275,275,301,274,577,272,603,497,1427,273,300,276,300,300,249,575,300,251,249,250,350,725,425,854,548,1126,273,301,573,277,273,276,274,550,300,276,298,576,276,278,824,301,296,275,274,575,576,250,325,526,299,277,273,1425,300,274,277,249,624,527,551,1124,325,803,445,976,299,275,276,301,273,300,250,577,551,851,571,576,224,375,1179,1050,521,575,300,275,575,251,274,300,300,500,629,273,248,603,297,225,600,302,223,349,276,274,277,299,550,250,603,273,224,474,453,248,301,550,224,652,275,273,549,579,299,272,276,299,551,274,276,551,325,248,300,275,551,574,575,550,575,277,300,275,273,550,1126,299,275,578,275,274,278,573,275,549,324,251,873,276,1678,321,253,573,424,427,575,248,300,275,425,426,576,273,550,325,250,575,551,574,275,275,300,275,300,300,527,298,275,526,574,578,299,250,298,574,275,325,225,452,950,299,575,1404,323,522,579,523,323,300,528,299,273,277,300,298,275,551,304,245,300,751,949,276,574,552,248,300,552,298,301,249,300,303,298,524,279,297,274,300,250,578,2522,577,551,324,250,573,275,300,275,278,573,303,272,549,576,299,250,576,274,276,323,525,276,325,829,571,250,251,448,451,274,277,849,550,300,275,854,270,578,272,277,576,422,576,426,554,598,251,296,579,545,575,276,299,250,300,250,275,579,297,300,550,274,250,327,298,253,297,275,528,298,324,275,250,350,526,274,250,325,250,300,250,851,274,575,300,275,600,526,602,248,301,826,273,323,280,270,276,550,274,276,324,276,274,477,399,525,299,277,274,300,276,299,525,600,275,299,276,274,252,298,276,574,300,828,277,571,274,276,300,829,295,276,274,300,276,879,545,276,1702,2226,2249,2226,1171,1105,1146,1099,1129,1099,1175,1099,8326,1499,424,19452,4121,252,10875],
  "The-Lumineers_Sleep-on-the-Floor.mp4": [7626,954,950,1845,976,928,1899,925,947,1904,950,975,948,249,628,473,301,2101,298,523,1079,921,929,296,603,801,1148,898,878,1072,950,955,223,700,799,1099,973,302,598,927,974,925,354,548,876,1072,1401,1451,923,1877,949,950,727,223,948,777,2073,475,451,828,1046,976,452,449,975,1900,247,676,779,1146,902,323,425,224,404,572,900,953,472,449,702,274,952,948,424,379,1075,946,3103,676,3550,2597,300,425,1004,695,1925,779,896,852,247,326,2028,573,275,1303,849,425,2175,221,603,427,470,427,1300,427,421,426,1749,425,401,874,879,649,223,399,451,649,1050,654,247,400,425,1275,300,1454,421,424,300,776,224,650,226,451,397,878,876,650,222,400,425,425,450,852,623,249,426,424,853,447,426,450,400,224,226,450,424,425,400,902,427,396,426,426,450,403,873,475,398,452,398,424,450,300,1428,874,852,874,848,851,725,1027,850,846,854,875,2573,1027,671,954,850,1675,874,422,425,850,875,852,849,1301,399,1324,427,850,449,423,854,221,601,899,853,872,425,426,900,6550,1852,1000,923,927,274,626,322,475,2126,250,1627,950,874,272,600,854,248,1777,322,549,2077,1151,698,800,2027,299,675],
  "Zhu_Hold-Up-Wait-A-Minute.mp4": [402,650,1577,625,551,522,501,600,549,550,501,1150,576,497,1727,475,601,522,578,498,574,550,576,499,578,548,574,526,274,300,275,250,301,249,275,275,301,248,551,551,549,279,296,526,299,250,276,274,400,703,397,426,826,1099,549,549,1078,574,298,250,276,274,279,271,276,250,575,528,571,550,276,249,300,277,273,278,377,323,250,298,251,273,275,304,246,450,225,429,546,350,350,275,225,526,349,275,275,275,250,300,452,573,351,275,275,251,399,453,271,277,273,278,226,323,677,296,376,574,525,424,276,400,249,301,574,279,274,548,275,251,400,425,250,300,574,276,250,423,400,326,251,550,253,270,400,300,276,399,251,600,400,424,251,275,275,577,398,276,273,400,278,350,226,396,428,251,571,528,549,550,549,300,274,276,249,300,425,376,274,250,304,296,250,276,275,250,300,551,273,278,372,475,252,423,350,329,271,276,274,275,276,275,274,250,452,398,276,449,300,375,250,275,250,300,275,275,276,278,821,402,422,280,824,274,598,225,249,300,279,297,250,274,276,301,249,250,300,274,276,250,324,251,274,276,299,251,276,299,250,275,276,275,250,274,299,250,326,250,274,275,275,250,326,274,225,301,424,275,250,425,300,250,250,275,305,249,321,251,300,224,603,448,277,273,375,301,423,400,250,402,1800,248,276,1102,247,225,276,249,479,221,300,425,425,375,450,251,250,224,577,272,279,296,275,275,403,349,349,1052,272,300,551,226,727,322,1178,271,326,500,724,250,302,248,477,603,248,422,580,521,277,248,300,300,950,425,274,275,250,550,578,398,399,276,852,249,274,299,275,253,549,273,276,274,300,279,271,829,271,275,275,250,275,575,525,301,524,276,551,298,250,576,2728,522,599,525,299,250,301,275,250,300,224,476,374,280,273,272,301,249,277,300,250,273,277,273,277,274,399,428,272,427,327,346,280,521,302,272,254,296,275,450,376,274,401,374,325,275,275,250,326,249,251,299,276,828,423,401,272,800,275,627,224,274,278,272,277,273,275,275,276,274,250,300,250,300,275,275,275,250,275,451,399,275,250,300,277,250,300,273,250,277,350,222,277,273,277,274,275,275,275,274,276,274,276,275,249,301,275,250,300,302,248,250,275,299,276,225,250,626,275,250,250,300,574,1103,575,522,549,525,575,527,323,802,1074,853,272,225,300,576,1074,576,501,598,549,551,527,1101,547,574,250,575,500,301,1678,546,1102,548,525,550,325,777,550,272,277,273,551,526,298,1105,1099,523,602,525,551,521,1675,424,401,274,300,275,425,375,300,525,275,275,275,276,275,275,274,277,273,251,299,277,251,298,274,276,274,275,275,275,250,302,273,275,275,300,250,275,275,250,450,275,400,278,297,251,274,275,300,251,250,301,274,275,275,275,451,350,301,397,425,250,300,279,547,274,275,275,275,550,250,425,424,275,400,301,374,302,274,251,300,274,277,248,275,299,427,373,277,274,276,298,301,252,247,301,274,450,350,276,424,426,278,272,250,299,275,400,425,250,450,377,299,427,400,274,424,400,275,274,1104,296,625,402,700],
  "Hermitude_The-Buzz.mp4": [104,472,1352,2252,1349,2275,1373,2274,1326,1349,925,449,227,223,451,225,225,225,225,225,225,451,450,249,449,679,446,450,451,225,224,227,248,654,221,450,225,250,678,222,451,224,453,222,226,224,450,225,451,225,227,222,475,1326,901,925,899,900,1824,1428,372,903,472,449,904,876,1372,448,929,296,603,648,224,301,626,248,575,351,651,423,250,276,450,349,325,625,325,427,398,626,475,274,550,4151,1402,222,475,228,397,450,454,271,224,401,500,226,224,225,225,375,302,223,225,1379,220,227,224,226,224,228,624,449,276,250,398,477,423,250,250,401,274,225,250,1350,224,225,451,250,225,653,397,274,251,375,274,250,475,425,375,551,2476,223,250,575,475,275,250,400,500,225,225,425,400,1380,448,450,900,472,428,247,677,448,928,447,427,699,224,475,699,1430,5498,923,474,400,1025,800,1002,248,551,903,923,902,475,446,500,2679,874,447,1828,448,525,828,3175,446,1801,1325,1202,2000,901,320,576,375,299,250,677,228,270,504,598,449,300,376,224,225,224,327,350,224,227,499,424,426,224,325,352,222,450,350,576,449,450,1704,1897,477,248,451,223,228,450,222,226,251,423,250,425,225,225,250,426,425,274,225,1325,275,425,227,224,249,401,249,250,325,326,224,249,451,228,673,224,225,703,1547,225,475,225,224,226,451,223,450,226,224,426,249,226,500,275,326,249,400,1403,472,404,270,225,426,274,228,348,324,226,224,425,250,325,350,225,225,225,450,425,602,773,226,479,447,674,424,250,226,224,226,678,246,450,225,1354,646,700,250,425,425,1176,426,699,902,422,450,1400,875,249,228,222,901,453,222,224,276,852,448,450,1027,776,974,400,248,324,676,328,246,226,678,671,450,8351,677,222,1125,450,1126,678,696,1130,220,450,450,676,1375,424,250,2250,1350,3554,1374,699],
  "Aesop-Rock_Kirby.mp4": [329,522,725,554,700,321,375,375,328,372,375,351,349,303,422,350,350,275,276,550,352,523,549,352,347,376,351,350,373,352,374,351,353,370,350,350,725,350,375,326,728,347,374,350,377,349,374,351,349,350,555,371,324,377,350,300,248,350,375,2100,225,703,547,326,375,550,349,376,301,224,350,375,350,299,375,328,598,349,502,423,350,375,301,224,349,526,375,352,223,500,352,727,347,274,450,349,351,375,225,299,350,376,352,398,351,302,224,523,524,377,350,373,325,301,250,550,274,225,227,224,299,527,323,401,376,349,349,376,526,524,375,524,525,550,525,375,501,577,347,375,525,501,374,301,250,550,903,546,678,222,877,349,374,350,350,350,375,350,575,400,375,826,324,300,276,400,451,400,323,400,702,325,399,327,723,574,525,329,746,326,323,226,549,351,350,374,375,326,378,347,376,351,348,375,350,353,346,376,351,349,553,272,275,352,701,371,350,378,697,350,350,351,375,375,350,349,377,1051,372,350,350,378,372,327,423,1403,524,348,878,372,300,350,450,254,247,398,351,350,350,375,525,275,274,1078,523,277,248,378,349,423,300,326,224,524,377,523,325,554,473,351,249,474,249,351,550,277,248,552,248,300,525,903,446,354,446,376,325,374,351,349,375,350,375,328,273,475,1053,272,275,350,374,350,350,550,226,424,228,372,500,302,549,251,373,352,352,546,551,353,273,423,376,377,347,250,277,801,272,900,350,350,250,300,327,477,345,276,374,526,374,526,525,349,275,277,549,351,726,248,526,351,323,349,680,748,348,350,375,349,350,376,349,375,355,245,275,575,325,351,349,228,500,373,350,349,726,349,351,374,328,222,300,225,350,551,550,349,350,375,350,350,350,351,374,351,275,274,550,350,527,373,350,350,525,375,375,1802,248,225,225,354,546,374,325,351,375,374,350,351,350,350,376,351,377,346,374,678,397,328,350,372,354,346,376,352,347,376,349,375,352,350]
}

var tempPath = 'temp'
var imagesPath = 'images'

var commandLineArguments = process.argv.slice(2);
commandLineArguments.forEach(function (arg) {
  var args = arg.split("=")
  if (args.length > 1) {
    switch (args[0]) {
      case "-tempPath":
        tempPath = args[1]
        break;
      case "-imagesPath":
        imagesPath = args[1]
        break;
    }
  }
})

console.log("starting reading from queue")
var errors
jobs.process('slideshows', function (job, done) {
  errors = {}
  var urls = job.data.urls
  var token = job.data.token
  var songPath = job.data.songPath
  console.log("processing token " + job.data.token)
  return facebook.getPhotos({token: token, imagesPath: imagesPath}).then(function () {
    console.log("get photos complete")
    return slideshow.create({
      track: "./audio/" + songPath,
      times: timesMap[songPath],
      imagesPath: imagesPath,
      tempPath: tempPath
    }).then(function () {
      console.log("slideshow complete")
      return facebook.uploadVideo({
        outputFile: tempPath + '/output.mp4',
        token: job.data.token
      }).then(function (data) {
        console.log("SLIDESHOW_SUCCESS", data.id)
        console.log("NON_FATAL_ERRORS", errors)
        return done()
      })
    })
  }).fail(function (err) {
    console.log("SLIDESHOW_ERROR", err)
    console.log("NON_FATAL_ERRORS", errors)
    return done(err)
  })
})

jobs.on('error', function (err) { // listening to error is required to ignore them
  console.log("ERROR", err)
  if (isNaN(errors[err])) {
    errors[err] = 1
  } else {
    errors[err]++
  }
})
