// all these imports
// this is loaded by npm, but is a library on Apps Script side

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import "../main.js";
import { initTests } from "./testinit.js";

import {
  getDrivePerformance,
  getSheetsPerformance,
  getDocsPerformance
} from "./testassist.js";

import { testDocsAdv } from "./testdocsadv.js";
import { testDocs } from "./testdocs.js";
import { testDocsNext } from "./testdocsnext.js";
import { testDocsListItems } from "./testdocslistitems.js";

const testDocsAll = () => {
  const pack = initTests();
  const { unit } = pack;

  // add one of these for each service being tested

  console.log("\n----Test docsadv----");
  testDocsAdv(pack);
  console.log("\n----Test docs----");
  testDocs(pack);
  console.log("\n----Test docs next----");
  testDocsNext(pack);
  console.log("\n----Test docs list items----");
  testDocsListItems(pack);

  console.log("\n----TEST ALL DOCS COMPLETE----");

  // reports on cache performance
  if (ScriptApp.isFake) {
    console.log("...cumulative drive cache performance", getDrivePerformance());
    console.log(
      "...cumulative sheets cache performance",
      getSheetsPerformance()
    );
    console.log("...cumulative docs cache performance", getDocsPerformance());

  }

  // all tests cumulative unit report
  unit.report();
};

// this required on Node but not on Apps Script
if (ScriptApp.isFake) {
  testDocsAll();
  ScriptApp.__behavior.trash()
}
