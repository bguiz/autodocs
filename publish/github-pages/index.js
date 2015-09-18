'use strict';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');

/**
 * @class  PublishGithubPages
 * @module  AutodocsPublish
 */

/**
 * Initialisation step for Github Pages
 *
 * Used to check/ set any Github Pages environment variables
 *
 * @method  init
 * @for  PublishGithubPages
 */
function environmentVariablesGithub(context, callback) {
  var configVars = context.configVariables;

  /**
   * - Must be set, use an encrypted token
   *   - If using the ruby gem:
   *     `travis encrypt GH_TOKEN=GITHUB_ACCESS_TOKEN --add`
   *   - If using the npm module:
   *     `travis-encrypt -r GH_USER/GH_REPO GH_TOKEN=GITHUB_ACCESS_TOKEN`
   *     and then copy into `.travis.yml`
   * - This is used to give Travis write access to your Git repository,
   *   and will be used to push to the `gh-pages` branch
   *
   * @property GH_TOKEN
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.require('GH_TOKEN');

  /**
   * All documentation will be published under to this branch.
   *
   * For most repositories, the default `gh-pages` will do.
   * However, for user or organisation pages, `master` could also be appropriate
   *
   * @property GH_PUBLISH_BRANCH
   * @type String (Environment Variable)
   * @default 'gh-pages'
   */
  configVars.default('GH_PUBLISH_BRANCH', 'gh-pages');

  configVars.require('REPO_SLUG');

  if (!configVars.exists('GH_USER') ||
      !configVars.exists('GH_REPO')) {
    var tokens = context.vars.REPO_SLUG.split('/');

    /**
     * Github user or organisation name
     *
     * @property GH_USER
     * @type String (Environment Variable)
     * @default First half of `REPO_SLUG`
     */
    configVars.default('GH_USER', tokens[0]);

    /**
     * Github repository name
     *
     * @property GH_REPO
     * @type String (Environment Variable)
     * @default Second half of `REPO_SLUG`
     */
    configVars.default('GH_REPO', tokens[1]);

  }

  context.vars.SCRIPT_DIR = __dirname;
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
  var configVars = context.configVariables;

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

  var projectDir = context.vars.PROJECT_DIR;

  if (context.vars.FLAG_SKIP_PUBLISH_RUN === 'true') {
    allComplete();
  }
  else {
    runGeneratedocs();
  }

  function runGeneratedocs() {
    console.log('Generating documentation');
    if (context.vars.FLAG_SKIP_GENERATE === 'true') {
      console.log('Re-using previously generated documentation');
      setUpVars();
    }
    else {
      console.log('Invoking "generatedocs" script');
      var execStatement = 'npm run '+context.vars.DOCUMENT_GENERATE_HOOK;
      console.log(execStatement);
      childProcess.exec(execStatement, {
        cwd: projectDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);

        /* istanbul ignore if */
        if (!err &&
            !(require(path.resolve(context.vars.PROJECT_DIR, 'package.json')))
              .scripts[context.vars.DOCUMENT_GENERATE_HOOK]) {
          // Necessary to test this scenario because in npm 1.x,
          // npm run on scripts that are not defined results in a silent failure
          err = new Error('Command failed: npm\nmissing script: '+context.vars.DOCUMENT_GENERATE_HOOK);
        }
        if (err) {
          callback(err);
        }
        else {
          setUpVars();
        }
      });
    }
  }

  var repoDir;

  function setUpVars() {
    console.log('Set up vars');
    childProcess.execFile(path.join(__dirname, 'set-up-vars.sh'), [], {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      vars = configVars.parsePrintenv(stdout, vars);
      repoDir = vars.GHPAGES_DIR;
      if (err) {
        callback(err);
      }
      else {
        setUpRepo();
      }
    });
  }

  function setUpRepo() {
    console.log('Set up repo');
    childProcess.execFile(path.join(__dirname, 'set-up-repo.sh'), [], {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      if (err) {

        callback(err);
      }
      else {
        ghpagesBranch();
      }
    });
  }

  var numPublishBranches;

  function ghpagesBranch() {
    console.log('Set up branch');
    var executeStatement = "git ls-remote --heads "+vars.REPO_URL_UNAUTH+" | grep 'refs\\\/heads\\\/"+vars.GH_PUBLISH_BRANCH+"' | wc -l";
    console.log(executeStatement);
    childProcess.exec(executeStatement, {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_PUBLISH_BRANCHES', stdout);
      if (err) {
        callback(err);
      }
      else {
        try {
          numPublishBranches = parseInt(stdout.toString().trim(), 10);
        }
        catch (ex) {
          return callback('Could not determine whether repo has a '+vars.GH_PUBLISH_BRANCH+' branch');
        }
        ghpagesBranchImpl();
      }
    });
  }

  function ghpagesBranchImpl() {
    var execStatement;
    if (numPublishBranches === 0) {
      console.log('Creating new '+vars.GH_PUBLISH_BRANCH+' branch');
      execStatement = 'git checkout --orphan '+vars.GH_PUBLISH_BRANCH;
    }
    else {
      console.log('Using existing '+vars.GH_PUBLISH_BRANCH+' branch');
      execStatement = 'git fetch upstream '+vars.GH_PUBLISH_BRANCH+' && git checkout '+vars.GH_PUBLISH_BRANCH;
    }
    console.log(execStatement);
    childProcess.exec(execStatement, {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
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
    childProcess.execFile(path.join(__dirname, 'copy-generated-files.sh'), [], {
      cwd: projectDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
        callback(err);
      }
      else {
        copyAssets();
      }
    });
  }

  function copyAssets() {
    console.log('Copy assets');
    if (vars.FLAG_COPY_ASSETS === 'true') {
      console.log('Copying assets: '+vars.DOCUMENT_ASSETS);
      childProcess.execFile(path.join(__dirname, 'copy-assets.sh'), [], {
        cwd: projectDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
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
  }

  function createIndexPage() {
    if (vars.FLAG_ALL_PAGE === 'false') {
      console.log('Not creating an all page');
      vars.ALL_ASSETS = '';
      createLatestAlias();
    }
    else {
      console.log('Create an all page');
      var publishFolderRoot = path.resolve(repoDir, vars.DOCUMENT_PUBLISH_FOLDER_ROOT);
      fs.readdir(publishFolderRoot, function(err, files) {
        if (err) {
          callback(err);
        }
        else {
          // Work out which versions have documentation available
          var versions = files
            .filter(function(file) {
              return (file.indexOf('all') < 0 && file.indexOf('latest') < 0 &&
                !!fs.statSync(publishFolderRoot, file).isDirectory());
            });

          // Use the list of versions to render an "all" page from a template,
          // and write to disk
          var inHtml = fs.readFileSync(path.resolve(vars.SCRIPT_DIR, 'all.html'));
          var allTemplate = require('hogan.js').compile(inHtml.toString());
          var outHtml = allTemplate.render({
            name: vars.PROJECT_NAME,
            versions: versions,
          });
          try {
            fs.mkdirSync(path.resolve(repoDir, vars.ALL_DIR));
          } catch (ex) {
            // Do nothing - we don't care if the directory already exists
          }
          fs.writeFileSync(path.resolve(repoDir, vars.ALL_DIR, 'index.html'), outHtml);

          vars.ALL_ASSETS = vars.ALL_DIR;
          createLatestAlias();
        }
      });
    }
  }

  function createLatestAlias() {
    if (vars.FLAG_LATEST_PAGE === 'false') {
      console.log('Not creating a latest page');
      vars.LATEST_ASSETS = '';
      commitAndPush();
    }
    else {
      console.log('Create latest alias');
      var inHtml = fs.readFileSync(path.resolve(vars.SCRIPT_DIR, 'latest.html'));
      var latestTemplate = require('hogan.js').compile(inHtml.toString());
      var outHtml = latestTemplate.render({
        name: vars.PROJECT_NAME,
        redirectUrl: '../'+vars.DOCUMENT_PUBLISH_SUBFOLDER+'/',
      });
      try {
        fs.mkdirSync(path.resolve(repoDir, vars.LATEST_DIR));
      } catch (ex) {
        // Do nothing - we don't care if the directory already exists
      }
      fs.writeFileSync(path.resolve(repoDir, vars.LATEST_DIR, 'index.html'), outHtml);

      vars.LATEST_ASSETS = vars.LATEST_DIR;
      commitAndPush();
    }
  }

  var numFilesChanged;
  function commitAndPush() {
    console.log('Commit and push');
    var execStatement = 'git ls-files -m -o | wc -l';
    console.log(execStatement);
    childProcess.exec(execStatement, {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log('NUM_FILES_CHANGED', stdout);
      if (err) {
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
  }

  function commitAndPushImpl() {
    if (numFilesChanged < 1) {
      console.log('Documentation unchanged, no need to publish');
      cleanUp();
      return;
    }
    console.log('Publishing changes to documentation');
    childProcess.execFile(path.join(__dirname, 'commit-and-push.sh'), [], {
      cwd: repoDir,
      env: vars,
    }, function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      if (err) {
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
      var execStatement = 'rm -rf "'+repoDir+'"';
      console.log(execStatement);
      childProcess.exec(path.join(execStatement), {
        cwd: projectDir,
        env: vars,
      }, function(err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) {
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
  }

  function allComplete() {
    outputUrls(context, callback);
    process.nextTick(function() {
      callback(undefined, context);
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
  var envVar = context.configVariables;

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

module.exports = {
  init: environmentVariablesGithub,
  run: publishGithubPages,
};

