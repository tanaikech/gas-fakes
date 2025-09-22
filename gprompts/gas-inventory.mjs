import got from 'got';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { URL } from 'url';

const baseUrl = "https://developers.google.com/apps-script/reference/"
const items = JSON.parse(await fs.readFile('/home/bruce/gas-fakes/gprompts/inventory-list.json', 'utf-8'));
const outputFile = '/home/bruce/gas-fakes/gprompts/gas-inventory.json';

const visited = new Set();
const queue = items.map (f=>baseUrl+f);

async function scrape() {
  const inventory = {};

  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) {
      continue;
    }
    visited.add(url);

    console.log(`Scraping ${url}`);
    const response = await got(url);
    const $ = cheerio.load(response.body);

    const serviceName = $('h1').text().split('\n').map(f=>f.replace(/^\s+/,'').trim()).filter (f=>f)[0];
    console.log ('...starting service name',serviceName)
    inventory[serviceName] = {
      name: serviceName,
      link: url,
      classes: {},
    };

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith(url)) {
        const absoluteUrl = new URL(href, url).href;
        if (!visited.has(absoluteUrl)) {
          queue.push(absoluteUrl);
        }
      }
    });

    // Extract classes and methods
    $('h2').each((i, el) => {
      const className = $(el).text().trim();
      if (className) {
        console.log ('...found class',className,'for service',serviceName)
        inventory[serviceName].classes[className] = {
          methods: {},
          properties: {},
        };

        // Find the table of methods for the current class
        const methodsTable = $(el).nextAll('table').first();
        methodsTable.find('tbody tr').each((j, row) => {
          const methodName = $(row).find('td').eq(1).text().trim();
          const methodLink = $(row).find('td').eq(1).find('a').attr('href');
          const returnType = $(row).find('td').eq(0).text().trim();

          if (methodName) {
            inventory[serviceName].classes[className].methods[methodName] = {
              link: methodLink ? new URL(methodLink, url).href : '',
              returns: {
                type: returnType,
                link: '' // to be extracted later
              }
            };
          }
        });
      }
    });
  }

  await fs.writeFile(outputFile, JSON.stringify(inventory, null, 2));
  console.log(`Inventory saved to ${outputFile}`);
}

scrape().catch(console.error);