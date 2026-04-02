---
name: gas-fakes-dev
description: Develop and implement the 'gas-fakes' project, emulating Google Apps Script (GAS) functionality using Node.js.
tags:[nodejs, google-apps-script, google-cloud-api, testing, mock]
version: "1.0.0"
---

## Summary
This skill enables the agent to assist in the development of the `gas-fakes` project. The primary objective is to emulate Google Apps Script (GAS) behavior using Node.js and Google APIs, allowing Apps Script code to run in a local Node.js environment.

## Usage
- When you need to implement fake/mock functionality for GAS classes or methods.
- When creating test scripts to verify the implemented functionalities.
- When assisting a human developer with Node.js and Google APIs integration.

## Workflow

### 1. Context and Specification Check
Before implementing, verify the specifications of the target Google Apps Script classes and methods. Ensure that the functionality you are about to build aligns with real GAS behavior.

### 2. Implementation
Generate Node.js code that maps GAS methods to the corresponding Google Cloud APIs.
- Refer to the existing codebase in the `src/` directory to understand the current architecture.
- Ensure the code runs correctly in the Node.js environment.

### 3. Testing
You must verify your implementation by writing and executing test scripts.
- Place your test scripts in the `test/` directory.
- Execute the tests to ensure there are no errors and the behavior matches expectations.

### 4. Holistic/Targeted Skill Evolution (Self-Updating SKILL)
**[CRITICAL INSTRUCTION]**
The `gas-fakes` project is complex, and bridging Node.js with GAS involves many hidden constraints, specific architectural patterns, and potential errors. You are required to continuously learn and autonomously evolve this SKILL.

- **Trigger:** Whenever you encounter an error during implementation or testing, or when you receive correction feedback/prompts from the human developer.
- **Action:** You MUST extract the lessons learned from the failure and recovery process. Identify the underlying rules, technical constraints, or coding patterns that caused the issue.
- **Update:** Immediately update this `SKILL.md` file (by adding, deleting, or modifying content) to document the newly acquired knowledge. If necessary, also create or update sample scripts, helper templates, or explanatory Markdown files in the project.
- **Goal:** Transform your localized, temporary learnings into permanent, universally readable knowledge to prevent repeating the same mistakes and to handle the complexities of the project autonomously.

## Delivery
- Output the complete code for modified or newly created service classes and test scripts.
- **ALWAYS output the updated `SKILL.md`** when new knowledge is extracted and crystallized.