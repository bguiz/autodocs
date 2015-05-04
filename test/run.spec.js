'use strict';

var path = require('path');

var autodocs = require('../autodocs');

var envs = require('./environments');

var originalTimeout;

function increaseTestDuration() {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000; //ms
}

function resetTestDuration() {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  process.env = savedEnv;
}

var savedEnv;

function clearEnvironment() {
  savedEnv = process.env;
  process.env = {};
}

function resetEnvironment() {
  savedEnv = undefined;
}

describe('[run]', function() {
  describe('[generate]', function() {

    describe('[default vars]', function() {
      beforeEach(increaseTestDuration); afterEach(resetTestDuration);
      beforeEach(clearEnvironment); afterEach(resetEnvironment);

      var vars = {};

      beforeEach(function(done) {
        process.env = envs.buildOnBranch();
        require('../autodocs').run({}, function callback(err, context) {
          vars = context.vars;
          done();
        });
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
          expect(vars[pair.name]).toEqual(pair.value);
          done();
        });
      });
    });

    describe('[full run]', function() {
      beforeEach(increaseTestDuration); afterEach(resetTestDuration);
      beforeEach(clearEnvironment); afterEach(resetEnvironment);

      it('Should do publish with run all steps', function(done) {
        process.env = envs.buildOnBranch();

        process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
        process.env.FLAG_SKIP_GENERATE = 'false';

        process.env.FLAG_COPY_ASSETS = 'true';
        process.env.DOCUMENT_ASSETS = 'CNAME';
        process.env.FLAG_ALL_PAGE = 'true';
        process.env.FLAG_LATEST_PAGE = 'true';
        process.env.FLAG_CLEAN_DOCUMENT = 'true';

        expect(function() {
          autodocs.run(undefined, function(err) {
            expect(err).toBeUndefined();
            done();
          });
        }).not.toThrow();
      });

      it('Should do publish with run skipping optional steps', function(done) {
        process.env = envs.buildOnBranch();

        process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
        process.env.FLAG_SKIP_GENERATE = 'true';

        process.env.FLAG_COPY_ASSETS = 'false';
        process.env.DOCUMENT_ASSETS = '';
        process.env.FLAG_ALL_PAGE = 'false';
        process.env.FLAG_LATEST_PAGE = 'false';
        process.env.FLAG_CLEAN_DOCUMENT = 'false';
        //so as to trigger numPublishBranches === 0 conditional branch
        process.env.GH_PUBLISH_BRANCH = 'narwhal-pages';

        expect(function() {
          autodocs.run(undefined, function(err) {
            expect(err).toBeUndefined();
            done();
          });
        }).not.toThrow();
      });
    });

    //TODO write more tests to cover
    //
    //- different combinations of flags
    //- error thrown cases

    describe('[specific flag combinations]', function() {
      beforeEach(increaseTestDuration); afterEach(resetTestDuration);
      beforeEach(clearEnvironment); afterEach(resetEnvironment);

      it('Should fail when skip running generatedocs, and they have not been previously generated', function(done) {
        process.env = envs.buildOnBranch();
        process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
        process.env.FLAG_SKIP_GENERATE = 'true';
        process.env.DOCUMENT_GENERATED_FOLDER = 'dir/does/not/exist';

        autodocs.run(undefined, function(err) {
          expect(err).not.toBeUndefined();
          expect(err).toMatch( /dir\/does\/not\/exist.*No such file or directory/i );
          done();
        });
      });

      it('Should fail when DOCUMENT_GENERATE_HOOK is specified as a script that does not exist', function(done) {
        process.env = envs.buildOnBranch();

        process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
        process.env.FLAG_SKIP_GENERATE = 'false';

        process.env.DOCUMENT_GENERATE_HOOK = 'foo123';

        expect(function() {
          autodocs.run(undefined, function(err) {
            expect(err).not.toBeUndefined();
            expect(err).toMatch( /Command failed.*npm/i );
            expect(err).toMatch( /missing script.*foo123/i );
            done();
          });
        }).not.toThrow();
      });

      it('Should fail when FLAG_COPY_ASSETS is true but DOCUMENT_ASSETS refers to files that do not exist', function(done) {
        process.env = envs.buildOnBranch();

        process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
        process.env.FLAG_SKIP_GENERATE = 'true';

        process.env.FLAG_COPY_ASSETS = 'true';
        process.env.DOCUMENT_ASSETS = 'files/that do/not/exist';

        expect(function() {
          autodocs.run(undefined, function(err) {
            expect(err).not.toBeUndefined();
            expect(err).toMatch( /files\/that.*No such file or directory/i );
            expect(err).toMatch( /do\/not\/exist.*No such file or directory/i );
            done();
          });
        }).not.toThrow();
      });
    });

  });
});
