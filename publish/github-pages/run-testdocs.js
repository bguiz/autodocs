/*@flow*/
'use strict';

const executeCommand = require('./execute-command.js');

const setUpVars = require('./set-up-vars.js');

module.exports = runTestdocs;

function runTestdocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_SKIP_TEST === 'true') {
      console.log('Skipping tests for documentation');
      return true;
    }
    else {
      console.log('Invoking "testdocs" script');
      var statement = 'npm run '+context.vars.DOCUMENT_TEST_HOOK;
      console.log(statement);
      return executeCommand.statement(statement, {
        cwd: context.projectDir,
        env: context.vars,
      });
    }
  })
  .then((result) => {
    return (setUpVars(context));
  });
}
