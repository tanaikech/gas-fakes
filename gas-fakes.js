#!/usr/bin/env node

import { main } from "./src/cli/app.js";

main().catch((error) => {
  console.error("\x1b[31mAn unexpected error occurred:\x1b[0m");
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
