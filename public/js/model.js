var emuOutput = {
	"ecatalogue_key": null,
	"irn": null,
	"TitAccessionNo": null,

	// TITLES
	"TitMainTitle": null,
	"TitAlternateTitles": null,

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
	// "CrePlaceQualifier_tab": null,

	// NAMES
	"Names": null,

	// "Keywords": null,
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
		photo["flagged"] = {
			titles: false,
			people: false,
			location: false,
			article: false,
			subjects: false,
			keywords: false,
		};
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
		photoData["flags"] = {
			titles: false,
			people: false,
			location: false,
			article: false,
			subjects: false,
			keywords: false,
		};
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
		// photoData["keywords"] = extractKeywords(photo["emuInput"]["TitMainTitle"], photo["emuInput"]["CatDescriptText"], photo["emuInput"]["CatSubject_tab"]);

		resolve(photoData);
	});
}


// Handle Mapping Here
function updateEmuOutput() {
	console.log("EMU OUTPUT")

	// Map titles
	photo["emuOutput"]["TitAlternateTitles"] = "";
	for (var i = 0; i < photo["titles"].length; i++) {
		var title = photo["titles"][i];
		if (title["status"] === "accepted" && title["data"] !== "") {
			photo["emuOutput"]["TitAlternateTitles"] += title["data"] + ",\n";
		}
	}
	photo["emuOutput"]["TitAlternateTitles"] = photo["emuOutput"]["TitAlternateTitles"].substring(0, photo["emuOutput"]["TitAlternateTitles"].length - 2);

	// Map people
	photo["emuOutput"]["Names"] = "";
	for (var i = 0; i < photo["people"].length; i++) {
		var person = photo["people"][i];
		if (person["status"] === "accepted" && person["data"] !== "") {
			photo["emuOutput"]["Names"] += person["data"] + ",\n";
		}
	}
	photo["emuOutput"]["Names"] = photo["emuOutput"]["Names"].substring(0, photo["emuOutput"]["Names"].length - 2);

	// Map locations
	photo["emuOutput"]["CatSubject_tab"] = "";
	photo["emuOutput"]["CreCountry_tab"] = "";
	photo["emuOutput"]["CreState_tab"] = "";
	photo["emuOutput"]["CreDistrict_tab"] = "";
	photo["emuOutput"]["CreCity_tab"] = "";
	photo["emuOutput"]["CrePlaceQualifier_tab"] = "";
	for (category in photo["location"]) {
		for (place in photo["location"][category]) {
			if (photo["location"][category][place]["status"] === "accepted") {
				switch (category) {
					case "Country":
						photo["emuOutput"]["CreCountry_tab"] = photo["location"][category][place]["data"];
						break;
					case "State":
						photo["emuOutput"]["CreState_tab"] = photo["location"][category][place]["data"];
						break;
					case "District":
						photo["emuOutput"]["CreDistrict_tab"] = photo["location"][category][place]["data"];
						break;
					case "City":
						photo["emuOutput"]["CreCity_tab"] = photo["location"][category][place]["data"];
						break;
				}
			}
		}
	}

	// Newspaper
	photo["emuOutput"]["Article"] = "";
	for (var i=0; i<photo["article"].length; i++) {
		if (photo["article"][i]["status"] === "accepted") {
			photo["emuOutput"]["Article"] += photo["article"][i]["name"] + ": ";
			photo["emuOutput"]["Article"] += photo["article"][i]["data"] + "\n";
		}
	}
	photo["emuOutput"]["Article"] = photo["emuOutput"]["Article"].substring(0, photo["emuOutput"]["Article"].length - 1);

	populateEmuRecordView();
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

	// var acceptedTitle = {};
	// acceptedTitle["data"] = emuTitle;
	// acceptedTitle["source"] = ["TitMainTitle"];
	// acceptedTitle["status"] = "accepted";
	// titles.push(acceptedTitle);

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
				paper["source"] = ["CatDescriptText"];
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
				date["source"] = ["CatDescriptText"];
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
				page["source"] = ["CatDescriptText"];
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
				cutline["source"] = ["CatDescriptText"];
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
	var subjects = {};
	var subjectPlaces = [];

	emuSubjects = emuSubjects.split('\n');

	for (var i = 0; i < emuSubjects.length; i++) {

		var emuSubject = emuSubjects[i];
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
		relatedSubjects[cleanedSubject.split(" ").join("")] = { data: cleanedSubject, source: ["CatSubject_tab"], status: "suggested" };

		// scrape library of congress for more related subject headers
	    $.ajax({
	        url: "/extractsubjects",
	        type: 'post',
	        async: false,
	        data: {"subject" : cleanedSubject},
	        complete: function (res) {
	        	var suggestions = JSON.parse(res.responseText);
	        	for (var i = 0; i < suggestions.length; i++) {
	        		var relatedSubject = {};
	        		var relatedSubjectKey = suggestions[i]["subject"].split(" ").join("");
	        		relatedSubject["data"] = suggestions[i]["subject"];
	        		relatedSubject["link"] = suggestions[i]["link"];
	        		relatedSubject["source"] = ["Library of Congress"];
	        		relatedSubject["status"] = "suggested";

	        		if (relatedSubjects[relatedSubjectKey] !== undefined) {
	        			relatedSubjects[relatedSubjectKey]["data"] = suggestions[i]["subject"];
	        			relatedSubjects[relatedSubjectKey]["link"] = suggestions[i]["link"];
	        			relatedSubjects[relatedSubjectKey]["source"].push("Library of Congress");
	        			relatedSubjects[relatedSubjectKey]["status"] = "accepted";
	        		} else {
	        			relatedSubjects[relatedSubjectKey] = relatedSubject;
	        		}
	        	} 
	        }
	    });

		subjects[emuSubject.split(" ").join("")] = {
			"original" : emuSubject,
			"related" : relatedSubjects
		}
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
		// "Place" : {},
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
			// if (types.indexOf("point_of_interest") !== -1 ||
			// 	types.indexOf("establishment") !== -1 ||
			// 	types.indexOf("park") !== -1 ||
			// 	types.indexOf("airport") !== -1 ||
			// 	types.indexOf("natural_feature") !== -1 || 
			// 	types.indexOf("premise") !== -1 ||
			// 	types.indexOf("neighborhood") !== -1 ||
			// 	types.indexOf("sublocality") !== -1) {
			// 	categoryKey = "Place";
			// } 

			if (types.indexOf("locality") !== -1) {
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

	if (Object.keys(locations["Country"]).length === 0) {
		var country = {};
		country["data"] = "";
		country["source"] = [""];
		country["status"] = "suggested";
		locations["Country"]["AddCountry"] = country;
	}

	if (Object.keys(locations["State"]).length === 0) {
		var state = {};
		state["data"] = "";
		state["source"] = [""];
		state["status"] = "suggested";
		locations["State"]["AddState"] = state;
	}

	if (Object.keys(locations["District"]).length === 0) {
		var district = {};
		district["data"] = "";
		district["source"] = [""];
		district["status"] = "suggested";
		locations["District"]["AddDistrict"] = district;
	}

	if (Object.keys(locations["City"]).length === 0) {
		var city = {};
		city["data"] = "";
		city["source"] = [""];
		city["status"] = "suggested";
		locations["City"]["AddCity"] = city;
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
    
    // console.log(extractedKeywords);
    return extractedKeywords;
}