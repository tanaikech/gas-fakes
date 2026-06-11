import fs from 'fs';
import path from 'path';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sheetRangeMakerPath = path.resolve(__dirname, '../src/services/spreadsheetapp/sheetrangemakers.js');
const { setterList, attrGetList, valuesGetList } = await import(sheetRangeMakerPath);

const dataValidationMappingPath = path.resolve(__dirname, '../src/services/spreadsheetapp/datavalidationcriteriamapping.js');
const { dataValidationCriteriaMapping } = await import(dataValidationMappingPath);

const utilsPath = path.resolve(__dirname, '../src/support/utils.js');
const { Utils } = await import(utilsPath);

const docEnumsPath = path.resolve(__dirname, '../src/services/enums/docsenums.js');
const { Attribute } = await import(docEnumsPath);

const dynamicSheetRangeMethods = new Map(); // methodName -> { specFile, line }
const dynamicDocMethods = new Map(); // methodName -> { specFile, line }
const dynamicDataValidationMethods = new Map(); // methodName -> { specFile, line }

const docServiceClasses = new Set(['Body', 'Paragraph', 'ListItem', 'Table', 'TableRow', 'TableCell', 'Text', 'InlineImage', 'PageBreak', 'HorizontalRule', 'Footnote', 'HeaderSection', 'FooterSection', 'FootnoteSection', 'ContainerElement', 'SectionElement', 'RichLink', 'Equation', 'EquationFunction', 'EquationFunctionArgumentSeparator', 'EquationSymbol']);

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
const allJsFiles = getFilePaths(path.join(projectPath, 'src'));
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
  'Script': 'scriptapp',
  'Utilities': 'utilities',
  'URL Fetch': 'urlfetchapp',
  'JDBC': 'jdbc',
  'XML': 'xmlservice',
};

const classSynonyms = {
  'Body': ['containerelement', 'element'],
  'File': ['drivemeta'],
  'Folder': ['drivemeta'],
  'FileIterator': ['iterator'],
  'FolderIterator': ['iterator'],
  'Paragraph': ['containerelement', 'element'],
  'ListItem': ['containerelement', 'element', 'paragraph'],
  'TableRow': ['containerelement', 'element'],
  'TableCell': ['containerelement', 'element'],
  'HeaderSection': ['sectionelement', 'containerelement', 'element'],
  'FooterSection': ['sectionelement', 'containerelement', 'element'],
  'FootnoteSection': ['containerelement', 'element'],
  'Text': ['element'],
  'InlineImage': ['element'],
  'Date': ['element'],
  'Person': ['element'],
  'RichLink': ['element'],
  'Equation': ['containerelement', 'element'],
  'EquationFunction': ['containerelement', 'element'],
  'EquationFunctionArgumentSeparator': ['element'],
  'EquationSymbol': ['element'],
  'CheckboxItem': ['formitem'],
  'DateItem': ['formitem'],
  'DateTimeItem': ['formitem'],
  'DurationItem': ['formitem'],
  'GridItem': ['formitem'],
  'ImageItem': ['formitem'],
  'MultipleChoiceItem': ['formitem'],
  'PageBreakItem': ['formitem'],
  'ParagraphTextItem': ['formitem'],
  'RatingItem': ['formitem'],
  'ScaleItem': ['formitem'],
  'SectionHeaderItem': ['formitem'],
  'TimeItem': ['formitem'],
  'VideoItem': ['formitem'],
  'CheckboxGridItem': ['formitem'],
  'FormResponse': ['itemresponse'],
  'PageBreak': ['element'],
  'HorizontalRule': ['element'],
  'Footnote': ['containerelement', 'element'],
  'HeaderSection': ['containerelement', 'element'],
  'FooterSection': ['containerelement', 'element'],
  'FootnoteSection': ['containerelement', 'element'],
  'ContainerElement': ['element'],
  'SectionElement': ['element'],
  'Range': ['sheetrange', 'range'],
  'DeveloperMetadata': ['developermetadata'],
  'DeveloperMetadataFinder': ['developermetadatafinder'],
  'DeveloperMetadataLocation': ['developermetadatalocation'],
  'RichTextValue': ['richtextvalue'],
  'TextStyle': ['textstyle'],
  'ConditionalFormatRule': ['conditionalformatrule'],
  'Banding': ['banding'],
  'Borders': ['borders'],
  'Color': ['colorbuilder', 'colorbase'],
  'ColorBuilder': ['colorbuilder', 'colorbase'],
  'RgbColor': ['rgbcolor', 'colorbase'],
  'ThemeColor': ['themecolor', 'colorbase'],
  'DataValidation': ['datavalidationbuilder'],
  'EmbeddedAreaChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedBarChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedColumnChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedComboChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedHistogramChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedLineChartBuilder': ['embeddedchartbuilder'],
  'EmbeddedPieChartBuilder': ['embeddedchartbuilder'],
  'Group': ['pageelement'],
  'Shape': ['pageelement'],
  'Line': ['pageelement'],
  'Image': ['pageelement'],
  'Table': ['containerelement', 'element', 'pageelement'],
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
  'ScriptApp': 'scriptapp/app.js',
  'DriveApp': 'driveapp/fakedriveapp.js',
  'Base.MimeType': 'mimetype/fakemimetype.js',
  'FileIterator': 'support/peeker.js',
  'FolderIterator': 'support/peeker.js'
};

