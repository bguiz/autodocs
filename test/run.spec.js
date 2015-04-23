'use strict';

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
  });
});
