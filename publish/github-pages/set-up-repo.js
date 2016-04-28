/*@flow*/
'use strict';

var path = require('path');

const executeCommand = require('./execute-command.js');
const ghpagesBranch = require('./ghpages-branch.js');

module.exports = setUpRepo;

function setUpRepo(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up repo');
    let filePath = path.join(__dirname, 'set-up-repo.sh');
    return executeCommand.file(filePath, [], {
      cwd: context.projectDir,
      env: context.vars,
    });
  })
  .then((result) => {
    return (ghpagesBranch(context));
  });
}
