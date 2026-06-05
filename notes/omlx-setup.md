# oMLX Setup and Documentation

This document provides a comprehensive guide to setting up and utilizing oMLX (Omni-Local Model eXchange), a framework designed to delegate complex generation tasks from hosted LLMs (like Gemini) to local, specialized models running on your hardware.

---

## 🚀 1. Overview: What is oMLX?

oMLX is a sophisticated architectural pattern that enables a centralized, powerful LLM (the **Strategic Planner**) to intelligently offload specific, resource-intensive tasks to a local, specialized LLM (the **Focused Executor**).

Instead of relying solely on the hosted API for every request, oMLX acts as a middleware layer, allowing the hosted model to dynamically decide when a task is best suited for local execution. This hybrid approach maximizes the strengths of both cloud-based and local AI infrastructure.

---

## ⚙️ 2. Setup and Configuration

The core of the oMLX system is the **MCP Server** (Model Communication Protocol Server), which acts as the local endpoint for the Focused Executor.

### 2.1. The oMLX MCP Server

The local server is implemented via [tools/omlx_mcp_server.cjs](file:///Users/brucemcpherson/Documents/repos/gas-fakes/tools/omlx_mcp_server.cjs). This server listens for requests from the hosted LLM (Gemini) and routes them to the locally running model instance.

**Key Functionality:**
*   **Listening Endpoint:** Provides a local HTTP endpoint that the hosted LLM can call via its tool-use mechanism.
*   **Model Interface:** Manages the interaction with the local model (e.g., running inference on a local GPU/CPU).
*   **Request Handling:** Parses the structured query sent by the Strategic Planner and executes the local model inference.

### 2.2. Configuration Methods

The server and the overall system behavior are controlled via environment variables or a local configuration file.

#### Environment Variables
You can set configuration parameters directly in your shell environment:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `AGY_CUSTOM_BASE_URL` | The base URL for the local oMLX MCP Server. | `http://localhost:8080/omlx` |
| `AGY_DEFAULT_MODEL` | The name or identifier of the local model to be used for execution. | `llama3-8b-quantized` |
| `AGY_CUSTOM_API_KEY` | An optional API key for authentication to the local server. | `local-secret-key` |

#### Local Environment File
For persistent or complex setups, use [tools/omlx.env.example](file:///Users/brucemcpherson/Documents/repos/gas-fakes/tools/omlx.env.example) and populate it with your specific configuration.

```bash
# tools/omlx.env
AGY_CUSTOM_BASE_URL="http://127.0.0.1:8080/omlx"
AGY_DEFAULT_MODEL="mistral-7b-local"
AGY_CUSTOM_API_KEY="my-secure-local-key"
```

### 2.3. Integrating with External Tools (Cursor/Gemini)

To enable the hosted LLM (e.g., Gemini) to recognize and utilize the local model, you must configure the external tool's MCP settings to point to the local server path.

**Configuration Steps:**

1.  **Start the MCP Server:** Ensure `tools/omlx_mcp_server.cjs` is running and accessible.
2.  **Update Tool Settings:** In your IDE or LLM client (e.g., Cursor/Gemini settings), locate the configuration for custom tools or local endpoints.
3.  **Set Endpoint:** Configure the tool to point to the `AGY_CUSTOM_BASE_URL` defined in your environment.

This step allows the hosted LLM to treat the local server as a callable function, enabling the delegation workflow.

---

## 🧠 3. Gemini Directive & Hybrid Planned Hierarchy

The oMLX architecture operates on a strict, hierarchical delegation model:

### 3.1. The Roles

*   **Strategic Planner (Gemini):** The hosted, powerful LLM. Its role is high-level planning, context management, decision-making, and orchestration. It determines *what* needs to be done.
*   **Focused Executor (Local Model):** The local, specialized LLM. Its role is high-fidelity, resource-intensive execution of specific tasks. It determines *how* the task is completed.

### 3.2. The Delegation Mechanism (`query_local_model`)

The Strategic Planner is equipped with a specific tool, `query_local_model`. When the Planner determines that a task requires specialized, local computation (e.g., complex code generation, detailed data processing), it does not attempt to solve it itself. Instead, it generates a structured call to `query_local_model`, passing the necessary context and instructions to the local MCP Server.

The local model executes the task and returns the result to the Strategic Planner, which then integrates it into the final, polished response.

### 3.3. Operational Constraints (The Golden Rule)

To maintain the integrity of the hybrid system and prevent unnecessary cloud API usage, the Strategic Planner is given strict directives:

> **The Strategic Planner is strictly forbidden from drafting implementation details, writing production code, or creating tests directly when the `query_local_model` tool is available.**

If the task falls within the scope of a specialized, local execution, the Planner *must* delegate the task to the Focused Executor. This ensures that the local model, which is optimized for specific, detailed tasks, is utilized for maximum fidelity.

---

## ✨ 4. Benefits of Delegation

The adoption of the oMLX delegation pattern provides significant operational and financial advantages:

### 💾 Hardware Offloading and Efficiency
By delegating complex generation tasks (like large code blocks or detailed data analysis) to the local Focused Executor, you offload computational load from the cloud. This allows you to leverage specialized local hardware (e.g., dedicated GPUs) for high-throughput, low-latency execution of specific tasks.

### 💰 Cost and Token Savings
For hosted LLMs operating under token-based pricing (especially Flash plans), complex, verbose outputs can quickly accumulate costs. By offloading the heavy lifting to the local model, you drastically reduce the number of tokens consumed by the expensive hosted Gemini API, leading to substantial cost savings.

### 🎯 High-Fidelity Execution
Local models can be fine-tuned or specialized for specific domains (e.g., a code-generation model trained exclusively on Python). Delegation ensures that the most specialized and high-fidelity model is used for the task, resulting in superior output quality for that specific domain compared to a general-purpose cloud model.
