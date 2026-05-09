import './src/index.js'; // load gas-fakes globals
import path from 'path';

// This is a mock consumer script representing process.argv[1]
const myPath = path.join('a', 'b');

function getPath() {
  return myPath;
}

async function main() {
  google.script.run.withSuccessHandler((res) => {
    console.log("google.script.run eval:", res);
    process.exit(0);
  }).getPath();
}

if (!globalThis.__isGasFakesServerContext) {
  main();
}
