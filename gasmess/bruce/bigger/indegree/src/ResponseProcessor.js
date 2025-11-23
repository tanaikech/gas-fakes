import { Exports } from './utils.js';

/**
 * ResponseProcessor handles scoring calculations based on processing rules.
 */
export class ResponseProcessor {
  /**
   * @param {Array} scoringRules - Array of scoring rule objects from rulesObject.processing.scoring
   */
  constructor(scoringRules = []) {
    this.scoringRules = scoringRules;
  }

  /**
   * Calculate a score based on the specified method and input values.
   * @param {string} method - The aggregation method (sum, mean, max, min, ab1234)
   * @param {string[]} inputs - Array of question IDs to aggregate (may have .text suffix)
   * @param {Object} valuesMap - Map of questionId to numeric value
   * @param {Object} textsMap - Map of questionId to text response
   * @returns {number|string|null} The calculated score, or null if calculation fails
   */
  calculateScore(method, inputs, valuesMap, textsMap) {
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
  }

  /**
   * Calculate all scores for a submission based on the scoring rules.
   * @param {Object} submissionValues - Map of questionId to numeric value
   * @param {Object} submissionTexts - Map of questionId to text response
   * @returns {Object} Map of output name to calculated score
   */
  calculateScores(submissionValues, submissionTexts) {
    const calculatedScores = {};

    this.scoringRules.forEach(rule => {
      const score = this.calculateScore(rule.method, rule.inputs, submissionValues, submissionTexts);
      if (score !== null) {
        calculatedScores[rule.output] = score;
      }
    });

    return calculatedScores;
  }

  /**
   * Calculate and log scores for a submission.
   * @param {Object} submissionValues - Map of questionId to numeric value
   * @param {Object} submissionTexts - Map of questionId to text response
   * @returns {Object} Map of output name to calculated score
   */
  calculateAndLogScores(submissionValues, submissionTexts) {
    const calculatedScores = this.calculateScores(submissionValues, submissionTexts);

    if (this.scoringRules.length > 0) {
      console.log('\n  --- Calculated Scores ---');
      this.scoringRules.forEach(rule => {
        if (calculatedScores[rule.output] !== undefined) {
          console.log(`  ${rule.output}: ${calculatedScores[rule.output]} (method: ${rule.method})`);
        } else {
          console.log(`  ${rule.output}: Unable to calculate (insufficient data)`);
        }
      });
    }

    return calculatedScores;
  }
}
