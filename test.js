var slideshow = require('./slideshow.js')
var facebook = require('./facebook.js')

//facebook.getPhotos({"token": "CAAXQlOvZBFXcBADZBnWUru0hutjcb9IMGCoyKitEMbvuJU9MBnmXHVKjggjeIz7rOV2UAbq0nnscbFJhELdj8CgZAJvH1rptPQv8XrSTpbDZArPIHuLyWzkNpfG2svDigpZAZAthNC4qEbKZCXDZC62E8J4niiFJszTsLDARZBKuQLCK0p3iZCm5osDYVYkXBzZA6IbOZBUGYRPRQQZDZD"}).then(function () {
    slideshow.create({}).then(function () {
        facebook.uploadVideo({})
    })
//})
