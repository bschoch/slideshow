var express = require('express');
var serverSettings = {
  port: process.env.PORT || 3000
};

var app = express();

app.set('port', (serverSettings.port));

app.post('/generate-slideshow', (request, response) => {
  //do slideshow magic
});

app.listen(serverSettings.port, () => {
  console.log(`Server listening on port ${serverSettings.port}`);
});



