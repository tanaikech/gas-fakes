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
import { parse } from "acorn";

import { Auth } from "./src/support/auth.js";

// --- Import setup commands ---
import {
  initializeConfiguration,
  authenticateUser,
  enableGoogleAPIs,
} from "./setup.js";

// sync the version with gas fakes code since they share a package.json
import { createRequire } from "node:module";
import { access } from "node:fs";
const require = createRequire(import.meta.url);
const pjson = require("./package.json");
const VERSION = pjson.version;

// -----------------------------------------------------------------------------
// CONSTANTS & UTILITIES
// -----------------------------------------------------------------------------

const CLI_VERSION = "0.0.15";
const MCP_VERSION = "0.0.5";

/**
 * Replaces escaped newline characters ('\\n') with actual newlines,
 * while ignoring newlines inside string literals.
 * @param {string} text The script text to process.
 * @returns {string} The processed text.
 */
function normalizeScriptNewlines(text) {
  // const regex = /("[^"]*")|('[^']*')|(`[^`]*`)|(\\n)/g;
  // return text.replace(regex, (match, g1, g2, g3, g4) => (g4 ? "\n" : match));

  // Updated the above as follows.
  const regex =
    /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|(\/\\[rn]\/[dgimsuy]*)|(\/\*[\s\S]*?\*\/)|(\/\/(?:(?!\\n).)*)|(\\n)/g;
  return text.replace(regex, (match, g1, g2, g3, g4, g5, g6, g7) => {
    if (g7) return "\n";
    return match;
  });
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
    gas_library,
  } = options;

  let scriptText = filename ? fs.readFileSync(filename, "utf8") : script;

  if (scriptText) {
    scriptText = scriptText.replace(/\\\s*?\n/g, "\n");
  }

  let { mainScript, gasScript } = generateExecutionScript({
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

  if (gas_library && gas_library.length > 0) {
    const libs = gas_library.reduce((ar, { identifier, libScript }) => {
      if (mainScript.includes(identifier)) {
        ar.push(libScript);
      }
      return ar;
    }, []);
    if (libs.length > 0) {
      mainScript = `${libs.join("\n\n")}\n\n${mainScript}`;
    }
  }

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
        .optional()
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
      `Use this to create the tools of the MCP server using Google Apps Script as a new file. Only when the prompt that a new tool for the MCP server is required is clearly shown, use this tool. If a file \`settings.json\` or \`mcp_config.json\` or and so on for loading the MCP servers include \`--tools\` and the tool file to \`gas-fakes\` MCP server, ask the current client which you want to create a new file including the tools or you want to add the tools to the existing tool file. When a new tool file is created, show how to use the tool file as follows. When the created tool file is \`toolFile.js\`, modify the MCP server setting to \`"mcpServers": { "gas-fakes": { "command": "gas-fakes", "args": [ "mcp", "--tools", "{Absolute path}/toolFile.js" ] } }\`. Don't forget to replace \`{Absolute path}\` with the actual path.`,
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
              libraries: z
                .array(
                  z
                    .string()
                    .describe(
                      [
                        `Use this when Google Apps Script libraries are required to be used in the script. The sample values are as follows.`,
                        `It supposes that the identity of the library is \`LIB\`.`,
                        `- When the library script is the file with path, \`LIB@{filename1}\``,
                        `- When the library script is the file direct link, \`LIB@{file URL}\``,
                        `- When the library script is the ID (Library project key or library key or script ID or file ID) of the file on Google Drive, \`LIB@{ID}\``,
                      ].join("\n")
                    )
                )
                .default([])
                .describe(
                  `Use this when Google Apps Script libraries are required to be used in the script.`
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

    const tool_ar = [];
    for (let i = 0; i < args.length; i++) {
      const { name, schema, gas_script, libraries } = args[i];
      tool_ar.push(
        `{ name: "${name}", schema: ${schema}, func: (object = {}) => { ${gas_library}\n\n${gas_script} }, libraries: [${libraries.join(
          ","
        )}] }`
      );
    }

    const tool_script = [
      `import { z } from "zod";`,
      ``,
      `const tools = [${tool_ar.join(", ")}];`,
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

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];

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

    let originalFuncStr = tool.func.toString();
    if (tool.libraries && tool.libraries.length > 0) {
      const gas_library = await getLibraries({ libraries: tool.libraries });

      if (gas_library && gas_library.length > 0) {
        const libs = gas_library.reduce((ar, { identifier, libScript }) => {
          if (originalFuncStr.includes(identifier)) {
            ar.push(libScript);
          }
          return ar;
        }, []);
        if (libs.length > 0) {
          originalFuncStr = `(object = {}) => {\n\n${libs.join(
            "\n\n"
          )}\n\nconst main_gas_fakes = ${originalFuncStr}\n\nreturn main_gas_fakes(object);\n}`;
        }
      }
    }

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
  }
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

// -----------------------------------------------------------------------------
// PROCESS GAS LIBRARIES
// -----------------------------------------------------------------------------

/**
 * Helper function to wrap spawn in a Promise.
 * This captures stdout and stderr and resolves or rejects based on the exit code.
 */
function spawnCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = "";
    let stderr = "";

    // Collect data from stdout stream
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // Collect data from stderr stream
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    // Handle command not found or other spawn errors
    child.on("error", (err) => {
      reject(err);
    });

    // Handle process exit
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(
          new Error(stderr.trim() || `Command failed with exit code ${code}`)
        );
      }
    });
  });
}

