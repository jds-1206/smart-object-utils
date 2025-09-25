/**
 * @fileoverview Type checking utilities for robust object handling and validation
 * @module core/types
 * @version 1.0.0
 */

/**
 * Collection of type checking utilities for robust object handling.
 *
 * This module provides reliable type detection functions that go beyond JavaScript's
 * built-in typeof operator. These utilities are essential for the cloning system
 * to properly identify and handle different object types while avoiding common
 * JavaScript type checking pitfalls.
 *
 * **Why Custom Type Checking?**
 * - `typeof null === 'object'` (JavaScript quirk)
 * - `typeof [] === 'object'` (Arrays are objects but need special handling)
 * - `instanceof` checks can fail across different execution contexts
 * - Need reliable detection of circular references
 * - Performance-optimized checks for common operations
 *
 * @namespace Types
 * @example
 * import { Types } from 'smart-object-utils';
 *
 * // Reliable type checking
 * console.log(Types.isObject({}));           // true
 * console.log(Types.isObject([]));           // false (arrays are not plain objects)
 * console.log(Types.isObject(null));         // false (null is not an object)
 * console.log(Types.isArray([]));            // true
 * console.log(Types.isDate(new Date()));     // true
 * console.log(Types.isPrimitive('string'));  // true
 *
 * @since 1.0.0
 */
