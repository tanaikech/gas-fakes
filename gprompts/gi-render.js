import fs from 'fs';
import path from 'path';

const data = JSON.parse(fs.readFileSync('/Users/brucemcpherson/Documents/repos/gas-fakes/gprompts/gi-fake-all.json', 'utf8'));

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
};

data.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

for (const service of data) {
  const classMap = new Map(service.classes.map(c => [c.className, c.type]));
  let markdown = `# [${service.serviceName}](${service.url})\n\n`;
  markdown += `${cleanText(service.description)}\n\n`;

  service.classes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.className.localeCompare(b.className);
  });

  for (const a_class of service.classes) {
    if (a_class.type === 'Enum' || a_class.type === 'Interface') {
      markdown += `## ${a_class.type}: [${a_class.className}](${a_class.classUrl})\n\n`;
      markdown += `${cleanText(a_class.description)}\n\n`;
      markdown += '| Property | Description | Status | Implementation |\n';
      markdown += '|--- |--- |--- |--- |\n';
    } else {
      markdown += `## Class: [${a_class.className}](${a_class.classUrl})\n\n`;
      markdown += `${cleanText(a_class.description)}\n\n`;
      markdown += '| Method | Description | Return Type | Return Description | Status | Implementation |\n';
      markdown += '|--- |--- |--- |--- |--- |--- |\n';
    }

    a_class.methods.sort((a, b) => a.method.localeCompare(b.method));

    for (const method of a_class.methods) {
      let methodName = method.method;
      if (methodName.endsWith('))')) {
        methodName = methodName.slice(0, -1);
      }

      let returnType = cleanText(method.returnType);
      const cleanedReturnType = returnType.replace('[]', '');
      if (classMap.has(cleanedReturnType)) {
        const type = classMap.get(cleanedReturnType);
        const anchor = `#${type.toLowerCase()}-${cleanedReturnType.toLowerCase()}`;
        returnType = `[${returnType}](${anchor})`;
      }

      const status = method['gas-fakes status'] || 'not started';
      const implementationLink = method['implementationLink'] ? `[link](../${method['implementationLink']})` : '';

      if (a_class.type === 'Enum') {
        markdown += `| ${methodName} | ${cleanText(method.description)} | ${status} | ${implementationLink} |\n`;
      } else {
        if (method.methodUrl) {
          markdown += `| [${methodName}](${method.methodUrl}) | ${cleanText(method.description)} | ${returnType} | ${cleanText(method.returnDescription)} | ${status} | ${implementationLink} |\n`;
        } else {
          markdown += `| ${methodName} | ${cleanText(method.description)} | ${returnType} | ${cleanText(method.returnDescription)} | ${status} | ${implementationLink} |\n`;
        }
      }
    }
    markdown += '\n';
  }

  fs.writeFileSync(`/Users/brucemcpherson/Documents/repos/gas-fakes/progress/${service.serviceName.toLowerCase()}.md`, markdown);
}
