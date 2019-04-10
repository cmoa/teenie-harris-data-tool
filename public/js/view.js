
function populateUI() {
	// Puts photo in top left
	populatePhoto();

	// populate emu record
	populateEmuRecordView();

	// populate suggestions
	populateTitleView();
	populatePeopleView();
	populateLocation();
	populateNewspaper();
	populateSubjects();
	populateKeywords();

	$("#loadingScreen").hide();
}


function populatePhoto() {
	// display photograph
	$("#photograph").attr("src", "images/teenieimages/"+photo["emuInput"]["irn"]+".jpg");
	$("#photographfull").attr("src", "images/teenieimages/"+photo["emuInput"]["irn"]+".jpg")

	// See controller.js
	attachPhotoControls();
}


// POPULATE EMU RECORD:
// Loads emu record into the interface
// Calls out changes: New info (green), removed info (red), unchanged info (black)
function populateEmuRecordView() {
	$("#emurecord").empty();
	
	// CSS colors, can be hex
	var green = "green"; 
	var red = "red";
	var black = "black";
	
	for (key in photo["emuOutput"]) {
		var originalValue = (photo["emuInput"][key] === null || photo["emuInput"][key] === undefined) ? "" : photo["emuInput"][key];
		var newValue = (photo["emuOutput"][key] === null || photo["emuOutput"][key] === undefined) ? "" : photo["emuOutput"][key];

		var fieldLabel = $("<div>")
			.addClass("emuRecordFieldlabel")
			.html(key+": ")
		
		var fieldValue = $("<div>");
		if (originalValue !== newValue) {
			var originalValue = $("<div>")
				.addClass("emuRecordFieldValue")
				.css({"color": red, "opacity": "0.7"})
				.html(originalValue);
			var newValue = $("<div>")
				.addClass("emuRecordFieldValue")
				.css("color", green)
				.html(newValue);
			fieldValue.append(originalValue);
			fieldValue.append(newValue);
		} else {
			var newValue = $("<div>")
				.addClass("emuRecordFieldValue")
				.css("color", black)
				.html(newValue);
			fieldValue.append(newValue);
		}

		var fieldContainer = $("<div>")
				.attr("id", key)
				.addClass("emuRecordFieldContainer")
				.append(fieldLabel)
				.append(fieldValue);

		$("#emurecord").append(fieldContainer);
	}
}


// POPULATE TITLES:
// Displays radio button list of edit-able title suggestions
function populateTitleView() {
	$("#titles").empty();

	if (photo["titles"] !== null && photo["titles"] !== undefined) {
		for (var i=0; i<photo["titles"].length; i++) {
			title = photo["titles"][i];

			var titleToggle = $("<img>")
				.attr("id", "titleToggle"+i)
				.addClass([title["status"], "clickable", "toggle"])
				.attr("src", title["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png");

			var titleText = $("<span>")
				.attr("id", "titleText"+i)
				.addClass("data")
				.attr("contenteditable", "true")
				.html(title["data"]);

			var titleSource = $("<span>")
				.addClass("source")
				.html("("+title["source"].join(', ')+")");

			var titleContainer = $("<div>")
				.addClass("optionContainer")
				.append(titleToggle)
				.append(titleText)
				.append(titleSource);

			$("#titles").append(titleContainer);

			// See controller.js
			attachTitleControls(i, title);
		}
	}
}


// POPULATE NAMES:
// Displays check list of edit-able name suggestions
function populatePeopleView() {
	$("#people").empty()
	if (photo["people"] !== undefined) {
		for (var i=0; i<photo["people"].length; i++) {
			person = photo["people"][i];

			var personToggle = $("<img>")
				.attr("id", "personToggle"+i)
				.addClass([person["status"], "clickable", "toggle"])
				.attr("src", person["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				
			var personText = $("<span>")
				.attr("id", "personText"+i)
				.addClass("data")
				.attr("contenteditable", "true")
				.html(person["data"])

			var personSource = $("<span>")
				.addClass("source")
				.html("("+person["source"].join(', ')+")");

			var personContainer = $("<div>")
				.addClass("optionContainer")
				.append($("<img class='handle' src='images/handle.png'/>"))
				.append(personToggle)
				.append(personText)
				.append(personSource);
				
			$("#people").append(personContainer);

			// See controller.js
			attachPersonControls(i, person);
		}
		// See controller.js
		attachPeopleSortingControls();
	}
}


