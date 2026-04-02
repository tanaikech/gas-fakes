
# Project: Gas Fakes
# Gemini CLI Configuration

## Model Settings
- **Default Model**: gemini-3.1-flash-lite-preview
- **Thinking Level**: minimal
- **Response Mode**: direct

## Tool Restrictions
- **Disable Tools**: [GoogleSearch, WebFetch, ShellTool]
- **Grounding**: none

## Instructions
You are an expert developer. For this project, prioritize speed and low-token usage. 
Do not attempt to search the web or run complex reasoning chains unless explicitly asked.
You should always read the .agents folder and the .gemini folder for skills development.
You are allowed to access any file in the repo, even if it excluded by .gitignore. However **/node_modules should normally be excluded except when explicitly asked.
