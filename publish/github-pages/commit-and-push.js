/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const executeCommand = require('./execute-command.js');
const cleanUp = require('./clean-up.js');

module.exports = commitAndPush;

function commitAndPush(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Commit and push');
    var statement = 'git ls-files -m -o | wc -l';
    console.log(statement);
    return executeCommand.statement(statement, {
      cwd: context.repoDir,
      env: context.vars,
    });
  })
  .then((result) => {
    console.log('NUM_FILES_CHANGED', result.stdout);
    let failed = false;
    try {
      context.numFilesChanged = parseInt(context.stdout.toString().trim(), 10);
    }
    catch (ex) {
      failed = true;
    }
    if (isNaN(context.numFilesChanged)) {
      failed = true;
    }
    if (failed) {
      throw Error('Could not determine whether repo has a gh-pages branch');
    }
    if (context.numFilesChanged < 1) {
      console.log('Documentation unchanged, no need to publish');
      return (cleanUp(context));
    }
    else {
      return (commitAndPushImpl(context));
    }
  });
}

function commitAndPushImpl(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Publishing changes to documentation');
    let filePath = path.join(__dirname, 'commit-and-push.sh');
    executeCommand.file(filePath, [], {
      cwd: context.repoDir,
      env: context.vars,
    });
  })
  .then((result) => {
    return (cleanUp(context));
  });
}
