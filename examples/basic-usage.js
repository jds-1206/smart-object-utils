import { deepClone, updateNested, deepMerge } from '../src/index.js';

console.log('🚀 Deep Clone Utils - Basic Usage Examples\n');

// ==========================================
// 1. Basic Deep Cloning
// ==========================================
console.log('1️⃣ Basic Deep Cloning:');

const original = {
  user: {
    name: 'John',
    preferences: { theme: 'dark', notifications: true },
  },
  data: [1, 2, { nested: 'value' }],
  metadata: {
    created: new Date('2023-01-01'),
    pattern: /test-\d+/gi,
  },
};

const cloned = deepClone(original);

console.log('✅ Original !== Cloned:', cloned !== original);
console.log('✅ Deep references different:', cloned.user !== original.user);
console.log('✅ Date preserved:', cloned.metadata.created instanceof Date);
console.log('✅ RegExp preserved:', cloned.metadata.pattern instanceof RegExp);

console.log('\n' + '='.repeat(50) + '\n');

// ==========================================
// 2. Nested Updates (Immutable)
// ==========================================
console.log('2️⃣ Nested Updates (Immutable):');

const userState = {
  profile: { name: 'John', email: 'john@example.com' },
  settings: { theme: 'light', language: 'en' },
  preferences: { notifications: { email: true, push: false } },
};

const updated = updateNested(userState, 'profile.name', 'Jane Doe');
const themeUpdated = updateNested(updated, 'settings.theme', 'dark');

console.log('📝 Original user name:', userState.profile.name);
console.log('📝 Updated user name:', themeUpdated.profile.name);
console.log('📝 Theme changed to:', themeUpdated.settings.theme);
console.log('✅ Original state unchanged:', userState.profile.name === 'John');

console.log('\n' + '='.repeat(50) + '\n');

// ==========================================
// 3. Configuration Merging
// ==========================================
console.log('3️⃣ Configuration Merging:');

const defaultConfig = {
  database: {
    connection: { host: 'localhost', port: 5432, pool: { min: 2, max: 10 } },
  },
  api: { timeout: 5000, cors: { origins: ['localhost'] } },
  features: ['feature1', 'feature2'],
};

const productionConfig = {
  database: {
    connection: { host: 'prod-db.company.com', pool: { max: 50 } },
  },
  api: { timeout: 10000, cors: { origins: ['app.company.com'] } },
  features: ['feature3', 'feature4'],
};

const mergedConfig = deepMerge(defaultConfig, productionConfig, {
  arrayStrategy: 'merge',
});

console.log(
  '🔧 Default database host:',
  defaultConfig.database.connection.host
);
console.log('🔧 Merged database host:', mergedConfig.database.connection.host);
console.log(
  '🔧 Database pool min (preserved):',
  mergedConfig.database.connection.pool.min
);
console.log(
  '🔧 Database pool max (updated):',
  mergedConfig.database.connection.pool.max
);
console.log('🔧 All features merged:', mergedConfig.features);

console.log('\n🎉 All examples completed successfully!');
console.log('📦 Ready for production use!');
