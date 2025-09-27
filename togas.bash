# this simple script comments out the node import stuff 
# and moves selected files recursively to a folder that can be moved to gas with clasp
# load in environment variables from root folder
ROOT_DIRECTORY=$(git rev-parse --show-toplevel)
set -a
source "$ROOT_DIRECTORY/.env"
set +a

TARGET="testongas"

# Define the input folder
SOURCE="test"

# a spec to match extension
EXT="*.js"

# whether to push with clasp
CLASP=true

# the soure appsscript.json manifest should be in the top level 
cp ${SOURCE}/appsscript.json ${TARGET}
cp ${SOURCE}/imports.js ${TARGET}/test
cp ${SOURCE}/test*.js ${TARGET}/test


# find all the copied files and comment/fixes out import and export statements
# note - this simple version naively expects that to be on 1 line
# version below only works on linux - the perl version should work on both mac and linux
#find "${TARGET}" -name "${EXT}" -type f -exec perl -i -pe 'if (/^import\b/) { $in_import=1 } if ($in_import) { s/^/\/\//; if (/['\''"][^'\''"]*['\''"];?\s*$/) { $in_import=0 } }' {} +
# sed -i 's/^import\s\s*/\/\/import /g' $(find "${TARGET}" -name "${EXT}" -type f) 
#sed -i 's/^\s*export\s\s*//g' $(find "${TARGET}" -name "${EXT}" -type f)


# Perl works consistently across platforms
find "${TARGET}" -name "${EXT}" -type f -exec perl -i -pe 's/^\s*export\s\s*//g' {} \;
find "${TARGET}" -name "${EXT}" -type f -exec perl -i -pe 'if (/^import\b/) { $in_import=1 } if ($in_import) { s/^/\/\//; if (/['\''"][^'\''"]*['\''"];?\s*$/) { $in_import=0 } }' {} +
# sed -i 's/^import\s\s*/\/\/import /g' $(find "${TARGET}" -name "${EXT}" -type f) 
# replace all process.env.VAR_NAME occurrences with actual value
# process.env is not usable in apps script
#for var in $(grep -oP 'process\.env\.\K\w+' "${TARGET}/test/testinit.js"); do

# Use macos + linux version
vars=($(grep -oE 'process\.env\.\w+' "${TARGET}/test/testinit.js" | sed 's/process\.env\.//'))

for var in "${vars[@]}"; do

    value=$(printenv "$var")  # Get the environment variable value

    # Escape characters for sed, e.g. \n becomes \\n, & becomes \&
    value=$(printf '%q' "$value")

    # Check if the value contains non-numeric characters (treat as a string)
    if [[ "$value" =~ [^0-9] ]]; then
        value="\"$value\""  # Add double quotes
    fi

    # Replace process.env.VARIABLE_NAME with the actual value
    #sed -i "s|process.env.$var|$value|g" ${TARGET}/test/testinit.js
    #macos + linux
    sed -i "" "s|process.env.$var|$value|g" "${TARGET}/test/testinit.js"
done

# now go to the target and push and open if required
if [ "$CLASP" = true ] ; then
  cd "${TARGET}"
  clasp push
fi
