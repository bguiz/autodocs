'use strict';

describe('[index]', function() {
  it('Should require env vars in order to run', function(done) {
    var GH_TOKEN = process.env.GH_TOKEN;
    process.env.GH_TOKEN = undefined;
    expect(function() {
      require('../index');
    }).toThrowError( /Environment variable `[^`]+` not set/);
    process.env.GH_TOKEN = GH_TOKEN;
    done();
  });
});
