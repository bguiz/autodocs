#!/bin/bash

# Stop executing when any errors occur,
# or when any environment variables that have not been defined are encountered
set -o errexit -o nounset

# Commit and push
GIT_ADDITIONS="${DOC_PUBLISH_DIR} ${DOCUMENT_ASSETS} ${LATEST_ASSETS}"
git add -A ${GIT_ADDITIONS}
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
