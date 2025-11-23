import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';

const ITEM_MAP_KEY = 'formItemMap'
// Replace with the ID of the form you want to read responses from.
const FORM_ID = '17_1KQ7vGlcQTTxcIOdKJrMSVN-DzhUa05FDq1AgBj9E';

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

    // --- Start Diagnostic Logging ---
    console.log('[Diagnostic] Full content of itemMap loaded from properties:');
    //console.log(JSON.stringify(itemMap, null, 2));
    // --- End Diagnostic Logging ---

    const questionMapEntries = Object.entries(itemMap.questions);

    // Get all form responses
    const formResponses = form.getResponses();
    console.log(`Found ${formResponses.length} response(s) for Form ID: ${FORM_ID}`);

    // Iterate through each response
    formResponses.forEach((formResponse, index) => {
      console.log(`\n--- Response #${index + 1} ---`);

      const itemResponses = formResponse.getItemResponses();

      itemResponses.forEach((itemResponse) => {
        const item = itemResponse.getItem();
        const itemResponseId = itemResponse.getId();
        const itemId = item.getId();
        const itemTitle = item.getTitle();
        const itemType = item.getType();

        const questionEntry = questionMapEntries.find(([, qd]) =>
          qd.createdId === itemResponseId || qd.createdId === itemId
        );
        const questionId = questionEntry ? questionEntry[0] : 'UNKNOWN_ID';

        if (String(itemType) === 'GRID') {
          // Find all mappings for this grid item
          const gridMappings = Object.entries(itemMap.questions)
            .filter(([_, mapping]) => String(mapping.createdId) === String(itemId))
            .map(([qId, mapping]) => ({ qId, ...mapping }))
            .sort((a, b) => (a.rowIndex || 0) - (b.rowIndex || 0));

          const responses = itemResponse.getResponse(); // This is an array for GRID items

          // Helper function to log grid row response
          const logGridRow = (responseValue, index) => {
            const mapping = gridMappings.find(m => m.rowIndex === index);
            const qId = mapping ? mapping.qId : 'UNKNOWN_GRID_ROW';

            let valueLog = '';
            if (mapping && mapping.labelId && itemMap.labels && itemMap.labels[mapping.labelId]) {
              const labels = itemMap.labels[mapping.labelId];
              const mappedValue = labels[responseValue];
              if (mappedValue !== undefined) {
                valueLog = `, Value: "${mappedValue}"`;
              }
            }

            console.log(`  Question ID: "${qId}", Type: "${itemType}", Question: "${itemTitle} [Row ${index}]", Answer: "${responseValue}"${valueLog}`);
          };

          if (Array.isArray(responses)) {
            responses.forEach(logGridRow);
          } else {
            // Fallback for string response (comma separated)
            const responseString = String(responses);
            const splitResponses = responseString.split(',');
            splitResponses.forEach(logGridRow);
          }
        } else {
          // For non-grid items, we also check for labels
          const mapping = itemMap.questions[questionId];
          let valueLog = '';
          const answer = itemResponse.getResponse();

          if (mapping && mapping.labelId && itemMap.labels && itemMap.labels[mapping.labelId]) {
            const labels = itemMap.labels[mapping.labelId];
            const mappedValue = labels[answer];
            if (mappedValue !== undefined) {
              valueLog = `, Value: "${mappedValue}"`;
            }
          }
          console.log(`  Question ID: "${questionId}", Type: "${itemType}", Question: "${itemTitle}", Answer: "${answer}"${valueLog}`);
        }
      });
    });
  } catch (error) {
    console.error(`Error reading form responses: ${error.toString()}`);
  }
};

readResponses();