#!/bin/bash

# This script reads the GCP_PROJECT_ID from a .env file
# and exports it as GOOGLE_CLOUD_PROJECT for the current shell session.
#
# Usage: source . ./exgcp.sh

# Define the path to your .env file relative to the script's location
ENV_FILE="$(dirname "$0")/.env"

# Check if the .env file exists

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at path: $ENV_FILE"
  # Use 'return' instead of 'exit' so it doesn't close the user's terminal when sourced
  return 1
fi

# Read the GCP_PROJECT_ID, remove quotes, and handle potential carriage returns
GCP_PROJECT_ID_VALUE=$(grep -E '^GCP_PROJECT_ID=' "$ENV_FILE" | cut -d '=' -f2 | tr -d '"\r')

# Check if a value was extracted
if [ -z "$GCP_PROJECT_ID_VALUE" ]; then
  echo "Error: GCP_PROJECT_ID not found or is empty in $ENV_FILE."
  return 1
fi

# Export the variable for the current session
export GOOGLE_CLOUD_PROJECT="$GCP_PROJECT_ID_VALUE"

echo "Successfully exported: GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"