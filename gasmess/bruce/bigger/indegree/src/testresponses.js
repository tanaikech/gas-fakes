import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';

const ITEM_MAP_KEY = 'formItemMap'
// Replace with the ID of the form you want to read responses from.
const FORM_ID = '1kp3hyB2xEskem27xdc0w1GXAT5Z1z4DR5Setgta8rIk';

/**
 * Reads and logs all responses from a Google Form.
 */
const readResponses = () => {
  if (FORM_ID === 'YOUR_FORM_ID_HERE') {
    console.error("Please replace 'YOUR_FORM_ID_HERE' with an actual Form ID in /Users/brucemcpherson/Documents/repos/gas-fakes/gasmess/bruce/bigger/indegree/src/testresponses.js");
    return;
  }

  try {
    // Open the form by ID
    const form = FormApp.openById(FORM_ID);
    console.log(`Reading responses from form: "${form.getTitle()}"`);

    // Use the dedicated manager to read the properties, which handles the sidecar file logic.
    const propertiesManager = new FormPropertiesManager(FORM_ID);
    const itemMap = propertiesManager.read(ITEM_MAP_KEY) || { questions: {} };
    const questionMapEntries = Object.entries(itemMap.questions);

    // Get all form responses
    const formResponses = form.getResponses();
    console.log(`Found ${formResponses.length} response(s).`);

    // Iterate through each response
    formResponses.forEach((formResponse, index) => {
      console.log(`\n--- Response #${index + 1} ---`);
      console.log(`Timestamp: ${formResponse.getTimestamp()}`);
      console.log(`Respondent Email: ${formResponse.getRespondentEmail()}`);

      const itemResponses = formResponse.getItemResponses();

      itemResponses.forEach((itemResponse) => {
        const item = itemResponse.getItem();
        const responseId = item.getId(); // This is now a hex string.
        const responseId = item.getId();

        // --- Start Diagnostic Logging ---
        // Log the ID we got from the response item.
        console.log(`[Diagnostic] Trying to find a match for responseId: "${responseId}"`);
        // --- End Diagnostic Logging ---

        const associatedQuestions = questionMapEntries
          // Compare the hex string from the item directly with the hex string from the itemMap.
          .filter(([, questionData]) => questionData.createdId === responseId)
          .map(([questionKey]) => questionKey);

        // If no keys were found, log what we were looking for vs what was available.
        if (associatedQuestions.length === 0) {
          console.log(`[Diagnostic]   -> FAILED. Looked for "${responseId}" in itemMap createdIds: [${questionMapEntries.map(([, qd]) => qd.createdId).join(', ')}]`);
        }

        console.log(`  Question: "${item.getTitle()}", Answer:   "${itemResponse.getResponse()}", Associated Keys: [${associatedQuestions.join(', ')}]`);
      });
    });
  } catch (error) {
    console.error(`Error reading form responses: ${error.toString()}`);
  }
};

readResponses();