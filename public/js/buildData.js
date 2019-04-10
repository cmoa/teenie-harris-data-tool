var emuOutput = {
	"ecatalogue_key": null,
	"irn": null,
	"TitAccessionNo": null,
	"TitMainTitle": null,
	"CreDateCreated": null,
	"CreEarliestDate": null,
	"CreLatestDate": null,
	"PhyMediumComments": null,
	"CatDescriptText": null,
	"CatSubject_tab": null,
	"CreCountry_tab": null,
	"CreState_tab": null,
	"CreDistrict_tab": null,
	"CreCity_tab": null,
	"CrePlaceQualifier_tab": null,

	// New Fields
	"Names": null,
	"Keywords": null,
	"Article": null,
}


function createCatalog(ecatalog) {
	for (id in ecatalog) {
		var photo =  {};
		photo["id"] = id;
		// Populate entry with its original emu data
		photo["emuInput"] = ecatalog[id];
		// Mark as not reviewed or approved
		photo["generated"] = false;
		photo["reviewed"] = false;
		photo["flagged"] = false;
		photo["approved"] = false;
		// Save entry to catalog
		catalog[id] = photo;
	}
	// set to edit first photo
	catalog["currentPhoto"] = JSON.parse(JSON.stringify(catalog["1"]));
	// save to json file
	saveCatalog();
}


function generatePhoto(photo) {
	return new Promise(function(resolve, reject) {
		var photoData = {};

		photoData["id"] = photo["id"];
		// Populate entry with its emu data
		photoData["emuInput"] = photo["emuInput"];
		photoData["emuOutput"] = Object.assign({}, emuOutput, photo["emuInput"]);
		console.log(emuOutput);
		console.log(photo["emuOutput"]);
		// Mark as not reviewed or approved
		photoData["generated"] = true;
		photoData["reviewed"] = false;
		photoData["flagged"] = false;
		photoData["approved"] = false;
		// Make titles 
		photoData["titles"] = extractTitles(photo["emuInput"]["TitMainTitle"]);
		// Make article 
		photoData["article"] = extractArticle(photo["emuInput"]["CatDescriptText"]);
		// Make list of people 
		photoData["people"] = extractPeople(photo["emuInput"]["TitMainTitle"], photo["emuInput"]["CatDescriptText"]);
		// Make a guess at location details
		photoData["location"] = extractLocation(
			photo["emuInput"]["TitMainTitle"],
			photo["emuInput"]["CatDescriptText"], 
			photo["emuInput"]["CreCountry_tab"],
			photo["emuInput"]["CreState_tab"],
			photo["emuInput"]["CreDistrict_tab"],
			photo["emuInput"]["CreCity_tab"],
			photo["emuInput"]["CrePlaceQualifier_tab"]
		);
		// Extract and format subject headers
		photoData["subjects"] = extractSubjects(photo["emuInput"]["CatSubject_tab"]);
		// Generate keywords
		photoData["keywords"] = extractKeywords(photo["emuInput"]["TitMainTitle"], photo["emuInput"]["CatDescriptText"], photo["emuInput"]["CatSubject_tab"]);

		resolve(photoData);
	});
}



function buildManifest(emu) {	
}


///////////////// TITLE /////////////////////////////////

function shortenTitle(title) {
    var shortenedTitle = {};
    $.ajax({
        url: "/shortentitle",
        type: 'post',
        async: false,
        data: {"title" : title},
        complete: function (res) { 
            // Add completed title to manifest and refresh title div
            shortenedTitle["data"] = res.responseText;
            shortenedTitle["source"] = ["Spacy suggestion"];
            shortenedTitle["status"] = "suggested";
        },
     });
    return shortenedTitle;
}

function extractTitles(emuTitle) {
	var titles =[];

	var acceptedTitle = {};
	acceptedTitle["data"] = emuTitle;
	acceptedTitle["source"] = ["TitMainTitle"];
	acceptedTitle["status"] = "accepted";
	titles.push(acceptedTitle);

	// Algorithms
	var suggestedTitle = shortenTitle(emuTitle);
	titles.push(suggestedTitle);
	
	return titles;
}


//////////////// NEWS PAPER //////////////////////////////

