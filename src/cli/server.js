import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { startServer } from "../services/html/webapp.js";

/**
 * Starts a web server to handle doGet and doPost requests.
 */
export async function startWebApp(options = {}) {
  const { filename, env, port, function: entryFunction } = options;

  // Load environment variables
  const envPath = path.resolve(process.cwd(), env || "./.env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true });
  }

  const serverPort = port || process.env.GF_SERVER_PORT || 8080;
  const scriptPath = filename ? path.resolve(process.cwd(), filename) : null;

  if (!scriptPath || !fs.existsSync(scriptPath)) {
      console.error(`Error: GAS file not found: ${filename}`);
      process.exit(1);
  }

  console.log(`...starting web server for ${scriptPath} (entrypoint: ${entryFunction})`);
  startServer(serverPort, scriptPath, entryFunction);
}
