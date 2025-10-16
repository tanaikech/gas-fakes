import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sheetRangeMakerPath = path.resolve(__dirname, '../src/services/spreadsheetapp/sheetrangemakers.js');
const { setterList, attrGetList, valuesGetList } = await import(sheetRangeMakerPath);

const utilsPath = path.resolve(__dirname, '../src/support/utils.js');
const { Utils } = await import(utilsPath);

const dynamicSheetRangeMethods = new Set();

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
    'Blob': 'utilities/fakeblob.js',
    'User': 'common/fakeuser.js',
    'Session': 'session/fakesession.js',
    'Logger': 'logger/fakelogger.js',
    'Properties': 'stores/fakestores.js',
    'Cache': 'stores/fakestores.js',
    'PropertiesService': 'stores/fakestores.js',
    'CacheService': 'stores/fakestores.js',
    'ScriptApp': 'scriptapp/app.js'
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
            if (classData.type === 'Enum') {
                 const filePath = allJsFiles.find(p => p.endsWith(`enums/${serviceDirectory}enums.js`));
                 if (filePath && fileCache.has(filePath)) {
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
                    let isImplemented = classData.type === 'Enum' ? file.content.includes(`"${methodName}"`) : file.content.includes(methodName);

                    // Special check for dynamically generated Spreadsheet Range methods
                    if (!isImplemented && serviceName === 'Spreadsheet' && className === 'Range') {
                        if (dynamicSheetRangeMethods.has(methodName)) {
                            isImplemented = true;
                        }
                    }

                    if (isImplemented) {
                        const notImplementedRegex = new RegExp(String.raw`${methodName}[\s\S]*?(notyetimplemented|not yet implemented)`, 'mi');
                        if (notImplementedRegex.test(file.content)) {
                            status = 'in progress';
                        } else {
                            status = 'completed';
                        }

                        const relativePath = path.relative(projectPath, file.filePath);
                        const lines = file.content.split('\n');
                        const lineNumber = lines.findIndex(line => line.includes(methodName)) + 1;
                        implementationLink = `${relativePath}#L${lineNumber}`;
                        break;
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