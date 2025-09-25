/**
 * @fileoverview Utility functions for object manipulation and path-based operations
 * @module core/utils
 * @version 1.0.0
 */

/**
 * @typedef {string|string[]} PathType - Represents a property path in an object
 * @example
 * // String dot notation
 * 'user.profile.name'
 * 'database.connection.port'
 * 'settings.ui.theme.colors.primary'
 *
 * @example
 * // Array notation
 * ['user', 'profile', 'name']
 * ['database', 'connection', 'port']
 * ['settings', 'ui', 'theme', 'colors', 'primary']
 */

/**
 * Collection of utility functions for object manipulation and path operations.
 *
 * This module provides low-level utilities for working with nested object properties
 * using path-based operations. These functions form the foundation for higher-level
 * operations like immutable updates and deep merging.
 *
 * **Path System:**
 * - Supports dot notation strings: `'user.profile.name'`
 * - Supports array notation: `['user', 'profile', 'name']`
 * - Handles nested objects of arbitrary depth
 * - Safe property access with fallback values
 * - Automatic intermediate object creation
 *
 * **Performance Characteristics:**
 * - Path parsing is cached internally where possible
 * - O(n) time complexity where n is path depth
 * - Memory efficient - no unnecessary object creation
 * - Early exit optimizations for invalid paths
 *
 * @namespace Utils
 * @example
 * import { Utils } from 'smart-object-utils';
 *
 * const data = {
 *   user: {
 *     profile: { name: 'John', age: 30 }
 *   }
 * };
 *
 * // Path operations
 * console.log(Utils.parsePath('user.profile.name')); // ['user', 'profile', 'name']
 * console.log(Utils.hasPath(data, 'user.profile.name')); // true
 * console.log(Utils.getPath(data, 'user.profile.name')); // 'John'
 *
 * // Safe path setting
 * Utils.setPath(data, 'user.settings.theme', 'dark');
 * console.log(data.user.settings.theme); // 'dark'
 *
 * @since 1.0.0
 */
