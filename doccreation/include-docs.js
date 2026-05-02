import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'glob';

const repoRoot = path.resolve(process.cwd());
const includeFilePath = path.join(repoRoot, '_includes', 'further.md');
const furtherReadingMarkerRegex = /## .* alt="gas-fakes logo" .* Further Reading/;

function adjustRelativeLinks(content, depth) {
  if (depth === 0) return content;
  
  const relativePrefix = '../'.repeat(depth);
  
  // Replace standard markdown links [text](link)
  // We only want to adjust links that don't start with http, https, or /
  return content.replace(/\]\((?!http|#|\/)(.*?)\)/g, (match, linkUrl) => {
    // If the link already starts with ../ or ./, we might need to resolve it 
    // relative to the root first. Assuming _includes/further.md links are
    // authored relative to the repo root.
    
    let normalizedLink = linkUrl;
    if (normalizedLink.startsWith('./')) {
      normalizedLink = normalizedLink.substring(2);
    }
    
    // Prevent double-prefixing if the author already put '../' in the root further.md
    // (though ideally, further.md should be authored exactly as if it were in the root)
    if (normalizedLink.startsWith('../')) {
       // It's tricky to know what the author intended. We'll assume the link in further.md
       // is authored from the perspective of the repo root. If it's `../gf_agent`, it means
       // it's going UP from the repo root.
       // We just prepend our depth prefix.
       return `](${relativePrefix}${normalizedLink})`;
    }
    
    return `](${relativePrefix}${normalizedLink})`;
  });
}

async function processMarkdownFiles() {
  try {
    const includeContentBase = await fs.readFile(includeFilePath, 'utf8');

    // Find all .md files in the root, excluding those in node_modules and _includes
    const files = globSync('**/*.md', {
      cwd: repoRoot,
      ignore: ['**/node_modules/**', '_includes/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} markdown files to check.`);

    for (const file of files) {
      if (path.resolve(file) === path.resolve(includeFilePath)) {
        continue;
      }

      let content = await fs.readFile(file, 'utf8');
      const markerMatch = content.match(furtherReadingMarkerRegex);

      if (!markerMatch) {
        // Only log for debug to keep output clean, but it's fine to skip
        continue;
      }

      const markerIndex = markerMatch.index;

      // Calculate depth to determine relative paths
      const relativePath = path.relative(repoRoot, file);
      const depth = relativePath.split(path.sep).length - 1;
      const logoPath = depth === 0 ? './logo.png' : '../'.repeat(depth) + 'logo.png';

      // Update include content with correct logo path
      let adjustedIncludeContent = includeContentBase.replace(
        /src="(\.\/|\.\.\/)logo\.png"/,
        `src="${logoPath}"`
      );

      // Adjust relative markdown links based on the depth of the target file
      adjustedIncludeContent = adjustRelativeLinks(adjustedIncludeContent, depth);

      // 1. Remove all content from the marker onwards (the old appended block)
      content = content.substring(0, markerIndex);

      // 2. Normalize the remaining content by trimming all trailing whitespace (including newlines).
      content = content.trimEnd();

      // 3. Append the new content with explicit newlines for separation.
      const newContent = content + '\n\n' + adjustedIncludeContent;

      await fs.writeFile(file, newContent, 'utf8');
      console.log(`Updated ${path.basename(file)} (depth: ${depth})`);
    }

    console.log('All markdown files that contained the marker have been updated.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processMarkdownFiles();