/*@flow*/
'use strict';

var childProcess = require('child_process');

module.exports = {
  statement: executeStatement,
  file: executeFile,
};

/**
 * Utility function to execute a file on the commandline
 * via a separate process (child process)
 *
 * @param  {string} filePath  the executable file to invoke
 * @param  {Array<string>} args  arguments to pass to the executable
 * @param  {Object} options  Typically options would include `cwd` and `env`
 * @return {Promise}  Rejects if the command failed,
 *                    otherwise resolves with stdout and stdin
 */
function executeFile(
  filePath/*: string*/,
  argv/*: Array<string>*/,
  options/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('executeFile:');
    console.log(
      filePath,
      argv.map((s) => `"${s}"`).join(' '));
    childProcess.execFile(filePath, argv, options, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (!!err) {
        console.error('executeFile error');
        return reject(err);
      }
      else {
        console.error('executeFile success');
        return resolve({
          stdout,
          stderr,
        });
      }
    });
  });
}

/**
 * Utility function to execute a statement on the commandline
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
    console.log('executeStatement:');
    console.log(
      statement);
    childProcess.exec(statement, options, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (!!err) {
        console.error('executeStatement error');
        return reject(err);
      }
      else {
        console.error('executeStatement success');
        return resolve({
          stdout,
          stderr,
        });
      }
    });
  });
}
