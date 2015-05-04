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
      }).toThrowError( /Config variable `[^\]]+` not set/ );
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

    it('Should stop without failing when FLAG_PUBLISH_ON_RELEASE but no git tag is present', function(done) {
      process.env = envs.buildOnRelease();
      process.env.TRAVIS_TAG = undefined;
      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on release\n- travis tag exists failure');
          done();
        });
      }).not.toThrow();
    });

    it('Should stop without failing when publish on branch but is a pull request', function(done) {
      process.env = envs.buildOnBranch();
      process.env.TRAVIS_PULL_REQUEST = 'true';
      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on branch\n- is not a pull request failure');
          done();
        });
      }).not.toThrow();
    });

    it('Should stop without failing when publish on branch but not the right branch', function(done) {
      process.env = envs.buildOnBranch();
      process.env.TRAVIS_BRANCH = 'master';
      process.env.DOCUMENT_BRANCH = 'develop';
      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on branch\n- branch name match failure');
          done();
        });
      }).not.toThrow();
    });

    it('Should stop without failing when job index is not the right one', function(done) {
      process.env = envs.buildOnBranch();
      process.env.TRAVIS_BUILD_NUMBER = '123';
      process.env.TRAVIS_JOB_NUMBER = '123.4';
      process.env.DOCUMENT_JOB_INDEX = '2';
      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on branch\n- job index match failure');
          done();
        });
      }).not.toThrow();
    });


    it('Should stop without failing whenbuilding on release and multiple mismatches occur', function(done) {
      process.env = envs.buildOnRelease();

      process.env.TRAVIS_BUILD_NUMBER = '123';
      process.env.TRAVIS_JOB_NUMBER = '123.4';
      process.env.DOCUMENT_JOB_INDEX = '2';

      process.env.TRAVIS_TAG = undefined;

      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on release\n- travis tag exists failure\n- job index match failure');
          done();
        });
      }).not.toThrow();
    });

    it('Should stop without failing when building on branch and multiple mismatches occur', function(done) {
      process.env = envs.buildOnBranch();

      process.env.TRAVIS_BUILD_NUMBER = '123';
      process.env.TRAVIS_JOB_NUMBER = '123.4';
      process.env.DOCUMENT_JOB_INDEX = '2';

      process.env.TRAVIS_BRANCH = 'master';
      process.env.DOCUMENT_BRANCH = 'develop';

      process.env.TRAVIS_PULL_REQUEST = 'true';

      expect(function() {
        require('../autodocs').run(undefined, function(err, message) {
          expect(err).toBeUndefined();
          expect(message).toEqual('Publish on branch\n- is not a pull request failure\n- branch name match failure\n- job index match failure');
          done();
        });
      }).not.toThrow();
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
          }).toThrowError(new RegExp('Config variable `'+name+'` not set'));
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
