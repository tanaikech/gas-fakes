#!/bin/bash
INSTANCE_NAME="gas-fakes-google-pg"

echo "Fetching Google IP ranges..."
# Get Google IP ranges for Apps Script (only IPv4 as Cloud SQL authorized networks generally use IPv4)
GOOGLE_IPS=$(curl -s https://www.gstatic.com/ipranges/goog.json | jq -r '.prefixes[] | select(.ipv4Prefix) | .ipv4Prefix' | paste -sd, -)

# Also get our local IP to add back in case we need it for node tests
LOCAL_IP=$(curl -s https://ifconfig.me)
LOCAL_NETWORK="${LOCAL_IP}/32"

ALL_NETWORKS="${GOOGLE_IPS},${LOCAL_NETWORK}"

echo "Found $(echo $ALL_NETWORKS | tr ',' '\n' | wc -l | xargs) IP ranges."

echo "Attempting to patch instance $INSTANCE_NAME..."
gcloud sql instances patch $INSTANCE_NAME --authorized-networks="${ALL_NETWORKS}" --quiet
