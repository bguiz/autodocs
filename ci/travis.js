'use strict';

var envVar = require('../environment-variables');

function environmentVariablesTravis() {
  envVar.require('TRAVIS_REPO_SLUG');
  process.env.REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
  envVar.require('TRAVIS_PULL_REQUEST');
  envVar.require('TRAVIS_BRANCH');
  envVar.require('TRAVIS_BUILD_NUMBER');
  envVar.require('TRAVIS_JOB_NUMBER');
}

function testShouldPublishTravis() {
  var correctBuildIndex =
    (process.env.TRAVIS_BUILD_NUMBER+'.'+process.env.DOCUMENT_JOB_INDEX ===
      process.env.TRAVIS_JOB_NUMBER);
  if (!correctBuildIndex) {
    return false;
  }
  else if (process.env.FLAG_PUBLISH_ON_RELEASE === 'true') {
    return (envVar.exists('TRAVIS_TAG'));
  }
  else {
    return (
      process.env.TRAVIS_PULL_REQUEST === 'false' &&
      process.env.TRAVIS_BRANCH === process.env.DOCUMENT_BRANCH);
  }
}

module.exports = {
  init: environmentVariablesTravis,
  shouldRun: testShouldPublishTravis,
};
