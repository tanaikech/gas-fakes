
import assert from 'node:assert';
import { RulesValidator } from '../gasmess/bruce/bigger/indegree/src/RulesValidator.js';

console.log('Running RulesValidator Test...');

const validator = new RulesValidator();

// Test 1: Valid Rules Object
const validRules = {
  processing: {
    scoring: [
      { method: 'sum', inputs: ['q1'], output: 'score1' },
      { method: 'ab1234', inputs: ['q2'], output: 'id' }
    ],
    phaseAggregation: [
      { method: 'difference', inputs: ['score1'], output: 'score1_diff' }
    ]
  },
  network: {
    outputs: {
      vertices: ['id', 'score1', 'score1_diff']
    }
  }
};

const result1 = validator.validate(validRules);
assert.strictEqual(result1.valid, true, 'Valid rules should pass');
assert.strictEqual(result1.errors.length, 0, 'Valid rules should have no errors');
console.log('✅ Valid rules test passed');

// Test 2: Missing Sections
const invalidRules1 = {
  processing: {}
};
const result2 = validator.validate(invalidRules1);
assert.strictEqual(result2.valid, false, 'Missing sections should fail');
assert.ok(result2.errors.some(e => e.includes('Missing "processing.scoring"')), 'Should report missing scoring');
assert.ok(result2.errors.some(e => e.includes('Missing "network"')), 'Should report missing network');
console.log('✅ Missing sections test passed');

// Test 3: Invalid Method
const invalidRules2 = {
  processing: {
    scoring: [
      { method: 'invalid_method', inputs: ['q1'], output: 'score1' }
    ]
  },
  network: {
    outputs: {
      vertices: ['score1']
    }
  }
};
const result3 = validator.validate(invalidRules2);
assert.strictEqual(result3.valid, false, 'Invalid method should fail');
assert.ok(result3.errors.some(e => e.includes('Unknown method "invalid_method"')), 'Should report unknown method');
console.log('✅ Invalid method test passed');

console.log('✅ All RulesValidator tests passed!');
