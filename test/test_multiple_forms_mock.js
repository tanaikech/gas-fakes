import assert from 'node:assert';
import { NetworkOutput } from '../gasmess/bruce/bigger/indegree/src/NetworkOutput.js';

// Mock ResponseProcessor
class MockResponseProcessor {
  constructor(rules) {
    this.rules = rules;
  }
  calculateAndLogScores(values, texts) {
    // Simple mock: return a score based on inputs
    const scores = {};
    this.rules.forEach(rule => {
      if (rule.method === 'ab1234') {
        // Mock ID generation: assume input is 'q1.text'
        const inputId = rule.inputs[0].replace('.text', '');
        scores[rule.output] = texts[inputId];
      } else if (rule.method === 'sum') {
        scores[rule.output] = rule.inputs.reduce((acc, input) => acc + (values[input] || 0), 0);
      }
    });
    return scores;
  }
}

// Mock Data
const RULES = {
  processing: {
    scoring: [
      { method: 'ab1234', inputs: ['q_id.text'], output: 'respondent_id' },
      { method: 'sum', inputs: ['q_score'], output: 'total_score' }
    ]
  },
  network: {
    outputs: {
      vertices: ['respondent_id', 'total_score']
    }
  }
};

const FORMS_DATA = [
  {
    phase: 'pre',
    responses: [
      { id: '123', score: 10 }
    ]
  },
  {
    phase: 'post',
    responses: [
      { id: '123', score: 20 }
    ]
  }
];

console.log('Running Multiple Forms Processing and Merging Test...');

try {
  const processor = new MockResponseProcessor(RULES.processing.scoring);
  const networkOutput = new NetworkOutput(RULES.network.outputs.vertices);
  const idOutputName = 'respondent_id';

  const combinedResults = {};

  FORMS_DATA.forEach(formData => {
    const phase = formData.phase;

    formData.responses.forEach(resp => {
      // Mock submission data
      const submissionValues = { 'q_score': resp.score };
      const submissionTexts = { 'q_id': resp.id };

      const calculatedScores = processor.calculateAndLogScores(submissionValues, submissionTexts);

      // Verify ID generation
      assert.strictEqual(calculatedScores['respondent_id'], resp.id, `ID generated correctly for phase ${phase}`);

      const outputObject = networkOutput.buildOutputObject(submissionValues, submissionTexts, calculatedScores, phase, idOutputName);

      // Verify suffixing
      if (phase === 'pre') {
        assert.strictEqual(outputObject['total_score_pre'], 10, 'Score suffixed correctly for pre');
        assert.strictEqual(outputObject['respondent_id'], '123', 'ID not suffixed for pre');
        assert.strictEqual(outputObject['total_score'], undefined, 'Original score field should not exist if suffixed');
      } else {
        assert.strictEqual(outputObject['total_score_post'], 20, 'Score suffixed correctly for post');
        assert.strictEqual(outputObject['respondent_id'], '123', 'ID not suffixed for post');
      }

      // Merge
      const id = calculatedScores[idOutputName];
      if (!combinedResults[id]) {
        combinedResults[id] = {};
      }
      Object.assign(combinedResults[id], outputObject);
    });
  });

  // Verify Final Merged Result
  const finalResult = combinedResults['123'];
  assert.ok(finalResult, 'Final result exists for ID 123');
  assert.strictEqual(finalResult['respondent_id'], '123', 'ID present in final result');
  assert.strictEqual(finalResult['total_score_pre'], 10, 'Pre score present in final result');
  assert.strictEqual(finalResult['total_score_post'], 20, 'Post score present in final result');

  console.log('✅ All tests passed!');
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
