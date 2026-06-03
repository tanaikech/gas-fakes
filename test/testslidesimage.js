import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesImage = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Image class methods', (t) => {
    const presName = `gas-fakes-test-image-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const image = slide.insertImage(imageUrl, 50, 50, 200, 100);

    t.is(image.toString(), 'Image', 'insertImage() should return an Image object');
    t.is(image.getPageElementType().toString(), 'IMAGE', 'getPageElementType() should return IMAGE enum');

    // Test getSourceUrl()
    t.is(image.getSourceUrl(), imageUrl, 'getSourceUrl() should return the provided URL');

    // Test getContentUrl() - in mock it might be the same or different, but should be a string
    t.true(is.string(image.getContentUrl()), 'getContentUrl() should return a string');

    // Test getInherentHeight() and getInherentWidth()
    // On live GAS these return different values (often much smaller than rendered size if expressed in PT from EMUs)
    t.is(typeof image.getInherentHeight(), 'number', 'getInherentHeight should return a number');
    t.is(typeof image.getInherentWidth(), 'number', 'getInherentWidth should return a number');

    // Test getBorder()
    const border = image.getBorder();
    t.truthy(border, 'getBorder() should return a border object');
    t.is(border.getWeight(), null, 'Initial border weight should be null on live GAS');

    // Test getBlob() and getAs()
    const blob = image.getBlob();
    t.is(blob.toString(), 'Blob', 'getBlob() should return a Blob');
    t.is(blob.getContentType(), 'image/png', 'getBlob() default content type should be image/png');

    // getAs('application/pdf') is NOT supported for Slides Images on live GAS
    t.is(image.getAs('image/png').getContentType(), 'image/png', 'getAs("image/png") should return a PNG blob');

    // Test getPlaceholder methods
    t.is(image.getPlaceholderType().toString(), 'NONE', 'Default image should not be a placeholder');
    t.is(image.getPlaceholderIndex(), null, 'Default image should have null placeholder index');
    t.is(image.getParentPlaceholder(), null, 'Default image should have null parent placeholder');

    // Test getImages() on slide
    const images = slide.getImages();
    t.is(images.length, 1, 'Slide should contain 1 image');
    t.is(images[0].getObjectId(), image.getObjectId(), 'getImages()[0] should be the inserted image');

    // Test asImage() on PageElement
    const pageElements = slide.getPageElements();
    const imageFromPe = pageElements.find(pe => pe.getObjectId() === image.getObjectId()).asImage();
    t.is(imageFromPe.getObjectId(), image.getObjectId(), 'asImage() should return the same image');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesImage);
