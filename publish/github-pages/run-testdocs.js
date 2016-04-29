/*@flow*/
'use strict';

const executeCommand = require('./execute-command.js');
const setUpVars = require('./set-up-vars.js');

module.exports = runTestdocs;

/**
 * Invokes the `testdocs` command,
 * unless `FLAG_SKIP_TEST` is true,
 * in which case it is up to the client
 * to invoke tests as appropriate.
 *
 * @method runTestdocs
 * @for  PublishGithubPages
 */
function runTestdocs(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('runTestdocs... start');
    if (context.vars.FLAG_SKIP_TEST === 'true') {
      console.log('Skipping tests for documentation');
      return resolve(true);
    }
    else {
      console.log('Invoking "testdocs" script');
      var statement = 'npm run '+context.vars.DOCUMENT_TEST_HOOK;
      return resolve(executeCommand.statement(statement, {
        cwd: context.projectDir,
        env: context.vars,
      }));
    }
  })
  .then((result) => {
    console.log('runTestdocs... finish');
    return (setUpVars(context));
  });
}
