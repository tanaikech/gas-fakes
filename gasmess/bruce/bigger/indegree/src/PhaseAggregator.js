
/**
 * PhaseAggregator handles aggregation of scores across multiple phases.
 */
export class PhaseAggregator {
  /**
   * @param {Array} aggregationRules - Array of aggregation rule objects
   * @param {Array<string>} phases - Array of phase names in order (e.g., ['pre', 'post'])
   */
  constructor(aggregationRules = [], phases = []) {
    this.aggregationRules = aggregationRules;
    this.phases = phases;
  }

  /**
   * Calculate aggregated scores for a single respondent.
   * @param {Object} respondentData - Object containing all data for the respondent, including suffixed keys
   * @returns {Object} Map of output name to aggregated score
   */
  calculateAggregates(respondentData) {
    const aggregates = {};

    this.aggregationRules.forEach(rule => {
      const method = rule.method;
      const inputs = rule.inputs;
      const output = rule.output;

      if (!inputs || inputs.length === 0) return;

      // Collect values for each input across all phases
      // For single input rules (like difference of 'happiness'), we look for 'happiness-pre', 'happiness-post'
      // For multi-input rules (like max of 'dep', 'anx'), we look for 'dep-pre', 'dep-post', 'anx-pre', 'anx-post'

      // However, the requirement description implies:
      // "inputs": ["happiness"] -> difference of happiness across phases
      // "inputs": ["depression", "anxiety"] -> max of these across phases? Or max of (dep, anx) within phase, then max across phases?
      // The example "max" with inputs ["depression", "anxiety"] likely means max of ANY of these values across ANY phase.

      let allValues = [];
      const valuesByPhase = {}; // phase -> { inputName -> value }

      this.phases.forEach(phase => {
        valuesByPhase[phase] = {};
        inputs.forEach(inputName => {
          const key = `${inputName}_${phase}`;
          const val = respondentData[key];
          if (val !== undefined && val !== null && !isNaN(val)) {
            const numVal = Number(val);
            allValues.push(numVal);
            valuesByPhase[phase][inputName] = numVal;
          }
        });
      });

      let result = null;

      switch (method) {
        case 'difference':
          // Difference in reverse phase order: p3 - p2 - p1
          // Only makes sense if there is 1 input variable, e.g. "happiness"
          // If multiple inputs, it's ambiguous. Assuming 1 input for difference.
          if (inputs.length === 1) {
            const inputName = inputs[0];
            let diff = 0;
            let first = true;

            // Iterate phases in reverse
            for (let i = this.phases.length - 1; i >= 0; i--) {
              const phase = this.phases[i];
              const val = valuesByPhase[phase][inputName];
              // Treat missing as 0 for difference as per plan
              const numVal = (val !== undefined) ? val : 0;

              if (first) {
                diff = numVal;
                first = false;
              } else {
                diff -= numVal;
              }
            }
            result = diff;
          }
          break;

        case 'sum':
          if (allValues.length > 0) {
            result = allValues.reduce((a, b) => a + b, 0);
          }
          break;

        case 'mean':
          if (allValues.length > 0) {
            result = allValues.reduce((a, b) => a + b, 0) / allValues.length;
          }
          break;

        case 'max':
          if (allValues.length > 0) {
            result = Math.max(...allValues);
          }
          break;

        case 'min':
          if (allValues.length > 0) {
            result = Math.min(...allValues);
          }
          break;

        default:
          console.warn(`Unknown aggregation method: ${method}`);
      }

      if (result !== null) {
        aggregates[output] = result;
      }
    });

    return aggregates;
  }
}
