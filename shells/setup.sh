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
  read -p "Enter storage type (file or upstash) [$STORE_TYPE]: " input
  input=${input:-$STORE_TYPE} # Use default if input is empty

  if [[ "$input" == "file" || "$input" == "upstash" ]]; then
    STORE_TYPE=$input
    break
  else
    echo "Invalid input. Please enter 'file' or 'upstash'."
  fi
done

# Conditionally ask for Upstash credentials
if [ "$STORE_TYPE" == "upstash" ]; then
  echo "Upstash storage selected. Please provide your Redis credentials."
  prompt_for_value "Enter your Upstash Redis REST URL" "UPSTASH_REDIS_REST_URL"
  prompt_for_value "Enter your Upstash Redis REST Token" "UPSTASH_REDIS_REST_TOKEN"
else
  # If not using upstash, ensure the variables are unset so they don't get written to .env
  unset UPSTASH_REDIS_REST_URL
  unset UPSTASH_REDIS_REST_TOKEN
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

# Storage configuration for PropertiesService and CacheService ('file' or 'upstash')
STORE_TYPE="${STORE_TYPE}"

# Logging destination for Logger.log() ('CONSOLE', 'CLOUD', 'BOTH', 'NONE')
LOG_DESTINATION="${LOG_DESTINATION}"
EOL

# Only append Upstash credentials if the type is 'upstash'
if [ "$STORE_TYPE" == "upstash" ]; then
  echo "" >> "$ENV_FILE"
  echo "# Upstash credentials (only used if STORE_TYPE is 'upstash')" >> "$ENV_FILE"
  echo "UPSTASH_REDIS_REST_URL=\"${UPSTASH_REDIS_REST_URL}\"" >> "$ENV_FILE"
  echo "UPSTASH_REDIS_REST_TOKEN=\"${UPSTASH_REDIS_REST_TOKEN}\"" >> "$ENV_FILE"
fi

echo "Setup complete. Your .env file has been updated."
echo "--------------------------------------------------"