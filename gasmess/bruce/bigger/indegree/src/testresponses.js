import { RulesValidator } from './RulesValidator.js';

import '@mcpher/gas-fakes';
import { FormPropertiesManager } from './FormPropertiesManager.js';
import { PhaseAggregator } from './PhaseAggregator.js';
import { ResponseProcessor } from './ResponseProcessor.js';
import { NetworkOutput } from './NetworkOutput.js';
import { EdgeProcessor } from './EdgeProcessor.js';
import { PostProcessor } from './PostProcessor.js';

const ITEM_MAP_KEY = 'formItemMap'

// Configuration for multiple forms
const FORMS = [{ id: '1_naVLJPrGRwcSwajYCXD4Uwa_lNe18P2iGdAh2pg6vk', phase: 'pre' },
{ id: '1zPK1Gi17mg9fynUTB7A9OwMtz9vikLSU0oQpTQtniU8', phase: 'post' }
];

const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G';
const filters = [{
  "input": "node_selector",
}, {
  "input": "group", "values": ["cooked"]
}];
const rostersId = "1ja0P4WHkMmU0fjawA5egYqTFBSmB0uFX"
const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}

/**
 * Generate an ID from a name using the ab1234 logic
 */
const generateIdFromName = (name) => {
  return Exports.Utils.abx({ text: name });
}

/**
 * Find a roster member by respondent ID
 */
const findRosterMemberById = (respondentId, rostersObject) => {
  if (!rostersObject || !rostersObject.rosters) return null;

  for (const [rosterName, roster] of Object.entries(rostersObject.rosters)) {
    // Check if roster has members array
    if (!roster || !Array.isArray(roster.members)) {
      console.warn(`Roster ${rosterName} has no members array`);
      continue;
    }

    const member = roster.members.find(m => {
      // Generate ID from member name and check if it matches
      const memberName = m[roster.idField || 'name'];
      if (!memberName) return false;
      const memberId = generateIdFromName(memberName);
      return memberId === respondentId;
    });
    if (member) return member;
  }
  return null;
}

