const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

class Integrator {
  constructor(config) {
    this.config = Object.assign({
      token: process.env.SLACK_TOKEN,
      port: process.env.PORT || 3000,
      hookPath: undefined
    }, config);

    this.config.hookUrl = 'https://hooks.slack.com/services/' + config.hookPath;

    this.app = express();
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // test route
    this.app.get('/', (req, res) => {
      res.status(200).send('Hello world!');
    });

    this.app.post('/integration', (req, res, next) => {
      this._handleReq(req, res, next);
    });

    // error handler
    this.app.use(function (err, req, res, next) {
      console.error(err.stack);
      res.status(400).send(err.message);
    });

    this.app.listen(this.config.port, () => {
      console.log('Integration service listening on port ' + this.config.port);
    });
  }

  _handleReq(req, res, next) {
    if (this.config.token && req.body && req.body.token !== this.config.token) {
      return this._responseWithCode(401, res);
    }

    this.config.payload(req, (payload) => {
      this._sendPayload(payload, (error, status, body) => {
        if (error) {
          return next(error);
        } else if (status >= 400) {
          return next(new Error('Incoming WebHook: ' + status + ' ' + body));
        } else {
          return this._responseWithCode(200, res, payload);
        }
      });
    });
  }

  _responseWithCode(code, res, payload) {
    payload = payload || '';

    return res
      .status(code)
      .send((this.config.debug ? payload : ''))
      .end();
  }

  _sendPayload(payload, callback) {
    request({
      uri: this.config.hookUrl,
      method: 'POST',
      body: JSON.stringify(payload)
    }, (error, response, body) => {
      if (error) { return callback(error); }

      callback(null, response.statusCode, body);
    });
  }
}

module.exports = Integrator;
