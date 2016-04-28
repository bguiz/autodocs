/*@flow*/
'use strict';

const allComplete = require('./all-complete.js');
const runGeneratedocs = require('./run-generatedocs.js');

module.exports = publishGithubPages;

function publishGithubPages(context/*: Object*/, callback/*: Function*/) {
  console.log('publishGithubPages...');
  publishGithubPagesImpl(context)
    .then((result) => {
      console.log('publishGithubPages... done');

      callback(undefined, result);
    })
    .catch((err) => {
      console.log('publishGithubPages... failed');

      console.error(err);
      callback(err);
    });
}

function publishGithubPagesImpl(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('publishGithubPagesImpl...');

    var configVars = context.configVariables;

    // Only care about certain environment variables
    var vars = configVars.selected([
      'PROJECT_DIR',
      'PROJECT_NAME',
      'MAJOR_VERSION',
      'MINOR_VERSION',
      'PATCH_VERSION',
      'GIT_USER',
      'GIT_EMAIL',
      'REPO_SLUG',
      'SCRIPT_DIR',

      'FLAG_COPY_ASSETS',
      'FLAG_PUBLISH_ON_RELEASE',
      'FLAG_CLEAN_DOCUMENT',
      'FLAG_STRIP_TOKEN_OUTPUT',
      'FLAG_ALL_PAGE',
      'FLAG_LATEST_PAGE',
      'FLAG_SKIP_PUSH',
      'FLAG_SKIP_GENERATE',
      'FLAG_SKIP_PUBLISH_RUN',
      'FLAG_PUBLISH_IN_ROOT',

      'DOCUMENT_BRANCH',
      'DOCUMENT_JOB_INDEX',
      'DOCUMENT_GENERATE_HOOK',
      'DOCUMENT_GENERATED_FOLDER',
      'DOCUMENT_PUBLISH_FOLDER_ROOT',
      'DOCUMENT_PUBLISH_FOLDER',
      'DOCUMENT_PUBLISH_SUBFOLDER',
      'DOCUMENT_ASSETS',
      'DOCUMENT_PUBLISH_FOLDER_ROOT',
      'DOCUMENT_PUBLISH_SUBFOLDER',
      'DOCUMENT_PUBLISH_FOLDER',

      'GH_PUBLISH_BRANCH',
      'GH_TOKEN',
      'GH_USER',
      'GH_REPO'
    ]);
    vars.PATH = process.env.PATH;
    context.vars = vars;

    context.projectDir = context.vars.PROJECT_DIR;

    if (context.vars.FLAG_SKIP_PUBLISH_RUN === 'true') {
      return (allComplete(context));
    }
    else {
      return (runGeneratedocs(context));
    }
  });
}
