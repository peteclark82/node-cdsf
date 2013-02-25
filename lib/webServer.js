var fs = require("fs"), path = require("path"), domain = require("domain"),
		express = require("express");
		

module.exports = function(config, renderer) {
	this.setupMiddleware = setupMiddleware;
	this.setupRoutes = setupRoutes;
	
	/* Public Methods */
	function setupMiddleware(app) {
		app.use(errorHandler);
	}
	
	function setupRoutes(app) {
		app.all(/.+/, function(req, res) {
			var contentFilename = path.join(config.content.path, req.url) + ".js";	
			var context = { request : req, response : res };
			fs.exists(contentFilename, function(exists) {
				if (!exists) {
					res.statusCode = 404; res.end("File not found : "+ contentFilename);
				} else {
					renderer.renderContentFromFile({ context : context, contentFilename : contentFilename }, function(err, renderedContent) {
						if (err) {
							res.statusCode = 500; res.end(err);
						} else {
							if (renderedContent === undefined) {
								res.statusCode = 500; res.end("No content returned!");
							} else {
								res.statusCode = 200; res.end(renderedContent);
							}
						}
					});
				}
			});			
		});
	}
	
	/* Private Methods */	
	function errorHandler(req, res, next) {
		var requestDomain = domain.create();

		requestDomain.on('error', function(err) {
			res.statusCode = 500;
			res.end(err.message + '\n' + err.stack);
			requestDomain.dispose();
		});

		requestDomain.enter();
		
		next();
	}
};