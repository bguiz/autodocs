/* @flow */
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const executeCommand = require('./execute-command.js');
const allComplete = require('./all-complete.js');

module.exports = cleanUp;

function cleanUp(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_CLEAN_DOCUMENT === 'true') {
      console.log('Cleaning up git repo at '+context.repoDir);
      //TODO this could be done without using a shell command
      var statement = 'rm -rf "'+context.repoDir+'"';
      console.log(statement);
      return executeCommand.statement(statement, {
        cwd: context.projectDir,
        env: context.vars,
      });
    }
    else {
      console.log('Leaving git repo as is at '+context.repoDir);
      return resolve(true);
    }
  })
  .then((result) => {
    return (allComplete(context));
  });
}
