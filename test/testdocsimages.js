
import "../main.js";
import { initTests } from "./testinit.js";
import { trasher, getDocsPerformance, maketdoc, docReport, getChildren } from "./testassist.js";

export const testDocsImages = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("Body.appendImage and Body.insertImage", t => {
    let { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. We need an image to copy. Let's append one using the advanced service.
    // This is a known public image URL.
    //const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const imageUrl = "https://picsum.photos/200"
    const requests = [{
      insertInlineImage: {
        location: { index: 1 },
        uri: imageUrl,
        objectSize: {
          height: { magnitude: 50, unit: 'PT' },
          width: { magnitude: 136, unit: 'PT' }
        }
      }
    }];
    Docs.Documents.batchUpdate({ requests }, doc.getId());
    doc.saveAndClose(); // Ensure changes are saved

    // 2. Re-open and get the image to copy it
    doc = DocumentApp.openById(doc.getId());
    body = doc.getBody();
    // The image is in the first paragraph (which was the initial empty one)
    const sourceImagePara = body.getChild(0);
    const sourceImage = sourceImagePara.getChild(0);
    t.is(sourceImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "Should have an image to copy");

    // The live API may resize the initial image. We'll use its actual dimensions as the baseline for tests.
    const actualInitialWidth = sourceImage.getWidth();
    const actualInitialHeight = sourceImage.getHeight();

    const detachedImage = sourceImage.copy();
    t.is(detachedImage.getParent(), null, "Copied image should be detached");

    t.is(detachedImage.getWidth(), actualInitialWidth, "Detached image should retain its width property from source");
    t.is(detachedImage.getHeight(), actualInitialHeight, "Detached image should retain its height property from source");

    // Test setters on the attached source image
    // Setters are not implemented due to API limitations. See https://issuetracker.google.com/issues/172423234
    // The fake environment throws, but the live one fails silently.
    if (DocumentApp.isFake) {
      t.rxMatch(t.threw(() => sourceImage.setWidth(150))?.message || 'no error thrown', /not yet implemented/, "setWidth should throw not implemented");
    }

    // 3. Append the copied image
    body.appendParagraph("Some text before.");
    const appendedImage = body.appendImage(detachedImage);

    t.is(appendedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendImage should return an InlineImage");
    t.truthy(appendedImage.getParent(), "Appended image should have a parent paragraph");
    t.is(appendedImage.getParent().getType(), DocumentApp.ElementType.PARAGRAPH, "Appended image's parent should be a paragraph");
    t.is(appendedImage.getParent().getParent().getType(), DocumentApp.ElementType.BODY_SECTION, "Appended image's grandparent should be the body");
    // The appended image is a copy of the *original* source image.
    t.is(appendedImage.getHeight(), actualInitialHeight, "Appended image should have the original height");

    const children = getChildren(body);
    // [source_img_para, text_para, appended_img_para]
    t.is(children.length, 3, "Body should have 3 children after appendImage");
    const appendedImagePara = children[2];
    t.is(appendedImagePara.getNumChildren(), 1, "Paragraph for appended image should have 1 child");
    t.is(appendedImagePara.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Child of paragraph should be the image");

    // 4. Insert the copied image
    const detachedImage2 = sourceImage.copy(); // This is a copy of the *original* source image
    body.insertImage(1, detachedImage2); // Insert after source_img_para

    const children2 = getChildren(body);
    // [source_img_para, inserted_img_para, text_para, appended_img_para]
    t.is(children2.length, 4, "Body should have 4 children after insertImage");
    const insertedImagePara = children2[1];
    t.is(insertedImagePara.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Inserted image should be in the correct position");

    // The live API uses the image's intrinsic size when inserting a copy, ignoring the copied dimensions.
    // The fake environment correctly uses the copied dimensions.
    // The test image is 200x200.
    const expectedInsertedWidth = DocumentApp.isFake ? actualInitialWidth : 200;
    const expectedInsertedHeight = DocumentApp.isFake ? actualInitialHeight : 200;
    const insertedImage = insertedImagePara.getChild(0);
    t.is(insertedImage.getHeight(), expectedInsertedHeight, "Inserted image should have the correct height after insertion");
    t.is(insertedImage.getWidth(), expectedInsertedWidth, "Inserted image should have the correct width after insertion");

    // 5. Error conditions
    // The fake environment correctly throws errors for these, but the live one fails silently.
    if (DocumentApp.isFake) {
      const attemptAttachedInsert = () => body.insertImage(1, sourceImage);
      t.rxMatch(t.threw(attemptAttachedInsert)?.message || 'no error thrown', /Element must be detached./, "Inserting an already attached image should throw an error");
      t.rxMatch(t.threw(() => detachedImage.setWidth(100))?.message || 'no error thrown', /Cannot modify a detached element./, "Setting width on a detached image should still throw the correct error");
    }

    // 6. Test appending a blob
    const blobUrl = "https://picsum.photos/200"
    const imageBlob = UrlFetchApp.fetch(blobUrl).getBlob();
    imageBlob.setName('drive_logo.png'); // Blobs need a name for some operations

    const appendedFromBlob = body.appendImage(imageBlob);
    t.is(appendedFromBlob.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendImage(blob) should return an InlineImage");
    t.truthy(appendedFromBlob.getParent(), "Image from blob should have a parent paragraph");

    const children3 = getChildren(body);
    // Both live and fake API should result in 5 children at this point.
    const expectedChildrenAfterBlob = 5;
    t.is(children3.length, expectedChildrenAfterBlob, "Body should have correct number of children after appendImage(blob)");
    const blobPara = children3[4];
    t.is(blobPara.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Paragraph for blob image should contain an image");
    t.truthy(blobPara.getChild(0).getWidth() > 0, "Image from blob should have a width");

    // 7. Test blob validation
    const invalidTypeBlob = Utilities.newBlob("not an image", "text/plain", "invalid.txt");
    t.rxMatch(
      t.threw(() => body.appendImage(invalidTypeBlob))?.message || 'no error thrown',
      /(Unsupported image type: text\/plain|Invalid image data.)/,
      "Should throw error for unsupported blob MIME type"
    );

    // Create a large blob ( > 50MB)
    // To avoid memory issues, create a small blob and mock its size for the test.
    const largeBlob = Utilities.newBlob([0], 'image/png', 'large.png');
    if (DocumentApp.isFake) {
      // In the fake environment, we can mock getBytes to simulate a large file without allocating memory.
      largeBlob.getBytes = () => ({ length: 51 * 1024 * 1024 + 1 });
    } else {
      // On live GAS, we can't mock. We'll skip this specific size check.
      // The live environment will throw its own error for oversized blobs anyway, but it's hard to test without memory issues.
      console.log("Skipping oversized blob test on live GAS due to memory constraints.");
      if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
      return; // End this test section for live GAS
    }
    t.rxMatch(
      t.threw(() => body.appendImage(largeBlob))?.message || 'no error thrown',
      /exceeds the 50 MB limit/,
      "Should throw error for oversized blob"
    );

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Paragraph.appendInlineImage and Paragraph.insertInlineImage", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // 1. Create a source image and a paragraph to work with
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
    const sourceImage = body.appendImage(imageBlob); // body.appendImage returns an InlineImage
    const para = body.appendParagraph("Some text. ");

    // 2. Test appendInlineImage
    const detachedImage1 = sourceImage.copy();
    const appendedImage = para.appendInlineImage(detachedImage1);

    // Paragraph should now have 2 children: a Text element and an InlineImage element.
    t.is(para.getNumChildren(), 2, "Paragraph should have 2 children after appendImage");
    t.is(para.getChild(0).getType(), DocumentApp.ElementType.TEXT, "First child should be Text");
    t.is(para.getChild(1).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Second child should be an InlineImage");
    t.is(appendedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "appendInlineImage should return an InlineImage");
    t.is(para.getText(), "Some text. ", "Text content of paragraph should not include image");

    // 3. Test insertInlineImage
    const detachedImage2 = sourceImage.copy();
    const insertedImage = para.insertInlineImage(0, detachedImage2); // Insert at the beginning

    t.is(para.getNumChildren(), 3, "Paragraph should have 3 children after insertImage");
    t.is(para.getChild(0).getType(), DocumentApp.ElementType.INLINE_IMAGE, "First child should now be the inserted image");
    t.is(para.getChild(1).getType(), DocumentApp.ElementType.TEXT, "Second child should be the original text");
    t.is(para.getChild(2).getType(), DocumentApp.ElementType.INLINE_IMAGE, "Third child should be the appended image");
    t.is(insertedImage.getType(), DocumentApp.ElementType.INLINE_IMAGE, "insertInlineImage should return an InlineImage");

    // 4. Test chaining
    const para2 = body.appendParagraph("Chain test. ");
    const detachedImage3 = sourceImage.copy();
    const returnedImage = para2.appendInlineImage(detachedImage3);
    t.is(returnedImage.toString(), 'InlineImage', "appendInlineImage should return the InlineImage");
    t.is(para2.getChildIndex(returnedImage), 1, "The returned image should be the new child of the paragraph");

    // 5. Error conditions
    const attachedImage = para.getChild(0);
    t.rxMatch(t.threw(() => para.appendInlineImage(attachedImage))?.message || 'no error thrown', /Element must be detached./, "Appending an already attached image should throw an error");
  });

  unit.section("Positioned Images", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const para = body.appendParagraph("This paragraph has a positioned image.");

    const imageUrl = 'https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png';
    const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();

    // Test addPositionedImage
    if (DocumentApp.isFake) {
      // This method is not emulatable in the fake environment because there is no public API.
      const expectedError = /Paragraph.addPositionedImage is not yet implemented/;
      t.rxMatch(t.threw(() => para.addPositionedImage(imageBlob))?.message || 'no error thrown', expectedError, "addPositionedImage should throw in fake environment");
    } else {
      // Test on the live environment
      const posImage = para.addPositionedImage(imageBlob);
      t.is(posImage.toString(), 'PositionedImage', "addPositionedImage should return a PositionedImage on live");
      t.true(posImage.getWidth() > 0, "Live positioned image should have a width");

      // Verify with getPositionedImages
      const images = para.getPositionedImages();
      t.is(images.length, 1, "Paragraph should report 1 positioned image after adding");
      t.is(images[0].getId(), posImage.getId(), "Retrieved image should have the same ID as the added one");
    }

    // Test getPositionedImages on a pre-existing document
    const testDocId = fixes.TEST_DOC_WITH_POS_IMAGE_ID;
    // The build script might pass "''" or an empty string if the env var is not set.
    if (!testDocId || testDocId === "''") {
      console.log("Skipping getPositionedImages test: TEST_DOC_WITH_POS_IMAGE_ID not set in .env");
      return;
    }

    // In sandbox mode, we need to allow access to this specific file.
    let strb = false;
    if (DocumentApp.isFake) {
      strb = ScriptApp.__behavior.strictSandbox;
      ScriptApp.__behavior.strictSandbox = false;
    }

    try {
      const testDoc = DocumentApp.openById(testDocId);
      const testBody = testDoc.getBody();
      const children = getChildren(testBody);
      const paraWithImage = children.find(p => p.getType() === DocumentApp.ElementType.PARAGRAPH && p.getText().includes("This paragraph has a positioned image."));

      t.truthy(paraWithImage, "Should find the paragraph with the positioned image in the test doc");
      if (!paraWithImage) return;

      const positionedImages = paraWithImage.getPositionedImages();
      t.is(positionedImages.length, 1, "Should find one positioned image in the test doc");

      if (positionedImages.length > 0) {
        const image = positionedImages[0];
        t.is(image.toString(), 'PositionedImage', "Object from test doc should be a PositionedImage");
        t.true(image.getWidth() > 0, "Image from test doc should have a width");
        t.true(image.getHeight() > 0, "Image from test doc should have a height");
        t.is(image.getLayout(), DocumentApp.PositionedLayout.WRAP_TEXT, "Image from test doc should have WRAP_TEXT layout");
        const blob = image.getBlob();
        t.is(blob.getContentType(), 'image/png', "Blob content type should be correct (assuming PNG)");
      }
    } finally {
      if (DocumentApp.isFake) {
        ScriptApp.__behavior.strictSandbox = strb;
      }
    }
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsImages();
  ScriptApp.__behavior.trash()
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
