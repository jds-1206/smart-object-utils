// Global test utilities
global.createComplexObject = () => ({
  string: 'test',
  number: 42,
  boolean: true,
  date: new Date('2023-01-01'),
  regex: /test/gi,
  array: [1, 2, { nested: 'value' }],
  object: {
    nested: {
      deep: {
        value: 'deeply nested',
      },
    },
  },
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nullValue: null,
  undefinedValue: undefined,
});

global.createCircularObject = () => {
  const obj = { a: 1, b: { c: 2 } };
  obj.circular = obj;
  obj.b.parent = obj;
  return obj;
};

// Custom matchers
expect.extend({
  toBeClonedCorrectly(cloned, original) {
    const pass =
      JSON.stringify(cloned) === JSON.stringify(original) &&
      cloned !== original;
    return {
      pass,
      message: () =>
        pass
          ? 'Objects are properly cloned'
          : 'Objects are not properly cloned',
    };
  },
});
