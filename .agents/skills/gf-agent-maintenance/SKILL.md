# Skill: gf-agent-maintenance

## Overview
This skill is used to maintain and update the `gf_agent` (Google Apps Script Local Automation Agent). It ensures the agent's internal skills, index, and documentation stay synchronized with the latest implementations in `gas-fakes`.

## Responsibilities
1. **Synchronize Skills**: Run `node gf_agent/scripts/builder.js` whenever `progress/` files are updated to refresh the agent's knowledge base.
2. **Update Documentation**: Analyze new test files in `test/` to extract usage patterns and add them to `gf_agent/documentation.md`.
3. **Verify Agent**: Ensure `gf_agent/SKILL.md` and `gf_agent/README.md` accurately reflect the current capabilities of the project.
4. **Package for Distribution**: Ensure the `gf_agent/` directory is self-contained and ready for download by users.

## Workflow
1. **Detect Changes**: Monitor `progress/` and `test/` for updates.
2. **Run Builder**: Execute the build script to regenerate markdown files.
3. **Refine Patterns**: If a new service or complex pattern is added to `test/`, document it in `gf_agent/documentation.md`.
4. **Test the Agent**: Simulate a user request and verify that the agent can generate valid code using the updated knowledge.
