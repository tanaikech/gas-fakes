#!/usr/bin/env node

// -----------------------------------------------------------------------------
// IMPORTS
// -----------------------------------------------------------------------------

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { Command } from "commander";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// --- Import setup commands ---
import {
  initializeConfiguration,
  authenticateUser,
  enableGoogleAPIs,
} from "./setup.js";

// sync the version with gas fakes code since they share a package.json
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pjson = require("./package.json");
const VERSION = pjson.version;

// -----------------------------------------------------------------------------
// CONSTANTS & UTILITIES
// -----------------------------------------------------------------------------

const CLI_VERSION = "0.0.14";
const MCP_VERSION = "0.0.4";

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
 * Helper: Constructs the CLI arguments array for gas-fakes execution.
 * Modified to return an array suitable for spawn (no shell escaping needed).
 * @param {object} params Configuration parameters
 * @returns {string[]} Array of CLI arguments
 */
function buildCliArguments(params) {
  const {
    filename,
    script,
    args,
    sandbox,
    whitelistRead,
    whitelistReadWrite,
    whitelistReadWriteTrash,
    json,
  } = params;

  const cliArgs = [];

  // Input source
  if (filename) {
    cliArgs.push("-f", filename);
  }
  if (script) {
    cliArgs.push("-s", script);
  }

  // Execution arguments
  if (args) {
    cliArgs.push("-a", JSON.stringify(args));
  }

  // Sandbox & Permissions
  if (sandbox) cliArgs.push("-x");
  if (whitelistRead) cliArgs.push("-w", whitelistRead);
  if (whitelistReadWrite) cliArgs.push("--ww", whitelistReadWrite);
  if (whitelistReadWriteTrash) cliArgs.push("--wt", whitelistReadWriteTrash);
  if (json) cliArgs.push("-j", JSON.stringify(json));

  return cliArgs;
}

/**
 * Helper: Executes the gas-fakes command via child_process.spawn.
 * Uses spawn instead of exec to avoid shell interpretation of arguments.
 * @param {string[]} cliArgs Arguments to pass to the command
 * @returns {Promise<object>} MCP tool result object
 */
async function runGasFakesProcess(cliArgs) {
  return new Promise((resolve) => {
    // We invoke the current node executable with the current script
    const child = spawn(process.execPath, [process.argv[1], ...cliArgs], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"], // ignore stdin, capture stdout/stderr
      shell: false, // Important: Disable shell execution
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({
          content: [
            { type: "text", text: stdoutData || "Execution finished." },
          ],
          isError: false,
        });
      } else {
        // If there's content in stdout, it might contain the error info from gas-fakes
        const output = stderrData || stdoutData || "Unknown error occurred";
        resolve({
          content: [{ type: "text", text: output }],
          isError: true,
        });
      }
    });

    child.on("error", (err) => {
      resolve({
        content: [{ type: "text", text: err.message }],
        isError: true,
      });
    });
  });
}

/**
 * Registers the default "run-gas-by-gas-fakes" tool.
 */
