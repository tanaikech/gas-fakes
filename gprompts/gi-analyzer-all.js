import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sheetRangeMakerPath = path.resolve(__dirname, '../src/services/spreadsheetapp/sheetrangemakers.js');
const { setterList, attrGetList, valuesGetList } = await import(sheetRangeMakerPath);

const utilsPath = path.resolve(__dirname, '../src/support/utils.js');
const { Utils } = await import(utilsPath);

const docEnumsPath = path.resolve(__dirname, '../src/services/enums/docsenums.js');
const { Attribute } = await import(docEnumsPath);

const dynamicSheetRangeMethods = new Set();
const dynamicDocMethods = new Set();

const docServiceClasses = new Set(['Body', 'Paragraph', 'ListItem', 'Table', 'TableRow', 'TableCell', 'Text', 'InlineImage', 'PageBreak', 'HorizontalRule', 'Footnote', 'HeaderSection', 'FooterSection', 'FootnoteSection', 'ContainerElement', 'SectionElement', 'RichLink']);

const giPath = path.resolve(__dirname, 'gi.json');
const projectPath = path.resolve(__dirname, '..');
const outputPath = path.resolve(__dirname, 'gi-fake-all.json');

const getMethodName = (methodString) => {
  const match = methodString.match(/(\w+)/);
  return match ? match[1] : null;
};

const getFilePaths = (dirPath, fileList = []) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (path.basename(filePath) !== 'node_modules') {
        getFilePaths(filePath, fileList);
      }
    } else if (filePath.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const giData = JSON.parse(fs.readFileSync(giPath, 'utf8'));
const allJsFiles = getFilePaths(projectPath);
const fileCache = new Map();
allJsFiles.forEach(file => fileCache.set(file, fs.readFileSync(file, 'utf8')));

const serviceToDirectoryMap = {
    'Drive': 'driveapp',
    'Document': 'documentapp',
    'Spreadsheet': 'spreadsheetapp',
    'Slides': 'slidesapp',
    'Forms': 'formapp',
    'Calendar': 'calendarapp',
    'Gmail': 'gmailapp',
    'Mail': 'mailapp',
    'Base': 'base',
    'Cache': 'cache',
    'Charts': 'charts',
    'Content': 'content',
    'HTML': 'html',
    'Lock': 'lock',
    'Properties': 'properties',
    'Script': 'script',
    'Utilities': 'utilities',
    'URL Fetch': 'urlfetchapp',
    'Jdbc': 'jdbc',
    'XML': 'xml',
};

const classSynonyms = {
    'Body': ['containerelement', 'element'],
    'Paragraph': ['containerelement', 'element'],
    'ListItem': ['containerelement', 'element'],
    'Table': ['containerelement', 'element'],
    'TableRow': ['containerelement', 'element'],
    'TableCell': ['containerelement', 'element'],
    'Text': ['element'],
    'InlineImage': ['element'],
    'File': ['fakebasefile', 'fakebaseitem'],
    'Folder': ['fakebasefile', 'fakebaseitem'],
    'User': ['fakeuser'],
    'PageBreak': ['element'],
    'HorizontalRule': ['element'],
    'Footnote': ['containerelement', 'element'],
    'HeaderSection': ['containerelement', 'element'],
    'FooterSection': ['containerelement', 'element'],
    'FootnoteSection': ['containerelement', 'element'],
    'ContainerElement': ['element'],
    'SectionElement': ['element'],
};

const classToFileMap = {
    // Base service classes implemented elsewhere
    'Blob': 'utilities/fakeblob.js',
    'User': 'common/fakeuser.js',
    'Session': 'session/fakesession.js',
    'Logger': 'logger/fakelogger.js',
    // Properties/Cache services implemented in stores
    'Properties': 'stores/fakestores.js',
    'Cache': 'stores/fakestores.js',
    'PropertiesService': 'stores/fakestores.js',
    'CacheService': 'stores/fakestores.js',
    // Drive service classes
    'ScriptApp': 'scriptapp/app.js',
    'DriveApp': 'driveapp/fakedriveapp.js',
    'File': 'driveapp/fakedrivefile.js',
    'Folder': 'driveapp/fakedrivefolder.js',
};

// Populate the dynamic methods set for easier lookup
setterList.forEach(item => {
  dynamicSheetRangeMethods.add(`set${Utils.capital(item.single || item.name)}`);
  if (item.plural !== false) {
    dynamicSheetRangeMethods.add(item.plural || `set${Utils.capital(item.single || item.name)}s`);
  }
});
attrGetList.forEach(item => {
  dynamicSheetRangeMethods.add(item.name);
  dynamicSheetRangeMethods.add(item.plural || `${item.name}s`);
});
valuesGetList.forEach(item => {
  dynamicSheetRangeMethods.add(item.name);
  dynamicSheetRangeMethods.add(item.plural || `${item.name}s`);
});

// Populate the dynamic methods set for Document service
const snakeToCamel = str => str.toLowerCase().replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));

