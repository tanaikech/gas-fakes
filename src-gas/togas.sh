#!/bin/bash

# togas.sh: Prepares local source files for Google Apps Script by removing ES module syntax
# and pushes them using clasp.

# When run via npm, INIT_CWD is the original directory where the command was invoked. This is the most reliable way to get the project root.
PROJECT_ROOT=${INIT_CWD:-$PWD}

# --- Configuration ---
# The source directory containing the .js and appsscript.json files.
SOURCE_DIR="$PROJECT_ROOT/src"

# The temporary directory where modified files will be staged for pushing.
TARGET_DIR="$PROJECT_ROOT/gas-dist"

# --- Script ---

echo "Preparing files for Google Apps Script..."

# 1. Clean and create the target directory.
echo "Cleaning up and creating target directory: $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Check if the source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Error: Source directory '$SOURCE_DIR' not found."
  exit 1
fi

# 2. Copy all files from the source directory to the target directory.
# We use `cp -a` (archive mode) which preserves file attributes and correctly copies dotfiles.
# The trailing `/.` ensures we copy the *contents* of the source directory.
echo "Copying files from $SOURCE_DIR to $TARGET_DIR"
cp -a "$SOURCE_DIR/." "$TARGET_DIR/"
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to copy files from $SOURCE_DIR to $TARGET_DIR."
    exit 1
fi

# 3. Process the copied files to make them GAS-compatible.
echo "Removing 'export' and commenting out 'import' statements..."

# Find all .js files and remove 'export' statements.
# The perl script removes 'export ' from the beginning of lines.
find "$TARGET_DIR" -name "*.js" -type f -exec perl -i -pe 's/^\s*export\s\s*//g' {} +

# Find all .js files and comment out 'import' statements, handling multi-line imports.
find "$TARGET_DIR" -name "*.js" -type f -exec perl -i -pe 'if (/^import\b/) { $in_import=1 } if ($in_import) { s/^/\/\//; if (/['\''"][^'\''"]*['\''"];?\s*$/) { $in_import=0 } }' {} +

echo "✅ File preparation complete."

# 4. Push the prepared files to Google Apps Script using clasp.
echo "Pushing prepared files to Google Apps Script..."

# Check if .clasp.json exists in the target directory.
if [ ! -f "$TARGET_DIR/.clasp.json" ]; then
  echo "❌ Error: .clasp.json not found in the '$TARGET_DIR' directory."
  echo "   This file should have been copied from '$SOURCE_DIR'."
  exit 1
fi

# Check clasp major version to determine which command to use.
CLASP_MAJOR_VERSION=$(npx clasp --version | cut -d'.' -f1)
if [ "$CLASP_MAJOR_VERSION" -ge 2 ]; then
    # v2+ uses --project to specify the directory
    clasp push --project "$TARGET_DIR"
else
    (cd "$TARGET_DIR" && npx clasp push)
fi
 
echo "🚀 Push complete!"

# Optional: Clean up the temporary directory after push.
rm -rf "$TARGET_DIR"