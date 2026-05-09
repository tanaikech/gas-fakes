
import '@mcpher/gas-fakes'
import { initTests } from "./testinit.js";

export const testHtmlService = (pack) => {
  const { unit } = pack || initTests();

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
    template.name = "Gemini";
    const evaluated = template.evaluate();
    t.is(evaluated.getContent(), "Hello Gemini");
  });

  unit.section("google.script.run", async t => {
    // Define server-side functions
    globalThis.myServerFunc = (name) => "Hello " + name;
    globalThis.myErrorFunc = () => { throw new Error("Server error"); };
    globalThis.myPrivateFunc_ = () => "Private";

    // Since we are in a synchronous test suite, we need to handle the async nature of google.script.run
    // We'll use a Promise to wait for the results
    
    const p1 = new Promise((resolve) => {
      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .myServerFunc("World");
    });

    const res1 = await p1;
    t.is(res1, "Hello World");

    const p2 = new Promise((resolve) => {
      google.script.run
        .withFailureHandler((err) => resolve(err.message))
        .myErrorFunc();
    });

    const res2 = await p2;
    t.is(res2, "Server error");

    const p3 = new Promise((resolve) => {
      const myUserObj = { foo: "bar" };
      google.script.run
        .withSuccessHandler((res, userObj) => resolve(userObj))
        .withUserObject(myUserObj)
        .myServerFunc("User");
    });

    const res3 = await p3;
    t.is(res3.foo, "bar");

    const p4 = new Promise((resolve) => {
      google.script.run
        .withFailureHandler((err) => resolve(err.message))
        .myPrivateFunc_();
    });

    const res4 = await p4;
    t.true(res4.includes("private"));
  });

  unit.section("google.script.run with registered functions", async t => {
    const myLocalFunc = (x) => x * 2;
    google.script.run.__registerServerFunctions({ double: myLocalFunc });

    const res = await new Promise(resolve => {
      google.script.run.withSuccessHandler(resolve).double(21);
    });
    t.is(res, 42);
  });

  if (!pack) {
    // Wait for all async sections to finish before reporting
    setTimeout(() => {
      unit.report();
    }, 100);
  }
};

if (typeof ScriptApp !== 'undefined' && ScriptApp.isFake) {
  testHtmlService();
}
