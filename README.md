pivotal-to-github
=================
[![npm downloads per month](https://img.shields.io/npm/dm/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
[![npm downloads total](https://img.shields.io/npm/dt/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
[![npm version](https://img.shields.io/npm/v/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
![license](https://img.shields.io/npm/l/pivotal-to-github.svg)
- - -
Transfers issues from Pivotal to GitHub.

## Installing
```
$ npm install -g pivotal-to-github
```

## Usage
```
$ pivotal-to-github --pivotal-token $PIVOTAL_API_TOKEN --github-token $GITHUB_API_TOKEN --github-user yamadapc --github-repo pivotal-to-github --pivotal-id 1234
Fetching Pivotal tickets...
Got 58 tickets from Pivotal.
Creating tickets as GitHub issues on yamadapc/pivotal-to-github
This will take 116 seconds.
We're conservative about the rate-limit because of GitHub's abuse limitting.
Created ticket 96513974 as #1
Created ticket 96513952 as #2
Tickets to Issues [2/58] [|=---------------------------------------|] 40.6 remaining
```

## License
This code is published under the MIT license.
