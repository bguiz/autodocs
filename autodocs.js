'use strict';

var path = require('path');

var envVar = require('./environment-variables');

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
function runAutodocs() {
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
  ci.init();
  publish.init();
  environmentVariablesAutodocs();
  if (ci.shouldRun()) {
    console.log('This build will generate new documentation');
    publish.run();
  }
  else {
    console.log('This build does not need to generate new documentation');
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
function environmentVariablesAutodocs() {
  var projectPath = path.resolve('.');
  console.log('projectPath', projectPath);
  var projectPackageJson = require(path.resolve(projectPath, 'package.json'));
  var projectVersion = projectPackageJson.version;
  process.env.PROJECT_DIR = projectPath;
  process.env.MAJOR_MINOR_PATCH_VERSION = projectVersion;
  var projectVersionTokens = projectVersion.split('.');
  process.env.MAJOR_VERSION = projectVersionTokens[0];
  process.env.MINOR_VERSION = projectVersionTokens[1];
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
   * @property DOCUMENT_PUBLISH_FOLDER
   * @type String (Environment Variable)
   * @default 'api/{{MAJOR_VERSION}}.{{MINOR_VERSION}}'
   */
  envVar.default('DOCUMENT_PUBLISH_FOLDER', 'api/{{MAJOR_VERSION}}.{{MINOR_VERSION}}');

  /**
   * @property DOCUMENT_ASSETS
   * @type String (Environment Variable)
   * @default ''
   */
  envVar.default('DOCUMENT_ASSETS', '');

  [
    'DOCUMENT_PUBLISH_FOLDER'
  ].forEach(envVar.substitute);
}

module.exports = {
  init: environmentVariablesAutodocs,
  run: runAutodocs,
};
