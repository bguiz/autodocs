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

    it('Should do publish run but skip generate', function(done) {
      process.env = envs.buildOnBranch();
      process.env.FLAG_SKIP_PUBLISH_RUN = 'false';
      process.env.FLAG_SKIP_GENERATE = 'true';
      expect(function() {
        autodocs.run(undefined, done);
      }).not.toThrow();
    });

    //TODO write more tests to cover
    //
    //- different combinations of flags
    //- error thrown cases
  });
});
