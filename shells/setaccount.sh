#!/bin/bash

# Find the project root directory relative to the script's location
# This makes the script runnable from any directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIRECTORY=$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )
ENV_FILE="$ROOT_DIRECTORY/.env"

# Check if the .env file exists and then source it
if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
else
  echo "Error: .env file not found at '$ENV_FILE'"
  exit 1
fi

# these are the ones it sets by default - take some of these out if you want to minimize access
DEFAULT_SCOPES=$DEFAULT_SCOPES

# these are the ones we want to add (note comma at beginning)
EXTRA_SCOPES=$EXTRA_SCOPES
SCOPES="${DEFAULT_SCOPES}${EXTRA_SCOPES}"

# needs special flag to allow drive access
DRIVE="--enable-gdrive-access"

# request scopes
echo "...requesting scopes ${SCOPES}"

# we can override the normal ADC client id with specially scoped ones
CLIENT_FLAG=""
CLIENT_PATH=""

# The logic should be to run IF the variable is SET (i.e., NOT empty).
if [[ -n "$CLIENT_CREDENTIAL_FILE" ]]; then 
  echo "...attempting to use enhanced client credentials"
  
  # Check if the path is absolute (starts with / or ~)
  if [[ "$CLIENT_CREDENTIAL_FILE" == /* || "$CLIENT_CREDENTIAL_FILE" == \~* ]]; then
    CLIENT_PATH="$CLIENT_CREDENTIAL_FILE"
  else
    # Otherwise, assume it's relative to the ROOT_DIRECTORY
    CLIENT_PATH="$ROOT_DIRECTORY/$CLIENT_CREDENTIAL_FILE"
  fi
  
  # Check if the file actually exists
  if [[ -f "$CLIENT_PATH" ]]; then
    CLIENT_FLAG="--client-id-file=${CLIENT_PATH}"
  else 
    echo "Error: Client credential file specified in .env not found at '$CLIENT_PATH'"
    exit 1
  fi
else 
  # This block executes if CLIENT_CREDENTIAL_FILE is NOT SET/EMPTY
  echo ""
  echo "...CLIENT_CREDENTIAL_FILE is not set. Using default Application Default Credentials (ADC)."
  echo "...if you have requested any sensitive scopes, you'll see 'This app is blocked message.'"
  echo "...To allow them see - https://github.com/brucemcpherson/gas-fakes/blob/main/GETTING_STARTED.md"
  echo ""
fi


# project ID
P=$GCP_PROJECT_ID

# config to activate - multiple configs can each be named
# here we're working on the default project configuration
# Use AC from .env file, or 'default' if it's not set
AC=${AC:-default}
# clean up anything set from before
gcloud auth revoke --quiet 2>/dev/null
gcloud auth application-default revoke --quiet  2>/dev/null

# activate the config
gcloud config configurations activate "${AC}" 

# set the broject and quota proj
gcloud config set project $P
gcloud config set billing/quota_project $P

# login to both - (enable gdive if required)

gcloud auth login "${DRIVE}"
gcloud auth application-default login --scopes="${SCOPES}" "${CLIENT_FLAG}"
gcloud auth application-default set-quota-project $P


# double check
DC=$(cat ~/.config/gcloud/active_config)
DP=$(gcloud config get project)

echo "Active config is ${DC} - project is ${DP}"

# check tokens have scopes required
ADT=$(gcloud auth application-default print-access-token)
UT=$(gcloud auth print-access-token)

echo "...user token scopes"
curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${UT}

echo "...access default application token scopes"
curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${ADT}