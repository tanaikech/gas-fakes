import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MCP_VERSION } from "./utils.js";
import { getLibraries } from "./lib-manager.js";

/**
 * Constructs the CLI arguments array for gas-fakes execution.
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

  if (filename) cliArgs.push("-f", filename);
  if (script) cliArgs.push("-s", script);
  if (args) cliArgs.push("-a", JSON.stringify(args));
  if (sandbox) cliArgs.push("-x");
  if (whitelistRead) cliArgs.push("-w", whitelistRead);
  if (whitelistReadWrite) cliArgs.push("--ww", whitelistReadWrite);
  if (whitelistReadWriteTrash) cliArgs.push("--wt", whitelistReadWriteTrash);
  if (json) cliArgs.push("-j", JSON.stringify(json));

  return cliArgs;
}

/**
 * Executes the gas-fakes command via child_process.spawn.
 */
async function runGasFakesProcess(cliArgs) {
  return new Promise((resolve) => {
    // Invoke the current node executable with the current script (gas-fakes.js)
    // We assume process.argv[1] points to the entry point
    const child = spawn(process.execPath, [process.argv[1], ...cliArgs], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
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
        .describe("Whitelist of file IDs for readonly access."),
      whitelistReadWrite: z
        .string()
        .optional()
        .describe("Whitelist of file IDs for read/write access."),
      whitelistReadWriteTrash: z
        .string()
        .optional()
        .describe("Whitelist of file IDs for read/write/trash access."),
      json: z.any().optional().describe("Advanced sandbox configuration JSON."),
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
    description: "Use this to create the tools of the MCP server...",
    inputSchema: {
      filename: z.string().describe("Filename of the tool file (.js)."),
      tools: z.array(
        z.object({
          name: z.string(),
          schema: z.string(),
          gas_script: z.string(),
          libraries: z.array(z.string()).default([]),
        })
      ),
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
    for (let i = 0; i < args.tools.length; i++) {
      const { name, schema, gas_script, libraries } = args.tools[i];
      tool_ar.push(
        `{ name: "${name}", schema: ${schema}, func: (object = {}) => { \n\n${gas_script} }, libraries: ${JSON.stringify(
          libraries || []
        )} }`
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

  // server.registerTool("create-new-tools", schema2, async (args) => {
  //   if (!args.filename || !args.tools) {
  //     return {
  //       content: [
  //         { type: "text", text: "Error: `filename` and `tools` are required." },
  //       ],
  //       isError: true,
  //     };
  //   }

  //   const tool_ar = [];
  //   for (let i = 0; i < args.tools.length; i++) {
  //     const { name, schema, gas_script, libraries } = args.tools[i];
  //     // Note: This generation logic is complex; assuming gas_library is empty for generation context,
  //     // or simply rendering the array strings.
  //     tool_ar.push(
  //       `{ name: "${name}", schema: ${schema}, func: (object = {}) => { \n\n${gas_script} }, libraries: ${JSON.stringify(
  //         libraries
  //       )} }`
  //     );
  //   }

  //   const tool_script = [
  //     `import { z } from "zod";`,
  //     ``,
  //     `const tools = [${tool_ar.join(", ")}];`,
  //   ].join("\n");
  //   const absolutePath = path.resolve(process.cwd(), args.filename);
  //   fs.writeFileSync(absolutePath, tool_script);
  //   return {
  //     content: [
  //       {
  //         type: "text",
  //         text: `A new file including tools for gas-fakes-mcp was successfully created as "${absolutePath}".`,
  //       },
  //     ],
  //     isError: false,
  //   };
  // });
}

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
    const extendedSchema = { ...tool.schema };
    extendedSchema.inputSchema = {
      gas_args: z
        .object(tool.schema.inputSchema)
        .describe("Arguments for Google Apps Script."),
      sandbox: z.boolean().describe("Run in sandbox."),
      whitelistRead: z.string().optional(),
      whitelistReadWrite: z.string().optional(),
      whitelistReadWriteTrash: z.string().optional(),
      json: z.any().optional(),
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

export async function startMcpServer(options) {
  const { tools } = options;
  const server = new McpServer({
    name: "gas-fakes-mcp",
    version: MCP_VERSION,
  });

  registerDefaultTool(server);

  if (tools) {
    await registerCustomTools(server, tools);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
