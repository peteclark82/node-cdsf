var	httpProxy = require('http-proxy');
		

module.exports = function(getPluginConfig) {
	return function(config) {
		var pluginConfig = getPluginConfig(config);
		var hostAndPort = pluginConfig.host + ":" + pluginConfig.port;
		
		return {
			setupRoutes : setupRoutes
		};

		function setupRoutes(app) {
			var proxy = new httpProxy.RoutingProxy();
			console.log("Starting reverse proxy for '"+ pluginConfig.route.toString() +"' to '"+ hostAndPort +"'");
			app.all(pluginConfig.route, function(req, res) {
				var url = pluginConfig.pathPrefix || "";
				url += "/"+ req.params[0] + "?" + req._parsedUrl.query;
				req.url = url;
				req.headers["host"] = hostAndPort;
				
				proxy.proxyRequest(req, res, { 
					host: config.proxy && config.proxy.host ? config.proxy.host : pluginConfig.host, 
					port: config.proxy && config.proxy.port ? config.proxy.port : pluginConfig.port
				});
			});			
		}
	};
};