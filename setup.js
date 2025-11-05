// setup.js: Setup for gas-fakes.

import prompts from "prompts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

// --- Utility Functions ---

/**
 * Checks if the gcloud CLI is installed and available in the system's PATH.
 * If not, it prints an informative message and exits the script.
 */
function checkForGcloudCli() {
  try {
    // Execute a simple, non-destructive command to check if gcloud exists.
    // The output is ignored to keep the console clean on success.
    execSync("gcloud --version", { stdio: "ignore" });
  } catch (error) {
    // The command failed, likely because gcloud is not installed or not in the PATH.
    console.error("\n[Error] Google Cloud SDK (gcloud CLI) not found.");
    console.error(
      "This script requires the gcloud CLI to manage authentication and Google Cloud services."
    );
    console.error("Please install it by following the official instructions:");
    console.error("https://cloud.google.com/sdk/gcloud");
    process.exit(1); // Exit the script with an error code.
  }
}

/**
 * Helper function to run a shell command and print its output.
 * @param {string} command The command to execute.
 */
function runCommand(command) {
  try {
    // Execute the command, inheriting stdio to show output/errors in real-time.
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    // The error message from the command is already shown due to 'inherit' stdio.
    process.exit(1);
  }
}

// --- Exported Command Implementations ---

/**
 * Handles the 'init' command to configure the .env file.
 */
