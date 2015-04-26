#!/bin/bash

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Set up vars
export COMMIT_ID=$( git rev-parse --short HEAD )
export TIME_STAMP=$( date +%Y-%m-%d-%H-%M-%S )
export GHPAGES_DIR="${PROJECT_DIR}/autodocs/ghpages-${TIME_STAMP}"
export GENERATED_DIR="${PROJECT_DIR}/${DOCUMENT_GENERATED_FOLDER}"
export REPO_URL_AUTH="https://${GH_USER}:${GH_TOKEN}@github.com/${GH_USER}/${GH_REPO}.git"
export REPO_URL_UNAUTH="https://github.com/${GH_USER}/${GH_REPO}"

#NOTE The var `DOCUMENT_PUBLISH_FOLDER` is processed and is based on other vars
# It defaults to `api/${MAJOR_VERSION}.${MINOR_VERSION}`
export DOC_PUBLISH_ROOT_DIR="${GHPAGES_DIR}/${DOCUMENT_PUBLISH_FOLDER_ROOT}"
export DOC_PUBLISH_DIR="${GHPAGES_DIR}/${DOCUMENT_PUBLISH_FOLDER}"

export LATEST_REDIRECTREPLACE="{{REDIRECTURL}}"
export LATEST_REDIRECTURL="\.\.\/${DOCUMENT_PUBLISH_SUBFOLDER//./\\.}"
export SED_REDIRECT="s/${LATEST_REDIRECTREPLACE}/${LATEST_REDIRECTURL}/g"
export LATEST_DIR="${DOCUMENT_PUBLISH_FOLDER_ROOT}/latest"

export SED_REDIRECT="s/${LATEST_REDIRECTREPLACE}/${LATEST_REDIRECTURL}/g"
export COMMIT_MESSAGE="autodocs publish ${TIME_STAMP} ${COMMIT_ID}"
export SED_STRIP_TOKEN="s/${GH_TOKEN}/\[SECURE\]/g"

# Print all environment varriables
printenv
