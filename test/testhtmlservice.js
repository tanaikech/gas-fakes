import '@mcpher/gas-fakes';
import { initTests } from "./testinit.js";
import { wrapupTest } from './testassist.js';

/**
 * Portable synchronous tests for HtmlService.
 * These should run on both Apps Script and gas-fakes.
 */
export const testHtmlService = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section("HtmlService basics", t => {
    const output = HtmlService.createHtmlOutput("<h1>Title</h1>");
    t.is(output.getContent(), "<h1>Title</h1>");
    t.is(output.getTitle(), "");
    output.setTitle("My Page");
    t.is(output.getTitle(), "My Page");
    output.setHeight(100).setWidth(200);
    t.is(output.getHeight(), 100);
    t.is(output.getWidth(), 200);
  });

  unit.section("HtmlTemplate basics", t => {
    const template = HtmlService.createTemplate("Hello <?= name ?>");
    // Explicit property assignment is portable and works in both environments
    template.name = "Gemini";
    const evaluated = template.evaluate();
    t.is(evaluated.getContent(), "Hello Gemini");
  });

  unit.section("HtmlService constants", t => {
    t.true(typeof HtmlService.SandboxMode !== 'undefined');
    t.true(typeof HtmlService.XFrameOptionsMode !== 'undefined');
  });

  return { unit, fixes };
};

wrapupTest(testHtmlService);
