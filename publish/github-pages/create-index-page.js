/*@flow*/
'use strict';

const fs = require('fs');
const path = require('path');

const executeCommand = require('./execute-command.js');
const createLatestAlias = require('./create-latest-alias.js');

module.exports = createIndexPage;

function createIndexPage(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_ALL_PAGE === 'false') {
      console.log('Not creating an all page');
      context.vars.ALL_ASSETS = '';
      return resolve(true);
    }
    else {
      return createIndexPageImpl(context);
    }
  })
  .then((result) => {
    return (createLatestAlias(context));
  });
}

function createIndexPageImpl(context) {
  return new Promise((resolve, reject) => {
    console.log('Create an all page');
    var publishFolderRoot =
      path.resolve(context.repoDir, context.vars.DOCUMENT_PUBLISH_FOLDER_ROOT);
    fs.readdir(context.publishFolderRoot, function(err, files) {
      if (err) {
        return reject(err);
      }
      else {
        return resolve(files);
      }
    })
  })
  .then((files) => {
    // Work out which versions have documentation available
    var versions = files
      .filter(function(file) {
        return (
          file.indexOf('all') < 0 &&
          file.indexOf('latest') < 0 &&
          !!fs.statSync(context.publishFolderRoot, file).isDirectory());
      });

    // Use the list of versions to render an "all" page from a template,
    // and write to disk
    var inHtml = fs.readFileSync(path.resolve(context.vars.SCRIPT_DIR, 'all.html'));
    var allTemplate = require('hogan.js').compile(inHtml.toString());
    var outHtml = allTemplate.render({
      name: context.vars.PROJECT_NAME,
      versions: versions,
    });
    try {
      fs.mkdirSync(path.resolve(context.repoDir, context.vars.ALL_DIR));
    } catch (ex) {
      // Do nothing - we don't care if the directory already exists
    }
    fs.writeFileSync(path.resolve(context.repoDir, context.vars.ALL_DIR, 'index.html'), outHtml);

    context.vars.ALL_ASSETS = context.vars.ALL_DIR;
  });
}
