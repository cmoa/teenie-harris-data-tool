const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const fs = require('fs');
const Papa = require('papaparse');
const bodyParser = require('body-parser');
const utils = require('./utils');

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb',
  parameterLimit: 10000000,
}));

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/tool.html'));
});

app.get('/directory',function(req,res){
    res.sendFile(path.join(__dirname+'/public/directory.html'));
});

// Reads data from an EMU .csv, sends to client as javascript object
app.all('/importemudata', function(req, res){
    var emudata = fs.readFileSync(__dirname+"/data/ecatalog.csv", 'utf8');
    Papa.parse(emudata, {
	    complete: function(csv) {
	    	var data = utils.CSVToObject(csv);
	    	res.send(JSON.stringify(data));
	    },
	    error: function(err) { res.send("ERROR parsing CSV: " + err); }
	});
    
});

// Recieves javascript object from client, and writes to output .csv file
app.all('/exportemudata', function(req, res){
	fs.writeFile("output/ecatalog.json", JSON.stringify(req.body, null, '\t'), 'utf8', function(err) {
		if (err) { res.send("ERROR writing to JSON file, will not write CSV"); }
		else { 
			fs.writeFile("output/ecatalog.csv", utils.objectToCSV(req.body), 'utf8', function(err) {
				if (err) { res.send("SUCCESS writing to JSON file, ERROR writing to CSV file"); }
				else { res.send("SUCCESS writing to JSON file, SUCCESS writing to CSV file"); }
			}); 
		}
	}); 
});

// Loads mainfest which includes programtically generated fields and noted archivist selections
app.all('/loadcatalog', function(req, res){
	var data = fs.readFileSync(__dirname+"/output/catalog.json", 'utf8');
	res.send(data);
});

// Saves archivist selections and edits to .json
app.all('/savecatalog', function(req, res){
	fs.writeFile("output/catalog.json", JSON.stringify(req.body, null, '\t'), 'utf8', function(err) {
		if (err) { res.send("ERROR writing to catalog JSON file"); }
		else { res.send("SUCCESS writing to catalog JSON file"); }
	}); 
});


// Saves archivist selections and edits to .json
app.all('/savemanifest', function(req, res){
	fs.writeFile("output/manifest.json", JSON.stringify(req.body, null, '\t'), 'utf8', function(err) {
		if (err) { res.send("ERROR writing to manifest JSON file"); }
		else { res.send("SUCCESS writing to manifest JSON file"); }
	}); 
});

// Shortens Title using Python NLP
app.all('/shortentitle', function(req, res){
	const spawn = require("child_process").spawn;
	const pythonProcess = spawn('python',["python/shortenTitle.py", req.body["title"]]);

	pythonProcess.stdout.on('data', (data) => {
		console.log("Data from shortenTitle.py: \n")
	    console.log(data.toString());
	    res.send(data.toString()); 
	});

	pythonProcess.stderr.on('data', function(data) {
		console.log("Error from shortenTitle.py: \n")
	    console.error(data.toString());
	});
});

// Shortens Title using Python NLP
app.all('/extractnames', function(req, res){
	const spawn = require("child_process").spawn;
	const pythonProcess = spawn('python',["python/extractNames.py", req.body["title"]]);

	pythonProcess.stdout.on('data', (data) => {
		console.log("Data from extractNames.py: \n")
		console.log(data.toString());
	    res.send(data.toString()); 
	});

	pythonProcess.stderr.on('data', function(data) {
		console.log("Error from extractNames.py: \n")
	    console.error(data.toString());
	});
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))