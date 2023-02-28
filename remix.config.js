/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	serverDependenciesToBundle: ['replicate', 'camelcase-keys'],
	ignoredRouteFiles: ['**/.*'],
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
	future: {
		unstable_dev: true,
	},
};
