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
log_info() { printf "${CYAN}%b${NC}\n" "$1"; }
log_success() { printf "${GREEN}%b${NC}\n" "$1"; }
log_warn() { printf "${YELLOW}%b${NC}\n" "$1"; }
log_error() { printf "${RED}%b${NC}\n" "$1"; }

update_env_var() {
    local key=$1
    local val=$2
    touch "$ENV_FILE"
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        K="$key" V="$val" perl -i -pe 's|^$ENV{K}=.*|$ENV{K}="$ENV{V}"|' "$ENV_FILE"
        log_warn "Updated $key in .env"
    else
        echo "${key}=\"${val}\"" >> "$ENV_FILE"
        log_warn "Added $key to .env"
    fi
}

# ==========================================
# INPUT COLLECTION PHASE
# ==========================================
collect_inputs() {
    clear
    printf "${CYAN}%s${NC}\n" "--- Google Workspace & Cloud Run Setup ---"
    
    # Load existing env and check manifest
    [ -f "$ENV_FILE" ] && { set -a; source "$ENV_FILE"; set +a; }
    HAS_MANIFEST=$( [ -f "$MANIFEST_FILE" ] && echo "true" || echo "false" )

    GCP_PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    CURRENT_USER=$(gcloud config get-value account 2>/dev/null)
    SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

    if [[ -z "$GCP_PROJECT_ID" ]]; then
        log_error "Error: No active GCP project. Run 'gcloud auth login' first."; exit 1
    fi

    # 1. Auth Method
    printf "\n${YELLOW}1) Choose Authentication Method:${NC}\n"
    printf "  [1] Local JSON Key (Standard Development)\n"
    printf "  [2] Cloud Run (Workload Identity / Keyless)\n"
    read -p "Selection [1-2]: " AUTH_METHOD_CHOICE

    # 2. Scope Source
    printf "\n${YELLOW}2) Scope Resolution:${NC}\n"
    if [ "$HAS_MANIFEST" = "true" ]; then
        printf "  [1] Extract/Sync scopes from $MANIFEST_FILE (Default)\n"
        printf "  [2] Use existing EXTRA_SCOPES/DEFAULT_SCOPES from .env\n"
        read -p "Selection [1-2, default 1]: " SCOPE_CHOICE
        SCOPE_CHOICE=${SCOPE_CHOICE:-1}
    else
        log_error "No manifest found. Defaulting to .env scopes."
        SCOPE_CHOICE=2
    fi

    # 3. .env Update Choice
    printf "\n${YELLOW}3) Environment Update:${NC}\n"
    printf "  [1] Automatically update $ENV_FILE with results (Recommended)\n"
    printf "  [2] Do not update .env\n"
    read -p "Selection [1-2]: " WRITE_TO_ENV_CHOICE

    # 4. Service Account Lifecycle
    printf "\n${YELLOW}4) Service Account Action:${NC}\n"
    if gcloud iam service-accounts describe "$SA_EMAIL" > /dev/null 2>&1; then
        printf "  [1] Keep/Rotate existing Service Account\n"
        printf "  [2] Replace/Recreate Service Account\n"
        read -p "Selection [1-2]: " SA_ACTION_CHOICE
        [[ "$SA_ACTION_CHOICE" == "2" ]] && SA_ACTION="replace" || SA_ACTION="keep"
    else
        printf "  [1] Create new Service Account\n"
        read -p "Selection [1]: " SA_ACTION_CHOICE
        SA_ACTION="create"
    fi
}

# ==========================================
# CONFIRMATION PHASE
# ==========================================
confirm_inputs() {
    printf "\n${GREEN}%s${NC}\n" "=========================================="
    printf "${GREEN}    CONFIGURATION SUMMARY${NC}\n"
    printf "${GREEN}%s${NC}\n" "=========================================="
    printf "Project:         ${CYAN}$GCP_PROJECT_ID${NC}\n"
    printf "Auth Mode:       ${CYAN}$([ "$AUTH_METHOD_CHOICE" == "2" ] && echo "Cloud Run (Keyless)" || echo "Local JSON Key")${NC}\n"
    printf "Scope Source:    ${CYAN}$([ "$SCOPE_CHOICE" == "1" ] && echo "Manifest File" || echo ".env Variables")${NC}\n"
    printf "Update .env:     ${CYAN}$([ "$WRITE_TO_ENV_CHOICE" == "1" ] && echo "Yes" || echo "No")${NC}\n"
    printf "SA Action:       ${CYAN}$SA_ACTION${NC}\n"

    if [ "$AUTH_METHOD_CHOICE" == "1" ]; then
        USER_KEYS=$(gcloud iam service-accounts keys list --iam-account="$SA_EMAIL" --filter="keyType=USER_MANAGED" --sort-by=metadata.createTime --format="value(name)" 2>/dev/null)
        KEY_COUNT=$(echo "$USER_KEYS" | grep -v '^$' | wc -l | tr -d ' ')
        printf "Existing Keys:   ${CYAN}$KEY_COUNT${NC} (Max 10)\n"
        if [ "$KEY_COUNT" -ge 9 ]; then
            printf "${RED}WARNING: Service account is at/near key limit ($KEY_COUNT/10).${NC}\n"
            printf "${RED}Oldest keys will be deleted upon execution.${NC}\n"
        fi
    fi

    printf "%s\n" "------------------------------------------"
    
    printf "  [1] Proceed with execution\n"
    printf "  [2] Restart configuration\n"
    printf "  [3] Cancel\n"
    read -p "Selection [1-3]: " CONFIRM
    case "$CONFIRM" in
        1 ) return 0 ;;
        2 ) collect_inputs; confirm_inputs ;;
        * ) printf "Cancelled.\n"; exit 0 ;;
    esac
}

