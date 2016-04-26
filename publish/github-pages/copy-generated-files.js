/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const copyAssets = require('./copy-assets.js');

module.exports = copyGeneratedFiles;

function copyGeneratedFiles(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    //TODO this step could be done without using shell scripts
    console.log('Copy generated files');
    if (context.vars.FLAG_PUBLISH_IN_ROOT === 'true') {
      console.log('Publishing in root');
    }
    let execFile = path.join(__dirname, 'copy-generated-files.sh');
    childProcess.execFile(execFile, [], {
      cwd: context.projectDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        return reject(err);
      }
      else {
        return resolve(copyAssets(context));
      }
    });
  });
}
