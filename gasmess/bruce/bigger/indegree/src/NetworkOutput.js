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
   * @param {string} [phase] - Optional phase suffix (e.g., 'pre', 'post')
   * @param {string} [idOutputName] - The output name that serves as the ID (should not be suffixed)
   * @returns {Object} Output object with fields specified in outputVertices
   */
  buildOutputObject(submissionValues, submissionTexts, calculatedScores, phase, idOutputName) {
    const outputObject = {};

    this.outputVertices.forEach(field => {
      let value;
      // Check if field ends with .text
      if (field.endsWith('.text')) {
        const baseField = field.slice(0, -5);
        if (submissionTexts[baseField] !== undefined) {
          value = submissionTexts[baseField];
        }
      } else if (calculatedScores[field] !== undefined) {
        // Use calculated score
        value = calculatedScores[field];
      } else if (submissionValues[field] !== undefined) {
        // Use original numeric value
        value = submissionValues[field];
      } else if (submissionTexts[field] !== undefined) {
        // Fallback to text value
        value = submissionTexts[field];
      }

      if (value !== undefined) {
        // Determine the key to use
        let key = field;
        if (phase && field !== idOutputName) {
          key = `${field}_${phase}`;
        }
        outputObject[key] = value;
      }
    });

    return outputObject;
  }

  /**
   * Write output to JSON file with combined vertices and edges.
   * @param {Array<Object>} vertices - Array of vertex objects
   * @param {Array<Object>} edges - Array of edge objects
   * @param {string} filePath - Path to write JSON file
   */
  writeOutputFile(vertices, edges = [], filePath = 'responses_output.json') {
    const output = {
      vertices: vertices,
      edges: edges
    };

    if (vertices.length > 0 || edges.length > 0) {
      writeFileSync(filePath, JSON.stringify(output, null, 2));
      console.log(`\n✅ JSON output written to ${filePath}`);
      console.log(`   Total vertices: ${vertices.length}`);
      console.log(`   Total edges: ${edges.length}`);
      if (vertices.length > 0) {
        console.log(`   Fields per vertex: ${this.outputVertices.length}`);
      }
    } else {
      console.log('\n⚠️  No output data to write');
    }
  }
}
