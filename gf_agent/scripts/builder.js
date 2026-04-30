import fs from 'fs/promises';
import path from 'path';

const PROGRESS_DIR = './progress';
const SKILLS_DIR = './gf_agent/skills';
const INDEX_FILE = './gf_agent/index.md';

async function build() {
  await fs.mkdir(SKILLS_DIR, { recursive: true });

  const files = await fs.readdir(PROGRESS_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.MD'));

  let masterIndex = '# gf_agent Skills Index\n\nThis index lists all Google Apps Script services and classes supported by `gf_agent` via `gas-fakes`.\n\n';

  for (const file of mdFiles) {
    const content = await fs.readFile(path.join(PROGRESS_DIR, file), 'utf-8');
    const serviceName = file.replace(/\.md$/i, '');
    
    // Extract classes
    const classMatches = content.matchAll(/## Class: \[(.*?)\]/g);
    const classes = [];
    
    for (const match of classMatches) {
      const className = match[1];
      // Find the table for this class
      const classSection = content.slice(match.index);
      const tableEnd = classSection.indexOf('## Class:') > 0 ? classSection.indexOf('## Class:', 10) : classSection.length;
      const tableContent = classSection.slice(0, tableEnd);
      
      // Extract completed methods
      const methodMatches = tableContent.matchAll(/\| \[(.*?)\]\(.*?\) \| .*? \| .*? \| .*? \| (completed) \|/g);
      const methods = Array.from(methodMatches).map(m => m[1]);
      
      if (methods.length > 0) {
        classes.push({ name: className, methods });
      }
    }

    if (classes.length > 0) {
      const skillFile = `${serviceName.toLowerCase()}.md`;
      let skillContent = `# Service: ${serviceName}\n\n`;
      
      classes.forEach(c => {
        skillContent += `## Class: ${c.name}\n\n`;
        skillContent += `Supported Methods:\n`;
        c.methods.forEach(m => {
          skillContent += `- \`${m}\`\n`;
        });
        skillContent += '\n';
      });

      await fs.writeFile(path.join(SKILLS_DIR, skillFile), skillContent);
      masterIndex += `- [${serviceName}](skills/${skillFile})\n`;
    }
  }

  await fs.writeFile(INDEX_FILE, masterIndex);
  
  // Aggregate knowledge files into SKILL.md
  const TEMPLATE_FILE = './gf_agent/scripts/SKILL.template.md';
  const KNOWLEDGE_DIR = './gf_agent/knowledge';
  const SKILL_OUTPUT = './gf_agent/SKILL.md';
  
  let skillMarkdown = await fs.readFile(TEMPLATE_FILE, 'utf-8');
  
  try {
    const knowledgeFiles = await fs.readdir(KNOWLEDGE_DIR);
    // Sort files to ensure deterministic aggregation (e.g., 01-drive.md, 02-syntax.md)
    knowledgeFiles.sort();
    
    for (const kFile of knowledgeFiles) {
      if (kFile.endsWith('.md')) {
        const kContent = await fs.readFile(path.join(KNOWLEDGE_DIR, kFile), 'utf-8');
        skillMarkdown += `\n${kContent}\n`;
      }
    }
  } catch (err) {
    console.log("No knowledge directory found or error reading it:", err.message);
  }

  await fs.writeFile(SKILL_OUTPUT, skillMarkdown);

  console.log('Build complete! Skills, Index, and monolithic SKILL.md generated.');
}

build().catch(console.error);
