var express = require('express');
var bodyParser = require('body-parser');
var FB = require('fb');

var serverSettings = {
  port: process.env.PORT || 3000
};

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', (serverSettings.port));

app.post('/generate-slideshow', (req, res) => {
  FB.setAccessToken(req.body.token);
  // var body = 'My first post using facebook-node-sdk 1234';
  // FB.api('me/feed', 'post', { message: body }, function (res) {
  //   if(!res || res.error) {
  //     console.log(!res ? 'error occurred' : res.error);
  //     return;
  //   }
  //   console.log('Post Id: ' + res.id);
  // });
  res.status(200).send();
});

app.listen(serverSettings.port, () => {
  console.log(`Server listening on port ${serverSettings.port}`);
});



