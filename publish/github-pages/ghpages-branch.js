/*@flow*/
'use strict';

const executeCommand = require('./execute-command.js');
const copyGeneratedFiles = require('./copy-generated-files.js');

module.exports = ghpagesBranch;

function ghpagesBranch(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up branch');
    var statement =
      "git ls-remote --heads "+context.vars.REPO_URL_UNAUTH+
      " | grep 'refs\\\/heads\\\/"+context.vars.GH_PUBLISH_BRANCH+
      "' | wc -l";
    console.log(statement);
    return executeCommand.statement(statement, {
      cwd: context.projectDir,
      env: context.vars,
    });
  })
  .then((result) => {
    console.log('NUM_PUBLISH_BRANCHES', result.stdout);
    let failed = false;
    try {
      context.numPublishBranches = parseInt(result.stdout.toString().trim(), 10);
    }
    catch (ex) {
      failed = true;
    }
    if (isNaN(context.numPublishBranches)) {
      failed = true;
    }
    if (failed) {
      throw ('Could not determine whether repo has a '+
        context.vars.GH_PUBLISH_BRANCH+' branch');
    }
    return (ghpagesBranchImpl(context));
  });
}

function ghpagesBranchImpl(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    let statement;
    if (context.numPublishBranches === 0) {
      console.log('Creating new '+context.vars.GH_PUBLISH_BRANCH+' branch');
      statement = 'git checkout --orphan '+context.vars.GH_PUBLISH_BRANCH;
    }
    else {
      console.log('Using existing '+context.vars.GH_PUBLISH_BRANCH+' branch');
      statement = 'git fetch upstream '+context.vars.GH_PUBLISH_BRANCH+
        ' && git checkout '+context.vars.GH_PUBLISH_BRANCH;
    }
    console.log(statement);
    executeCommand.statement(statement, {
      cwd: context.repoDir,
      env: context.vars,
    });
  })
  .then((result) => {
    return (copyGeneratedFiles(context));
  });
}
