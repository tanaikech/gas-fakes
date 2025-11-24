import { Exports } from './utils.js';

/**
 * EdgeProcessor handles extracting network edges from form responses.
 * Edges represent connections between respondents and roster members.
 */
export class EdgeProcessor {
  /**
   * @param {Object} edgeRules - Edge processing rules from rulesObject.processing.edges
   * @param {Array} roster - Roster data with members
   * @param {Object} itemMap - Mapping of question IDs to form items
   */
  constructor(edgeRules, roster, itemMap) {
    this.edgeRules = edgeRules || {};
    this.roster = roster;
    this.itemMap = itemMap;
  }

  /**
   * Process all configured edges for a single respondent.
   * @param {string} edgeName - Name of the edge type from rules
   * @param {Object} submissionValues - Map of questionId to numeric value
   * @param {Object} submissionTexts - Map of questionId to text response
   * @param {string} sourceId - ID of the source vertex (respondent)
   * @param {string} sourceName - Name of the source vertex (respondent)
   * @param {string} phase - Phase identifier (e.g., 'pre', 'post')
   * @returns {Array<Object>} Array of edge objects
   */
  processEdges(edgeName, submissionValues, submissionTexts, sourceId, sourceName, phase) {
    const rule = this.edgeRules[edgeName];
    if (!rule) {
      throw new Error(`Edge rule '${edgeName}' not found in processing.edges`);
    }

    const edges = [];

    switch (rule.method) {
      case 'checkbox_grid':
      case 'multiple_choice_grid':
        edges.push(...this._processGridEdges(rule, submissionValues, submissionTexts, sourceId, sourceName, phase, edgeName));
        break;
      default:
        throw new Error(`Unknown edge method: ${rule.method}`);
    }

    return edges;
  }

  /**
   * Process edges from checkbox grid or multiple choice grid responses.
   * Creates one edge per checked cell (only for cells with value === true for checkbox grids).
   * @private
   */
  _processGridEdges(rule, submissionValues, submissionTexts, sourceId, sourceName, phase, edgeName) {
    const edges = [];
    const inputQuestionId = rule.input;

    // Get the roster for this edge
    const rosterData = this.roster?.find(r => r.nameField === rule.rosterField);
    if (!rosterData || !rosterData.members) {
      console.warn(`Roster not found for field: ${rule.rosterField}`);
      return edges;
    }

    // Find all mapped items for this input question
    // For checkbox grids with a single question, there will be multiple mappings
    // (one per row), all with the same base question ID
    const allMappingKeys = Object.keys(this.itemMap.questions || {});
    console.log(`Looking for mappings for input: "${inputQuestionId}"`);
    console.log(`Available mapping keys: ${allMappingKeys.slice(0, 10).join(', ')}${allMappingKeys.length > 10 ? '...' : ''}`);

    const mappedItems = Object.entries(this.itemMap.questions || {})
      .filter(([mappedSourceId, mapping]) => {
        // Check if this mapping is for our input question
        // The sourceId might be exactly the input, or a composite like "closest_memberId"
        return mappedSourceId === inputQuestionId || mappedSourceId.startsWith(inputQuestionId + '_');
      })
      .map(([mappedSourceId, mapping]) => ({ mappedSourceId, ...mapping }));

    if (mappedItems.length === 0) {
      // Fallback: If no mappings found in itemMap, scan submissionValues for keys matching the pattern
      // This handles cases where mappings weren't saved or we're using dynamic row keys
      const pattern = new RegExp(`^${inputQuestionId}_(\\d+)$`);

      Object.keys(submissionValues).forEach(key => {
        const match = key.match(pattern);
        if (match) {
          const rowIndex = parseInt(match[1], 10);
          mappedItems.push({
            mappedSourceId: key,
            rowIndex: rowIndex,
            // We don't have labels from itemMap, but we can try to infer or skip attributes that need them
            labels: null
          });
        }
      });

      if (mappedItems.length === 0) {
        console.warn(`No mapped items found for edge input: ${inputQuestionId} (checked submissionValues too)`);
        return edges;
      }
    }

    // Process each mapped item (each row in the grid)
    mappedItems.forEach(mapping => {
      const { mappedSourceId, rowIndex } = mapping;

      if (rowIndex === undefined) {
        console.warn(`No rowIndex for mapped item: ${mappedSourceId}`);
        return;
      }

      // Get the roster member for this row
      let targetName = null;

      // Try to get name from submissionTexts first (populated by testresponses.js for dynamic rows)
      if (submissionTexts[mappedSourceId]) {
        targetName = submissionTexts[mappedSourceId];
      }
      // Fallback to roster lookup by index
      else if (rosterData.members[rowIndex]) {
        targetName = rosterData.members[rowIndex][rule.rosterField];
      }

      if (!targetName) {
        console.warn(`No name found for target at rowIndex ${rowIndex} (Source: ${mappedSourceId})`);
        return;
      }

      const targetId = this._generateIdFromName(targetName);

      // Skip self-loops
      if (sourceId === targetId) {
        return;
      }

      // Check if this cell was checked
      // For checkbox grids, the value should be true/false
      const cellValue = submissionValues[mappedSourceId];

      // Only create edge if the cell was checked (value === true)
      // Check if cell is checked (allow true, 1, or non-empty string)
      if (cellValue === true || cellValue === 'true' || cellValue === 1 || (typeof cellValue === 'string' && cellValue.length > 0)) {
        // Create edge record
        const edge = {
          source: sourceId,
          target: targetId,
          edge_type: edgeName,
          phase: phase
        };

        // Add optional attributes based on rule configuration
        if (rule.attributes) {
          // Source and target names
          if (rule.attributes.includes('source_name')) {
            edge.source_name = sourceName;
          }
          if (rule.attributes.includes('target_name')) {
            edge.target_name = targetName;
          }

          // Other metadata
          if (rule.attributes.includes('row_index')) {
            edge.row_index = rowIndex;
          }
          if (rule.attributes.includes('question_id')) {
            edge.question_id = inputQuestionId;
          }

          // Column value and text (following vertex pattern)
          if (mapping.labels) {
            const labelValues = Object.values(mapping.labels);
            const labelTexts = Object.keys(mapping.labels);

            if (rule.attributes.includes('column') && labelValues.length > 0) {
              edge.column = labelValues[0];
            }
            if (rule.attributes.includes('column.text') && labelTexts.length > 0) {
              edge['column.text'] = labelTexts[0];
            }
          } else if (typeof cellValue === 'string') {
            // Fallback: use the cell value itself as column.text if no labels mapping exists
            if (rule.attributes.includes('column.text')) {
              edge['column.text'] = cellValue;
            }
            // Also use it as column value if requested
            if (rule.attributes.includes('column')) {
              edge.column = cellValue;
            }
          }
        }

        edges.push(edge);
      }
    });

    return edges;
  }

  /**
   * Generate an ID from a name using the same ab1234 logic (abx function).
   * @private
   */
  _generateIdFromName(name) {
    return Exports.Utils.abx({ text: name });
  }
}
