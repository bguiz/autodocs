'use strict';

var autodocs = require('./autodocs');

/**
 * The main entry point for being invoked from npm scripts
 * (or even from the command line)
 *
 * Simply does `autodocs.run()`
 *
 * @class  AutodocsRun
 * @module  Autodocs
 */

autodocs.run({}, function(err) {
  if (err) {
    console.log('ERR: ', err);
  }
  console.log('autodocs done');
});
