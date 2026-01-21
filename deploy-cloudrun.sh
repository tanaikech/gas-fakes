#!/bin/bash

# Load project ID from .env
if [ -f "test/.env" ]; then
    export $(grep ^GCP_PROJECT_ID= test/.env | xargs)
fi

if [ -z "$GCP_PROJECT_ID" ]; then
    echo "Error: GCP_PROJECT_ID not found in test/.env"
    exit 1
fi

SERVICE_NAME="gas-fakes-test-stores"
REGION="europe-west1" # Default region
SA_EMAIL="gas-fakes-worker@$GCP_PROJECT_ID.iam.gserviceaccount.com"

echo "Using Project ID: $GCP_PROJECT_ID"
echo "Service Account: $SA_EMAIL"

# 1. Build the image using Cloud Build
echo "--- Building Container Image ---"
gcloud builds submit --tag "gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME" .

# 2. Deploy to Cloud Run
echo "--- Deploying to Cloud Run ---"
gcloud run deploy "$SERVICE_NAME" \
    --image "gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME" \
    --platform managed \
    --region "$REGION" \
    --service-account "$SA_EMAIL" \
    --allow-unauthenticated \
    --set-env-vars "STORE_TYPE=UPSTASH,GOOGLE_WORKSPACE_SUBJ=bruce@mcpher.com"

echo "--- Deployment Complete ---"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
