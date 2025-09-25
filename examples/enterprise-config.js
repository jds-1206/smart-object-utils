import { deepClone, deepMerge, updateMultiple } from '../src/index.js';

console.log('🏢 Enterprise Configuration Management Example\n');

class ConfigurationManager {
  constructor(baseConfig = {}) {
    this.baseConfig = deepClone(baseConfig);
    this.environments = new Map();
  }

  createEnvironment(name, overrides = {}) {
    const config = deepMerge(this.baseConfig, overrides);
    this.environments.set(name, config);
    return config;
  }

  updateEnvironment(name, updates) {
    if (!this.environments.has(name)) {
      throw new Error(`Environment ${name} not found`);
    }

    const currentConfig = this.environments.get(name);
    const updatedConfig = updateMultiple(currentConfig, updates);
    this.environments.set(name, updatedConfig);

    return updatedConfig;
  }

  getEnvironment(name) {
    return deepClone(this.environments.get(name));
  }
}

const baseConfig = {
  database: {
    connection: { host: 'localhost', port: 5432, pool: { min: 2, max: 10 } },
    ssl: false,
  },
  api: {
    cors: { origins: ['http://localhost:3000'] },
    rateLimit: { windowMs: 15000, maxRequests: 100 },
  },
  logging: { level: 'info', transports: ['console'] },
  features: { realTime: true, analytics: false },
};

const configManager = new ConfigurationManager(baseConfig);

console.log('🔧 Creating development environment...');
configManager.createEnvironment('development', {
  logging: { level: 'debug', transports: ['console', 'file'] },
});

console.log('🚀 Creating production environment...');
configManager.createEnvironment('production', {
  database: {
    connection: {
      host: 'prod-db.company.com',
      ssl: true,
      pool: { min: 5, max: 50 },
    },
  },
  api: {
    cors: { origins: ['https://app.company.com'] },
  },
  logging: { level: 'error', transports: ['file'] },
  features: { analytics: true },
});

console.log('⚙️ Updating production configuration...');
configManager.updateEnvironment('production', {
  'database.connection.pool.max': 100,
  'api.rateLimit.maxRequests': 1000,
});

const devConfig = configManager.getEnvironment('development');
const prodConfig = configManager.getEnvironment('production');

console.log('\n📊 Configuration Summary:');
console.log('Development Database:', devConfig.database.connection.host);
console.log('Development Logging:', devConfig.logging.level);
console.log('Production Database:', prodConfig.database.connection.host);
console.log('Production Pool Max:', prodConfig.database.connection.pool.max);
console.log('Production SSL:', prodConfig.database.ssl);

console.log('\n✅ Enterprise configuration management completed!');