async function checkForGcloudCli() {
  try {
    // args: ['--version']
    await spawnCommand("gcloud", ["--version"]);
  } catch (error) {
    console.error(
      "\n[Error] Google Cloud SDK (gcloud CLI) not found or failed to run."
    );
    console.error("Please install it by following the official instructions:");
    console.error("https://cloud.google.com/sdk/gcloud");
    // Only exit if it's strictly required to stop execution here
    process.exit(1);
  }
}

async function getAccessToken(pattern) {
  if (pattern == 1) {
    // Authorization pattern 1
    const auth = await Auth.setAuth(
      ["https://www.googleapis.com/auth/drive.readonly"],
      null,
      true
    );
    auth.cachedCredential = null;
    return await auth.getAccessToken();
  } else {
    // Authorization pattern 2
    await checkForGcloudCli();
    try {
      const accessToken = await spawnCommand("gcloud", [
        "auth",
        "print-access-token",
      ]);
      return accessToken;
    } catch (error) {
      console.error("\nError obtaining access token:");
      console.error(error.message);
      console.error(
        "Please ensure you are authenticated with gcloud CLI. Run 'gcloud auth application-default login'."
      );
      process.exit(1);
    }
  }
}

async function fetchScriptFileFromGoogleDrive(sourcePath, pattern = 1) {
  try {
    const accessToken = await getAccessToken(pattern);
    const url = `https://www.googleapis.com/drive/v3/files/${sourcePath}/export?mimeType=${encodeURIComponent(
      "application/vnd.google-apps.script+json"
    )}`;

    const response = await fetch(url, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error ${response.status} fetching Drive ID "${sourcePath}".`
      );
    }

    const text = await response.json();
    if (text.files && text.files.length > 0) {
      // GAS projects can have multiple files; filter for server-side JS and join them.
      return text.files
        .filter((e) => e.type === "server_js")
        .map((e) => e.source)
        .join("\n\n");
    }
  } catch (err) {
    if (pattern == 1) {
      return await fetchScriptFileFromGoogleDrive(sourcePath, 2);
    }

    // If it wasn't a Drive ID or auth failed, fall through to error
    throw new Error(
      `Could not retrieve script from "${sourcePath}". Ensure it is a valid path, URL, or Drive ID, and that you are authenticated.`
    );
  }
}

/**
 * Fetches the source code for a library from a local file, a URL, or Google Drive.
 *
 * @param {string} sourcePath - The file path, URL, or Drive File ID of the library.
 * @returns {Promise<string>} The source code of the library.
 * @throws {Error} If the source cannot be found, HTTP fails, or auth fails.
 */
async function fetchLibrarySource(sourcePath) {
  // 1. Check Local File
  if (fs.existsSync(sourcePath)) {
    return fs.readFileSync(sourcePath, "utf8");
  }

  // 2. Check URL
  // Note: URL.canParse requires Node.js v18.17.0+ or v20+
  if (URL.canParse(sourcePath)) {
    const response = await fetch(sourcePath);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} fetching ${sourcePath}`);
    }
    return await response.text();
  }

  // 3. Check Google Drive (via gcloud)
  try {
    return await fetchScriptFileFromGoogleDrive(sourcePath);
  } catch (err) {
    throw new Error(
      `No valid source code found for "${sourcePath}". Error message: ${err.message}`
    );
  }
}

/**
 * Wraps raw library source code into a GAS-style namespace using an IIFE.
 * It uses AST parsing to export top-level functions and 'var' variables.
 *
 * @param {string} identifier - The library namespace identifier (e.g., "TableApp").
 * @param {string} source - The raw JavaScript source code.
 * @returns {string} The wrapped, executable JavaScript code.
 */
