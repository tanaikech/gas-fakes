import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { MCP_VERSION } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes a GAS script using the gas-fakes CLI logic.
 */
async function runGasFakes(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [process.argv[1], "-s", script], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => (stdoutData += data.toString()));
    child.stderr.on("data", (data) => (stderrData += data.toString()));

    child.on("close", (code) => {
      if (code === 0) {
        resolve({
          content: [{ type: "text", text: stdoutData || "Success" }],
          isError: false,
        });
      } else {
        resolve({
          content: [{ type: "text", text: stderrData || stdoutData || "Error" }],
          isError: true,
        });
      }
    });
  });
}

// Available services mapping for the documentation lookup
const AVAILABLE_SERVICES = [
  "base", "cache", "calendar", "charts", "document", "drive", 
  "forms", "gmail", "jdbc", "lock", "properties", "script", 
  "slides", "spreadsheet", "urlfetch", "utilities", "xml"
];

export async function startMcpServer() {
  const server = new McpServer({
    name: "gas-fakes-skills-mcp",
    version: MCP_VERSION,
  });

  // Documentation lookup tool
  server.registerTool(
    "lookup_docs",
    {
      description: "Lookup the available Google Apps Script classes and methods supported by gas-fakes for a specific service. You MUST use this tool to read the documentation before writing a script to ensure the methods you plan to use are actually implemented.",
      inputSchema: {
        service: z.enum(AVAILABLE_SERVICES).describe("The Google Apps Script service to look up (e.g., 'spreadsheet', 'drive', 'document')."),
      },
    },
    async ({ service }) => {
      try {
        const fileName = `${service.toLowerCase()}.md`;
        
        // Define potential paths for the skills documentation
        const potentialPaths = [
          // 1. Local project installation (e.g. from gas-fakes init standalone)
          path.resolve(process.cwd(), "gf_agent", "skills", fileName),
          path.resolve(process.cwd(), "gf_agent_standalone", "gf_agent", "skills", fileName),
          
          // 2. Global Gemini CLI skill installation
          path.resolve(os.homedir(), ".gemini", "skills", "gf_agent", "skills", fileName),
          
          // 3. Bundled inside the npm package
          path.resolve(__dirname, "../../gf_agent/skills", fileName)
        ];

        let docsPath = null;
        for (const p of potentialPaths) {
          if (fs.existsSync(p)) {
            docsPath = p;
            break;
          }
        }

        if (!docsPath) {
          // If not found locally, try fetching from the GitHub repository
          const githubRawUrl = `https://raw.githubusercontent.com/brucemcpherson/gas-fakes/main/gf_agent/skills/${fileName}`;
          try {
            const response = await fetch(githubRawUrl);
            if (response.ok) {
              const githubContent = await response.text();
              return {
                content: [{ type: "text", text: githubContent }],
                isError: false,
              };
            }
          } catch (fetchErr) {
            // Silently fail the fetch and fall through to the local error message
          }
          
          return {
            content: [{ type: "text", text: `Documentation not found for service: ${service}. Checked multiple standard locations and GitHub origin.` }],
            isError: true,
          };
        }
        
        const content = fs.readFileSync(docsPath, "utf-8");
        return {
          content: [{ type: "text", text: content }],
          isError: false,
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Failed to read documentation: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  // Consolidated execution tool
  server.registerTool(
    "run_script",
    {
      description: "Executes Google Apps Script code locally using the gas-fakes emulator. You can interact with multiple Workspace services in a single script.",
      inputSchema: {
        script: z.string().describe("The Google Apps Script code to execute locally."),
      },
    },
    async ({ script }) => {
      return await runGasFakes(script);
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
