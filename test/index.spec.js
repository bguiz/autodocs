'use strict';

describe('[index]', function() {
  it('Should execute a dummy test', function(done) {
    expect(1).toEqual(1);
    done();
  });
  it('Should require env vars in order to run', function(done) {
    expect(function() {
      require('../autodocs');
    }).not.toThrow();
    done();
  });
});
