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
IMAGE_PATH="europe-west1-docker.pkg.dev/$GCP_PROJECT_ID/gas-fakes-repo/gas-fakes-test-stores"

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
gcloud run deploy "gas-fakes-test-stores" \
    --image "$IMAGE_PATH" \
    --region "europe-west1" \
    --service-account "$SA_EMAIL" \
    --set-env-vars "STORE_TYPE=$STORE_TYPE,GOOGLE_WORKSPACE_SUBJECT=$GOOGLE_WORKSPACE_SUBJECT,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"

# 4. Prune old revisions (keep latest 2)
echo "--- Pruning old revisions (keeping latest 2) ---"
REVISIONS=$(gcloud run revisions list --service "gas-fakes-test-stores" --region "europe-west1" --format='value(metadata.name)' --sort-by='~metadata.creationTimestamp' | tail -n +3)
if [ -n "$REVISIONS" ]; then
    echo "Deleting old revisions: $REVISIONS"
    gcloud run revisions delete $REVISIONS --region "europe-west1" --quiet
else
    echo "No old revisions to prune."
fi