import got from 'got';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { URL } from 'url';

const baseUrl = "https://developers.google.com/apps-script/reference/script/"
const outputFile = './gas-inventory.json';

const visited = new Map();
const queue = [baseUrl]

// the urls are kebab cased
const kebabCamel = (s) => {
  return s.replace(/([-][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
  });
};

function debugPageStructure($) {
  console.log('=== PAGE STRUCTURE DEBUG ===');

  // Check if main elements exist
  console.log('#main-content exists:', $('#main-content').length > 0);
  console.log('devsite-content exists:', $('devsite-content').length > 0);
  console.log('article exists:', $('article').length > 0);
  console.log('h1 elements:', $('h1').length);

  // Show all h1 texts
  $('h1').each((i, el) => {
    console.log(`H1[${i}]:`, $(el).text().trim());
  });

  // Show structure of main-content
  const mainContent = $('#main-content');
  if (mainContent.length > 0) {
    console.log('Main-content children:', mainContent.children().length);
    mainContent.children().each((i, el) => {
      console.log(`Child ${i}:`, el.tagName, $(el).attr('class') || $(el).attr('id'));
    });
  }
}


const getNextCheer = async (u) => {
  console.log(`Scraping ${u}`);
  const response = await got(u);
  return cheerio.load(response.body);
}

const getHrefs = ($) => {
  return $('a').map((i, el) => {
    const r = $(el).attr('href');
    if (r) {
      const absolute = new URL(r, baseUrl).href;
      // skip references to elsewhere and blank anchors
      if (absolute.startsWith(baseUrl) && !absolute.endsWith('#')) return absolute;
    }
  }).get();
}


const s2 = async () => {
  const umap = new Map();
  const uset = new Set()
  while (queue.length) {

    const url = queue.shift();
    console.log('working on url', url)
    const $ = await getNextCheer(url);
    debugPageStructure($);

    // get all the hrefs
    getHrefs($).forEach(f => {
      // so a url could have an anchor for a method so we need to strip that out
      const u = new URL(f);
      const method = u.hash.substring(1);
      const classUrl = u.origin + '/' + u.pathname
      const methodUrl = u.href
      if (!umap.has(classUrl)) {
        umap.set(classUrl, {
          parents: new Map(),
          classUrl,
          methods: new Map()
        })
        console.log ('pushing', classUrl)
        queue.push (classUrl)
      }
      const ob = umap.get(classUrl)
      ob.methods.set(method, { method, methodUrl })
      ob.parents.set(url, { url })
      console.log('adding', f)
    })
  }
}
s2().catch(console.error)
