import { RulesValidator } from './RulesValidator.js';

import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';
import { PhaseAggregator } from './PhaseAggregator.js';
import { ResponseProcessor } from './ResponseProcessor.js';
import { NetworkOutput } from './NetworkOutput.js';

const ITEM_MAP_KEY = 'formItemMap'

// Configuration for multiple forms
const FORMS = [
  { id: '17_1KQ7vGlcQTTxcIOdKJrMSVN-DzhUa05FDq1AgBj9E', phase: 'pre' },
  { id: '1xvshWHT2q7guxwQhD98Kn2SR4mHbs8Chd4MGOmDGKyY', phase: 'post' }
];

const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G';

const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}

const readResponses = () => {
  // Fetch scoring rules and output specification

  let processor = null;
  let networkOutput = null;
  let idOutputName = null;
  let phaseAggregator = null;

  try {
    if (ScriptApp.isFake) {
      const behavior = ScriptApp.__behavior;
      behavior.addIdWhitelist(behavior.newIdWhitelistItem(rulesId));
    }
    const rulesObject = getDriveObject(rulesId);

    // Validate Rules
    const validator = new RulesValidator();
    const validationResult = validator.validate(rulesObject);

    if (!validationResult.valid) {
      console.error('❌ Rules validation failed:');
      validationResult.errors.forEach(err => console.error(`  - ${err}`));
      throw new Error('Rules validation failed. See errors above.');
    } else {
      console.log('✅ Rules validation passed.');
      if (validationResult.warnings.length > 0) {
        console.warn('⚠️ Rules validation warnings:');
        validationResult.warnings.forEach(warn => console.warn(`  - ${warn}`));
      }
    }

    // Initialize ResponseProcessor
    if (rulesObject.processing && rulesObject.processing.scoring) {

      processor = new ResponseProcessor(rulesObject.processing.scoring);

      // Identify the ID output name (method: ab1234)
      const idRule = rulesObject.processing.scoring.find(rule => rule.method === 'ab1234');
      if (idRule) {
        idOutputName = idRule.output;
        console.log(`Identified ID output name: "${idOutputName}"`);
      } else {
        console.warn('No scoring rule with method "ab1234" found. ID merging may not work as expected.');
      }
    }

    // Initialize PhaseAggregator
    if (rulesObject.processing && rulesObject.processing.phaseAggregation) {
      const phases = FORMS.map(f => f.phase);
      phaseAggregator = new PhaseAggregator(rulesObject.processing.phaseAggregation, phases);
      console.log(`Initialized PhaseAggregator with phases: ${phases.join(', ')}`);
    }

    // Initialize NetworkOutput
    if (rulesObject.network && rulesObject.network.outputs && rulesObject.network.outputs.vertices) {
      networkOutput = new NetworkOutput(rulesObject.network.outputs.vertices);
    }
  } catch (error) {
    console.warn(`Could not load rules: ${error.toString()}`);
  }

  const combinedResults = {};

  FORMS.forEach(formConfig => {
    const FORM_ID = formConfig.id;
    const PHASE = formConfig.phase;

    if (FORM_ID === 'YOUR_FORM_ID_HERE') {
      console.error(`Please replace 'YOUR_FORM_ID_HERE' with an actual Form ID for phase ${PHASE}`);
      return;
    }

    try {
      // Open the form by ID
      const form = FormApp.openById(FORM_ID);
      console.log(`\nReading responses from form: "${form.getTitle()}" (Phase: ${PHASE})`);

      // Use the dedicated manager to read the properties, which handles the sidecar file logic.
      const propertiesManager = new FormPropertiesManager(FORM_ID);
      const itemMap = propertiesManager.read(ITEM_MAP_KEY) || { questions: {} };

      const questionMapEntries = Object.entries(itemMap.questions);

      // Get all form responses
      const formResponses = form.getResponses();
      console.log(`Found ${formResponses.length} response(s) for Form ID: ${FORM_ID}`);

      // Iterate through each response
      formResponses.forEach((formResponse, index) => {
        console.log(`\n--- Response #${index + 1} (Phase: ${PHASE}) ---`);

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

        // Calculate and log scores using ResponseProcessor
        const calculatedScores = processor ? processor.calculateAndLogScores(submissionValues, submissionTexts) : {};

        // Build output object using NetworkOutput
        if (networkOutput) {
          const outputObject = networkOutput.buildOutputObject(submissionValues, submissionTexts, calculatedScores, PHASE, idOutputName);

          // Merge into combinedResults
          let id = null;
          if (idOutputName && calculatedScores[idOutputName]) {
            id = calculatedScores[idOutputName];
          } else {
            // Fallback ID generation if needed, or skip
            console.warn(`  Could not determine ID for response #${index + 1} (Phase: ${PHASE})`);
          }

          if (id) {
            if (!combinedResults[id]) {
              combinedResults[id] = {};
            }
            // Merge current outputObject into the existing entry for this ID
            Object.assign(combinedResults[id], outputObject);
          }
        }
      });

    } catch (error) {
      console.error(`Error reading form responses for form ${FORM_ID}: ${error.toString()}`);
    }
  });

  // Perform Phase Aggregation
  if (phaseAggregator) {
    console.log('\n--- Performing Phase Aggregation ---');
    Object.values(combinedResults).forEach(respondentData => {
      const aggregates = phaseAggregator.calculateAggregates(respondentData);
      Object.assign(respondentData, aggregates);
    });
  }

  // Convert combinedResults map to array
  const finalOutputArray = Object.values(combinedResults);

  // Write output array to JSON file using NetworkOutput
  if (networkOutput) {
    networkOutput.writeOutputFile(finalOutputArray);
  }
};

readResponses();