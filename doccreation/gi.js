
import got from 'got';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { URL } from 'url';

const outputFile = './gi.json';
const targets = [
  'script',
  'spreadsheet',
  'base',
  'document',
  'drive',
  'forms',
  'gmail',
  'calendar',
  'slides',
  'cache',
  'lock',
  'properties',
  'charts',
  'content',
  'html',
  'mail',
  'url-fetch',
  'jdbc',
  'utilities',
  'xml-service'
]
const CONCURRENCY_LIMIT = 5;

/**
 * A simple concurrency pool manager to limit simultaneous async operations.
 * @param {number} limit The maximum number of concurrent promises.
 * @returns {object} An object with an `add` method.
 */
const createPromisePool = (limit) => {
  const active = new Set();
  const waiting = [];

  const next = () => {
    if (active.size >= limit || waiting.length === 0) {
      return;
    }
    const { promiseFn, resolve, reject } = waiting.shift();
    const promise = promiseFn()
      .then(res => resolve(res))
      .catch(err => reject(err))
      .finally(() => {
        active.delete(promise);
        next();
      });
    active.add(promise);
  };

  return {
    add: (promiseFn) => new Promise((resolve, reject) => {
      waiting.push({ promiseFn, resolve, reject });
      next();
    }),
  };
};

const queue = targets.map(f => ({
  url: `https://developers.google.com/apps-script/reference/${f}`,
}))
const pageCache = new Map()

const getClassType = async (url) => {
  const $ = await getCheerioWithCache(url);
  const titleText = $('title').text().trim();
  const match = titleText.match(/^(Class|Enum|Interface)\s/i);
  if (!match) {
    throw 'couldnt find class type for ' + url
  }
  return match ? match[1] : '';
}
const getMethodDetails = async (url, methodName) => {

  const $ = await getCheerioWithCache(url);

  // find the method's block by its ID
  const escapedMethodName = methodName.replace(/([.()])/g, '\\$1');
  const methodHeader = $(`#${escapedMethodName}`);

  // The content is in a div that is a child of the methodHeader element.
  const methodContent = methodHeader.find('div').first();

  // The description is the first direct child paragraph of the content div.
  const description = methodContent.children('p').first().text().trim();

  // The return info is in a <p> tag that follows a heading with "Return".
  const returnHeading = methodContent.find(':header:contains("Return")');
  const returnSection = returnHeading.next('p');
  
  let returnType = '';
  let returnDescription = '';

  if (returnSection.length) {
    const returnText = returnSection.text().trim();
    const match = returnText.match(/^(.+?)—(.+)$/s);
    if (match) {
      returnType = match[1].trim();
      returnDescription = match[2].trim();
    } else {
      returnDescription = returnText;
    }
  }

  return {
    description,
    returnType,
    returnDescription,
  };
}

const getEnumValues = async (url) => {
  const $ = await getCheerioWithCache(url);
  const enumTable = $('table.members.property');
  const values = [];

  if (enumTable.length) {
    enumTable.find('tbody tr').each((i, row) => {
      // Skip header row
      if (i === 0) return;

      const cells = $(row).find('td');
      const name = $(cells[0]).text().replace(/<wbr>/g, '').trim();
      const description = $(cells[2]).text().trim();

      if (name) {
        values.push({ method: name, description, returnType: '', returnDescription: '' });
      }
    });
  }
  return values;
};

const getClassName = async (url, type) => {
  const $ = await getCheerioWithCache(url);
  // The class name is in the main h1 tag on the page
  const h1Text = $('h1').first().text().trim();
  // The h1 contains extra text like "Stay organized...". We only want the first line.
  const firstLine = h1Text.split('\n')[0].trim();
  // The first line is sometimes "Class ClassName" or "Enum EnumName", so we remove the prefix.
  // It's safe to do this for both, as class names won't start with "Class " or "Enum ".
  return firstLine.replace(/^(Class|Enum|Interface)\s/i, '').trim();
};

