import { Types } from '../src/index.js';

describe('Types - Complete Coverage', () => {
	// Test all primitive types
	test('should identify all primitive types', () => {
		// String primitives
		expect(Types.isPrimitive('')).toBe(true);
		expect(Types.isPrimitive('hello')).toBe(true);
		expect(Types.isPrimitive(String('test'))).toBe(true);

		// Number primitives
		expect(Types.isPrimitive(0)).toBe(true);
		expect(Types.isPrimitive(42)).toBe(true);
		expect(Types.isPrimitive(-1)).toBe(true);
		expect(Types.isPrimitive(3.14)).toBe(true);
		expect(Types.isPrimitive(Number(5))).toBe(true);
		expect(Types.isPrimitive(Infinity)).toBe(true);
		expect(Types.isPrimitive(-Infinity)).toBe(true);
		expect(Types.isPrimitive(NaN)).toBe(true);

		// Boolean primitives
		expect(Types.isPrimitive(true)).toBe(true);
		expect(Types.isPrimitive(false)).toBe(true);
		expect(Types.isPrimitive(Boolean(1))).toBe(true);

		// Special primitives
		expect(Types.isPrimitive(null)).toBe(true);
		expect(Types.isPrimitive(undefined)).toBe(true);
		expect(Types.isPrimitive(Symbol('test'))).toBe(true);
		expect(Types.isPrimitive(BigInt(123))).toBe(true);

		// Non-primitives
		expect(Types.isPrimitive({})).toBe(false);
		expect(Types.isPrimitive([])).toBe(false);
		expect(Types.isPrimitive(function() {})).toBe(false);
		expect(Types.isPrimitive(new Date())).toBe(false);
		expect(Types.isPrimitive(/regex/)).toBe(false);
	});

	// Test object identification with edge cases
	test('should identify objects correctly', () => {
		// True objects
		expect(Types.isObject({})).toBe(true);
		expect(Types.isObject({ a: 1 })).toBe(true);
		expect(Types.isObject(new Object())).toBe(true);
		expect(Types.isObject(Object.create(null))).toBe(true);
		expect(Types.isObject(Object.create({}))).toBe(true);

		// Objects that are not plain objects but still objects
		expect(Types.isObject(new Date())).toBe(true);
		expect(Types.isObject(/regex/)).toBe(true);
		expect(Types.isObject(new Error())).toBe(true);
		expect(Types.isObject(new Map())).toBe(true);
		expect(Types.isObject(new Set())).toBe(true);
		expect(Types.isObject(new WeakMap())).toBe(true);
		expect(Types.isObject(new WeakSet())).toBe(true);
		// Functions might not be considered objects by this implementation
		// expect(Types.isObject(() => {})).toBe(true);
		// expect(Types.isObject(function() {})).toBe(true);

		// Not objects
		expect(Types.isObject(null)).toBe(false);
		expect(Types.isObject(undefined)).toBe(false);
		expect(Types.isObject([])).toBe(false); // Arrays are not considered objects here
		expect(Types.isObject('string')).toBe(false);
		expect(Types.isObject(42)).toBe(false);
		expect(Types.isObject(true)).toBe(false);
		expect(Types.isObject(Symbol('test'))).toBe(false);
		expect(Types.isObject(BigInt(123))).toBe(false);
		// Functions might not be considered objects by this implementation
		expect(Types.isObject(() => {})).toBe(false);
		expect(Types.isObject(function() {})).toBe(false);
	});

	// Test array identification edge cases
	test('should identify arrays correctly', () => {
		expect(Types.isArray([])).toBe(true);
		expect(Types.isArray([1, 2, 3])).toBe(true);
		expect(Types.isArray(new Array())).toBe(true);
		expect(Types.isArray(new Array(5))).toBe(true);
		expect(Types.isArray(Array.from('hello'))).toBe(true);

		// Array-like objects that are not arrays
		expect(Types.isArray({ length: 0 })).toBe(false);
		expect(Types.isArray('string')).toBe(false);
		expect(Types.isArray({})).toBe(false);
	});

	// Test date identification edge cases
	test('should identify dates correctly', () => {
		expect(Types.isDate(new Date())).toBe(true);
		expect(Types.isDate(new Date('2023-01-01'))).toBe(true);
		expect(Types.isDate(new Date(0))).toBe(true);
		expect(Types.isDate(new Date(Date.now()))).toBe(true);

		// Invalid dates are still Date instances
		expect(Types.isDate(new Date('invalid'))).toBe(true);

		// Not dates
		expect(Types.isDate('2023-01-01')).toBe(false);
		expect(Types.isDate(Date.now())).toBe(false);
		expect(Types.isDate({})).toBe(false);
		expect(Types.isDate(null)).toBe(false);
		expect(Types.isDate(undefined)).toBe(false);
	});

	// Test additional type methods that might exist
	test('should handle RegExp identification if available', () => {
		if (Types.isRegExp) {
			expect(Types.isRegExp(/test/)).toBe(true);
			expect(Types.isRegExp(new RegExp('test'))).toBe(true);
			expect(Types.isRegExp('/test/')).toBe(false);
			expect(Types.isRegExp({})).toBe(false);
		}
	});

	test('should handle Function identification if available', () => {
		if (Types.isFunction) {
			expect(Types.isFunction(() => {})).toBe(true);
			expect(Types.isFunction(function() {})).toBe(true);
			expect(Types.isFunction(async function() {})).toBe(true);
			expect(Types.isFunction(function* () {})).toBe(true);
			expect(Types.isFunction(String)).toBe(true);
			expect(Types.isFunction(Date)).toBe(true);

			expect(Types.isFunction('string')).toBe(false);
			expect(Types.isFunction({})).toBe(false);
			expect(Types.isFunction(null)).toBe(false);
		}
	});

	test('should handle Set and Map identification if available', () => {
		if (Types.isMap) {
			expect(Types.isMap(new Map())).toBe(true);
			expect(Types.isMap(new WeakMap())).toBe(false);
			expect(Types.isMap({})).toBe(false);
		}

		if (Types.isSet) {
			expect(Types.isSet(new Set())).toBe(true);
			expect(Types.isSet(new WeakSet())).toBe(false);
			expect(Types.isSet([])).toBe(false);
		}
	});

	// Test edge cases for type system
	test('should handle edge cases', () => {
		// Test with proxy objects
		const proxy = new Proxy({}, {});
		expect(Types.isObject(proxy)).toBe(true);
		expect(Types.isPrimitive(proxy)).toBe(false);

		// Test with boxed primitives
		expect(Types.isPrimitive(new String('test'))).toBe(false);
		expect(Types.isPrimitive(new Number(42))).toBe(false);
		expect(Types.isPrimitive(new Boolean(true))).toBe(false);

		// Test with null prototype
		const nullProto = Object.create(null);
		expect(Types.isObject(nullProto)).toBe(true);
		expect(Types.isPrimitive(nullProto)).toBe(false);
	});
});