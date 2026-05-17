import { parse } from 'acorn';

/**
 * Strips Node.js specific import/export statements from source code
 * so it can be safely used in a browser environment.
 */
export function sanitizeClientCode(source) {
  try {
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
    const replacements = [];

    // Analyze AST to find Imports, Exports, and Declarations
    for (const node of ast.body) {
      if (node.type === 'ImportDeclaration') {
        replacements.push({ start: node.start, end: node.end });
      } else if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          replacements.push({ start: node.start, end: node.declaration.start });
        } else {
          replacements.push({ start: node.start, end: node.end });
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
          replacements.push({ start: node.start, end: node.declaration.start });
      }
    }

    // Rewrite the source code
    let modifiedSource = source;
    // Sort replacements from end to start so indices remain valid
    replacements.sort((a, b) => b.start - a.start);
    for (const rep of replacements) {
      const length = rep.end - rep.start;
      const replacementText = ' '.repeat(length);
      modifiedSource = modifiedSource.substring(0, rep.start) + replacementText + modifiedSource.substring(rep.end);
    }
    
    return modifiedSource;
  } catch (e) {
    // If it's not valid JS, just return it as is
    return source;
  }
}
