#!/bin/bash
set -e

# 1. Load the .env from the CURRENT directory
ENV_PATH=".env"
if [ -f "$ENV_PATH" ]; then
    echo "--- Loading variables from local $ENV_PATH ---"
    export $(grep -v '^#' "$ENV_PATH" | xargs)
else
    echo "Error: .env not found at $ENV_PATH"
    exit 1
exit 1
fi

# Variables
REGION="europe-west1"
JOB_NAME="gas-fakes-test-stores-job" # Renamed to -job to avoid conflict with existing service
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GCP_PROJECT_ID/$REPO_NAME/$JOB_NAME"
CURRENT_USER=$(gcloud config get-value account)

# 2. Build
echo "--- Building Container ---"
gcloud builds submit .. \
    --config=cloudbuild.yaml \
    --substitutions=_IMAGE_PATH="$IMAGE_PATH"

# 3. Deploy as a JOB (not a service)
# We use 'replace' or 'apply' logic via 'gcloud run jobs create'
# If it already exists, we use 'update'
echo "--- Configuring Cloud Run Job ---"
if gcloud run jobs describe "$JOB_NAME" --region "$REGION" >/dev/null 2>&1; then
    COMMAND="update"
else
    COMMAND="create"
fi

gcloud run jobs $COMMAND "$JOB_NAME" \
    --image "$IMAGE_PATH" \
    --region "$REGION" \
    --service-account "$SA_EMAIL" \
    --tasks 1 \
    --max-retries 0 \
    --task-timeout 3600 \
    --cpu 1 \
    --memory 2Gi \
    --set-env-vars "STORE_TYPE=$STORE_TYPE,GOOGLE_WORKSPACE_SUBJECT=$CURRENT_USER,GOOGLE_SERVICE_ACCOUNT_NAME=$GOOGLE_SERVICE_ACCOUNT_NAME,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"

echo "--- Job Configured: $JOB_NAME ---"
echo "To run it now: gcloud run jobs execute $JOB_NAME --region $REGION"

echo "--- Deployed to Cloud Run ---"
echo "to stream logs: gcloud alpha run services logs tail $JOB_NAME --region $REGION --project $GCP_PROJECT_ID"