/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const setUpVars = require('./set-up-vars.js');

module.exports = runTestdocs;

function runTestdocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_SKIP_TEST === 'true') {
      console.log('Skipping tests for documentation');
      return setUpVars(context);
    }
    else {
      console.log('Invoking "testdocs" script');
      var execStatement = 'npm run '+context.vars.DOCUMENT_TEST_HOOK;
      console.log(execStatement);
      childProcess.exec(execStatement, {
        cwd: context.projectDir,
        env: context.vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          reject(err);
        }
        else {
          return resolve(setUpVars(context));
        }
      });
    }
  });
}
