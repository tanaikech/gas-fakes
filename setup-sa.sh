#!/bin/bash

# ==========================================
# CONFIGURATION & COLORS
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' 

MANIFEST_FILE="appsscript.json"
SA_NAME="gas-fakes-worker"
KEY_DIR="private"
ENV_FILE=".env"
GITIGNORE=".gitignore"

# ==========================================
# HELPER FUNCTIONS
# ==========================================
update_env_var() {
    local key=$1
    local val=$2
    touch "$ENV_FILE"
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        perl -i -pe "s|^${key}=.*|${key}=\"${val}\"|" "$ENV_FILE"
        echo -e "Updated ${YELLOW}$key${NC} in .env"
    else
        echo "${key}=\"${val}\"" >> "$ENV_FILE"
        echo -e "Added ${YELLOW}$key${NC} to .env"
    fi
}

# ==========================================
# INPUT COLLECTION PHASE
# ==========================================
collect_inputs() {
    clear
    echo -e "${CYAN}--- Google Workspace & Cloud Run Setup ---${NC}"
    
    # Load existing env and check manifest
    [ -f "$ENV_FILE" ] && { set -a; source "$ENV_FILE"; set +a; }
    HAS_MANIFEST=$( [ -f "$MANIFEST_FILE" ] && echo "true" || echo "false" )

    GCP_PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    CURRENT_USER=$(gcloud config get-value account 2>/dev/null)
    SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

    if [[ -z "$GCP_PROJECT_ID" ]]; then
        echo -e "${RED}Error: No active GCP project. Run 'gcloud auth login' first.${NC}"; exit 1
    fi

    # 1. Auth Method
    echo -e "\n${YELLOW}1) Choose Authentication Method:${NC}"
    echo "  [1] Local JSON Key (Standard Development)"
    echo "  [2] Cloud Run (Workload Identity / Keyless)"
    read -p "Selection [1-2]: " AUTH_METHOD_CHOICE

    # 2. Scope Source
    echo -e "\n${YELLOW}2) Scope Resolution:${NC}"
    if [ "$HAS_MANIFEST" = "true" ]; then
        echo "  [1] Extract/Sync scopes from $MANIFEST_FILE (Default)"
        echo "  [2] Use existing EXTRA_SCOPES/DEFAULT_SCOPES from .env"
        read -p "Selection [1-2, default 1]: " SCOPE_CHOICE
        SCOPE_CHOICE=${SCOPE_CHOICE:-1}
    else
        echo -e "${RED}No manifest found. Defaulting to .env scopes.${NC}"
        SCOPE_CHOICE=2
    fi

    # 3. .env Update Choice
    echo -e "\n${YELLOW}3) Environment Update:${NC}"
    echo "  [1] Automatically update $ENV_FILE with results (Recommended)"
    echo "  [2] Do not update .env"
    read -p "Selection [1-2]: " WRITE_TO_ENV_CHOICE

    # 4. Service Account Lifecycle
    echo -e "\n${YELLOW}4) Service Account Action:${NC}"
    if gcloud iam service-accounts describe "$SA_EMAIL" > /dev/null 2>&1; then
        echo "  [1] Keep/Rotate existing Service Account"
        echo "  [2] Replace/Recreate Service Account"
        read -p "Selection [1-2]: " SA_ACTION_CHOICE
        [[ "$SA_ACTION_CHOICE" == "2" ]] && SA_ACTION="replace" || SA_ACTION="keep"
    else
        echo "  [1] Create new Service Account"
        read -p "Selection [1]: " SA_ACTION_CHOICE
        SA_ACTION="create"
    fi
}

# ==========================================
# CONFIRMATION PHASE
# ==========================================
confirm_inputs() {
    echo -e "\n${GREEN}==========================================${NC}"
    echo -e "${GREEN}    CONFIGURATION SUMMARY${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo -e "Project:         ${CYAN}$GCP_PROJECT_ID${NC}"
    echo -e "Auth Mode:       ${CYAN}$([ "$AUTH_METHOD_CHOICE" == "2" ] && echo "Cloud Run (Keyless)" || echo "Local JSON Key")${NC}"
    echo -e "Scope Source:    ${CYAN}$([ "$SCOPE_CHOICE" == "1" ] && echo "Manifest File" || echo ".env Variables")${NC}"
    echo -e "Update .env:     ${CYAN}$([ "$WRITE_TO_ENV_CHOICE" == "1" ] && echo "Yes" || echo "No")${NC}"
    echo -e "SA Action:       ${CYAN}$SA_ACTION${NC}"
    echo -e "------------------------------------------"
    
    echo "  [1] Proceed with execution"
    echo "  [2] Restart configuration"
    echo "  [3] Cancel"
    read -p "Selection [1-3]: " CONFIRM
    case "$CONFIRM" in
        1 ) return 0 ;;
        2 ) collect_inputs; confirm_inputs ;;
        * ) echo "Cancelled."; exit 0 ;;
    esac
}

