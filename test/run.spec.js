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
  });
});
