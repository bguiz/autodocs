#!/bin/bash
# Publish documents back to git repository as part of continuous integration
# Assumes that documents have already been built

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Generate the documentation
npm run generatedocs

# Publish documentation to gh-pages

# Set up vars
TIME_STAMP=$( date +%Y-%m-%d-%H-%M-%S )
GHPAGES_DIR="${PROJECT_DIR}/autodocs/ghpages-${TIME_STAMP}"
GENERATED_DIR="${PROJECT_DIR}/${DOCUMENT_GENERATED_FOLDER}"
REPO_URL_AUTH="https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"
REPO_URL_UNAUTH="https://github.com/${GH_USER}/${GH_REPO}"

# Git repo init and update gh-pages branch
rm -rf "${GHPAGES_DIR}"
mkdir -p "${GHPAGES_DIR}"
cd "${GHPAGES_DIR}"
git init
git config user.name "${GIT_USER}"
git config user.email "${GIT_EMAIL}"
git remote add upstream "${REPO_URL_AUTH}"

# Detect if this repo has a gh-pages branch
NUM_GHPAGES_BRANCHES=$( git ls-remote --heads ${REPO_URL_UNAUTH} | grep 'refs\/heads\/gh-pages' | wc -l )
if test "${NUM_GHPAGES_BRANCHES}" == "0" ; then
  # Create a new gh-pages branch otherwise
  git checkout --orphan gh-pages
else
  # Fetch the existing gh-pages branch where it exists
  git fetch upstream gh-pages
  git checkout gh-pages
fi

#NOTE The var `DOCUMENT_PUBLISH_FOLDER` is processed and is based on other vars
# It defaults to `api/${MAJOR_VERSION}.${MINOR_VERSION}`
DOC_PUBLISH_ROOT_DIR="${GHPAGES_DIR}/${DOCUMENT_PUBLISH_FOLDER_ROOT}"
DOC_PUBLISH_DIR="${GHPAGES_DIR}/${DOCUMENT_PUBLISH_FOLDER}"
mkdir -p "${DOC_PUBLISH_DIR}"
rm -rf ${DOC_PUBLISH_DIR}/*
cp -r ${GENERATED_DIR}/* "${DOC_PUBLISH_DIR}"

# Specify a set of folders/ files to copy across to the root folder
if test "${FLAG_COPY_ASSETS}" == "true" ; then
  echo "Copying assets: ${DOCUMENT_ASSETS}"
  cd "${PROJECT_DIR}"
  # Use tar and pipe to untar to preserve directory structure
  # because `cp -r` does not do this well.
  # A viable alternative is to use `rsync`, for future reference
  tar cf - ${DOCUMENT_ASSETS} | ( cd "${GHPAGES_DIR}" ; tar xf - )
  cd "${GHPAGES_DIR}"
else
  echo "Not copying assets"
  DOCUMENT_ASSETS=""
fi
touch "${DOC_PUBLISH_ROOT_DIR}"
touch "${DOC_PUBLISH_DIR}"

# TODO generate an index page to list all available API documentation versions
# TODO alias "latest" or "current" to the one currently being generated
if test "${FLAG_LATEST_PAGE}" == "true" ; then
  echo "Generating 'latest' page"
  LATEST_REDIRECTREPLACE="{{REDIRECTURL}}"
  # LATEST_REDIRECTREPLACE="{{REDIRECTURL}}"
  LATEST_REDIRECTURL="\.\.\/${DOCUMENT_PUBLISH_SUBFOLDER//./\\.}"
  SED_REDIRECT="s/${LATEST_REDIRECTREPLACE}/${LATEST_REDIRECTURL}/g"
  echo SED_REDIRECT=${SED_REDIRECT}
  LATEST_DIR="${DOCUMENT_PUBLISH_FOLDER_ROOT}/latest"
  mkdir -p "${LATEST_DIR}"
  { cat "${SCRIPT_DIR}/github-pages-latest.html" | sed "s/${LATEST_REDIRECTREPLACE}/${LATEST_REDIRECTURL}/g" ; } > "${LATEST_DIR}/index.html"
  LATEST_ASSETS="${LATEST_DIR}"
else
  LATEST_ASSETS=""
fi
# s/\{\{REDIRECTURL\}\}/0.4/g
# Test if there are any changes
NUM_FILES_CHANGED=$( git ls-files -m -o | wc -l )
if test "${NUM_FILES_CHANGED}" -gt "0" ; then

  # Commit and push
  git add -A "${DOC_PUBLISH_DIR}" ${DOCUMENT_ASSETS} ${LATEST_DIR}
  COMMIT_ID=$( git rev-parse --short HEAD )
  COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
  echo "${COMMIT_MESSAGE}"
  git commit -m "${COMMIT_MESSAGE}"
  if test "${FLAG_SKIP_PUSH}" == "true" ;  then
    echo "Skipping push to github pages"
  else
    # discard all output, because it contains the github access token
    # unless, opted out, using `FLAG_QUIET_PUSH`
    if test "${FLAG_STRIP_TOKEN_OUTPUT}" == "false" ; then
      # Show output, unmodified.
      # This should *not* be done in CI, only for local testing
      git push upstream HEAD:gh-pages
    else
      # Use `sed` to replace any instances of the Github token in both stdout and stderr
      SED_STRIP_TOKEN="s/${GH_TOKEN}/\[SECURE\]/g"
      { git push upstream HEAD:gh-pages 2>&1 >&3 | sed ${SED_STRIP_TOKEN} ; } 3>&1
    fi
    echo "Successfully pushed documentation to gh-pages"
  fi

else

  echo "Documentation unchanged, no need to publish"

fi

if "${FLAG_CLEAN_DOCUMENT}" == "true" ; then
  echo "Cleaning up git repo at ${GHPAGES_DIR}"
  rm -rf "${GHPAGES_DIR}"
fi
