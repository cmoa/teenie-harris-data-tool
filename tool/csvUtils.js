
var emuOutputFields = [
		"irn",
		"TitAccessionNo",
		"CreDateCreated",
		"CreEarliestDate",
		"CreLatestDate",
		"PhyMediumComments",
		"TitMainTitle",
		"CatDescriptText",
		"BibliographyPublication",
		"BibliographyDate",
		"BibliographyCutline",
		"BibliographyPage"
	]

var emuTabFields = {
	"TitAlternateTitles_tab" : 5,
	"CatSubject_tab" : 10, 
	"CreCountry_tab": 3,
	"CreState_tab": 3,
	"CreDistrict_tab": 3,
	"CreCity_tab": 3,
	"People_tab" : 30,
	"CatKeywords_tab": 15,
}

for (var tabField in emuTabFields) {
	var tabCount = emuTabFields[tabField];
	for (var i = 0; i < tabCount; i++) {
		emuOutputFields.push(tabField+"("+(i+1)+")");
	}
}


module.exports = {
  	catalogToCSV: function (catalog) {
  		var headers = emuOutputFields;

		var csv = "";
		var entryCount = 0;

		for (var i = 0; i < headers.length; i++) {
			csv += formatCSVcell(headers[i]);
			if (i < headers.length - 1) { csv += ","; }
		}
		csv += "\n";
		
		for (entry in catalog) {
			var flagged = false;
        	if (catalog[entry]["inReview"] === undefined) { flagged = true; } 
        	else {
            	for (var field in catalog[entry]["inReview"]) {
            		if (catalog[entry]["inReview"][field] == 1) { flagged = true; } 
            	}
            }

			if (!flagged) {
				for (var i = 0; i < headers.length; i++) {
					var match = headers[i].match(/\((\d*)\)/);
					if (match !== null) {
						var strippedHeader = headers[i].match(/^(.*?)\(/)[1]
						var index = parseInt(match[1])-1;

						var dataField = catalog[entry]["emuOutput"][strippedHeader];
						if (dataField !== undefined) {
							var data = dataField.split('\n')[index];
							if (data !== undefined) {
								csv += formatCSVcell(data);
							}
						}
					} else {
						csv += formatCSVcell(catalog[entry]["emuOutput"][headers[i]]);
					}
					if (i < headers.length - 1) { csv += ","; }
				}
				csv += "\n";
				entryCount++;
			}
		}
		return { csv, size: entryCount };
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
	console.log(cellString)
	if (cellString === undefined) return "";
	if (cellString.indexOf("\n") > -1 || cellString.indexOf("\"") > -1 || cellString.indexOf(",") > -1) {
		return "\"" + cellString.replace(/\"/g, "\"\"") + "\"";
	} else {
		return cellString;
	}
}