/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	serverDependenciesToBundle: [
		'replicate',
		'camelcase-keys',
		'fractional-indexing',
	],
	ignoredRouteFiles: ['**/.*'],
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
	future: {
		unstable_dev: {
			port: 3010,
			appServerPort: 3000,
		},
	},
};
