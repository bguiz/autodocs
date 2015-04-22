#!/bin/bash
# Publish documents back to git repository as part of continuous integration
# Assumes that documents have already been built

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Generate the documentation
npm run generatedocs

# Publish documentation to gh-pages

# Git repo init and update gh-pages branch
TIME_STAMP=$( date +%Y-%m-%d-%H-%M-%S )
GHPAGES_DIR="${PROJECT_DIR}/autodocs/ghpages-${TIME_STAMP}"
GENERATED_DIR="${PROJECT_DIR}/${DOCUMENT_GENERATED_FOLDER}"
mkdir -p "${GHPAGES_DIR}"
cd "${GHPAGES_DIR}"
git init
git config user.name "${GIT_USER}"
git config user.email "${GIT_EMAIL}"
git remote add upstream "https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"

# TODO check if gh-pages branch exists, otherwise create on first
git fetch upstream gh-pages
git checkout gh-pages
COMMIT_ID=$( git rev-parse --short HEAD )
#NOTE The var `DOCUMENT_PUBLISH_FOLDER` is processed and is based on other vars
# It defaults to `api/${MAJOR_VERSION}.${MINOR_VERSION}`
DOC_PUBLISH_DIR="${GHPAGES_DIR}/${DOCUMENT_PUBLISH_FOLDER}"
mkdir -p "${DOC_PUBLISH_DIR}"
rm -rf ${DOC_PUBLISH_DIR}/*
cp -r ${GENERATED_DIR}/* "${DOC_PUBLISH_DIR}"

# Specify a folders/ files to copy across to the root folder
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
touch "${DOC_PUBLISH_DIR}"

# TODO generate an index page to list all available API documentation versions
# TODO alias "latest" or "current" to the one currently being generated

# Test if there are any changes
NUM_FILES_CHANGED=$( git ls-files -m -o | wc -l )
if test "${NUM_FILES_CHANGED}" -gt "0" ; then

  # Commit and push
  git add -A "${DOC_PUBLISH_DIR}" ${DOCUMENT_ASSETS}
  COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
  echo "${COMMIT_MESSAGE}"
  git commit -m "${COMMIT_MESSAGE}"
  # discard all output, because it contains the github access token
  # unless, opted out, using `FLAG_QUIET_PUSH`
  if test "${FLAG_QUIET_PUSH}" == "false" ; then
    git push upstream HEAD:gh-pages
  else
    git push --quiet upstream HEAD:gh-pages > /dev/null 2>&1
  fi
  echo "Successfully pushed documentation to gh-pages"

else

  echo "Documentation unchanged, no need to publish"

fi

if "${FLAG_CLEAN_DOCUMENT}" == "true" ; then
  echo "Cleaning up git repo at ${GHPAGES_DIR}"
  rm -rf "${GHPAGES_DIR}"
fi
