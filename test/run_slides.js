
import '@mcpher/gas-fakes';
import { initTests } from "./testinit.js";
import { testSlides } from "./testslides.js";
import { testSlidesAdv } from "./testslidesadv.js";
import { testSlidesSlide } from "./testslidesslide.js";
import { trasher } from "./testassist.js";

const runSlidesTests = () => {
  const pack = initTests();
  const { unit } = pack;

  console.log("\n----Test slides----");
  testSlides(pack);
  console.log("\n----Test slidesadv----");
  testSlidesAdv(pack);
  console.log("\n----Test slidesslide----");
  testSlidesSlide(pack);

  // final cleanup
  if (ScriptApp.isFake) {
    ScriptApp.__behavior.trash();
  }
  unit.report();
};

if (ScriptApp.isFake) runSlidesTests();
