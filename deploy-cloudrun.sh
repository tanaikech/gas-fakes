#!/bin/bash

# Load project ID from .env
if [ -f "test/.env" ]; then
    GCP_PROJECT_ID=$(grep ^GCP_PROJECT_ID= test/.env | cut -d '=' -f2 | tr -d '"\r' | tr -d "'")
    export GCP_PROJECT_ID
fi

if [ -z "$GCP_PROJECT_ID" ]; then
    echo "Error: GCP_PROJECT_ID not found in test/.env"
    exit 1
fi

SERVICE_NAME="gas-fakes-test-stores"
REGION="europe-west1"
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GCP_PROJECT_ID/$REPO_NAME/$SERVICE_NAME"
SA_EMAIL="gas-fakes-worker@$GCP_PROJECT_ID.iam.gserviceaccount.com"

echo "Using Project ID: $GCP_PROJECT_ID"
echo "Image Path: $IMAGE_PATH"
echo "Service Account: $SA_EMAIL"

# 1. Build the image using Cloud Build
echo "--- Building Container Image ---"
gcloud builds submit --tag "$IMAGE_PATH" .

# 2. Deploy to Cloud Run
echo "--- Deploying to Cloud Run ---"
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_PATH" \
    --platform managed \
    --region "$REGION" \
    --service-account "$SA_EMAIL" \
    --allow-unauthenticated \
    --set-env-vars "STORE_TYPE=UPSTASH,GOOGLE_WORKSPACE_SUBJ=bruce@mcpher.com"

echo "--- Deployment Complete ---"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
