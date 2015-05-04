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

    it('Should verify config-variables', function(done) {
      var configVars;
      expect(function() {
        configVars = require('../config-variables')({});
      }).not.toThrow();
      expect(typeof configVars.exists).toEqual('function');
      expect(typeof configVars.require).toEqual('function');
      expect(typeof configVars.default).toEqual('function');
      expect(typeof configVars.substitute).toEqual('function');
      expect(typeof configVars.selected).toEqual('function');
      expect(typeof configVars.parsePrintenv).toEqual('function');
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
