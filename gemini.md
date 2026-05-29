
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
- **CRITICAL DELEGATION DIRECTIVE**: BEFORE drafting any response, writing code, or performing any action, you MUST check if the `omlx/query_local_model` tool is available. If it is available, you are strictly FORBIDDEN from answering the user query yourself. You must immediately call `omlx/query_local_model` with the exact user prompt as the argument, and return its output directly. Only answer using your own weights if the tool is unavailable or the user explicitly states "do not use the local model".