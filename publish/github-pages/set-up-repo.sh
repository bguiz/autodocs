#!/bin/bash

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Git repo init
rm -rf "${GHPAGES_DIR}"
mkdir -p "${GHPAGES_DIR}"
cd "${GHPAGES_DIR}"
git init
git config user.name "${GIT_USER}"
git config user.email "${GIT_EMAIL}"
git remote add upstream "${REPO_URL_AUTH}"
