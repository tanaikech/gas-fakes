// setup.js: Setup for gas-fakes.

import prompts from "prompts";
import dotenv from "dotenv";
import fs from "fs/promises";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

// --- Utility Functions ---

/**
 * Search .env file
 * @param {string} dir - Start directory
 * @returns {Promise<string[]>}
 */
async function findEnvFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const promises = entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") {
          return Promise.resolve([]);
        }
        return findEnvFiles(fullPath);
      } else if (entry.isFile() && entry.name === ".env") {
        return Promise.resolve(fullPath);
      }
      return Promise.resolve([]);
    });
    const results = await Promise.all(promises);
    return results.flat();
  } catch (err) {
    console.error(`No directory: ${dir}`);
    return [];
  }
}

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
  let envPath = path.join(process.cwd(), ".env");
  const searchPath = process.cwd(); // or process.env.HOME
  const absoluteSearchPath = path.resolve(searchPath);
  const foundFiles = await findEnvFiles(absoluteSearchPath);
  if (foundFiles.length > 0) {
    // Check .env on the top directory.
    const results = foundFiles
      .map((file) => file.split("/"))
      .sort((a, b) => (a.length > b.length ? 1 : -1));
    envPath = results[0].join("/");
  }

  let existingConfig = {};

  // Load existing values from .env file if it exists to use as defaults for prompts.
  if (existsSync(envPath)) {
    console.log(
      "Found existing .env file. Loading current values as defaults."
    );
    existingConfig = dotenv.parse(readFileSync(envPath));
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

  // If the user cancels (e.g., Ctrl+C), prompts returns undefined for the keys.
  if (typeof responses.GCP_PROJECT_ID === "undefined") {
    console.log("Initialization cancelled.");
    return; // Exit the function without writing to file.
  }

  // If Upstash is selected, ask for its credentials.
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

    if (typeof upstashResponses.UPSTASH_REDIS_REST_URL === "undefined") {
      console.log("Initialization cancelled during Upstash configuration.");
      return;
    }
    Object.assign(responses, upstashResponses);
  }

  console.log("--------------------------------------------------");
  console.log(`Writing configuration to ${envPath}...`);

  if (!existsSync(envPath)) {
    // --- Create a new .env file from a template ---
    let envContent = `
# Google Cloud Project ID (required)
GCP_PROJECT_ID="${responses.GCP_PROJECT_ID || ""}"

# Path to OAuth client credentials for restricted scopes (optional)
CLIENT_CREDENTIAL_FILE="${responses.CLIENT_CREDENTIAL_FILE || ""}"

# A test file ID for checking authentication (optional)
DRIVE_TEST_FILE_ID="${responses.DRIVE_TEST_FILE_ID || ""}"

# Storage configuration for PropertiesService and CacheService ('FILE' or 'UPSTASH')
STORE_TYPE="${responses.STORE_TYPE || "FILE"}"

# Logging destination for Logger.log() ('CONSOLE', 'CLOUD', 'BOTH', 'NONE')
LOG_DESTINATION="${responses.LOG_DESTINATION || "CONSOLE"}"

# Scopes for authentication
# these are the scopes set by default - take some of these out if you want to minimize access
DEFAULT_SCOPES="${responses.DEFAULT_SCOPES || ""}"
EXTRA_SCOPES="${responses.EXTRA_SCOPES || ""}"
`.trim();

    if (responses.STORE_TYPE === "UPSTASH") {
      envContent += `

# Upstash credentials (only used if STORE_TYPE is 'UPSTASH')
UPSTASH_REDIS_REST_URL="${responses.UPSTASH_REDIS_REST_URL || ""}"
UPSTASH_REDIS_REST_TOKEN="${responses.UPSTASH_REDIS_REST_TOKEN || ""}"
`;
    }
    writeFileSync(envPath, envContent, "utf8");
  } else {
    // --- Update the existing .env file ---
    let envContent = readFileSync(envPath, "utf8");

    const configToUpdate = { ...responses };

    for (const key of Object.keys(configToUpdate)) {
      const value = configToUpdate[key] || "";
      const keyRegex = new RegExp(`^\\s*${key}\\s*=.*$`, "m");

      if (keyRegex.test(envContent)) {
        envContent = envContent.replace(keyRegex, `${key}="${value}"`);
      } else {
        if (envContent.length > 0 && !envContent.endsWith("\n")) {
          envContent += "\n";
        }
        envContent += `${key}="${value}"\n`;
      }
    }
    writeFileSync(envPath, envContent, "utf8");
  }

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

  if (!existsSync(envPath)) {
    console.error(`Error: .env file not found at '${envPath}'`);
    console.error("Please run './gas-fakes.js init' first.");
    process.exit(1);
  }

  dotenv.config({ path: envPath, quiet: true });

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

    if (existsSync(clientPath)) {
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
  if (existsSync(activeConfigPath)) {
    currentConfig = readFileSync(activeConfigPath, "utf8").trim();
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
 * Handles the 'enableAPIs' command to enable or disable necessary Google Cloud services based on options.
 * @param {object} options Options object provided by commander.js.
 */
export function enableGoogleAPIs(options) {
  checkForGcloudCli();

  const API_SERVICES = {
    drive: "drive.googleapis.com",
    sheets: "sheets.googleapis.com",
    forms: "forms.googleapis.com",
    docs: "docs.googleapis.com",
    gmail: "gmail.googleapis.com",
    logging: "logging.googleapis.com",
  };

  const servicesToEnable = new Set();
  const servicesToDisable = new Set();
  if (options.all || Object.keys(options).length === 0) {
    Object.values(API_SERVICES).forEach((service) =>
      servicesToEnable.add(service)
    );
  } else {
    for (const key in API_SERVICES) {
      if (options[`e${key}`]) {
        servicesToEnable.add(API_SERVICES[key]);
      }
      if (options[`d${key}`]) {
        servicesToDisable.add(API_SERVICES[key]);
      }
    }
  }
  if (servicesToEnable.size > 0) {
    const enableList = Array.from(servicesToEnable);
    console.log(`Enabling Google Cloud services: ${enableList.join(", ")}...`);
    runCommand(`gcloud services enable ${enableList.join(" ")}`);
    console.log("Services enabled successfully.");
  }
  if (servicesToDisable.size > 0) {
    const disableList = Array.from(servicesToDisable);
    console.log(
      `Disabling Google Cloud services: ${disableList.join(", ")}...`
    );
    runCommand(`gcloud services disable ${disableList.join(" ")}`);
    console.log("Services disabled successfully.");
  }
  if (
    servicesToEnable.size === 0 &&
    servicesToDisable.size === 0 &&
    Object.keys(options).length > 0 &&
    !options.all
  ) {
    console.log("No specific APIs were selected to enable or disable.");
    console.log(
      "Use '--all' to enable all default APIs, or specify flags like '--edrive' or '--ddrive'."
    );
  }
}
