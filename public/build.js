function buildManifest(emu) {
	var manifest = {};
	for (entry in emu) {
		var entryData =  {};

		// Populate entry with its emu data
		entryData["emu"] = emu[entry];

		// Make titles 
		entryData["titles"] = extractTitles(emu[entry]["TitMainTitle"]);

		// Make article 
		entryData["article"] = extractArticle(emu[entry]["CatDescriptText"]);

		// Make list of people 
		entryData["people"] = extractPeople(emu[entry]["TitMainTitle"], emu[entry]["CatDescriptText"]);

		// Make a guess at location details
		entryData["location"] = extractLocation(
			emu[entry]["TitMainTitle"],
			emu[entry]["CatDescriptText"], 
			emu[entry]["CatCountry_tab"],
			emu[entry]["CatState_tab"],
			emu[entry]["CatDistrict_tab"],
			emu[entry]["CatCity_tab"],
			emu[entry]["CrePlaceQualifier_tab"]
		);

		// Extract and format subject headers
		entryData["subjects"] = extractSubjects(emu[entry]["CatSubject_tab"]);

		// Generate keywords
		entryData["keywords"] = extractKeywords();

		manifest[entry] = entryData;
	}
	console.log(manifest);
	return manifest;
}


function extractTitles(emuTitle) {
	var accepted = [];
	var suggestions = [];

	var acceptedTitle = {};
	acceptedTitle["data"] = emuTitle;
	acceptedTitle["source"] = ["eMU"];
	accepted.push(acceptedTitle);

	// TODO: implement title alogrithm
	for (var i = 0; i < 3; i++) {
		var suggestedTitle = {};
		suggestedTitle["data"] = "Suggested Title " + (i+1);
		suggestedTitle["source"] = ["source(TBD)"];
		suggestions.push(suggestedTitle);
	}

	return { "accepted" : accepted, "suggestions" : suggestions };
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
	var accepted = [];
	var suggestions = [];

	// TODO: implement named entity recognition alogrithm
	for (var i = 0; i < 10; i++) {
		var suggestedPerson = {};
		suggestedPerson["data"] = "Suggested Person " + (i+1);
		suggestedPerson["source"] = ["source(TBD)"];
		suggestions.push(suggestedPerson);
	}

	return { "accepted" : accepted, "suggestions" : suggestions };
}


function extractLocation(emuTitle, emuDescription, emuCountry, emuState, emuDistrict, emuCity, emuPlace) {
	var accepted = [];
	var suggestions = [];

	// TODO: implement location extraction
	var country = {};
	country["name"] = "Country";
	country["data"] = "United States";
	country["source"] = ["eMU CatCountry_tab"];
	accepted.push(country);

	var state = {};
	state["name"] = "State";
	state["data"] = "Pennsylvania";
	state["source"] = ["eMU CatState_tab"];
	accepted.push(state);


	var district = {};
	district["name"] = "District";
	district["data"] = "Allegheny County";
	district["source"] = ["Google Maps"];
	suggestions.push(district);


	var city = {};
	city["name"] = "City";
	city["data"] = "Pennsylvania";
	city["source"] = ["eMU CatCity_tab"];
	accepted.push(city);

	var place1 = {};
	place1["name"] = "Place";
	place1["data"] = "Kennard Field";
	place1["source"] = ["emuDescription", "emuTitle"];
	suggestions.push(place1);

	var place2 = {};
	place2["name"] = "Place";
	place2["data"] = "Terrace Village";
	place2["source"] = ["emuDescription", "emuTitle"];
	suggestions.push(place2);


	return { "accepted" : accepted, "suggestions" : suggestions };
}


function extractSubjects(emuSubjects) {
	var accepted = [];
	var suggestions = [];

	emuSubjects = emuSubjects.split('\n');
	for (var i = 0; i < emuSubjects.length; i++) {
		var emuSubject = {};
		emuSubject["data"] = emuSubjects[i];
		emuSubject["source"] = ["emuSubjects"];
		accepted.push(emuSubject);

		if (emuSubjects[i].substr(emuSubjects[i].length - 27) === "--Pennsylvania--Pittsburgh.") {
			var suggestedSubject = {};
			suggestedSubject["data"] = emuSubjects[i].substring(0, emuSubjects[i].length - 27);
			suggestedSubject["source"] = ["Removed location qualifier"];
			suggestions.push(suggestedSubject);
		}
	}

	return { "accepted" : accepted, "suggestions" : suggestions };
}

function extractKeywords() {
	var accepted = [];
	var suggestions = [];

	// TODO: implement named entity recognition alogrithm
	for (var i = 0; i < 10; i++) {
		var suggestedKeyword = {};
		suggestedKeyword["data"] = "Suggested Keyword " + (i+1);
		suggestedKeyword["source"] = ["source(TBD)"];
		suggestions.push(suggestedKeyword);
	}

	return { "accepted" : accepted, "suggestions" : suggestions };
}

/*
		"keywords": {
			"accepted": [
				{
					"data": "boys",
					"source": [
						"subjectheaders"
					]
				},
				{
					"data": "baseball",
					"source": [
						"subjectheaders"
					]
				},
				{
					"data": "baseball players",
					"source": [
						"subjectheaders"
					]
				},
				{
					"data": "baseball team",
					"source": [
						"subjectheaders"
					]
				},
				{
					"data": "Kennard Field",
					"source": [
						"location"
					]
				},
				{
					"data": "Terrace Village",
					"source": [
						"location"
					]
				},
				{
					"data": "Little League",
					"source": [
						"eMU"
					]
				}
			],
			"suggestions": [
				{
					"data": "May",
					"source": [
						"Description"
					]
				},
				{
					"data": "Spring",
					"source": [
						"Inferred"
					]
				},
				{
					"data": "1950s",
					"source": [
						"Inferred"
					]
				},
				{
					"data": "Pittsburgh Courier",
					"source": [
						"Description"
					]
				}
			]
		},
		"hello": ":)"
	}
}

*/