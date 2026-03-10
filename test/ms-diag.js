import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from current directory
dotenv.config();

const scopes = [
  "https://graph.microsoft.com/.default",
  "User.Read",
  "Files.ReadWrite.All",
  "openid",
  "offline_access"
];

console.log("--- Microsoft Graph 'az' CLI Diagnostic ---");
console.log(`Using Client ID: ${process.env.MS_GRAPH_CLIENT_ID || 'none found in .env'}`);

for (const scope of scopes) {
  try {
    console.log(`\nAttempting token for scope: ${scope}...`);
    const cmd = `az account get-access-token --resource-type ms-graph --scope "${scope}" --query accessToken -o tsv`;
    const start = Date.now();
    const stdout = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'], shell: true });
    console.log(`✅ Success (${Date.now() - start}ms)`);
    console.log(`Token starts with: ${stdout.substring(0, 20)}...`);
  } catch (e) {
    console.log(`❌ Failed`);
    console.log(`Error: ${e.stderr ? e.stderr.toString().split('\n')[0] : e.message}`);
  }
}
