'use strict';

var path = require('path');

environmentVariablesTravis();
environmentVariablesGithub();
environmentVariablesCommon();
if (testShouldPublishTravis()) {
  console.log('This build will generate new documentation');
  publishGithubPages();
}
else {
  console.log('This build does not need to generate new documentation');
}

function environmentVariablesTravis() {
  requireEnvironmentVariable('TRAVIS_REPO_SLUG');
  process.env.REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
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
    defaultEnvironmentVariable('GH_USER', tokens[0]);
    defaultEnvironmentVariable('GH_REPO', tokens[1]);
  }
}

function environmentVariablesCommon() {
  var projectPath = path.resolve('.');
  console.log('projectPath', projectPath);
  var projectPackageJson = require(path.resolve(projectPath, 'package.json'));
  var projectVersion = projectPackageJson.version;
  process.env.PROJECT_DIR = projectPath;
  process.env.MAJOR_MINOR_PATCH_VERSION = projectVersion;
  var projectVersionTokens = projectVersion.split('.');
  process.env.MAJOR_VERSION = projectVersionTokens[0];
  process.env.MINOR_VERSION = projectVersionTokens[1];
  process.env.PATCH_VERSION = projectVersionTokens.slice(2).join('.');

  defaultEnvironmentVariable('GIT_USER', 'autodocs Git User');
  defaultEnvironmentVariable('GIT_EMAIL', 'autodocs-git-user@bguiz.com');

  defaultEnvironmentVariable('FLAG_COPY_ASSETS', 'false');
  defaultEnvironmentVariable('FLAG_PUBLISH_ON_RELEASE', 'false');
  defaultEnvironmentVariable('FLAG_CLEAN_DOCUMENT', 'false')

  defaultEnvironmentVariable('DOCUMENT_BRANCH', 'master');
  defaultEnvironmentVariable('DOCUMENT_JOB_INDEX', '1');
  defaultEnvironmentVariable('DOCUMENT_GENERATED_FOLDER', 'documentation');
  defaultEnvironmentVariable('DOCUMENT_PUBLISH_FOLDER', 'api/{{MAJOR_VERSION}}.{{MINOR_VERSION}}');
  defaultEnvironmentVariable('DOCUMENT_ASSETS', 'CNAME');

  //NOTE order of the values contained in the array matters -
  // the ones that run first should require the ones that run later to be fully resolved first
  // and of course, cycles will result in indeterminate results.
  [
    'DOCUMENT_PUBLISH_FOLDER'
  ].forEach(substituteEnvironmentVariable);
}

function testShouldPublishTravis() {
  var correctBuildIndex =
    (process.env.TRAVIS_BUILD_NUMBER+'.'+process.env.DOCUMENT_JOB_INDEX ===
      process.env.TRAVIS_JOB_NUMBER);
  if (!correctBuildIndex) {
    return false;
  }
  else if (process.env.FLAG_PUBLISH_ON_RELEASE === 'true') {
    return (existsEnvironmentVariable('TRAVIS_TAG'));
  }
  else {
    return (
      process.env.TRAVIS_PULL_REQUEST === 'false' &&
      process.env.TRAVIS_BRANCH === process.env.DOCUMENT_BRANCH);
  }
}

function publishGithubPages() {
  var childProcess = require('child_process');
  var script = childProcess.spawn(__dirname+'/publish-github-pages.sh', [], {
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
    throw new Error(''+name+' not set');
  }
}

function defaultEnvironmentVariable(name, value) {
  if (!existsEnvironmentVariable(name)) {
    process.env[name] = value;
  }
}

function substituteEnvironmentVariable(name) {
  process.env[name] = process.env[name]
    .replace(/{{[^{}]+}}/g, function(otherName) {
      otherName = otherName.replace(/[{}]+/g, '');
      requireEnvironmentVariable(otherName)
      return process.env[otherName];
    });
}