// Populate the dynamic methods map with metadata for proper linking
const sheetRangeMakerContent = fs.readFileSync(sheetRangeMakerPath, 'utf8');
const sheetRangeMakerAst = acorn.parse(sheetRangeMakerContent, { ecmaVersion: 'latest', sourceType: 'module', locations: true });

walk.simple(sheetRangeMakerAst, {
  VariableDeclarator(node) {
    const specType = node.id.name;
    if (['setterList', 'attrGetList', 'valuesGetList'].includes(specType)) {
      const init = node.init;
      if (init && init.type === 'ArrayExpression') {
        init.elements.forEach((element) => {
          if (element && element.type === 'ObjectExpression') {
            const nameProp = element.properties.find(p => p.key.name === 'name' || p.key.value === 'name');
            const singleProp = element.properties.find(p => p.key.name === 'single' || p.key.value === 'single');
            const pluralProp = element.properties.find(p => p.key.name === 'plural' || p.key.value === 'plural');
            const skipPluralProp = element.properties.find(p => p.key.name === 'skipPlural' || p.key.value === 'skipPlural');
            
            const name = nameProp ? nameProp.value.value : null;
            const single = singleProp ? singleProp.value.value : null;
            const plural = pluralProp ? (pluralProp.value.value === false ? false : pluralProp.value.value) : null;
            const skipPlural = skipPluralProp ? skipPluralProp.value.value : false;

            const line = element.loc.start.line;

            if (specType === 'setterList') {
              const s = `set${Utils.capital(single || name)}`;
              dynamicSheetRangeMethods.set(s, { specFile: sheetRangeMakerPath, line });
              if (plural !== false) {
                const p = plural || `set${Utils.capital(single || name)}s`;
                dynamicSheetRangeMethods.set(p, { specFile: sheetRangeMakerPath, line });
              }
            } else if (name) {
              dynamicSheetRangeMethods.set(name, { specFile: sheetRangeMakerPath, line });
              if (!skipPlural) {
                const p = plural || `${name}s`;
                dynamicSheetRangeMethods.set(p, { specFile: sheetRangeMakerPath, line });
              }
            }
          }
        });
      }
    }
  }
});

// Populate the dynamic methods map for Document service
const snakeToCamel = str => str.toLowerCase().replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));

const docEnumsContent = fs.readFileSync(docEnumsPath, 'utf8');
const docEnumsAst = acorn.parse(docEnumsContent, { ecmaVersion: 'latest', sourceType: 'module', locations: true });

