#!/usr/bin/env node

// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { Command } from "commander";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// sync the version with gas fakes code since they share a package.json
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pjson = require("./package.json");
const VERSION = pjson.version;

// -----------------------------------------------------------------------------
// CONSTANTS & UTILITIES
// -----------------------------------------------------------------------------

const CLI_VERSION = "0.0.8";
const MCP_VERSION = "0.0.3";
const execAsync = promisify(exec);

/**
 * Replaces escaped newline characters ('\\n') with actual newlines,
 * while ignoring newlines inside string literals.
 * @param {string} text The script text to process.
 * @returns {string} The processed text.
 */
function normalizeScriptNewlines(text) {
  const regex = /("[^"]*")|('[^']*')|(`[^`]*`)|(\\n)/g;
  return text.replace(regex, (match, g1, g2, g3, g4) => (g4 ? "\n" : match));
}

// -----------------------------------------------------------------------------
// SANDBOX SCRIPT GENERATION
// -----------------------------------------------------------------------------

/**
 * Generates the GAS script snippet for whitelisting services.
 * @param {Array<Object>} services The whitelistServices configuration.
 * @returns {string[]} An array of script lines.
 */
function generateServiceWhitelistScript(services) {
  if (!services || services.length === 0) return [];

  return services.flatMap(({ className, methodNames }, index) => {
    if (!className) {
      console.error("Error: Class name not found in whitelistServices.");
      process.exit(1);
    }
    const serviceVar = `service${index + 1}`;
    const lines = [
      `const ${serviceVar} = behavior.sandboxService.${className};`,
    ];
    if (methodNames && methodNames.length > 0) {
      const methods = methodNames.map((name) => `"${name}"`).join(", ");
      lines.push(`${serviceVar}.setMethodWhitelist([${methods}]);`);
    }
    return lines;
  });
}

/**
 * Generates the GAS script snippet for blacklisting services.
 * @param {string[]} services The blacklistServices configuration.
 * @returns {string[]} An array of script lines.
 */
function generateServiceBlacklistScript(services) {
  if (!services || services.length === 0) return [];
  return services.map(
    (service) => `behavior.sandboxService.${service}.enabled = false;`
  );
}

/**
 * Generates the GAS script snippet for whitelisting Drive items.
 * @param {Array<Object>} items The whitelistItems configuration.
 * @returns {string} A script string.
 */
function generateItemWhitelistScript(items) {
  if (!items || items.length === 0) return "";

  const whitelistItemsString = items
    .map(({ itemId = "", read = true, write = false, trash = false }) => {
      if (!itemId) {
        console.error("Error: itemId not found in whitelistItems.");
        process.exit(1);
      }
      return `behavior.newIdWhitelistItem("${itemId}").setRead(${read}).setWrite(${write}).setTrash(${trash})`;
    })
    .join(",\n        ");

  return `behavior.setIdWhitelist([${whitelistItemsString}]);`;
}

/**
 * Constructs the setup script for a sandboxed environment based on configuration.
 * @param {object} sandboxConfig The sandbox configuration object.
 * @returns {string[]} An array of GAS script lines for setup.
 */
function generateSandboxSetupScript(sandboxConfig) {
  const script = [
    "const behavior = ScriptApp.__behavior;",
    "behavior.sandboxMode = true;",
    "behavior.strictSandbox = true;",
  ];

  const { whitelistServices, blacklistServices, whitelistItems } =
    sandboxConfig;

  script.push(...generateServiceWhitelistScript(whitelistServices));
  script.push(...generateServiceBlacklistScript(blacklistServices));

  const itemWhitelist = generateItemWhitelistScript(whitelistItems);
  if (itemWhitelist) {
    script.push(itemWhitelist);
  }

  return script;
}

/**
 * Generates the final, executable script string.
 * @param {object} options
 * @param {string} options.scriptText The user's Google Apps Script.
 * @param {boolean} options.useSandbox Whether to enable basic sandbox mode.
 * @param {object} [options.sandboxConfig] Detailed sandbox configuration.
 * @returns {{mainScript: string, gasScript: string}} The script to be executed and the user-facing script part.
 */
function generateExecutionScript({ scriptText, useSandbox, sandboxConfig }) {
  if (!scriptText || scriptText.trim() === "") {
    console.error("Error: Google Apps Script is empty or was not found.");
    process.exit(1);
  }

  let gasScriptLines = [];

  if (sandboxConfig) {
    gasScriptLines.push(...generateSandboxSetupScript(sandboxConfig));
    gasScriptLines.push(`\n\n${scriptText}\n\n`);
    gasScriptLines.push("ScriptApp.__behavior.trash();");
  } else if (useSandbox) {
    gasScriptLines.push("ScriptApp.__behavior.sandBoxMode = true;");
    gasScriptLines.push(`\n\n${scriptText}\n\n`);
    gasScriptLines.push("ScriptApp.__behavior.trash();");
  } else {
    gasScriptLines.push(scriptText);
  }

  const gasScript = gasScriptLines.join("\n");
  const mainScript = [
    "async function runGas() {",
    '  await import("./main.js"); // This will trigger the fxInit call',
    gasScript,
    "}",
    "return runGas();",
  ].join("\n");

  return { mainScript, gasScript };
}

