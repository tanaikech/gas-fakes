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
fi

# Variables
REGION="europe-west1"
JOB_NAME="gas-fakes-test-job" 
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO_NAME/$JOB_NAME"
CURRENT_USER=$(gcloud config get-value account)
SA_EMAIL="${GOOGLE_SERVICE_ACCOUNT_NAME}@${GOOGLE_CLOUD_PROJECT}.iam.gserviceaccount.com"

# 2. Build
echo "--- Building Container ---"
gcloud builds submit .. \
    --config=cloudbuild.yaml \
    --substitutions=_IMAGE_PATH="$IMAGE_PATH"

# 3. Configure/Update the Job
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

# 4. Execute and Capture ID
echo "--- Starting Execution ---"
# We capture the execution name to filter logs accurately
EXEC_NAME=$(gcloud run jobs execute "$JOB_NAME" --region "$REGION" --format='value(metadata.name)')
echo "--- Execution Started: $EXEC_NAME ---"

# 5. Using 'watch' to monitor logs
echo "--- Entering watch mode Ctrl+C to exit ---"
# Note: We use double quotes for the watch command so $EXEC_NAME is expanded locally
watch -n 2 "gcloud logging read 'resource.labels.execution_name=$EXEC_NAME' --limit 20 --format='value(textPayload)'"