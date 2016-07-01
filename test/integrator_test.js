var assert = require('assert'),
    request = require('supertest'),
    nock = require('nock'),
    Integrator = require('../integrator'),
    payload = function(req, callback) {
      var text = req.body && req.body.text ? req.body.text : 'default';

      callback({
        some: 'payload',
        text: text
      });
    },
    inst = (function () {
      return new Integrator({
        payload: payload,
        hookPath: 'foo',
        debug: true
      });
    })(),
    instWithToken = (function () {
      return new Integrator({
        payload: payload,
        hookPath: 'foo',
        port: 4000,
        token: '123'
      });
    })(),
    mockPost = function(text, statusCode) {
      text = text || 'default';
      statusCode = statusCode || 200;

      nock('https://hooks.slack.com')
        .post('/services/foo', {
          some: 'payload',
          text: text
        })
        .reply(statusCode);
    };

describe('GET /', () => {
  it('returns "Hello world!"', (done) => {
    request(inst.app)
      .get('/')
      .expect(200, 'Hello world!', done);
  });
});

describe('POST /integration', () => {
  var scope = mockPost();

  describe('when the integrator instance has been instantiated with a Slack token', () => {
    describe('when the request has no token', () => {
      it('returns 401', (done) => {
        request(instWithToken.app)
          .post('/integration')
          .expect(401, done);
      });
    });

    describe('when the request has a different token than that declared on the integration instance', () => {
      it('returns 401', function(done) {
        request(instWithToken.app)
          .post('/integration')
          .send({
            token: '456'
          })
          .expect(401, done);
      });
    });

    describe('when the request has the token declared on the integration instance', () => {
      it('returns 200', function(done) {
        request(instWithToken.app)
          .post('/integration')
          .send({
            token: '123'
          })
          .expect(200, done);
      });
    });
  });

  describe('when the post to the slack integration endpoint succeeds', () => {
    var scope = mockPost();

    it('returns 200', (done) => {
      request(inst.app)
        .post('/integration')
        .expect(200, done);
    });

    describe('when a post is performed with a JSON body', () => {
      var scope = mockPost('some text');

      it('can properly parse the JSON', (done) => {
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

  describe('when the post to the slack integration endpoint fails', () => {
    var scope = mockPost('default', 400);

    it('returns 400', (done) => {
      request(inst.app)
        .post('/integration')
        .expect(400, done);
    });
  });
});
