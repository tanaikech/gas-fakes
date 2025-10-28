import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'glob';

const repoRoot = path.resolve(process.cwd());
const includeFilePath = path.join(repoRoot, '_includes', 'further.md');
const furtherReadingMarker =
  '## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Further Reading';

async function processMarkdownFiles() {
  try {
    const includeContent = await fs.readFile(includeFilePath, 'utf8');

    // Find all .md files in the root, excluding those in node_modules and _includes
    const files = globSync('*.md', {
      cwd: repoRoot,
      ignore: ['node_modules/**', '_includes/**'],
      absolute: true,
    });

    for (const file of files) {
      if (path.resolve(file) === path.resolve(includeFilePath)) {
        continue;
      }

      let content = await fs.readFile(file, 'utf8');
      const markerIndex = content.lastIndexOf(furtherReadingMarker);

      if (markerIndex !== -1) {
        // Remove the old hard-coded section
        content = content.substring(0, markerIndex);
      }

      // Append the new content, ensuring there's a newline
      if (content.trim().length > 0 && !content.endsWith('\n\n')) {
        content = content.trimEnd() + '\n\n';
      }
      
      const newContent = content + includeContent;

      await fs.writeFile(file, newContent, 'utf8');
      console.log(`Updated ${path.basename(file)}`);
    }

    console.log('All markdown files have been updated.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processMarkdownFiles();