const readResponses = () => {
  // Fetch scoring rules and output specification

  let processor = null;
  let networkOutput = null;
  let idOutputName = null;
  let phaseAggregator = null;
  let edgeProcessor = null;
  let postProcessor = null;
  let edgeNames = [];
  let rostersObject = null;
  let rulesObject = null;

  try {
    const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G'; // Moved declaration here
    if (ScriptApp.isFake) {
      const behavior = ScriptApp.__behavior;
      behavior.addIdWhitelist(behavior.newIdWhitelistItem(rulesId));
    }
    rulesObject = getDriveObject(rulesId);
    rostersObject = getDriveObject(rostersId);
    console.log('Rosters object loaded:', JSON.stringify(rostersObject, null, 2).slice(0, 200));

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

    // Initialize PostProcessor
    if (rulesObject.processing && rulesObject.processing.post) {
      const phases = FORMS.map(f => f.phase);
      postProcessor = new PostProcessor(rulesObject.processing.post, phases);
    }
    // Initialize ResponseProcessor
    if (rulesObject.processing && rulesObject.processing.scoring) {

      processor = new ResponseProcessor(rulesObject.processing.scoring);

      // Identify the ID output name (method: ab1234)
      const idRule = rulesObject.processing.scoring.find(rule => rule.method === 'ab1234');
      if (idRule) {
        idOutputName = idRule.output;
      } else {
        console.warn('No scoring rule with method "ab1234" found. ID merging may not work as expected.');
      }
    }

    // Initialize PhaseAggregator
    if (rulesObject.processing && rulesObject.processing.phaseAggregation) {
      const phases = FORMS.map(f => f.phase);
      phaseAggregator = new PhaseAggregator(rulesObject.processing.phaseAggregation, phases);
    }

    // Initialize NetworkOutput
    if (rulesObject.network && rulesObject.network.outputs && rulesObject.network.outputs.vertices) {
      networkOutput = new NetworkOutput(rulesObject.network.outputs.vertices);

      // Get edge names if configured
      if (rulesObject.network.outputs.edges) {
        edgeNames = Array.isArray(rulesObject.network.outputs.edges)
          ? rulesObject.network.outputs.edges
          : [];
      }
    }

    // Load roster data if edges are configured
    if (edgeNames.length > 0 && rulesObject.processing && rulesObject.processing.edges) {
      // Try to load rosters - you'll need to configure the roster ID
      const rostersId = "1ja0P4WHkMmU0fjawA5egYqTFBSmB0uFX"; // TODO: Make this configurable
      try {
        if (ScriptApp.isFake) {
          ScriptApp.__behavior.addIdWhitelist(ScriptApp.__behavior.newIdWhitelistItem(rostersId));
        }
        rostersObject = getDriveObject(rostersId);
      } catch (error) {
        console.warn(`Could not load roster data: ${error.toString()}`);
      }
    }
  } catch (error) {
    console.warn(`Could not load rules: ${error.toString()}`);
  }

  const combinedResults = {};
  const allEdges = [];

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

      // Use the dedicated manager to read the properties, which handles the sidecar file logic.
      const propertiesManager = new FormPropertiesManager(FORM_ID);
      const itemMap = propertiesManager.read(ITEM_MAP_KEY) || { questions: {} };

      // Initialize EdgeProcessor for this form if edges are configured
      if (edgeNames.length > 0 && rulesObject.processing && rulesObject.processing.edges && rostersObject) {
        const roster = rostersObject.rosters ? Object.values(rostersObject.rosters)[0] : null;
        edgeProcessor = new EdgeProcessor(rulesObject.processing.edges, roster, itemMap);
      }

      const questionMapEntries = Object.entries(itemMap.questions);

      // Get all form responses
      const formResponses = form.getResponses();

      // Iterate through each response
      formResponses.forEach((formResponse, index) => {

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
          let questionId = questionEntry ? questionEntry[0] : 'UNKNOWN_ID';

          if (String(itemType) === 'CHECKBOX_GRID') {
            // For checkbox grids, get the rows from the form item to map responses
            const checkboxGridItem = item.asCheckboxGridItem();
            const rows = checkboxGridItem.getRows();

            // Response is a comma-separated string of column labels
            const responseString = String(itemResponse.getResponse());
            const responseValues = responseString.split(',').map(v => v.trim()).filter(v => v);

            // Override questionId if we recognize the title (workaround for missing mappings)
            // Also check response values to disambiguate "interact" which might have the wrong title
            const hasInteractValues = responseValues.some(v =>
              v.includes('Socialize') || v.includes('Study') || v.includes('Support')
            );

            if (hasInteractValues) {
              questionId = 'interact';
            } else if (itemTitle.toLowerCase().includes('closest')) {
              questionId = 'closest';
            } else if (itemTitle.toLowerCase().includes('influential')) {
              questionId = 'influential';
            }

            // Each response value corresponds to a checked row in order
            // We need to figure out which rows were checked
            // The response format doesn't tell us which rows, only how many
            // So we need to match against the actual form structure

            // Find which rows have responses by checking each row
            rows.forEach((rowName, rowIndex) => {
              // Create a question ID for this specific row
              const rowQuestionId = questionId ? `${questionId}_${rowIndex}` : `${itemId}_row_${rowIndex}`;

              // Check if this row was checked
              // For now, we'll mark all rows with response values as checked
              // This is a limitation - we can't determine WHICH specific rows without more info
              if (rowIndex < responseValues.length) {
                const value = responseValues[rowIndex];
                submissionTexts[rowQuestionId] = rowName;
                submissionValues[rowQuestionId] = value; // Store the label text (e.g. "Socialize with")
              } else {
                submissionValues[rowQuestionId] = false; // Mark as unchecked
              }
            });

          } else if (String(itemType) === 'GRID') {
            // Regular grid handling
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
              responses.forEach((responseValue, index) => {
                logGridRow(responseValue, index);
              });
            } else {
              // Fallback for string response (comma separated)
              const responseString = String(responses);
              const splitResponses = responseString.split(',');
              splitResponses.forEach((responseValue, index) => {
                logGridRow(responseValue, index);
              });
            }
          } else {
            // For non-grid items, we also check for labels
            const mapping = itemMap.questions[questionId];
            const answer = itemResponse.getResponse();

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

            // Process edges for this response if configured
            if (edgeProcessor && edgeNames.length > 0) {
              // Get source name from submission texts (assuming there's a 'name' field)
              const sourceName = submissionTexts['name'] || calculatedScores['name'] || id;

              edgeNames.forEach(edgeName => {
                try {
                  const edges = edgeProcessor.processEdges(
                    edgeName,
                    submissionValues,
                    submissionTexts,
                    id, // source ID
                    sourceName, // source name
                    PHASE
                  );
                  allEdges.push(...edges);
                } catch (error) {
                  console.warn(`Error processing edges for ${edgeName}: ${error.message}`);
                }
              });
            }
          }
        }
      });

    } catch (error) {
      console.error(`Error reading form responses for form ${FORM_ID}: ${error.toString()}`);
    }
  });

  // Extract roster fields and add to respondent data
  if (rulesObject.processing && rulesObject.processing.roster && rostersObject) {
    console.log('\n--- Extracting Roster Fields ---');
    const rosterFields = rulesObject.processing.roster;
    let extractedCount = 0;

    Object.entries(combinedResults).forEach(([respondentId, respondentData]) => {
      const rosterMember = findRosterMemberById(respondentId, rostersObject);

      if (rosterMember) {
        rosterFields.forEach(fieldName => {
          if (rosterMember[fieldName] !== undefined) {
            respondentData[fieldName] = rosterMember[fieldName];
            extractedCount++;
          }
        });
      }
    });
    console.log(`Extracted ${extractedCount} roster field values for ${Object.keys(combinedResults).length} respondents`);
  }

  // Apply filters to respondents
  if (filters && filters.length > 0) {
    console.log('\n--- Applying Filters ---');
    const filteredIds = new Set();

    Object.entries(combinedResults).forEach(([respondentId, respondentData]) => {
      const passesAllFilters = filters.every(filter => {
        const fieldValue = respondentData[filter.input];

        // Check if field has a value
        if (!fieldValue || fieldValue === '') {
          return false;
        }

        // If no values specified, any non-blank value passes
        if (!filter.values || filter.values.length === 0) {
          return true;
        }

        // Check if value matches any allowed value
        return filter.values.includes(fieldValue);
      });

      if (!passesAllFilters) {
        filteredIds.add(respondentId);
      }
    });

    // Remove filtered respondents
    filteredIds.forEach(id => delete combinedResults[id]);
    console.log(`Filtered out ${filteredIds.size} respondents, ${Object.keys(combinedResults).length} remaining`);
  }

  // Create ghost vertices for individuals who appear in edges but didn't complete the survey
  console.log('\n--- Creating Ghost Vertices ---');
  const allEdgeIds = new Set();
  allEdges.forEach(edge => {
    if (edge.source) allEdgeIds.add(edge.source);
    if (edge.target) allEdgeIds.add(edge.target);
  });

  let ghostCount = 0;
  allEdgeIds.forEach(edgeId => {
    if (!combinedResults[edgeId]) {
      // Find first edge with this ID to get name
      const edge = allEdges.find(e => e.source === edgeId || e.target === edgeId);
      const ghostName = edge.source === edgeId ? edge.source_name : edge.target_name;

      combinedResults[edgeId] = {
        id: edgeId,
        'name.text_ghost': ghostName,
        is_ghost: true
      };
      ghostCount++;
      console.log(`  Created ghost vertex for ${edgeId} (${ghostName})`);
    }
  });
  console.log(`Total ghost vertices created: ${ghostCount}`);

  // Perform Post Processing (BEFORE phase aggregation so degrees can be aggregated)
  if (postProcessor) {
    postProcessor.process(combinedResults, allEdges);
  }

  // Perform Phase Aggregation
  if (phaseAggregator) {
    Object.values(combinedResults).forEach(respondentData => {
      const aggregates = phaseAggregator.calculateAggregates(respondentData);
      Object.assign(respondentData, aggregates);
    });
  }

  // Convert combinedResults map to array
  const finalOutputArray = Object.values(combinedResults);

  // Write output array to JSON file using NetworkOutput
  if (networkOutput) {
    networkOutput.writeOutputFile(finalOutputArray, allEdges);
  }
};

readResponses();