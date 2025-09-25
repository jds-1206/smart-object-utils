/**
 * @fileoverview Smart Object Utils - Deep cloning and nested object manipulation library
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

// Import everything first
import {
  deepClone as _deepClone,
  cloneDeep as _cloneDeep,
  clone as _clone,
} from './core/deepClone.js';
import {
  updateNested as _updateNested,
  updateMultiple as _updateMultiple,
  deepMerge as _deepMerge,
} from './updates/index.js';
import { Types as _Types } from './core/types.js';
import { Utils as _Utils } from './core/utils.js';

/**
 * @typedef {Object} CloneOptions - Configuration options for cloning operations
 * @property {'auto'|'json'|'structured'|'recursive'} [strategy='auto'] - Cloning strategy to use
 * @property {number} [maxDepth=Infinity] - Maximum depth to clone
 * @property {number} [currentDepth=0] - Current recursion depth (internal use)
 */

/**
 * @typedef {Object} UpdateOptions - Configuration options for update operations
 * @property {boolean} [clone=true] - Whether to clone the source object before updating
 */

/**
 * @typedef {Object} MergeOptions - Configuration options for merge operations
 * @property {'replace'|'merge'} [arrayStrategy='replace'] - How to handle array merging
 */

/**
 * @typedef {string|string[]} PathType - Property path specification
 * @example
 * // String dot notation
 * 'user.profile.name'
 * 'database.connection.port'
 *
 * @example
 * // Array notation
 * ['user', 'profile', 'name']
 * ['database', 'connection', 'port']
 */

/**
 * Creates a deep copy of the given object using automatic strategy selection.
 * Automatically chooses the optimal cloning method based on the object structure
 * and runtime environment for maximum performance.
 *
 * @function deepClone
 * @template T
 * @param {T} obj - The object or value to clone
 * @param {CloneOptions} [options={}] - Configuration options
 * @returns {T} Deep cloned copy of the input
 *
 * @throws {Error} When unknown strategy is specified
 * @throws {Error} When object contains non-serializable values (JSON strategy)
 * @throws {Error} When structuredClone is not available (structured strategy)
 *
 * @example
 * // Basic usage
 * const original = { user: { name: 'John', settings: { theme: 'dark' } } };
 * const cloned = deepClone(original);
 * console.log(cloned !== original); // true
 * console.log(cloned.user !== original.user); // true
 *
 * @example
 * // With specific strategy
 * const fastClone = deepClone(complexObject, { strategy: 'json' });
 * const safeClone = deepClone(complexObject, { strategy: 'recursive' });
 *
 * @example
 * // With depth limit
 * const shallowClone = deepClone(deepObject, { maxDepth: 2 });
 *
 * @example
 * // Handling circular references
 * const circular = { a: 1 };
 * circular.self = circular;
 * const clonedCircular = deepClone(circular); // Works with auto/recursive strategy
 *
 * @since 1.0.0
 */
export const deepClone = _deepClone;

/**
 * Alias for deepClone with Lodash-compatible naming.
 * Provides seamless migration path from lodash.cloneDeep.
 *
 * @function cloneDeep
 * @template T
 * @param {T} obj - The object or value to clone
 * @param {CloneOptions} [options={}] - Configuration options
 * @returns {T} Deep cloned copy of the input
 *
 * @example
 * // Drop-in replacement for lodash.cloneDeep
 * import { cloneDeep } from 'smart-object-utils';
 * // vs
 * // import cloneDeep from 'lodash/cloneDeep';
 *
 * const cloned = cloneDeep(complexObject);
 *
 * @since 1.0.0
 * @see {@link deepClone} for full documentation
 */
export const cloneDeep = _cloneDeep;

/**
 * Alias for deepClone with shorter naming convention.
 * Same functionality as deepClone, optimized for convenience.
 *
 * @function clone
 * @template T
 * @param {T} obj - The object or value to clone
 * @param {CloneOptions} [options={}] - Configuration options
 * @returns {T} Deep cloned copy of the input
 *
 * @example
 * import { clone } from 'smart-object-utils';
 * const cloned = clone({ a: { b: 1 } });
 *
 * @since 1.0.0
 * @see {@link deepClone} for full documentation
 */