const getClassDescription = async (url) => {
  const $ = await getCheerioWithCache(url);
  // first paragraph
  return $('[itemscope="itemscope"] p').first().text().trim()
}
const getServiceDescription = async (url) => {
  const $ = await getCheerioWithCache(url);
  // direct descendent
  return $('[itemscope="itemscope"] > p').first().text().trim()
}
const identifyService = async (url) => {

  // get the main page
  const $ = await getCheerioWithCache(url);

  // find all the links
  const hrefs = getHrefs($, url)

  // there should be a main content anchor
  const mainAnchor = '#main-content'

  if ($(mainAnchor).length > 0) {
    // this should be the class info
    const el = $('h1')[0]
    const serviceHeader = $(el).text().trim()
    if (!serviceHeader.match(/Service/)) {
      throw 'expected a service name, but got ' + serviceHeader
    }

    const serviceName = serviceHeader.replace(/(.*?)\sService.*/s, '$1')
    const classes = new Map()
    const description = await getServiceDescription(url)
    const service = {
      serviceName,
      url,
      classes,
      description
    }

    // Phase 1: Identify all unique classes and create their objects.
    // This avoids race conditions where multiple async operations try to create the same class.
    const uniqueClassUrls = new Map();
    hrefs.forEach(f => {
      const u = new URL(f.href);
      const classUrl = u.origin + u.pathname;
      if (classUrl !== service.url) {
        uniqueClassUrls.set(classUrl, { href: f.href, text: f.text });
      }
    });

    const pool = createPromisePool(CONCURRENCY_LIMIT);

    const classProcessingPromises = Array.from(uniqueClassUrls.values()).map(({ href, text: linkText }) => pool.add(async () => {
      const u = new URL(href);
      const classUrl = u.origin + u.pathname;
      const type = await getClassType(classUrl);
      const className = await getClassName(classUrl, type);
      const description = await getClassDescription(classUrl);
      const methods = new Map();

      if (type.toLowerCase() === 'enum') {
        const enumValues = await getEnumValues(classUrl);
        for (const val of enumValues) {
          methods.set(val.method, val);
        }
      }

      classes.set(classUrl, {
        classUrl,
        className,
        description,
        type,
        methods,
      });
    }));
    await Promise.all(classProcessingPromises);

    // Phase 2: Populate methods for the now-existing classes.
    const methodProcessingPromises = hrefs.map(f => pool.add(async () => {
      const { href, text: linkText } = f
      const u = new URL(href);
      const method = u.hash.substring(1);
      if (method) {
        const classUrl = u.origin + u.pathname
        // only process if it's not a method of the main service page
        if (classUrl !== service.url) {
          const methodUrl = u.href;
          const theClass = classes.get(classUrl);
          if (theClass.methods.has(method)) {
            // Method already added, skip.
          } else {
            const methodDetails = await getMethodDetails(classUrl, method);
            theClass.methods.set(method, { method, methodUrl, ...methodDetails });
          }
        }
      }
    }));
    await Promise.all(methodProcessingPromises);
    return service;

  }
  else {
    throw new error(`failed to find the main content for ${url}`)
  }
}

// A centralized function to handle fetching and caching is cleaner
const getCheerioWithCache = async (url) => {
  if (pageCache.has(url)) {
    // If the cache has an entry, it could be a Promise (if a fetch is in flight)
    // or the resolved Cheerio object. Awaiting it handles both cases correctly.
    return pageCache.get(url);
  }

  // Create the promise for the network request.
  const fetchPromise = getNextCheer(url).then(cheerioObj => {
    pageCache.set(url, cheerioObj); // Replace promise with resolved value
    return cheerioObj;
  });

  pageCache.set(url, fetchPromise); // Cache the promise itself immediately to handle concurrent requests
  return fetchPromise;
}

const getNextCheer = async (u) => {
  const response = await got(u);
  return cheerio.load(response.body);
}

const getHrefs = ($, baseUrl) => {
  return $('a').map((i, el) => {
    const r = $(el).attr('href');
    const text = $(el).text().trim()
    if (r) {
      const absolute = new URL(r, baseUrl).href;
      // skip references to elsewhere and blank anchors
      if (absolute.startsWith(baseUrl) && !absolute.endsWith('#')) return {
        href: absolute,
        text
      };
    }
  }).get();
}

const s3 = async () => {
  const services = new Map();
  const pool = createPromisePool(CONCURRENCY_LIMIT);
  const servicePromises = queue.map(q => pool.add(async () => {
    let { url, serviceName } = q;
    console.log('working on url', url);
    const service = await identifyService(url);
    if (service) {
      services.set(service.url, service);
    }
  }));
  await Promise.all(servicePromises);
  const a = convertMaps(services)
  await fs.writeFile(outputFile, JSON.stringify(a, null, 2));
  console.log(a)
}
// Function to recursively convert Maps to plain objects/arrays
const convertMaps = (obj) => {
  if (obj instanceof Map) {
    // If it's a Map, convert it to a plain array of its values.
    // This is because the Map keys (URLs/method names) are already included
    // as values (e.g., classUrl, method).
    return Array.from(obj.values()).map(convertMaps);
  }
  if (typeof obj === 'object' && obj !== null) {
    // If it's a plain object, iterate over its properties
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertMaps(obj[key]);
      }
    }
    return newObj;
  }
  // Otherwise, return the value as is (string, number, boolean, etc.)
  return obj;
};

s3().catch(console.error)
