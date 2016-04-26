/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const copyGeneratedFiles = require('./copy-generated-files.js');

module.exports = ghpagesBranch;

function ghpagesBranch(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('Set up branch');
    var executeStatement =
      "git ls-remote --heads "+context.vars.REPO_URL_UNAUTH+
      " | grep 'refs\\\/heads\\\/"+context.vars.GH_PUBLISH_BRANCH+
      "' | wc -l";
    console.log(executeStatement);
    childProcess.exec(executeStatement, {
      cwd: context.projectDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_PUBLISH_BRANCHES', stdout);
      if (err) {
        return reject(err);
      }
      else {
        try {
          context.numPublishBranches = parseInt(stdout.toString().trim(), 10);
        }
        catch (ex) {
          return reject('Could not determine whether repo has a '+
            context.vars.GH_PUBLISH_BRANCH+' branch');
        }
        if (isNaN(context.numPublishBranches)) {
          return reject('Could not determine whether repo has a '+
            context.vars.GH_PUBLISH_BRANCH+' branch');
        }
        return resolve(ghpagesBranchImpl(context));
      }
    });
  });
}

function ghpagesBranchImpl(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    var execStatement;
    if (context.numPublishBranches === 0) {
      console.log('Creating new '+context.vars.GH_PUBLISH_BRANCH+' branch');
      execStatement = 'git checkout --orphan '+context.vars.GH_PUBLISH_BRANCH;
    }
    else {
      console.log('Using existing '+context.vars.GH_PUBLISH_BRANCH+' branch');
      execStatement = 'git fetch upstream '+context.vars.GH_PUBLISH_BRANCH+
        ' && git checkout '+context.vars.GH_PUBLISH_BRANCH;
    }
    console.log(execStatement);
    childProcess.exec(execStatement, {
      cwd: context.repoDir,
      env: context.vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        return reject(err);
      }
      else {
        return resolve(copyGeneratedFiles(context));
      }
    });
  });
}
