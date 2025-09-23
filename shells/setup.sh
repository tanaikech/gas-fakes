#!/bin/bash
# A guided script to help set up the .env file and run ADC setup.
set -e

# Get the directory of the script to locate other files relative to it.
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
SETUP_ENV_TEMPLATE="$PROJECT_ROOT/.env.setup.template"
TEST_ENV_TEMPLATE="$PROJECT_ROOT/.env.test.template"

echo "--- gas-fakes environment setup ---"
echo

# --- Helper functions ---
# Reads a value for a given key from the .env file
get_env_value() {
    local key=$1
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Get value, remove quotes
        grep "^${key}=" "$ENV_FILE" | head -n 1 | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//'
    else
        echo ""
    fi
}

# Merges a template file into .env, adding only keys that are missing.
merge_template() {
    local template_file=$1
    if [ ! -f "$template_file" ]; then
        echo "Warning: Template file not found, skipping: $template_file"
        return
    fi

    # Read template line by line, ignore comments and empty lines
    # Use of `grep` and `while` handles various line ending types
    grep -v '^[[:space:]]*#' "$template_file" | grep -v '^[[:space:]]*$' | while IFS= read -r line || [ -n "$line" ]; do
        # a bit of cleanup for lines with carriage returns
        line=$(echo "$line" | tr -d '\r')
        local key=$(echo "$line" | cut -d'=' -f1)
        if ! grep -q "^${key}=" "$ENV_FILE"; then
            echo "Adding missing key '$key' to .env"
            echo "$line" >> "$ENV_FILE"
        fi
    done
}

# Updates a value for a given key in the .env file
update_env_value() {
    local key=$1
    local value=$2
    # Escape for sed's RHS
    local escaped_value=$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')

    if grep -q "^${key}=" "$ENV_FILE"; then
        # sed -i.bak is compatible with both GNU and BSD sed
        sed -i.bak "s/^${key}=.*/${key}=\"${escaped_value}\"/" "$ENV_FILE"
    else
        echo "${key}=\"${value}\"" >> "$ENV_FILE"
    fi
    rm -f "${ENV_FILE}.bak"
}

# --- .env file setup ---
if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found. Creating from .env.setup.template..."
  if [ -f "$SETUP_ENV_TEMPLATE" ]; then
    cp "$SETUP_ENV_TEMPLATE" "$ENV_FILE"
  else
    echo "Error: .env.setup.template not found in project root ($PROJECT_ROOT)."
    echo "Please make sure required template files from the repository are in your project root."
    exit 1
  fi
else
    echo "Found existing .env file. Merging missing values from .env.setup.template..."
    merge_template "$SETUP_ENV_TEMPLATE"
fi
echo

# --- Ask about test suite ---
read -p "Do you want to set up this environment to run the test suite? (y/N): " SETUP_TESTS
case "$SETUP_TESTS" in
    [Yy]*)
        echo "Setting up for test suite. Merging missing values from .env.test.template..."
        merge_template "$TEST_ENV_TEMPLATE"
        ;;
esac
echo

# --- Prompt for required values ---
echo "Please provide the following values for your .env file."
echo "These are required for authentication with Google Cloud."
echo

# GCP_PROJECT_ID (Required)
CURRENT_GCP_PROJECT_ID=$(get_env_value "GCP_PROJECT_ID")
if [ -n "$CURRENT_GCP_PROJECT_ID" ] && [ "$CURRENT_GCP_PROJECT_ID" != "add your gcp project id here" ]; then
    read -p "Enter your GCP Project ID [current: $CURRENT_GCP_PROJECT_ID]: " GCP_PROJECT_ID
    GCP_PROJECT_ID=${GCP_PROJECT_ID:-$CURRENT_GCP_PROJECT_ID}
else
    read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
    while [ -z "$GCP_PROJECT_ID" ]; do
        echo "GCP Project ID cannot be empty."
        read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
    done
fi
update_env_value "GCP_PROJECT_ID" "$GCP_PROJECT_ID"

# DRIVE_TEST_FILE_ID (Optional)
echo "The DRIVE_TEST_FILE_ID is optional. If provided, the setup script will"
echo "run a test to validate that your ADC token can access Google Drive."
CURRENT_DRIVE_TEST_FILE_ID=$(get_env_value "DRIVE_TEST_FILE_ID")
PLACEHOLDER="add the id of some test file you have access to here"

PROMPT_DEFAULT=""
if [ -n "$CURRENT_DRIVE_TEST_FILE_ID" ] && [ "$CURRENT_DRIVE_TEST_FILE_ID" != "$PLACEHOLDER" ]; then
    PROMPT_DEFAULT=$CURRENT_DRIVE_TEST_FILE_ID
fi

if [ -n "$PROMPT_DEFAULT" ]; then
    read -p "Enter a Drive File ID for token validation (optional) [current: $PROMPT_DEFAULT]: " DRIVE_TEST_FILE_ID
    # If user enters nothing, keep the default
    DRIVE_TEST_FILE_ID=${DRIVE_TEST_FILE_ID:-$PROMPT_DEFAULT}
else
    read -p "Enter a Drive File ID for token validation (optional, press Enter to skip): " DRIVE_TEST_FILE_ID
fi
update_env_value "DRIVE_TEST_FILE_ID" "$DRIVE_TEST_FILE_ID"

echo
echo ".env file updated successfully."
echo

# --- Run ADC setup ---
echo "Proceeding to set up Application Default Credentials (ADC) by running sp.sh..."
echo "This will open a browser for you to log in to your Google Account."
echo
(cd "$SCRIPT_DIR" && bash ./sp.sh)

echo
echo "--- Setup complete! ---"
echo "You should now be able to run your local tests against Google Workspace APIs."