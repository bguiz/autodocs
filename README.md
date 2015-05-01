# `autodocs`

Automates publishing API docs for NodeJs projects, useful for continuous integration.

[![NPM](https://nodei.co/npm/autodocs.png)](https://github.com/bguiz/autodocs/)

[![Build Status](https://travis-ci.org/bguiz/autodocs.svg?branch=master)](https://travis-ci.org/bguiz/autodocs)
[![Coverage Status](https://coveralls.io/repos/bguiz/autodocs/badge.svg?branch=master)](https://coveralls.io/r/bguiz/autodocs?branch=master)


## Installation

Install this tool as a `devDependency` in your NodeJs project,
and add a `autodocs` script to your project's `package.json`.

This tool is agnostic to your choice of tool used to generate documentation,
and it will execute `npm run generatedocs`,
so be sure to add that to your projects's `package.json` as well.

For example, if you are using this project to publish documentation
generated by `yuidocjs`, you would run:

```bash
npm install --save-dev autodocs yuidocjs
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

Remember that `autodocs` is responsible for running `generatedocs`
when it determines that it should.
There is **no need** to include `generatedocs` in your CI script -
**only** `autodocs` is necessary here.

## API

`autodocs` **generates its own documentation**.

The API that `autodocs` exposes is designed to be fully operable by means of
environment variables.
This is the case because that is what continuous integrations environments,
which is where `autodocs` should be getting invoked from most of the time,
use.

The [API documentation for `autodocs`](http://bguiz.github.io/autodocs/api/latest/)
documents the **full set** of options available.
The list below is **merely a subset** - just the most important ones.

In addition to this, publishing also needs a few environment variables to be set:

- `GH_TOKEN`
  - Use an encrypted Github access token
- `GH_USER`
  - Optional, set to override
  - Default: Inferred from `TRAVIS_REPO_SLUG` set by Travis
  - Github user name
- `GH_REPO`
  - Optional, set to override
  - Default: Inferred from `TRAVIS_REPO_SLUG` set by Travis
  - Github repository name
- `DOCUMENT_JOB_INDEX`
  - Optional, set to override
  - default: `1`
  - Documentation will be generated only on one of the jobs
    for each build, use this to specify which one.
- `DOCUMENT_GENERATED_FOLDER`:
  - default: `documentation`
  - to specify folder where documentation is generated
  - this represents the location of the **input** for `autodocs`,
    and it expects the files needed to be published to be here after running the `generatedocs` script
- `FLAG_COPY_ASSETS`
  - default: `false`
  - whether there are any assets to copy
  - set to `true` **only if** intending to use `DOCUMENT_ASSETS`
- `DOCUMENT_ASSETS`
  - default: ``
  - list of files and folders (bash style) to copy into the root of the `gh-pages` branch
  - these files will be copied to the **root**, not the `DOCUMENT_PUBLISH_FOLDER`

Your Git repository can have many different branches being pushed,
but you only have one published documentation,
so for `DOCUMENT_BRANCH`, select the branch for which documentation should be published.
It makes the most sense to select the branch from which releases are cut.
If you are using either Git Flow or the standard Github branching strategies,
it makes the most sense to leave this as `master`.

## Published Result

If your project has built successfully on CI,
and you have not overridden the default values for publish folder,
visit `http://GH_USER.github.io/GH_REPO/api/VERSION`.

For example: [bguiz.github.io/plugin-registry/api/0.6](http://bguiz.github.io/plugin-registry/api/latest/)

The value of `VERSION` includes the major and minor versions only,
because semver (semantic versioning) principles state that
if there are any API changes, the major or minor version numbers should be bumped;
and conversely, that when a patch version number is bumped,
it implies that there have **not** been any API changes.

This is done so as to be able to provide **references for multiple versions**
of your projects at the same time,
which can be handy for users who are unable to upgrade,
and also for users determining what has changed from the version
they are currently using to the one they wish to switch to.

This is just the **default behaviour**,
and **can be configured** to do something else via environment variables.
See the API documentation for the details.

## Contributing

This repository uses the **git flow** branching strategy.
If you wish to contribute, please branch from the **develop** branch -
pull requests will only be requested if they request merging into the develop branch.

When contributing see also the items described in the
[**roadmap**](https://github.com/bguiz/autodocs/labels/roadmap).

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

## Licence

GPLv3
