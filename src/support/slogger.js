/**
 * @fileoverview a logger that can be silenced by an env variable
 * used for all internal gas-fakes logging
 */

const q = process.env.QUIET || false
export const isQuiet =  q.toString().toLowerCase()=== "true";

export const slogger = {
  log: isQuiet ? () => {} : console.log,
  error: console.error,
  warn: console.warn,
  info: isQuiet ? () => {} : console.info
};