// -----------------------------------------------------------------------------
// SCRIPT EXECUTION
// -----------------------------------------------------------------------------

/**
 * Loads, prepares, and executes the user's Google Apps Script.
 * @param {object} options The processed CLI options.
 */
async function executeGasScript(options) {
  const {
    filename,
    script,
    display,
    gfSettings,
    useSandbox,
    sandboxConfig,
    args,
  } = options;

  let scriptText = filename ? fs.readFileSync(filename, "utf8") : script;

  if (scriptText) {
    scriptText = scriptText.replace(/\\\s*?\n/g, "\n");
  }

  const { mainScript, gasScript } = generateExecutionScript({
    scriptText: normalizeScriptNewlines(scriptText),
    useSandbox,
    sandboxConfig,
  });

  if (display) {
    console.log(
      `\n--- Generated GAS ---\n${gasScript}\n--- End Generated GAS ---\n`
    );
  }

  // Inject the settings path as a global for the script to access.
  Object.defineProperty(globalThis, "settingsPath", {
    value: gfSettings,
    writable: true,
    configurable: true,
  });

  let res;
  if (args) {
    const gasFunction = new Function("args", mainScript);
    res = await gasFunction(args);
  } else {
    const gasFunction = new Function(mainScript);
    res = await gasFunction();
  }
  if (res) {
    const output = typeof res == "string" ? res : JSON.stringify(res);
    console.log(output); // Returned value from Google Apps Script.
  }
}

// -----------------------------------------------------------------------------
// MCP SERVER
// -----------------------------------------------------------------------------

/**
 * Defines and runs the MCP server for gas-fakes.
 */
async function startMcpServer() {
  const server = new McpServer({
    name: "gas-fakes-mcp",
    version: MCP_VERSION,
  });

  const mcpToolSchema = {
    description: [
      `Use this to safely run Google Apps Script in a sandbox using gas-fakes.`,
      `# Important`,
      `- Use the extension of the Google Apps Script files as \`js\`. Don't use \`gs\``,
      `- When you provide the generated Google Apps Script to the tool "gas-fakes" of the MCP server "gas-development-kit-extension", please be careful of the following rule. For example, when you generated a Google Apps Script like \`function sample() { script }\`, please add \`sample();\` to execute the function. Or, you can also create a Google Apps Script without enclosing the script with \`function sample() { script }\`.`,
    ].join("\n"),
    inputSchema: {
      filename: z
        .string()
        .describe(
          `Provide a filename with the path of the file, including Google Apps Script. Write the Google Apps Script into a file and use this.`
        ),
      sandbox: z
        .boolean()
        .describe("Use to run Google Apps Script in a sandbox."),
      whitelistRead: z
        .string()
        .describe(
          "Whitelist of file IDs for readonly access (comma-separated). Enables sandbox mode."
        )
        .optional(),
      whitelistReadWrite: z
        .string()
        .describe(
          "Whitelist of file IDs for read/write access (comma-separated). Enables sandbox mode."
        )
        .optional(),
      whitelistReadWriteTrash: z
        .string()
        .describe(
          "Whitelist of file IDs for read/write/trash access (comma-separated). Enables sandbox mode."
        )
        .optional(),
      json: z
        .object({
          whitelistItems: z
            .array(
              z.object({
                itemId: z
                  .string()
                  .describe("The file or folder ID on Google Drive."),
                read: z.boolean().optional().default(true),
                write: z.boolean().optional().default(false),
                trash: z.boolean().optional().default(false),
              })
            )
            .describe("A list of items to be whitelisted."),
          whitelistServices: z
            .array(
              z.object({
                className: z
                  .string()
                  .describe("The class name of the GAS service."),
                methodNames: z
                  .array(z.string())
                  .describe(
                    "A list of method names for the class to be whitelisted."
                  )
                  .optional(),
              })
            )
            .describe("A list of services to be whitelisted.")
            .optional(),
          blacklistServices: z
            .array(z.string())
            .describe("A list of GAS services to be blacklisted.")
            .optional(),
        })
        .describe("A JSON object for advanced sandbox configuration.")
        .optional(),
    },
  };

  const mcpToolFunc = async (options = {}) => {
    const {
      filename,
      sandbox,
      whitelistRead,
      whitelistReadWrite,
      whitelistReadWriteTrash,
      json,
    } = options;

    if (!filename) {
      return {
        content: [
          { type: "text", text: "Error: `filename` is a required parameter." },
        ],
        isError: true,
      };
    }

    try {
      const cliArgs = [];
      cliArgs.push(`-f "${filename}"`);
      if (sandbox) cliArgs.push("-x");
      if (whitelistRead) cliArgs.push(`-w "${whitelistRead}"`);
      if (whitelistReadWrite) cliArgs.push(`--ww "${whitelistReadWrite}"`);
      if (whitelistReadWriteTrash)
        cliArgs.push(`--wt "${whitelistReadWriteTrash}"`);
      if (json) cliArgs.push(`-j '${JSON.stringify(json)}'`);

      const command = `gas-fakes ${cliArgs.join(" ")}`;
      const { stdout } = await execAsync(command);
      return {
        content: [{ type: "text", text: stdout || "Execution finished." }],
        isError: false,
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: err.message }],
        isError: true,
      };
    }
  };

  server.registerTool("run-gas-by-gas-fakes", mcpToolSchema, mcpToolFunc);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// -----------------------------------------------------------------------------
