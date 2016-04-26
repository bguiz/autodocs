/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const ghpagesBranch = require('./ghpages-branch.js');

module.exports = setUpRepo;

function setUpRepo(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up repo');
    childProcess.execFile(path.join(__dirname, 'set-up-repo.sh'), [], {
      cwd: context.projectDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        return reject(err);
      }
      else {
        return resolve(ghpagesBranch(context));
      }
    });
  });
}
