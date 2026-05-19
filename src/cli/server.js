import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { startServer } from "../services/html/webapp.js";

/**
 * Starts a web server to handle doGet and doPost requests.
 */
export async function startWebApp(options = {}) {
  const { filename, env, port, main: entryFunction } = options;

  // Load environment variables
  const envPath = path.resolve(process.cwd(), env || "./.env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true, override: true });
  }

  const serverPort = port || process.env.GF_SERVER_PORT || 8080;
  let targetFilename = filename;
  if (targetFilename && !targetFilename.endsWith('.js')) {
      targetFilename += '.js';
  }
  const scriptPath = targetFilename ? path.resolve(process.cwd(), targetFilename) : null;

  if (!scriptPath || !fs.existsSync(scriptPath)) {
      console.error(`Error: GAS file not found: ${targetFilename}`);
      process.exit(1);
  }

  console.log(`...starting web server for ${scriptPath} (default entrypoint: ${entryFunction})`);
  startServer(serverPort, scriptPath, entryFunction);
}
