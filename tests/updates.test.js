import { updateNested, updateMultiple, deepMerge } from '../src/index.js';

describe('Update Operations', () => {
  test('should update nested properties immutably', () => {
    const original = { a: { b: { c: 1 } } };
    const updated = updateNested(original, 'a.b.c', 42);

    expect(updated.a.b.c).toBe(42);
    expect(original.a.b.c).toBe(1);
    expect(updated).not.toBe(original);
  });

  test('should create missing paths', () => {
    const original = { a: {} };
    const updated = updateNested(original, 'a.b.c', 'value');

    expect(updated.a.b.c).toBe('value');
    expect(original.a.b).toBeUndefined();
  });

  test('should update multiple paths', () => {
    const original = { user: { name: 'John' }, settings: { theme: 'light' } };
    const updated = updateMultiple(original, {
      'user.name': 'Jane',
      'settings.theme': 'dark',
    });

    expect(updated.user.name).toBe('Jane');
    expect(updated.settings.theme).toBe('dark');
    expect(original.user.name).toBe('John');
  });

  test('should merge objects deeply', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    const merged = deepMerge(target, source);

    expect(merged.a).toBe(1);
    expect(merged.b.c).toBe(2);
    expect(merged.b.d).toBe(3);
    expect(merged.e).toBe(4);
  });

  test('should handle array merge strategies', () => {
    const target = { items: [1, 2] };
    const source = { items: [3, 4] };

    const replaced = deepMerge(target, source);
    expect(replaced.items).toEqual([3, 4]);

    const merged = deepMerge(target, source, { arrayStrategy: 'merge' });
    expect(merged.items).toEqual([1, 2, 3, 4]);
  });
});
