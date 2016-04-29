/*@flow*/
'use strict';

const path = require('path');

const executeCommand = require('./execute-command.js');
const ghpagesBranch = require('./ghpages-branch.js');

module.exports = setUpRepo;

/**
 * Set up the git respository used to publish to github pages
 *
 * @method setUpRepo
 * @for  PublishGithubPages
 */
function setUpRepo(context/*: Object*/) {
  return new Promise((resolve, reject) => {
    console.log('setUpRepo... start');
    let filePath = path.join(__dirname, 'set-up-repo.sh');
    return resolve(executeCommand.file(filePath, [], {
      cwd: context.projectDir,
      env: context.vars,
    }));
  })
  .then((result) => {
    console.log('setUpRepo... finish');
    return (ghpagesBranch(context));
  });
}
