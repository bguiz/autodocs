/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const runTestdocs = require('./run-testdocs.js');

module.exports = runGeneratedocs;

function runGeneratedocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Generating documentation');
    if (context.vars.FLAG_SKIP_GENERATE === 'true') {
      console.log('Re-using previously generated documentation');
      return runTestdocs(context);
    }
    else {
      console.log('Invoking "generatedocs" script');
      var execStatement = 'npm run '+context.vars.DOCUMENT_GENERATE_HOOK;
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
          return resolve(runTestdocs(context));
        }
      });
    }
  });
}
