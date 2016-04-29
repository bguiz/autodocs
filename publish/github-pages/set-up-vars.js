/*@flow*/
'use strict';

const path = require('path');

const executeCommand = require('./execute-command.js');
const setUpRepo = require('./set-up-repo.js');

module.exports = setUpVars;

function setUpVars(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('setUpVars... start');
    let filePath = path.join(__dirname, 'set-up-vars.sh');
    return resolve(filePath);
  })
  .then((filePath) => {
    return (executeCommand.file(filePath, [], {
      cwd: context.projectDir,
      env: context.vars,
    }));
  })
  .then((result) => {
    console.log('setUpVars... finish1');
    context.vars =
      context.configVariables.parsePrintenv(
        result.stdout, context.vars);
    context.repoDir = context.vars.GHPAGES_DIR;
    return (setUpRepo(context));
  });
}
