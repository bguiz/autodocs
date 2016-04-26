/*@flow*/
'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

const commitAndPush = require('./commit-and-push.js');

module.exports = createLatestAlias;

function createLatestAlias(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    if (context.vars.FLAG_LATEST_PAGE === 'false') {
      console.log('Not creating a latest page');
      context.vars.LATEST_ASSETS = '';
      return resolve(commitAndPush(context));
    }
    else {
      console.log('Create latest alias');
      var inHtml = fs.readFileSync(
        path.resolve(context.vars.SCRIPT_DIR, 'latest.html'));
      var latestTemplate = require('hogan.js').compile(inHtml.toString());
      var outHtml = latestTemplate.render({
        name: context.vars.PROJECT_NAME,
        redirectUrl: '../'+context.vars.DOCUMENT_PUBLISH_SUBFOLDER+'/',
      });
      try {
        fs.mkdirSync(path.resolve(context.repoDir, context.vars.LATEST_DIR));
      } catch (ex) {
        // Do nothing - we don't care if the directory already exists
      }
      fs.writeFileSync(path.resolve(context.repoDir, context.vars.LATEST_DIR, 'index.html'), outHtml);

      context.vars.LATEST_ASSETS = context.vars.LATEST_DIR;
      return resolve(commitAndPush(context));
    }
  });
}
