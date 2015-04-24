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
  var envVar = context.environmentVariables;

  /**
   * Used to set value of `REPO_SLUG`
   *
   * @property TRAVIS_REPO_SLUG
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('TRAVIS_REPO_SLUG');
  process.env.REPO_SLUG = process.env.TRAVIS_REPO_SLUG;

  /**
   * @property TRAVIS_PULL_REQUEST
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('TRAVIS_PULL_REQUEST');

  /**
   * @property TRAVIS_BRANCH
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('TRAVIS_BRANCH');

  /**
   * @property TRAVIS_BUILD_NUMBER
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('TRAVIS_BUILD_NUMBER');

  /**
   * @property TRAVIS_JOB_NUMBER
   * @type String (Environment Variable)
   * @default None - throws when not set
   */
  envVar.require('TRAVIS_JOB_NUMBER');
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
  var envVar = context.environmentVariables;

  var correctBuildIndex =
    (process.env.TRAVIS_BUILD_NUMBER+'.'+process.env.DOCUMENT_JOB_INDEX ===
      process.env.TRAVIS_JOB_NUMBER);
  if (!correctBuildIndex) {
    return false;
  }
  else if (process.env.FLAG_PUBLISH_ON_RELEASE === 'true') {
    /**
     * @property TRAVIS_TAG
     * @type String (Environment Variable)
     * @default None
     */
    return (envVar.exists('TRAVIS_TAG'));
  }
  else {
    return (
      process.env.TRAVIS_PULL_REQUEST === 'false' &&
      process.env.TRAVIS_BRANCH === process.env.DOCUMENT_BRANCH);
  }
}

module.exports = {
  init: environmentVariablesTravis,
  shouldRun: testShouldPublishTravis,
};
