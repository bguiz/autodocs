'use strict';

describe('[overall]', function() {
  describe('[exposed functions]', function() {
    it('Should verify autodocs ', function(done) {
      var autodocs;
      expect(function() {
        autodocs = require('../autodocs');
      }).not.toThrow();
      expect(typeof autodocs.init).toEqual('function');
      expect(typeof autodocs.run).toEqual('function');
      done();
    });

    it('Should verify environment-variables', function(done) {
      var envVars;
      expect(function() {
        envVars = require('../environment-variables');
      }).not.toThrow();
      expect(typeof envVars.exists).toEqual('function');
      expect(typeof envVars.require).toEqual('function');
      expect(typeof envVars.default).toEqual('function');
      expect(typeof envVars.substitute).toEqual('function');
      done();
    });

    it('Should verify ci/travis', function(done) {
      var ciTravis;
      expect(function() {
        ciTravis = require('../ci/travis');
      }).not.toThrow();
      expect(typeof ciTravis.init).toEqual('function');
      expect(typeof ciTravis.shouldRun).toEqual('function');
      done();
    });

    it('Should verify publish/github-pages', function(done) {
      var publishGhp;
      expect(function() {
        publishGhp = require('../publish/github-pages');
      }).not.toThrow();
      expect(typeof publishGhp.init).toEqual('function');
      expect(typeof publishGhp.run).toEqual('function');
      done();
    });
  });
});
