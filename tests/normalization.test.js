// Test normalization function independently
const normalizeToArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

// Test cases
const testCases = [
  { input: ['React', 'TypeScript'], expected: ['React', 'TypeScript'] },
  { input: 'React, TypeScript, Node.js', expected: ['React', 'TypeScript', 'Node.js'] },
  { input: ' Angular , , TypeScript , ', expected: ['Angular', 'TypeScript'] },
  { input: '', expected: [] },
  { input: null, expected: [] },
  { input: undefined, expected: [] },
];

console.log('Testing normalization function...\n');

testCases.forEach((test, index) => {
  const result = normalizeToArray(test.input);
  const passed = JSON.stringify(result) === JSON.stringify(test.expected);
  
  console.log(`Test ${index + 1}: ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Input: ${JSON.stringify(test.input)}`);
  console.log(`  Expected: ${JSON.stringify(test.expected)}`);
  console.log(`  Got: ${JSON.stringify(result)}\n`);
});

console.log('Normalization function test completed!');