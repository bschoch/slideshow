var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.json({ message: 'Visaudio API' });
});
app.post('/lives', function(request, response) {
      var body = '';
      request.on('data', function (data) {
          body += data;

          // Too much POST data, kill the connection!
          if (body.length > 1e6)
              request.connection.destroy();
      });
      request.on('end', function () {
          var post = qs.parse(body);
      });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


