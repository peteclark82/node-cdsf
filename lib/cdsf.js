var express = require("express");

var ContentProcessor = require("./contentProcessor.js"), QEJSRenderer = require("./qejsRenderer.js"),
		WebServer = require("./webServer.js"), Plugins = require("./plugins.js"), Publisher = require("./publisher.js");

module.exports = function(config) {
	/* Initiailise Dependencies */
	var contentProcessor = new ContentProcessor(config);
	var renderer = new QEJSRenderer(config, contentProcessor);
	var plugins = new Plugins(config);
	var webServer = new WebServer(config, renderer);
	var publisher = new Publisher(config, renderer);
	
	return {
		createServer : createServer,
		publish : publish
	};
	
	function createServer() {
		var app = express();

		plugins.setupMiddleware(app);
		webServer.setupMiddleware(app);
		
		plugins.setupRoutes(app);
		webServer.setupRoutes(app);
		
		return app;
	}
	
	function publish(options, callback) {
		publisher.publish({ target : options.target }, callback);
	}
};


/* Built-In Plugin Middleware */
module.exports.staticFiles = require("./plugins/staticFiles.js");
module.exports.reverseProxy = require("./plugins/reverseProxy.js");