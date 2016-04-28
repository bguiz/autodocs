/*@flow*/
'use strict';

const path = require('path');

const executeCommand = require('./execute-command.js');
const createIndexPage = require('./create-index-page.js');

module.exports = copyAssets;

function copyAssets(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Copy assets');
    if (context.vars.FLAG_COPY_ASSETS === 'true') {
      console.log('Copying assets: '+context.vars.DOCUMENT_ASSETS);
      let execFile = path.join(__dirname, 'copy-assets.sh');
      return executeCommand.file(execFile, [], {
        cwd: context.projectDir,
        env: context.vars,
      });
    }
    else {
      console.log('Not copying assets');
      context.vars.DOCUMENT_ASSETS = '';
      return resolve(true);
    }
  })
  .then((result) => {
    return (createIndexPage(context));
  });
}
