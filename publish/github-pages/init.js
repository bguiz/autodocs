/*@flow*/
'use strict';

module.exports = initGithubPages;

/**
 * Initialisation step for Github Pages
 *
 * Used to check/ set any Github Pages environment variables
 *
 * @method  init
 * @for  PublishGithubPages
 */
function initGithubPages(context/*: Object*/, callback/*: Function*/) {
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
