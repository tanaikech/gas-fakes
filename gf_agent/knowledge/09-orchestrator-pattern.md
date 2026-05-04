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

### 2. The Service Agent Phase
For each identified service, the agent transitions into a **Service Agent** role (either in sequential turns or using parallel sub-agents).
- **Deep Research**: Instead of using Google Search, the agent fetches the detailed implementation documentation from the remote `gas-fakes` repository.
- **Source of Truth**: The `progress/` directory on GitHub contains the most granular documentation, including:
    - Supported method names and parameter types.
    - Status of implementation (completed vs. in-progress).
    - Links to the actual source code for reference.
- **Remote Document Retrieval**:
  - You MUST ALWAYS use the `main` branch for the URL, regardless of what local branch you are on.
  - `web_fetch("https://raw.githubusercontent.com/brucemcpherson/gas-fakes/main/progress/{Service}.md")`
  - **CRITICAL (Case Sensitivity)**: GitHub Raw URLs are case-sensitive. The `progress/` files in the repository have mixed casing (e.g., `Spreadsheet.md`, `Drive.MD`, `gmail.md`). If a fetch fails with a 404, try TitleCase or check `git ls-files | grep progress` if running locally to confirm the exact casing.
  - Example: `https://raw.githubusercontent.com/brucemcpherson/gas-fakes/main/progress/Spreadsheet.md`

### 3. Synthesis and Execution
Once all required service-specific knowledge is gathered:
- **Unified Implementation**: Combine the gathered patterns into a single, cohesive Apps Script block.
- **Execution**: Use the `mcp_gas-fakes-mcp_workspace_agent` to execute the script.
- **Validation**: If the script fails, the agent returns to the Service Agent phase for the failing service to re-verify the implementation details.

## Benefits
- **Zero-Search Dependency**: By using the remote `progress` files as the primary source of truth, the agent avoids the risk of using outdated or non-parity GAS snippets found on the web.
- **Context Efficiency**: Researching one service at a time prevents the "interference" of unrelated documentation.
- **Parity Guarantee**: The remote documentation is generated directly from the `gas-fakes` source code, ensuring 100% parity with the local environment.
