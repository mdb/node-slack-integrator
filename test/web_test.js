var assert = require('assert'),
    request = require('supertest'),
    Integrator = require('../integrator');

function inst() {
  return new Integrator({
    handler: function (req, res, next) {
      // your custom handler
      return res.status(204).end();
    },
    webHookPath: 'foo'
  });
}

var server = inst();

describe('GET /', function() {
  it('returns "Hello world!"', function(done) {
    request(server.app)
    .get('/')
    .expect(200, 'Hello world!', done);
  });
});

describe('POST /integration', function() {
  it('returns 204', function(done) {
    request(server.app)
    .post('/integration')
    .expect(204, done);
  });
});
