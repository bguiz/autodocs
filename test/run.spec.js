'use strict';

var envs = {
  buildOnBranch: function() {
    return {
      TRAVIS_REPO_SLUG: 'bguiz/autodocs',
      TRAVIS_PULL_REQUEST: 'false',
      TRAVIS_BRANCH: 'master',
      TRAVIS_BUILD_NUMBER: 'foo',
      TRAVIS_JOB_NUMBER: 'foo.1',
      GH_TOKEN: 'unicorns',
      FLAG_SKIP_PUSH: 'true',
    };
  },
  buildOnRelease: function() {
    return {
      TRAVIS_REPO_SLUG: 'bguiz/autodocs',
      TRAVIS_PULL_REQUEST: 'false',
      TRAVIS_BRANCH: 'unicorn-branch',
      TRAVIS_BUILD_NUMBER: 'foo',
      TRAVIS_JOB_NUMBER: 'foo.1',
      TRAVIS_TAG: 'anythingotherthanfalse',
      FLAG_PUBLISH_ON_RELEASE: 'true',
      GH_TOKEN: 'unicorns',
      FLAG_SKIP_PUSH: 'true',
    };
  },
};

describe('[run]', function() {
  describe('[validation]', function() {
    var savedEnv;

    beforeEach(function() {
      savedEnv = process.env;
      process.env = {};
    });

    afterEach(function() {
      process.env = savedEnv;
      savedEnv = undefined;
    });


    it('Should verify that environment is empty', function(done) {
      expect(process.env).toEqual({});
      done();
    });

    it('Should fail when running without any env vars', function(done) {
      expect(function() {
        require('../autodocs').run();
      }).toThrowError( /Environment variable `[^\]]+` not set/ );
      done();
    });

    it('Should fail when selected CI is not supported', function(done) {
      process.env.SELECT_CI = 'unicorn-ci';
      expect(function() {
        require('../autodocs').run();
      }).toThrowError( /Cannot find module \'[^\']+\'/ );
      done();
    });

    it('Should fail when selected publish is not supported', function(done) {
      process.env.SELECT_CI = 'unicorn-publish';
      expect(function() {
        require('../autodocs').run();
      }).toThrowError( /Cannot find module \'[^\']+\'/ );
      done();
    });

    describe('[compulsory tokens]', function() {
      [
        'GH_TOKEN',
        'TRAVIS_REPO_SLUG',
        'TRAVIS_PULL_REQUEST',
        'TRAVIS_BRANCH',
        'TRAVIS_BUILD_NUMBER',
        'TRAVIS_JOB_NUMBER',
      ].forEach(function(name) {
        it('Should fail when '+name+' is not set', function(done) {
          process.env = envs.buildOnBranch();
          process.env[name] = undefined;
          expect(function() {
            require('../autodocs').run();
          }).toThrowError(new RegExp('Environment variable `'+name+'` not set'));
          done();
        });
      });
    });


  });
});
