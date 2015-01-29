var assert = require('assert'),
    request = require('supertest'),
    nock = require('nock'),
    Integrator = require('../integrator'),
    inst = (function () {
      return new Integrator({
        payload: function (req, callback) {
          var text = req.body && req.body.text ? req.body.text : 'default';

          callback({
            some: 'payload',
            text: text
          });
        },
        hookPath: 'foo',
        debug: true
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
                    some: 'payload',
                    text: 'default'
                  })
                  .reply(200);

    it('returns 200', function(done) {
      request(inst.app)
        .post('/integration')
        .expect(200, done);
    });

    describe('when a post is performed with a JSON body', function () {
      var scope = nock('https://hooks.slack.com')
                    .post('/services/foo', {
                      some: 'payload',
                      text: 'some text'
                    })
                    .reply(200);

      it('can properly parse the JSON', function (done) {
        request(inst.app)
          .post('/integration')
          .send({text: 'some text'})
          .expect(200, {
            some: 'payload',
            text: 'some text'
          }, done);
      });
    });
  });

  describe('when the post to the slack integration endpoint fails', function () {
    var scope = nock('https://hooks.slack.com')
                  .post('/services/foo', {
                    some: 'payload',
                    text: 'default'
                  })
                  .reply(400);

    it('returns 400', function(done) {
      request(inst.app)
        .post('/integration')
        .expect(400, done);
    });
  });
});
