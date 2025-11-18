#!/bin/bash

# fromgas.sh: Pulls code from Google Apps Script using clasp and bundles it for Node.js.
# It uses esbuild.config.js to perform the bundling.

# When run via npm, INIT_CWD is the original directory where the command was invoked. This is the most reliable way to get the project root.
PROJECT_ROOT=${INIT_CWD:-$PWD}
BUNDLE_DIR="bundle"

# --- Configuration ---
# Set the directory where your clasp project resides and where files will be pulled.
CLASP_DIR="$PROJECT_ROOT/src"

# Set the destination for the bundled Node.js file.
BUNDLE_FILE="$PROJECT_ROOT/$BUNDLE_DIR/index.js"

# The import statement to add when the --with-fakes flag is used.
FAKES_IMPORT="import '@mcpher/gas-fakes';"

# Default file names for pre and post bundle code.
DEFAULT_PRE_BUNDLE_FILE="$PROJECT_ROOT/pre.js"
DEFAULT_POST_BUNDLE_FILE="$PROJECT_ROOT/post.js"

# --- Argument Parsing ---
PRE_BUNDLE_CONTENT=""
ESBUILD_FOOTER=""

# Flags to track if arguments have overridden the defaults.
PRE_BUNDLE_OVERRIDDEN=false
POST_BUNDLE_OVERRIDDEN=false

# --- Action Flags ---
ACTION_FLAGS_SET=false
PULL_ENABLED=false
BUNDLE_ENABLED=false
RUN_ENABLED=false
FAKES_ENABLED=true # Defaulting to true as per original script


# Load default pre-bundle file if it exists.
if [ -f "$DEFAULT_PRE_BUNDLE_FILE" ]; then
  PRE_BUNDLE_CONTENT=$(<"$DEFAULT_PRE_BUNDLE_FILE")
  echo "Loaded default pre-bundle code from '$DEFAULT_PRE_BUNDLE_FILE'."
fi

# Process command-line arguments, which will override defaults.
while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--pre-bundle)
      if [[ -z "$2" ]]; then
        echo "❌ Error: --pre-bundle requires an argument (file path or code string)."
        exit 1
      fi
      # Clear any default value if this is the first override.
      if [ "$PRE_BUNDLE_OVERRIDDEN" = false ]; then
        PRE_BUNDLE_CONTENT=""
        PRE_BUNDLE_OVERRIDDEN=true
      fi
      if [[ -f "$2" ]]; then
        PRE_BUNDLE_CODE=$(<"$2")
        echo "Overriding pre-bundle with code from file '$2'."
      else
        PRE_BUNDLE_CODE="$2"
        echo "Overriding pre-bundle with provided code string."
      fi
      PRE_BUNDLE_CONTENT+="$PRE_BUNDLE_CODE;"
      shift # past argument
      shift # past value
      ;;
    -i|--with-fakes)
      FAKES_ENABLED=true
      echo "Will prepend gas-fakes import to the bundle."
      shift # past argument
      ;;
    -p|--post-bundle)
      if [[ -z "$2" ]]; then
        echo "❌ Error: --post-bundle requires an argument (file path or code string)."
        exit 1
      fi
      # Clear any default value if this is the first override.
      if [ "$POST_BUNDLE_OVERRIDDEN" = false ]; then
        ESBUILD_FOOTER=""
        POST_BUNDLE_OVERRIDDEN=true
      fi
      if [[ -f "$2" ]]; then
        POST_BUNDLE_CODE=$(<"$2")
        echo "Overriding post-bundle with code from file '$2'."
      else
        POST_BUNDLE_CODE="$2"
        echo "Overriding post-bundle with provided code string."
      fi
      ESBUILD_FOOTER+="$POST_BUNDLE_CODE;"
      shift # past argument
      shift # past value
      ;;
    --pull)
      PULL_ENABLED=true
      ACTION_FLAGS_SET=true
      shift
      ;;
    --run)
      RUN_ENABLED=true
      ACTION_FLAGS_SET=true
      shift
      ;;
    --bundle)
      BUNDLE_ENABLED=true
      ACTION_FLAGS_SET=true
      shift
      ;;
    *)
      # Unknown option
      echo "Unknown option: $1"
      shift
      ;;
  esac
done

# If no action flags were specified, run all actions by default.
if [ "$ACTION_FLAGS_SET" = false ]; then
  echo "No specific actions requested; running default sequence: pull, bundle, run."
  PULL_ENABLED=true
  BUNDLE_ENABLED=true
  RUN_ENABLED=true
fi

# Construct the final ESBUILD_BANNER, ensuring fakes import comes first.
ESBUILD_BANNER=""
if [ "$FAKES_ENABLED" = true ]; then
  ESBUILD_BANNER+="$FAKES_IMPORT"
fi
ESBUILD_BANNER+="$PRE_BUNDLE_CONTENT"

# Load default post-bundle file if it exists.
if [ -f "$DEFAULT_POST_BUNDLE_FILE" ]; then
  # Prepend to any command-line footer content
  ESBUILD_FOOTER="$(<"$DEFAULT_POST_BUNDLE_FILE")$ESBUILD_FOOTER"
  echo "Loaded default post-bundle code from '$DEFAULT_POST_BUNDLE_FILE'."
fi

# --- Script ---

if [ "$PULL_ENABLED" = true ]; then
  # Check if .clasp.json exists in the directory.
  if [ ! -f "$CLASP_DIR/.clasp.json" ]; then
    echo "❌ Error: .clasp.json not found in the '$CLASP_DIR' directory."
    echo "   Please ensure you have run 'clasp login' and 'clasp clone' here."
    exit 1
  fi

  echo "Pulling latest code from Google Apps Script..."
  # Check clasp major version to determine which command to use.
  CLASP_MAJOR_VERSION=$(npx clasp --version | cut -d'.' -f1)
  if [ "$CLASP_MAJOR_VERSION" -ge 2 ]; then
      # v2+ uses --project to specify the directory
      npx clasp pull --project "$CLASP_DIR"
  else
      (cd "$CLASP_DIR" && npx clasp pull)
  fi
fi

if [ "$BUNDLE_ENABLED" = true ]; then
  echo "Bundling files for Node.js using esbuild..."
  # Create the dist directory if it doesn't exist
  mkdir -p "$PROJECT_ROOT/$BUNDLE_DIR"

  # Get the absolute path to the esbuild config file
  CONFIG_FILE_PATH=$(dirname -- "${BASH_SOURCE[0]}")/esbuild.config.js

  # Export variables and run the esbuild config file with Node.
  # This is the most reliable way to bundle.
  export PROJECT_ROOT
  export BUNDLE_FILE
  export ESBUILD_BANNER
  export ESBUILD_FOOTER
  node "$CONFIG_FILE_PATH"

  echo "Copying clasp configuration files to dist/..."
  cp "$CLASP_DIR/appsscript.json" "$PROJECT_ROOT/$BUNDLE_DIR/"
  cp "$CLASP_DIR/.clasp.json" "$PROJECT_ROOT/$BUNDLE_DIR/"

  echo "✅ Bundle complete! You can now run your code in Node.js with:"
  echo "   node $BUNDLE_FILE"
fi

if [ "$RUN_ENABLED" = true ]; then
  echo "--- Running Bundle ---"
  node "$BUNDLE_FILE"
  echo "--- Bundle Execution Finished ---"
fi