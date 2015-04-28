'use strict';

var path = require('path');

var envs = require('./environments');

describe('[validation]', function() {
  describe('[errors]', function() {
    var savedEnv;

    beforeEach(function() {
      savedEnv = process.env;
      process.env = {};
    });

    afterEach(function() {
      process.env = savedEnv;
      savedEnv = undefined;
    });

    it('Should verify that environment is empty', function() {
      expect(process.env).toEqual({});
    });

    it('Should fail when running without any env vars', function() {
      expect(function() {
        require('../autodocs').run({});
      }).toThrowError( /Environment variable `[^\]]+` not set/ );
    });

    it('Should fail when selected CI is not supported', function() {
      process.env.SELECT_CI = 'unicorn-ci';
      expect(function() {
        require('../autodocs').run({});
      }).toThrowError( /Cannot find module \'[^\']+\'/ );
    });

    it('Should fail when selected publish is not supported', function() {
      process.env.SELECT_CI = 'unicorn-publish';
      expect(function() {
        require('../autodocs').run({});
      }).toThrowError( /Cannot find module \'[^\']+\'/ );
    });

    describe('[compulsory vars]', function() {
      [
        'GH_TOKEN',
        'TRAVIS_REPO_SLUG',
        'TRAVIS_PULL_REQUEST',
        'TRAVIS_BRANCH',
        'TRAVIS_BUILD_NUMBER',
        'TRAVIS_JOB_NUMBER',
      ].forEach(function(name) {
        it('Should fail when '+name+' is not set', function() {
          process.env = envs.buildOnBranch();
          process.env[name] = undefined;
          expect(function() {
            require('../autodocs').run({});
          }).toThrowError(new RegExp('Environment variable `'+name+'` not set'));
        });
      });
    });
  });

  describe('[ok]', function() {
    it('Should run when no context is specified', function(done) {
      process.env = envs.buildOnBranch();
      expect(function() {
        require('../autodocs').run(undefined, done);
      }).not.toThrow();
    });

    it('Should run when building from branch', function(done) {
      process.env = envs.buildOnBranch();
      expect(function() {
        require('../autodocs').run({}, done);
      }).not.toThrow();
    });

    it('Should run when building from branch, but stop when build index is wrong', function(done) {
      process.env = envs.buildOnBranch();
      process.env.TRAVIS_JOB_NUMBER = 'foo.2';
      expect(function() {
        require('../autodocs').run({}, done);
      }).not.toThrow();
    });

    it('Should run when building from tag', function(done) {
      process.env = envs.buildOnRelease();
      expect(function() {
        require('../autodocs').run({}, done);
      }).not.toThrow();
    });

    it('Should run when GH_USER and GH_REPO are set manually', function(done) {
      process.env = envs.buildOnBranch();
      process.env.GH_USER = 'bguiz';
      process.env.GH_REPO = 'autodocs';
      expect(function() {
        require('../autodocs').run({}, done);
      }).not.toThrow();
    });
  });
});
