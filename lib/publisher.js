var fs = require("fs"), path = require("path"), walk = require("walk"),
		mkdirp = require("mkdirp");
		
		
module.exports = function(config, renderer) {
	this.publish = publish;
	
	function publish(options, callback) {
		mkdirp(options.target, function(err) {
			if (err) { 
				var error = new Error("Error creating target directory : "+ options.target +"\n"+ err.toString() );
				error.inner = err;
				callback(error);				
			} else {
				var walker = walk.walk(config.content.path, { followLinks: false })
					.on("file", fileHandler)
					.on("errors", errorHandler)
					.on("end", function () { callback(); });
			}
		});
		
		function fileHandler(root, fileStats, next) {					
			var contentFilename = path.join(root, fileStats.name);
			var targetFilename = path.relative(config.content.path, contentFilename);
			targetFilename = path.join(options.target, targetFilename);
			targetFilename = path.join(path.dirname(targetFilename), path.basename(targetFilename, path.extname(targetFilename)));
			targetFilename+=".htm";
			publishContent(contentFilename, targetFilename, next, callback);
		}
		
		function errorHandler(root, nodeStatsArray, next) {
			var error = new Error("Error walking content directory");
			error.inner = nodeStatsArray;
			callback(error);
		}
	}
	
	/* Private Methods */
	function publishContent(contentFilename, targetFilename, next, callback) {					
		renderer.renderContentFromFile({ context : {}, contentFilename : contentFilename }, function(err, renderedContent) {
			if (err) {
				var error = new Error("Error rendering content file : "+ contentFilename);
				error.inner = err;
				callback(error);
			} else {
				if (renderedContent === undefined) {
					var error = new Error("No content return for file : "+ contentFilename);
					callback(error);
				} else {
					mkdirp(path.dirname(targetFilename), function(err) {
						if (err) {
							var error = new Error("Error creating target directory : "+ options.target +"\n"+ err.toString() );
							error.inner = err;
							callback(error);
						} else {
							console.log("Writing file '"+ targetFilename +"'...");
							fs.writeFile(targetFilename, renderedContent, next);
						}
					});
				}
			}
		});
	}
};