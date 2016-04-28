/*@flow*/
'use strict';

var path = require('path');

const executeCommand = require('./execute-command.js');
const setUpRepo = require('./set-up-repo.js');

module.exports = setUpVars;

function setUpVars(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up vars');
    let filePath = path.join(__dirname, 'set-up-vars.sh');
    return executeCommand.file(filePath, [], {
      cwd: context.projectDir,
      env: context.vars,
    });
  })
  .then((result) => {
    context.vars =
      context.configVariables.parsePrintenv(
        result.stdout, context.vars);
    context.repoDir = context.vars.GHPAGES_DIR;
    return (setUpRepo(context));
  });
}
