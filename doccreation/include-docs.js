import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..');
const includeFilePath = path.join(repoRoot, '_includes', 'further.md');
const progressFilePath = path.join(repoRoot, 'progress.md');
const furtherReadingMarkerRegex = /## .* alt="gas-fakes logo" .* Further Reading/;

function adjustRelativeLinks(content, depth) {
  if (depth === 0) return content;
  
  const relativePrefix = '../'.repeat(depth);
  
  // Replace standard markdown links [text](link)
  // We only want to adjust links that don't start with http, https, or /
  return content.replace(/\]\((?!http|#|\/)(.*?)\)/g, (match, linkUrl) => {
    // If the link already starts with ./, we strip it out so the relativePrefix applies correctly
    let normalizedLink = linkUrl;
    if (normalizedLink.startsWith('./')) {
      normalizedLink = normalizedLink.substring(2);
    }
    
    // Prevent double-prefixing if the author already put '../'
    if (normalizedLink.startsWith('../')) {
       return `](${relativePrefix}${normalizedLink})`;
    }
    
    return `](${relativePrefix}${normalizedLink})`;
  });
}

async function processMarkdownFiles() {
  try {
    const includeContentBase = await fs.readFile(includeFilePath, 'utf8');
    const progressContentBase = await fs.readFile(progressFilePath, 'utf8');

    // Find all .md files in the root, excluding those in node_modules and _includes
    const files = globSync('**/*.md', {
      cwd: repoRoot,
      ignore: ['**/node_modules/**', '_includes/**', 'progress.md'],
      absolute: true,
    });

    console.log(`Found ${files.length} markdown files to check.`);

    for (const file of files) {
      if (path.resolve(file) === path.resolve(includeFilePath)) {
        continue;
      }

      let content = await fs.readFile(file, 'utf8');
      
      // We look for either the new combined injection starting point (progress.md title)
      // or the legacy marker (further reading)
      const progressMarkerRegex = /# Gas-Fakes Progress Summary/;
      let markerMatch = content.match(progressMarkerRegex);
      
      if (!markerMatch) {
        markerMatch = content.match(furtherReadingMarkerRegex);
      }

      if (!markerMatch) {
        continue;
      }

      const markerIndex = markerMatch.index;

      // Calculate depth to determine relative paths
      const relativePath = path.relative(repoRoot, file);
      const depth = relativePath.split(path.sep).length - 1;
      const logoPath = depth === 0 ? './pngs/logo.png' : '../'.repeat(depth) + 'pngs/logo.png';

      // Update include content with correct logo path
      let adjustedIncludeContent = includeContentBase.replace(
        /src="(\.\/|\.\.\/)*pngs\/logo\.png"/,
        `src="${logoPath}"`
      );

      // Adjust relative markdown links based on the depth of the target file
      adjustedIncludeContent = adjustRelativeLinks(adjustedIncludeContent, depth);
      let adjustedProgressContent = adjustRelativeLinks(progressContentBase, depth);

      // 1. Remove all content from the marker onwards (the old appended block)
      content = content.substring(0, markerIndex);

      // 2. Normalize the remaining content by trimming all trailing whitespace (including newlines).
      content = content.trimEnd();

      // 3. Append the progress content, then the further reading content
      const newContent = content + '\n\n' + adjustedProgressContent + '\n\n' + adjustedIncludeContent;

      await fs.writeFile(file, newContent, 'utf8');
      console.log(`Updated ${path.basename(file)} (depth: ${depth})`);
    }

    console.log('All markdown files that contained the marker have been updated.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processMarkdownFiles();