export const Utils = {
  /**
   * Parses a property path into an array of keys.
   *
   * Converts string dot notation paths into array format for consistent processing.
   * Filters out empty segments that might result from consecutive dots or
   * trailing/leading dots in the path string.
   *
   * **Path Formats Supported:**
   * - Dot notation: `'user.profile.name'` → `['user', 'profile', 'name']`
   * - Already array: `['user', 'profile']` → `['user', 'profile']` (pass-through)
   * - Empty segments filtered: `'user..name'` → `['user', 'name']`
   * - Leading/trailing dots: `'.user.name.'` → `['user', 'name']`
   *
   * @function parsePath
   * @memberof Utils
   * @param {PathType} path - The path to parse (string or array)
   * @returns {string[]} Array of path segments
   *
   * @example
   * // Basic dot notation parsing
   * Utils.parsePath('user.profile.name');        // ['user', 'profile', 'name']
   * Utils.parsePath('database.connection.port'); // ['database', 'connection', 'port']
   * Utils.parsePath('a.b.c.d.e');               // ['a', 'b', 'c', 'd', 'e']
   *
   * @example
   * // Array pass-through (no conversion needed)
   * Utils.parsePath(['user', 'profile']);        // ['user', 'profile'] (unchanged)
   * Utils.parsePath(['a', 'b', 'c']);           // ['a', 'b', 'c'] (unchanged)
   *
   * @example
   * // Edge cases and cleanup
   * Utils.parsePath('user..name');               // ['user', 'name'] (empty segment removed)
   * Utils.parsePath('.user.name.');             // ['user', 'name'] (leading/trailing dots)
   * Utils.parsePath('single');                  // ['single']
   * Utils.parsePath('');                        // []
   * Utils.parsePath('...');                     // []
   *
   * @example
   * // Usage in path operations
   * function safeGetProperty(obj, path) {
   *   const keys = Utils.parsePath(path);
   *   return keys.reduce((current, key) => current?.[key], obj);
   * }
   *
   * @since 1.0.0
   */
  parsePath: (path) => {
    if (Array.isArray(path)) return path;
    return path.split('.').filter(Boolean);
  },

  /**
   * Checks if an object has a property at the specified path.
   *
   * Safely traverses an object structure to determine if a nested property exists.
   * Returns false immediately if any intermediate step in the path is missing,
   * null, or not an object. Uses the `in` operator for accurate property detection
   * including properties with undefined values.
   *
   * **Safety Features:**
   * - Handles null/undefined intermediate objects gracefully
   * - Distinguishes between missing properties and properties with undefined values
   * - Prevents TypeError when accessing properties of primitives
   * - Uses `in` operator for accurate property existence checking
   *
   * @function hasPath
   * @memberof Utils
   * @param {Object} obj - The object to check
   * @param {PathType} path - The property path to check for
   * @returns {boolean} True if the path exists in the object, false otherwise
   *
   * @example
   * const user = {
   *   profile: {
   *     name: 'John',
   *     age: 30,
   *     settings: {
   *       theme: 'dark',
   *       notifications: undefined // Property exists but value is undefined
   *     }
   *   }
   * };
   *
   * // Existing paths
   * Utils.hasPath(user, 'profile');                    // true
   * Utils.hasPath(user, 'profile.name');               // true
   * Utils.hasPath(user, 'profile.settings.theme');     // true
   * Utils.hasPath(user, 'profile.settings.notifications'); // true (exists, even though undefined)
   *
   * @example
   * // Non-existing paths
   * Utils.hasPath(user, 'profile.email');              // false
   * Utils.hasPath(user, 'profile.settings.language'); // false
   * Utils.hasPath(user, 'nonexistent');               // false
   * Utils.hasPath(user, 'profile.name.length');       // false (name is string, not object)
   *
   * @example
   * // Edge cases and safety
   * Utils.hasPath(null, 'any.path');                   // false
   * Utils.hasPath(undefined, 'any.path');              // false
   * Utils.hasPath({}, 'empty.path');                   // false
   * Utils.hasPath({ a: null }, 'a.b');                // false (null is not an object)
   *
   * @example
   * // Array notation paths
   * Utils.hasPath(user, ['profile', 'name']);          // true
   * Utils.hasPath(user, ['profile', 'missing']);       // false
   *
   * @example
   * // Usage in conditional operations
   * function updateIfExists(obj, path, value) {
   *   if (Utils.hasPath(obj, path)) {
   *     Utils.setPath(obj, path, value);
   *     return true;
   *   }
   *   return false;
   * }
   *
   * @since 1.0.0
   */
  hasPath: (obj, path) => {
    const keys = Utils.parsePath(path);
    let current = obj;

    for (const key of keys) {
      // Check if current step is valid for property access
      if (!current || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    return true;
  },

  /**
   * Gets the value at a specified object path with optional default fallback.
   *
   * Safely retrieves nested property values from objects. If any step in the path
   * is missing or if the final value is undefined, returns the provided default value.
   * This function never throws errors and gracefully handles all edge cases.
   *
   * **Behavior Details:**
   * - Returns actual value if path exists and value is not undefined
   * - Returns default value if path doesn't exist
   * - Returns default value if final value is explicitly undefined
   * - Handles null/undefined intermediate objects safely
   * - Supports both string and array path notation
   *
   * @function getPath
   * @memberof Utils
   * @param {Object} obj - The object to get the value from
   * @param {PathType} path - The property path to retrieve
   * @param {*} [defaultValue=undefined] - Value to return if path doesn't exist or is undefined
   * @returns {*} The value at the path, or defaultValue if not found
   *
   * @example
   * const config = {
   *   database: {
   *     connection: {
   *       host: 'localhost',
   *       port: 5432,
   *       ssl: false
   *     }
   *   },
   *   api: {
   *     timeout: 5000,
   *     retries: null,
   *     debug: undefined
   *   }
   * };
   *
   * // Successful path retrieval
   * Utils.getPath(config, 'database.connection.host');     // 'localhost'
   * Utils.getPath(config, 'database.connection.port');     // 5432
   * Utils.getPath(config, 'database.connection.ssl');      // false
   * Utils.getPath(config, 'api.timeout');                  // 5000
   * Utils.getPath(config, 'api.retries');                  // null
   *
   * @example
   * // Default value usage
   * Utils.getPath(config, 'database.connection.maxConnections', 10);    // 10 (default)
   * Utils.getPath(config, 'api.baseUrl', 'http://localhost');           // 'http://localhost'
   * Utils.getPath(config, 'api.debug', true);                           // true (undefined → default)
   * Utils.getPath(config, 'nonexistent.path', 'fallback');              // 'fallback'
   *
   * @example
   * // Array notation paths
   * Utils.getPath(config, ['database', 'connection', 'host']);          // 'localhost'
   * Utils.getPath(config, ['missing', 'path'], 'default');              // 'default'
   *
   * @example
   * // Edge cases and safety
   * Utils.getPath(null, 'any.path', 'safe');                           // 'safe'
   * Utils.getPath(undefined, 'any.path', 'safe');                      // 'safe'
   * Utils.getPath({}, 'empty.path', 'default');                        // 'default'
   * Utils.getPath({ a: 'string' }, 'a.length');                        // undefined (string.length exists but not object property)
   *
   * @example
   * // Common usage patterns
   *
   * // Configuration with fallbacks
   * const dbHost = Utils.getPath(config, 'database.host', 'localhost');
   * const apiTimeout = Utils.getPath(config, 'api.timeout', 3000);
   *
   * // Nested API responses
   * const userName = Utils.getPath(apiResponse, 'user.profile.displayName', 'Anonymous');
   * const avatarUrl = Utils.getPath(apiResponse, 'user.profile.avatar.url', '/default-avatar.png');
   *
   * // Feature flags with defaults
   * const featureEnabled = Utils.getPath(settings, 'features.newUI.enabled', false);
   *
   * @example
   * // Chaining with other operations
   * function safeUpperCase(obj, path) {
   *   const value = Utils.getPath(obj, path, '');
   *   return typeof value === 'string' ? value.toUpperCase() : value;
   * }
   *
   * @since 1.0.0
   */
  getPath: (obj, path, defaultValue = undefined) => {
    const keys = Utils.parsePath(path);
    let current = obj;

    for (const key of keys) {
      // Early exit if we can't traverse further
      if (!current || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }

    // Return default if final value is undefined, otherwise return actual value
    return current !== undefined ? current : defaultValue;
  },

  /**
   * Sets a value at the specified object path, creating intermediate objects as needed.
   *
   * **IMPORTANT: This function mutates the original object.** It creates missing
   * intermediate objects along the path and sets the final value. This is a low-level
   * utility function used internally by immutable update functions.
   *
   * **Mutation Behavior:**
   * - Modifies the original object in-place
   * - Creates missing intermediate objects automatically
   * - Overwrites existing non-object values in the path with empty objects
   * - Returns the original object for chaining
   *
   * **Path Creation Logic:**
   * - If intermediate path doesn't exist: creates empty object `{}`
   * - If intermediate path exists but isn't an object: replaces with empty object `{}`
   * - Final step: sets the value directly
   *
   * @function setPath
   * @memberof Utils
   * @param {Object} obj - The object to modify (will be mutated)
   * @param {PathType} path - The property path where to set the value
   * @param {*} value - The value to set at the specified path
   * @returns {Object} The original object (for chaining)
   *
   * @example
   * // Basic path setting with automatic object creation
   * const config = {};
   * Utils.setPath(config, 'database.connection.host', 'localhost');
   * console.log(config);
   * // Result: { database: { connection: { host: 'localhost' } } }
   *
   * @example
   * // Updating existing nested properties
   * const user = { profile: { name: 'John' } };
   * Utils.setPath(user, 'profile.age', 30);
   * Utils.setPath(user, 'profile.settings.theme', 'dark');
   * console.log(user);
   * // Result: {
   * //   profile: {
   * //     name: 'John',
   * //     age: 30,
   * //     settings: { theme: 'dark' }
   * //   }
   * // }
   *
   * @example
   * // Array notation paths
   * const data = {};
   * Utils.setPath(data, ['api', 'endpoints', 'users'], '/api/v1/users');
   * console.log(data);
   * // Result: { api: { endpoints: { users: '/api/v1/users' } } }
   *
   * @example
   * // Overwriting non-object intermediate values
   * const obj = { config: 'string-value' };
   * Utils.setPath(obj, 'config.database.host', 'localhost');
   * console.log(obj);
   * // Result: { config: { database: { host: 'localhost' } } }
   * // Note: Original 'string-value' was replaced with object
   *
   * @example
   * // Setting various value types
   * const settings = {};
   * Utils.setPath(settings, 'ui.theme', 'dark');
   * Utils.setPath(settings, 'api.timeout', 5000);
   * Utils.setPath(settings, 'features.enabled', true);
   * Utils.setPath(settings, 'database.credentials', null);
   * Utils.setPath(settings, 'cache.data', { key: 'value' });
   * console.log(settings);
   *
   * @example
   * // Chaining operations (returns original object)
   * const config = Utils
   *   .setPath({}, 'db.host', 'localhost')
   *   .setPath('db.port', 5432)
   *   .setPath('db.ssl', true);
   * // Note: This won't work as intended - setPath doesn't return a proxy
   * // Better approach:
   * const config = {};
   * Utils.setPath(config, 'db.host', 'localhost');
   * Utils.setPath(config, 'db.port', 5432);
   * Utils.setPath(config, 'db.ssl', true);
   *
   * @example
   * // Common usage in immutable update functions
   * function updateNested(obj, path, value) {
   *   const cloned = deepClone(obj); // Clone first to maintain immutability
   *   return Utils.setPath(cloned, path, value); // Then mutate the clone
   * }
   *
   * @example
   * // Batch property setting
   * function setBatchProperties(obj, pathValuePairs) {
   *   for (const [path, value] of Object.entries(pathValuePairs)) {
   *     Utils.setPath(obj, path, value);
   *   }
   *   return obj;
   * }
   *
   * setBatchProperties(config, {
   *   'database.host': 'prod-db.com',
   *   'database.port': 5432,
   *   'api.timeout': 10000,
   *   'logging.level': 'error'
   * });
   *
   * @warning **Mutates Original Object** - This function modifies the input object.
   * For immutable updates, clone the object first using `deepClone()`.
   *
   * @since 1.0.0
   */
  setPath: (obj, path, value) => {
    const keys = Utils.parsePath(path);
    let current = obj;

    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      // Create intermediate object if missing or if current value is not an object
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }

      current = current[key];
    }

    // Set the final value
    current[keys[keys.length - 1]] = value;

    // Return original object for potential chaining
    return obj;
  },
};