walk.simple(docEnumsAst, {
  VariableDeclarator(node) {
    if (node.id.name === 'Attribute') {
      const init = node.init;
      if (init && init.type === 'CallExpression') {
        const arg = init.arguments[0];
        if (arg && arg.type === 'ArrayExpression') {
          arg.elements.forEach((elem) => {
            if (elem && elem.type === 'Literal') {
              const key = elem.value;
              const propName = snakeToCamel(key);
              const capitalizedProp = Utils.capital(propName);
              const line = elem.loc.start.line;
              dynamicDocMethods.set(`get${capitalizedProp}`, { specFile: docEnumsPath, line });
              dynamicDocMethods.set(`set${capitalizedProp}`, { specFile: docEnumsPath, line });
            }
          });
        }
      }
    }
  }
});

const dataValidationMappingContent = fs.readFileSync(dataValidationMappingPath, 'utf8');
const dataValidationMappingAst = acorn.parse(dataValidationMappingContent, { ecmaVersion: 'latest', sourceType: 'module', locations: true });

walk.simple(dataValidationMappingAst, {
  VariableDeclarator(node) {
    if (node.id.name === 'dataValidationCriteriaMapping') {
      const init = node.init;
      if (init && init.type === 'ObjectExpression') {
        init.properties.forEach(prop => {
          const value = prop.value;
          if (value && value.type === 'ObjectExpression') {
            const methodProp = value.properties.find(p => p.key.name === 'method' || p.key.value === 'method');
            if (methodProp && methodProp.value.type === 'Literal') {
              dynamicDataValidationMethods.set(methodProp.value.value, { specFile: dataValidationMappingPath, line: prop.loc.start.line });
            }
          }
        });
      }
    }
  }
});

