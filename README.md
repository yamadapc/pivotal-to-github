pivotal-to-github
=================
[![npm downloads per month](https://img.shields.io/npm/dm/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
[![npm downloads total](https://img.shields.io/npm/dt/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
[![npm version](https://img.shields.io/npm/v/pivotal-to-github.svg)](https://www.npmjs.com/package/pivotal-to-github)
![license](https://img.shields.io/npm/l/pivotal-to-github.svg)
[![Code Climate](https://codeclimate.com/github/yamadapc/pivotal-to-github/badges/gpa.svg)](https://codeclimate.com/github/yamadapc/pivotal-to-github)
- - -
Transfers issues from Pivotal to GitHub.

## Installing
```
$ npm install -g pivotal-to-github
```

## Interactive Usage
If required command-line flags are missing (see `pivotal-to-gitub --help` for
the flags, you'll be prompted for the values - and we'll try our best to guess
them):
```
$ pivotal-to-github
Github Token (load from ENV):
--> Using ************************************0123
GitHub repository (pivotal-to-github):
--> Using pivotal-to-github
GitHub user (yamadapc):
--> Using yamadapc
Pivotal ID: 1234
Pivotal token (load from ENV):
--> Using ****************************0123
Fetching Pivotal tickets...
--> Fetching stories...
# Goes on with progress-bar and fancy stuff
```

## Usage
```
$ pivotal-to-github --pivotal-token $PIVOTAL_API_TOKEN --github-token $GITHUB_API_TOKEN --github-user yamadapc --github-repo pivotal-to-github --pivotal-id 1234
```

## Features
- Imports tickets as issues
- Closes resolved tickets
- Adds metadata to the issues (creator, created at, labels, etc.)
- Adds comments to the issues
- Adds tasks to the issues

## License
This code is published under the MIT license.
