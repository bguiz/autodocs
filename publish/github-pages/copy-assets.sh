#!/bin/bash

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o pipefail -o nounset

tar cf - ${DOCUMENT_ASSETS} | ( cd ${GHPAGES_DIR} ; tar xf - )
