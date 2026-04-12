import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { transform } from '@svgr/core';

console.time('esbuild build');

// Copy HTML template to output directory
const copyHtml = () => {
	const publicDir = path.resolve(process.cwd(), 'public');
	const outDir = path.resolve(process.cwd(), 'dist-esbuild');

	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	const htmlContent = fs.readFileSync(
		path.join(publicDir, 'index.html'),
		'utf-8'
	);
	// Add script tag before closing body tag
	const modifiedHtml = htmlContent.replace(
		'</body>',
		'\t<script src="./index.js"></script>\n</body>'
	);
	fs.writeFileSync(path.join(outDir, 'index.html'), modifiedHtml);
	console.log('HTML template copied to dist-esbuild/index.html');
};

// Clean output directory
const cleanOutdir = () => {
	const outDir = path.resolve(process.cwd(), 'dist-esbuild');
	if (fs.existsSync(outDir)) {
		fs.rmSync(outDir, { recursive: true });
	}
};

// Custom SVGR plugin that exports ReactComponent
const svgrPlugin = {
	name: 'svgr',
	setup(build) {
		build.onLoad({ filter: /\.svg$/ }, async (args) => {
			const svg = await fs.promises.readFile(args.path, 'utf8');
			const componentName = 'SvgComponent';

			const result = await transform(
				svg,
				{
					plugins: ['@svgr/plugin-jsx'],
				},
				{ componentName }
			);

			// Wrap to export as ReactComponent named export
			const contents = result.replace(
				/export default/,
				'export { SvgComponent as ReactComponent };\nexport default'
			);

			return {
				contents,
				loader: 'tsx',
			};
		});
	},
};

// Build configuration
cleanOutdir();

esbuild
	.build({
		entryPoints: ['src/index.tsx'],
		bundle: true,
		minify: true,
		outdir: 'dist-esbuild',
		loader: {
			'.tsx': 'tsx',
			'.ts': 'ts',
			'.css': 'css',
			'.png': 'file',
			'.jpg': 'file',
			'.jpeg': 'file',
			'.gif': 'file',
			'.webp': 'file',
		},
		define: {
			'process.env.NODE_ENV': '"production"',
			'process.env.API_URL': '"https://api.v2.react-learning.ru"',
		},
		target: 'es2020',
		platform: 'browser',
		assetNames: 'static/assets/[name]-[hash]',
		plugins: [svgrPlugin],
	})
	.then(() => {
		copyHtml();
		console.timeEnd('esbuild build');
		console.log('Build completed successfully!');
	})
	.catch((error) => {
		console.error('Build failed:', error);
		process.exit(1);
	});
