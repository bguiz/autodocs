'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

/**
 * @class  PublishGithubPages
 * @module  AutodocsPublish
 */

var execute = childProcess.exec;

/**
 * Initialisation step for Github Pages
 *
 * Used to check/ set any Github Pages environment variables
 *
 * @method  init
 * @for  PublishGithubPages
 */
function environmentVariablesGithub(context, callback) {
  var envVar = context.environmentVariables;

  /**
   * @property GH_TOKEN
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('GH_TOKEN');

  /**
   * @property REPO_SLUG
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('REPO_SLUG');

  if (!envVar.exists('GH_USER') ||
      !envVar.exists('GH_REPO')) {
    var tokens = process.env.REPO_SLUG.split('/');

    /**
     * @property GH_USER
     * @type String (Environment Variable)
     * @default First half of `REPO_SLUG`
     */
    envVar.default('GH_USER', tokens[0]);

    /**
     * @property GH_REPO
     * @type String (Environment Variable)
     * @default Second half of `REPO_SLUG`
     */
    envVar.default('GH_REPO', tokens[1]);

    process.env.SCRIPT_DIR = __dirname;
  }
}

/**
 * Performs the required steps for publishing to Github pages
 *
 * - runs `npm run generatedocs`
 * - `git fetch`es the `gh-pages` branch of the project into a throwaway git repository
 * - copies the documentation generated by the `generatedocs` script into the `gh-pages` branch
 * - copies any additional files required into the gh-pages branch
 * - if any files have changed, `git commit`s `git push`es on the `gh-pages` branch
 *   - this is when the files actually succeed in publishing
 * - if necessary, cleans up the throwaway git repository
 *
 * @method run
 * @for  PublishGithubPages
 */
