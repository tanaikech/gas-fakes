import vm from 'vm';

const code = `
import path from 'path';
globalThis.res = path.join('a', 'b');
`;

const context = vm.createContext({ globalThis, console });

const run = async () => {
  const module = new vm.SourceTextModule(code, { context });
  await module.link(async (specifier) => {
    const imported = await import(specifier);
    const exportNames = Object.keys(imported);
    
    // Check if there is a default export
    if ('default' in imported && !exportNames.includes('default')) {
       exportNames.push('default');
    }

    const syntheticModule = new vm.SyntheticModule(exportNames, function() {
      exportNames.forEach(name => this.setExport(name, imported[name]));
    }, { context });
    
    await syntheticModule.link(() => {});
    await syntheticModule.evaluate();
    return syntheticModule;
  });
  await module.evaluate();
  console.log("Result:", context.res);
};

run().catch(console.error);