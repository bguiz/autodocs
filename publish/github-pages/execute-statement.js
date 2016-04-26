/*@flow*/
'use strict';

var childProcess = require('child_process');

module.exports = executeStatement;

/**
 * Utility function to execute something on the commandline
 * via a separate process (child process)
 *
 * @param  {string} statement  the command to execute
 * @param  {Object} options  Typically options would include `cwd` and `env`
 * @return {Promise}  Rejects if the command failed,
 *                    otherwise resolves with stdout and stdin
 */
function executeStatement(
  statement/*: string*/, options/*: Object*/) {
  return new Promise((resolve, reject) => {
    childProcess.exec(statement, options, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (!!err) {
        return reject(err);
      }
      else {
        return resolve({
          stdout,
          stderr,
        });
      }
    });
  });
}
