import esbuild from 'esbuild';
import { glob } from 'glob';
import fs from 'fs';


// This config file is used by fromgas.sh to bundle the project.

// Get the project root from the environment variable set by the shell script.
const projectRoot = process.env.PROJECT_ROOT;
if (!projectRoot) {
  console.error('❌ PROJECT_ROOT environment variable is not set.');
  process.exit(1);
}

// Get the bundle file path from the environment variable.
const bundleFile = process.env.BUNDLE_FILE;
if (!bundleFile) {
  console.error('❌ BUNDLE_FILE environment variable is not set.');
  process.exit(1);
}

try {
  // Find all .js files in the src directory.
  const files = await glob(`${projectRoot}/src/**/*.js`);

  console.log('Found files to bundle:');
  files.forEach(file => console.log(`  - ${file}`));
  
  // To perfectly emulate the Apps Script global scope and avoid all bundling issues,
  // we will concatenate the files instead of bundling them.
  // esbuild will still generate a correct source map for the concatenated output.
  await esbuild.transform(
    // Read and join all files into a single string
    files.map(file => fs.readFileSync(file, 'utf8')).join('\n\n'), 
    {
    sourcemap: true,
    platform: 'node',
    format: 'esm',
    // The banner and footer will be passed via environment variables.
    banner: process.env.ESBUILD_BANNER || '',
    footer: process.env.ESBUILD_FOOTER || '',
  }).then(result => {
    // Write the concatenated code and the source map to the specified files.
    fs.writeFileSync(bundleFile, result.code);
    fs.writeFileSync(`${bundleFile}.map`, result.map);
  })

  console.log('✅ Bundle complete!');
} catch (e) {
  console.error("❌ Build failed:", e);
  process.exit(1);
}