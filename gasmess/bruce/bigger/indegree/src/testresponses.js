import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';
import { Exports } from './utils.js';
import { writeFileSync } from 'fs';

const ITEM_MAP_KEY = 'formItemMap'
// Replace with the ID of the form you want to read responses from.
const FORM_ID = '17_1KQ7vGlcQTTxcIOdKJrMSVN-DzhUa05FDq1AgBj9E';
const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G';

const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}

/**
 * Calculate a score based on the specified method and input values.
 * @param {string} method - The aggregation method (sum, mean, max, min, ab1234)
 * @param {string[]} inputs - Array of question IDs to aggregate (may have .text suffix)
 * @param {Object} valuesMap - Map of questionId to numeric value
 * @param {Object} textsMap - Map of questionId to text response
 * @returns {number|string|null} The calculated score, or null if calculation fails
 */
const calculateScore = (method, inputs, valuesMap, textsMap) => {
  if (method === 'ab1234') {
    // For ab1234, collect all text inputs
    const texts = inputs
      .map(inputId => {
        // Check if this input has .text suffix
        const isTextInput = inputId.endsWith('.text');
        const questionId = isTextInput ? inputId.slice(0, -5) : inputId;
        return textsMap[questionId];
      })
      .filter(text => text !== undefined && text !== null);

    if (texts.length === 0) {
      return null;
    }

    // Concatenate all texts and pass to abx
    const combinedText = texts.join(' ');
    return Exports.Utils.abx({ text: combinedText });
  }

  // For other methods, collect numeric values
  const values = inputs
    .map(inputId => {
      // Remove .text suffix if present (shouldn't be for numeric methods, but handle it)
      const questionId = inputId.endsWith('.text') ? inputId.slice(0, -5) : inputId;
      return valuesMap[questionId];
    })
    .filter(val => val !== undefined && val !== null && !isNaN(val))
    .map(val => Number(val));

  if (values.length === 0) {
    return null; // No valid values to aggregate
  }

  switch (method) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);
    case 'mean':
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    default:
      console.warn(`Unknown scoring method: ${method}`);
      return null;
  }
};

/**
 * Reads and logs all responses from a Google Form.
 */
const readResponses = () => {
  if (FORM_ID === 'YOUR_FORM_ID_HERE') {
    console.error("Please replace 'YOUR_FORM_ID_HERE' with an actual Form ID in /Users/brucemcpherson/Documents/repos/gas-fakes/gasmess/bruce/bigger/indegree/src/testresponses.js");
    return;
  }

  // Fetch scoring rules and output specification
  let scoringRules = [];
  let outputVertices = [];
  try {
    if (ScriptApp.isFake) {
      const behavior = ScriptApp.__behavior;
      behavior.addIdWhitelist(behavior.newIdWhitelistItem(rulesId));
    }
    const rulesObject = getDriveObject(rulesId);
    if (rulesObject.processing && rulesObject.processing.scoring) {
      scoringRules = rulesObject.processing.scoring;
    }
    if (rulesObject.network && rulesObject.network.outputs && rulesObject.network.outputs.vertices) {
      outputVertices = rulesObject.network.outputs.vertices;
    }
  } catch (error) {
    console.warn(`Could not load scoring rules: ${error.toString()}`);
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

    // Array to collect output objects for all respondents
    const outputArray = [];

    // Iterate through each response
    formResponses.forEach((formResponse, index) => {
      console.log(`\n--- Response #${index + 1} ---`);

      // Initialize maps to collect all values and texts for this submission
      const submissionValues = {};
      const submissionTexts = {};

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

            // Store the text response
            submissionTexts[qId] = responseValue;

            // Store the numeric value if available
            if (mapping && mapping.labelId && itemMap.labels && itemMap.labels[mapping.labelId]) {
              const labels = itemMap.labels[mapping.labelId];
              const mappedValue = labels[responseValue];
              if (mappedValue !== undefined) {
                submissionValues[qId] = mappedValue;
              }
            } else {
              // Store raw answer if it's numeric
              const numericValue = Number(responseValue);
              if (!isNaN(numericValue)) {
                submissionValues[qId] = numericValue;
              }
            }
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

          // Store the text response
          submissionTexts[questionId] = answer;

          // Store the numeric value if available
          if (String(itemType) === 'SCALE') {
            // For SCALE questions, use the raw response directly
            const numericValue = Number(answer);
            if (!isNaN(numericValue)) {
              submissionValues[questionId] = numericValue;
            }
          } else if (mapping && mapping.labelId && itemMap.labels && itemMap.labels[mapping.labelId]) {
            // For other types, use the mapped label value
            const labels = itemMap.labels[mapping.labelId];
            const mappedValue = labels[answer];
            if (mappedValue !== undefined) {
              submissionValues[questionId] = mappedValue;
            }
          } else {
            // Fallback: store raw answer if it's numeric
            const numericValue = Number(answer);
            if (!isNaN(numericValue)) {
              submissionValues[questionId] = numericValue;
            }
          }
        }
      });

      // Calculate and log scores
      const calculatedScores = {};
      if (scoringRules.length > 0) {
        console.log('\n  --- Calculated Scores ---');
        scoringRules.forEach(rule => {
          const score = calculateScore(rule.method, rule.inputs, submissionValues, submissionTexts);
          if (score !== null) {
            calculatedScores[rule.output] = score;
            console.log(`  ${rule.output}: ${score} (method: ${rule.method})`);
          } else {
            console.log(`  ${rule.output}: Unable to calculate (insufficient data)`);
          }
        });
      }

      // Build output object for this respondent
      if (outputVertices.length > 0) {
        const outputObject = {};
        outputVertices.forEach(field => {
          // Check if field ends with .text
          if (field.endsWith('.text')) {
            const baseField = field.slice(0, -5);
            if (submissionTexts[baseField] !== undefined) {
              outputObject[field] = submissionTexts[baseField];
            }
          } else if (calculatedScores[field] !== undefined) {
            // Use calculated score
            outputObject[field] = calculatedScores[field];
          } else if (submissionValues[field] !== undefined) {
            // Use original numeric value
            outputObject[field] = submissionValues[field];
          } else if (submissionTexts[field] !== undefined) {
            // Fallback to text value
            outputObject[field] = submissionTexts[field];
          }
        });
        outputArray.push(outputObject);
      }
    });

    // Write output array to JSON file
    if (outputArray.length > 0) {
      const outputFilePath = 'responses_output.json';
      writeFileSync(outputFilePath, JSON.stringify(outputArray, null, 2));
      console.log(`\n✅ JSON output written to ${outputFilePath}`);
      console.log(`   Total respondents: ${outputArray.length}`);
      console.log(`   Fields per respondent: ${outputVertices.length}`);
    }
  } catch (error) {
    console.error(`Error reading form responses: ${error.toString()}`);
  }
};

readResponses();