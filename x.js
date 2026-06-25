/**
 * Generates a PNG snapshot of a specific slide and saves it to Google Drive.
 * @param {string} presentationId - The ID of your Google Slides presentation.
 * @param {string} slideObjectId - The unique ID of the slide (e.g., "p", "g123abc_0_0").
 * @param {string} fileName - The name you want for the saved image file.
 */
import '@mcpher/gas-fakes'
function generateSlideSnapshot(presentationId, slideObjectId, fileName) {
  try {
    // 1. Call the Advanced Slides API to get a thumbnail URL
    // You can specify the size using "thumbnailProperties.thumbnailSize" (LARGE, MEDIUM, or SMALL)
    const thumbnailResponse = Slides.Presentations.Pages.getThumbnail(presentationId, slideObjectId, {
      "thumbnailProperties.thumbnailSize": "LARGE"
    });
    
    const imageUrl = thumbnailResponse.contentUrl;
    
    if (!imageUrl) {
      throw new Error("Could not fetch the thumbnail URL.");
    }
    
    // 2. Fetch the image data from the secure URL
    const response = UrlFetchApp.fetch(imageUrl);
    const blob = response.getBlob().setName(fileName + ".png");
    
    // 3. Save the image blob to Google Drive
    const file = DriveApp.createFile(blob);
    
    Logger.log("Snapshot created successfully! File URL: " + file.getUrl());
    return file.getUrl();
    
  } catch (error) {
    Logger.log("Error generating snapshot: " + error.toString());
  }
}

// --- HOW TO RUN IT ---
function testSnapshot() {
  // Replace with your actual Presentation ID (found in the URL of your slide)
  const presentationId = "1U1y6Vjf5ClEof15JLw4qg7tpjpo4MHk7uhVKpjVkA9M"; 
  
  // Get the first slide of the presentation to test
  const presentation = SlidesApp.openById(presentationId);
  const firstSlideId = presentation.getSlides()[0].getObjectId();
  
  generateSlideSnapshot(presentationId, firstSlideId, "Slide_1_Snapshot");
}

