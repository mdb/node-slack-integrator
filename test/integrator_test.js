var assert = require('assert'),
    request = require('supertest'),
    nock = require('nock'),
    Integrator = require('../integrator'),
    inst = (function () {
      return new Integrator({
        payload: function (req, callback) {
          callback({
            some: 'payload'
          });
        },
        hookPath: 'foo'
      });
    })();

describe('GET /', function() {
  it('returns "Hello world!"', function(done) {
    request(inst.app)
      .get('/')
      .expect(200, 'Hello world!', done);
  });
});

describe('POST /integration', function() {
  describe('when the post to the slack integration endpoint succeeds', function () {
    var scope = nock('https://hooks.slack.com')
                  .post('/services/foo', {
                    some: 'payload'
                  })
                  .reply(200);

    it('returns 200 and includes the payload as its response body', function(done) {
      request(inst.app)
        .post('/integration')
        .expect(200, {some: 'payload'}, done);
    });
  });

  describe('when the post to the slack integration endpoint fails', function () {
    var scope = nock('https://hooks.slack.com')
                  .post('/services/foo', {
                    some: 'payload'
                  })
                  .reply(400);

    it('returns 400', function(done) {
      request(inst.app)
        .post('/integration')
        .expect(400, done);
    });
  });
});
