import '@mcpher/gas-fakes';
export const probeSlidesParagraph = () => {
  const presName = `gas-fakes-probe-paragraph-${new Date().getTime()}`;
  const pres = SlidesApp.create(presName);
  console.log(`Created Presentation: ${pres.getId()}`);

  const slide = pres.getSlides()[0];
  const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);
  const textRange = shape.getText();

  textRange.setText('Line 1\nLine 2\nLine 3\n');

  const paragraphs = textRange.getParagraphs();
  console.log(`Paragraphs count: ${paragraphs.length}`);

  paragraphs.forEach((p, i) => {
    console.log(`Paragraph ${i}:`);
    console.log(`  getIndex(): ${p.getIndex()}`);
    console.log(`  getRange().asString(): ${JSON.stringify(p.getRange().asString())}`);
    console.log(`  getRange().getStartIndex(): ${p.getRange().getStartIndex()}`);
    console.log(`  getRange().getEndIndex(): ${p.getRange().getEndIndex()}`);
  });

  DriveApp.getFileById(pres.getId()).setTrashed(true);
};
probeSlidesParagraph();
