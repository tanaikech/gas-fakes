# <img src="../../../logo.png" alt="gas-fakes logo" width="50" align="top"> Microsoft Graph & OneDrive Authentication in `gas-fakes`

`gas-fakes` provides a "Keyless" and "Silent" runtime for Microsoft Graph, allowing your Google Apps Script code to interact with OneDrive as if it were performing native Drive operations.

## Key Principles

- **Zero-Cache**: Authentication tokens are **never** stored in local files. `gas-fakes` relies entirely on the OS-level Azure CLI cache or in-memory credentials.
- **Silent Runtime**: Once authorized, subsequent executions are 100% silent, leveraging a hardened CLI fallback mechanism.
- **Worker-Thread Auth**: All authentication logic, including interactive fallbacks, is handled within the worker thread to maintain synchronous execution in your main script.
- **Local Cache (Security Risk)**: To eliminate redundant login prompts, tokens can be stored locally in `.msgraph-token.json`. **See Security Advisory below.**
- **Automatic Refresh**: If the cached access token expires, `gas-fakes` automatically falls back to the Azure CLI to refresh it silently.

---

## Getting Started

### 1. Requirements
You must have the **Azure CLI (`az`)** installed on your machine.
[Install Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

### 2. Initialization
Run the `gas-fakes` initialization and select `msgraph` as a backend:
```bash
gas-fakes init -b msgraph
```
This will add `msgraph` to your `GF_PLATFORM_AUTH` in the `.env` file.

### 3. One-Time Setup
To populate the OS-level cache for silent runs, perform a one-time login:
```bash
gas-fakes auth -b msgraph
```
- **Quiet Experience**: `gas-fakes` automatically suppresses redundant subscription selectors and verbose JSON output for a professional onboarding experience.
- **Silent Fallback**: This process enables the "Silent Runtime" for all future executions.

---

## Important Caveats & "Oddities"

### 1. Consumer (Personal) Account Focus
Currently, `gas-fakes` has been **primarily tested with Personal Microsoft Accounts (OneDrive Personal)**. While it supports custom App Registrations, personal accounts are the most stable path for "keyless" local development.

### 2. The "SPO License" Error
If you are using a Business account, a Guest account, or an External (EXT) identity, you may encounter a `400 Bad Request: Tenant does not have a SPO license` error.
- **Why?**: Microsoft Graph requires a SharePoint Online (SPO) license to access the `/me/drive` endpoint. Many business guest accounts or restricted identities do not have this license assigned.
- **Resolution**: Ensure you are logged into an account with an active OneDrive/SharePoint license, or use a standard Personal account.

### 3. "Unwanted" Interactive Login
If the silent CLI fallback fails (e.g., your session expired or you logged into a different directory), `gas-fakes` will trigger an **interactive browser fallback** directly from the worker thread.
- **Behavior**: A browser window will open to request consent or credentials.
- **Note**: While this provides resiliency, it interrupts the "silent" flow. Running `gas-fakes auth -b msgraph` again will restore the silent runtime.

---

## Security Advisory: Local Token Storage

By default, `gas-fakes` now caches MS Graph tokens in a local file called `.msgraph-token.json` in your project root.

### Risks
1. **Plaintext Storage**: Tokens are stored in a simple JSON file. While `gas-fakes` attempts to set restrictive file permissions (`chmod 600`), the token is still readable by any process with your user privileges.
2. **Persistence**: These tokens grant persistent access to your OneDrive/SharePoint resources until they expire.
3. **Commit Risk**: **CRITICAL**: Ensure `**/.msgraph-token.json` is added to your `.gitignore`. Pushing this file to a public repository will expose your credentials.

### Mitigations
- `gas-fakes` automatically adds `.msgraph-token.json` to `.gitignore` during `init`.
- If you prefer a "Zero-Cache" approach, delete the `.msgraph-token.json` file and rely on the Azure CLI cache (which may require occasional re-auth).

---

## Technical Details

### Silent Fallback Hierarchy
When your script requests a token, `gas-fakes` attempts the following in order:
1. **Local Token Cache**: Checks `.msgraph-token.json` for a valid, non-expired token.
2. **Custom Client ID + Tenant**: Uses your `.env` configuration for your specific App Registration.
3. **Universal CLI Fallback**: (The "Magic Bullet") Automatically picks up the active Azure CLI session from your machine, regardless of the tenant GUID.
4. **Interactive Fallback**: Opens a browser if all silent methods fail.

### Programmatic Auth Status
You can check if a platform is authorized directly from your script:
```javascript
if (ScriptApp.__isPlatformAuthed('msgraph')) {
  console.log('MS Graph is ready!');
}
console.log('Currently authorized platforms:', ScriptApp.__platforms);
```

### Environment Variables
Managed via `gas-fakes init`:
- `MS_GRAPH_CLIENT_ID`: (Optional) Your custom Azure App Registration ID.
- `MS_GRAPH_TENANT_ID`: (Default: `common`) Set to `consumers` for personal accounts.
- `GF_PLATFORM_AUTH`: Must include `msgraph`.
