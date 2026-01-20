#!/bin/bash

# ==========================================
# CONFIGURATION & COLORS
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to update .env safely (Mac/Linux compatible)
update_env_var() {
    local key=$1
    local val=$2
    local file=".env"

    if grep -q "^${key}=" "$file"; then
        # Update existing line
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=\"${val}\"|" "$file"
        else
            sed -i "s|^${key}=.*|${key}=\"${val}\"|" "$file"
        fi
        echo -e "Updated ${YELLOW}$key${NC}"
    else
        # Append new line
        echo "" >> "$file"
        echo "${key}=\"${val}\"" >> "$file"
        echo -e "Added ${YELLOW}$key${NC}"
    fi
}

# 1. Load .env
if [ -f .env ]; then
    echo -e "${GREEN}--- Loading configuration from .env ---${NC}"
    set -a
    source .env
    set +a
else
    echo -e "${RED}Error: .env file not found.${NC}"
    exit 1
fi

# 2. Validate Project ID
if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID not found in .env file.${NC}"
    exit 1
fi

# Constants
SA_NAME="gas-fakes-worker"
SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"
KEY_DIR="private"
KEY_FILE="$KEY_DIR/$SA_NAME.json"
CURRENT_USER=$(gcloud config get-value account)

echo -e "Project: ${YELLOW}$GCP_PROJECT_ID${NC}"
echo -e "User:    ${YELLOW}$CURRENT_USER${NC}"
echo -e "Target:  ${YELLOW}$SA_EMAIL${NC}"
echo "---------------------------------------"

# ==========================================
# CHECK EXISTING SERVICE ACCOUNT
# ==========================================
gcloud config set project "$GCP_PROJECT_ID" --quiet > /dev/null 2>&1

if gcloud iam service-accounts describe "$SA_EMAIL" > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Service Account '$SA_NAME' already exists.${NC}"
    echo "Select an option:"
    echo "  [r] Replace (DELETE existing account and create new one)"
    echo "  [k] Keep (Use existing account, just rotate keys)"
    echo "  [c] Cancel"
    read -p "Enter choice: " choice
    case "$choice" in 
        r|R ) 
            echo -e "${RED}--- Deleting existing Service Account ---${NC}"
            gcloud iam service-accounts delete "$SA_EMAIL" --quiet
            CREATE_NEW=true
            ;;
        k|K ) 
            echo -e "${GREEN}--- Keeping existing Service Account ---${NC}"
            CREATE_NEW=false
            ;;
        * ) 
            echo "Aborting."
            exit 0
            ;;
    esac
else
    CREATE_NEW=true
fi

# ==========================================
# ENABLE APIS
# ==========================================
echo -e "${GREEN}--- Ensuring APIs are enabled ---${NC}"
gcloud services enable \
    iam.googleapis.com \
    drive.googleapis.com \
    sheets.googleapis.com \
    calendar-json.googleapis.com \
    gmail.googleapis.com \
    script.googleapis.com \
    cloudresourcemanager.googleapis.com

# ==========================================
# CREATE ACCOUNT (If needed)
# ==========================================
if [ "$CREATE_NEW" = true ]; then
    echo -e "${GREEN}--- Creating Service Account: $SA_NAME ---${NC}"
    gcloud iam service-accounts create "$SA_NAME" \
        --description="Worker for gas-fakes environment" \
        --display-name="GAS Fakes Worker"
    sleep 2
fi

# ==========================================
# GRANT PERMISSIONS
# ==========================================
echo -e "${GREEN}--- Granting 'Editor' Role to Service Account ---${NC}"
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/editor" \
    --condition=None --quiet > /dev/null

echo -e "${GREEN}--- Making You ($CURRENT_USER) the Delegate ---${NC}"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
    --member="user:$CURRENT_USER" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --condition=None --quiet > /dev/null

# ==========================================
# KEY GENERATION
# ==========================================
echo -e "${GREEN}--- Generating Key File: $KEY_FILE ---${NC}"
mkdir -p "$KEY_DIR"

if [ -f "$KEY_FILE" ]; then
    rm "$KEY_FILE"
fi

gcloud iam service-accounts keys create "$KEY_FILE" --iam-account="$SA_EMAIL"

# ==========================================
# UPDATE .ENV FILE
# ==========================================
echo -e "${GREEN}--- Updating .env file ---${NC}"

# Optionally update the Service Account file path
echo ""
read -p "Do you want to add SERVICE_ACCOUNT_FILE to .env? (y/N) " add_key_choice
echo $add_key_choice
if [[ "$add_key_choice" == "y" || "$add_key_choice" == "Y" ]]; then
    update_env_var "SERVICE_ACCOUNT_FILE" "$KEY_FILE"
fi

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}SUCCESS!${NC}"
echo -e "1. Service Account: $SA_EMAIL"
echo -e "2. Key File:        $KEY_FILE"
echo -e "${GREEN}==========================================${NC}"