import { Template } from 'meteor/templating';
import { ClientUtils } from '../imports/utils/client-utils.js';
import { JqlMonitorUi } from '../imports/jira-query-monitor/ui.js';

import './main.html';

const jiraUrl = 'https://jira.atlassian.com';
const affectsVersionParam = ClientUtils.getUrlParams()['affectsVersion'];
const jiraProject = ''
var baseFilter = 'resolution = Unresolved';

const jiraQueryMonitorArray = [
  { id: 'product1', title: 'product A', jql: 'assignee="copain"' },
  { id: 'product2', title: 'product B', jql: 'priority in (Low)' },
  { id: 'product3', title: 'product C', jql: 'priority in (High, Medium)' },
  { id: 'product4', title: 'product D', jql: 'priority in (Medium, Low)' }
];

Template.body.onRendered(function () {
  (function() {
    var monitorRequisites = [];
    if (affectsVersionParam && jiraProject) { // TODO:DRY
      monitorRequisites.push('affectedVersion');
    }
    window.addEventListener('jiraQueryMonitor:baseFilter:update', function (e) {
      monitorRequisites._remove_(e.detail);
      if (monitorRequisites.length === 0) {
        window.dispatchEvent(new CustomEvent('jiraQueryMonitor:baseFilter:complete', {}));
      }
    });
  })();
  if (affectsVersionParam && jiraProject) {
    JqlMonitorUi.fetchMatchingVersions(jiraUrl, jiraProject, affectsVersionParam,
      function onSuccess(versions) {
        baseFilter = (baseFilter || '') + ' and ' + JqlMonitorUi.createFilterAffectsVersion(versions);
        window.dispatchEvent(new CustomEvent('jiraQueryMonitor:baseFilter:update', {detail: 'affectedVersion'}));
      });
  } else {
    window.dispatchEvent(new CustomEvent('jiraQueryMonitor:baseFilter:update', {}));
  }
})

Template.body.helpers({
  affectsVersion: function() {
    return affectsVersionParam ? ('on ' + affectsVersionParam) : '';
  },
  jiraQueryMonitors: function() {
    return jiraQueryMonitorArray;
  },
  runMonitor: function() {
    const jiraQueryMonitor = this;
    window.addEventListener('jiraQueryMonitor:baseFilter:complete', function () {
      const filter = baseFilter + (jiraQueryMonitor.jql ? (' and ' + jiraQueryMonitor.jql) : '');
      JqlMonitorUi.refresh(jiraQueryMonitor.id, jiraUrl, filter);
    });
  },
  now: function() {
    const currentTime = new Date();
    return currentTime.toLocaleDateString() + ' ' + currentTime.toLocaleTimeString();
  }
});

