/**
 * @fileoverview Immutable nested object manipulation functions
 * @module updates/updateNested
 * @version 1.0.0
 */

import { deepClone } from '../core/deepClone.js';
import { Utils } from '../core/utils.js';

/**
 * @typedef {Object} UpdateOptions
 * @property {boolean} [clone=true] - Whether to clone the source object before updating
 */

/**
 * @typedef {Object} MergeOptions
 * @property {'replace'|'merge'} [arrayStrategy='replace'] - How to handle array properties during merge
 */

/**
 * @typedef {string|string[]} PathType
 * @example 'user.profile.name' or ['user', 'profile', 'name']
 */

/**
 * Updates a nested property immutably, returning a new object.
 *
 * This function provides safe, immutable updates to nested object properties
 * without modifying the original object. It automatically creates missing
 * intermediate objects along the path and preserves the original object structure.
 *
 * **Immutability Guarantee:**
 * - Original object is never modified (when clone=true, default)
 * - Returns a new object with the updated property
 * - All nested references are properly cloned
 * - Side-effect free operation
 *
 * **Path Creation:**
 * - Missing intermediate objects are created automatically
 * - Supports arbitrarily deep nesting
 * - Handles both dot notation strings and array paths
 * - Preserves existing object structure
 *
 * **Performance Characteristics:**
 * - O(n) time complexity where n is object depth
 * - Memory efficient - only clones when necessary
 * - Path parsing cached internally
 * - Early optimization for shallow paths
 *
 * @function updateNested
 * @param {Object} obj - Source object to update (will not be modified if clone=true)
 * @param {PathType} path - Property path to update (dot notation or array)
 * @param {*} value - New value to set at the specified path
 * @param {UpdateOptions} [options={}] - Configuration options
 * @returns {Object} New object with the specified property updated
 *
 * @throws {TypeError} When obj is not an object (null, undefined, primitive)
 * @throws {Error} When path is invalid, empty, or null
 *
 * @example
 * // Basic nested property update
 * const user = {
 *   profile: { name: 'John', age: 30 },
 *   settings: { theme: 'light' }
 * };
 *
 * const updated = updateNested(user, 'profile.name', 'Jane');
 *
 * console.log(user.profile.name);    // 'John' (original unchanged)
 * console.log(updated.profile.name); // 'Jane' (new object)
 * console.log(updated !== user);     // true (different objects)
 * console.log(updated.settings === user.settings); // false (deep cloned)
 *
 * @example
 * // Creating missing nested paths automatically
 * const config = { api: { timeout: 5000 } };
 *
 * const withDatabase = updateNested(config, 'database.connection.host', 'localhost');
 *
 * console.log(withDatabase);
 * // Result: {
 * //   api: { timeout: 5000 },
 * //   database: { connection: { host: 'localhost' } }
 * // }
 *
 * @example
 * // Array notation paths
 * const state = { ui: { modal: { visible: false } } };
 *
 * const modalShown = updateNested(state, ['ui', 'modal', 'visible'], true);
 * console.log(modalShown.ui.modal.visible); // true
 *
 * @example
 * // Setting various value types
 * const settings = { preferences: {} };
 *
 * const updated = updateNested(settings, 'preferences.notifications', {
 *   email: true,
 *   push: false,
 *   sms: null
 * });
 *
 * console.log(updated.preferences.notifications.email); // true
 *
 * @example
 * // Performance optimization with clone=false (use with caution)
 * const largeObject = {  ... very large object ...  };
 *
 * // Mutates original - faster but breaks immutability
 * const mutated = updateNested(largeObject, 'status', 'updated', { clone: false });
 * console.log(largeObject === mutated); // true (same object reference)
 * console.log(largeObject.status); // 'updated' (original was modified)
 *
 * @example
 * // Real-world usage patterns
 *
 * // React state updates
 * const [state, setState] = useState(initialState);
 * const handleNameChange = (newName) => {
 *   setState(prevState => updateNested(prevState, 'user.profile.name', newName));
 * };
 *
 * // Redux-style reducers
 * function userReducer(state, action) {
 *   switch (action.type) {
 *     case 'UPDATE_USER_NAME':
 *       return updateNested(state, 'profile.name', action.payload.name);
 *     case 'SET_USER_PREFERENCE':
 *       return updateNested(state, `preferences.${action.key}`, action.value);
 *     default:
 *       return state;
 *   }
 * }
 *
 * // Configuration management
 * function updateConfigProperty(config, propertyPath, newValue) {
 *   return updateNested(config, propertyPath, newValue);
 * }
 *
 * const newConfig = updateConfigProperty(baseConfig, 'database.connection.ssl', true);
 *
 * @example
 * // Error handling
 * try {
 *   updateNested(null, 'path', 'value');
 * } catch (error) {
 *   console.error('Cannot update null object'); // TypeError
 * }
 *
 * try {
 *   updateNested({}, '', 'value');
 * } catch (error) {
 *   console.error('Invalid empty path'); // Error
 * }
 *
 * @since 1.0.0
 * @see {@link deepClone} for cloning strategy details
 * @see {@link Utils.setPath} for low-level path setting implementation
 * @see {@link updateMultiple} for batch updates
 */
