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
		//var namelist = "";
		// TO DO, change to getters and setters 
		//for (var i=0; i<photoData["people"].length; i++) {
		//	if (photoData["people"][i]["status"] === "accepted") {
		//		namelist += photoData["people"][i]["data"] + ", ";
		//	}
		//}
		//photoData["emuOutput"]["Names"] = namelist.substring(0, namelist.length - 2);

		// Extract and format subject headers
		var { subjects, subjectPlaces } = extractSubjects(photo["emuInput"]["CatSubject_tab"]);
		photoData["subjects"] = subjects;

		// Make a guess at location details
		photoData["location"] = extractLocation(
			photo["emuInput"]["TitMainTitle"],
			photo["emuInput"]["CatDescriptText"], 
			photo["emuInput"]["CreCountry_tab"],
			photo["emuInput"]["CreState_tab"],
			photo["emuInput"]["CreDistrict_tab"],
			photo["emuInput"]["CreCity_tab"],
			photo["emuInput"]["CrePlaceQualifier_tab"],
			subjectPlaces
		);

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
	var date = { "name": "Date", "data" : null };
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




function extractSubjects(emuSubjects) {
	var subjects = [];
	var subjectPlaces = [];

	emuSubjects = emuSubjects.split('\n');
	console.log("---------Subject Headers------------");

	for (var i = 0; i < emuSubjects.length; i++) {

		var newSubject = "";
		var source = [];

		var emuSubject = emuSubjects[i];
		console.log("Original subject: " + emuSubject);

		var split = [];
		var place = "";

		var establishment = [];

		if (emuSubject.includes("--")) {
			split = emuSubject.split("--");
			if (split[0] !== undefined) { 
				newSubject = split[0]; 
				source.push("Removed location qualifier");
			} else { newSubject = emuSubject; }
			for (var j = 1; j < split.length; j++) { place += split[j] + " "; }
		} else if (emuSubject.includes("(") && emuSubject.includes(")")) {
			split = emuSubject.split('(');
			establishment.push(split[0]);
			newSubject = emuSubject;
			for (var j = 1; j < split.length; j++) { place = split[0] + split[j].split(')')[0]; }
		} else {
			newSubject = emuSubject;
		}
		
		if (place !== "" && subjectPlaces.indexOf(place) === -1) { subjectPlaces.push(place); }

		var subject = {};
		subject["data"] = newSubject;
		subject["source"] = source;
		subject["status"] = "suggested";
		subjects.push(subject);
		//console.log("Updated subjects");
		//console.log(subjects);


		// extract keywords from title, description, and subjects
	    $.ajax({
	        url: "/extractsubjects",
	        type: 'post',
	        async: false,
	        data: {"subject" : newSubject},
	        complete: function (res) { 
	        	console.log("Suggestions: ");  

	        	var suggestions = JSON.parse(res.responseText);
	        	if (suggestions.length === 0) {
	            	console.log("No Suggestions, may not be a valid subject header");
	            }
	        	for (var i = 0; i < suggestions.length; i++) {
	        		console.log(suggestions[i]);
	        	}
	        },
	     });

	    console.log("--------------------");

	}

	return { subjects, subjectPlaces };
}


////////////////////// LOCATION /////////////////////////////

function extractLocation(emuTitle, emuDescription, emuCountry, emuState, emuDistrict, emuCity, emuPlace, subjectPlaces) {

	var locations = { 
		"Country" : {},
		"State" : {},
		"District" : {},
		"City" : {},
		"Place" : {},
	};

	// Basic Extraction From emu Data
	if (emuCountry !== "") {
		var country = {};
		country["data"] = emuCountry;
		country["source"] = ["CreCountry_tab"];
		country["status"] = "suggested";
		locations["Country"][emuCountry.split(' ').join('')] = country;
	}

	if (emuState !== "") {
		var state = {};
		state["data"] = emuState;
		state["source"] = ["CreState_tab"];
		state["status"] = "suggested";
		locations["State"][emuState.split(' ').join('')] = state;
	}

	if (emuDistrict !== "") {
		var district = {};
		district["data"] = emuDistrict;
		district["source"] = ["CreDistrict_tab"];
		district["status"] = "suggested";
		locations["District"][emuDistrict.split(' ').join('')] = district;
	}

	if (emuCity !== "") {
		var city = {};
		city["data"] = emuCity;
		city["source"] = ["CreCity_tab"];
		city["status"] = "suggested";
		locations["City"][emuCity.split(' ').join('')] = city;
	}

	if (emuPlace !== "") {
		var place = {};
		place["data"] = emuPlace;
		place["source"] = ["CrePlaceQualifier_tab"];
		place["status"] = "suggested";
		locations["Place"][emuPlace.split(' ').join('')] = place;
	}

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
				categoryKey = "City";
			} else if (types.indexOf("administrative_area_level_2") !== -1) {
				categoryKey = "District";
			} else if (types.indexOf("administrative_area_level_1") !== -1) {
				categoryKey = "State";
			} else if (types.indexOf("country") !== -1) {
				categoryKey = "Country";
			}


			if (categoryKey !== "") {
				if (locations[categoryKey][placeKey] === undefined) {
					var place = {};
					place["data"] = data;
					place["source"] = ["CatSubject_tab"];
					place["status"] = "suggested";
					locations[categoryKey][placeKey] = place;
				} else {
					if (locations[categoryKey][placeKey]["source"].indexOf("CatSubject_tab") === -1) { 
						locations[categoryKey][placeKey]["source"].push("CatSubject_tab"); 
					}
					locations[categoryKey][placeKey]["status"] = "accepted";
				}
			}
		}
	}

	return locations;
}


function getPlaceFromAddress(place) {
	var mappedPlace;
	var url =  "https://maps.googleapis.com/maps/api/geocode/json?address="+
			   place+
			   "&key=AIzaSyCVx8lSSE73bw565GnKpAd9QGcS5B0TVxU";

	$.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
			if (data.status === "OK") { mappedPlace = data; }
        },
        data: {},
        async: false
    });

	if (mappedPlace !== undefined && mappedPlace.results[0] !== undefined && mappedPlace.results[0].address_components !== undefined) {
    	return mappedPlace.results[0].address_components;
    } else {
    	return [];
    }
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
    console.log("--------------KEYWORDS--------------");
    for (var i = 0; i < extractedKeywords.length; i++){
    	console.log(extractedKeywords[i]["data"]);
    }
    console.log("----------------------------");
    // console.log(extractedKeywords);
    return extractedKeywords;
}