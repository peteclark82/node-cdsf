var fs = require("fs"), path = require("path");
		

module.exports = function(config) {	
	this.setupMiddleware = setupMiddleware;
	this.setupRoutes = setupRoutes;
	
	var plugins = [], files = fs.readdirSync(config.plugins.path);
	files.forEach(function(fileName) {
		var pluginConfigFile = path.resolve(config.plugins.path, fileName);
		var pluginConfig = require(pluginConfigFile);
		plugins.push(pluginConfig(config));
	});
	
	/* Public Methods */
	function setupMiddleware(app) {
		plugins.forEach(function(plugin) {
			if (plugin.setupMiddleware !== undefined) {
				plugin.setupMiddleware(app);
			}
		});
	}
	
	function setupRoutes(app) {
		plugins.forEach(function(plugin) {
			if (plugin.setupRoutes !== undefined) {
				plugin.setupRoutes(app);
			}
		});
	}
};