export const clone = _clone;

/**
 * Updates a nested property immutably, returning a new object.
 * Creates missing intermediate objects automatically and preserves
 * the original object structure.
 *
 * @function updateNested
 * @template T
 * @param {T} obj - Source object to update (must be an object)
 * @param {PathType} path - Property path to update (dot notation or array)
 * @param {*} value - New value to set at the specified path
 * @param {UpdateOptions} [options={}] - Configuration options
 * @returns {T} New object with the specified property updated
 *
 * @throws {TypeError} When obj is not an object
 * @throws {Error} When path is invalid or empty
 *
 * @example
 * // Basic nested update
 * const user = { profile: { name: 'John', age: 30 } };
 * const updated = updateNested(user, 'profile.name', 'Jane');
 * console.log(user.profile.name);    // 'John' (unchanged)
 * console.log(updated.profile.name); // 'Jane'
 *
 * @example
 * // Create missing paths
 * const config = {};
 * const withDatabase = updateNested(config, 'database.connection.host', 'localhost');
 * console.log(withDatabase); // { database: { connection: { host: 'localhost' } } }
 *
 * @example
 * // Array notation path
 * const pathAsArray = updateNested(user, ['profile', 'age'], 31);
 *
 * @example
 * // No-clone option (mutates original - use with caution)
 * const mutated = updateNested(user, 'profile.name', 'Bob', { clone: false });
 * console.log(user.profile.name); // 'Bob' (original was modified)
 *
 * @since 1.0.0
 */
export const updateNested = _updateNested;

/**
 * Updates multiple nested properties at once, immutably.
 * Performs batch updates efficiently while maintaining immutability.
 *
 * @function updateMultiple
 * @template T
 * @param {T} obj - Source object to update (must be an object)
 * @param {Record<string, *>} updates - Map of path-value pairs to update
 * @param {UpdateOptions} [options={}] - Configuration options
 * @returns {T} New object with all specified properties updated
 *
 * @throws {TypeError} When obj is not an object
 * @throws {TypeError} When updates is not an object
 * @throws {Error} When any path in updates is invalid
 *
 * @example
 * // Multiple updates in one operation
 * const appState = {
 *   user: { name: 'John', email: 'john@example.com' },
 *   settings: { theme: 'light', language: 'en' },
 *   config: { debug: false }
 * };
 *
 * const updated = updateMultiple(appState, {
 *   'user.name': 'Jane',
 *   'settings.theme': 'dark',
 *   'settings.notifications': true,
 *   'config.debug': true,
 *   'config.apiUrl': 'https://api.example.com'
 * });
 *
 * @example
 * // Batch configuration updates
 * const configUpdates = updateMultiple(serverConfig, {
 *   'database.connection.host': 'prod-db.com',
 *   'database.connection.ssl': true,
 *   'api.rateLimit.maxRequests': 1000,
 *   'logging.level': 'error'
 * });
 *
 * @example
 * // Redux-style state updates
 * function reducer(state, action) {
 *   switch (action.type) {
 *     case 'UPDATE_USER_PROFILE':
 *       return updateMultiple(state, {
 *         'user.profile.name': action.name,
 *         'user.profile.email': action.email,
 *         'user.lastUpdated': new Date(),
 *         'ui.hasUnsavedChanges': false
 *       });
 *   }
 * }
 *
 * @since 1.0.0
 */
export const updateMultiple = _updateMultiple;

