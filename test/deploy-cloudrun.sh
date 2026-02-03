#!/bin/bash
set -e

# 1. Load the .env from the CURRENT directory and create a YAML for gcloud
ENV_PATH=".env"
ENV_YAML=".env.yaml"
if [ -f "$ENV_PATH" ]; then
    echo "--- Loading variables from local $ENV_PATH ---"
    export $(grep -v '^#' "$ENV_PATH" | xargs)
    
    # Generate YAML file for gcloud --env-vars-file
    # This handles spaces and special characters better than --set-env-vars
    # We use .env.yaml because .env* is in .gitignore
    echo "--- Generating $ENV_YAML ---"
    grep -v '^#' "$ENV_PATH" | grep -v '^$' | sed 's/=/:\ /' > "$ENV_YAML"
    
    # Add GOOGLE_WORKSPACE_SUBJECT to the YAML
    CURRENT_USER=$(gcloud config get-value account)
    echo "GOOGLE_WORKSPACE_SUBJECT: $CURRENT_USER" >> "$ENV_YAML"
else
    echo "Error: .env not found at $ENV_PATH"
    exit 1
fi

# Variables
REGION="europe-west1"
JOB_NAME="gas-fakes-test-job" 
REPO_NAME="gas-fakes-repo"
IMAGE_PATH="$REGION-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/$REPO_NAME/$JOB_NAME"
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
    --env-vars-file "$ENV_YAML"

# Clean up temp YAML
rm "$ENV_YAML"

# 4. Execute and Capture ID
echo "--- Starting Execution ---"
# We capture the execution name to filter logs accurately
EXEC_NAME=$(gcloud run jobs execute "$JOB_NAME" --region "$REGION" --format='value(metadata.name)')

if [ -z "$EXEC_NAME" ]; then
    echo "Error: Failed to start execution or capture execution name."
    exit 1
fi
echo "--- Execution Started: $EXEC_NAME ---"

# 5. Tail logs
echo "--- Tailing logs for $JOB_NAME (Ctrl+C to stop) ---"
gcloud alpha run jobs logs tail "$JOB_NAME" --region "$REGION"