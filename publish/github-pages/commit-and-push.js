/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const cleanUp = require('./clean-up.js');

module.exports = commitAndPush;

function commitAndPush(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Commit and push');
    var execStatement = 'git ls-files -m -o | wc -l';
    console.log(execStatement);
    childProcess.exec(execStatement, {
      cwd: context.repoDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_FILES_CHANGED', stdout);
      if (err) {
        return reject(err);
      }
      else {
        try {
          context.numFilesChanged = parseInt(stdout.toString().trim(), 10);
        }
        catch (ex) {
          return reject('Could not determine whether repo has a gh-pages branch');
        }
        return resolve(commitAndPushImpl(context));
      }
    });
  });
}

function commitAndPushImpl(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.numFilesChanged < 1) {
      console.log('Documentation unchanged, no need to publish');
      return resolve(cleanUp(context));
    }
    console.log('Publishing changes to documentation');
    let execFile = path.join(__dirname, 'commit-and-push.sh');
    childProcess.execFile(execFile, [], {
      cwd: context.repoDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        return reject(err);
      }
      else {
        return resolve(cleanUp(context));
      }
    });
  });
}
