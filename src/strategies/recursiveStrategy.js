export class RecursiveStrategy {
  static clone(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (seen.has(obj)) return seen.get(obj);
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);

    if (Array.isArray(obj)) {
      const cloned = [];
      seen.set(obj, cloned);
      for (let i = 0; i < obj.length; i++) {
        cloned[i] = RecursiveStrategy.clone(obj[i], seen);
      }
      return cloned;
    }

    if (obj instanceof Map) {
      const cloned = new Map();
      seen.set(obj, cloned);
      for (const [key, value] of obj.entries()) {
        cloned.set(
          RecursiveStrategy.clone(key, seen),
          RecursiveStrategy.clone(value, seen)
        );
      }
      return cloned;
    }

    if (obj instanceof Set) {
      const cloned = new Set();
      seen.set(obj, cloned);
      for (const value of obj.values()) {
        cloned.add(RecursiveStrategy.clone(value, seen));
      }
      return cloned;
    }

    const cloned = {};
    seen.set(obj, cloned);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = RecursiveStrategy.clone(obj[key], seen);
      }
    }
    return cloned;
  }

  static canHandle() {
    return true;
  }
}
