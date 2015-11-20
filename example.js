// slack_integration.js
var Integrator = require('slack-integrator');
var configs = []
configs.push({
  // a 'payload' method to generate a Slack-formatted payload object
  // this method receives the request Slack issues to your integration
  // in response to a user's `/command`, as well as a callback called
  // with the Slack-formatted payload object
  payload: function(request, callback) {
    // this should return the payload object containing the
    // data you wish to display in Slack
    // see Slack documentation regarding its format

    // example:
    callback({
      username: 'Salesforce bot',
      text: request.body.text + "for @"+request.body.user_name,
      icon_emoji: ':ghost:'
    });
  },

  // https://hooks.slack.com/services/<YOUR_HOOK_PATH>
  hookPath: "T02HNJ5KS/B0F0JCY59/i5E5sfuc1a5nuH9DdKLuQ0kr",
  command: "salesforce"
})
new Integrator(configs,3001)