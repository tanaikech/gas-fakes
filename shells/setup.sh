#!/bin/bash

# Move to the script's directory to ensure relative paths work correctly.
cd "$(dirname "$0")"

# Define the path to the .env file, which is in the parent directory.
ENV_FILE="../.env"

# --- Load existing values from .env file if it exists ---
if [ -f "$ENV_FILE" ]; then
  echo "Found existing .env file. Loading current values as defaults."
  # Source the file to load its variables into the current shell session.
  # This handles various formats and ensures variables are available.
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

# --- Helper function for user prompts ---
# Prompts the user for a value, showing the current value as a default.
prompt_for_value() {
  local prompt_text=$1
  local var_name=$2
  local default_value=${!var_name} # Indirectly get the value of the variable named by var_name

  read -p "$prompt_text [$default_value]: " input
  
  # If the user provides input, use it. Otherwise, keep the default value.
  if [ -n "$input" ]; then
    # Use printf to handle assignment safely, then evaluate it.
    eval "$(printf '%s=%s' "$var_name" "'$input'")"
  fi
}

# --- Gather Configuration Values ---
echo "--------------------------------------------------"
echo "Configuring .env for gas-fakes"
echo "Press Enter to accept the default value in brackets."
echo "--------------------------------------------------"

prompt_for_value "Enter your GCP Project ID" "GCP_PROJECT_ID"
prompt_for_value "Enter a test Drive file ID for authentication checks" "DRIVE_TEST_FILE_ID"
prompt_for_value "Enter path to OAuth client credentials JSON (optional)" "CLIENT_CREDENTIAL_FILE"

# --- Scope Configuration ---

# Set defaults for scopes if they are not already set
DEFAULT_SCOPES=${DEFAULT_SCOPES:-"https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform"}
EXTRA_SCOPES=${EXTRA_SCOPES:-",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets"}

prompt_for_value "Enter default scopes" "DEFAULT_SCOPES"
prompt_for_value "Enter any extra scopes (comma-separated)" "EXTRA_SCOPES"

# --- Logging Configuration ---

# Set default for LOG_DESTINATION if it's not already set
LOG_DESTINATION=${LOG_DESTINATION:-CONSOLE}

# Loop until a valid LOG_DESTINATION is entered
while true; do
  read -p "Enter logging destination (CONSOLE, CLOUD, BOTH, NONE) [$LOG_DESTINATION]: " input
  input_upper=$(echo "${input:-$LOG_DESTINATION}" | tr '[:lower:]' '[:upper:]')

  if [[ "$input_upper" == "CONSOLE" || "$input_upper" == "CLOUD" || "$input_upper" == "BOTH" || "$input_upper" == "NONE" ]]; then
    LOG_DESTINATION=$input_upper
    break
  else
    echo "Invalid input. Please enter one of CONSOLE, CLOUD, BOTH, or NONE."
  fi
done


# --- Storage Configuration ---

# Set default for STORE_TYPE if it's not already set
STORE_TYPE=${STORE_TYPE:-file}

# Loop until a valid STORE_TYPE is entered
while true; do
  read -p "Enter storage type (FILE or UPSTASH) [$STORE_TYPE]: " input
  # Use default if input is empty, and convert to uppercase
  input_upper=$(echo "${input:-$STORE_TYPE}" | tr '[:lower:]' '[:upper:]')

  if [[ "$input_upper" == "FILE" || "$input_upper" == "UPSTASH" ]]; then
    STORE_TYPE=$input_upper
    break
  else
    echo "Invalid input. Please enter 'file' or 'upstash'."
  fi
done

# Conditionally ask for Upstash credentials
if [ "$STORE_TYPE" == "UPSTASH" ]; then
  echo "Upstash storage selected. Please provide your Redis credentials."
  prompt_for_value "Enter your Upstash Redis REST URL" "UPSTASH_REDIS_REST_URL"
  prompt_for_value "Enter your Upstash Redis REST Token" "UPSTASH_REDIS_REST_TOKEN"
fi

# --- Write Configuration to .env file ---
echo "--------------------------------------------------"
echo "Writing configuration to $ENV_FILE..."

# Create or overwrite the .env file
cat > "$ENV_FILE" << EOL
# Google Cloud Project ID (required)
GCP_PROJECT_ID="${GCP_PROJECT_ID}"

# Path to OAuth client credentials for restricted scopes (optional)
CLIENT_CREDENTIAL_FILE="${CLIENT_CREDENTIAL_FILE}"

# A test file ID for checking authentication (optional)
DRIVE_TEST_FILE_ID="${DRIVE_TEST_FILE_ID}"

# Storage configuration for PropertiesService and CacheService ('FILE' or 'UPSTASH')
STORE_TYPE="${STORE_TYPE}"

# Logging destination for Logger.log() ('CONSOLE', 'CLOUD', 'BOTH', 'NONE')
LOG_DESTINATION="${LOG_DESTINATION}"

# Scopes for authentication
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="${DEFAULT_SCOPES}"
EXTRA_SCOPES="${EXTRA_SCOPES}"

EOL

# Append Upstash credentials if they exist, regardless of STORE_TYPE.
# This preserves them when switching back and forth.
if [ -n "$UPSTASH_REDIS_REST_URL" ] && [ -n "$UPSTASH_REDIS_REST_TOKEN" ]; then
  echo "" >> "$ENV_FILE"
  echo "# Upstash credentials (only used if STORE_TYPE is 'UPSTASH')" >> "$ENV_FILE"
  echo "UPSTASH_REDIS_REST_URL=\"${UPSTASH_REDIS_REST_URL}\"" >> "$ENV_FILE"
  echo "UPSTASH_REDIS_REST_TOKEN=\"${UPSTASH_REDIS_REST_TOKEN}\"" >> "$ENV_FILE"
fi

echo "Setup complete. Your .env file has been updated."
echo "--------------------------------------------------"