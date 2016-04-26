/* @flow */
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const allComplete = require('./all-complete.js');

module.exports = cleanUp;

function cleanUp(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_CLEAN_DOCUMENT === 'true') {
      console.log('Cleaning up git repo at '+context.repoDir);
      //TODO this could be done without using a shell command
      var execStatement = 'rm -rf "'+context.repoDir+'"';
      console.log(execStatement);
      childProcess.exec(path.join(execStatement), {
        cwd: context.projectDir,
        env: context.vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          return reject(err);
        }
        else {
          return resolve(allComplete(context));
        }
      });
    }
    else {
      console.log('Leaving git repo as is at '+context.repoDir);
      return resolve(allComplete(context));
    }
  });
}