function registerDefaultTool(server) {
  const schema1 = {
    description: [
      `Use this to safely run Google Apps Script in a sandbox using gas-fakes.`,
      `# Important`,
      `- Use the extension of the Google Apps Script files as \`js\`. Don't use \`gs\``,
      `- When providing script content, ensure functions are called (e.g., add \`sample();\`).`,
    ].join("\n"),
    inputSchema: {
      filename: z
        .string()
        .optional() // Made optional because script can be provided
        .describe(`Path to the file containing Google Apps Script.`),
      script: z
        .string()
        .optional()
        .describe(`Direct GAS script content string.`),
      sandbox: z
        .boolean()
        .describe("Use to run Google Apps Script in a sandbox."),
      whitelistRead: z
        .string()
        .optional()
        .describe(
          "Whitelist of file IDs for readonly access (comma-separated). When the file IDs and folder IDs are used or provided, use `whiteListRead`, `whitelistReadWrite`, or `whitelistReadWriteTrash` by judging from the prompt."
        ),
      whitelistReadWrite: z
        .string()
        .optional()
        .describe(
          "Whitelist of file IDs for read/write access (comma-separated). When the file IDs and folder IDs are used or provided, use `whiteListRead`, `whitelistReadWrite`, or `whitelistReadWriteTrash` by judging from the prompt."
        ),
      whitelistReadWriteTrash: z
        .string()
        .optional()
        .describe(
          "Whitelist of file IDs for read/write/trash access (comma-separated). When the file IDs and folder IDs are used or provided, use `whiteListRead`, `whitelistReadWrite`, or `whitelistReadWriteTrash` by judging from the prompt."
        ),
      json: z
        .object({
          whitelistItems: z
            .array(
              z.object({
                itemId: z.string(),
                read: z.boolean().default(true).optional(),
                write: z.boolean().default(false).optional(),
                trash: z.boolean().default(false).optional(),
              })
            )
            .optional(),
          whitelistServices: z
            .array(
              z.object({
                className: z.string(),
                methodNames: z.array(z.string()).optional(),
              })
            )
            .optional(),
          blacklistServices: z.array(z.string()).optional(),
        })
        .optional()
        .describe("Advanced sandbox configuration JSON."),
    },
  };

  server.registerTool("run-gas-by-gas-fakes", schema1, async (args) => {
    if (!args.filename && !args.script) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Either `filename` or `script` is required.",
          },
        ],
        isError: true,
      };
    }
    const cliArgs = buildCliArguments(args);
    return await runGasFakesProcess(cliArgs);
  });

  const schema2 = {
    description: [
      `Use this to create the tools of the MCP server using Google Apps Script as a new file. If a file \`settings.json\` or \`mcp_config.json\` or and so on for loading the MCP servers include \`--tools\` and the tool file to \`gas-fakes\` MCP server, ask the current client which you want to create a new file including the tools or you want to add the tools to the existing tool file. When a new tool file is created, show how to use the tool file as follows. When the created tool file is \`toolFile.js\`, modify the MCP server setting to \`"mcpServers": { "gas-fakes": { "command": "gas-fakes", "args": [ "mcp", "--tools", "{Absolute path}/toolFile.js" ] } }\`. Don't forget to replace \`{Absolute path}\` with the actual path.`,
    ].join("\n"),
    inputSchema: {
      filename: z
        .string()
        .describe(
          "Filename of the tool file built by Google Apps Script. The extension is required to be `.js`."
        ),
      tools: z
        .array(
          z
            .object({
              name: z.string().describe("Tool name."),
              schema: z
                .string()
                .describe(
                  `JSON schema of the arguments to \`gas-script\`. This is required to be an object by creating zod. The simple sample script of Zod is \`{ description: "Use this to search files by a filename on Google Drive.", inputSchema: { filename: z.string().describe("Filename of the search file.") } }\`. Generate a JSON schema using Zod by following this sample. You are required to generate the JSON schema using Zod. This object of inputSchema will be used as "object" in Google Apps Script.`
                ),
              gas_script: z
                .string()
                .describe(
                  `Generated Google Apps Script. Please be careful of the following rule. For example, when you generated a Google Apps Script like \`function sample(object) { script }\`, please add \`return sample(object);\` to execute the function. This is a very important point. When the prompt says "Create a function", please create a function and add a line of script for calling the function and returning the response like \`return sample(object);\`. Or, you can also create a Google Apps Script without enclosing the script with \`function sample(object) { script }\`. When you want to return the value, show the value using \`console.log\` in the script, or return the value using \`return\`. The simple sample script is \`const { filename } = object; const files = DriveApp.getFilesByName(filename); const ar = []; while (files.hasNext()) { const file = files.next(); ar.push({ filename: file.getName(), fileId: file.getId() }); } return ar;\` This tool is required to be used for creating tools as a new file. When you want to add more tools to the existing file, add them to an array \`tools\` in the file by following the specification of \`tools\`. If you cannot find the array, please create it as a new file.`
                ),
            })
            .describe("An object for each tool.")
        )
        .describe("An array including tools."),
    },
  };
  server.registerTool("create-new-tools", schema2, async (args) => {
    if (!args.filename || !args.tools) {
      return {
        content: [
          {
            type: "text",
            text: "Error: `filename` and `tools` are required.",
          },
        ],
        isError: true,
      };
    }
    const tool_ar = args.tools
      .map(
        ({ name, schema, gas_script }) =>
          `{ name: "${name}", schema: ${schema}, func: (object = {}) => { ${gas_script} } }`
      )
      .join(", ");
    const tool_script = [
      `import { z } from "zod";`,
      ``,
      `const tools = [${tool_ar}];`,
    ].join("\n");
    const absolutePath = path.resolve(process.cwd(), args.filename);
    fs.writeFileSync(absolutePath, tool_script);
    return {
      content: [
        {
          type: "text",
          text: `A new file including tools for gas-fakes-mcp was successfully created as "${absolutePath}".`,
        },
      ],
      isError: false,
    };
  });
}

