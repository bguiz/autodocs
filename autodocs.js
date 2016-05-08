'use strict';

var path = require('path');

/**
 * @module  Autodocs
 */

/**
 * @class  Autodocs
 * @module  Autodocs
 */

/**
 * Will determine which continuous integration environment and publishing environment to use,
 * and then run those appropriately.
 *
 * Currently, the supported ones are:
 *
 * - Continuous Integration (`SELECT_CI`):
 *   - `travis`
 * - Publishing Environment (`SELECT_PUBLISH`):
 *   - `github-pages`
 *
 * Runs various environment variables checks and sets defaults where appropriate.
 * Then tests whether this particular build should trigger publishing the documentation,
 * and if so fires the publish script
 *
 * @method run
 * @for  Autodocs
 */
function runAutodocs(context, callback) {
  if (typeof callback !== 'function') {
    callback = function defaultAutodocsRunCallback(err) {
      if (err) {
        console.log('autodocs error:', err);
      }
      else {
        console.log('autodocs done');
      }
    };
  }
  try {
    context = context || {};

    // Set up context variables with whatever was passed in,
    // but override with any environment variables
    context.vars = context.vars || {};
    for (var varName in process.env) {
      if (process.env.hasOwnProperty(varName)) {
        context.vars[varName] = process.env[varName];
      }
    }

    context.configVariables = require('./config-variables')(context.vars);

    runAutodocsImpl(context, callback);
  }
  catch (ex) {
    if (!!ex) {
      throw ex;
    }
    else {
      callback(ex);
    }
  }
}

function runAutodocsImpl(context, callback) {
  var configVars = context.configVariables;

  /**
   * @property SELECT_CI
   * @type String (Environment Variable)
   * @default 'travis'
   */
  var ciName = configVars.default('SELECT_CI', 'travis');

  /**
   * @property SELECT_PUBLISH
   * @type String (Environment Variable)
   * @default 'github-pages'
   */
  var publishName = configVars.default('SELECT_PUBLISH', 'github-pages');
  var ci = require('./ci/'+ciName);
  var publish = require('./publish/'+publishName);
  ci.init(context, callback);
  publish.init(context, callback);
  environmentVariablesAutodocs(context, callback);
  var shouldRun = ci.shouldRun(context, callback);
  if (!!shouldRun.flag) {
    console.log('This build will generate new documentation');
    console.log(shouldRun.message);
    publish.run(context, callback);
  }
  else {
    console.log('This build does not need to generate new documentation');
    console.log('Reason:', shouldRun.message);
    callback(undefined, shouldRun.message);
  }
}

/**
 * Initialisation step for Autodocs
 *
 * Used to check/ set any Autodocs environment variables
 *
 * @method init
 * @for  Autodocs
 */
