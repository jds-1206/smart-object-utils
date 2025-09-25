import { deepClone, cloneDeep, clone } from '../src/index.js';
import { Types, Utils } from '../src/index.js';

describe('Deep Clone Utils', () => {
  test('should clone primitive values', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('string')).toBe('string');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
    expect(deepClone(undefined)).toBe(undefined);
  });

  test('should clone simple objects', () => {
    const original = { a: 1, b: 'test' };
    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });

  test('should clone nested objects', () => {
    const original = { a: { b: { c: 1 } } };
    const cloned = deepClone(original);

    expect(cloned).toBeClonedCorrectly(original);
    expect(cloned.a).not.toBe(original.a);
    expect(cloned.a.b).not.toBe(original.a.b);
  });

  test('should clone arrays', () => {
    const original = [1, 2, [3, 4]];
    const cloned = deepClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned[2]).not.toBe(original[2]);
  });

  test('should handle dates and regex', () => {
    const original = {
      date: new Date('2023-01-01'),
      regex: /test/gi,
    };
    const cloned = deepClone(original);

    expect(cloned.date).toBeInstanceOf(Date);
    expect(cloned.regex).toBeInstanceOf(RegExp);
    expect(cloned.date.getTime()).toBe(original.date.getTime());
  });

  test('should handle circular references', () => {
    const circular = createCircularObject();

    expect(() => {
      const cloned = deepClone(circular);
      expect(cloned.a).toBe(1);
      expect(cloned.circular).toBe(cloned);
    }).not.toThrow();
  });

  test('aliases should work', () => {
    const original = { a: { b: 1 } };
    expect(cloneDeep(original)).toBeClonedCorrectly(original);
    expect(clone(original)).toBeClonedCorrectly(original);
  });
});

describe('Types utilities', () => {
  test('should identify types correctly', () => {
    expect(Types.isObject({})).toBe(true);
    expect(Types.isObject([])).toBe(false);
    expect(Types.isArray([])).toBe(true);
    expect(Types.isDate(new Date())).toBe(true);
    expect(Types.isPrimitive('string')).toBe(true);
  });
});

describe('Utils', () => {
  test('should parse paths', () => {
    expect(Utils.parsePath('a.b.c')).toEqual(['a', 'b', 'c']);
  });

  test('should check paths', () => {
    const obj = { a: { b: { c: 'value' } } };
    expect(Utils.hasPath(obj, 'a.b.c')).toBe(true);
    expect(Utils.hasPath(obj, 'a.b.d')).toBe(false);
  });
});
