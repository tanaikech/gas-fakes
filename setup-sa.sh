#!/bin/bash

# ==========================================
# CONFIGURATION & COLORS
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

MANIFEST_FILE="appsscript.json"

# Helper function to update .env safely
update_env_var() {
    local key=$1
    local val=$2
    local file=".env"
    if grep -q "^${key}=" "$file"; then
        [[ "$OSTYPE" == "darwin"* ]] && sed -i '' "s|^${key}=.*|${key}=\"${val}\"|" "$file" || sed -i "s|^${key}=.*|${key}=\"${val}\"|" "$file"
        echo -e "Updated ${YELLOW}$key${NC}"
    else
        echo "${key}=\"${val}\"" >> "$file"
        echo -e "Added ${YELLOW}$key${NC}"
    fi
}

# 1. Load .env
[ -f .env ] && { set -a; source .env; set +a; } || touch .env

# 2. Get Gcloud Identity
CURRENT_USER=$(gcloud config get-value account 2>/dev/null)
GCP_PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [[ -z "$CURRENT_USER" || "$CURRENT_USER" == "(unset)" ]]; then
    echo -e "${RED}Error: Run 'gcloud auth login' first.${NC}"; exit 1
fi

# Constants
SA_NAME="gas-fakes-worker"
SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"
KEY_DIR="private"
KEY_FILE="$KEY_DIR/$SA_NAME.json"

# ==========================================
# SCOPE RESOLUTION (Optional Manifest Extraction)
# ==========================================
USE_MANIFEST=false
if [ -f "$MANIFEST_FILE" ]; then
    echo -e "${CYAN}Found $MANIFEST_FILE.${NC}"
    read -p "Extract oauthScopes from manifest into .env? (y/N): " manifest_choice
    [[ "$manifest_choice" == "y" || "$manifest_choice" == "Y" ]] && USE_MANIFEST=true
fi

if [ "$USE_MANIFEST" = true ]; then
    echo -e "${GREEN}--- Extracting oauthScopes from $MANIFEST_FILE ---${NC}"
    
    # Robust extraction: Finds the oauthScopes array and pulls strings between quotes
    # It handles multi-line arrays and ignores other properties
    EXTRACTED_SCOPES=$(awk '/"oauthScopes": \[/,/\]/' "$MANIFEST_FILE" | grep 'http\|openid' | sed 's/[", ]//g' | tr '\n' ',' | sed 's/,$//')

    if [ -n "$EXTRACTED_SCOPES" ]; then
        update_env_var "EXTRA_SCOPES" "$EXTRACTED_SCOPES"
        # Reload env variables for the final printout
        set -a; source .env; set +a
    else
        echo -e "${RED}Error: Could not find oauthScopes in $MANIFEST_FILE${NC}"
    fi
else
    echo -e "${YELLOW}--- Using existing EXTRA_SCOPES from .env ---${NC}"
fi

# ==========================================
# SERVICE ACCOUNT & KEY LOGIC
# ==========================================
gcloud config set project "$GCP_PROJECT_ID" --quiet > /dev/null 2>&1

if gcloud iam service-accounts describe "$SA_EMAIL" > /dev/null 2>&1; then
    echo -e "${YELLOW}Service Account '$SA_NAME' exists.${NC}"
    echo "Options: [r] Replace, [k] Keep/Rotate Keys, [c] Cancel"
    read -p "Choice: " choice
    case "$choice" in 
        r|R ) 
            gcloud iam service-accounts delete "$SA_EMAIL" --quiet
            CREATE_NEW=true ;;
        k|K ) 
            CREATE_NEW=false ;;
        * ) exit 0 ;;
    esac
else
    CREATE_NEW=true
fi

echo -e "${GREEN}--- Enabling APIs ---${NC}"
gcloud services enable iam.googleapis.com drive.googleapis.com sheets.googleapis.com gmail.googleapis.com --quiet

if [ "$CREATE_NEW" = true ]; then
    echo -e "${GREEN}--- Creating Service Account ---${NC}"
    gcloud iam service-accounts create "$SA_NAME" --display-name="GAS Fakes Worker"
    sleep 2
fi

# Permissions
echo -e "${GREEN}--- Updating Permissions ---${NC}"
gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$SA_EMAIL" --role="roles/editor" --condition=None --quiet > /dev/null
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --member="user:$CURRENT_USER" --role="roles/iam.serviceAccountTokenCreator" --condition=None --quiet > /dev/null

# Key Generation
mkdir -p "$KEY_DIR"
[ -f "$KEY_FILE" ] && rm "$KEY_FILE"
gcloud iam service-accounts keys create "$KEY_FILE" --iam-account="$SA_EMAIL" --quiet

SA_UNIQUE_ID=$(gcloud iam service-accounts describe "$SA_EMAIL" --format='get(uniqueId)')

#
# optionally write filename and subject to .env
read -p "Write filename and subject to .env? (y/N): " env_choice
[[ "$env_choice" == "y" || "$env_choice" == "Y" ]] && update_env_var "SERVICE_ACCOUNT_FILE" "$SA_NAME.json" && update_env_var "GOOGLE_WORKSPACE_SUBJ" "$SA_EMAIL"


# ==========================================
# FINAL STRING GENERATION
# ==========================================
# 1. Merge the variables
ALL_SCOPES_RAW="${DEFAULT_SCOPES},${EXTRA_SCOPES}"

# 2. Advanced Cleanup:
#    - tr -d: Removes quotes and spaces
#    - tr ',': Splits into lines for sorting
#    - sort -u: Deduplicates
#    - paste: Joins lines with commas
#    - sed: Removes any possible leading/trailing comma or double commas
FINAL_ADMIN_SCOPES=$(echo "$ALL_SCOPES_RAW" | tr -d '" ' | tr ',' '\n' | sort -u | paste -sd "," - | sed 's/^,//; s/,,*/,/g; s/,$//')

# ==========================================
# OUTPUT
# ==========================================
printf "\n${GREEN}==========================================${NC}\n"
printf "${GREEN}SUCCESS! CONFIGURATION COMPLETE${NC}\n"
printf "${GREEN}==========================================${NC}\n"
printf "${YELLOW}You need to copy the following client ID and scopes to the Workspace Admin Console${NC}\n"
printf "${YELLOW}This will enable domain wide delegation for the service account${NC}\n"
printf "Project:    ${CYAN}$GCP_PROJECT_ID${NC}\n"
printf "Client ID:  ${CYAN}$SA_UNIQUE_ID${NC}\n"
printf "\n"
printf "URL: https://admin.google.com/ac/owl/domainwidedelegation\n"
printf "\n${CYAN}$FINAL_ADMIN_SCOPES${NC}\n\n"