# ==========================================
# EXECUTION PHASE
# ==========================================
execute_logic() {
    echo -e "\n${GREEN}--- Starting Execution ---${NC}"

    # 1. APIs
    gcloud services enable iam.googleapis.com iamcredentials.googleapis.com drive.googleapis.com sheets.googleapis.com gmail.googleapis.com --quiet

    # 2. SA Management
    if [[ "$SA_ACTION" == "replace" ]]; then
        gcloud iam service-accounts delete "$SA_EMAIL" --quiet
        sleep 2
    fi
    if ! gcloud iam service-accounts describe "$SA_EMAIL" > /dev/null 2>&1; then
        gcloud iam service-accounts create "$SA_NAME" --display-name="GAS Fakes Worker"
        sleep 2
    fi

    # 3. Permissions
    gcloud projects add-iam-policy-binding "$GCP_PROJECT_ID" --member="serviceAccount:$SA_EMAIL" --role="roles/editor" --quiet > /dev/null
    gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --member="serviceAccount:$SA_EMAIL" --role="roles/iam.serviceAccountTokenCreator" --quiet > /dev/null
    gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --member="user:$CURRENT_USER" --role="roles/iam.serviceAccountTokenCreator" --quiet > /dev/null

    # 4. Auth Credential Generation
    if [ "$AUTH_METHOD_CHOICE" == "1" ]; then
        mkdir -p "$KEY_DIR"
        FULL_KEY_PATH="$KEY_DIR/$SA_NAME.json"
        
        [ -f "$FULL_KEY_PATH" ] && rm "$FULL_KEY_PATH"
        gcloud iam service-accounts keys create "$FULL_KEY_PATH" --iam-account="$SA_EMAIL" --quiet
        
        echo -e "${GREEN}Key file created at $FULL_KEY_PATH${NC}"
        
        # .gitignore Safety
        if [ ! -f "$GITIGNORE" ]; then
            echo "$KEY_DIR/" > "$GITIGNORE"
            echo -e "${YELLOW}Created $GITIGNORE and added /$KEY_DIR/${NC}"
        elif ! grep -q "$KEY_DIR" "$GITIGNORE"; then
            echo "$KEY_DIR/" >> "$GITIGNORE"
            echo -e "${YELLOW}Added /$KEY_DIR/ to existing $GITIGNORE${NC}"
        fi

        # Ensure path is written to .env
        [[ "$WRITE_TO_ENV_CHOICE" == "1" ]] && update_env_var "SERVICE_ACCOUNT_FILE" "$FULL_KEY_PATH"
    fi

    # 5. Scopes Resolution
    if [[ "$SCOPE_CHOICE" == "1" ]]; then
        RAW_SCOPES=$(awk '/"oauthScopes": \[/,/\]/' "$MANIFEST_FILE" | grep 'http\|openid' | sed 's/[", ]//g' | tr '\n' ',' | sed 's/,$//')
    else
        RAW_SCOPES="${DEFAULT_SCOPES},${EXTRA_SCOPES}"
    fi

    FINAL_ADMIN_SCOPES=$(echo "$RAW_SCOPES" | tr -d '" ' | tr ',' '\n' | sort -u | paste -sd "," - | sed 's/^,//; s/,,*/,/g; s/,$//')
    if [[ "$WRITE_TO_ENV_CHOICE" == "1" ]]; then
        update_env_var "EXTRA_SCOPES" "$FINAL_ADMIN_SCOPES"
        update_env_var "GOOGLE_WORKSPACE_SUBJ" "$CURRENT_USER"
    fi

    SA_UNIQUE_ID=$(gcloud iam service-accounts describe "$SA_EMAIL" --format='get(uniqueId)')

    # Success Screen
    printf "\n${GREEN}==========================================${NC}\n"
    printf "SUCCESS! CONFIGURATION COMPLETE\n"
    printf "==========================================${NC}\n"
    printf "CLIENT ID:  ${CYAN}$SA_UNIQUE_ID${NC}\n"
    printf "SCOPES:     ${CYAN}${FINAL_ADMIN_SCOPES:-No scopes found}${NC}\n\n"
    printf "${YELLOW}Next Step: Add these scopes and client ID to Domain-Wide Delegation in Admin Console:${NC}\n"
    printf "https://admin.google.com/ac/owl/domainwidedelegation\n\n"
}

# ==========================================
# MAIN
# ==========================================
collect_inputs
confirm_inputs
execute_logic