# ==========================================
# EXECUTION PHASE
# ==========================================
execute_logic() {
    printf "\n${GREEN}%s${NC}\n" "--- Starting Execution ---"

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
        
        # Cleanup: Delete oldest keys if we are near the limit (10)
        # Sort by creation time so oldest are at the top
        USER_KEYS=$(gcloud iam service-accounts keys list --iam-account="$SA_EMAIL" --filter="keyType=USER_MANAGED" --sort-by=metadata.createTime --format="value(name)")
        KEY_COUNT=$(echo "$USER_KEYS" | grep -v '^$' | wc -l | tr -d ' ')
        
        if [ "$KEY_COUNT" -ge 9 ]; then
            log_warn "Service account has $KEY_COUNT keys. The limit is 10."
            log_warn "Deleting oldest keys is required to continue."
            read -p "Delete oldest keys and proceed? [y/N]: " CONFIRM_DELETE
            if [[ ! "$CONFIRM_DELETE" =~ ^[Yy]$ ]]; then
                log_error "Deletion cancelled. Exiting as key limit reached."
                exit 1
            fi

            log_warn "Deleting oldest keys..."
            # Delete all but the most recent 2 keys. Calculate how many to delete.
            DELETE_COUNT=$((KEY_COUNT - 2))
            echo "$USER_KEYS" | head -n "$DELETE_COUNT" | while read -r KEY_NAME; do
                gcloud iam service-accounts keys delete "$KEY_NAME" --iam-account="$SA_EMAIL" --quiet > /dev/null 2>&1
            done
        fi

        [ -f "$FULL_KEY_PATH" ] && rm "$FULL_KEY_PATH"
        if gcloud iam service-accounts keys create "$FULL_KEY_PATH" --iam-account="$SA_EMAIL" --quiet; then
            log_success "Key file created at $FULL_KEY_PATH"
            
            # .gitignore Safety
            if [ ! -f "$GITIGNORE" ]; then
                echo "$KEY_DIR/" > "$GITIGNORE"
                log_warn "Created $GITIGNORE and added /$KEY_DIR/"
            elif ! grep -q "$KEY_DIR" "$GITIGNORE"; then
                echo "$KEY_DIR/" >> "$GITIGNORE"
                log_warn "Added /$KEY_DIR/ to existing $GITIGNORE"
            fi

            # Ensure path is written to .env
            [[ "$WRITE_TO_ENV_CHOICE" == "1" ]] && update_env_var "SERVICE_ACCOUNT_FILE" "$FULL_KEY_PATH"
        else
            log_error "\nERROR: Failed to create Service Account Key."
            log_warn "This is likely due to an Organization Policy: 'iam.disableServiceAccountKeyCreation'"
            log_warn "Recommendation: Use Choice [2] (Cloud Run / Workload Identity) which does not require keys.\n"
            exit 1
        fi
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
    printf "\n${GREEN}%s${NC}\n" "=========================================="
    printf "SUCCESS! CONFIGURATION COMPLETE\n"
    printf "${GREEN}%s${NC}\n" "=========================================="
    printf "CLIENT ID:  ${CYAN}%s${NC}\n" "$SA_UNIQUE_ID"
    printf "SCOPES:     ${CYAN}%s${NC}\n\n" "${FINAL_ADMIN_SCOPES:-No scopes found}"
    printf "${YELLOW}%s${NC}\n" "Next Step: Add these scopes and client ID to Domain-Wide Delegation in Admin Console:"
    printf "https://admin.google.com/ac/owl/domainwidedelegation\n\n"
}

# ==========================================
# MAIN
# ==========================================
collect_inputs
confirm_inputs
execute_logic