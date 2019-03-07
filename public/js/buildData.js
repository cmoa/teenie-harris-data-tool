function createCatalog(ecatalog) {
	for (id in ecatalog) {
		var photo =  {};
		photo["id"] = id;
		// Populate entry with its emu data
		photo["emu"] = ecatalog[id];
		// Mark as not reviewed or approved
		photo["generated"] = false;
		photo["reviewed"] = false;
		photo["flagged"] = false;
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
		photoData["emu"] = photo["emu"];
		// Mark as not reviewed or approved
		photoData["generated"] = true;
		photoData["reviewed"] = false;
		photoData["flagged"] = false;
		// Make titles 
		photoData["titles"] = extractTitles(photo["emu"]["TitMainTitle"]);
		// Make article 
		photoData["article"] = extractArticle(photo["emu"]["CatDescriptText"]);
		// Make list of people 
		photoData["people"] = extractPeople(photo["emu"]["TitMainTitle"], photo["emu"]["CatDescriptText"]);
		// Make a guess at location details
		photoData["location"] = extractLocation(
			photo["emu"]["TitMainTitle"],
			photo["emu"]["CatDescriptText"], 
			photo["emu"]["CreCountry_tab"],
			photo["emu"]["CreState_tab"],
			photo["emu"]["CreDistrict_tab"],
			photo["emu"]["CreCity_tab"],
			photo["emu"]["CrePlaceQualifier_tab"]
		);
		// Extract and format subject headers
		photoData["subjects"] = extractSubjects(photo["emu"]["CatSubject_tab"]);
		// Generate keywords
		photoData["keywords"] = extractKeywords();

		resolve(photoData);
	});
}



function buildManifest(emu) {
	
}


function extractTitles(emuTitle) {
	var titles =[];

	var acceptedTitle = {};
	acceptedTitle["data"] = emuTitle;
	acceptedTitle["source"] = ["eMU"];
	acceptedTitle["status"] = "accepted";
	titles.push(acceptedTitle);

	// Algorithms
	var suggestedTitle = shortenTitle(emuTitle);
	titles.push(suggestedTitle);
	
	return titles;
}


function extractArticle(emuDescription) {
	var accepted = [];
	var suggestions = [];

	// TODO: implement article extraction
	var paper = {};
	paper["name"] = "Paper";
	paper["data"] = "Pittsburgh Courier";
	paper["source"] = ["eMU CatDescriptText"];
	suggestions.push(paper);

	var date = {};
	date["name"] = "Publication Date";
	date["data"] = "May 30, 1953";
	date["source"] = ["eMU CatDescriptText"];
	suggestions.push(date);

	var cutline = {};
	cutline["name"] = "Cutline";
	cutline["data"] = "Pittsburgh Courier";
	cutline["source"] = ["eMU CatDescriptText"];
	suggestions.push(cutline);


	return { "accepted" : accepted, "suggestions" : suggestions };
}


function extractPeople(emuTitle, emuDescription) {
	var people = [];

	// TODO: implement named entity recognition alogrithm
	// for (var i = 0; i < 10; i++) {
	//	var suggestedPerson = {};
	//	suggestedPerson["data"] = "Suggested Person " + (i+1);
	//	suggestedPerson["source"] = ["source(TBD)"];
	//	suggestedPerson["status"] = "suggested";
	//	people.push(suggestedPerson);
	// }

	// Algorithms
	// extractNames(emuTitle);

	return people;
}


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

	for (var i = 0; i < emuSubjects.length; i++) {
		var emuSubject = {};
		emuSubject["data"] = emuSubjects[i];
		emuSubject["source"] = ["emuSubjects"];
		emuSubject["status"] = "suggested";
		subjects.push(emuSubject);
	}

	// Algorithm to edit subject headers goes here
	for (var i = 0; i < emuSubjects.length; i++) {
		if (emuSubjects[i].substr(emuSubjects[i].length - 27) === "--Pennsylvania--Pittsburgh.") {
			var emuSubject = {};
			emuSubject["data"] = emuSubjects[i].substring(0, emuSubjects[i].length - 27);
			emuSubject["source"] = ["Removed location qualifier"];
			emuSubject["status"] = "accepted";
			subjects.push(emuSubject);
		}
	}

	return subjects;
}

function extractKeywords() {
	var keywords = [];

	// TODO: implement named entity recognition alogrithm
	for (var i = 0; i < 10; i++) {
		var keyword = {};
		keyword["data"] = "Suggested Keyword " + (i+1);
		keyword["source"] = ["source(TBD)"];
		keyword["status"] = "suggested";
		keywords.push(keyword);
	}

	return keywords;
}