

## Authentication 

Up till now gas-fakes has relied on ADC for authentication. This is fine for running locally, but in order to support more platforms gas-fakes will now also support Keyless Domain Wide Delegation (DWD). This will be the default method ongoing. This means we can use the same artifacts when running locally or using workload identity. In addition to the increased security, this also allows gas-fakes to be used in environments where ADC is not available, such as Cloud Run and Kubernetes. Another advantage is that we can also remove the complexity associated with using restricted Workspace scopes.

### DWD vs ADC Comparison

| Feature | Application Default Credentials (ADC) | Domain-Wide Delegation (DWD) |
| :--- | :--- | :--- |
| **Primary Use** | Local development and quick start | Production-ready, cross-platform deployment |
| **Platform Support** | Good for local, limited in some cloud environments | Universal (Local, Cloud Run, Kubernetes, Workload Identity) |
| **Security** | Direct user or service account permissions | Secure service-account based impersonation |
| **Configuration** | Prompt driven `gas-fakes auth init --adc` | Prompt driven `gas-fakes auth init --dwd` now the default. All service account creation etc is handled automatically.|
| **Admin action required** | Normally none | Yes, requires admin action to enable DWD for the service account. |
| **Workspace Scopes** | Can involve complex restricted scope management | Simplifies and streamlines restricted scope handling |
| **Scope setup** | From environment variables | Directly from project manifest |
| **Consistency** | Variations between local and cloud artifacts | Identical artifacts across all environments |
| **Service Account** | User or service account | Service account |

### gas-fakes auth init --dwd

This will now be the default method. All service account creation etc is handled automatically. A prompt driven dialog will guide you through the process.

### gas-fakes auth init --adc

This is still supported and can be used in cases where you cannot get admin access to enable DWD for the service account (which can only be done via tha admin GUI). In this mode scopes are set up using environment variables and gas-fakes can only be run locally. 



### environment variable name changes

For now all environment variables are still supported but will be deprecated in the future
GCP_PROJECT_ID -> GOOGLE_CLOUD_PROJECT

### other environment variables

At the time of writing these are the other environment variables used by gas-fakes. None of them need to be set manually as the are all maintained by gas-fakes-auth

| Variable | Description | Example / Value |
| :--- | :--- | :--- |
| **GOOGLE_CLOUD_PROJECT** | The GCP Project ID where the services are hosted. | `your-gcp-project-id` |
| **DRIVE_TEST_FILE_ID** | optional - ID of a Drive file used for integration testing. | `1iOqRbA6zbV3ry73iEf4y9cygtDchJvAh` |
| **STORE_TYPE** | The storage backend for persistence.| `UPSTASH`, `FILE` |
| **LOG_DESTINATION** | Destination for application logs. | `CONSOLE`, `CLOUD_LOGGING` |
| **DEFAULT_SCOPES** | Not required for DWD mode which retrieves scopes from manifest. Baseline identity and auth scopes. | `.../auth/userinfo.email, openid, ...` |
| **EXTRA_SCOPES** | Not required for DWD which retrieves scopes from manifest. Service-specific scopes (Drive, Sheets, etc.). | `.../auth/drive, .../auth/spreadsheets, ...` |
| **UPSTASH_REDIS_REST_URL** | REST URL for Upstash (if STORE_TYPE is UPSTASH). | `https://...upstash.io` |
| **UPSTASH_REDIS_REST_TOKEN** | REST Token for Upstash authentication. (if STORE_TYPE is UPSTASH).| `AVlrAA...` |
| **QUIET** | Suppresses non-essential logging output. | `true` or `false` |
| **GOOGLE_SERVICE_ACCOUNT_NAME** | Service account name used for DWD. | `gas-fakes-worker` |
| **AUTH_TYPE** | Authentication type to use. | `ADC`, `DWD` |


### shell scripts
All set up shell scripts related to authentication have been deprecated in favor of using gcloud auth application-default login in gavor of gas-fakes auth


