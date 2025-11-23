import { writeFileSync } from 'fs';

/**
 * NetworkOutput handles building output objects and writing JSON files.
 */
export class NetworkOutput {
  /**
   * @param {Array<string>} outputVertices - Array of field names from rulesObject.network.outputs.vertices
   */
  constructor(outputVertices = []) {
    this.outputVertices = outputVertices;
  }

  /**
   * Build an output object for a single respondent.
   * @param {Object} submissionValues - Map of questionId to numeric value
   * @param {Object} submissionTexts - Map of questionId to text response
   * @param {Object} calculatedScores - Map of output name to calculated score
   * @returns {Object} Output object with fields specified in outputVertices
   */
  buildOutputObject(submissionValues, submissionTexts, calculatedScores) {
    const outputObject = {};

    this.outputVertices.forEach(field => {
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

    return outputObject;
  }

  /**
   * Write output array to JSON file.
   * @param {Array<Object>} outputArray - Array of output objects
   * @param {string} filePath - Path to write JSON file
   */
  writeOutputFile(outputArray, filePath = 'responses_output.json') {
    if (outputArray.length > 0) {
      writeFileSync(filePath, JSON.stringify(outputArray, null, 2));
      console.log(`\n✅ JSON output written to ${filePath}`);
      console.log(`   Total respondents: ${outputArray.length}`);
      console.log(`   Fields per respondent: ${this.outputVertices.length}`);
    } else {
      console.log('\n⚠️  No output data to write');
    }
  }
}
