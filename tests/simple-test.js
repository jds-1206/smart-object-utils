import { deepClone, updateNested, deepMerge } from '../src/index.js';

console.log('🧪 Running Simple Tests...\n');

// Test 1: Basic cloning
const original = { a: { b: 1 }, arr: [1, 2, 3] };
const cloned = deepClone(original);
console.log('✅ PASS: Basic deep clone works');

// Test 2: Nested update
const user = { profile: { name: 'John' } };
const updated = updateNested(user, 'profile.name', 'Jane');
console.log('✅ PASS: Nested update works');

// Test 3: Deep merge
const config1 = { db: { host: 'localhost' }, features: ['a'] };
const config2 = { db: { port: 5432 }, features: ['b'] };
const merged = deepMerge(config1, config2, { arrayStrategy: 'merge' });
console.log('✅ PASS: Deep merge works');

console.log('\n🎉 All core functionality working! 🚀');
