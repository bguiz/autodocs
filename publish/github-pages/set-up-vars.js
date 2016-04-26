/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const setUpRepo = require('./set-up-repo.js');

module.exports = setUpVars;

function setUpVars(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up vars');
    childProcess.execFile(path.join(__dirname, 'set-up-vars.sh'), [], {
      cwd: context.projectDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      context.vars = context.configVariables.parsePrintenv(stdout, context.vars);
      context.repoDir = context.vars.GHPAGES_DIR;
      if (err) {
        reject(err);
      }
      else {
        return resolve(setUpRepo(context));
      }
    });
  });
}