function environmentVariablesAutodocs(context, callback) {
  var configVars = context.configVariables;

  var projectPath = path.resolve('.');
  var projectPackageJson = require(path.resolve(projectPath, 'package.json'));
  var projectVersion = projectPackageJson.version;
  var projectName = projectPackageJson.name;

  context.vars.PROJECT_NAME = projectName;

  /**
   * The directory that the project being published ios located in.
   *
   * @property PROJECT_DIR
   * @type String (Environment Variable)
   * @default The current working directory
   * @readOnly
   */
  context.vars.PROJECT_DIR = projectPath;

  var projectVersionTokens = projectVersion.split('.');

  /**
   * The major version of the project.
   *
   * `1.2.3` --> `1`
   *
   * @property MAJOR_VERSION
   * @type String (Environment Variable)
   * @default The major version read in from package.json
   * @readOnly
   */
  context.vars.MAJOR_VERSION = projectVersionTokens[0];

  /**
   * The minor version of the project
   *
   * `1.2.3` --> `2`
   *
   * @property MINOR_VERSION
   * @type String (Environment Variable)
   * @default The minor version read in from package.json
   * @readOnly
   */
  context.vars.MINOR_VERSION = projectVersionTokens[1];

  /**
   * The patch version of the project
   *
   * `1.2.3` --> `3`
   *
   * @property PATCH_VERSION
   * @type String (Environment Variable)
   * @default The patch version read in from package.json
   * @readOnly
   */
  context.vars.PATCH_VERSION = projectVersionTokens.slice(2).join('.');

  /**
   * Name to use when creating the Git commit
   *
   * @property GIT_USER
   * @type String (Environment Variable)
   * @default 'autodocs Git User'
   */
  configVars.default('GIT_USER', 'autodocs Git User');

  /**
   * Email address to use when creating the Git commit
   *
   * @property GIT_EMAIL
   * @type String (Environment Variable)
   * @default 'autodocs-git-user@bguiz.com'
   */
  configVars.default('GIT_EMAIL', 'autodocs-git-user@bguiz.com');


  /**
   * Whether there are any assets to copy.
   * Set to `true` **only if** intending to use `DOCUMENT_ASSETS`.
   *
   * @property FLAG_COPY_ASSETS
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_COPY_ASSETS', 'false');

  /**
   * By default, publish will occur when a branch is pushed.
   *
   * When this flag is set to `true`,
   * publish will occur when a tag is pushed instead.
   *
   * @property FLAG_PUBLISH_ON_RELEASE
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_PUBLISH_ON_RELEASE', 'false');

  /**
   * Whether to clean up afterward, by deleting the directory that was published
   *
   * @property FLAG_CLEAN_DOCUMENT
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_CLEAN_DOCUMENT', 'false');

  /**
   * Any tokens contained in the build output will be stripped out
   * before being printed.
   * This is to ensure security,
   * especially if your CI's build logs are publicly available
   *
   * @property FLAG_STRIP_TOKEN_OUTPUT
   * @type String (Environment Variable)
   * @default 'true'
   */
  configVars.default('FLAG_STRIP_TOKEN_OUTPUT', 'true');

  /**
   * By default, this will publish a latest page,
   * whose purpose is simply to redirect to the most recently publish API version
   *
   * Assuming default values for other configurations,
   * if the version of the project is currently `1.2.3`,
   *
   * - `http://USER.github.io/REPO/api/latest/`
   * - This URL will be published with an `index.html` file that redirects to:
   * - `http://USER.github.io/REPO/api/1.2/`
   *
   * Set to `false` to disable this behaviour.
   *
   * @property FLAG_LATEST_PAGE
   * @type String (Environment Variable)
   * @default 'true'
   */
  configVars.default('FLAG_LATEST_PAGE', 'true');

  /**
   * By default, this will publish an all page,
   * whose purpose is simply to list and link to all published API versions
   *
   * Assuming default values for other configurations,
   * if the versions of the project are currently `0.1`, `0.2`, `0.3`, and `1.0`
   *
   * - `http://USER.github.io/REPO/api/all/`
   * - This URL will be published with an `index.html` file that links to:
   *   - `http://USER.github.io/REPO/api/0.1/`
   *   - `http://USER.github.io/REPO/api/0.2/`
   *   - `http://USER.github.io/REPO/api/0.3/`
   *   - `http://USER.github.io/REPO/api/1.0/`
   *
   * Set to `false` to disable this behaviour.
   *
   * @property FLAG_ALL_PAGE
   * @type String (Environment Variable)
   * @default 'true'
   */
  configVars.default('FLAG_ALL_PAGE', 'true');

  /**
   * Set to false to do all of the steps in publishing,
   * except for the final step of pushing the changes to the git remote.
   *
   * This is useful for testing and debugging purposes.
   * Leaving this on in a CI environment would defeat the purpose of autodocs
   *
   * @property FLAG_SKIP_PUSH
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_SKIP_PUSH', 'false');

  /**
   * Set to true to skip step where documentation is generated. i.e. Do not run
   *
   * `npm run generatedocs`
   *
   * This is useful for testing and debugging purposes.
   * Leaving this on in a CI environment would defeat the purpose of autodocs
   *
   * @property FLAG_SKIP_GENERATE
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_SKIP_GENERATE', 'false');

  /**
   * Set to true to skip step where documentation is tested.
   * i.e. Do not run tests
   *
   * `npm run testdocs`
   *
   * This is useful when the generate command executes
   * its own tests
   *
   * @property FLAG_SKIP_TEST
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_SKIP_TEST', 'false');

  /**
   * Set to true to skips the entirety of the CI publish run function.
   * **None** of the publishing related step will occur,
   * except for setting any required environment variables.
   *
   * This is useful for testing and debugging purposes.
   * Leaving this on in a CI environment would defeat the purpose of autodocs
   *
   * @property FLAG_SKIP_PUBLISH_RUN
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_SKIP_PUBLISH_RUN', 'false');

  /**
   * Documentation will be generated only when this **branch** is pushed
   *
   * @property DOCUMENT_BRANCH
   * @type String (Environment Variable)
   * @default 'master'
   */
  configVars.default('DOCUMENT_BRANCH', 'master');

  /**
   * Documentation will be generated only on one of the jobs
   * for each build, use this to specify which one.
   *
   * @property DOCUMENT_JOB_INDEX
   * @type String (Environment Variable)
   * @default '1'
   */
  configVars.default('DOCUMENT_JOB_INDEX', '1');

  /**
   * The name of the npm script to run,
   * expecting the documentation to get generated.
   * For example:
   *
   * `npm run ${DOCUMENT_GENERATE_HOOK}`
   *
   * @property DOCUMENT_GENERATE_HOOK
   * @type String (Environment Variable)
   * @default 'generatedocs'
   */
  configVars.default('DOCUMENT_GENERATE_HOOK', 'generatedocs');

  /**
   * The name of the npm script to run,
   * expecting the documentation to get tested.
   * For example:
   *
   * `npm run ${DOCUMENT_TEST_HOOK}`
   *
   * @property DOCUMENT_TEST_HOOK
   * @type String (Environment Variable)
   * @default 'testdocs'
   */
  configVars.default('DOCUMENT_TEST_HOOK', 'testdocs');

  /**
   * After the documentation generation script is run,
   * autodocs expects to find its output in this folder.
   * The files located here will get published.
   *
   * @property DOCUMENT_GENERATED_FOLDER
   * @type String (Environment Variable)
   * @default 'documentation'
   */
  configVars.default('DOCUMENT_GENERATED_FOLDER', 'documentation');

  /**
   * All documentation will be published under this root directory
   *
   * This can be used for **non-version-specific** documentation
   *
   * @property DOCUMENT_PUBLISH_FOLDER_ROOT
   * @type String (Environment Variable)
   * @default 'api'
   */
  configVars.default('DOCUMENT_PUBLISH_FOLDER_ROOT', 'api');

  /**
   * The documentation will be published in this subdirectory of the root directory.
   *
   * This can be used for **version-specific** documentation
   *
   * @property DOCUMENT_PUBLISH_SUBFOLDER
   * @type String (Environment Variable)
   * @default '{{MAJOR_VERSION}}.{{MINOR_VERSION}}'
   */
  configVars.default('DOCUMENT_PUBLISH_SUBFOLDER', '{{MAJOR_VERSION}}.{{MINOR_VERSION}}');

  /**
   * If set to `'true'` `DOCUMENT_PUBLISH_FOLDER` is ignored,
   * and the document is published in the root folder instead.
   *
   * If using this module to publish something like a blog,
   * instead of versioned software documentation,
   * you should set this flag to `true`.
   *
   * @property FLAG_PUBLISH_IN_ROOT
   * @type String (Environment Variable)
   * @default 'false'
   */
  configVars.default('FLAG_PUBLISH_IN_ROOT', 'false');

  var defaultPublishFolder;
  if (context.vars.FLAG_PUBLISH_IN_ROOT === 'true') {
    defaultPublishFolder = '';
  }
  else {
    defaultPublishFolder = '{{DOCUMENT_PUBLISH_FOLDER_ROOT}}/{{DOCUMENT_PUBLISH_SUBFOLDER}}';
  }

  /**
   * Joins `DOCUMENT_PUBLISH_FOLDER_ROOT` with `DOCUMENT_PUBLISH_SUBFOLDER`
   * to get a concrete path to publish the documentation.
   *
   * @property DOCUMENT_PUBLISH_FOLDER
   * @type String (Environment Variable)
   * @default '{{DOCUMENT_PUBLISH_FOLDER_ROOT}}/{{DOCUMENT_PUBLISH_SUBFOLDER}}'
   */
  configVars.default('DOCUMENT_PUBLISH_FOLDER', defaultPublishFolder);

  /**
   * list of files and folders (bash style) to copy into the root of the `gh-pages` branch
   * these files will be copied to the **root**, not the `DOCUMENT_PUBLISH_FOLDER`
   *
   * @property DOCUMENT_ASSETS
   * @type String (Environment Variable)
   * @default ''
   */
  configVars.default('DOCUMENT_ASSETS', '');

  configVars.default('FLAG_TESTING', 'false');

  [
    'DOCUMENT_PUBLISH_FOLDER_ROOT',
    'DOCUMENT_PUBLISH_SUBFOLDER',
    'DOCUMENT_PUBLISH_FOLDER'
  ].forEach(configVars.substitute);
}

module.exports = {
  init: environmentVariablesAutodocs,
  run: runAutodocs,
};
