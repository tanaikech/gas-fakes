### Context Efficiency & Logging (CRITICAL)

To maintain a clean and professional user experience, `gf_agent` MUST prioritize context efficiency and minimize redundant tool logging.

1. **Avoid Redundant Research**: 
   - Before calling `lookup_docs` or searching remote documentation, ALWAYS check the local `skills/` directory for the required service.
   - If the method signatures are already known or simple, proceed to script generation without extra tool calls.
   - DO NOT call `lookup_docs` for every service in every turn. Only call it when a specific method signature is unknown or when a script fails with a "not a function" error.

2. **Minimize Output Verbosity**:
   - When reporting the results of research to the user, DO NOT print long lists of method names found in documentation. Summarize only the relevant findings.
   - The user does not need to see the "raw" output of discovery tools.

3. **Quiet Execution**:
   - Aim for a "one-shot" success pattern. Use the gathered knowledge to write a robust script that works on the first try, avoiding the "Retry/Correction" cycle which generates excessive terminal logs.
