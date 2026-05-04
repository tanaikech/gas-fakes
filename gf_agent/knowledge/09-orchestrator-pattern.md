# Orchestrator and Service Agent Pattern

To improve the reliability and accuracy of `gf_agent` when handling complex Google Workspace tasks, the agent should follow an **Orchestrator/Service Agent** architecture. This pattern minimizes "tool space interference" and ensures that the agent always uses the most accurate and up-to-date implementation details for each service.

## The Problem: Tool Space Interference
When an agent attempts to handle multiple services (e.g., Spreadsheet, Drive, and Gmail) in a single turn, the context can become overwhelmed with conflicting method signatures or outdated knowledge from external search results. This often leads to "hallucinated" methods or incorrect parameter usage.

## The Solution: Modular Delegation

### 1. The Orchestrator Phase
Upon receiving a user request, the agent acts as an **Orchestrator**. 
- **Identify Services**: Determine exactly which Apps Script services are required (e.g., `SpreadsheetApp`, `DriveApp`).
- **Decomposition**: Break the request into service-specific sub-tasks.
- **Service Verification**: Verify that the required services and classes exist by checking the local `skills/` directory within the `gf_agent` skill.

### 2. The Service Agent Phase (Context Compression)
For each identified service, the main agent MUST invoke a **sub-agent** (e.g., `generalist`) to perform the deep research.
- **Why?**: Large documentation files (like `spreadsheet.md`) can bloat the main context window. Sub-agents run in isolated environments and return only a distilled summary.
- **Process**:
  1. Main Agent calls `invoke_agent` with the instruction: "Research Class X in Service Y from remote docs. Return ONLY the method signatures for A, B, and C."
  2. Sub-Agent uses `curl` + `awk` (or `web_fetch`) to find the information.
  3. Sub-Agent returns a precise report.
  4. The main context stays lean.

- **Remote Document Retrieval (Sub-Agent Technique)**:
  - Sub-agents should use `run_shell_command` with `curl` and `awk` for surgical class extraction.
  - **Branch Routing (CRITICAL)**: 
    - If the user is operating within the `gas-fakes` repository (developer mode), the sub-agent MUST run `git branch --show-current` to determine the active branch, and use THAT branch name in the URL. This ensures they get work-in-progress signatures.
    - If the user is operating outside the repository (end-user mode), the sub-agent MUST ALWAYS use the `main` branch.
  - **Command Template**:
  - `curl -s https://raw.githubusercontent.com/brucemcpherson/gas-fakes/{BRANCH_NAME}/progress/{Service}.md | awk '/^## Class: \[{ClassName}\]/{flag=1; print; next} /^## Class:/{if(flag) {flag=0; exit}} flag'`
  - *(Note: `{Service}.md` is case-sensitive. Check `gf_agent/skills/` for the exact casing, e.g., `Spreadsheet.md`)*

### 3. Synthesis and Execution
Once all required service-specific knowledge is gathered:
- **Unified Implementation**: Combine the gathered patterns into a single, cohesive Apps Script block.
- **Execution**: Use the `mcp_gas-fakes-mcp_workspace_agent` to execute the script.
- **Validation**: If the script fails, the agent returns to the Service Agent phase for the failing service to re-verify the implementation details.

## Benefits
- **Zero-Search Dependency**: By using the remote `progress` files as the primary source of truth, the agent avoids the risk of using outdated or non-parity GAS snippets found on the web.
- **Context Efficiency**: Researching one service at a time prevents the "interference" of unrelated documentation.
- **Parity Guarantee**: The remote documentation is generated directly from the `gas-fakes` source code, ensuring 100% parity with the local environment.
