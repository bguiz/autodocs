'use strict';

module.exports = allComplete;

function allComplete(context) {
  return new Promise((resolve, reject) => {
    console.log('allComplete...');
    outputUrls(context);
    resolve(context);
  });
}

/**
 * Outputs the base URL and the API URL at which the documentation should be published.
 *
 * Uses `CNAME` file based on best guess,
 * otherwise defaults to `*.github/*`
 *
 * @method  outputUrls
 * @for  PublishGithubPages
 * @private
 */
function outputUrls(context) {
  var CNAME;
  if (context.vars.FLAG_COPY_ASSETS === 'true' &&
      context.vars.DOCUMENT_ASSETS.split(' ').indexOf('CNAME') >= 0) {
    // Best guess that CNAME file was copied in
    try {
      var CNAMEfile = path.join(context.vars.PROJECT_DIR, 'CNAME');
      CNAME = fs.readFileSync(CNAMEfile).toString().trim();
    }
    catch (e) {
      // Do nothing
    }
  }
  if (!CNAME) {
    /* istanbul ignore if :
      this project will not be able to test this - it isn't an organisation page
      will need and entirely new project in order to test this */
    if (context.vars.GH_USER.match( /^[^\.]+.github.io$/)) {
      CNAME = context.vars.GH_USER;
    }
    else {
      CNAME = context.vars.GH_USER+'.github.io';
    }
  }
  var publishDomain = 'http://'+CNAME;
  var publishUrl = publishDomain+'/'+context.vars.GH_REPO;
  var publishApiUrl = publishUrl+'/'+context.vars.DOCUMENT_PUBLISH_FOLDER;
  console.log('Base URL: '+publishUrl);
  console.log('API  URL: '+publishApiUrl);
}