/**
 * Loads and registers custom tools from an external file.
 */
async function registerCustomTools(server, toolsPath) {
  if (!toolsPath || !fs.existsSync(toolsPath)) {
    if (toolsPath) console.error(`No tool file: ${toolsPath}`);
    return;
  }

  const absolutePath = path.resolve(process.cwd(), toolsPath);
  let toolsStr = fs.readFileSync(absolutePath, "utf8");
  toolsStr = toolsStr.replace(/^import.*/gm, "");
  const getTools = new Function("z", `${toolsStr} return tools || [];`);
  const tools = getTools(z);

  if (!tools || tools.length === 0) return;

  tools.forEach((tool) => {
    // Extend the custom tool schema with sandbox options
    const extendedSchema = { ...tool.schema };
    extendedSchema.inputSchema = {
      gas_args: z
        .object(tool.schema.inputSchema)
        .describe("Arguments for Google Apps Script."),
      sandbox: z.boolean().describe("Run in sandbox."),
      whitelistRead: z.string().optional().describe("Read-only whitelist IDs."),
      whitelistReadWrite: z
        .string()
        .optional()
        .describe("Read/Write whitelist IDs."),
      whitelistReadWriteTrash: z
        .string()
        .optional()
        .describe("Read/Write/Trash whitelist IDs."),
      json: z.any().optional().describe("Advanced sandbox JSON configuration."),
    };

    const originalFuncStr = tool.func.toString();

    const toolHandler = async (opts) => {
      // Wrap the original function string to execute it with args
      const wrappedScript = `return (${originalFuncStr})(args)`;

      const cliArgs = buildCliArguments({
        script: wrappedScript,
        args: opts.gas_args,
        ...opts,
      });

      return await runGasFakesProcess(cliArgs);
    };

    server.registerTool(tool.name, extendedSchema, toolHandler);
  });
}

/**
 * Defines and runs the MCP server for gas-fakes.
 */
async function startMcpServer(options) {
  const { tools } = options;

  const server = new McpServer({
    name: "gas-fakes-mcp",
    version: MCP_VERSION,
  });

  // Register the built-in generic runner
  registerDefaultTool(server);

  // Register dynamic custom tools if provided
  if (tools) {
    await registerCustomTools(server, tools);
  }

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

  // Default command to execute a script
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
      const { filename, script, env, gfsettings } = options;
      if (!filename && !script) {
        // This action is for the default command. If a known command is passed (like 'init'), this won't run.
        // We check if the command is not one of the others.
        const knownCommands = program.commands.map((cmd) => cmd.name());
        if (!process.argv.slice(2).some((arg) => knownCommands.includes(arg))) {
          // console.error(
          //   "Error: You must provide a script via --filename or --script, or use a specific command (e.g., init, auth, mcp)."
          // );
          program.help();
          process.exit(1);
        }
        return;
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

  // --- Setup commands ---
  program
    .command("init")
    .description(
      "Initializes the configuration by creating or updating the .env file."
    )
    .option("-e, --env <path>", "Path to a custom .env file.")
    .action(initializeConfiguration);

  program
    .command("auth")
    .description("Runs the Google Cloud authentication and authorization flow.")
    .action(authenticateUser);

  program
    .command("enableAPIs")
    .description(
      "Enables or disables required Google Cloud APIs for the project."
    )
    .option("--all", "Enable all default Google Cloud APIs.")
    .option("--edrive", "Enable drive.googleapis.com")
    .option("--ddrive", "Disable drive.googleapis.com")
    .option("--esheets", "Enable sheets.googleapis.com")
    .option("--dsheets", "Disable sheets.googleapis.com")
    .option("--eforms", "Enable forms.googleapis.com")
    .option("--dforms", "Disable forms.googleapis.com")
    .option("--edocs", "Enable docs.googleapis.com")
    .option("--ddocs", "Disable docs.googleapis.com")
    .option("--egmail", "Enable gmail.googleapis.com")
    .option("--dgmail", "Disable gmail.googleapis.com")
    .option("--elogging", "Enable logging.googleapis.com")
    .option("--dlogging", "Disable logging.googleapis.com")
    .action(enableGoogleAPIs);

  // MCP server command
  program
    .command("mcp")
    .description("Launch gas-fakes as an MCP server.")
    .option(
      "-t, --tools <string>",
      "A filename of the custom MCP server tools built by Google Apps Script."
    )
    .action(startMcpServer);

  program.showHelpAfterError("(add --help for additional information)");

  await program.parseAsync(process.argv);
}

// Run the main function
main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
