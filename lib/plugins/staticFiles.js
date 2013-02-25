var	express = require('express');
		
module.exports = function(getPluginConfig) {
	return function(config) {
		var pluginConfig = getPluginConfig(config);
		
		return {
			setupMiddleware : setupMiddleware
		};

		function setupMiddleware(app) {
			app.use(pluginConfig.route, express.static(pluginConfig.path));	
		}
	};
};