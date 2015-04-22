'use strict';

var envVar = require('../environment-variables');

function environmentVariablesGithub() {
  envVar.require('GH_TOKEN');

  if (!envVar.exists('GH_USER') ||
      !envVar.exists('GH_REPO')) {
    envVar.require('REPO_SLUG');
    var tokens = process.env.REPO_SLUG.split('/');
    envVar.default('GH_USER', tokens[0]);
    envVar.default('GH_REPO', tokens[1]);
  }
}

function publishGithubPages() {
  var childProcess = require('child_process');
  var script = childProcess.spawn(__dirname+'/github-pages.sh', [], {
    stdio: 'inherit',
  });
  script.on('close', function(code) {
    process.exit(code);
  });
}

module.exports = {
  init: environmentVariablesGithub,
  run: publishGithubPages,
};