export async function initializeConfiguration() {
  // Define the path to the .env file in the current working directory.
  const envPath = path.join(process.cwd(), ".env");
  let existingConfig = {};

  // --- Load existing values from .env file if it exists ---
  if (fs.existsSync(envPath)) {
    console.log(
      "Found existing .env file. Loading current values as defaults."
    );
    existingConfig = dotenv.config({ path: envPath , quiet: true }).parsed || {};
  }

  console.log("--------------------------------------------------");
  console.log("Configuring .env for gas-fakes");
  console.log("Press Enter to accept the default value in brackets.");
  console.log("--------------------------------------------------");

  const questions = [
    {
      type: "text",
      name: "GCP_PROJECT_ID",
      message: "Enter your GCP Project ID",
      initial: existingConfig.GCP_PROJECT_ID || "",
    },
    {
      type: "text",
      name: "DRIVE_TEST_FILE_ID",
      message: "Enter a test Drive file ID for authentication checks",
      initial: existingConfig.DRIVE_TEST_FILE_ID || "",
    },
    {
      type: "text",
      name: "CLIENT_CREDENTIAL_FILE",
      message: "Enter path to OAuth client credentials JSON (optional)",
      initial: existingConfig.CLIENT_CREDENTIAL_FILE || "",
    },
    {
      type: "text",
      name: "DEFAULT_SCOPES",
      message: "Enter default scopes",
      initial:
        existingConfig.DEFAULT_SCOPES ||
        "https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform",
    },
    {
      type: "text",
      name: "EXTRA_SCOPES",
      message: "Enter any extra scopes (comma-separated)",
      initial:
        existingConfig.EXTRA_SCOPES ||
        ",https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets",
    },
    {
      type: "select",
      name: "LOG_DESTINATION",
      message: "Enter logging destination",
      choices: [
        { title: "CONSOLE", value: "CONSOLE" },
        { title: "CLOUD", value: "CLOUD" },
        { title: "BOTH", value: "BOTH" },
        { title: "NONE", value: "NONE" },
      ],
      initial:
        ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(
          existingConfig.LOG_DESTINATION
        ) > -1
          ? ["CONSOLE", "CLOUD", "BOTH", "NONE"].indexOf(
              existingConfig.LOG_DESTINATION
            )
          : 0,
    },
    {
      type: "select",
      name: "STORE_TYPE",
      message: "Enter storage type",
      choices: [
        { title: "FILE", value: "FILE" },
        { title: "UPSTASH", value: "UPSTASH" },
      ],
      initial:
        ["FILE", "UPSTASH"].indexOf(existingConfig.STORE_TYPE?.toUpperCase()) >
        -1
          ? ["FILE", "UPSTASH"].indexOf(existingConfig.STORE_TYPE.toUpperCase())
          : 0,
    },
  ];

  const responses = await prompts(questions);

  if (responses.STORE_TYPE === "UPSTASH") {
    console.log(
      "Upstash storage selected. Please provide your Redis credentials."
    );
    const upstashQuestions = [
      {
        type: "text",
        name: "UPSTASH_REDIS_REST_URL",
        message: "Enter your Upstash Redis REST URL",
        initial: existingConfig.UPSTASH_REDIS_REST_URL || "",
      },
      {
        type: "text",
        name: "UPSTASH_REDIS_REST_TOKEN",
        message: "Enter your Upstash Redis REST Token",
        initial: existingConfig.UPSTASH_REDIS_REST_TOKEN || "",
      },
    ];
    const upstashResponses = await prompts(upstashQuestions);
    Object.assign(responses, upstashResponses);
  }

  const finalConfig = { ...existingConfig, ...responses };

  console.log("--------------------------------------------------");
  console.log(`Writing configuration to ${envPath}...`);

  let envContent = `
# Google Cloud Project ID (required)
GCP_PROJECT_ID="${finalConfig.GCP_PROJECT_ID || ""}"

# Path to OAuth client credentials for restricted scopes (optional)
CLIENT_CREDENTIAL_FILE="${finalConfig.CLIENT_CREDENTIAL_FILE || ""}"

# A test file ID for checking authentication (optional)
DRIVE_TEST_FILE_ID="${finalConfig.DRIVE_TEST_FILE_ID || ""}"

# Storage configuration for PropertiesService and CacheService ('FILE' or 'UPSTASH')
STORE_TYPE="${finalConfig.STORE_TYPE || "FILE"}"

# Logging destination for Logger.log() ('CONSOLE', 'CLOUD', 'BOTH', 'NONE')
LOG_DESTINATION="${finalConfig.LOG_DESTINATION || "CONSOLE"}"

# Scopes for authentication
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="${finalConfig.DEFAULT_SCOPES || ""}"
EXTRA_SCOPES="${finalConfig.EXTRA_SCOPES || ""}"
`.trim();

  if (
    finalConfig.UPSTASH_REDIS_REST_URL &&
    finalConfig.UPSTASH_REDIS_REST_TOKEN
  ) {
    envContent += `

# Upstash credentials (only used if STORE_TYPE is 'UPSTASH')
UPSTASH_REDIS_REST_URL="${finalConfig.UPSTASH_REDIS_REST_URL}"
UPSTASH_REDIS_REST_TOKEN="${finalConfig.UPSTASH_REDIS_REST_TOKEN}"
`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log("Setup complete. Your .env file has been updated.");
  console.log("--------------------------------------------------");
}

/**
 * Handles the 'auth' command to authenticate with Google Cloud.
 */
export function authenticateUser() {
  // First, check if gcloud CLI is available.
  checkForGcloudCli();

  const rootDirectory = process.cwd();
  const envPath = path.join(rootDirectory, ".env");

  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at '${envPath}'`);
    console.error("Please run './gas-fakes.js init' first.");
    process.exit(1);
  }

  dotenv.config({ path: envPath });

  const {
    GCP_PROJECT_ID,
    DEFAULT_SCOPES,
    EXTRA_SCOPES,
    CLIENT_CREDENTIAL_FILE,
    AC,
  } = process.env;

  if (!GCP_PROJECT_ID) {
    console.error("Error: GCP_PROJECT_ID is not set in your .env file.");
    process.exit(1);
  }

  const defaultScopes =
    DEFAULT_SCOPES ||
    "https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform";
  const extraScopes =
    EXTRA_SCOPES ||
    "https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets";

  let scopes = defaultScopes;
  if (extraScopes && extraScopes.length > 0) {
    scopes += (extraScopes.startsWith(",") ? "" : ",") + extraScopes;
  }

  const driveAccessFlag = "--enable-gdrive-access";

  console.log(`...requesting scopes ${scopes}`);

  let clientFlag = "";
  if (CLIENT_CREDENTIAL_FILE) {
    console.log("...attempting to use enhanced client credentials");

    let clientPath = CLIENT_CREDENTIAL_FILE;
    if (!path.isAbsolute(clientPath)) {
      clientPath = path.join(rootDirectory, clientPath);
    }

    if (fs.existsSync(clientPath)) {
      clientFlag = `--client-id-file="${clientPath}"`;
    } else {
      console.error(
        `Error: Client credential file specified in .env not found at '${clientPath}'`
      );
      process.exit(1);
    }
  } else {
    console.log(
      "\n...CLIENT_CREDENTIAL_FILE is not set. Using default Application Default Credentials (ADC)."
    );
    console.log(
      "...if you have requested any sensitive scopes, you'll see 'This app is blocked message.'"
    );
    console.log(
      "...To allow them see - https://github.com/brucemcpherson/gas-fakes/blob/main/GETTING_STARTED.md\n"
    );
  }

  const projectId = GCP_PROJECT_ID;
  const activeConfig = AC || "default";

  console.log("Revoking previous credentials...");
  try {
    execSync("gcloud auth revoke --quiet", { stdio: "ignore" });
  } catch (e) {
    /* ignore */
  }
  try {
    execSync("gcloud auth application-default revoke --quiet", {
      stdio: "ignore",
    });
  } catch (e) {
    /* ignore */
  }

  console.log(`Ensuring gcloud configuration '${activeConfig}' exists...`);
  try {
    execSync(`gcloud config configurations describe "${activeConfig}"`, {
      stdio: "ignore",
    });
    console.log(`Configuration '${activeConfig}' already exists.`);
  } catch (error) {
    console.log(`Configuration '${activeConfig}' not found. Creating it...`);
    runCommand(`gcloud config configurations create "${activeConfig}"`);
  }

  console.log(`Activating gcloud configuration: ${activeConfig}`);
  runCommand(`gcloud config configurations activate "${activeConfig}"`);

  console.log(`Setting project to: ${projectId}`);
  runCommand(`gcloud config set project ${projectId}`);
  runCommand(`gcloud config set billing/quota_project ${projectId}`);

  console.log("Initiating user login...");
  runCommand(`gcloud auth login ${driveAccessFlag}`);

  console.log("Initiating Application Default Credentials (ADC) login...");
  runCommand(
    `gcloud auth application-default login --scopes="${scopes}" ${clientFlag}`
  );
  runCommand(`gcloud auth application-default set-quota-project ${projectId}`);

  // --- Verification ---
  console.log("\nVerifying configuration...");

  const gcloudConfigDir =
    process.env.CLOUDSDK_CONFIG || path.join(os.homedir(), ".config", "gcloud");
  const activeConfigPath = path.join(gcloudConfigDir, "active_config");

  let currentConfig = "unknown";
  if (fs.existsSync(activeConfigPath)) {
    currentConfig = fs.readFileSync(activeConfigPath, "utf8").trim();
  } else {
    console.warn(
      `Warning: Could not find active_config file at ${activeConfigPath}`
    );
  }

  const currentProject = execSync("gcloud config get project")
    .toString()
    .trim();
  console.log(
    `Active config is ${currentConfig} - project is ${currentProject}`
  );

  console.log("\nFetching token information...");
  const userToken = execSync("gcloud auth print-access-token")
    .toString()
    .trim();
  const appDefaultToken = execSync(
    "gcloud auth application-default print-access-token"
  )
    .toString()
    .trim();

  console.log("\n...user token scopes");
  runCommand(
    `curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${userToken}`
  );

  console.log("\n...application default token scopes");
  runCommand(
    `curl https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${appDefaultToken}`
  );
  console.log("\nAuthentication process finished.");
}

/**
 * Handles the 'enableAPIs' command to enable necessary Google Cloud services.
 */
export function enableGoogleAPIs() {
  // First, check if gcloud CLI is available.
  checkForGcloudCli();

  const services = [
    "drive.googleapis.com",
    "sheets.googleapis.com",
    "forms.googleapis.com",
    "docs.googleapis.com",
    "gmail.googleapis.com",
    "logging.googleapis.com",
  ];

  console.log("Enabling necessary Google Cloud services...");
  runCommand(`gcloud services enable ${services.join(" ")}`);
  console.log("Services enabled successfully.");
}
