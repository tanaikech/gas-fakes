
/**
 * RulesValidator validates the structure and content of the rules object.
 */
export class RulesValidator {
  constructor() {
    this.allowedScoringMethods = ['sum', 'mean', 'max', 'min', 'ab1234'];
    this.allowedAggregationMethods = ['difference', 'sum', 'mean', 'max', 'min'];
  }

  /**
   * Validate the rules object.
   * @param {Object} rulesObject - The rules object to validate
   * @returns {Object} Result object { valid: boolean, errors: [], warnings: [] }
   */
  validate(rulesObject) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!rulesObject) {
      result.errors.push('Rules object is null or undefined.');
      result.valid = false;
      return result;
    }

    // 1. Structure Check
    if (!rulesObject.processing) {
      result.errors.push('Missing "processing" section.');
    } else {
      if (!rulesObject.processing.scoring) {
        result.errors.push('Missing "processing.scoring" section.');
      }
    }

    if (!rulesObject.network) {
      result.errors.push('Missing "network" section.');
    } else {
      if (!rulesObject.network.outputs) {
        result.errors.push('Missing "network.outputs" section.');
      } else if (!rulesObject.network.outputs.vertices) {
        result.errors.push('Missing "network.outputs.vertices" section.');
      }
    }

    // Track defined outputs to validate inputs later
    const definedOutputs = new Set();

    // 2. Validate Scoring Rules
    if (rulesObject.processing && rulesObject.processing.scoring) {
      if (!Array.isArray(rulesObject.processing.scoring)) {
        result.errors.push('"processing.scoring" must be an array.');
      } else {
        rulesObject.processing.scoring.forEach((rule, index) => {
          if (!rule.method) {
            result.errors.push(`Scoring rule #${index}: Missing "method".`);
          } else if (!this.allowedScoringMethods.includes(rule.method)) {
            result.errors.push(`Scoring rule #${index}: Unknown method "${rule.method}". Allowed: ${this.allowedScoringMethods.join(', ')}.`);
          }

          if (!rule.output) {
            result.errors.push(`Scoring rule #${index}: Missing "output".`);
          } else {
            definedOutputs.add(rule.output);
          }

          if (!rule.inputs || !Array.isArray(rule.inputs)) {
            result.errors.push(`Scoring rule #${index}: "inputs" must be an array.`);
          }
        });
      }
    }

    // 3. Validate Phase Aggregation Rules
    if (rulesObject.processing && rulesObject.processing.phaseAggregation) {
      if (!Array.isArray(rulesObject.processing.phaseAggregation)) {
        result.errors.push('"processing.phaseAggregation" must be an array.');
      } else {
        rulesObject.processing.phaseAggregation.forEach((rule, index) => {
          if (!rule.method) {
            result.errors.push(`Phase aggregation rule #${index}: Missing "method".`);
          } else if (!this.allowedAggregationMethods.includes(rule.method)) {
            result.errors.push(`Phase aggregation rule #${index}: Unknown method "${rule.method}". Allowed: ${this.allowedAggregationMethods.join(', ')}.`);
          }

          if (!rule.output) {
            result.errors.push(`Phase aggregation rule #${index}: Missing "output".`);
          } else {
            definedOutputs.add(rule.output);
          }

          if (!rule.inputs || !Array.isArray(rule.inputs)) {
            result.errors.push(`Phase aggregation rule #${index}: "inputs" must be an array.`);
          } else {
            // Check if inputs are known (optional warning)
            // Note: Inputs for phase aggregation are usually base names (without suffix), 
            // which might match scoring outputs or raw inputs.
            // We can check if they match any defined scoring output.
            rule.inputs.forEach(input => {
              // This is a loose check because inputs could be raw form fields which we don't track here.
              // So we won't error, maybe just debug log or ignore.
            });
          }
        });
      }
    }

    // 4. Validate Network Outputs
    if (rulesObject.network && rulesObject.network.outputs && rulesObject.network.outputs.vertices) {
      if (!Array.isArray(rulesObject.network.outputs.vertices)) {
        result.errors.push('"network.outputs.vertices" must be an array.');
      } else {
        rulesObject.network.outputs.vertices.forEach((vertex, index) => {
          // Check if vertex is a known output or raw input
          // Again, hard to validate raw inputs without form definition.
          // But we can check if it's a known output if we wanted to be strict.
          // For now, just ensuring it's a string.
          if (typeof vertex !== 'string') {
            result.errors.push(`Network output vertex #${index} must be a string.`);
          }
        });
      }
    }

    if (result.errors.length > 0) {
      result.valid = false;
    }

    return result;
  }
}
