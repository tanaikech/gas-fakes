#!/usr/bin/env node

/**
 * cli for gas-fakes
 * v0.0.1
 */
import fs from "fs";
import { Command } from "commander";

const version = "0.0.1";

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
      const { filename, script, sandbox, whitelist, json, display } = options;
      const obj = { sandbox: !!sandbox, display };
      if (!filename && !script) {
        console.error(
          "error: Provide the filename or the script of Google Apps Script."
        );
        process.exit();
      }
      if (filename) {
        obj.filename = filename;
      }
      if (script) {
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
        `behavior.setIdWhitelist([${wl}]);`,
        `\n\n${scriptText}\n\n`,
        `ScriptApp.__behavior.trash();`
      );
    } else {
      gasScriptAr.push(scriptText);
    }
  }
  const importScriptAr = [
    `async function runGas() {`,
    `await import("../main.js");`,
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

async function loadScript(o) {
  const { filename, script, display } = o;
  const scriptText = filename ? fs.readFileSync(filename, "utf8") : script;
  const { mainScript, gasScript } = __getImportScript({ scriptText, ...o });
  if (display) {
    console.log(`--- script ---`);
    console.log(gasScript);
    console.log(`--- /script ---`);
  }
  const gasFunc = new Function(mainScript);
  gasFunc();
}