function generateLibraryWrapper(identifier, source) {
  try {
    const ast = parse(source, { ecmaVersion: 2020 });

    // Extract top-level FunctionDeclarations and VariableDeclarations (var only)
    const exportNames = ast.body.reduce((names, node) => {
      if (node.type === "FunctionDeclaration") {
        names.push(node.id.name);
      } else if (node.type === "VariableDeclaration" && node.kind === "var") {
        names.push(...node.declarations.map((d) => d.id.name));
      }
      return names;
    }, []);

    if (exportNames.length === 0) {
      throw new Error(
        `No top-level functions or var variables found to export in library "${identifier}".`
      );
    }

    return [
      `var ${identifier} = (function () {`,
      `var ${identifier};`,
      source,
      `\n`,
      `if (this && this.${identifier}) { ${identifier} = this.${identifier}; }`,
      `return { ${exportNames.join(", ")} };`,
      `}).call({});`,
    ].join("\n");

    // Or, use the following script.
    // return [
    //   `var ${identifier} = (function () {`,
    //   source,
    //   `\n`,
    //   `return { ${exportNames.join(", ")} };`,
    //   `})();`,
    // ].join("\n");
  } catch (err) {
    console.error(`Error processing library "${identifier}": ${err.message}`);
    process.exit(1);
  }
}

/**
 * Processes library arguments, fetches source code, merges duplicates,
 * and generates namespaced wrapper scripts.
 *
 * This function handles the format "Identifier@Source". If the same Identifier
 * is provided multiple times, the sources are concatenated in order.
 *
 * @param {object} options - The CLI options object.
 * @param {string[]} [options.libraries] - Array of library strings (e.g., ["Lib@./file.js"]).
 * @returns {Promise<string|null>} The combined string of all library scripts, or null if none provided.
 */
async function getLibraries(options) {
  const { libraries } = options;

  if (!libraries || !Array.isArray(libraries) || libraries.length === 0) {
    return null;
  }

  // 1. Parse and Fetch (Concurrent)
  // We map arguments to Promises to fetch all libraries in parallel.
  const fetchPromises = libraries.map(async (libArg) => {
    const splitIndex = libArg.indexOf("@");

    if (splitIndex === -1) {
      throw new Error(
        `Invalid library format: "${libArg}". Expected format: 'Identifier@Source'.`
      );
    }

    const identifier = libArg.substring(0, splitIndex).trim();
    const sourcePath = libArg.substring(splitIndex + 1).trim();

    if (!identifier || !sourcePath) {
      throw new Error(
        `Invalid library argument: "${libArg}". Identifier or Source is missing.`
      );
    }

    try {
      const source = await fetchLibrarySource(sourcePath);
      return { identifier, source };
    } catch (err) {
      throw new Error(`Failed to load library "${identifier}": ${err.message}`);
    }
  });

  let fetchedLibs;
  try {
    fetchedLibs = await Promise.all(fetchPromises);
  } catch (err) {
    // If any fetch fails, log the error and exit
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  // 2. Merge libraries with the same Identifier
  // Using a Map to maintain insertion order and group sources
  const mergedLibsMap = new Map();

  for (const { identifier, source } of fetchedLibs) {
    if (mergedLibsMap.has(identifier)) {
      const existingSource = mergedLibsMap.get(identifier);
      mergedLibsMap.set(identifier, existingSource + "\n\n" + source);
    } else {
      mergedLibsMap.set(identifier, source);
    }
  }

  // 3. Generate Wrappers
  // Convert the merged sources into wrapped IIFE strings
  const wrappedScripts = [];
  for (const [identifier, source] of mergedLibsMap) {
    wrappedScripts.push({
      identifier,
      libScript: generateLibraryWrapper(identifier, source),
    });
  }

  return wrappedScripts;
}

/**
 * Sets up and runs the command-line interface.
 */
async function main() {
  const program = new Command();

  program
    .name("gas-fakes")
    .description("A CLI tool to execute Google Apps Script with fakes/mocks.")
    .version(
      VERSION,
      "-v, --version",
      "Display the current version of gas-fakes"
    );

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
    .option(
      "-l, --libraries <string...>",
      `Libraries. You can run the Google Apps Script with libraries. When you use 2 libraries "Lib1" and "Lib" which are the identifiers of library, provide '--libraries "Lib1@{filename}" --libraries "Lib2@{file URL}"'.`,
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

      const gas_library = await getLibraries(options);

      await executeGasScript({
        filename,
        script,
        display: options.display,
        useSandbox,
        sandboxConfig,
        gfSettings: settingsPath,
        args,
        gas_library,
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
