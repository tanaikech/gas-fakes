import got from 'got';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { URL } from 'url';

const baseUrl = "https://developers.google.com/apps-script/reference/"
const outputFile = './gas-inventory.json';

const visited = new Map();
const queue = [baseUrl]

const kebabCamel = (s) => {
  return s.replace(/([-][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
  });
};
async function scrape() {
  const inventory = {};

  while (queue.length > 0) {
    const url = queue.shift();
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
      if (href && href.startsWith('/apps-script/reference')) {
        const absoluteUrl = new URL(href, url).href;
        const parentUrl = absoluteUrl.replace (/#.*/, '')
        const method = kebabCamel(absoluteUrl.match(/#(.*)/) || ['', ''][1])
        if (!visited.has(parentUrl)) {
          console.log ('...adding to queue',parentUrl)
          queue.push(parentUrl);
          visited.set(parentUrl, {
            url: parentUrl,
            methods: new Map ()
          });
        }
        if (method) {
          visited.get(parentUrl).methods.set(absoluteUrl, {
            url: absoluteUrl,
            method
          })
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