function extractArticle(emuDescription) {
	var article = [];

	// Newspaper
	var paper = { "name": "Publication", "data" : null };
	var extractedNewspaper = emuDescription.match(/in (.*) newspaper/);
	if (extractedNewspaper !== null) {
		for (var i = 1; i < extractedNewspaper.length; i++) {
			if (extractedNewspaper[i] !== undefined) { 
				paper["data"] = extractedNewspaper[i];
				paper["source"] = ["eMU CatDescriptText"];
				paper["status"] = "accepted";
				break; 
			}
		}
	}
	article.push(paper);

	// Date
	var date = { "name": "Publication Date", "data" : null };
	var extractedDate = emuDescription.match(/, (.*), pg|newspaper (.*), pg/);
	if (extractedDate !== null) {
		for (var i = 1; i < extractedDate.length; i++) { 
			if (extractedDate[i] !== undefined) { 
				date["data"] = extractedDate[i];
				date["source"] = ["eMU CatDescriptText"];
				date["status"] = "accepted";
				break; 
			}
		}
	}
	article.push(date);

	// Page #
	var page = { "name": "Page", "data" : null };
	var extractedPage = emuDescription.match(/pg. ([0-9]*)|pg ([0-9]*)|page ([0-9]*)/);
	if (extractedPage !== null) {
		for (var i = 1; i < extractedPage.length; i++) {
			if (extractedPage[i] !== undefined) { 
				page["data"] = extractedPage[i];
				page["source"] = ["eMU CatDescriptText"];
				page["status"] = "accepted";
				break; 
			}
		}
	}
	article.push(page);

	// Cutline
	var cutline = { "name": "Cutline", "data" : null };
	var extractedCutline = emuDescription.match(/reads: "(.*)"|reads "(.*)"/);
	if (extractedCutline !== null) {
		for (var i = 1; i < extractedCutline.length; i++) {
			if (extractedCutline[i] !== undefined) { 
				cutline["data"] = extractedCutline[i];
				cutline["source"] = ["eMU CatDescriptText"];
				cutline["status"] = "accepted";
				break; 
			}
		}
	}
	article.push(cutline);

	return article;
}


/////////////////////// NAMES /////////////////////////////////


function extractPeople(emuTitle, emuDescription) {
	var extractedNamesList = [];
	var extractedNames = {};

	// Extract From Title
    $.ajax({
        url: "/extractnames",
        type: 'post',
        async: false,
        data: {"text" : emuTitle },
        complete: function (res) { 
            var people = res.responseText.split(",");
            for (var i = 0; i < people.length; i++) { 
            	if (extractedNames[people[i]] === undefined || extractedNames[people[i]]["source"] === undefined) {
	                extractedNames[people[i]] = { "source" : ["TitMainTitle"] };
	            } else {
	            	extractedNames[people[i]]["source"].push("TitMainTitle");
	            } 
           	}
        },
    });

    // Extract From Description
    $.ajax({
        url: "/extractnames",
        type: 'post',
        async: false,
        data: {"text" : emuDescription},
        complete: function (res) { 
            var people = res.responseText.split(",");
            for (var i = 0; i < people.length; i++) {
            	if (extractedNames[people[i]] === undefined || extractedNames[people[i]]["source"] === undefined) {
	                extractedNames[people[i]] = { "source" : ["CatDescriptText"] };
	            } else {
	            	extractedNames[people[i]]["source"].push("CatDescriptText");
	            }
            }
        },
    });

    for (name in extractedNames) {
    	var extractedName = {
    		data: name,
    		source: extractedNames[name]["source"],
    		status: extractedNames[name]["source"].length > 1 ? "accepted" : "suggested",
    	}
    	extractedNamesList.push(extractedName);
    }

    return extractedNamesList;
}

////////////////////// LOCATION /////////////////////////////

