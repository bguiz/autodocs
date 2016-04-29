/*@flow*/
'use strict';

const path = require('path');

const executeCommand = require('./execute-command.js');
const copyAssets = require('./copy-assets.js');

module.exports = copyGeneratedFiles;

function copyGeneratedFiles(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    //TODO this step could be done without using shell scripts
    console.log('copyGeneratedFiles... start');
    if (context.vars.FLAG_PUBLISH_IN_ROOT === 'true') {
      console.log('Publishing in root');
    }
    else {
      console.log('Publishing in directory based on version');
    }
    let filePath = path.join(__dirname, 'copy-generated-files.sh');
    return resolve(executeCommand.file(filePath, [], {
      cwd: context.projectDir,
      env: context.vars,
    }));
  })
  .then((result) => {
    console.log('copyGeneratedFiles... finish');
    return (copyAssets(context));
  });
}
