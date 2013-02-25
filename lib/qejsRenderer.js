var fs = require("fs"), path = require("path"), qejs = require("qejs");


module.exports = function(config, contentProcessor) {
	var self = this;
	
	this.renderContentFromFile = renderContentFromFile;
	this.renderContent = renderContent;

	function renderContentFromFile(options, callback) {
		fs.exists(options.contentFilename, function(exists) {
			if (!exists) { callback("Content file not found : "+ options.contentFilename); } else {
				fs.readFile(options.contentFilename, function(err, contentBuffer) {
					if (err) { callback("Error reading content file : "+ options.contentFilename); } else {
						var contentString = contentBuffer.toString();
						var contentJson = JSON.parse(contentString);
						renderContent({ context : options.context, content : contentJson }, callback);
					}
				});
			}
		});
	}
		
	function renderContent(options, callback) {		
		var templateFilename = path.join(config.templates.path, options.content.__.template);
		fs.readFile(templateFilename, function(err, templateBuffer) {
			if (err) { callback("Error reading template : "+ templateFilename); } else {
				var template = qejs.compile(templateBuffer.toString());
				var templateHandlerFilename = templateFilename +".js";
				
				contentProcessor.processContentJson({ context : options.context, content : options.content, renderer : self }, function(err, content) {				
					if (err) { callback(err); } else {						
						fs.exists(templateHandlerFilename, function(templateHandlerExists) {
							if (templateHandlerExists) {
								var templateHandler = require(templateHandlerFilename);
								templateHandler({ context : options.context, content : content, template : template }, function(err, content) {
									callback(err, content);
								});
							} else {
								template(content).then(function(renderedContent) {
									callback(null, renderedContent);
								}, callback);
							}
						});				
					}						
				});			
			}
		});
	}
};