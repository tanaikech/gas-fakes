import prompts from "prompts";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { checkForGcloudCli, runCommandSync } from "./utils.js";

// --- Utility: Search .env ---
async function findEnvFiles(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const promises = entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") return Promise.resolve([]);
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

// --- Commands ---

export async function initializeConfiguration(options = {}) {
  let envPath;

  if (options.env) {
    envPath = path.resolve(process.cwd(), options.env);
    console.log(`-> Using specified .env path: ${envPath}`);
  } else {
    const foundFiles = await findEnvFiles(process.cwd());
    if (foundFiles.length > 0) {
      const choices = foundFiles.map((file) => ({ title: file, value: file }));
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

      envPath =
        response.envPathSelection === "new"
          ? path.join(process.cwd(), ".env")
          : response.envPathSelection;
    } else {
      console.log(
        "No .env file found. A new one will be created in the current directory."
      );
      envPath = path.join(process.cwd(), ".env");
    }
    console.log(`-> Using .env file at: ${envPath}`);
  }

  let existingConfig = {};
  if (fs.existsSync(envPath)) {
    console.log(
      "Found existing .env file. Loading current values as defaults."
    );
    existingConfig = dotenv.parse(fs.readFileSync(envPath));
  }

  console.log("--------------------------------------------------");
  console.log("Configuring .env for gas-fakes");
  console.log("--------------------------------------------------");

  const existingExtraScopes = existingConfig.EXTRA_SCOPES
    ? existingConfig.EXTRA_SCOPES.split(",").filter((s) => s)
    : [];
  const responses = {};

  // Stage 1: Basic Info
  const basicInfoResponses = await prompts([
    {
      type: "text",
      name: "GCP_PROJECT_ID",
      message: "Enter your GCP Project ID",
      initial:
        existingConfig.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
    },
    {
      type: "text",
      name: "DRIVE_TEST_FILE_ID",
      message:
        "Enter a test Drive file ID for authentication checks (optional)",
      initial: existingConfig.DRIVE_TEST_FILE_ID || "",
    },
  ]);

  if (typeof basicInfoResponses.GCP_PROJECT_ID === "undefined") return;
  Object.assign(responses, basicInfoResponses);

  // Stage 2: Scopes
  const DEFAULT_SCOPES_VALUES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
    "https://www.googleapis.com/auth/cloud-platform",
  ];
  responses.DEFAULT_SCOPES = DEFAULT_SCOPES_VALUES;

  const extraScopeQuestion = {
    type: "multiselect",
    name: "EXTRA_SCOPES",
    message: "Select any extra scopes your script requires",
    choices: [
      {
        title: "Workspace resources",
        value: "https://www.googleapis.com/auth/drive",
      },
      {
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
      selected:
        existingExtraScopes.length > 0
          ? existingExtraScopes.includes(scope.value)
          : scope.value === "https://www.googleapis.com/auth/drive",
    })),
  };

  const extraScopeResponses = await prompts(extraScopeQuestion);
  if (typeof extraScopeResponses.EXTRA_SCOPES === "undefined") return;
  Object.assign(responses, extraScopeResponses);

  const clientCredentialResponse = await prompts({
    type: "text",
    name: "CLIENT_CREDENTIAL_FILE",
    message: "Enter path to OAuth client credentials JSON (optional)",
    initial: existingConfig.CLIENT_CREDENTIAL_FILE || "",
  });
  Object.assign(responses, clientCredentialResponse);

  // Stage 3: Remaining Config
  const remainingResponses = await prompts([
    {
      type: "toggle",
      name: "QUIET",
      message: "Run gas-fakes package in quiet mode",
      initial: existingConfig.QUIET === "true",
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
      initial: 0,
    },
    {
      type: "select",
      name: "STORE_TYPE",
      message: "Enter storage type",
      choices: [
        { title: "FILE", value: "FILE" },
        { title: "UPSTASH", value: "UPSTASH" },
      ],
      initial: 0,
    },
  ]);
  Object.assign(responses, remainingResponses);

  if (Array.isArray(responses.DEFAULT_SCOPES))
    responses.DEFAULT_SCOPES = responses.DEFAULT_SCOPES.join(",");
  if (Array.isArray(responses.EXTRA_SCOPES))
    responses.EXTRA_SCOPES = responses.EXTRA_SCOPES.join(",");

  if (responses.STORE_TYPE === "UPSTASH") {
    const upstashResponses = await prompts([
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
    ]);
    Object.assign(responses, upstashResponses);
  }

  const confirmSave = await prompts({
    type: "confirm",
    name: "save",
    message: `Save this configuration to ${envPath}?`,
    initial: true,
  });

  if (!confirmSave.save) {
    console.log("Configuration discarded.");
    return;
  }

  const inits =
    responses.STORE_TYPE !== "UPSTASH"
      ? { UPSTASH_REDIS_REST_TOKEN: "", UPSTASH_REDIS_REST_URL: "" }
      : {};
  const finalConfig = { ...existingConfig, ...responses, ...inits };

  const envContent = Reflect.ownKeys(finalConfig)
    .map((key) => `${key}="${(finalConfig[key] || "").toString().trim()}"`)
    .join("\n");

  fs.writeFileSync(envPath, envContent + "\n", "utf8");
  console.log("Setup complete. Your .env file has been updated.");
}

export function authenticateUser() {
  checkForGcloudCli();
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
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

  let scopes =
    DEFAULT_SCOPES ||
    "https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform";
  if (EXTRA_SCOPES && EXTRA_SCOPES.length > 0) {
    scopes += "," + EXTRA_SCOPES;
  }

  let clientFlag = "";
  if (CLIENT_CREDENTIAL_FILE && fs.existsSync(CLIENT_CREDENTIAL_FILE)) {
    clientFlag = `--client-id-file="${CLIENT_CREDENTIAL_FILE}"`;
  }

  const activeConfig = AC || "default";

  try {
    execSync("gcloud auth revoke --quiet", { stdio: "ignore" });
  } catch (e) {}

  try {
    runCommandSync(`gcloud config configurations activate "${activeConfig}"`);
  } catch (e) {
    runCommandSync(`gcloud config configurations create "${activeConfig}"`);
    runCommandSync(`gcloud config configurations activate "${activeConfig}"`);
  }

  runCommandSync(`gcloud config set project ${GCP_PROJECT_ID}`);
  runCommandSync(`gcloud auth login --enable-gdrive-access`);
  runCommandSync(
    `gcloud auth application-default login --scopes="${scopes}" ${clientFlag}`
  );

  console.log("\nAuthentication process finished.");
}

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

  const enable = [];
  const disable = [];

  if (options.all || Object.keys(options).length === 0) {
    enable.push(...Object.values(API_SERVICES));
  } else {
    for (const key in API_SERVICES) {
      if (options[`e${key}`]) enable.push(API_SERVICES[key]);
      if (options[`d${key}`]) disable.push(API_SERVICES[key]);
    }
  }

  if (enable.length > 0) {
    runCommandSync(`gcloud services enable ${enable.join(" ")}`);
  }
  if (disable.length > 0) {
    runCommandSync(`gcloud services disable ${disable.join(" ")}`);
  }
}
