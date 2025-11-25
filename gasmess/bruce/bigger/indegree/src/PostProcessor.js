/**
 * PostProcessor handles processing that occurs after all responses and edges have been generated.
 * It can calculate metrics based on the network structure (e.g., degrees) and enrich respondent data.
 */
export class PostProcessor {
  /**
   * @param {Array} postRules - Array of post-processing rule objects from rulesObject.processing.post
   * @param {Array} phases - Array of phase names (e.g., ['pre', 'post'])
   */
  constructor(postRules = [], phases = []) {
    this.postRules = postRules;
    this.phases = phases;
  }

  /**
   * Process all post rules and update respondent data in place.
   * @param {Object} combinedResults - Map of respondent ID to respondent data object
   * @param {Array} allEdges - Array of all edge objects
   */
  process(combinedResults, allEdges) {
    if (!this.postRules || this.postRules.length === 0) {
      return;
    }

    console.log('\n--- Performing Post-Processing ---');

    this.postRules.forEach(rule => {
      try {
        if (rule.type === 'edge' && rule.method === 'count') {
          this._processEdgeCount(rule, combinedResults, allEdges);
        } else {
          console.warn(`Unknown post-processing rule type/method: ${rule.type}/${rule.method}`);
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.output}: ${error.message}`);
      }
    });
  }

  /**
   * Process edge count rules (in_degree, out_degree, total_degree) per phase.
   * @private
   */
  _processEdgeCount(rule, combinedResults, allEdges) {
    const inputs = rule.inputs || [];
    const matchTo = rule.matchTo || [];
    const outputField = rule.output;

    if (!outputField) {
      console.warn('Post-processing rule missing output field');
      return;
    }

    // If no phases defined, calculate globally (backward compatibility)
    const phasesToProcess = this.phases.length > 0 ? this.phases : [null];

    phasesToProcess.forEach(phase => {
      const phaseSuffix = phase ? `_${phase}` : '';
      const phaseOutputField = `${outputField}${phaseSuffix}`;

      console.log(`  Calculating "${phaseOutputField}" (inputs: ${inputs.join(', ')}, matchTo: ${matchTo.join(', ')}${phase ? `, phase: ${phase}` : ''})`);

      // Filter edges by phase if specified
      const phaseEdges = phase
        ? allEdges.filter(edge => edge.phase === phase)
        : allEdges;

      // Filter edges based on inputs (edge_type)
      const relevantEdges = phaseEdges.filter(edge => {
        if (inputs.length > 0 && !inputs.includes(edge.edge_type)) {
          return false;
        }
        return true;
      });

      // Iterate over all respondents to calculate the metric for each
      Object.entries(combinedResults).forEach(([respondentId, respondentData]) => {
        let count = 0;

        // Count matches
        relevantEdges.forEach(edge => {
          // Check if respondent ID matches any of the fields specified in matchTo
          const isMatch = matchTo.some(fieldName => edge[fieldName] === respondentId);

          if (isMatch) {
            count++;
          }
        });

        // Update respondent data
        respondentData[phaseOutputField] = count;
      });
    });
  }
}
