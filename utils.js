module.exports = {
  	objectToCSV: function (object) {
		var csv = "";
		var headers;
		
		var entryIndex = 0;
		var entryCount = Object.keys(object).length;
		for (entry in object) {
			var fieldIndex = 0;
			if (entryIndex === 0) {
				headers = Object.keys(object[entry]);
				for (var i = 0; i < headers.length; i++) {
					csv += formatCSVcell(headers[i]);
					if (i < headers.length - 1) { csv += ","; }
				}
				csv += "\n";
			}
			for (key in object[entry]) {
				csv += formatCSVcell(object[entry][key]);
				fieldIndex++; if (fieldIndex < headers.length) { csv += "," };
			} 
			entryIndex++; if (entryIndex < entryCount) { csv += "\n"; }
		}
		return csv;
	},

	CSVToObject: function(csv) {
		var entries = {};
        var fields = csv.data[0];
        for (var i=1; i<csv.data.length; i++) {
            var entry = {};
            var irn;
            for (var j=0; j<csv.data[0].length; j++) {
                var key = csv.data[0][j];
                var value = csv.data[i][j];
                if (key === "ecatalogue_key") { irn = value.toString(); }
                entry[key]=value;
            }
            entries[irn]=entry;
        }
        return entries;
    }
};


formatCSVcell = function(cellString) {
	if (cellString.indexOf("\n") > -1 || cellString.indexOf("\"") > -1 || cellString.indexOf(",") > -1) {
		return "\"" + cellString.replace(/\"/g, "\"\"") + "\"";
	} else {
		return cellString;
	}
}