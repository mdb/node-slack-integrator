# node-slack-integrator

A very simple Express-based server for creating Slack integrations.

`node-slack-integrator` runs an Express server with an `/integration` endpoint.

## How to use

1. Log into your Slack and configure a slash command integration that posts to `<your-integration-host.com>/integration` when a Slack user enters `/some command`.

2. Deploy a `node-slack-integrator` instance to `<your-integration-host.com>`. Your `node-slack-integrator` instance should be instantiated with a `payload` method & a `hookPath` property.

The `payload` method receives Slack's post request and generates the appropriate payload your integration should post in your Slack.

The `hookPath` property specifies the unique part of your Slack hook endpoint. This can be found in your Slack's admin.

## Example

```javascript
// slack_integration.js
var Integrator = require('slack-integrator');

new Integrator({
  // a 'payload' method to generate a Slack-formatted payload object
  // this method receives the request Slack issues to your integration
  //in response to a user's `/command`
  payload: function(request) {
    // this should return the payload object containing the
    // data you wish to display in Slack
    // see Slack documentation regarding its format

    // example:
    return {
      username: 'my bot',
      text: 'some text'
      channel: request.body.channel_id;
      icon_emoji: ':ghost:';
    };
  },

  // https://hooks.slack.com/services/<YOUR_HOOK_PATH>
  hookPath: "the path to your Slack instance's hook endpoint"
});
```

Running `node slack_integration` runs an Express app at port 3000. Port 3000 can be overridden via a `PORT` environment variable.

The slack integration instance's `/integration` endpoint can be used to receive slash command-prompted POST requests from Slack.
