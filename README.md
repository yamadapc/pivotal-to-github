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