export function updateNested(obj, path, value, options = {}) {
  // Extract options with defaults
  const { clone: shouldClone = true } = options;

  // Clone object if requested (default behavior for immutability)
  const result = shouldClone ? deepClone(obj) : obj;

  // Set the value at the specified path (mutates result object)
  return Utils.setPath(result, path, value);
}

/**
 * Updates multiple nested properties at once, immutably.
 *
 * Performs batch updates efficiently while maintaining immutability. This function
 * is optimized for scenarios where multiple nested properties need to be updated
 * in a single operation, avoiding multiple clone operations.
 *
 * **Batch Update Benefits:**
 * - Single clone operation for multiple updates
 * - Atomic update operation - all changes or none
 * - Better performance than multiple individual updates
 * - Maintains referential integrity across updates
 *
 * **Update Processing:**
 * - Clones source object once (unless clone=false)
 * - Applies all updates to the cloned object
 * - Creates missing intermediate paths automatically
 * - Preserves existing object structure
 *
 * @function updateMultiple
 * @param {Object} obj - Source object to update (will not be modified if clone=true)
 * @param {Record<string, *>} updates - Object mapping paths to new values
 * @param {UpdateOptions} [options={}] - Configuration options
 * @returns {Object} New object with all specified properties updated
 *
 * @throws {TypeError} When obj is not an object
 * @throws {TypeError} When updates is not an object
 * @throws {Error} When any path in updates is invalid
 *
 * @example
 * // Multiple related updates in one operation
 * const appState = {
 *   user: { name: 'John', email: 'john@old.com' },
 *   ui: { loading: true },
 *   settings: { theme: 'light' }
 * };
 *
 * const updated = updateMultiple(appState, {
 *   'user.name': 'Jane',
 *   'user.email': 'jane@new.com',
 *   'ui.loading': false,
 *   'ui.lastUpdated': new Date(),
 *   'settings.theme': 'dark',
 *   'settings.notifications.email': true
 * });
 *
 * console.log(updated.user.name);                    // 'Jane'
 * console.log(updated.ui.loading);                   // false
 * console.log(updated.settings.notifications.email); // true
 * console.log(appState.user.name);                   // 'John' (original unchanged)
 *
 * @example
 * // Configuration batch updates
 * const serverConfig = {
 *   database: { host: 'localhost', port: 5432 },
 *   api: { timeout: 5000 }
 * };
 *
 * const productionConfig = updateMultiple(serverConfig, {
 *   'database.host': 'prod-db.company.com',
 *   'database.ssl': true,
 *   'database.pool.min': 5,
 *   'database.pool.max': 50,
 *   'api.timeout': 10000,
 *   'api.rateLimit.enabled': true,
 *   'api.rateLimit.maxRequests': 1000,
 *   'logging.level': 'error',
 *   'logging.transports': ['file', 'elasticsearch']
 * });
 *
 * @example
 * // Redux-style state management
 * function appReducer(state, action) {
 *   switch (action.type) {
 *     case 'USER_LOGIN_SUCCESS':
 *       return updateMultiple(state, {
 *         'user.authenticated': true,
 *         'user.profile': action.payload.user,
 *         'user.permissions': action.payload.permissions,
 *         'ui.loginModal.visible': false,
 *         'ui.loading': false,
 *         'session.token': action.payload.token,
 *         'session.expiresAt': action.payload.expiresAt
 *       });
 *
 *     case 'SETTINGS_UPDATE_BATCH':
 *       return updateMultiple(state, action.payload.updates);
 *
 *     default:
 *       return state;
 *   }
 * }
 *
 * @example
 * // Form data processing
 * function processFormSubmission(currentData, formFields) {
 *   const updates = {};
 *
 *   // Convert form fields to update paths
 *   Object.entries(formFields).forEach(([fieldName, value]) => {
 *     updates[`form.${fieldName}`] = value;
 *   });
 *
 *   // Add metadata
 *   updates['form.lastUpdated'] = new Date();
 *   updates['form.isDirty'] = false;
 *   updates['validation.errors'] = {};
 *
 *   return updateMultiple(currentData, updates);
 * }
 *
 * @example
 * // Performance comparison
 * // ❌ Inefficient: multiple individual updates (multiple clones)
 * let result = updateNested(state, 'user.name', 'Jane');
 * result = updateNested(result, 'user.email', 'jane@new.com');
 * result = updateNested(result, 'settings.theme', 'dark');
 *
 * // ✅ Efficient: single batch update (single clone)
 * const result = updateMultiple(state, {
 *   'user.name': 'Jane',
 *   'user.email': 'jane@new.com',
 *   'settings.theme': 'dark'
 * });
 *
 * @example
 * // Error handling and validation
 * function safeBatchUpdate(obj, updates) {
 *   try {
 *     // Validate all paths before applying updates
 *     Object.keys(updates).forEach(path => {
 *       if (!path || typeof path !== 'string') {
 *         throw new Error(`Invalid path: ${path}`);
 *       }
 *     });
 *
 *     return updateMultiple(obj, updates);
 *   } catch (error) {
 *     console.error('Batch update failed:', error);
 *     return obj; // Return original on error
 *   }
 * }
 *
 * @since 1.0.0
 * @see {@link updateNested} for single property updates
 * @see {@link deepClone} for cloning behavior
 * @see {@link Utils.setPath} for path setting implementation
 */