// CLI DEFINITION & MAIN EXECUTION
// -----------------------------------------------------------------------------

/**
 * Parses sandbox-related CLI options into a structured config object.
 * @param {object} options Raw options from Commander.
 * @returns {object | undefined} A sandbox configuration object or undefined.
 */
function buildSandboxConfig(options) {
  const { json, whitelistRead, whitelistReadWrite, whitelistReadWriteTrash } =
    options;

  if (json) {
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error("Error: Invalid JSON provided to --json option.");
      process.exit(1);
    }
  }

  if (whitelistRead || whitelistReadWrite || whitelistReadWriteTrash) {
    const config = { whitelistItems: [] };
    const parseWhitelist = (idString, permissions) => {
      if (!idString) return;
      idString.split(",").forEach((id) => {
        const trimmedId = id.trim();
        if (trimmedId) {
          config.whitelistItems.push({ itemId: trimmedId, ...permissions });
        }
      });
    };

    parseWhitelist(whitelistRead, { read: true });
    parseWhitelist(whitelistReadWrite, { read: true, write: true });
    parseWhitelist(whitelistReadWriteTrash, {
      read: true,
      write: true,
      trash: true,
    });

    return config;
  }

  return undefined;
}

/**
 * Sets up and runs the command-line interface.
 */
async function main() {
  const program = new Command();

  program
    .name("gas-fakes")
    .description("A CLI tool to execute Google Apps Script with fakes/mocks.")
    .version(VERSION, "-v, --version", "Display the current version");

  program
    .description("Execute a Google Apps Script file or string.")
    .option("-f, --filename <string>", "Path to the Google Apps Script file.")
    .option(
      "-s, --script <string>",
      "A string containing the Google Apps Script."
    )
    .option("-e, --env <path>", "Path to a custom .env file.", "./.env")
    .option(
      "-g, --gfsettings <path>",
      "Path to a gasfakes.json settings file.",
      "./gasfakes.json"
    )
    .option("-x, --sandbox", "Run the script in a basic sandbox.")
    .option(
      "-w, --whitelistRead <string>",
      "Comma-separated file IDs for read-only access (enables sandbox)."
    )
    .option(
      "--ww, --whitelistReadWrite <string>",
      "Comma-separated file IDs for read/write access (enables sandbox)."
    )
    .option(
      "--wt, --whitelistReadWriteTrash <string>",
      "Comma-separated file IDs for read/write/trash access (enables sandbox)."
    )
    .option(
      "-j, --json <string>",
      "JSON string for advanced sandbox configuration (overrides whitelist flags)."
    )
    .option(
      "-d, --display",
      "Display the generated script before execution.",
      false
    )
    .option(
      "-a, --args <string>",
      `Arguments for the function of Google Apps Script. Provide it as a JSON string. The name of the argument is "args" as a fixed name. For example, when the function of GAS is \`function sample(args) { script }\`, you can provide the arguments like \`-a '{"key": "value"}'\`.`,
      null
    )
    .action(async (options) => {
      if (Object.keys(options).length === 0) {
        program.help();
        return;
      }

      const { filename, script, env, gfsettings } = options;
      if (!filename && !script) {
        console.error(
          "Error: You must provide a script via --filename or --script."
        );
        process.exit(1);
      }

      // Load environment variables
      const envPath = path.resolve(process.cwd(), env);
      console.log(`...using env file in ${envPath}`);
      dotenv.config({ path: envPath, quiet: true });

      // Load gasfakes settings
      const settingsPath = path.resolve(process.cwd(), gfsettings);
      console.log(`...using gasfakes settings file in ${settingsPath}`);
      process.env.GF_SETTINGS_PATH = settingsPath;

      const sandboxConfig = buildSandboxConfig(options);
      const useSandbox = !!options.sandbox || !!sandboxConfig;

      let args = null;
      if (options.args) {
        try {
          args = JSON.parse(
            options.args
              .replace(/\\\s*?\n/g, "\\n")
              .replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
          );
        } catch (err) {
          console.error("Error: Invalid JSON provided to --args option.");
          process.exit(1);
        }
      }

      await executeGasScript({
        filename,
        script,
        display: options.display,
        useSandbox,
        sandboxConfig,
        gfSettings: settingsPath,
        args,
      });
    });

  program
    .command("mcp")
    .description("Launch gas-fakes as an MCP server.")
    .action(startMcpServer);

  program.showHelpAfterError("(add --help for additional information)");

  await program.parseAsync(process.argv);
}

// Run the main function
main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
