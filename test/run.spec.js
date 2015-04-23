'use strict';

var path = require('path');

var original = {
  PATH: process.env.PATH,
};
var envs = {
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

    it('Should run when building from branch', function(done) {
      process.env = envs.buildOnBranch();
      expect(function() {
        require('../autodocs').run();
      }).not.toThrow();
      done();
    });

    it('Should run when building from branch, but stop when build index is wrong', function(done) {
      process.env = envs.buildOnBranch();
      process.env.TRAVIS_JOB_NUMBER = 'foo.2';
      expect(function() {
        require('../autodocs').run();
      }).not.toThrow();
      done();
    });

    it('Should run when building from tag', function(done) {
      process.env = envs.buildOnRelease();
      expect(function() {
        require('../autodocs').run();
      }).not.toThrow();
      done();
    });

    it('Should run when GH_USER and GH_REPO are set manually', function(done) {
      process.env = envs.buildOnBranch();
      process.env.GH_USER = 'bguiz';
      process.env.GH_REPO = 'autodocs';
      expect(function() {
        require('../autodocs').run();
      }).not.toThrow();
      done();
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

    describe('[default vars]', function() {
      beforeEach(function(done) {
        process.env = envs.buildOnBranch();
        require('../autodocs').run();
        done();
      });

      [
        { name: 'GIT_USER', value: 'autodocs Git User', },
        { name: 'GIT_EMAIL', value: 'autodocs-git-user@bguiz.com', },
        { name: 'FLAG_COPY_ASSETS', value: 'false', },
        { name: 'FLAG_PUBLISH_ON_RELEASE', value: 'false', },
        { name: 'FLAG_CLEAN_DOCUMENT', value: 'false', },
        { name: 'FLAG_STRIP_TOKEN_OUTPUT', value: 'true', },
        { name: 'FLAG_LATEST_PAGE', value: 'true', },
        // { name: 'FLAG_SKIP_PUSH', value: 'false', }, //because we manually set this to prevent publishing during tests
        { name: 'DOCUMENT_BRANCH', value: 'master', },
        { name: 'DOCUMENT_JOB_INDEX', value: '1', },
        { name: 'DOCUMENT_GENERATED_FOLDER', value: 'documentation', },
        { name: 'DOCUMENT_PUBLISH_FOLDER_ROOT', value: 'api', },
        //TODO test that these substitutions are done correctly
        // { name: 'DOCUMENT_PUBLISH_SUBFOLDER', value: '{{MAJOR_VERSION}}.{{MINOR_VERSION}}', },
        // { name: 'DOCUMENT_PUBLISH_FOLDER', value: '{{DOCUMENT_PUBLISH_FOLDER_ROOT}}/{{DOCUMENT_PUBLISH_SUBFOLDER}}', },
        { name: 'DOCUMENT_ASSETS', value: '', },
        { name: 'PROJECT_DIR', value: path.resolve(__dirname, '..') }
      ].forEach(function(pair) {
        it('Should set default value for '+pair.name, function(done) {
          expect(process.env[pair.name]).toEqual(pair.value);
          done();
        });
      });
    });

  });
});
