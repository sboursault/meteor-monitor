import { Meteor } from 'meteor/meteor';
import { ServerUtils } from './server-utils.js';

var jiraUrl = 'https://jira.atlassian.com';

Meteor.methods({
  // The method expects a valid IPv4 address
  'searchInJira': function (jql) {
    this.unblock(); // avoid blocking other method calls from the same client
    console.log('Method.searchInJira for' + jql);
    var url = jiraUrl + '/rest/api/2/search/?maxResults=10&jql=' + jql;
    var options = {};
    // options.auth = '<user>:<password>';
    var response = Meteor.wrapAsync(ServerUtils.apiCall)(url, options);
    return response;
  }
});
