var manifest = {};
var id = "1";

// First load in data to global store
$(document).ready(function() {
	manifest = loadManifest();
	if ($.isEmptyObject(manifest)) {
		originalEntries = importEmuData();
		manifest = buildManifest(originalEntries);
		saveManifest(manifest);
	}
	populateUI();
});

function mapManifest() {
	saveManifest();
	var mappedManifest = {};
	for (var id in manifest) {
		console.log(id);

		var entry = manifest[id];
		var mappedEntry = entry["emu"];

		var acceptedTitle = "";
		var titles = entry["titles"];
		console.log(titles);
		for (var i=0; i<titles.length; i++) {
			if (titles[i]["status"]==="accepted") { acceptedTitle = titles[i]["data"]; }
		}
		mappedEntry["TitMainTitle"] = acceptedTitle;

		mappedManifest[id] = mappedEntry;
	}
	exportEmuData(mappedManifest);
}

function populateSection(entry, field, multipleAllowed) {
	var options = entry[field];
	console.log(options);

	$("#"+field).empty();
	for (var i = 0; i<options.length; i++) {
		option = options[i];
	
		var optionData = $("<div class='data'>");
		optionData.html(option["data"]);
		
		var optionSource = $("<div class='source'>");
		optionSource.html(option["source"].join(', '));

		var optionContainer = $("<div class='clickable'>");
		if (option["status"] === "accepted") { optionContainer.addClass("accepted"); }
		optionContainer.append(optionData);
		optionContainer.append(optionSource);

		optionContainer.on("click", { "option" : option }, function(event) {

			var acceptedOption = event.data.option;
			console.log(id);
			if (multipleAllowed) {
				manifest[id][field] = options.map(function(option) {
					if (option === acceptedOption && option["status"] === "accepted") { return Object.assign(acceptedOption, { "status" : "suggested" })}
					else if (option === acceptedOption && option["status"] === "suggested") { return Object.assign(acceptedOption, { "status" : "accepted" })}
					else { return option }
				});
			} else {
				manifest[id][field] = options.map(function(option) {
					if (option === acceptedOption) { return Object.assign(acceptedOption, { "status" : "accepted" })}
					else { return Object.assign(option, { "status" : "suggested" }) }
				});
			}

			populateSection(entry, field, multipleAllowed);

		});

		$("#"+field).append(optionContainer);
	}
}

function populateUI() {
	var photo = manifest[id];
	$("#irn").html("IRN: " + photo["emu"]["irn"]);
	$("#accession").html("Accession No: " + photo["emu"]["TitAccessionNo"]);

	populateSection(photo, "titles", false);
	populateSection(photo, "people", true);
}

