const fs = require('fs');
const Papa = require('papaparse');

var catalog = {};

// Step 1: Read ecatalog -> js object - indexed by ecatalog
buildCatalogFromECatalog();

// Step 2: Read MulMulti -> ADD to js object by ecatalog
addMultiMediaIntoCatalog();

// Step 3: Save results to JSON -> export to filed named with ecatalog IRN
exportCatalog();

function buildCatalogFromECatalog() {
	var rawCSV = fs.readFileSync("./input/ecatalog.csv");
	rawCSV = rawCSV.toString().replace(new RegExp("\u0000", "g"), "").replace(new RegExp("\n", "g"), "");

    Papa.parse(rawCSV,
	{
	    complete: function(parsedCSV) {

	    	var sampleData;

			var data = parsedCSV.data;
	    	var fields = data[0];
	    	var parsedFields = [];
	    	fields.map((field) => { parsedFields.push(field.toString().replace(new RegExp("\u0000", "g"), "")) })
	    	
	    	var fileCount = 0;

	    	console.log("Found "+ data.length +" eCatalog rows")

	    	for (var i=1; i<data.length-1; i++) {

	    		var entry = {};

	            for (var j=0; j<parsedFields.length; j++) {
	                var key = parsedFields[j];
	                var value ="";
	                try { 
	                	value = data[i][j].toString().replace(new RegExp("\u0000", "g"), "") 
	                	if (key === "irn" || key === "ecatalogue_key" || key === "MulMultiMediaRef_key") value = parseInt(value);
	                } 
	                catch(e) { console.log("error parsing ecatalog.csv, row " + i + ": " + parsedFields[j]) }
	                entry[key]=value;
	            }

	            if (entry["irn"] !== '') {
	            	catalog[entry["ecatalogue_key"]] = entry;
	            }
	    	}
	    },
	    error: function(err) { console.log("ERROR parsing ecatalog CSV (entire file): " + err); }
	});
}


function addMultiMediaIntoCatalog() {
	var rawCSV = fs.readFileSync("./input/MulMulti.csv");
	rawCSV = rawCSV.toString().replace(new RegExp("\u0000", "g"), "").replace(new RegExp("\n", "g"), "");

    Papa.parse(rawCSV,
	{
	    complete: function(parsedCSV) {

	    	var sampleData;

			var data = parsedCSV.data;
	    	var fields = data[0];
	    	var parsedFields = [];
	    	fields.map((field) => { parsedFields.push(field.toString().replace(new RegExp("\u0000", "g"), "")) })
	    	
	    	var fileCount = 0;

	    	console.log("Found "+ data.length +" MulMulti rows")

	    	for (var i=1; i<data.length-1; i++) {

	    		var entry = {};

	            for (var j=0; j<parsedFields.length; j++) {
	                var key = parsedFields[j];
	                var value ="";
	                try { 
	                	value = data[i][j].toString().replace(new RegExp("\u0000", "g"), "") 
	                	if (key === "irn" || 
	                		key === "ecatalogue_key" || 
	                		key === "MulMultiMediaRef_key" || 
	                		key === "MultiMedia_irn") 
	                		value = parseInt(value);
	                } 
	                catch(e) { console.log("error parsing MulMulti.csv, row " + i + ": " + parsedFields[j]) }
	                entry[key]=value;
	            }

	            if (entry["MultiMedia_irn"] !== '') {
	            	catalog[entry["ecatalogue_key"]]["MultiMedia_irn"] = entry["MultiMedia_irn"];
	            	catalog[entry["ecatalogue_key"]]["MulMultiMediaRef_key"] = entry["MulMultiMediaRef_key"];
	            	catalog[entry["ecatalogue_key"]]["image_url"] = "https://cmoa-collection-images.s3.amazonaws.com/teenie/"+entry["MultiMedia_irn"]+"/sizes/"+catalog[entry["ecatalogue_key"]]["irn"]+"-1680.jpg"
	            }
	    	}
	    },
	    error: function(err) { console.log("ERROR parsing MulMulti CSV (entire file): " + err); }
	});
}


function exportCatalog() {
	var fileCount = 0;

	for (index in catalog) {
		var entry = catalog[index];
		try {
			var entryPath = "./output/jsonRecords/" + entry["irn"] + ".json";
			fs.writeFileSync(entryPath, JSON.stringify(entry, null, '\t'), 'utf8');
			fileCount++;
		} catch(e) {
			console.log("Error writing file: " + entryPath);
		}
	}
	console.log("Wrote " + fileCount + " files to output/jsonRecords!");
	console.log("-----------\nSample Record:\n----------- \n" + JSON.stringify(entry, null, '\t') + "\n-----------");
}

