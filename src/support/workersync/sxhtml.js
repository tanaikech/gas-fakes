// Export functions for html context sync

export async function sxHtmlTemplateEval(auth, content) {
  // We don't have access to the consumer's environment in this standard worker.
  // The worker runs gas-fakes code, not the consumer code.
  // This means the existing standard worker cannot resolve consumer globals.
  return content;
}
