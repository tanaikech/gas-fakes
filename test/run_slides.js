
import '@mcpher/gas-fakes';
import { initTests } from "./testinit.js";
import { testSlides } from "./testslides.js";
import { testSlidesAdv } from "./testslidesadv.js";
import { testSlidesSlide } from "./testslidesslide.js";
import { testSlidesTextRange } from "./testslidestextrange.js";
import { testSlidesParagraph } from "./testslidesparagraph.js";
import { probeSlidesParagraph } from "./probeslides.js";
import { trasher } from "./testassist.js";

const runSlidesTests = () => {
  const pack = initTests();
  const { unit } = pack;

  // if (!ScriptApp.isFake) probeSlidesParagraph();

  console.log("\n----Test slides----");
  testSlides(pack);
  console.log("\n----Test slidesadv----");
  testSlidesAdv(pack);
  console.log("\n----Test slidesslide----");
  testSlidesSlide(pack);
  console.log("\n----Test slidestextrange----");
  testSlidesTextRange(pack);
  console.log("\n----Test slidesparagraph----");
  testSlidesParagraph(pack);

  // final cleanup
  if (ScriptApp.isFake) {
    ScriptApp.__behavior.trash();
  }
  unit.report();
};

if (ScriptApp.isFake) runSlidesTests();
