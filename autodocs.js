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
    throw new Error('Expected callback function');
  }
  try {
    context = context || {};

    context.environmentVariables = require('./environment-variables');

    runAutodocsImpl(context, callback);
  }
  catch (ex) {
    callback(ex);
    throw ex;
  }
}

function runAutodocsImpl(context, callback) {
  var envVar = context.environmentVariables;

  /**
   * @property SELECT_CI
   * @type String (Environment Variable)
   * @default 'travis'
   */
  var ciName = envVar.default('SELECT_CI', 'travis');
  /**
   * @property SELECT_PUBLISH
   * @type String (Environment Variable)
   * @default 'github-pages'
   */
  var publishName = envVar.default('SELECT_PUBLISH', 'github-pages');
  var ci = require('./ci/'+ciName);
  var publish = require('./publish/'+publishName);
  ci.init(context, callback);
  publish.init(context, callback);
  environmentVariablesAutodocs(context, callback);
  if (ci.shouldRun(context, callback)) {
    console.log('This build will generate new documentation');
    publish.run(context, callback);
  }
  else {
    console.log('This build does not need to generate new documentation');
    callback();
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
  var envVar = context.environmentVariables;

  var projectPath = path.resolve('.');
  console.log('projectPath', projectPath);
  var projectPackageJson = require(path.resolve(projectPath, 'package.json'));
  var projectVersion = projectPackageJson.version;

  /**
   * @property PROJECT_DIR
   * @type String (Environment Variable)
   * @default The current working directory
   * @readOnly
   */
  process.env.PROJECT_DIR = projectPath;
  var projectVersionTokens = projectVersion.split('.');

  /**
   * @property MAJOR_VERSION
   * @type String (Environment Variable)
   * @default The major version read in from package.json
   * @readOnly
   */
  process.env.MAJOR_VERSION = projectVersionTokens[0];

  /**
   * @property MINOR_VERSION
   * @type String (Environment Variable)
   * @default The minor version read in from package.json
   * @readOnly
   */
  process.env.MINOR_VERSION = projectVersionTokens[1];

  /**
   * @property PATCH_VERSION
   * @type String (Environment Variable)
   * @default The patch version read in from package.json
   * @readOnly
   */
  process.env.PATCH_VERSION = projectVersionTokens.slice(2).join('.');

  /**
   * @property GIT_USER
   * @type String (Environment Variable)
   * @default 'autodocs Git User'
   */
  envVar.default('GIT_USER', 'autodocs Git User');

  /**
   * @property GIT_EMAIL
   * @type String (Environment Variable)
   * @default 'autodocs-git-user@bguiz.com'
   */
  envVar.default('GIT_EMAIL', 'autodocs-git-user@bguiz.com');


  /**
   * @property FLAG_COPY_ASSETS
   * @type String (Environment Variable)
   * @default 'false'
   */
  envVar.default('FLAG_COPY_ASSETS', 'false');

  /**
   * @property FLAG_PUBLISH_ON_RELEASE
   * @type String (Environment Variable)
   * @default 'false'
   */
  envVar.default('FLAG_PUBLISH_ON_RELEASE', 'false');

  /**
   * @property FLAG_CLEAN_DOCUMENT
   * @type String (Environment Variable)
   * @default 'false'
   */
  envVar.default('FLAG_CLEAN_DOCUMENT', 'false');

  /**
   * @property FLAG_STRIP_TOKEN_OUTPUT
   * @type String (Environment Variable)
   * @default 'true'
   */
  envVar.default('FLAG_STRIP_TOKEN_OUTPUT', 'true');


  /**
   * By default, this will publish a latest pages,
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
  envVar.default('FLAG_LATEST_PAGE', 'true');

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
  envVar.default('FLAG_SKIP_PUSH', 'false');

  /**
   * @property DOCUMENT_BRANCH
   * @type String (Environment Variable)
   * @default 'master'
   */
  envVar.default('DOCUMENT_BRANCH', 'master');

  /**
   * @property DOCUMENT_JOB_INDEX
   * @type String (Environment Variable)
   * @default '1'
   */
  envVar.default('DOCUMENT_JOB_INDEX', '1');

  /**
   * @property DOCUMENT_GENERATED_FOLDER
   * @type String (Environment Variable)
   * @default 'documentation'
   */
  envVar.default('DOCUMENT_GENERATED_FOLDER', 'documentation');

  /**
   * All documentation will be published under this root directory
   *
   * This can be used for **non-version-specific** documentation
   *
   * @property DOCUMENT_PUBLISH_FOLDER_ROOT
   * @type String (Environment Variable)
   * @default 'api'
   */
  envVar.default('DOCUMENT_PUBLISH_FOLDER_ROOT', 'api');

  /**
   * The documentation will be published in this subdirectory of the root directory.
   *
   * This can be used for **version-specific** documentation
   *
   * @property DOCUMENT_PUBLISH_SUBFOLDER
   * @type String (Environment Variable)
   * @default '{{MAJOR_VERSION}}.{{MINOR_VERSION}}'
   */
  envVar.default('DOCUMENT_PUBLISH_SUBFOLDER', '{{MAJOR_VERSION}}.{{MINOR_VERSION}}');


  /**
   * Joins `DOCUMENT_PUBLISH_FOLDER_ROOT` with `DOCUMENT_PUBLISH_SUBFOLDER`
   * to get a concrete path to publish the documentation.
   *
   * @property DOCUMENT_PUBLISH_FOLDER
   * @type String (Environment Variable)
   * @default '{{DOCUMENT_PUBLISH_FOLDER_ROOT}}/{{DOCUMENT_PUBLISH_SUBFOLDER}}'
   */
  envVar.default('DOCUMENT_PUBLISH_FOLDER', '{{DOCUMENT_PUBLISH_FOLDER_ROOT}}/{{DOCUMENT_PUBLISH_SUBFOLDER}}');

  /**
   * @property DOCUMENT_ASSETS
   * @type String (Environment Variable)
   * @default ''
   */
  envVar.default('DOCUMENT_ASSETS', '');

  envVar.default('FLAG_TESTING', 'false');

  [
    'DOCUMENT_PUBLISH_FOLDER_ROOT',
    'DOCUMENT_PUBLISH_SUBFOLDER',
    'DOCUMENT_PUBLISH_FOLDER'
  ].forEach(envVar.substitute);
}

module.exports = {
  init: environmentVariablesAutodocs,
  run: runAutodocs,
};
