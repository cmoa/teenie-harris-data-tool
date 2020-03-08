// Takes an IRN, 
// Makes a file that will work with the tool 
const fs = require('fs');

var count = 0;

function generateCatalogRecord(irn) {

	// Get raw json - emuInput
	let rawEmuData = fs.readFileSync(`../data_processing/emuCsv_to_json/output/jsonRecords/${irn}.json`);
	let rawEnhancedData = fs.readFileSync(`../data_processing/json_to_enhancedRecords/output/jsonRecords/${irn}.json`);

	let emuData = JSON.parse(rawEmuData);
	let enhancedData = JSON.parse(rawEnhancedData);

	// Make suggestions
	var suggestions = {};

	suggestions["TitAlternateTitles_tab"] = [];

	suggestions["People_tab"] = [];
	if (enhancedData.people) {
		suggestions["People_tab"] = enhancedData.people.map((person) => {
			return {
				data: person,
				status: "suggested"
			}
		});
	}

	suggestions["CatSubject_tab"] = [];
	if (enhancedData.subjects) {
		suggestions["CatSubject_tab"] = enhancedData.subjects.map((subject) => {
			return {
				data: subject,
				status: "suggested"
			}
		});
	}

	suggestions["CreCountry_tab"] = [];
	suggestions["CreState_tab"] = [];
	suggestions["CreDistrict_tab"] = [];
	suggestions["CreCity_tab"] = [];
	if (enhancedData.places) {
		var placesSuggestions = enhancedData.places.map((place) => {
			return {
				data: place.long_name,
				status: "suggested"
			}
		});
		suggestions["CreCountry_tab"] = placesSuggestions;
		suggestions["CreState_tab"] = placesSuggestions;
		suggestions["CreDistrict_tab"] = placesSuggestions;
		suggestions["CreCity_tab"] = placesSuggestions;
	}

	suggestions["BibliographyPublication"] = [];
	if (enhancedData.bibliography.publication) {
		suggestions["BibliographyPublication"] = enhancedData.bibliography.publication.map((publication) => {
			return {
				data: publication,
				status: "suggested"
			}
		});
	}

	suggestions["BibliographyPage"] = [];
	if (enhancedData.bibliography.page) {
		suggestions["BibliographyPage"] = enhancedData.bibliography.page.map((page) => {
			return {
				data: page,
				status: "suggested"
			}
		});
	}

	suggestions["BibliographyCutline"] = [];
	if (enhancedData.bibliography.cutline) {
		suggestions["BibliographyCutline"] = enhancedData.bibliography.cutline.map((cutline) => {
			return {
				data: cutline,
				status: "suggested"
			}
		});
	}

	suggestions["BibliographyDate"] = [];
	if (enhancedData.bibliography.date) {
		suggestions["BibliographyDate"] = enhancedData.bibliography.date.map((date) => {
			return {
				data: date,
				status: "suggested"
			}
		});
	}

	suggestions["CatKeywords_tab"] = [];
	if (enhancedData.keywords) {
		suggestions["CatKeywords_tab"] = enhancedData.keywords.map((keyword) => {
			return {
				data: keyword.keyword,
				status: "suggested"
			}
		});
	}

	// Mark as in-review
	const inReview = {
		"TitAlternateTitles_tab": suggestions["TitAlternateTitles_tab"].length > 0,
		"People_tab": suggestions["People_tab"].length > 0,
		"CatSubject_tab": suggestions["CatSubject_tab"].length > 0,
		"CreCountry_tab": suggestions["CreCountry_tab"].length > 0,
		"CreState_tab": suggestions["CreState_tab"].length > 0,
		"CreDistrict_tab": suggestions["CreDistrict_tab"].length > 0,
		"CreCity_tab": suggestions["CreCity_tab"].length > 0,
		"BibliographyPublication": suggestions["BibliographyPublication"].length > 0,
		"BibliographyPage": suggestions["BibliographyPage"].length > 0,
		"BibliographyCutline": suggestions["BibliographyCutline"].length > 0,
		"BibliographyDate": suggestions["BibliographyDate"].length > 0,
		"CatKeywords_tab": suggestions["CatKeywords_tab"].length > 0
	}

	let catalogRecord = {
		irn: irn,
		emuInput: emuData,
		emuOutput: Object.assign(emuData, { 
			"TitAlternateTitles_tab": '',
			"People_tab": '',
			"BibliographyPublication": '',
			"BibliographyPage": '',
			"BibliographyCutline": '',
			"BibliographyDate": '',
			"CatKeywords_tab": '',
		}),
		inReview: inReview,
		suggestions: suggestions
	}


	let data = JSON.stringify(catalogRecord, null, 2);
	fs.writeFileSync(`./catalog/${irn}.json`, data);

	console.log("Wrote to file: " + `./catalog/${irn}.json`)
	count++;

	return catalogRecord;
}

// const testFolder = './catalog/';

// fs.readdirSync(testFolder).forEach(file => {
// 	if (file.substr(-5) === '.json') {
// 		var irn = file.slice(0, -5);
// 		generateCatalogRecord(irn);
// 	}
// });

console.log(`DONE! Wrote ${count} file(s)`);