for (const service of giData) {
  const serviceName = service.serviceName;
  const serviceDirectory = serviceToDirectoryMap[serviceName] || serviceName.toLowerCase();

  for (const classData of service.classes) {
    const className = classData.className;
    const fileContents = [];
    const mappedFile = classToFileMap[`${serviceName}.${className}`] || classToFileMap[className];
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
        // Search in the service-specific directory first, then in the common directory
        let filePath = allJsFiles.find(p => p.endsWith(`${serviceDirectory}/${fileName}`));
        if (!filePath) {
          filePath = allJsFiles.find(p => p.endsWith(`common/${fileName}`));
        }

        if (filePath && fileCache.has(filePath) && !fileContents.some(f => f.filePath === filePath)) {
          fileContents.push({ filePath, content: fileCache.get(filePath) });
        }
      }

      // Check in the src/services/enums folder for all services
      if (classData.type === 'Enum') {
        let enumPrefix = serviceName.toLowerCase();
        if (serviceName === 'Document') enumPrefix = 'docs';
        if (serviceName === 'Spreadsheet') enumPrefix = 'sheets';
        if (serviceName === 'Forms') enumPrefix = 'forms';

        const enumFileName = `${enumPrefix}enums.js`;
        const filePath = allJsFiles.find(p => p.endsWith(`enums/${enumFileName}`));

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
        // Check for dynamically generated methods FIRST, before file search
        let handledAsDynamic = false;

        // Special check for dynamically generated Spreadsheet Range methods
        if (serviceName === 'Spreadsheet' && className === 'Range' && dynamicSheetRangeMethods.has(methodName)) {
          handledAsDynamic = true;
          const specInfo = dynamicSheetRangeMethods.get(methodName);
          const specFilePath = path.relative(projectPath, specInfo.specFile);
          status = 'completed';
          implementationLink = `${specFilePath}#L${specInfo.line}`;
        }

        // Special check for dynamically generated Document methods
        if (serviceName === 'Document' && docServiceClasses.has(className) && dynamicDocMethods.has(methodName)) {
          handledAsDynamic = true;
          const specInfo = dynamicDocMethods.get(methodName);
          const specFilePath = path.relative(projectPath, specInfo.specFile);
          status = 'completed';
          implementationLink = `${specFilePath}#L${specInfo.line}`;
        }

        // Special check for dynamically generated DataValidationBuilder methods
        if (serviceName === 'Spreadsheet' && className === 'DataValidationBuilder' && dynamicDataValidationMethods.has(methodName)) {
          handledAsDynamic = true;
          const specInfo = dynamicDataValidationMethods.get(methodName);
          const specFilePath = path.relative(projectPath, specInfo.specFile);
          status = 'completed';
          implementationLink = `${specFilePath}#L${specInfo.line}`;
        }

        // Only do file search if not handled as dynamic
        if (!handledAsDynamic) {
          for (const file of fileContents) {
            let isImplemented;
            if (classData.type === 'Enum') {
              const enumRegex = new RegExp(`[\"']?${methodName}[\"']?\\s*[:,\\]\\}]`);
              isImplemented = enumRegex.test(file.content);
            } else {
              isImplemented = file.content.includes(methodName);
            }

            if (isImplemented) {
              let inProgress = false;
              let found = false;
              let implementationLineNumber = null;
              try {
                const ast = acorn.parse(file.content, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
                if (classData.type === 'Enum') {
                  walk.simple(ast, {
                    VariableDeclarator(varNode) {
                      if (varNode.id.name === className || (file.filePath.endsWith('fakemimetype.js') && varNode.id.name === 'props')) {
                        const init = varNode.init;
                        if (init && init.type === 'CallExpression') {
                          const arg = init.arguments[0];
                          if (arg) {
                            if (arg.type === 'ObjectExpression') {
                              arg.properties.forEach(prop => {
                                const name = prop.key.name || prop.key.value;
                                if (name === methodName) {
                                  found = true;
                                  status = 'completed';
                                  implementationLineNumber = prop.loc.start.line;
                                  throw 'found';
                                }
                              });
                            } else if (arg.type === 'ArrayExpression') {
                              arg.elements.forEach(elem => {
                                if (elem && elem.type === 'Literal' && elem.value === methodName) {
                                  found = true;
                                  status = 'completed';
                                  implementationLineNumber = elem.loc.start.line;
                                  throw 'found';
                                }
                              });
                            }
                          }
                        } else if (init && init.type === 'ObjectExpression') {
                          init.properties.forEach(prop => {
                            const name = prop.key.name || prop.key.value;
                            if (name === methodName) {
                              found = true;
                              status = 'completed';
                              implementationLineNumber = prop.loc.start.line;
                              throw 'found';
                            }
                          });
                        }
                      }
                    }
                  });
                } else {
                  walk.simple(ast, {
                    ClassDeclaration(classNode) {
                      const lowerName = classNode.id.name.toLowerCase();
                      const synonyms = classSynonyms[className] || [];
                      const isMatch = lowerName === className.toLowerCase() ||
                                      lowerName === ('fake' + className).toLowerCase() ||
                                      synonyms.some(s => lowerName === s.toLowerCase() || lowerName === ('fake' + s).toLowerCase());
                      if (isMatch) {
                        walk.simple(classNode.body, {
                          MethodDefinition(methodNode) {
                            if (methodNode.key.name === methodName) {
                              found = true;
                              implementationLineNumber = methodNode.loc.start.line;
                              walk.simple(methodNode.value.body, {
                                CallExpression(callNode) {
                                  if (callNode.callee.name === 'notYetImplemented') {
                                    inProgress = true;
                                    throw 'found';
                                  }
                                }
                              });
                              status = 'completed';
                              throw 'found';
                            }
                          }
                        });
                      }
                    }
                  });
                }
              } catch (e) {
                if (e !== 'found') {
                  console.error(`Failed to parse ${file.filePath} with acorn. Error: ${e.message}`);
                }
              }

              if (classData.type === 'Enum') {
                if (!found) {
                  status = 'not started';
                  continue;
                }
              } else {
                if (found) {
                  if (inProgress) {
                    status = 'in progress';
                  } else {
                    status = 'completed';
                  }
                } else {
                  status = 'not started';
                  continue;
                }
              }

              const relativePath = path.relative(projectPath, file.filePath);
              implementationLink = `${relativePath}#L${implementationLineNumber || 1}`;
              if (status === 'completed') break;
            }
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
