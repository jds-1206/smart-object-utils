import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * 
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @repository ${pkg.repository.url}
 */`;

const external = ['lodash', 'ramda']; // External dependencies to exclude from bundle

const commonPlugins = [
	nodeResolve({
		browser: false,
		preferBuiltins: false,
	}),
	commonjs(),
	babel({
		babelHelpers: 'bundled',
		exclude: 'node_modules/**',
		presets: [
			[
				'@babel/preset-env',
				{
					modules: false,
					targets: {
						node: '16',
						browsers: ['> 1%', 'last 2 versions', 'not dead']
					}
				}
			]
		]
	}),
];

export default [
	// ES Modules build (for modern bundlers)
	{
		input: 'src/index.js',
		output: {
			file: pkg.module,
			format: 'esm',
			banner,
			sourcemap: true,
		},
		external,
		plugins: [
			...commonPlugins,
			// Add bundle analyzer for ESM build
			visualizer({
				filename: 'dist/bundle-analysis.html',
				title: 'Bundle Analysis - ES Modules',
				template: 'treemap', // or 'sunburst', 'network'
			}),
		],
	},

	// CommonJS build (for Node.js)
	{
		input: 'src/index.js',
		output: {
			file: pkg.main,
			format: 'cjs',
			banner,
			sourcemap: true,
			exports: 'named', // Fix mixed exports warning
		},
		external,
		plugins: commonPlugins,
	},

	// UMD build (for browsers)
	{
		input: 'src/index.js',
		output: {
			file: pkg.browser,
			format: 'umd',
			name: 'DeepCloneUtils',
			banner,
			sourcemap: true,
			exports: 'named', // Fix mixed exports warning
			globals: {
				lodash: '_',
				ramda: 'R'
			}
		},
		external,
		plugins: [
			...commonPlugins,
			terser({
				format: {
					comments: function(node, comment) {
						const text = comment.value;
						const type = comment.type;
						if (type === "comment2") {
							// multiline comment
							return /@preserve|@license|@cc_on/i.test(text);
						}
					}
				},
				compress: {
					drop_console: false,
					drop_debugger: true,
					pure_funcs: ['console.log'],
				},
				mangle: {
					reserved: ['DeepCloneUtils']
				}
			}),
		],
	},

	// Minified ES build (for CDN)
	{
		input: 'src/index.js',
		output: {
			file: 'dist/index.min.js',
			format: 'esm',
			banner,
			sourcemap: true,
		},
		external,
		plugins: [
			...commonPlugins,
			terser({
				format: {
					comments: function(node, comment) {
						const text = comment.value;
						const type = comment.type;
						if (type === "comment2") {
							return /@preserve|@license|@cc_on/i.test(text);
						}
					}
				}
			}),
		],
	},
];