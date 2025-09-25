export default {
	testEnvironment: 'node',
	transform: {},

	// Test files
	testMatch: [
		'**/tests/**/*.test.js',
		'**/tests/**/*.spec.js'
	],

	// Coverage
	collectCoverageFrom: [
		'src/**/*.js',
		'!src/**/index.js',
		'!src/**/*.config.js'
	],

	coverageReporters: [
		'text',
		'text-summary',
		'html',
		'lcov'
	],

	coverageDirectory: 'coverage',

	coverageThreshold: {
		global: {
			branches: 75,
			functions: 75,
			lines: 75,
			statements: 75
		}
	},

	// Verbose output
	verbose: true,

	// Setup files
	setupFilesAfterEnv: [
		'<rootDir>/tests/setup.js'
	],

	// Module paths
	testPathIgnorePatterns: [
		'/node_modules/',
		'/dist/',
		'/coverage/'
	],

	// Clear mocks between tests
	clearMocks: true,

	// Collect coverage from all files
	collectCoverage: false // Only when --coverage flag is used
};