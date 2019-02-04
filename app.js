const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const fs = require('fs');
const Papa = require('papaparse');

app.use(express.static(__dirname + '/public'));


function loadEmuCSV(filename) {
	console.log(filename);  
}


app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

// Get data from an EMU export and covert it to JSON/js object
app.get('/emudata',function(req,res){
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
	                if (key === "irn") { irn = value.toString(); }
	                entry[key]=value;
	            }
	            entries[irn]=entry;
	        }
	        console.log(entries);
	        return entries;
	    }
	});
    res.send(JSON.stringify(entries));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))