export const Types = {
  /**
   * Checks if a value is a plain object (not array, null, or other object types).
   *
   * This function distinguishes between plain objects `{}` and other object-like
   * values such as arrays, dates, or null. Essential for determining if a value
   * should be treated as a key-value container for cloning purposes.
   *
   * **Implementation Notes:**
   * - Explicitly checks for `null` (since `typeof null === 'object'`)
   * - Excludes arrays (since `typeof [] === 'object'`)
   * - Only returns true for plain objects and object instances
   *
   * @function isObject
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a plain object, false otherwise
   *
   * @example
   * // Plain objects
   * Types.isObject({});                    // true
   * Types.isObject({ key: 'value' });      // true
   * Types.isObject(new Object());          // true
   * Types.isObject(Object.create(null));   // true
   *
   * @example
   * // Non-objects (false cases)
   * Types.isObject([]);                    // false (array)
   * Types.isObject(null);                  // false (null)
   * Types.isObject(undefined);             // false (undefined)
   * Types.isObject('string');              // false (string)
   * Types.isObject(42);                    // false (number)
   * Types.isObject(new Date());            // false (Date object, not plain)
   * Types.isObject(/regex/);               // false (RegExp object)
   *
   * @example
   * // Usage in cloning logic
   * function shouldDeepCloneAsObject(value) {
   *   return Types.isObject(value) && !Types.isCircular(value);
   * }
   *
   * @since 1.0.0
   */
  isObject: (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value),

  /**
   * Checks if a value is an array.
   *
   * Reliable array detection using Array.isArray(), which is the recommended
   * approach and works correctly across different execution contexts unlike
   * instanceof checks.
   *
   * @function isArray
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is an array, false otherwise
   *
   * @example
   * // Arrays (true cases)
   * Types.isArray([]);                     // true
   * Types.isArray([1, 2, 3]);              // true
   * Types.isArray(new Array());            // true
   * Types.isArray(Array.from('abc'));      // true
   *
   * @example
   * // Non-arrays (false cases)
   * Types.isArray({});                     // false
   * Types.isArray('string');               // false
   * Types.isArray({ 0: 'a', 1: 'b', length: 2 }); // false (array-like but not array)
   * Types.isArray(arguments);              // false (Arguments object)
   *
   * @example
   * // Usage in cloning
   * if (Types.isArray(value)) {
   *   return value.map(item => deepClone(item));
   * }
   *
   * @since 1.0.0
   */
  isArray: (value) => Array.isArray(value),

  /**
   * Checks if a value is a Date object.
   *
   * Uses instanceof check to detect Date objects, which need special handling
   * during cloning to preserve their type and behavior.
   *
   * @function isDate
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a Date object, false otherwise
   *
   * @example
   * // Date objects (true cases)
   * Types.isDate(new Date());              // true
   * Types.isDate(new Date('2023-01-01'));  // true
   * Types.isDate(Date.now());              // false (number timestamp)
   *
   * @example
   * // Non-Date objects (false cases)
   * Types.isDate('2023-01-01');            // false (date string)
   * Types.isDate(1640995200000);           // false (timestamp number)
   * Types.isDate({});                      // false (plain object)
   *
   * @example
   * // Usage in cloning
   * if (Types.isDate(value)) {
   *   return new Date(value.getTime()); // Preserve date value
   * }
   *
   * @since 1.0.0
   */
  isDate: (value) => value instanceof Date,

  /**
   * Checks if a value is a RegExp object.
   *
   * Detects regular expression objects which require special cloning logic
   * to preserve their pattern and flags.
   *
   * @function isRegExp
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a RegExp object, false otherwise
   *
   * @example
   * // RegExp objects (true cases)
   * Types.isRegExp(/pattern/);             // true
   * Types.isRegExp(/pattern/gi);           // true
   * Types.isRegExp(new RegExp('pattern')); // true
   *
   * @example
   * // Non-RegExp values (false cases)
   * Types.isRegExp('/pattern/');           // false (string)
   * Types.isRegExp({});                    // false (plain object)
   *
   * @example
   * // Usage in cloning
   * if (Types.isRegExp(value)) {
   *   return new RegExp(value.source, value.flags); // Preserve pattern and flags
   * }
   *
   * @since 1.0.0
   */
  isRegExp: (value) => value instanceof RegExp,

  /**
   * Checks if a value is a function.
   *
   * Detects function values using typeof operator. Functions typically cannot
   * be cloned safely and may need special handling or exclusion from cloning.
   *
   * @function isFunction
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is a function, false otherwise
   *
   * @example
   * // Functions (true cases)
   * Types.isFunction(function() {});       // true
   * Types.isFunction(() => {});            // true
   * Types.isFunction(async function() {}); // true
   * Types.isFunction(Math.max);            // true
   * Types.isFunction(console.log);         // true
   *
   * @example
   * // Non-functions (false cases)
   * Types.isFunction({});                  // false
   * Types.isFunction('function');          // false
   * Types.isFunction(null);                // false
   *
   * @example
   * // Usage in cloning (functions usually skipped or cause errors)
   * if (Types.isFunction(value)) {
   *   console.warn('Functions cannot be reliably cloned');
   *   return undefined; // or throw error
   * }
   *
   * @since 1.0.0
   */
  isFunction: (value) => typeof value === 'function',

  /**
   * Checks if a value is a primitive type.
   *
   * Identifies primitive values (string, number, boolean, null, undefined, symbol, bigint)
   * that don't need deep cloning since they are immutable by nature.
   * This is a key optimization in the cloning process.
   *
   * **Primitive Types in JavaScript:**
   * - `string` - Text values
   * - `number` - Numeric values (including NaN, Infinity)
   * - `boolean` - true/false values
   * - `undefined` - Undefined value
   * - `null` - Null value (special case: typeof null === 'object')
   * - `symbol` - Unique identifiers (ES6+)
   * - `bigint` - Large integers (ES2020+)
   *
   * @function isPrimitive
   * @memberof Types
   * @param {*} value - The value to check
   * @returns {boolean} True if value is primitive, false otherwise
   *
   * @example
   * // Primitive values (true cases)
   * Types.isPrimitive('string');           // true
   * Types.isPrimitive(42);                 // true
   * Types.isPrimitive(true);               // true
   * Types.isPrimitive(false);              // true
   * Types.isPrimitive(null);               // true
   * Types.isPrimitive(undefined);          // true
   * Types.isPrimitive(Symbol('id'));       // true
   * Types.isPrimitive(BigInt(123));        // true
   * Types.isPrimitive(NaN);                // true
   * Types.isPrimitive(Infinity);           // true
   *
   * @example
   * // Non-primitive values (false cases)
   * Types.isPrimitive({});                 // false (object)
   * Types.isPrimitive([]);                 // false (array/object)
   * Types.isPrimitive(function() {});      // false (function)
   * Types.isPrimitive(new Date());         // false (Date object)
   * Types.isPrimitive(/regex/);            // false (RegExp object)
   *
   * @example
   * // Usage in cloning optimization
   * function optimizedClone(value) {
   *   if (Types.isPrimitive(value)) {
   *     return value; // No cloning needed for immutable primitives
   *   }
   *   return performDeepClone(value);
   * }
   *
   * @since 1.0.0
   */
  isPrimitive: (value) => {
    const type = typeof value;
    return value == null || (type !== 'object' && type !== 'function');
  },

  /**
   * Checks if an object contains circular references.
   *
   * Detects circular references in object structures to prevent infinite recursion
   * during cloning operations. Uses WeakSet for efficient tracking of visited objects
   * without creating memory leaks.
   *
   * **Algorithm:**
   * 1. Maintain a WeakSet of visited objects during traversal
   * 2. For each object property, check if it's already in the visited set
   * 3. If found, return true (circular reference detected)
   * 4. If not found, add to set and recursively check nested properties
   * 5. WeakSet automatically handles garbage collection
   *
   * **Performance Notes:**
   * - WeakSet lookup is O(1) average case
   * - Memory efficient - no strong references to objects
   * - Recursive traversal is O(n) where n is total properties
   *
   * @function isCircular
   * @memberof Types
   * @param {*} obj - The object to check for circular references
   * @param {WeakSet} [seen=new WeakSet()] - Set of already visited objects (internal)
   * @returns {boolean} True if circular references found, false otherwise
   *
   * @example
   * // Objects without circular references (false cases)
   * Types.isCircular({});                          // false
   * Types.isCircular({ a: 1, b: { c: 2 } });       // false
   * Types.isCircular([1, 2, [3, 4]]);              // false
   *
   * @example
   * // Objects with circular references (true cases)
   * const circular = { name: 'parent' };
   * circular.self = circular;
   * Types.isCircular(circular);                     // true
   *
   * const parent = { name: 'parent', children: [] };
   * const child = { name: 'child', parent: parent };
   * parent.children.push(child);
   * Types.isCircular(parent);                       // true
   *
   * @example
   * // Complex circular structure
   * const nodeA = { id: 'A', connections: [] };
   * const nodeB = { id: 'B', connections: [] };
   * const nodeC = { id: 'C', connections: [] };
   *
   * nodeA.connections.push(nodeB);
   * nodeB.connections.push(nodeC);
   * nodeC.connections.push(nodeA); // Creates cycle: A -> B -> C -> A
   *
   * Types.isCircular(nodeA);                        // true
   *
   * @example
   * // Usage in cloning safety check
   * function safeClone(obj) {
   *   if (Types.isCircular(obj)) {
   *     console.warn('Circular reference detected, using specialized cloning');
   *     return recursiveCloneWithCircularHandling(obj);
   *   }
   *   return standardClone(obj);
   * }
   *
   * @example
   * // Non-objects always return false
   * Types.isCircular('string');                     // false
   * Types.isCircular(42);                           // false
   * Types.isCircular(null);                         // false
   *
   * @since 1.0.0
   */
  isCircular: (obj, seen = new WeakSet()) => {
    // Only objects can have circular references
    if (obj && typeof obj === 'object') {
      // Check if we've seen this object before
      if (seen.has(obj)) return true;

      // Add current object to visited set
      seen.add(obj);

      // Recursively check all properties
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && Types.isCircular(obj[key], seen)) {
          return true;
        }
      }
    }
    return false;
  },
};
