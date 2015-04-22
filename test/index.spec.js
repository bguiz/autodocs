'use strict';

describe('[index]', function() {
  it('Should require env vars in order to run', function(done) {
    expect(function() {
      require('../index');
    }).toThrowError('TRAVIS_REPO_SLUG not set');
    done();
  });
});
