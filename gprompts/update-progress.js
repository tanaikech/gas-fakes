#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const progressDir = path.join(__dirname, '..', 'progress');
const overallMdPath = path.join(progressDir, 'overall.md');

/**
 * Calculates a percentage and formats it as a string.
 * @param {number} completed - The number of completed items.
 * @param {number} total - The total number of items.
 * @returns {string} The formatted percentage string.
 */
const formatPercent = (completed, total) => {
  if (total === 0) {
    return '0%';
  }
  return `${Math.round((completed / total) * 100)}%`;
};

/**
 * Parses a single markdown progress file to count classes and methods.
 * @param {string} filePath - The path to the markdown file.
 * @returns {Promise<{totalClasses: number, completedClasses: number, totalMethods: number, completedMethods: number}>}
 */
async function parseProgressFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  // Split the file into sections based on '## ' headings.
  // The first element will be anything before the first class, which we ignore.
  const classSections = content.split('\n## ').slice(1);

  if (classSections.length === 0) {
    return { totalClasses: 0, completedClasses: 0, totalMethods: 0, completedMethods: 0 };
  }

  let totalClasses = 0;
  let completedClasses = 0;
  let totalMethods = 0;
  let completedMethods = 0;
  for (const classContent of classSections) {
    totalClasses++;
    const classLines = classContent.split('\n');
    let statusColumnIndex = -1;
    let classTotalMethods = 0;
    let classCompletedMethods = 0;
    let isTableBody = false;

    for (const line of classLines) {
      const trimmedLine = line.trim();

      if (!trimmedLine.startsWith('|')) {
        continue;
      }

      // Find the header row to locate the 'status' column.
      if (statusColumnIndex === -1 && trimmedLine.toLowerCase().includes('status') && !trimmedLine.includes('---')) {
        const headers = trimmedLine.split('|').map(h => h.trim().toLowerCase());
        statusColumnIndex = headers.indexOf('status');
        continue;
      }

      // The separator row marks the beginning of the table body.
      if (trimmedLine.includes('---')) {
        isTableBody = true;
        continue;
      }

      // If we are in the table body and have a valid status column, count the method.
      if (isTableBody && statusColumnIndex > -1) {
        const columns = trimmedLine.split('|');
        if (columns.length > statusColumnIndex) {
          classTotalMethods++;
          const statusCell = columns[statusColumnIndex].trim();
          if (statusCell.toLowerCase().includes('completed')) {
            classCompletedMethods++;
          }
        }
      }
    }
    totalMethods += classTotalMethods;
    completedMethods += classCompletedMethods;
    if (classTotalMethods > 0 && classTotalMethods === classCompletedMethods) {
      completedClasses++;
    }
  }

  return { totalClasses, completedClasses, totalMethods, completedMethods };
}

/**
 * Main function to generate the overall progress summary.
 */
async function generateSummary() {
  try {
    const files = await fs.readdir(progressDir);
    // Filter for .md files, excluding overall.md and other non-service files, case-insensitively
    const mdFiles = files.filter(file =>
      file.toLowerCase().endsWith('.md') &&
      !['overall.md'].includes(file.toLowerCase())
    );

    const allStats = [];
    const grandTotal = { classes: 0, classesCompleted: 0, methods: 0, methodsCompleted: 0 };

    for (const file of mdFiles) {
      const serviceName = path.basename(file, path.extname(file));
      const filePath = path.join(progressDir, file);
      const stats = await parseProgressFile(filePath);
      allStats.push({ name: serviceName, file, ...stats });
      grandTotal.classes += stats.totalClasses;
      grandTotal.classesCompleted += stats.completedClasses;
      grandTotal.methods += stats.totalMethods;
      grandTotal.methodsCompleted += stats.completedMethods;
    }

    allStats.sort((a, b) => a.name.localeCompare(b.name));

    let table = '# Overall Progress\n\n';
    table += '| service | classes | methods | methods completed | %age |\n';
    table += '| :--- | :---: | :---: | :---: | :---: |\n';

    for (const stat of allStats) {
      const methodPercent = formatPercent(stat.completedMethods, stat.totalMethods);
      table += `| [${stat.name}](${stat.file}) | ${stat.totalClasses} | ${stat.totalMethods} | ${stat.completedMethods} | ${methodPercent} |\n`;
    }

    const totalMethodPercent = formatPercent(grandTotal.methodsCompleted, grandTotal.methods);
    table += `| **Total** | **${grandTotal.classes}** | **${grandTotal.methods}** | **${grandTotal.methodsCompleted}** | **${totalMethodPercent}** |\n`;

    await fs.writeFile(overallMdPath, table);
    console.log(`Successfully updated ${overallMdPath}`);
  } catch (error) {
    console.error('Failed to generate progress summary:', error);
  }
}

generateSummary();