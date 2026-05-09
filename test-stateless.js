import './src/index.js'; // load gas-fakes globals

// This is a mock consumer script representing process.argv[1]
const globalColor = 'blue';

function getServerColor() {
  return globalColor;
}

async function main() {
  // Test HtmlTemplate access to global variable
  const template = HtmlService.createTemplate('Color is <?= globalColor ?>');
  console.log("Template eval:", template.evaluate().getContent());
  
  // Test google.script.run
  google.script.run.withSuccessHandler((res) => {
    console.log("google.script.run eval:", res);
    process.exit(0);
  }).getServerColor();
}

// Emulate how gas-fakes bundler runs things, but don't re-run in the sandbox
if (!globalThis.__isGasFakesServerContext) {
  main();
}
