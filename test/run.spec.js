'use strict';

var path = require('path');

var autodocs = require('../autodocs');

var envs = require('./environments');

describe('[run]', function() {
  describe('[generate]', function() {
    var savedEnv;
    var originalTimeout;

    beforeEach(function() {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; //ms
      savedEnv = process.env;
      process.env = {};
    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      process.env = savedEnv;
      savedEnv = undefined;
    });

    it('Should do publish run but skip running generatedocs', function(done) {
      process.env = envs.buildOnBranch();
      process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
      process.env.FLAG_SKIP_GENERATE = 'true';
      autodocs.run(undefined, function(err) {
        expect(err).not.toBeUndefined();
        done();
      });
    });

    it('Should do publish with run generatedocs', function(done) {
      process.env = envs.buildOnBranch();
      process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
      process.env.FLAG_SKIP_GENERATE = 'false';
      process.env.FLAG_COPY_ASSETS === 'true';
      process.env.DOCUMENT_ASSETS === 'CNAME';

      expect(function() {
        autodocs.run(undefined, done);
      }).not.toThrow();
    });

    describe('[default vars]', function() {
      beforeEach(function(done) {
        process.env = envs.buildOnBranch();
        require('../autodocs').run({}, done);
      });

      [
        { name: 'GIT_USER', value: 'autodocs Git User', },
        { name: 'GIT_EMAIL', value: 'autodocs-git-user@bguiz.com', },
        { name: 'FLAG_COPY_ASSETS', value: 'false', },
        { name: 'FLAG_PUBLISH_ON_RELEASE', value: 'false', },
        { name: 'FLAG_CLEAN_DOCUMENT', value: 'false', },
        { name: 'FLAG_STRIP_TOKEN_OUTPUT', value: 'true', },
        { name: 'FLAG_LATEST_PAGE', value: 'true', },
        //because we manually set FLAG_SKIP_PUSH to prevent publishing during tests
        // { name: 'FLAG_SKIP_PUSH', value: 'false', },
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

    //TODO write more tests to cover
    //
    //- different combinations of flags
    //- error thrown cases
  });
});
