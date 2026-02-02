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
export async function initializeConfiguration(options = {}) {
  let envPath;

  if (options.env) {
    envPath = path.resolve(process.cwd(), options.env);
    console.log(`-> Using specified .env path: ${envPath}`);
  } else {
    const foundFiles = await findEnvFiles(process.cwd());
    if (foundFiles.length > 0) {
      const choices = foundFiles.map((file) => ({
        title: file,
        value: file,
      }));
      choices.push({
        title: "Create a new .env file in the current directory",
        value: "new",
      });

      const response = await prompts({
        type: "select",
        name: "envPathSelection",
        message: "Found .env file(s). Which one would you like to use?",
        choices: choices,
      });

      if (typeof response.envPathSelection === "undefined") {
        console.log("Initialization cancelled.");
        return;
      }

      if (response.envPathSelection === "new") {
        envPath = path.join(process.cwd(), ".env");
      } else {
        envPath = response.envPathSelection;
      }
    } else {
      console.log(
        "No .env file found. A new one will be created in the current directory."
      );
      envPath = path.join(process.cwd(), ".env");
    }
    console.log(`-> Using .env file at: ${envPath}`);
  }

  let existingConfig = {};
  if (existsSync(envPath)) {
    console.log(
      "Found existing .env file. Loading current values as defaults."
    );
    existingConfig = dotenv.parse(readFileSync(envPath));
  }

  console.log("--------------------------------------------------");
  console.log("Configuring .env for gas-fakes");
  console.log("Press Enter to accept the default value in brackets.");
  console.log("Use Space to select/deselect scopes.");
  console.log("--------------------------------------------------");

  const existingExtraScopes = existingConfig.EXTRA_SCOPES
    ? existingConfig.EXTRA_SCOPES.split(",").filter((s) => s)
    : [];

  const responses = {};

  // --- Stage 1: Basic Info ---
  const basicInfoQuestions = [
    {
      type: "text",
      name: "GOOGLE_CLOUD_PROJECT",
      message: "Enter your GCP Project ID",
      initial:
        existingConfig.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID,
    },
    {
      type: "text",
      name: "DRIVE_TEST_FILE_ID",
      message:
        "Enter a test Drive file ID for authentication checks (optional)",
      initial: existingConfig.DRIVE_TEST_FILE_ID || "",
    },
  ];

  const basicInfoResponses = await prompts(basicInfoQuestions);
  if (typeof basicInfoResponses.GCP_PROJECT_ID === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, basicInfoResponses);

  // --- Stage 2: Scopes ---

  const DEFAULT_SCOPES_VALUES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
    "https://www.googleapis.com/auth/cloud-platform",
  ];
  console.log(
    "\nThe following default scopes are required for basic operations and will be enabled automatically:"
  );
  DEFAULT_SCOPES_VALUES.forEach((scope) => console.log(`  - ${scope}`));
  responses.DEFAULT_SCOPES = DEFAULT_SCOPES_VALUES;

  const extraScopeQuestion = {
    type: "multiselect",
    name: "EXTRA_SCOPES",
    message: "Select any extra scopes your script requires",

    // i think we only need to have drive (which we must have for all the others anyway)
    choices: [
      {
        title: "Workspace resources",
        value: "https://www.googleapis.com/auth/drive",
      },
      /*
      {
        title: "Sheets (full access)",
        value: "https://www.googleapis.com/auth/spreadsheets",
      },
      {
        title: "Docs (full access)",
        value: "https://www.googleapis.com/auth/documents",
      },
      {
        title: "Forms (full access)",
        value: "https://www.googleapis.com/auth/forms",
      },
      {
        title: "Gmail (send mail)",
        value: "https://www.googleapis.com/auth/gmail.send",
      },
      {
        title: "Gmail (full access)",
        value: "https://www.googleapis.com/auth/gmail.modify",
      },
      */
      {
        // actually labels are not sensitive
        title: "Gmail labels",
        value: "https://www.googleapis.com/auth/gmail.labels",
      },
      {
        sensitivity: "sensitive",
        title: "Gmail compose",
        value: "https://www.googleapis.com/auth/gmail.compose",
      },
    ].map((scope) => ({
      ...scope,
      title: scope.sensitivity
        ? `[${scope.sensitivity}] ${scope.title}`
        : scope.title,
      // because we always need drive for ant extra scopes
      selected:
        existingExtraScopes.length > 0
          ? existingExtraScopes.includes(scope.value)
          : scope.value === "https://www.googleapis.com/auth/drive",
    })),
    hint: "- Use space to select/deselect. Press Enter to submit.",
  };

  // to check for any kind of sensitivity
  const sensitiveScopesList = extraScopeQuestion.choices.filter(
    (scope) => scope.sensitivity
  );

  const extraScopeResponses = await prompts(extraScopeQuestion);

  if (typeof extraScopeResponses.EXTRA_SCOPES === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, extraScopeResponses);

  const selectedExtraScopes = responses.EXTRA_SCOPES || [];

  const usesSensitiveScopes = sensitiveScopesList.some((s) =>
    selectedExtraScopes.includes(s.value)
  );

  if (usesSensitiveScopes) {
    console.log("\n--------------------------------------------------");
    console.log(
      "You have selected sensitive or restricted scopes. Google requires an OAuth client credential file for these."
    );
    console.log(
      "See the getting started guide https://github.com/brucemcpherson/gas-fakes/blob/main/GETTING_STARTED.md for how."
    );
    console.log("--------------------------------------------------");
  }

  const clientCredentialQuestion = {
    type: "text",
    name: "CLIENT_CREDENTIAL_FILE",
    message: usesSensitiveScopes
      ? "Enter the path and filename for your OAuth client credentials JSON"
      : "Enter path to OAuth client credentials JSON (optional)",
    initial: existingConfig.CLIENT_CREDENTIAL_FILE || "",
    validate: (input) => {
      const trimmedInput = input.trim();

      if (usesSensitiveScopes) {
        if (trimmedInput === "") {
          return "This field is required for the selected sensitive scopes.";
        }
      } else {
        if (trimmedInput === "") {
          return true;
        }
      }

      const resolvedPath = path.resolve(process.cwd(), trimmedInput);
      if (!existsSync(resolvedPath)) {
        return `File not found at '${resolvedPath}'. Please check the path and try again.`;
      }

      return true;
    },
  };

  const clientCredentialResponse = await prompts(clientCredentialQuestion);
  if (typeof clientCredentialResponse.CLIENT_CREDENTIAL_FILE === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, clientCredentialResponse);

  // --- Stage 3: Remaining Config ---
  const defaultScopesDisplay = `\n  - Default: [${responses.DEFAULT_SCOPES.join(
    ", "
  )}]`;
  const extraScopesDisplay =
    responses.EXTRA_SCOPES && responses.EXTRA_SCOPES.length > 0
      ? `\n  - Extra:   [${responses.EXTRA_SCOPES.join(", ")}]`
      : "\n  - Extra:   [None]";

  const remainingQuestions = [
    {
      type: "toggle",
      name: "QUIET",
      message: "Run gas-fakes package in quiet mode",
      initial: existingConfig.QUIET === "true" ? true : false,
    },
    {
      type: "select",
      name: "LOG_DESTINATION",
      message: `Selected Scopes:${defaultScopesDisplay}${extraScopesDisplay}\n\nEnter logging destination`,
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

  const remainingResponses = await prompts(remainingQuestions);
  if (typeof remainingResponses.LOG_DESTINATION === "undefined") {
    console.log("Initialization cancelled.");
    return;
  }
  Object.assign(responses, remainingResponses);

  // Convert scope arrays to comma-separated strings for saving
  if (Array.isArray(responses.DEFAULT_SCOPES)) {
    responses.DEFAULT_SCOPES = responses.DEFAULT_SCOPES.join(",");
  }
  if (Array.isArray(responses.EXTRA_SCOPES)) {
    responses.EXTRA_SCOPES = responses.EXTRA_SCOPES.join(",");
  }

  if (responses.STORE_TYPE === "UPSTASH") {
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

  // --- Confirmation Step ---
  console.log("\n------------------ Summary ------------------");
  Object.entries(responses).forEach(([key, value]) => {
    if (value !== undefined) console.log(`${key}: ${value}`);
  });
  console.log("-------------------------------------------");

  const confirmSave = await prompts({
    type: "confirm",
    name: "save",
    message: `Save this configuration to ${envPath}?`,
    initial: true,
  });

  if (!confirmSave.save) {
    console.log("Configuration discarded. No changes were made.");
    return;
  }

  // --- File Writing Logic ---
  console.log(`Writing configuration to "${envPath}"...`);
  const inits =
    responses.STORE_TYPE !== "UPSTASH"
      ? { UPSTASH_REDIS_REST_TOKEN: "", UPSTASH_REDIS_REST_URL: "" }
      : {};
  const finalConfig = { ...existingConfig, ...responses, ...inits };

  console.log("\n------------------ Final output ------------------");
  const envContent = Reflect.ownKeys(finalConfig)
    .map((key) => {
      const item = finalConfig[key];
      const res = `${key}="${(item.toString() || "").trim()}"`;
      console.log(res);
      return res;
    })
    .join("\n");
  /* replacing this to include existing values
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
  DEFAULT_SCOPES="${finalConfig.DEFAULT_SCOPES || ""}"
  EXTRA_SCOPES="${finalConfig.EXTRA_SCOPES || ""}"
  `.trim();
  
    if (finalConfig.STORE_TYPE === "UPSTASH") {
      envContent += `
  
  # Upstash credentials (only used if STORE_TYPE is 'UPSTASH')
  UPSTASH_REDIS_REST_URL="${finalConfig.UPSTASH_REDIS_REST_URL || ""}"
  UPSTASH_REDIS_REST_TOKEN="${finalConfig.UPSTASH_REDIS_REST_TOKEN || ""}"
  `;
    }
  */
  writeFileSync(envPath, envContent + "\n", "utf8");

  console.log("--------------------------------------------------");
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