/**
 * Deep merges two objects with configurable array handling strategy.
 * Recursively merges properties while preserving type safety and structure.
 *
 * @function deepMerge
 * @template T, U
 * @param {T} target - Target object to merge into
 * @param {U} source - Source object to merge from
 * @param {MergeOptions} [options={}] - Configuration options
 * @returns {T & U} New merged object combining properties from both inputs
 *
 * @throws {TypeError} When target or source is not an object
 *
 * @example
 * // Basic object merging
 * const target = { a: 1, b: { c: 2 } };
 * const source = { b: { d: 3 }, e: 4 };
 * const merged = deepMerge(target, source);
 * console.log(merged); // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 *
 * @example
 * // Array handling strategies
 * const config1 = { features: ['feature1', 'feature2'] };
 * const config2 = { features: ['feature3'] };
 *
 * // Replace arrays (default)
 * const replaced = deepMerge(config1, config2);
 * console.log(replaced.features); // ['feature3']
 *
 * // Merge arrays
 * const merged = deepMerge(config1, config2, { arrayStrategy: 'merge' });
 * console.log(merged.features); // ['feature1', 'feature2', 'feature3']
 *
 * @example
 * // Configuration management
 * const defaultConfig = {
 *   database: { host: 'localhost', pool: { min: 2, max: 10 } },
 *   features: ['feature1', 'feature2']
 * };
 *
 * const productionConfig = {
 *   database: { host: 'prod-db.com', pool: { max: 50 } },
 *   features: ['feature3']
 * };
 *
 * const final = deepMerge(defaultConfig, productionConfig, {
 *   arrayStrategy: 'merge'
 * });
 *
 * @since 1.0.0
 */
export const deepMerge = _deepMerge;

/**
 * Collection of type checking utilities for robust object handling.
 * Provides reliable type detection and validation functions.
 *
 * @namespace Types
 * @property {function} isObject - Check if value is a plain object
 * @property {function} isArray - Check if value is an array
 * @property {function} isDate - Check if value is a Date object
 * @property {function} isRegExp - Check if value is a RegExp object
 * @property {function} isFunction - Check if value is a function
 * @property {function} isPrimitive - Check if value is a primitive type
 * @property {function} isCircular - Check if object contains circular references
 *
 * @example
 * import { Types } from 'smart-object-utils';
 *
 * console.log(Types.isObject({})); // true
 * console.log(Types.isArray([])); // true
 * console.log(Types.isDate(new Date())); // true
 * console.log(Types.isPrimitive('string')); // true
 *
 * @since 1.0.0
 */
export const Types = _Types;

/**
 * Collection of utility functions for object manipulation and path operations.
 * Provides low-level utilities for working with nested object properties.
 *
 * @namespace Utils
 * @property {function} parsePath - Convert path string to array format
 * @property {function} hasPath - Check if object has the specified path
 * @property {function} getPath - Get value from object path with optional default
 * @property {function} setPath - Set value at object path (mutable)
 *
 * @example
 * import { Utils } from 'smart-object-utils';
 *
 * const obj = { a: { b: { c: 'value' } } };
 *
 * console.log(Utils.parsePath('a.b.c')); // ['a', 'b', 'c']
 * console.log(Utils.hasPath(obj, 'a.b.c')); // true
 * console.log(Utils.getPath(obj, 'a.b.c')); // 'value'
 * console.log(Utils.getPath(obj, 'a.b.d', 'default')); // 'default'
 *
 * @since 1.0.0
 */
export const Utils = _Utils;

// Export strategies for advanced users
export * from './strategies/index.js';

/**
 * Default export containing all utility functions in a single object.
 * Useful for CommonJS environments or when you want to import everything at once.
 *
 * @namespace SmartObjectUtils
 * @property {function} deepClone - Deep clone function
 * @property {function} cloneDeep - Lodash-compatible alias
 * @property {function} clone - Short alias for deepClone
 * @property {function} updateNested - Update nested property immutably
 * @property {function} updateMultiple - Update multiple nested properties
 * @property {function} deepMerge - Deep merge objects with array strategies
 * @property {Object} Types - Type checking utilities
 * @property {Object} Utils - Path manipulation utilities
 *
 * @example
 * // ES6 default import
 * import smartObjectUtils from 'smart-object-utils';
 * const cloned = smartObjectUtils.deepClone(myObject);
 *
 * @example
 * // CommonJS usage
 * const smartObjectUtils = require('smart-object-utils');
 * const { deepClone, updateNested } = smartObjectUtils;
 *
 * @since 1.0.0
 */
export default {
  deepClone: _deepClone,
  cloneDeep: _cloneDeep,
  clone: _clone,
  updateNested: _updateNested,
  updateMultiple: _updateMultiple,
  deepMerge: _deepMerge,
  Types: _Types,
  Utils: _Utils,
};
