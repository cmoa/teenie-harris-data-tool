
function populateUI() {
	// Puts photo in top left
	populatePhoto();

	// populate emu record
	populateEmuRecordView();

	// populate suggestions
	populateTitleView();
	populatePeopleView();
	populateLocationView();
	populateArticleView();
	populateSubjectView();
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

function populateLocationView() {
	$("#place").empty()

	if (photo["location"] !== undefined) {
		for (var category in photo["location"]) {

			var placeLabel = $("<div>")
				.addClass("placeLabel")
				.html(category);
			$("#place").append(placeLabel);

			for (var place in photo["location"][category]) {

				var placeData = photo["location"][category][place];

				var placeToggle = $("<img>")
					.attr("id", "placeToggle"+place)
					.addClass([placeData["status"], "clickable", "toggle"])
					.attr("src", placeData["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")

				var placeText = $("<span class='data' contenteditable>")
					.attr("id", "placeText"+place)
					.html(placeData["data"])

				var placeSource = $("<span class='source'>")
					.html("("+placeData["source"].join(', ')+")");

				var placeContainer = $("<div class='optionContainer'>")
					.append(placeToggle)
					.append(placeText)
					.append(placeSource);			

				$("#place").append(placeContainer);

				// See controller.js
				attachLocationControls(category, place, placeData);
			}
		}
	}
}

function populateArticleView() {
	$("#article").empty()
	if (photo["article"] !== undefined) {
		for (var i=0; i<photo["article"].length; i++) {

			article = photo["article"][i];

			var articleLabel = $("<div>")
				.addClass("articleLabel")
				.html(article["name"]);
			$("#article").append(articleLabel);

			var articleToggle = $("<img class='clickable toggle'>")
				.addClass(article["status"])
				.attr("id", "articleToggle"+i)
				.attr("src", article["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")

			var articleData = $("<span class='data' contenteditable>")
				.attr("id", "articleText"+i)
				.html(article["data"])

			var articleSource = $("<span class='source'>")
				.html("("+article["source"].join(', ')+")");

			var articleContainer = $("<div class='optionContainer'>")
				.append(articleToggle)
				.append(articleData)
				.append(articleSource);
			
			$("#article").append(articleContainer);

			// See controller.js
			attachArticleControls(i, article);
		}
	}
}


function populateSubjectView() {
	$("#subjects").empty()
	if (photo["subjects"] !== undefined) {
		for (var subjectKey in photo["subjects"]) {

			var subject = photo["subjects"][subjectKey];
			console.log(subject);

			var subjectLabel = $("<div>")
				.addClass("subjectLabel")
				.html(subject["original"]);
			$("#subjects").append(subjectLabel);

			for (var relatedSubjectKey in subject["related"]) {
				var relatedSubject = subject["related"][relatedSubjectKey];
				console.log(relatedSubject);

				var subjectsToggle = $("<img class='clickable toggle'>")
					.addClass(relatedSubject["status"])
					.attr("id", "subjectToggle"+relatedSubjectKey)
					.attr("src", relatedSubject["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")

				var subjectsText = $("<span class='data' contenteditable>")
					.attr("id", "subjectText"+relatedSubjectKey)
					.html(relatedSubject["data"])

				var subjectsSource = $("<span class='source'>")
					.html("("+relatedSubject["source"].join(', ')+")");

				

				var subjectsContainer = $("<div class='optionContainer'>")
					.append(subjectsToggle)
					.append(subjectsText)
					.append(subjectsSource);

				if (relatedSubject["link"] !== undefined) {
					var subjectsLink = $("<a class='source'>")
					.attr("href", relatedSubject["link"])
					.attr("target", "_blank")
					.html("&#8599;");
					subjectsContainer.append(subjectsLink);
				}

				$("#subjects").append(subjectsContainer);

				// See controller.js
				attachSubjectControls(relatedSubjectKey, relatedSubject);
			}
			

		}
	}
}

