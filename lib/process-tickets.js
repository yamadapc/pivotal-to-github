var _ = require('lodash');
var GitHubApi = require('github');
var tickets = require('./pivotal-tickets.json');
var github = new GitHubApi({
  version: '3.0.0',
  headers: {
    'user-agent': 'Pivotal-To-GitHub'
  }
});

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_API_TOKEN,
});

function createTicket(github, ticket, cb) {
  if(!cb) cb = function() {};

  github.issues.create({
    title: ticket.name,
    body: getDescription(ticket),
    repo: 'pivotal-to-github',
    user: 'yamadapc',
    labels: [ticket.storyType].concat(_.pluck(ticket.labels, 'name').concat([
      'pivotal'
    ])),
  }, function(err, data) {
    if(err) return cb(err);

    if(ticket.currentState === 'accepted') {
      return github.issues.edit({
        repo: 'pivotal-to-github',
        user: 'yamadapc',
        number: data.number,
        state: 'closed',
      }, cb);
    }

    cb(null, data);
  });
}

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

tickets.map(function(ticket) {
  createTicket(github, ticket);
});
