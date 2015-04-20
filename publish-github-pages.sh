#!/bin/bash
# Publish documents back to git repository as part of continuous integration
# Assumes that documents have already been built

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Generate the documentation
npm run generatedocs

# Publish documentation to gh-pages

TIME_STAMP=$( date +%Y-%m-%d:%H:%M:%S )
GHPAGES_DIR="${PROJECT_DIR}/autodocs/ghpages-${TIME_STAMP}"
GENERATED_DIR="${PROJECT_DIR}/documentation"
mkdir -p "${GHPAGES_DIR}"
cd "${GHPAGES_DIR}"
git init
git remote add upstream "https://${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"
git fetch upstream gh-pages
git checkout gh-pages
COMMIT_ID=$( git rev-parse --short HEAD )
API_VERSION_DIR="${GHPAGES_DIR}/api/${MAJOR_MINOR_VERSION}"
mkdir -p "${API_VERSION_DIR}"
cp -r "${GENERATED_DIR}" "${API_VERSION_DIR}"

# TODO specify a folder for files to copy across manually
touch "${API_VERSION_DIR}"

# TODO generate an index page to list all available API documentation versions
# TODO alias "latest" or "current" to the one currently being generated

# Test if there are any changes
NUM_FILES_CHANGED=$( git ls-files -m -o | wc -l )
if test "${NUM_FILES_CHANGED}" -gt "0" ; then

  # Commit and push
  git add -A "${API_VERSION_DIR}"
  COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
  echo "${COMMIT_MESSAGE}"
  git commit -m "${COMMIT_MESSAGE}"
  # discard all output, because it contains the github access token
  git push --quiet upstream HEAD:gh-pages > /dev/null 2>&1
  echo "Successfully pushed documentation to gh-pages"

else

  echo "Documentation unchanged, no need to publish"

fi
