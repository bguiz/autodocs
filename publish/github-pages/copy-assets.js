/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const createIndexPage = require('./create-index-page.js');

module.exports = copyAssets;

function copyAssets(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Copy assets');
    if (context.vars.FLAG_COPY_ASSETS === 'true') {
      console.log('Copying assets: '+context.vars.DOCUMENT_ASSETS);
      let execFile = path.join(__dirname, 'copy-assets.sh');
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
          return resolve(createIndexPage(context));
        }
      });
    }
    else {
      console.log('Not copying assets');
      context.vars.DOCUMENT_ASSETS = '';
      return resolve(createIndexPage(context));
    }
  });
}
