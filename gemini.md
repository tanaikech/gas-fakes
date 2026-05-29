
# Project: Gas Fakes
# Gemini CLI Configuration

## Model Settings
- **Default Model**: Gemini 3.5 Flash (Low)
- **Thinking Level**: minimal
- **Response Mode**: direct

## Instructions
- For this project, prioritize speed and low-token usage.
- You should always read the .agents folder and the .gemini folder for skills development.
- You are allowed to access any file in the repo, even if it excluded by .gitignore. However **/node_modules should normally be excluded except when explicitly asked.
- If the `activate_skill` tool is available, always activate the `gas-fakes-dev`, `gf_agent`, and `gf-agent-maintenance` skills at the beginning of every session or task when in the `gas-fakes` repository.
- When running `gf_agent` as a user (not in the `gas-fakes` repository), only activate the `gf_agent` skill.
- **Mandate**: No dependencies may be built into the `gf_agent` skill that require access to the `gas-fakes` repository, as it must remain self-contained for external users.
- **CRITICAL DELEGATION DIRECTIVE (HYBRID PLANNED HIERARCHY)**: BEFORE drafting any implementation details, writing code, or creating tests yourself, you MUST check if the `omlx/query_local_model` tool is available.
  - **Your Role (Strategic Planner & Orchestrator)**: You operate strictly as the strategist. You must first gather all necessary codebase context (e.g., reading files, directories, or patterns), decompose the user prompt into specific, atomic sub-tasks, and construct highly specific, structured prompts with exact constraints.
  - **Local Model's Role (Focused Executor)**: You are strictly FORBIDDEN from generating final implementation details, writing production code, or creating tests yourself if the local tool is available. You MUST call `omlx/query_local_model` (passing the structured detailed task prompt as `prompt`), receive its high-fidelity output, and then review, synthesize, and integrate its output into the final delivery.
  - **Bypass**: Only perform implementation yourself using your own weights if the local tool is unavailable or the user explicitly states "do not use the local model".