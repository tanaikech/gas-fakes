# <img src="../../../logo.png" alt="gas-fakes logo" width="50" align="top"> Microsoft Graph & OneDrive Authentication in `gas-fakes`

`gas-fakes` provides a "Keyless" and "Silent" runtime for Microsoft Graph, allowing your Google Apps Script code to interact with OneDrive as if it were performing native Drive operations.

## Key Principles

- **Zero-Cache**: Authentication tokens are **never** stored in local files. `gas-fakes` relies entirely on the OS-level Azure CLI cache or in-memory credentials.
- **Silent Runtime**: Once authorized, subsequent executions are 100% silent, leveraging a hardened CLI fallback mechanism.
- **Worker-Thread Auth**: All authentication logic, including interactive fallbacks, is handled within the worker thread to maintain synchronous execution in your main script.

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

## Technical Details

### Silent Fallback Hierarchy
When your script requests a token, `gas-fakes` attempts the following in order:
1. **Custom Client ID + Tenant**: Uses your `.env` configuration for your specific App Registration.
2. **Universal CLI Fallback**: (The "Magic Bullet") Automatically picks up the active Azure CLI session from your machine, regardless of the tenant GUID.
3. **Interactive Fallback**: Opens a browser if all silent methods fail.

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