Object.keys(Attribute).forEach(key => {
  const propName = snakeToCamel(key);
  const capitalizedProp = Utils.capital(propName);
  dynamicDocMethods.add(`get${capitalizedProp}`);
  dynamicDocMethods.add(`set${capitalizedProp}`);
});
for (const service of giData) {
    const serviceName = service.serviceName;
    const serviceDirectory = serviceToDirectoryMap[serviceName] || serviceName.toLowerCase();

    for (const classData of service.classes) {
        const className = classData.className;
        const fileContents = [];
        const mappedFile = classToFileMap[className];
        if (mappedFile) {
            const filePath = allJsFiles.find(p => p.endsWith(mappedFile));
            if (filePath && fileCache.has(filePath)) {
                fileContents.push({ filePath, content: fileCache.get(filePath) });
            }
        } else {
            const possibleFileNames = [
                `fake${className.toLowerCase()}.js`,
                `fake${serviceName.toLowerCase()}${className.toLowerCase()}.js`,
                `${className.toLowerCase()}.js`,
                'app.js',
            ];

            if (classData.type === 'Enum') {
                possibleFileNames.push(`${serviceDirectory}enums.js`);
                possibleFileNames.push(`enums.js`);
            }
            
            const synonyms = classSynonyms[className] || [];
            synonyms.forEach(s => {
                possibleFileNames.push(`fake${s}.js`);
            });


            for (const fileName of possibleFileNames) {
                const filePath = allJsFiles.find(p => p.endsWith(`${serviceDirectory}/${fileName}`));
                if (filePath && fileCache.has(filePath)) {
                    fileContents.push({ filePath, content: fileCache.get(filePath) });
                }
            }
            
            // also check in enums folder directly for enums
            if (classData.type === 'Enum' && serviceName === 'Document') {
                 const filePath = allJsFiles.find(p => p.endsWith(`enums/docsenums.js`));
                 if (filePath && fileCache.has(filePath) && !fileContents.some(f => f.filePath === filePath)) {
                     fileContents.push({ filePath, content: fileCache.get(filePath) });
                 }
            }
        }


        for (const method of classData.methods) {
            const methodName = getMethodName(method.method);
            let status = 'not started';
            let implementationLink = null;

            if (methodName) {
                for (const file of fileContents) {
                    let isImplemented;
                    if (classData.type === 'Enum') {
                        // Enums can be keys in an object literal or quoted strings in an array
                        const enumRegex = new RegExp(`["']?${methodName}["']?[:\s,]`);
                        isImplemented = enumRegex.test(file.content);
                    } else {
                        isImplemented = file.content.includes(methodName);
                    }

                    // Special check for dynamically generated Spreadsheet Range methods
                    if (!isImplemented && serviceName === 'Spreadsheet' && className === 'Range') {
                        if (dynamicSheetRangeMethods.has(methodName)) {
                            isImplemented = true;
                        }
                    }

                    // Special check for dynamically generated Document methods
                    if (!isImplemented && serviceName === 'Document' && docServiceClasses.has(className)) {
                        if (dynamicDocMethods.has(methodName)) {
                            isImplemented = true;
                        }
                    }

                    if (isImplemented) {
                        let inProgress = false;
                        try {
                            const ast = acorn.parse(file.content, { ecmaVersion: 2022, sourceType: 'module' });
                            walk.simple(ast, {
                                MethodDefinition(node) {
                                    if (node.key.name === methodName) {
                                        // Once we find the method, walk its body to check for notYetImplemented
                                        walk.simple(node.value.body, {
                                            CallExpression(callNode) {
                                                if (callNode.callee.name === 'notYetImplemented') {
                                                    inProgress = true;
                                                    // We can stop walking this method body now
                                                    throw 'found'; 
                                                }
                                            }
                                        });
                                        // Stop walking the whole file if we've analyzed the method
                                        throw 'found';
                                    }
                                }
                            });
                        } catch (e) {
                            if (e !== 'found') {
                              console.error(`Failed to parse ${file.filePath} with acorn. Error: ${e.message}`);
                            }
                        }

                        if (inProgress) {
                            status = 'in progress';
                        } else {
                            status = 'completed';
                        }

                        const relativePath = path.relative(projectPath, file.filePath);
                        const lines = file.content.split('\n');
                        const lineNumber = lines.findIndex(line => line.includes(methodName)) + 1;
                        implementationLink = `${relativePath}#L${lineNumber}`;
                        if (status === 'completed') break; // Stop searching if a completed version is found
                    }
                }
            }
            method['gas-fakes status'] = status;
            method['implementationLink'] = implementationLink;
        }
    }
}

fs.writeFileSync(outputPath, JSON.stringify(giData, null, 2));
console.log('gi-fake-all.json has been created for all services.');
