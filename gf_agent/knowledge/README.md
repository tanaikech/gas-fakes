# gf_agent Knowledge Base

This directory contains modular markdown files representing the "Lessons Learned & Best Practices" for the `gf_agent` skill.

## Contributing

To prevent Git merge conflicts on the monolithic `gf_agent/SKILL.md` file, collaborators should **never edit `gf_agent/SKILL.md` directly**. 

Instead, to add new knowledge or instructions to the agent:
1. Create a new markdown file in this directory (e.g., `06-new-feature.md`).
2. Prefix it with a number to control the insertion order.
3. Write your instructions, tips, or parity warnings.
4. Run `npm run docs` from the repository root.

The `builder.js` script will automatically read all files in this directory, sort them, and inject them into `gf_agent/scripts/SKILL.template.md` to cleanly generate the final `gf_agent/SKILL.md` artifact.
