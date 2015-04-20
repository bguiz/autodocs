# `autodocs-ghpages`

Automates publishing API docs for NodeJs projects, useful for continuous integration.

## Installation

Install this tool as a `devDependency` in your NodeJs project,
and add a `autodocs` script to your project's `package.json`.

This tool is agnostic to your choice of tool used to generate documentation,
and it will execute `npm run generatedocs`,
so be sure to add that to your projects's `package.json` as well.

For example, if you are using this project to publish documentation
generated by `yuidocjs`, you would run:

```bash
npm install --save-dev yuidocjs autodocs
```

... and then add the following the `scripts` section of `package.json`:

```json
"scripts": {
  "generatedocs": "node ./node_modules/yuidocjs/lib/cli .",
  "autodocs": "node ./node_modules/autodocs"
}
```

## Usage

Configure your CI environment to run the `autodocs` script
after the project has successfully built.
For example, if using Travis, add this to your `.travis.yml`

```yaml
after_success:
- npm run autodocs
```

In addition to this, publishing also needs a few environment variables to be set:

- `GH_TOKEN`
  - Must be set, use an encrypted token
  - `travis encrypt GH_TOKEN=GITHUB_ACCESS_TOKEN --add`
  - This is used to give Travis write access to your Git repository,
    and will be used to push to the `gh-pages` branch
- `GH_USER`
  - Optional, set to override
  - Default: Inferred from `TRAVIS_REPO_SLUG` set by Travis
  - Github user name
- `GH_REPO`
  - Optional, set to override
  - Default: Inferred from `TRAVIS_REPO_SLUG` set by Travis
  - Github repository name
- `GIT_USER`
  - Optional, set to override
  - Default: `Travis CI Git User`
  - Name to use when creating the Git commit
- `GIT_EMAIL`
  - Optional, set to override
  - Default: `autodocs-git-user@bguiz.com`
  - Email address to use when creating the Git commit
- `DOCUMENT_BRANCH`
  - Optional, set to override
  - `master`
  - Documentation will be generated only when this branch is pushed.
- `DOCUMENT_JOB_INDEX`
  - Optional, set to override
  - `1`
  - Documentation will be generated only on one of the jobs
    for each build, use this to specify which one.

Your Git repository can have many different branches being pushed,
but you only have one published documentation,
so for `DOCUMENT_BRANCH`, select the branch for which documentation should be published.
It makes the most sense to select the branch from which releases are cut.
If you are using either Git Flow or the standard Github branching strategies,
it makes the most sense to leave this as `master`.

## Published Result

If your project has built successfully on CI,
visit `http://GH_USER.github.io/GH_REPO/api/VERSION`.

For example: [bguiz.github.io/plugin-registry/api/0.2](http://bguiz.github.io/plugin-registry/api/0.2/)

The value of `VERSION` includes the major and minor versions only,
because semver (semantic versioning) principles state that
if there are any API changes, the major or minor version numbers should be bumped;
and conversly, that when a patch version number is bumped,
it implies that there have **not** been any API changes.

This is done so as to be able to provide references for multiple versions
of your projects at the same time,
which can be handy for users who are unable to upgrade,
and also for users determining what has changed from the version
they are currently using to the one they wish to switch to.

## Contributing

This repository uses the **git flow** branching strategy.
If you wish to contribute, please branch from the **develop** branch -
pull requests will only be requested if they request merging into the develop branch.

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

## Licence

GPLv3
