#!/bin/bash
# Publish documents back to git repository as part of continuous integration
# Assumes that documents have already been built

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Generate the documentation
npm run document

# Publish documentation to gh-pages
# Set up new git repo in documentation folder, and use gh-pages branch
cd documentation
git init
git config user.name "${GIT_USER}"
git config user.email "${GIT_EMAIL}"
git remote add upstream "https://${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"
git fetch upstream gh-pages
git reset upstream/gh-pages

# Add any files needed manually
#echo "${GH_USER}.github.io/" > CNAME
touch .

# Test if there are any changes
NUM_FILES_CHANGED=$( git ls-files -m | wc -l )
if test "${NUM_FILES_CHANGED}" -gt "0" ; then

  # Commit and push
  git add -A .
  COMMIT_ID=$( git rev-parse --short HEAD )
  TIME_STAMP=$( date +%Y-%m-%d:%H:%M:%S )
  COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
  echo "${COMMIT_MESSAGE}"
  git commit -m "${COMMIT_MESSAGE}"
  # discard all output, because it contains the github access token
  git push --quiet upstream HEAD:gh-pages > /dev/null 2>&1
  echo "Successfully pushed documentation to gh-pages"

else

  echo "Documentation unchanged, no need to publish"

fi
