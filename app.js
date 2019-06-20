const express = require('express')
const app = express()
const path = require('path');
const port = 3000
const fs = require('fs');
const Papa = require('papaparse');
const bodyParser = require('body-parser');
const utils = require('./utils');
const keyword_extractor = require("keyword-extractor");
const request = require('sync-request');
const cheerio = require('cheerio')
var catalog = {};


function init() {
	createMissingEntryFiles();
	catalog = readAllEntries();
}

init();
console.log(catalog)

function createMissingEntryFiles() {
	var emudata = fs.readFileSync(__dirname+"/data/ecatalog.csv", 'utf8');
    Papa.parse(emudata, {
	    complete: function(csv) {
	    	var catalogIndex = {};
	    	var data = utils.CSVToObject(csv);
	    	for (i in data) {
	    		var entryPath = __dirname + "/output/catalog/" + data[i]["irn"] + ".json";
				if (!fs.existsSync(entryPath)) {
					var photoData = {};
					photoData["irn"] = data[i]["irn"];
					photoData["emuInput"] = data[i];
					fs.writeFileSync(entryPath, JSON.stringify(photoData, null, '\t'), 'utf8'); 
				} else {
					console.log("File already exists: " + entryPath);
				}
	    	}
	    },
	    error: function(err) { console.log("ERROR parsing CSV: " + err); }
	});
}

function readAllEntries() {
	var result = {};
	var entryFileNames = (fs.readdirSync(__dirname + "/output/catalog/")).filter((entryFileName) => { 
		return entryFileName.endsWith(".json");
	});
	for (i in entryFileNames) {
		var entryPath = __dirname + "/output/catalog/" + entryFileNames[i];
		try {
			var entry = JSON.parse(fs.readFileSync(entryPath));
			result[entry['irn']] = entry;
		} catch (e) {
			console.log('ERROR PARSING JSON FILE (' + entryPath + '): ' + e);
		}
	}
	return result;
}


app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());


app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/review.html'));
});

app.get('/catalog',function(req,res){
    res.sendFile(path.join(__dirname+'/public/catalog.html'));
});

// Keep for dynamic updating of catalog if new csv is uploaded
// // Reads data from an EMU .csv, sends to client as javascript object
// app.all('/createcatalog', function(req, res){
//     var emudata = fs.readFileSync(__dirname+"/data/ecatalog.csv", 'utf8');
//     Papa.parse(emudata, {
// 	    complete: function(csv) {
// 	    	var catalogIndex = {};
// 	    	var data = utils.CSVToObject(csv);
// 	    	for (i in data) {
// 	    		var entryPath = __dirname + "/output/catalog/" + data[i]["irn"] + ".json";
// 				if (!fs.existsSync(entryPath)) {
// 					fs.writeFileSync(entryPath, JSON.stringify(data[i], null, '\t'), 'utf8'); 
// 				} else {
// 					console.log("File already exists: " + entryPath);
// 				}
// 	    	}
// 	    	res.sendFile(path.join(__dirname+'/public/catalog.html'));
// 	    },
// 	    error: function(err) { res.send("ERROR parsing CSV: " + err); }
// 	});
// });

// Saves archivist selections and edits to .json
app.all('/loadphoto', function(req, res){
	var irn = req.query.irn;
	var photoData = catalog[irn];
	res.send(photoData);
});

// Saves archivist selections and edits to .json
app.all('/catalogsize', function(req, res){
	var size = Object.keys(catalog).length;
	res.send("" + size);
});

// Saves archivist selections and edits to .json
app.all('/getentries', function(req, res){
	var length = parseInt(req.query.length);
	var index = parseInt(req.query.index);
	var result = [];
	var keys = Object.keys(catalog);
	for (var i = index; i < (index + length); i++) {
		if (keys[i] !== undefined) {
			result.push(catalog[keys[i]]);
		}
	}
	res.send(result);
});


