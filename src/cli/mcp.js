import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "child_process";
import { MCP_VERSION } from "./utils.js";

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

const SERVICES = [
  {
    name: "spreadsheet_service",
    description: "Automate Google Sheets: Create, read, and modify spreadsheets, ranges, and formatting.",
    example: "const ss = SpreadsheetApp.create('Test'); ss.getActiveSheet().getRange('A1').setValue('Hello');"
  },
  {
    name: "document_service",
    description: "Automate Google Docs: Create and edit documents, paragraphs, tables, and styles.",
    example: "const doc = DocumentApp.create('Hello'); doc.getBody().appendParagraph('World');"
  },
  {
    name: "drive_service",
    description: "Manage Google Drive: Search files, create folders, and handle permissions.",
    example: "const files = DriveApp.getFilesByName('Test'); while(files.hasNext()) console.log(files.next().getName());"
  },
  {
    name: "gmail_service",
    description: "Automate Gmail: Send emails, search threads, and manage labels.",
    example: "GmailApp.sendEmail('test@example.com', 'Subject', 'Body');"
  },
  {
    name: "calendar_service",
    description: "Manage Google Calendar: Create events, list calendars, and handle invitations.",
    example: "CalendarApp.getDefaultCalendar().createEvent('Meeting', new Date(), new Date());"
  },
  {
    name: "slides_service",
    description: "Automate Google Slides: Create and edit presentations, slides, and shapes.",
    example: "const deck = SlidesApp.create('Presentation'); deck.appendSlide().insertShape(SlidesApp.ShapeType.RECTANGLE);"
  },
  {
    name: "forms_service",
    description: "Automate Google Forms: Create forms, add items, and manage responses.",
    example: "const form = FormApp.create('Survey'); form.addTextItem().setTitle('Name');"
  },
  {
    name: "jdbc_service",
    description: "Connect to databases via JDBC: Execute SQL queries and manage connections.",
    example: "const conn = Jdbc.getConnection(url, user, pass); const stmt = conn.createStatement();"
  },
  {
    name: "utilities_service",
    description: "General utilities: Formatting, parsing, and base64 encoding/decoding.",
    example: "const base64 = Utilities.base64Encode('hello');"
  },
  {
    name: "urlfetch_service",
    description: "HTTP Requests: Fetch external resources and APIs via GET/POST.",
    example: "const res = UrlFetchApp.fetch('https://api.example.com'); console.log(res.getContentText());"
  }
];

export async function startMcpServer() {
  const server = new McpServer({
    name: "gas-fakes-skills-mcp",
    version: MCP_VERSION,
  });

  // Register a tool for each high-level service
  for (const service of SERVICES) {
    server.registerTool(
      service.name,
      {
        description: `${service.description}\nExample script:\n${service.example}`,
        inputSchema: {
          script: z.string().describe("The Google Apps Script code to execute locally."),
        },
      },
      async ({ script }) => {
        return await runGasFakes(script);
      }
    );
  }

  // Also add a generic tool for tasks that span multiple services
  server.registerTool(
    "workspace_agent",
    {
      description: "A general-purpose agent to automate tasks across multiple Google Workspace services (Sheets, Docs, Drive, etc.)",
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
