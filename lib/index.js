var GitHubApi = require('github');
var ProgressBar = require('progress');
var _ = require('lodash');
var assert = require('assert');
var rateLimit = require('function-rate-limit');
var tracker = require('pivotaltracker');
var async = require('async');

exports = module.exports = function pivotalToGithub(options, cb) {
  if(!cb) cb = function() {};
  assert(options, 'Missing required parameter `options`');
  assert(options.githubRepo, 'Missing required option `options.githubRepo`');
  assert(options.githubToken, 'Missing required option `options.githubToken`');
  assert(options.githubUser, 'Missing required option `options.githubUser`');
  assert(options.pivotalId, 'Missing required option `options.pivotalId`');
  assert(options.pivotalToken, 'Missing required option `options.pivotalToken`');

  console.log('Fetching Pivotal tickets...');
  exports.getPivotalTickets(options.pivotalToken, options.pivotalId, function(err, tickets, people) {
    if(err) return cb(err);
    console.log('--> Got ' + tickets.length + ' tickets from Pivotal.');
    console.log('Creating tickets as GitHub issues on ' + options.githubUser + '/' + options.githubRepo);
    console.log('\n    This will take ' + (2 * tickets.length) + ' seconds.');
    console.log('    We\'re conservative about the rate-limit because of GitHub\'s abuse limitting.\n');
    exports.createGithubTickets(options.githubToken, options.githubRepo, options.githubUser, tickets, people);
  });
};

exports.getPivotalTickets = function(token, projectId, cb) {
  var client = new tracker.Client(token);
  console.log('--> Fetching stories...');
  client.project(projectId).stories.all(function(err, stories) {
    if(err) return cb(err);
    console.log('--> Fetching tasks and comments...');
    async.map(stories, function(story, cb) {
      client.project(projectId).story(story.id).comments.all(function(err, comments) {
        if(err) return cb(err);

        client.project(projectId).story(story.id).tasks.all(function(err, tasks) {
          if(err) return cb(err);
          story.comments = comments;
          story.tasks = tasks;
          cb(err, story);
        });
      });
    }, function(err, stories) {
      console.log('--> Fetching people...');
      client.project(projectId).memberships.all(function(err, people) {
        cb(err, stories, _(people).pluck('person').indexBy('id').value());
      });
    });
  });
};

exports.createGithubTicket = rateLimit(1, 2000, function(github, repo, user, ticket, people, cb) {
  //console.log(people); process.exit(1);
  function getComments(ticket) {
    return '### Comments\n\n' + ticket.comments.map(function(comment) {
      var commenter = people[comment.personId] ? people[comment.personId].name : comment.personId;
      return '[' + comment.createdAt + '] **' + commenter + '**: ' + comment.text + '\n';
    }).join('\n');
  }

  function getTasks(ticket) {
    return '### Tasks\n\n' + _.sortBy(ticket.tasks, 'position').map(function(task) {
      return '- [' + (task.complete ? 'x' : ' ') + '] ' + task.description;
    }).join('\n');
  }


  function getDescription(ticket) {
    var requester = people[ticket.requestedById] ? people[ticket.requestedById].name : ticket.requestedById;
    var owner = people[ticket.ownedById] ? people[ticket.ownedById].name : ticket.ownedById;
    return (ticket.description || '') + '\n\n- - -\n\n' +
      '- **Original Ticket**: ' + ticket.url + '\n' +
      '- **Created by:** ' + requester + '\n' +
      (ticket.ownedById ? ('- **Owned by:** ' + owner + '\n') : '') +
      (ticket.estimate != null ? ('- **Estimate:** ' + ticket.estimate + '\n') : '') +
      (ticket.currentState === 'accepted' ?
        '- **Accepted at:** ' + ticket.acceptedAt + '\n' : '') +
      '- **State:** ' + ticket.currentState +
      (ticket.comments.length ? '\n\n- - -\n\n' + getComments(ticket) : '') +
      (ticket.tasks.length ?  '\n\n- - -\n\n' + getTasks(ticket) : '');
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

exports.createGithubTickets = function(token, repo, user, tickets, people, cb) {
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
    exports.createGithubTicket(github, repo, user, ticket, people, function(err, issue) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      if(err) {
        console.error('ERROR:', err.message);
        console.error('Offending ticket:', JSON.stringify(ticket));
        pg.tick();
        return;
      }

      console.log('--> Created ticket ' + ticket.id + ' as #' + issue.number);
      pg.tick();
    });
  });
};
