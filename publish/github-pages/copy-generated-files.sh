#!/bin/bash

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

#NOTE The var `DOCUMENT_PUBLISH_FOLDER` is processed and is based on other vars
# It defaults to `api/${MAJOR_VERSION}.${MINOR_VERSION}`
mkdir -p "${DOC_PUBLISH_DIR}"
rm -rf ${DOC_PUBLISH_DIR}/*
cp -r ${GENERATED_DIR}/* "${DOC_PUBLISH_DIR}"
