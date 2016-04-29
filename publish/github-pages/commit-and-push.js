/*@flow*/
'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const executeCommand = require('./execute-command.js');
const cleanUp = require('./clean-up.js');

module.exports = commitAndPush;

function commitAndPush(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('commitAndPush...');
    var statement = 'git ls-files -m -o | wc -l';
    return resolve(executeCommand.statement(statement, {
      cwd: context.repoDir,
      env: context.vars,
    }));
  })
  .then((result) => {
    console.log('NUM_FILES_CHANGED', result.stdout);
    let failed = false;
    try {
      context.numFilesChanged =
        parseInt(result.stdout.toString().trim(), 10);
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
    console.log('commitAndPushImpl... start');
    let filePath = path.join(__dirname, 'commit-and-push.sh');
    return resolve(executeCommand.file(filePath, [], {
      cwd: context.repoDir,
      env: context.vars,
    }));
  })
  .then((result) => {
    console.log('commitAndPushImpl... finish');
    return (cleanUp(context));
  });
}
