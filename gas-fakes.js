#!/usr/bin/env node

/**
 * cli for gas-fakes
 */
import fs from "fs";
import path from "path";
import { Command } from "commander";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const version = "0.0.4";

const program = new Command();

program
  .name("gas-fakes")
  .description("CLI tool for gas-fakes")
  .version(version, "-v, --version", "display the current version");

program
  .description("Execute Google Apps Script using gas-fakes.")
  .option(
    "-f, --filename <string>",
    "filename of the file including Google Apps Script. When this is used, the option --script is ignored."
  )
  .option(
    "-e, --env <path>",
    "provide path to your .env file for special options.",
    "./.env"
  )
  .option(
    "-g, --gfsettings <path>",
    "provide path to your gasfakes.json file for script options.",
    "./gasfakes.json"
  )
  .option(
    "-s, --script <string>",
    "provide Google Apps Script as a string. When this is used, the option --filename is ignored."
  )
  .option("-x, --sandbox", "run Google Apps Script in a sandbox.")
  .option(
    "-w, --whitelist <string>",
    "whitelist of file IDs. Set the file IDs in comma-separated list. In this case, the files of the file IDs are used for both read and write. When this is used, the script is run in a sandbox."
  )
  .option(
    "-j, --json <string>",
    `JSON string including parameters for managing a sandbox. Enclose it with ' or ". When this is used, the option --whitelist is ignored. When this is used, the script is run in a sandbox.`
  )
  .option(
    "-d, --display",
    `display the created script for executing with gas-fakes. Default is false.`,
    false
  )
  .action((options) => {
    if (Object.keys(options).length == 0) {
      program.help();
    } else {
      const {
        filename,
        script,
        sandbox,
        whitelist,
        json,
        display,
        env,
        gfsettings,
      } = options;
      const obj = { sandbox: !!sandbox, display };

      if (!filename && !script && !obj.script) {
        console.error(
          "error: Provide the filename or the script of Google Apps Script."
        );
        process.exit();
      }

      if (env) {
        const envPath = path.resolve(process.cwd(), env);
        console.log("...using env file in", envPath);
        dotenv.config({ path: envPath, quiet: true });
      }

      // note this must come after any env file fiddling.
      if (gfsettings) {
        const gfPath = path.resolve(process.cwd(), gfsettings);
        console.log("...using gasfakes settings file in", gfPath);
        obj.gfSettings = gfPath;
        // override whatever is in env
        process.env.GF_SETTINGS_PATH = gfPath;
      }

      if (filename) {
        obj.filename = filename;
      }
      if (!obj.script && script) {
        obj.script = script;
      }

      // for sandbox
      if (whitelist) {
        const ar = whitelist.split(",").map((e) => e.trim());
        if (ar.length > 0) {
          obj.whitelistItems = ar;
        }
      }
      if (json) {
        try {
          const temp = JSON.parse(json);
          obj.json_sandbox = temp;
        } catch (err) {
          console.error("error: Invalid JSON.");
          process.exit();
        }
      }
      loadScript(obj);
    }
  });

const execAsync = promisify(exec);
program
  .command("mcp")
  .description("Launch gas-fakes as the MCP server")
  .action(mcp_server);

program.showHelpAfterError("(add --help for additional information)");
program.parse();

