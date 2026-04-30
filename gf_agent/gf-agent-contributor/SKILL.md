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

When you need to teach `gf_agent` something new, you must first ensure you are working from a local Git clone, NOT the cached Gemini skills folder.

1. **Clone the Repository (Required)**:
   If you installed this skill via `gemini skills install`, you cannot contribute directly from that cached folder. You MUST clone the core repository to your local machine, link it to Gemini, and work from there:
   ```bash
   git clone https://github.com/brucemcpherson/gas-fakes.git
   cd gas-fakes
   gemini skills link ./gf_agent
   ```

2. **Create a Modular File**: 
   Navigate to the `gf_agent/knowledge/` directory inside your new clone. Create a new markdown file for your topic. 
   - Use a numeric prefix to ensure it sorts correctly during compilation if order matters (e.g., `06-new-feature.md`). If it is a standalone topic, any descriptive name is fine.
   
3. **Draft the Knowledge**:
   Write your instructions clearly. Use Markdown headers (`###`). Keep it concise and actionable for an AI agent. 
   *Good Example:* "When creating a Foo, you MUST always set the Bar property, otherwise the API will crash with error X."

4. **Submit Your Knowledge**:
   You do **not** need to compile the monolithic `SKILL.md` file yourself. 
   Simply stage your new `gf_agent/knowledge/XX-my-topic.md` file, commit it, and push it to your fork.
   
5. **The Merge Process**:
   Submit a Pull Request with your new file. Because you only added a distinct file to a directory, your pull request will not cause merge conflicts. 
   Once your PR is merged, the repository maintainers will run the root-level documentation pipeline (`npm run docs`) which will automatically compile your new knowledge into the master `gf_agent/SKILL.md` for all users!
