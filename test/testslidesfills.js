import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesFills = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Fills & Backgrounds (PictureFill, PageBackground)', (t) => {
    const presName = `gas-fakes-test-fills-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    const presentationId = pres.getId();
    toTrash.push(DriveApp.getFileById(presentationId));

    const slide = pres.getSlides()[0];

    // 1. Set a Picture Background via public API
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'; 
    const bg = slide.getBackground();
    
    bg.setPictureFill(imageUrl);

    if (!ScriptApp.isFake) Utilities.sleep(1000);

    // 2. Verify PageBackground and PictureFill
    t.is(bg.toString(), 'PageBackground', 'getBackground should return PageBackground');
    t.is(bg.getType().toString(), 'PICTURE', 'Background type should be PICTURE');
    
    const pictureFill = bg.getPictureFill();
    t.truthy(pictureFill, 'getPictureFill should return object');
    t.is(pictureFill.toString(), 'PictureFill', 'toString should be PictureFill');
    t.truthy(pictureFill.getContentUrl(), 'getContentUrl should return string');

    // 3. Test setSolidFill
    bg.setSolidFill('#ff0000');
    if (!ScriptApp.isFake) Utilities.sleep(1000);
    t.is(bg.getType().toString(), 'SOLID', 'Background type should be SOLID');

    // 4. Test setTransparent
    bg.setTransparent();
    if (!ScriptApp.isFake) Utilities.sleep(1000);
    t.is(bg.getType().toString(), 'NONE', 'Background type should be NONE after setTransparent');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesFills);
