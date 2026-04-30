---
name: gf-agent-contributor
description: Guide for creating or contributing modular knowledge to the gf_agent skill. Use this when a user wants to teach gf_agent a new trick or document an Apps Script parity oddity.
---
# Skill: gf-agent-contributor

## Overview
This skill provides instructions on how to correctly contribute knowledge, best practices, or API parity warnings to the `gf_agent` so that it learns how to write better Google Apps Script automation code.

## The Architecture
To prevent Git merge conflicts between multiple developers, the monolithic `gf_agent/SKILL.md` file is **auto-generated**. You MUST NOT edit `gf_agent/SKILL.md` directly. 

Instead, `gf_agent` uses a modular knowledge base. The `builder.js` script aggregates all markdown files in the `gf_agent/knowledge/` directory and appends them to a base template (`gf_agent/scripts/SKILL.template.md`).

## How to Contribute Knowledge

When you need to teach `gf_agent` something new, follow this exact workflow:

1. **Create a Modular File**: 
   Navigate to the `gf_agent/knowledge/` directory. Create a new markdown file for your topic. 
   - Use a numeric prefix to ensure it sorts correctly during compilation if order matters (e.g., `06-new-feature.md`). If it is a standalone topic, any descriptive name is fine.
   
2. **Draft the Knowledge**:
   Write your instructions clearly. Use Markdown headers (`###`). Keep it concise and actionable for an AI agent. 
   *Good Example:* "When creating a Foo, you MUST always set the Bar property, otherwise the API will crash with error X."

3. **Compile the Skill**:
   Once your file is saved, you MUST rebuild the monolithic skill file so the changes take effect. Run the overarching documentation command from the root of the repository:
   ```bash
   npm run docs
   ```
   *(This command triggers the entire documentation pipeline, ensuring the `gf_agent/SKILL.md` is fully updated with your new file.)*

4. **Verify**:
   Check `gf_agent/SKILL.md` to ensure your new knowledge block was successfully appended to the end of the file.

5. **Commit**:
   Stage your new file in `gf_agent/knowledge/` AND the auto-updated `gf_agent/SKILL.md` file, then commit. Because you only added a distinct file to a directory, your pull request will merge cleanly!
