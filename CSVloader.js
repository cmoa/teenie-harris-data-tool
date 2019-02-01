$(document).ready(function () {

	d3.text("ecatalog.csv", function(data) {
        var parsedCSV = d3.csv.parseRows(data);

        // Travel through CSV arrays to format easier to manage js object
        var fields = parsedCSV[0];
		var entries = {};
        for (var i=1; i<parsedCSV.length; i++) {
        	var entry = {};
        	var irn;
        	for (var j=0; j<parsedCSV[0].length; j++) {
        		var key = parsedCSV[0][j];
        		var value = parsedCSV[i][j];
        		if (key === "irn") { irn = value; }
        		entry[key]=value;
        	}
        	entries[irn] = entry;
        }
        console.log(entries);
    });	

});