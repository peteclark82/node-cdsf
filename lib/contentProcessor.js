var path = require("path"), async = require("async");


module.exports = function(config) {
	this.processContentJson = processContentJson;

	function processContentJson(options, callback) {
		var content = options.content;
		async.forEachSeries(Object.keys(content), function(propertyName, nextProperty) {
			processPropertyValue({ context : options.context, value : content[propertyName], renderer : options.renderer }, function(err, nestedContent) {
				if (err) {nextProperty(err);} else {
					content[propertyName] = nestedContent;
					nextProperty();
				}
			});
		}, function(err) {
			if (err) { callback(err); } else { callback(null, content); }
		});
	}
	
	/* Private Methods */	
	function processPropertyValue(options, callback) {
		var value = options.value;
		if (value.__ !== undefined && value.__.template !== undefined) {
			options.renderer.renderContent({ context : options.context, content : value }, callback);
		} else if (typeof(value.__) === "string") {
			options.renderer.renderContentFromFile({ context : options.context, contentFilename : path.join(config.content.path, value.__) }, callback);
		} else if (value instanceof Array) {
			var processedArray = [];
			async.forEachSeries(value, function(arrayValue, nextArrayValue) {
				processPropertyValue({ context : options.context, value : arrayValue, renderer : options.renderer }, function(err, processedArrayValue) {
					if (err) {nextArrayValue(err);} else {
						processedArray.push(processedArrayValue);
						nextArrayValue();
					}
				});
			}, function(err) {
				if (err) {callback(err);} else {
					callback(null, processedArray);
				}
			});
		} else {
			 callback(null, value);
		}
	}
};