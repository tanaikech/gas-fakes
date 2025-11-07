import fs from 'node:fs';
import { isQuiet } from '../slogger.js';
export const syncLog = (message) => {
  if (!isQuiet) fs.writeSync(1, `[Worker] ${message}\n`);
};

export const syncWarn = (message) => {
  fs.writeSync(1, `[Worker Warn] ${message}\n`);
};

export const syncInfo = (message) => {
  if (!isQuiet) fs.writeSync(1, `[Worker Info] ${message}\n`);
};
export const syncError = (message, error) => {
  // Providing the error object is optional
  const errorMessage = error ? `: ${error?.stack || error}` : '';
  fs.writeSync(2, `[Worker Error] ${message}${errorMessage}\n`);
};