// Saves archivist selections and edits to .json
app.all('/savephoto', function(req, res){
	var irn = req.body["irn"];
	var entryPath = __dirname + "/output/catalog/" + irn + ".json"
	var data = JSON.stringify(req.body, null, '\t');
	try {
		fs.writeFileSync(entryPath, data, 'utf8'); 
		var entry = JSON.parse(fs.readFileSync(entryPath));
		catalog[entry['irn']] = entry;
	} catch (e) {
		console.log('ERROR SAVING JSON FILE (' + entryPath + '): ' + e);
	}
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

// Saves archivist selections and edits to .json
app.all('/generatephoto', function(req, res){

	var emuOutputFields = [
		"irn",
		"TitAccessionNo",
		"CreDateCreated",
		"CreEarliestDate",
		"CreLatestDate",
		"PhyMediumComments",
		"TitMainTitle",
		"TitAlternateTitles_tab",
		// "TitAlternateTypes_tab",
		"CatDescriptText",
		"CatSubject_tab",
		"CatKeywords_tab",
		"CreCountry_tab",
		"CreState_tab",
		"CreDistrict_tab",
		"CreCity_tab",
		// "CrePlaceQualifier_tab",
		"People_NEEDSLABEL",
		"BibliographyPublication_NEEDSLABEL",
		"BibliographyPage_NEEDSLABEL",
		"BibliographyDate_NEEDSLABEL",
		"BibliographyCutline_NEEDSLABEL"
	]

	var irn = req.query.irn;
	var photoData = catalog[irn];
	
	var generatedPhotoData = {};
	generatedPhotoData["irn"] = photoData["irn"];
	generatedPhotoData["emuInput"] = photoData["emuInput"];
	generatedPhotoData["emuOutput"] = {};
	for (var i=0; i<emuOutputFields.length; i++) {
		var field = emuOutputFields[i];
		var data = photoData["emuInput"][field];
		data !== undefined ? generatedPhotoData["emuOutput"][field] = data : generatedPhotoData["emuOutput"][field] = "";
	}

	generateSuggestions(photoData["emuInput"]).then(function(suggestions){

		var emuField;
		var { 
			titleSuggestions, 
			peopleSuggestions, 
			subjectSuggestions,
			locationSuggestions,
			bibliographySuggestions,
			keywordSuggestions
		} = suggestions;

		generatedPhotoData["suggestions"] = {};
		generatedPhotoData["inReview"] = {};

		emuField = "TitAlternateTitles_tab";
		generatedPhotoData["suggestions"][emuField] = Object.values(titleSuggestions);
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "People_NEEDSLABEL";
		generatedPhotoData["suggestions"][emuField]  = Object.values(peopleSuggestions);
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CatSubject_tab";
		generatedPhotoData["suggestions"][emuField]  = subjectSuggestions;
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CreCountry_tab";
		generatedPhotoData["suggestions"][emuField]  = locationSuggestions["CreCountry_tab"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CreState_tab";
		generatedPhotoData["suggestions"][emuField]  = locationSuggestions["CreState_tab"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CreDistrict_tab";
		generatedPhotoData["suggestions"][emuField]  = locationSuggestions["CreDistrict_tab"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CreCity_tab";
		generatedPhotoData["suggestions"][emuField]  = locationSuggestions["CreCity_tab"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "BibliographyPublication_NEEDSLABEL";
		generatedPhotoData["suggestions"][emuField]  = bibliographySuggestions["publication"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "BibliographyPage_NEEDSLABEL";
		generatedPhotoData["suggestions"][emuField]  = bibliographySuggestions["page"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "BibliographyCutline_NEEDSLABEL";
		generatedPhotoData["suggestions"][emuField]  = bibliographySuggestions["cutline"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "BibliographyDate_NEEDSLABEL";
		generatedPhotoData["suggestions"][emuField]  = bibliographySuggestions["publication"];
		generatedPhotoData["inReview"][emuField] = 1;

		emuField = "CatKeywords_tab";
		generatedPhotoData["suggestions"][emuField]  = keywordSuggestions;
		generatedPhotoData["inReview"][emuField] = 1;

		res.send(JSON.stringify(generatedPhotoData));
	});
});


async function generateSuggestions(photo) {
	var titleSuggestions = await shortenTitle(photo["TitMainTitle"]);
	var peopleSuggestions = await extractPeople(photo["TitMainTitle"]);
	var { subjectSuggestions, subjectPlaces } = await suggestSubjects(photo["CatSubject_tab"], Object.values(peopleSuggestions));
	var locationSuggestions = await extractLocation(photo["CreCountry_tab"], photo["CreState_tab"], photo["CreDistrict_tab"], photo["CreCity_tab"], subjectPlaces)
	var bibliographySuggestions = await extractBibliography(photo["CatDescriptText"]);
	var keywordSuggestions = await generateKeywords(photo["TitMainTitle"], photo["CatDescriptText"], subjectPlaces);
	return { titleSuggestions, peopleSuggestions, subjectSuggestions, locationSuggestions, bibliographySuggestions, keywordSuggestions }
}

// Extracts Names
function extractPeople(title) {
	return new Promise(function(resolve, reject) {
		const spawn = require("child_process").spawn;
		const pythonProcess = spawn('python',["python/extractNames.py", title]);

		pythonProcess.stdout.on('data', (data) => {
			console.log("Data from extractNames.py:")
			console.log(data.toString());
			console.log("---------");
			resolve(JSON.parse(data));
		});

		pythonProcess.stderr.on('data', function(data) {
			console.log("Error from extractNames.py: \n")
		    console.error(data.toString());
		    console.log("---------");
		    reject();
		});
	});
}

// Shortens Title using Python NLP
function shortenTitle(title) {
	return new Promise(function(resolve, reject) {
		const spawn = require("child_process").spawn;
		const pythonProcess = spawn('python',["python/shortenTitle.py", title]);

		pythonProcess.stdout.on('data', (data) => {
			console.log("Data from shortenTitle.py:")
			console.log(data.toString());
			console.log("---------");
			resolve(JSON.parse(data));
		});

		pythonProcess.stderr.on('data', function(data) {
			console.log("Error from shortenTitle.py: \n")
		    console.error(data.toString());
		    console.log("---------");
		    reject();
		});
	});
}

function suggestSubjects(subjects, people) {
	return new Promise(function(resolve, reject) {
		var subjectSuggestions = [];
	    var subjectPlaces = [];
	    emuSubjects = subjects.split('\n');
		for (var i = 0; i < emuSubjects.length; i++) {
			var emuSubject = emuSubjects[i];
			// populate with exisiting subjects -- accepted
			subjectSuggestions.push({ data: emuSubject, status: "accepted" });
			var relatedSubjects = {};
			var cleanedSubject = "";
			// extract any location information from the subject headers
			// and rid the subject header of that extra information
			var split = [];
			var place = "";
			if (emuSubject.includes("--")) {
				split = emuSubject.split("--");
				if (split[0] !== undefined) { 
					cleanedSubject = split[0]; 
				} else { cleanedSubject = emuSubject; }
				for (var j = 1; j < split.length; j++) { place += split[j] + " "; }
			} else if (emuSubject.includes("(") && emuSubject.includes(")")) {
				split = emuSubject.split('(');
				cleanedSubject = emuSubject;
				for (var j = 1; j < split.length; j++) { place = split[0] + split[j].split(')')[0]; }
			} else {
				cleanedSubject = emuSubject;
			}
			if (place !== "" && subjectPlaces.indexOf(place) === -1) { subjectPlaces.push(place); }

			// add cleaned subject to related subjects
			if (cleanedSubject !== emuSubject) {
				subjectSuggestions.push({ data: cleanedSubject, status: "suggested" });
			}

			try {
				// Scrape library on congress site for headers
				var url = "http://id.loc.gov/search/?q="+cleanedSubject+"%20cs:http://id.loc.gov/authorities/subjects";
			 	var options = { headers: { 'User-Agent': 'request' } };
				var res = request('GET', url, options); 
			  	if (res.body !== undefined) {
				  var $ = cheerio.load(res.body);
				  $('[title="Click to view record"]').each(function(i, obj) {
				  	if (i < 3) {	
				  		if ($(this).text() !== emuSubject && $(this).text() !== cleanedSubject) {
					  		var suggestion = {};
					  		suggestion["data"] = $(this).text();
					  		suggestion["link"] = "http://id.loc.gov"+$(this).attr("href");
					  		suggestion["status"] = "suggested";
					    	subjectSuggestions.push(suggestion);
					    }
				    }
				  });
				}
			} catch (e) {
				resolve({ subjectSuggestions, subjectPlaces });
				console.log("ERROR LOOKING UP SUBJECT HEADERS" + e);
			}
		}
		resolve({ subjectSuggestions, subjectPlaces });
	});
}


function extractLocation(emuCountry, emuState, emuDistrict, emuCity, subjectPlaces) {
	return new Promise(function(resolve, reject) {
		var country = [];
		var state = [];
		var district = [];
		var city = [];

		// Basic Extraction From emu Data
		if (emuCountry !== "") {
			var countrySuggestion = {};
			countrySuggestion["data"] = emuCountry;
			countrySuggestion["status"] = "accepted";
			country.push(countrySuggestion);
		} 
		if (emuState !== "") {
			var stateSuggestion = {};
			stateSuggestion["data"] = emuState;
			stateSuggestion["status"] = "accepted";
			state.push(stateSuggestion);
		}
		if (emuDistrict !== "") {
			var districtSuggestion = {};
			districtSuggestion["data"] = emuDistrict;
			districtSuggestion["status"] = "accepted";
			district.push(districtSuggestion);
		}
		if (emuCity !== "") {
			var citySuggestion = {};
			citySuggestion["data"] = emuCity;
			citySuggestion["status"] = "accepted";
			city.push(citySuggestion);
		}

		// if (emuPlace !== "") {
		//	var place = {};
		//	place["data"] = emuPlace;
		//	place["source"] = ["CrePlaceQualifier_tab"];
		//	place["status"] = "suggested";
		//	locations["Place"][emuPlace.split(' ').join('')] = place;
		// }

		// Extraction From Subject Headers, added to Emu Data
		for (var i = 0; i < subjectPlaces.length; i++) {
			var subjectPlace = subjectPlaces[i];
			var mapResults = getPlaceFromAddress(subjectPlace);

			for (var index in mapResults) {
				var mapResult = mapResults[index];
				var data = mapResult["long_name"];
				var categoryKey = "";
				var placeKey = mapResult["long_name"].split(' ').join('');
				var types = mapResult["types"];

				// Find appropriate category (based on Google Map API)
				if (types.indexOf("point_of_interest") !== -1 ||
					types.indexOf("establishment") !== -1 ||
					types.indexOf("park") !== -1 ||
					types.indexOf("airport") !== -1 ||
					types.indexOf("natural_feature") !== -1 || 
					types.indexOf("premise") !== -1 ||
					types.indexOf("neighborhood") !== -1 ||
					types.indexOf("sublocality") !== -1) {
					categoryKey = "Place";
				} else if (types.indexOf("locality") !== -1) {
					var citySuggestion = {};
					citySuggestion["data"] = data;
					citySuggestion["status"] = "suggested";
					city.push(citySuggestion)
				} else if (types.indexOf("administrative_area_level_2") !== -1) {
					var districtSuggestion = {};
					districtSuggestion["data"] = data;
					districtSuggestion["status"] = "suggested";
					district.push(districtSuggestion)
				} else if (types.indexOf("administrative_area_level_1") !== -1) {
					var stateSuggestion = {};
					stateSuggestion["data"] = data;
					stateSuggestion["status"] = "suggested";
					state.push(stateSuggestion)
				} else if (types.indexOf("country") !== -1) {
					var countrySuggestion = {};
					countrySuggestion["data"] = data;
					countrySuggestion["status"] = "suggested";
					country.push(countrySuggestion)
				}
			}
		}

		resolve({ "CreCountry_tab": country, "CreState_tab": state, "CreDistrict_tab": district, "CreCity_tab": city });

	});
}


function getPlaceFromAddress(place) {
	try {
		var mappedPlace;
		var url =  "https://maps.googleapis.com/maps/api/geocode/json?address=" + place + "&key=AIzaSyCVx8lSSE73bw565GnKpAd9QGcS5B0TVxU";
		var options = { headers: { 'User-Agent': 'request' } };
		var res = request('GET', url, options);

		var mappedPlace = JSON.parse(res.body); 
	  	if (mappedPlace !== undefined && mappedPlace.results[0] !== undefined && mappedPlace.results[0].address_components !== undefined) {
	    	return mappedPlace.results[0].address_components;
	    } else {
	    	return [];
	    }
	   return [];
	} catch (e) {
		console.log("ERROR searching google map " + e)
		return [];
	}
}

function extractBibliography(description) {
	return new Promise(function(resolve, reject) {
		var bibliography = {};
		// Newspaper
		var paper = {};
		var extractedNewspaper = description.match(/in (.*) newspaper/);
		if (extractedNewspaper !== null) {
			for (var i = 1; i < extractedNewspaper.length; i++) {
				if (extractedNewspaper[i] !== undefined) { 
					paper["data"] = extractedNewspaper[i];
					paper["status"] = "accepted";
					break; 
				}
			}
		}
		bibliography["publication"] = [ paper ];

		// Date
		var date = {};
		var extractedDate = description.match(/, (.*), pg|newspaper (.*), pg/);
		if (extractedDate !== null) {
			for (var i = 1; i < extractedDate.length; i++) { 
				if (extractedDate[i] !== undefined) { 
					date["data"] = extractedDate[i];
					date["status"] = "accepted";
					break; 
				}
			}
		}
		bibliography["date"] = [ date ];

		// Page #
		var page = {};
		var extractedPage = description.match(/pg. ([0-9]*)|pg ([0-9]*)|page ([0-9]*)/);
		if (extractedPage !== null) {
			for (var i = 1; i < extractedPage.length; i++) {
				if (extractedPage[i] !== undefined) { 
					page["data"] = extractedPage[i];
					page["status"] = "accepted";
					break; 
				}
			}
		}
		bibliography["page"] = [ page ];

		// Cutline
		var cutline = {};
		var extractedCutline = description.match(/reads: "(.*)"|reads "(.*)"/);
		if (extractedCutline !== null) {
			for (var i = 1; i < extractedCutline.length; i++) {
				if (extractedCutline[i] !== undefined) { 
					cutline["data"] = extractedCutline[i];
					cutline["status"] = "accepted";
					break; 
				}
			}
		}
		bibliography["cutline"] = [ cutline ];

		resolve(bibliography);
	});
}



function generateKeywords(title, description, placeList) {
	return new Promise(function(resolve, reject) {
		var keywords = [];

		const spawn = require("child_process").spawn;
		const pythonProcess = spawn('python',["python/extractKeywords.py", title + " " + description + " " + placeList.join(", ")]);

		console.log(title + " " + description + " " + placeList.join(", "));

		pythonProcess.stdout.on('data', (data) => {
			console.log("Data from extractKeywords.py: \n")
			console.log(data.toString())
		    // res.send(data.toString());
		    placeList = placeList.map((place) => {
		    	return {
		    		data: place,
		    		status: "suggested"
		    	}
		    })
		    resolve(Object.values(JSON.parse(data)).concat(placeList));
		});

		pythonProcess.stderr.on('data', function(data) {
			console.log("Error from extractKeywords.py: \n")
		    console.error(data.toString());
		    reject()
		});
	});
}



app.listen(port, () => console.log(`Example app listening on port ${port}!`))