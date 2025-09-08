// all these imports
// this is loaded by npm, but is a library on Apps Script side

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import "../main.js";
import { initTests } from "./testinit.js";

import { cachePerformance } from "./testassist.js";

import { testDocsAdv } from "./testdocsadv.js";
import { testDocs } from "./testdocs.js";
import { testDocsNext } from "./testdocsnext.js";
import { testDocsListItems } from "./testdocslistitems.js";
import { testDocsHeaders } from "./testdocsheaders.js";
import { testDocsFooters } from "./testdocsfooters.js";
import { testDocsFootnotes } from "./testdocsfootnotes.js";
import { testDocsImages } from "./testdocsimages.js";
import { testDocsStyles } from "./testdocsstyles.js";

const testDocsAll = () => {
  const pack = initTests();
  const { unit } = pack;

  // add one of these for each service being tested
  console.log("\n----Test docsstyles----");
  testDocsStyles(pack);
  console.log("\n----Test docsadv----");
  testDocsAdv(pack);
  console.log("\n----Test docs----");
  testDocs(pack);
  console.log("\n----Test docs images----");
  testDocsImages(pack);
  console.log("\n----Test docs next----");
  testDocsNext(pack);
  console.log("\n----Test docs list items----");
  testDocsListItems(pack);
  console.log("\n----Test docs headers----");
  testDocsHeaders(pack);
  console.log("\n----Test docs footers----");
  testDocsFooters(pack);
  console.log("\n----Test docs footnotes----");
  testDocsFootnotes(pack);
  console.log("\n----TEST ALL DOCS COMPLETE----");



  // all tests cumulative unit report
  unit.report();
};

cachePerformance()
if (ScriptApp.isFake) {
  testDocsAll()
}