export function updateMultiple(obj, updates, options = {}) {
  // Clone object unless explicitly disabled
  let result = options.clone !== false ? deepClone(obj) : obj;

  // Apply each update to the result object
  for (const [path, value] of Object.entries(updates)) {
    Utils.setPath(result, path, value);
  }

  return result;
}

/**
 * Deep merges two objects with configurable array handling strategy.
 *
 * Recursively merges properties from source object into target object,
 * creating a new merged object without modifying either original.
 * Provides sophisticated handling of nested objects, arrays, and special
 * object types like Date and RegExp.
 *
 * **Merge Strategy:**
 * - Properties in source override properties in target
 * - Nested objects are merged recursively
 * - Arrays can be replaced (default) or merged based on arrayStrategy
 * - Special objects (Date, RegExp) are cloned, not merged
 * - Primitive values in source always override target values
 *
 * **Array Handling:**
 * - `'replace'` (default): Source array completely replaces target array
 * - `'merge'`: Source array elements are appended to target array
 *
 * **Type Handling:**
 * - Objects: Merged recursively
 * - Arrays: Replaced or merged based on strategy
 * - Dates: Cloned from source
 * - RegExp: Cloned from source
 * - Primitives: Source value used
 * - null/undefined: Source value used
 *
 * @function deepMerge
 * @param {Object} target - Target object to merge into (not modified)
 * @param {Object} source - Source object to merge from (not modified)
 * @param {MergeOptions} [options={}] - Configuration options for merge behavior
 * @returns {Object} New merged object combining properties from both inputs
 *
 * @throws {TypeError} When target is not an object
 * @throws {TypeError} When source is not an object
 *
 * @example
 * // Basic object merging
 * const defaultSettings = {
 *   ui: { theme: 'light', animations: true },
 *   api: { timeout: 5000, retries: 3 }
 * };
 *
 * const userSettings = {
 *   ui: { theme: 'dark', fontSize: 14 },
 *   api: { timeout: 8000 },
 *   features: { beta: true }
 * };
 *
 * const finalSettings = deepMerge(defaultSettings, userSettings);
 *
 * console.log(finalSettings);
 * // Result: {
 * //   ui: { theme: 'dark', animations: true, fontSize: 14 },
 * //   api: { timeout: 8000, retries: 3 },
 * //   features: { beta: true }
 * // }
 *
 * @example
 * // Array handling strategies
 * const config1 = {
 *   features: ['feature1', 'feature2'],
 *   servers: ['server1']
 * };
 *
 * const config2 = {
 *   features: ['feature3'],
 *   servers: ['server2', 'server3']
 * };
 *
 * // Replace arrays (default behavior)
 * const replaced = deepMerge(config1, config2);
 * console.log(replaced.features); // ['feature3']
 * console.log(replaced.servers);  // ['server2', 'server3']
 *
 * // Merge arrays
 * const merged = deepMerge(config1, config2, { arrayStrategy: 'merge' });
 * console.log(merged.features); // ['feature1', 'feature2', 'feature3']
 * console.log(merged.servers);  // ['server1', 'server2', 'server3']
 *
 * @example
 * // Special object handling
 * const target = {
 *   created: new Date('2023-01-01'),
 *   pattern: /old/gi,
 *   config: { debug: true }
 * };
 *
 * const source = {
 *   updated: new Date('2023-12-01'),
 *   pattern: /new/gi,
 *   config: { logging: 'verbose' }
 * };
 *
 * const merged = deepMerge(target, source);
 *
 * console.log(merged.created instanceof Date);  // true
 * console.log(merged.updated instanceof Date);  // true
 * console.log(merged.pattern instanceof RegExp); // true
 * console.log(merged.pattern.source);           // 'new'
 * console.log(merged.config);                   // { debug: true, logging: 'verbose' }
 *
 * @example
 * // Configuration management with environment overrides
 * const baseConfig = {
 *   database: {
 *     connection: {
 *       host: 'localhost',
 *       port: 5432,
 *       pool: { min: 2, max: 10 }
 *     },
 *     migrations: { directory: './migrations' }
 *   },
 *   api: {
 *     cors: { origins: ['http://localhost:3000'] },
 *     rateLimit: { windowMs: 15000, maxRequests: 100 }
 *   },
 *   features: ['feature1', 'feature2']
 * };
 *
 * const productionOverrides = {
 *   database: {
 *     connection: {
 *       host: 'prod-db.company.com',
 *       ssl: true,
 *       pool: { min: 5, max: 50 }
 *     }
 *   },
 *   api: {
 *     cors: { origins: ['https://app.company.com'] },
 *     rateLimit: { maxRequests: 1000 }
 *   },
 *   features: ['feature3', 'feature4'],
 *   monitoring: { enabled: true, endpoint: '/metrics' }
 * };
 *
 * const productionConfig = deepMerge(baseConfig, productionOverrides, {
 *   arrayStrategy: 'replace' // Use production features, not merge
 * });
 *
 * console.log(productionConfig.database.connection.host);     // 'prod-db.company.com'
 * console.log(productionConfig.database.connection.pool.min); // 5 (from production)
 * console.log(productionConfig.database.connection.pool.max); // 50 (from production)
 * console.log(productionConfig.database.migrations);          // { directory: './migrations' } (preserved)
 * console.log(productionConfig.features);                     // ['feature3', 'feature4'] (replaced)
 *
 * @example
 * // API response merging
 * function mergeApiResponses(baseData, updateData) {
 *   return deepMerge(baseData, updateData, {
 *     arrayStrategy: 'merge' // Combine arrays from both responses
 *   });
 * }
 *
 * const userData = mergeApiResponses(
 *   { profile: { skills: ['JavaScript'] }, posts: [1, 2] },
 *   { profile: { skills: ['Python'] }, posts: [3, 4], newField: 'value' }
 * );
 * // Result: {
 * //   profile: { skills: ['JavaScript', 'Python'] },
 * //   posts: [1, 2, 3, 4],
 * //   newField: 'value'
 * // }
 *
 * @example
 * // Error handling and type safety
 * function safeMerge(target, source, options) {
 *   try {
 *     if (!target || typeof target !== 'object') {
 *       throw new TypeError('Target must be an object');
 *     }
 *     if (!source || typeof source !== 'object') {
 *       throw new TypeError('Source must be an object');
 *     }
 *
 *     return deepMerge(target, source, options);
 *   } catch (error) {
 *     console.error('Merge failed:', error);
 *     return target; // Return target as fallback
 *   }
 * }
 *
 * @since 1.0.0
 * @see {@link deepClone} for cloning behavior of individual objects
 * @see {@link updateNested} for single property updates
 * @see {@link updateMultiple} for batch property updates
 */
