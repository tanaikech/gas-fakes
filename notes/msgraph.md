# <img src="../../../logo.png" alt="gas-fakes logo" width="50" align="top"> Microsoft Graph & OneDrive Authentication in `gas-fakes`

`gas-fakes` provides a "Keyless" and "Silent" runtime for Microsoft Graph, allowing your Google Apps Script code to interact with OneDrive as if it were performing native Drive operations.

## Key Principles

- **Zero-Cache**: Authentication tokens are **never** stored in local files. `gas-fakes` relies entirely on the OS-level Azure CLI cache or in-memory credentials.
- **Silent Runtime**: Once authorized, subsequent executions are 100% silent, leveraging a hardened CLI fallback mechanism.
- **Worker-Thread Auth**: All authentication logic, including interactive fallbacks, is handled within the worker thread to maintain synchronous execution in your main script.
- **Local Cache**: To eliminate redundant login prompts, tokens can be stored locally in `.msgraph-token.jwt`. **See Security Advisory below.**
- **Automatic Refresh**: If the cached access token expires, `gas-fakes` automatically falls back to the Azure CLI to refresh it silently.

---

## Getting Started

### 1. Requirements
You must have the **Azure CLI (`az`)** installed on your machine.
[Install Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

### 2. Initialization
Run the `gas-fakes` initialization and select `msgraph` as a backend (you can also the other backends mentioned for multi client use - this example sets up gas-fakes to use any or all of google workspace, ms graph or ksuite):
```bash
gas-fakes init -b msgraph,google,ksuite
```
This will add `msgraph,google,ksuite` to your `GF_PLATFORM_AUTH` in the `.env` file.

### 3. One-Time Setup
To populate the OS-level cache for silent runs, perform a one-time login:
```bash
gas-fakes auth 
```
- **Quiet Experience**: `gas-fakes` automatically suppresses redundant subscription selectors and verbose JSON output for a professional onboarding experience.
- **Silent Fallback**: This process enables the "Silent Runtime" for all future executions.

---

## Important Caveats & "Oddities"

Note that I don't have any Microsoft licenses, or a business account, and apparently I don't qualify for the Microsoft developer program that would allow me to get one. I've attempted to theoritically support theses and other scenarios, but I've only been able to test on personal accounts. If you're a gas-fakes user and have a business account,and other Microsoft license variants, I'd love to hear about your experiences - and would welcome any collaboration you can provide for this open source project. 

### 1. Consumer (Personal) Account Focus
Currently, `gas-fakes` has been **only tested with Personal Microsoft Accounts (OneDrive Personal)**. While it supports custom App Registrations, personal accounts are the most stable path for "keyless" local development. The default tenant used for fallback is now `consumers`.

### 2. The "SPO License" Error
If you are using a Business account, a Guest account, or an External (EXT) identity, you may encounter a `400 Bad Request: Tenant does not have a SPO license` error.
- **Why?**: Microsoft Graph requires a SharePoint Online (SPO) license to access the `/me/drive` endpoint. Many business guest accounts or restricted identities do not have this license assigned.
- **Resolution**: Ensure you are logged into an account with an active OneDrive/SharePoint license, or use a standard Personal account. If other issues arise please log an issue on github as this track has not yet been able to be tested.

### 3. "Unwanted" Interactive Login
If the silent CLI fallback fails, `gas-fakes` might trigger an **interactive browser fallback** directly from the worker threa, although it should be able to take care of this silently. If you see this raise an issue along with details of your environment.
- **Behavior**: A browser window will open to request consent or credentials, just needing your consent.


---

## Security Advisory: Local Token Storage

For consumer accounts, `gas-fakes` caches MS Graph tokens in a local file called `.msgraph-token.jwt` in your project root.

### Risks
1. **Locally Signed JWT Storage**: Tokens are stored as a locally-signed JWT (JSON Web Token), rather than plaintext JSON. While `gas-fakes` also sets restrictive file permissions (`chmod 600`), and this prevents casual viewing and tampering, the token is still readable by the node process.
2. **Persistence**: These tokens grant persistent access to your OneDrive/SharePoint resources until they expire along with the ability to silently refresh.
3. **Commit Risk**: **CRITICAL**: Ensure `**/.msgraph-token.jwt` is added to your `.gitignore`. Pushing this file to a public repository could expose some token info. 

### Mitigations
- `gas-fakes` automatically adds `.msgraph-token.jwt` to `.gitignore` during `init`.
- If you prefer a "Zero-Cache" approach, delete the `.msgraph-token.jwt` file and rely on the Azure CLI cache (which may require occasional re-auth).

---

## Technical Details

### Silent Fallback Hierarchy
When your script requests a token, `gas-fakes` attempts the following in order:
1. **Local Token Cache**: Checks `.msgraph-token.jwt` for a valid, non-expired token or a way to refresh one.
2. **Custom Client ID + Tenant**: Uses your `.env` configuration for your specific App Registration.
3. **Universal CLI Fallback**: Automatically picks up the active Azure CLI session from your machine, defaulting to `consumers` if no specific tenant is provided.
4. **Interactive Fallback**: Opens a browser if all silent methods fail, also defaulting to the `consumers` tenant.

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

