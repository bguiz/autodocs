environmentVariablesTravis();
environmentVariablesGithub();
if (testShouldPublishTravis()) {
  publishGithubPages();
}

function environmentVariablesTravis() {
  requireEnvironmentVariable('TRAVIS_REPO_SLUG');
  process.env.REPO_SLUG = process.env.REPO_SLUG;
  requireEnvironmentVariable('TRAVIS_PULL_REQUEST');
  requireEnvironmentVariable('TRAVIS_BRANCH');
  requireEnvironmentVariable('TRAVIS_BUILD_NUMBER');
  requireEnvironmentVariable('TRAVIS_JOB_NUMBER');
}

function environmentVariablesGithub() {
  requireEnvironmentVariable('GH_TOKEN');

  if (!existsEnvironmentVariable('GH_USER') ||
      !existsEnvironmentVariable('GH_REPO')) {
    requireEnvironmentVariable('REPO_SLUG');
    var tokens = process.env.REPO_SLUG.split('/');
    process.env.GH_USER = process.env.GH_USER || tokens[0];
    process.env.GH_REPO = process.env.GH_REPO || tokens[1];
  }

  if (!existsEnvironmentVariable('GIT_USER')) {
    process.env.GIT_USER = 'autodocs Git User';
  }

  if (!existsEnvironmentVariable('GIT_EMAIL')) {
    process.env.GIT_EMAIL = 'autodocs-git-user@bguiz.com';
  }

  if (!existsEnvironmentVariable('DOCUMENT_BRANCH')) {
    process.env.DOCUMENT_BRANCH = 'master';
  }

  if (!existsEnvironmentVariable('DOCUMENT_JOB_INDEX')) {
    process.env.DOCUMENT_JOB_INDEX = '1';
  }
}

function testShouldPublishTravis() {
  return (
    process.env.TRAVIS_PULL_REQUEST === 'false' &&
    process.env.TRAVIS_BRANCH === process.env.DOCUMENT_BRANCH &&
    process.env.TRAVIS_BUILD_NUMBER+'.'+process.env.DOCUMENT_JOB_INDEX === process.env.TRAVIS_JOB_NUMBER);
}

function publishGithubPages() {
  var childProcess = require('child_process');
  var script = childProcess.spawn(__dirname+'/publish-github-pages.sh', {
    stdio: 'inherit',
  });
  script.on('close', function(code) {
    process.exit(code);
  });
}

function existsEnvironmentVariable(name) {
  return !!process.env[name];
}

function requireEnvironmentVariable(name) {
  if (!existsEnvironmentVariable(name)) {
    throw new Error(''+name not set);
  }
}
