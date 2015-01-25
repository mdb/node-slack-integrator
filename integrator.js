var express = require('express'),
    bodyParser = require('body-parser');

function Integrator(config) {
  this.app = express();
  this.port = process.env.PORT || 3000;
  this.handler = config.handler;

  this.app.use(bodyParser.urlencoded({ extended: true }));

  // test route
  this.app.get('/', function (req, res) {
    res.status(200).send('Hello world!');
  });

  this.app.post('/integration', this.handler);

  // error handler
  this.app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(400).send(err.message);
  });

  this.app.listen(this.port, function () {
    console.log('Integration service listening on port ' + this.port);
  });
}

module.exports = Integrator;
