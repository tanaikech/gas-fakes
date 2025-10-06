#!/bin/bash

# Find the project root directory relative to the script's location
# This makes the script runnable from any directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIRECTORY=$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )
ENV_FILE="$ROOT_DIRECTORY/.env"

# Check if the .env file exists and then source it
if [ -f "$ENV_FILE" ]; then
  source "$ENV_FILE"
else
  echo "Error: .env file not found at '$ENV_FILE'"
  exit 1
fi

# project ID
P=$GCP_PROJECT_ID

# config to activate - multiple configs can each be named
# here we're working on the default project configuration
AC=default

# these are the ones it sets by default - take some of these out if you want to minimize access
DEFAULT_SCOPES=$DEFAULT_SCOPES

# these are the ones we want to add (note comma at beginning)
EXTRA_SCOPES=$EXTRA_SCOPES

SCOPES="${DEFAULT_SCOPES}${EXTRA_SCOPES}"

# clean up anything set from before
echo "ignore no credentials to revoke error if this is the first time you've done this here"
gcloud auth revoke --quiet
gcloud auth application-default revoke --quiet

# activate the config
gcloud config configurations activate "${AC}"

# set the broject and quota proj
gcloud config set project $P
gcloud config set billing/quota_project $P

# login to both - (enable gdive if required)
DRIVE="--enable-gdrive-access"
gcloud auth login "${DRIVE}"
gcloud auth application-default login --scopes="${SCOPES}" 
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