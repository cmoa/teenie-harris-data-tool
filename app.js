const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const fs = require('fs');
const Papa = require('papaparse');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb',
  parameterLimit: 10000000,
}));

app.use(express.static(__dirname + '/public'));


function loadEmuCSV(filename) {
	console.log(filename);  
}


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

// Get data from an EMU export and covert it to JSON/js object
app.all('/importemudata', function(req, res){
    var emudata = fs.readFileSync(__dirname+"/data/ecatalog.csv", 'utf8');
    var entries = {};
    Papa.parse(emudata, {
	    complete: function(csv) {
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
	    }
	});
    res.send(JSON.stringify(entries));
});

// Get data from an EMU export and covert it to JSON/js object
app.all('/exportemudata', function(req, res){
	fs.writeFile("output/ecatalog.json", JSON.stringify(req.body, null, '\t'), 'utf8', function(err) {
		if (err) { res.send("ERROR writing to JSON file, will not write CSV"); }
		else { 
			fs.writeFile("output/ecatalog.csv", objectToCSV(req.body), 'utf8', function(err) {
				if (err) { res.send("SUCCESS writing to JSON file, ERROR writing to CSV file"); }
				else { res.send("SUCCESS writing to JSON file, SUCCESS writing to CSV file"); }
			}); 
		}
	}); 
});


////////////////// TOOLS //////////////////////////

function objectToCSV(object) {
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
}

function formatCSVcell(cellString) {
	if (cellString.indexOf("\n") > -1 || cellString.indexOf("\"") > -1 || cellString.indexOf(",") > -1) {
		return "\"" + cellString.replace(/\"/g, "\"\"") + "\"";
	} else {
		return cellString;
	}
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))