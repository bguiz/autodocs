'use strict';

var original = {
  PATH: process.env.PATH,
};

module.exports = {
  buildOnBranch: function() {
    return {
      PATH: original.PATH,

      TRAVIS_REPO_SLUG: 'bguiz/autodocs',
      TRAVIS_PULL_REQUEST: 'false',
      TRAVIS_BRANCH: 'master',
      TRAVIS_BUILD_NUMBER: 'foo',
      TRAVIS_JOB_NUMBER: 'foo.1',
      GH_TOKEN: 'unicorns',

      FLAG_TESTING: 'true',
      FLAG_SKIP_PUSH: 'true',
      FLAG_SKIP_GENERATE: 'true',
      FLAG_SKIP_PUBLISH_RUN: 'true',
    };
  },
  buildOnRelease: function() {
    return {
      PATH: original.PATH,

      TRAVIS_REPO_SLUG: 'bguiz/autodocs',
      TRAVIS_PULL_REQUEST: 'false',
      TRAVIS_BRANCH: 'unicorn-branch',
      TRAVIS_BUILD_NUMBER: 'foo',
      TRAVIS_JOB_NUMBER: 'foo.1',
      TRAVIS_TAG: 'anythingotherthanfalse',
      FLAG_PUBLISH_ON_RELEASE: 'true',
      GH_TOKEN: 'unicorns',

      FLAG_TESTING: 'true',
      FLAG_SKIP_PUSH: 'true',
      FLAG_SKIP_GENERATE: 'true',
      FLAG_SKIP_PUBLISH_RUN: 'true',
    };
  },
};
