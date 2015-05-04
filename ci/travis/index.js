'use strict';

/**
 * @class  CiTravis
 * @module  AutodocsCi
 */

/**
 * Initialisation step for Travis
 *
 * Used to check/ set any Travis environment variables
 *
 * @method init
 * @for  CiTravis
 */
function environmentVariablesTravis(context, callback) {
  var configVars = context.configVariables;

  /**
   * Used to set value of `REPO_SLUG`
   *
   * @property TRAVIS_REPO_SLUG
   * @type String (Environment Variable)
   * @default None - throws when not set
   * @readOnly
   */
  configVars.require('TRAVIS_REPO_SLUG');

  /**
   * The repository to publish documentation to.
   * Override if you wish to publish to a different repository.
   *
   * @property REPO_SLUG
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.default('REPO_SLUG', context.vars.TRAVIS_REPO_SLUG);

  /**
   * Whether this is a pull request.
   *
   * @property TRAVIS_PULL_REQUEST
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.require('TRAVIS_PULL_REQUEST');

  /**
   * The name of the current branch
   *
   * @property TRAVIS_BRANCH
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.require('TRAVIS_BRANCH');

  /**
   * The build number, e.g. `74`
   *
   * @property TRAVIS_BUILD_NUMBER
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.require('TRAVIS_BUILD_NUMBER');

  /**
   * The job number, e.g. `74.1`
   *
   * @property TRAVIS_JOB_NUMBER
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  configVars.require('TRAVIS_JOB_NUMBER');
}

/**
 * Based on the Travis environment variables,
 * determines whether to trigger generation and publishing of documentation.
 *
 * If `FLAG_PUBLISH_ON_RELEASE` is `true`,
 * then will trigger if Travis says that a tag was pushed.
 *
 * Otherwise, it will trigger when a branch is pushed,
 * if Travis says that this **is not** a pull request,
 * and the branch being pushed matches `DOCUMENT_BRANCH`.
 *
 * Both cases also require that the correct build index for the current job
 * matches `DOCUMENT_JOB_INDEX`.
 * This is to ensure that documentation is only published once per successful build.
 *
 * @method shouldRun
 * @return {Boolean} `true` when documentation should be generated and published
 */
function testShouldPublishTravis(context, callback) {
  var configVars = context.configVariables;

  var correctBuildIndex =
    ((context.vars.TRAVIS_BUILD_NUMBER+'.'+context.vars.DOCUMENT_JOB_INDEX) ===
      context.vars.TRAVIS_JOB_NUMBER);
  var out = {
    flag: true,
    message: undefined,
  };
  if (context.vars.FLAG_PUBLISH_ON_RELEASE === 'true') {
    out.message = 'Publish on release';
    /**
     * @property TRAVIS_TAG
     * @type String (Environment Variable)
     * @default None
     */
    if (!configVars.exists('TRAVIS_TAG')) {
      out.flag = false;
      out.message += '\n- travis tag exists failure';
    }
  }
  else {
    out.message = 'Publish on branch';
    if (context.vars.TRAVIS_PULL_REQUEST !== 'false') {
      out.flag = false;
      out.message += '\n- is not a pull request failure';
    }
    if (context.vars.TRAVIS_BRANCH !== context.vars.DOCUMENT_BRANCH) {
      out.flag = false;
      out.message += '\n- branch name match failure';
    }
  }
  if (!correctBuildIndex) {
    out.flag = false;
    out.message += '\n- job index match failure';
  }
  return out;
}

module.exports = {
  init: environmentVariablesTravis,
  shouldRun: testShouldPublishTravis,
};
