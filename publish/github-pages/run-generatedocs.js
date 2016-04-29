/*@flow*/
'use strict';

const executeCommand = require('./execute-command.js');
const runTestdocs = require('./run-testdocs.js');

module.exports = runGeneratedocs;

function runGeneratedocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('runGeneratedocs... start');
    if (context.vars.FLAG_SKIP_GENERATE === 'true') {
      console.log('Re-using previously generated documentation');
      return resolve(true);
    }
    else {
      console.log('Invoking "generatedocs" script');
      let statement = 'npm run '+context.vars.DOCUMENT_GENERATE_HOOK;
      return resolve(executeCommand.statement(statement, {
        cwd: context.projectDir,
        env: context.vars,
      }));
    }
  })
  .then((result) => {
    console.log('runGeneratedocs... finish');
    return runTestdocs(context);
  });
}