function publishGithubPages(context, callback) {
  var envVar = context.environmentVariables;

  var projectDir = process.env.PROJECT_DIR;

  if (process.env.FLAG_SKIP_PUBLISH_RUN === 'true') {
    allComplete();
  }
  else {
    runGeneratedocs();
  }

  function runGeneratedocs() {
    // Generate the documentation
    console.log('Generating documentation');
    if (process.env.FLAG_SKIP_GENERATE === 'true') {
      console.log('Invoking "generatedocs" script');
      execute('npm run generatedocs', {
        cwd: projectDir,
        env: process.env,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          console.log('err: '+err);
          callback(err);
        }
        else {
          setUpVars();
        }
      });
    }
    else {
      console.log('Re-using previously generated documentation');
      setUpVars();
    }
  }

  var vars = envVar.selected([
    'PATH',
    'PROJECT_DIR',
    'MAJOR_VERSION',
    'MINOR_VERSION',
    'PATCH_VERSION',
    'GIT_USER',
    'GIT_EMAIL',
    'FLAG_COPY_ASSETS',
    'FLAG_PUBLISH_ON_RELEASE',
    'FLAG_CLEAN_DOCUMENT',
    'FLAG_STRIP_TOKEN_OUTPUT',
    'FLAG_LATEST_PAGE',
    'FLAG_SKIP_PUSH',
    'FLAG_SKIP_GENERATE',
    'FLAG_SKIP_PUBLISH_RUN',
    'DOCUMENT_BRANCH',
    'DOCUMENT_JOB_INDEX',
    'DOCUMENT_GENERATED_FOLDER',
    'DOCUMENT_PUBLISH_FOLDER_ROOT',
    'DOCUMENT_PUBLISH_FOLDER',
    'DOCUMENT_PUBLISH_SUBFOLDER',
    'DOCUMENT_ASSETS',
    'DOCUMENT_PUBLISH_FOLDER_ROOT',
    'DOCUMENT_PUBLISH_SUBFOLDER',
    'DOCUMENT_PUBLISH_FOLDER',
    'GH_TOKEN',
    'GH_USER',
    'GH_REPO'
  ]);
  // console.log('vars before', vars);
  var repoDir;

  function setUpVars() {
    console.log('Set up vars');
    execute(path.join(__dirname, 'set-up-vars.sh'), {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      vars = envVar.parsePrintenv(stdout, vars);
      repoDir = vars.GHPAGES_DIR;
      // console.log('vars after', vars);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        setUpRepo();
      }
    });
  }


  function setUpRepo() {
    console.log('Set up repo');
    execute(path.join(__dirname, 'set-up-repo.sh'), {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        ghpagesBranch();
      }
    });
    // # Git repo init and update gh-pages branch
    // rm -rf "${GHPAGES_DIR}"
    // mkdir -p "${GHPAGES_DIR}"
    // cd "${GHPAGES_DIR}"
    // git init
    // git config user.name "${GIT_USER}"
    // git config user.email "${GIT_EMAIL}"
    // git remote add upstream "${REPO_URL_AUTH}"
  }

  var numGhpagesBranches;

  function ghpagesBranch() {
    console.log('Set up branch');
    execute("git ls-remote --heads ${REPO_URL_UNAUTH} | grep 'refs\\\/heads\\\/gh-pages' | wc -l", {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_GHPAGES_BRANCHES', stdout);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        try {
          numGhpagesBranches = parseInt(stdout.toString().trim(), 10);
        }
        catch (ex) {
          return callback('Could not determine whether repo has a gh-pages branch');
        }
        ghpagesBranchImpl();
      }
    });
    // # Detect if this repo has a gh-pages branch
    // NUM_GHPAGES_BRANCHES=$( git ls-remote --heads ${REPO_URL_UNAUTH} | grep 'refs\/heads\/gh-pages' | wc -l )
    // git ls-remote --heads ${REPO_URL_UNAUTH}
    // echo "NUM_GHPAGES_BRANCHES ${NUM_GHPAGES_BRANCHES}"
    // if test "${NUM_GHPAGES_BRANCHES}" == "0" ; then
    //   echo "Creating new gh-pages branch"
    //   git checkout --orphan gh-pages
    // else
    //   echo "Using existing gh-pages"
    //   git fetch upstream gh-pages
    //   git checkout gh-pages
    // fi
  }

  function ghpagesBranchImpl() {
    var execStatement;
    if (numGhpagesBranches === 0) {
      console.log('Creating new gh-pages branch');
      execStatement = 'git checkout --orphan gh-pages';
    }
    else {
      console.log('Using existing gh-pages branch');
      execStatement = 'git fetch upstream gh-pages && git checkout gh-pages';
    }
    execute(execStatement, {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        copyGeneratedFiles();
      }
    });
  }

  function copyGeneratedFiles() {
    //TODO this step could be done without using shell scripts
    console.log('Copy generated files');
    execute(path.join(__dirname, 'copy-generated-files.sh'), {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        copyAssets();
      }
    });
    // #NOTE The var `DOCUMENT_PUBLISH_FOLDER` is processed and is based on other vars
    // # It defaults to `api/${MAJOR_VERSION}.${MINOR_VERSION}`
    // mkdir -p "${DOC_PUBLISH_DIR}"
    // rm -rf ${DOC_PUBLISH_DIR}/*
    // cp -r ${GENERATED_DIR}/* "${DOC_PUBLISH_DIR}"
  }

  function copyAssets() {
    console.log('Copy assets');
    if (vars.FLAG_COPY_ASSETS === 'true') {
      console.log('Copying assets: '+vars.DOCUMENT_ASSETS);
      var executeStatement = 'tar cf - '+vars.DOCUMENT_ASSETS+' | ( cd "'+repoDir+'" ; tar xf - )';
      execute(executeStatement, {
        cwd: repoDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          console.log('err: '+err);
          callback(err);
        }
        else {
          createIndexPage();
        }
      });
    }
    else {
      console.log('Not copying assets');
      vars.DOCUMENT_ASSETS = '';
      createIndexPage();
    }
    // # Specify a set of folders/ files to copy across to the root folder
    // if test "${FLAG_COPY_ASSETS}" == "true" ; then
    //   echo "Copying assets: ${DOCUMENT_ASSETS}"
    //   cd "${PROJECT_DIR}"
    //   # Use tar and pipe to untar to preserve directory structure
    //   # because `cp -r` does not do this well.
    //   # A viable alternative is to use `rsync`, for future reference
    //   tar cf - ${DOCUMENT_ASSETS} | ( cd "${GHPAGES_DIR}" ; tar xf - )
    //   cd "${GHPAGES_DIR}"
    // else
    //   echo "Not copying assets"
    //   DOCUMENT_ASSETS=""
    // fi
    // touch "${DOC_PUBLISH_ROOT_DIR}"
    // touch "${DOC_PUBLISH_DIR}"
  }

  function createIndexPage() {
    console.log('Create index page - skipped');
    // # TODO generate an index page to list all available API documentation versions
    createLatestAlias();
  }

  function createLatestAlias() {
    if (vars.FLAG_LATEST_PAGE === 'true') {
      console.log('Create latest alias');
      var executeStatement = 'mkdir -p "'+vars.LATEST_DIR+
        '" && { cat "'+vars.SCRIPT_DIR+
        '/latest.html" | sed "s/'+vars.LATEST_REDIRECTREPLACE+
        '/'+vars.LATEST_REDIRECTURL+
        '/g" ; } > "'+vars.LATEST_DIR+'/index.html"';
      execute(executeStatement, {
        cwd: repoDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          console.log('err: '+err);
          callback(err);
        }
        else {
          vars.LATEST_ASSETS = vars.LATEST_DIR;
          commitAndPush();
        }
      });
    }
    else {
      console.log('Not creating page for latest alias');
      vars.LATEST_ASSETS = '';
      commitAndPush();
    }
    // # TODO alias "latest" or "current" to the one currently being generated
    // if test "${FLAG_LATEST_PAGE}" == "true" ; then
    //   echo "Generating 'latest' page"
    //   # echo SED_REDIRECT=${SED_REDIRECT}
    //   mkdir -p "${LATEST_DIR}"
    //   { cat "${SCRIPT_DIR}/latest.html" | sed "s/${LATEST_REDIRECTREPLACE}/${LATEST_REDIRECTURL}/g" ; } > "${LATEST_DIR}/index.html"
    //   LATEST_ASSETS="${LATEST_DIR}"
    // else
    //   LATEST_ASSETS=""
    // fi
  }

  var numFilesChanged;
  function commitAndPush() {
    console.log('Commit and push');
    execute("git ls-files -m -o | wc -l", {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_FILES_CHANGED', stdout);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        try {
          numFilesChanged = parseInt(stdout.toString().trim(), 10);
        }
        catch (ex) {
          return callback('Could not determine whether repo has a gh-pages branch');
        }
        commitAndPushImpl();
      }
    });
    // # Test if there are any changes
    // cd "${GHPAGES_DIR}"
    // NUM_FILES_CHANGED=$( git ls-files -m -o | wc -l )
    // if test "${NUM_FILES_CHANGED}" -gt "0" ; then
      // # Commit and push
      // GIT_ADDITIONS="${DOC_PUBLISH_DIR} ${DOCUMENT_ASSETS} ${LATEST_ASSETS}"
      // git add -A ${GIT_ADDITIONS}
      // COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
      // echo "${COMMIT_MESSAGE}"
      // git commit -m "${COMMIT_MESSAGE}"
      // if test "${FLAG_SKIP_PUSH}" == "true" ;  then
      //   echo "Skipping push to github pages"
      // else
      //   # discard all output, because it contains the github access token
      //   # unless, opted out, using `FLAG_QUIET_PUSH`
      //   if test "${FLAG_STRIP_TOKEN_OUTPUT}" == "false" ; then
      //     # Show output, unmodified.
      //     # This should *not* be done in CI, only for local testing
      //     git push upstream HEAD:gh-pages
      //   else
      //     # Use `sed` to replace any instances of the Github token in both stdout and stderr
      //     SED_STRIP_TOKEN="s/${GH_TOKEN}/\[SECURE\]/g"
      //     { git push upstream HEAD:gh-pages 2>&1 >&3 | sed ${SED_STRIP_TOKEN} ; } 3>&1
      //   fi
      //   echo "Successfully pushed documentation to gh-pages"
      // fi
    // else
    //   echo "Documentation unchanged, no need to publish"
    // fi
  }

  function commitAndPushImpl() {
    if (numFilesChanged < 1) {
      console.log('Documentation unchanged, no need to publish');
      cleanUp();
      return;
    }
    console.log('Publishing changes to documentation');
    execute(path.join(__dirname, 'commit-and-push.sh'), {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        console.log('err: '+err);
        callback(err);
      }
      else {
        cleanUp();
      }
    });
  }

  function cleanUp() {
    if (vars.FLAG_CLEAN_DOCUMENT === 'true') {
      console.log('Cleaning up git repo at '+repoDir);
      //TODO this could be done without using a shell command
      execute(path.join('rm -rf "'+repoDir+'"'), {
        cwd: projectDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
          console.log('err: '+err);
          callback(err);
        }
        else {
          allComplete();
        }
      });
    }
    else {
      console.log('Leaving git repo as is at '+repoDir);
      allComplete();
    }
    // if "${FLAG_CLEAN_DOCUMENT}" == "true" ; then
    //   echo "Cleaning up git repo at ${GHPAGES_DIR}"
    //   rm -rf "${GHPAGES_DIR}"
    // fi

  }

  function allComplete() {
    outputUrls(context, callback);
    process.nextTick(function() {
      callback();
      // process.exit(0);
    });
  }
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
function outputUrls(context, callback) {
  var envVar = context.environmentVariables;

  var CNAME;
  if (process.env.FLAG_COPY_ASSETS === 'true' &&
      process.env.DOCUMENT_ASSETS.split(' ').indexOf('CNAME') >= 0) {
    // Best guess that CNAME file was copied in
    try {
      var CNAMEfile = path.join(process.env.PROJECT_DIR, 'CNAME');
      CNAME = fs.readFileSync(CNAMEfile).toString().trim();
    }
    catch (e) {
      // Do nothing
    }
  }
  CNAME = CNAME || (process.env.GH_USER+'.github.io');
  var publishDomain = 'http://'+CNAME;
  var publishUrl = publishDomain+'/'+process.env.GH_REPO;
  var publishApiUrl = publishUrl+'/'+process.env.DOCUMENT_PUBLISH_FOLDER;
  console.log('Base URL: '+publishUrl);
  console.log('API  URL: '+publishApiUrl);
}

module.exports = {
  init: environmentVariablesGithub,
  run: publishGithubPages,
};

