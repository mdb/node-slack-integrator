var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser');

function Integrator(config) {
  var port = process.env.PORT || 3000,
      hookUrl = 'https://hooks.slack.com/services/' + config.hookPath;

  this.app = express();
  this.app.use(bodyParser.urlencoded({ extended: true }));
  this.app.use(bodyParser.json());

  // test route
  this.app.get('/', function (req, res) {
    res.status(200).send('Hello world!');
  });

  this.app.post('/integration', handleReq);

  // error handler
  this.app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
  });

  this.app.listen(port, function () {
    console.log('Integration service listening on port ' + port);
  });

  function handleReq(req, res, next) {
    config.payload(req, function (payload) {
      sendPayload(payload, function (error, status, body) {
        if (error) {
          return next(error);
        } else if (status !== 200) {
          return next(new Error('Incoming WebHook: ' + status + ' ' + body));
        } else {
          return res
                  .status(200)
                  .send((config.debug ? payload : ''))
                  .end();
        }
      });
    });
  }

  function sendPayload(payload, callback) {
    request({
      uri: hookUrl,
      method: 'POST',
      body: JSON.stringify(payload)
    }, function (error, response, body) {
      if (error) { return callback(error); }

      callback(null, response.statusCode, body);
    });
  }
}

module.exports = Integrator;
