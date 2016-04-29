/*@flow*/
'use strict';

const path = require('path');

const executeCommand = require('./execute-command.js');
const createIndexPage = require('./create-index-page.js');

module.exports = copyAssets;

function copyAssets(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('copyAssets... start');
    if (context.vars.FLAG_COPY_ASSETS === 'true') {
      console.log('Copying assets: '+context.vars.DOCUMENT_ASSETS);
      let execFile = path.join(__dirname, 'copy-assets.sh');
      return resolve(executeCommand.file(execFile, [], {
        cwd: context.projectDir,
        env: context.vars,
      }));
    }
    else {
      console.log('Not copying assets');
      context.vars.DOCUMENT_ASSETS = '';
      return resolve(true);
    }
  })
  .then((result) => {
    console.log('copyAssets... finish');
    return (createIndexPage(context));
  });
}
