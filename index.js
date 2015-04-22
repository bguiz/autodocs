'use strict';

var path = require('path');

var envVar = require('./environment-variables');

/**
 * @module  Autodocs
 */

/**
 * @class  Autodocs
 */

autodocs();

/**
 * The main entry point.
 *
 * Will determine which continuous integration environment and publishing environment to use,
 * and then run those appropriately.
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
 * @method autodocs
 * @for  Autodocs
 */
function autodocs() {
  var ciName = envVar.default('SELECT_CI', 'travis');
  var publishName = envVar.default('SELECT_PUBLISH', 'github-pages');
  var ci = require('./ci/'+ciName);
  var publish = require('./publish/'+publishName);
  ci.init();
  publish.init();
  environmentVariablesCommon();
  if (ci.shouldRun()) {
    console.log('This build will generate new documentation');
    publish.run();
  }
  else {
    console.log('This build does not need to generate new documentation');
  }
}

function environmentVariablesCommon() {
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

  envVar.default('GIT_USER', 'autodocs Git User');
  envVar.default('GIT_EMAIL', 'autodocs-git-user@bguiz.com');

  envVar.default('FLAG_COPY_ASSETS', 'false');
  envVar.default('FLAG_PUBLISH_ON_RELEASE', 'false');
  envVar.default('FLAG_CLEAN_DOCUMENT', 'false');
  envVar.default('FLAG_STRIP_TOKEN_OUTPUT', 'true');

  envVar.default('DOCUMENT_BRANCH', 'master');
  envVar.default('DOCUMENT_JOB_INDEX', '1');
  envVar.default('DOCUMENT_GENERATED_FOLDER', 'documentation');
  envVar.default('DOCUMENT_PUBLISH_FOLDER', 'api/{{MAJOR_VERSION}}.{{MINOR_VERSION}}');
  envVar.default('DOCUMENT_ASSETS', '');

  //NOTE order of the values contained in the array matters -
  // the ones that run first should require the ones that run later to be fully resolved first
  // and of course, cycles will result in indeterminate results.
  [
    'DOCUMENT_PUBLISH_FOLDER'
  ].forEach(envVar.substitute);
}