function __getImportScript(o) {
  const { scriptText, sandbox, whitelistItems, json_sandbox } = o;
  if (scriptText.trim() == "") {
    console.error("error: Google Apps Script was not found.");
    process.exit();
  }
  const gasScriptAr = [];
  if (json_sandbox) {
    gasScriptAr.push(
      `const behavior = ScriptApp.__behavior;`,
      `behavior.sandboxMode = true;`,
      `behavior.strictSandbox = true;`
    );
    const { whitelistItems, whitelistServices, blacklistServices } =
      json_sandbox;
    if (whitelistServices && whitelistServices.length > 0) {
      const bl = whitelistServices.flatMap(({ className, methodNames }, i) => {
        if (!className) {
          console.error(
            "error: Class name was not found in whitelistServices."
          );
          process.exit();
        }
        const k = `s${i + 1}`;
        const temp = [`const ${k} = behavior.sandboxService.${className};`];
        if (methodNames && methodNames.length > 0) {
          temp.push(
            `${k}.setMethodWhitelist([${methodNames.map((e) => `"${e}"`)}]);`
          );
        }
        return temp;
      });
      gasScriptAr.push(...bl);
    }
    if (blacklistServices && blacklistServices.length > 0) {
      const bl = blacklistServices.map(
        (e) => `behavior.sandboxService.${e}.enabled = false;`
      );
      gasScriptAr.push(bl);
    }
    if (whitelistItems && whitelistItems.length > 0) {
      const wl = whitelistItems
        .map(({ itemId = "", read = true, write = false, trash = false }) => {
          if (!itemId) {
            console.error("error: itemId was not found in whitelistItems.");
            process.exit();
          }
          return `behavior.newIdWhitelistItem("${itemId}").setRead(${read}).setWrite(${write}).setTrash(${trash})`;
        })
        .join(",");
      gasScriptAr.push(`behavior.setIdWhitelist([${wl}]);`);
    }
    gasScriptAr.push(`\n\n${scriptText}\n\n`, `ScriptApp.__behavior.trash();`);
  } else {
    if (sandbox && (!whitelistItems || whitelistItems.length === 0)) {
      gasScriptAr.push(
        sandbox ? `ScriptApp.__behavior.sandBoxMode = true;` : "",
        `\n\n${scriptText}\n\n`,
        sandbox ? `ScriptApp.__behavior.trash();` : ""
      );
    } else if (whitelistItems && whitelistItems.length > 0) {
      const wl = whitelistItems
        .map((id) => `behavior.newIdWhitelistItem("${id}").setWrite(true)`)
        .join(",");
      gasScriptAr.push(
        `const behavior = ScriptApp.__behavior;`,
        `behavior.sandboxMode = true;`,
        `behavior.strictSandbox = true;`,
        `behavior.setIdWhitelist([${wl}]);``\n\n${scriptText}\n\n`,
        `ScriptApp.__behavior.trash();`
      );
    } else {
      gasScriptAr.push(scriptText);
    }
  }
  const importScriptAr = [
    `async function runGas() {`,
    `await import("./main.js");`, // This will trigger the fxInit call
    ...gasScriptAr,
    `};`,
    ``,
    `runGas();`,
  ];
  return {
    mainScript: importScriptAr.join("\n"),
    gasScript: gasScriptAr.join("\n"),
  };
}

function __replacer(text) {
  const regex = /("[^"]*")|('[^']*')|(`[^`]*`)|(\\n)/g;
  return text.replace(regex, (m, g1, g2, g3, g4) => (g4 ? "\n" : m));
}

async function loadScript(o) {
  const { filename, script, display } = o;
  const scriptText = filename ? fs.readFileSync(filename, "utf8") : script;
  const { mainScript, gasScript } = __getImportScript({
    scriptText: __replacer(scriptText),
    ...o,
  });
  if (display) {
    console.log(`\n--- script ---\n${gasScript}\n--- /script ---\n`);
  }
  const gasFunc = new Function(mainScript);
  // The script needs access to the settings path variable we just created
  Object.defineProperty(globalThis, "settingsPath", {
    value: o.gfSettings,
    writable: true,
    configurable: true,
  });
  gasFunc();
}

async function mcp_server() {
  const server = new McpServer({
    name: "gas-fakes-mcp",
    version: "0.0.2",
  });

  const { name, schema, func } = {
    name: "run-gas-by-gas-fakes",
    schema: {
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
        whitelist: z
          .string()
          .describe(
            "Use this to use the specific files and folders on Google Drive. whitelist of file IDs. Set the file IDs in comma-separated list. In this case, the files of the file IDs are used for both read and write. When this is used, the script is run in a sandbox."
          )
          .optional(),
        json: z
          .string()
          .describe(
            `Use this to manage the sandbox more if the detailed information about the sandbox is provided. JSON string including parameters for managing a sandbox. Enclose it with ' or ". When this is used, the option "whitelist" is ignored. When this is used, the script is run in a sandbox.`
          )
          .optional(),
      },
    },
    func: async (options = {}) => {
      const { filename, sandbox, whitelist, json } = options;
      if (!filename) {
        return {
          content: [
            {
              type: "text",
              text: "Provide the filename of the file including Google Apps Script.",
            },
          ],
          isError: true,
        };
      }
      try {
        const opts = [
          { v: sandbox, k: "-x" },
          { v: whitelist, k: "-w" },
          { v: json, k: "-j" },
        ].reduce((ar, { v, k }) => {
          if (v) {
            ar.push(k != "-x" ? `${k} ${v}` : `${k}`);
          }
          return ar;
        }, []);
        const c = `gas-fakes ${opts.join(" ")} -f ${filename}`;
        const { stdout } = await execAsync(c);
        return {
          content: [{ type: "text", text: stdout || "Done." }],
          isError: false,
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: err.message }],
          isError: true,
        };
      }
    },
  };

  server.registerTool(name, schema, func);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
