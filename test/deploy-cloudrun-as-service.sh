#!/bin/bash
set -e

# 1. Load the .env from the CURRENT directory (test/)
ENV_PATH=".env"
if [ -f "$ENV_PATH" ]; then
    echo "--- Loading variables from local $ENV_PATH ---"
    export $(grep -v '^#' "$ENV_PATH" | xargs)
else
    echo "Error: .env not found at $ENV_PATH"
    exit 1
fi

# Variables used for the build/deploy
REGION="europe-west1"
SERVICE_NAME="gas-fakes-test-stores"
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO_NAME/$SERVICE_NAME"
CURRENT_USER=$(gcloud config get-value account)
echo "--- Auto-detected deploying user: $CURRENT_USER ---"


# 2. Build: Context is '..', Dockerfile is local
# This sends the whole project to Cloud Build
echo "--- Building from Parent Context ---"
# Correct syntax for gcloud builds with a specific Dockerfile path
# Run this from inside ./test
gcloud builds submit .. \
    --config=cloudbuild.yaml \
    --substitutions=_IMAGE_PATH="$IMAGE_PATH"

# 3. Deploy
echo "--- Deploying to Cloud Run ---"
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_PATH" \
    --region "$REGION" \
    --service-account "$SA_EMAIL" \
    --timeout 3600 \
    --memory 2Gi \
    --set-env-vars "STORE_TYPE=$STORE_TYPE,GOOGLE_WORKSPACE_SUBJECT=$CURRENT_USER,GOOGLE_SERVICE_ACCOUNT_NAME=$GOOGLE_SERVICE_ACCOUNT_NAME,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"
    



echo "--- Deployed to Cloud Run ---"
echo "to stream logs: gcloud alpha run services logs tail $SERVICE_NAME --region $REGION --project $GOOGLE_CLOUD_PROJECT"