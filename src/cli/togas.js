import fs from "fs";
import path from "path";
import prompts from "prompts";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { Utils } from "../support/utils.js";

/**
 * Prepares and pushes local code to Google Apps Script using clasp.
 * @param {object} options Options object provided by commander.js.
 */
export async function togas(options) {
  // 1. Load env
  const envPath = path.resolve(process.cwd(), options.env || "./.env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, quiet: true, override: true });
  }

  const target = options.target || process.env.TOGAS_TARGET;
  const scriptId = options.scriptId || process.env.TOGAS_SCRIPT_ID || process.env.GF_SCRIPT_ID;
  const pattern = options.pattern || process.env.TOGAS_PATTERN || "*";
  const source = options.source || "./";
  const autoAccept = !!options.quiet;

  if (!target) {
    console.error("Error: TOGAS_TARGET is not set. Please run 'gas-fakes init' or provide --target.");
    process.exit(1);
  }

  const absoluteTarget = path.resolve(process.cwd(), target);
  const absoluteSource = path.resolve(process.cwd(), source);

  if (absoluteTarget === absoluteSource) {
    console.error("Error: Target directory cannot be the same as the source directory.");
    process.exit(1);
  }

  // 2. Prepare target
  if (!fs.existsSync(absoluteTarget)) {
    fs.mkdirSync(absoluteTarget, { recursive: true });
  }

  const claspJsonPath = path.join(absoluteTarget, ".clasp.json");
  if (!fs.existsSync(claspJsonPath)) {
    let create = autoAccept;
    if (!create) {
      const response = await prompts({
        type: "confirm",
        name: "create",
        message: `No .clasp.json found in ${target}. Create one?`,
        initial: true
      });
      create = response.create;
    }

    if (create) {
        if (!scriptId) {
             console.error("Error: No Script ID found. Please provide one with --scriptId or in .env.");
             process.exit(1);
        }
        const claspConfig = { scriptId, rootDir: "./" };
        fs.writeFileSync(claspJsonPath, JSON.stringify(claspConfig, null, 2));
        console.log(`Created .clasp.json with scriptId: ${scriptId}`);
    } else {
      console.log("Operation cancelled.");
      return;
    }
  } else {
    // Check scriptId
    try {
        const claspConfig = JSON.parse(fs.readFileSync(claspJsonPath, "utf8"));
        if (scriptId && claspConfig.scriptId !== scriptId) {
            console.error(`Error: .clasp.json scriptId (${claspConfig.scriptId}) does not match configured scriptId (${scriptId}).`);
            process.exit(1);
        }
    } catch (e) {
        console.warn(`Warning: Failed to parse ${claspJsonPath}.`);
    }
  }

  // 3. Copy files
  console.log(`...scanning source: ${absoluteSource}`);
  console.log(`...matching patterns: ${pattern}`);
  
  // Create an array of regexes for the comma-separated patterns
  // We want to match the pattern explicitly ending in .js, .html, or .gs
  const regexPatterns = pattern.split(',').map(p => p.trim()).filter(Boolean).map(p => {
    // Escape regex characters except the * wildcard
    const escapedPattern = p.split('*').map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    
    // If the user provided an extension, use it, otherwise match our target extensions
    if (p.endsWith('.js') || p.endsWith('.html') || p.endsWith('.gs')) {
      return new RegExp("^" + escapedPattern + "$");
    } else {
      // Append the target extensions to the pattern
      return new RegExp("^" + escapedPattern + "\\.(js|html|gs)$");
    }
  });
  
  const copiedFiles = [];
  const specialFiles = ["appsscript.json"];

  // Helper to walk directory recursively and efficiently
  function walkSync(dir, relativeDir = "") {
    const absoluteDir = path.join(dir, relativeDir);
    
    // Skip target directory if it's inside source
    if (absoluteDir === absoluteTarget) return;
    
    const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryRelativePath = path.join(relativeDir, entry.name);
      const entryAbsolutePath = path.join(dir, entryRelativePath);
      
      if (entry.isDirectory()) {
        // Skip common ignored directories
        if (entry.name === "node_modules" || entry.name === ".git" || entryAbsolutePath === absoluteTarget) {
          continue;
        }
        walkSync(dir, entryRelativePath);
      } else if (entry.isFile()) {
        const fileName = entry.name;
        const extension = path.extname(fileName).toLowerCase();
        
        // Handle special files
        if (specialFiles.includes(entryRelativePath)) {
          const destPath = path.join(absoluteTarget, entryRelativePath);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(entryAbsolutePath, destPath);
          if (extension === ".js" || extension === ".gs") copiedFiles.push(destPath);
          continue;
        }

        // Match patterns for .js, .gs, .html
        if ((extension === ".js" || extension === ".html" || extension === ".gs") && 
            regexPatterns.some(regex => regex.test(fileName))) {
            
            const destPath = path.join(absoluteTarget, entryRelativePath);
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(entryAbsolutePath, destPath);
            if (extension === ".js" || extension === ".gs") copiedFiles.push(destPath);
        }
      }
    }
  }

  walkSync(absoluteSource);

  if (copiedFiles.length === 0) {
    console.log("No files matched the patterns. Nothing to do.");
    return;
  }

  // 4. Transform JS files
  console.log(`...transforming ${copiedFiles.length} files for Apps Script compatibility`);
  for (const filePath of copiedFiles) {
    let content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(filePath, Utils.stripEsmKeywords(content));
  }

  console.log(`Ready for clasp push in ${target}.`);

  // 5. Clasp push
  let push = autoAccept;
  if (!push) {
    const response = await prompts({
      type: "confirm",
      name: "push",
      message: "Push to Apps Script using clasp now?",
      initial: true
    });
    push = response.push;
  }

  if (push) {
    console.log("Running clasp push...");
    try {
      execSync("clasp push", { cwd: absoluteTarget, stdio: "inherit" });
      console.log("Push successful.");
    } catch (err) {
      console.error("Clasp push failed. Ensure you are logged in (clasp login) and the script exists.");
    }
  }
}