function extractLocation(emuTitle, emuDescription, emuCountry, emuState, emuDistrict, emuCity, emuPlace) {
	var location = [];

	// TODO: implement location extraction
	if (emuCountry !== "") {
		var country = {};
		country["name"] = "Country";
		country["data"] = emuCountry;
		country["source"] = ["eMU CreCountry_tab"];
		country["status"] = "accepted";
		location.push(country);
	}

	if (emuState !== "") {
		var state = {};
		state["name"] = "State";
		state["data"] = emuState;
		state["source"] = ["eMU CreState_tab"];
		state["status"] = "accepted";
		location.push(state);
	}

	if (emuDistrict !== "") {
		var district = {};
		district["name"] = "District";
		district["data"] = emuDistrict;
		district["source"] = ["eMU CreDistrict_tab"];
		district["status"] = "accepted";
		location.push(district);
	}

	if (emuCity !== "") {
		var city = {};
		city["name"] = "City";
		city["data"] = emuCity;
		city["source"] = ["eMU CreCity_tab"];
		city["status"] = "accepted";
		location.push(city);
	}

	if (emuPlace !== "") {
		var place = {};
		place["name"] = "Place";
		place["data"] = emuPlace;
		place["source"] = ["eMU CrePlaceQualifier_tab"];
		place["status"] = "accepted";
		location.push(place);
	}

	return location;
}


function extractSubjects(emuSubjects) {
	var subjects = [];
	emuSubjects = emuSubjects.split('\n');
	console.log("EMU Subjects");
	console.log(emuSubjects);

	for (var i = 0; i < emuSubjects.length; i++) {

		var newSubject = "";
		var source = [];

		var emuSubject = emuSubjects[i];

		var split = [];
		var place = "";

		var establishment = [];

		if (emuSubject.includes("--")) {
			split = emuSubject.split("--");
			if (split[0] !== undefined) { 
				newSubject = split[0]; 
				source.push("Removed location qualifier");
			} else { newSubject = emuSubject; }
			for (var j = 1; j < split.length; j++) { place += split[j] + "+"; }
		} else if (emuSubject.includes("(") && emuSubject.includes(")")) {
			split = emuSubject.split('(');
			establishment.push(split[0]);
			newSubject = emuSubject;
			for (var j = 1; j < split.length; j++) { place = split[0] + split[j].split(')')[0]; }
		} else {
			newSubject = emuSubject;
		}
		//console.log(i);
		//console.log(place);
		
		if (place !== "") { getPlaceFromAddress(place); }

		var subject = {};
		subject["data"] = newSubject;
		subject["source"] = source;
		subject["status"] = "suggested";
		subjects.push(subject);
		console.log("Updated subjects");
		console.log(subjects);


		// extract keywords from title, description, and subjects
	    $.ajax({
	        url: "/extractsubjects",
	        type: 'post',
	        async: false,
	        data: {"subject" : newSubject},
	        complete: function (res) { 
	        	console.log(newSubject);
	        	console.log(JSON.parse(res.responseText));
	        },
	     });

	}

	return subjects;
}


function getPlaceFromAddress(place) {
	var url =  "https://maps.googleapis.com/maps/api/geocode/json?address="+
			   place+
			   "&key=AIzaSyCVx8lSSE73bw565GnKpAd9QGcS5B0TVxU";

	$.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
        	var d = data;
			if (d.status === "OK") {
				var addressComponents = d.results[0].address_components;
				for (var i = 0; i<addressComponents.length; i++) {
					var addressComponentTypes = addressComponents[i].types;
					for (var j = 0; j < addressComponentTypes.length; j++) {
						var type = addressComponentTypes[j];
						// console.log(type);
						// console.log(addressComponents[i].long_name);
					}
				}
			}
        },
        data: {},
        async: false
    });
}


function extractKeywords(emuTitle, emuDescription, emuSubjects) {
	var extractedKeywords = [];

	// extract keywords from title, description, and subjects
    $.ajax({
        url: "/extractkeywords",
        type: 'post',
        async: false,
        data: {"source" : emuTitle.concat([" "], emuDescription)},
        complete: function (res) { 
           var keywords = res.responseText.split(",");
            for (var i = 0; i < keywords.length; i++) {
                var suggestedKeyword = {};
                suggestedKeyword["data"] = keywords[i];
                suggestedKeyword["source"] = ["Spacy"];
                suggestedKeyword["status"] = "suggested";
                extractedKeywords.push(suggestedKeyword);
            }
        },
     });

    // create keywords from date
    // console.log(photo["article"]["date"]);

    // create keywords from subject headers

    return extractedKeywords;
}