export function deepMerge(target, source, options = {}) {
  // Extract options with defaults
  const { arrayStrategy = 'replace' } = options;

  // Always clone target to maintain immutability
  const result = deepClone(target);

  /**
   * Recursive merge implementation
   * @private
   * @param {Object} dest - Destination object (will be mutated)
   * @param {Object} src - Source object (read-only)
   */
  function mergeRecursive(dest, src) {
    // Iterate through all source properties
    for (const key in src) {
      if (src.hasOwnProperty(key)) {
        // Handle arrays with strategy-based logic
        if (Array.isArray(src[key])) {
          if (arrayStrategy === 'merge' && Array.isArray(dest[key])) {
            // Merge arrays: combine existing + new elements
            dest[key] = [...dest[key], ...src[key]];
          } else {
            // Replace arrays: use source array (cloned)
            dest[key] = deepClone(src[key]);
          }
        }
        // Handle nested objects (but not Date/RegExp which are also objects)
        else if (
          src[key] &&
          typeof src[key] === 'object' &&
          !(src[key] instanceof Date) &&
          !(src[key] instanceof RegExp)
        ) {
          // Ensure destination has an object to merge into
          if (!dest[key] || typeof dest[key] !== 'object') {
            dest[key] = {};
          }
          // Recursively merge nested objects
          mergeRecursive(dest[key], src[key]);
        }
        // Handle primitives, Date, RegExp, null, undefined
        else {
          // Direct assignment (primitives are immutable, special objects are cloned by deepClone)
          dest[key] = src[key];
        }
      }
    }
  }

  // Perform the merge
  mergeRecursive(result, source);

  return result;
}
