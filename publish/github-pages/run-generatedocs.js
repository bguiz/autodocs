/*@flow*/
'use strict';

const executeCommand = require('./execute-command.js');
const runTestdocs = require('./run-testdocs.js');

module.exports = runGeneratedocs;

function runGeneratedocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Generating documentation');
    if (context.vars.FLAG_SKIP_GENERATE === 'true') {
      console.log('Re-using previously generated documentation');
      return true;
    }
    else {
      console.log('Invoking "generatedocs" script');
      let statement = 'npm run '+context.vars.DOCUMENT_GENERATE_HOOK;
      console.log(statement);
      return executeCommand.statement(statement, {
        cwd: context.projectDir,
        env: context.vars,
      });
    }
  })
  .then((result) => {
    return runTestdocs(context);
  });
}
