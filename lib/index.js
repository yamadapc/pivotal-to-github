var GitHubApi = require('github');
var _ = require('lodash');
var assert = require('assert');
var tracker = require('pivotaltracker');
var rateLimit = require('function-rate-limit');
var ProgressBar = require('progress');

exports = module.exports = function pivotalToGithub(options, cb) {
  if(!cb) cb = function() {};
  assert(options, 'Missing required parameter `options`');
  assert(options.githubRepo, 'Missing required option `options.githubRepo`');
  assert(options.githubToken, 'Missing required option `options.githubToken`');
  assert(options.githubUser, 'Missing required option `options.githubUser`');
  assert(options.pivotalId, 'Missing required option `options.pivotalId`');
  assert(options.pivotalToken, 'Missing required option `options.pivotalToken`');

  console.log('Fetching Pivotal tickets...');
  exports.getPivotalTickets(options.pivotalToken, options.pivotalId, function(err, tickets) {
    if(err) return cb(err);
    console.log('Got ' + tickets.length + ' tickets from Pivotal.');
    console.log('Creating tickets as GitHub issues on ' + options.githubUser + '/' + options.githubRepo);
    console.log('This will take ' + (2 * tickets.length) + ' seconds.');
    console.log('We\'re conservative about the rate-limit because of GitHub\'s abuse limitting.');
    exports.createGithubTickets(options.githubToken, options.githubRepo, options.githubUser, tickets);
  });
};

exports.getPivotalTickets = function(token, projectId, cb) {
  var client = new tracker.Client(token);
  client.project(projectId).stories.all(function(err, stories) {
    if(err) return cb(err);
    cb(null, stories);
  });
};

exports.createGithubTicket = rateLimit(1, 2000, function(github, repo, user, ticket, cb) {
  function getDescription(ticket) {
    return (ticket.description || '') + '\n\n- - -\n\n' +
      '- **Original Ticket**: ' + ticket.url + '\n' +
      '- **Created by:** ' + ticket.requestedById + '\n' +
      (ticket.ownedById ? ('- **Owned by:** ' + ticket.ownedById + '\n') : '') +
      (ticket.estimate != null ? ('- **Estimate:** ' + ticket.estimate + '\n') : '') +
      (ticket.currentState === 'accepted' ?
        '- **Accepted at:** ' + ticket.acceptedAt : ''
      );
  }

  if(!cb) cb = function() {};

  github.issues.create({
    title: ticket.name,
    body: getDescription(ticket),
    repo: repo,
    user: user,
    labels: [ticket.storyType].concat(_.pluck(ticket.labels, 'name').concat([
      'pivotal'
    ])),
  }, function(err, data) {
    if(err) return cb(err);

    if(ticket.currentState === 'accepted') {
      return github.issues.edit({
        repo: repo,
        user: user,
        number: data.number,
        state: 'closed',
      }, cb);
    }

    cb(null, data);
  });
});

exports.createGithubTickets = function(token, repo, user, tickets, cb) {
  if(!cb) cb = function() {};

  var github = new GitHubApi({
    version: '3.0.0',
    headers: {
      'user-agent': 'Pivotal-To-GitHub'
    }
  });

  github.authenticate({
    type: 'token',
    token: token,
  });

  var pg = new ProgressBar('Tickets to Issues [:current/:total] [|:bar|] :eta remaining', {
    total: tickets.length,
    width: 40,
  });
  tickets.map(function(ticket) {
    exports.createGithubTicket(github, repo, user, ticket, function(err, issue) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      if(err) {
        console.error('ERROR:', err.message);
        console.error('Offending ticket:', JSON.stringify(ticket));
        pg.tick();
        return;
      }

      console.log('Created ticket ' + ticket.id + ' as #' + issue.number);
      pg.tick();
    });
  });
};
