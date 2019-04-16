

function updateEmuRecord(field, data) {
	photo["emuOutput"][field] = data;
	populateEmuRecordView();
}

function formatPeople() {
	var namelist = "";
	for (var i=0; i<photo["people"].length; i++) {
		if (photo["people"][i]["status"] === "accepted") {
			namelist += photo["people"][i]["data"] + ", ";
		}
	}
	updateEmuRecord("Names", namelist.substring(0, namelist.length - 2));
}



function populateSubjects() {
	$("#subjects").empty()
	if (photo["subjects"] !== undefined) {
		for (var i=0; i<photo["subjects"].length; i++) {

			subjects = photo["subjects"][i];

			var subjectsToggle = $("<img class='clickable toggle'>")
				.addClass(subjects["status"])
				.attr("src", subjects["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "subjects" : subjects }, function(event) {
					photo["subjects"].map(function(subjects) {
						if (subjects === event.data.subjects && subjects["status"] === "accepted") { return Object.assign(subjects, { "status" : "suggested" })}
						else if (subjects === event.data.subjects && subjects["status"] === "suggested") { return Object.assign(subjects, { "status" : "accepted" })}
						else { return subjects }
					});
					// update UI
					populateSubjects();
				});

			var subjectsData = $("<span class='data' contenteditable>")
				.html(subjects["data"])
				.on('input',  { "subjects": subjects }, function(event) {
					photo["subjects"].map(function(subjects) {
						if (subjects === event.data.subjects) { 
							if (subjects["source"].indexOf("Edited") === -1) { 
								subjects["source"] = subjects["source"].concat(["Edited"]) 
								// update UI
								$($(event.target).parent()).find('.source').html("("+subjects["source"].join(', ')+")")
							}
							subjects["data"] = $(event.target).html();
						} 
						return subjects;
					});
				});

			//var subjectsSource = $("<span class='source'>")
			//	.html("("+subjects["source"].join(', ')+")");

			var subjectsContainer = $("<div class='optionContainer'>")
				.append(subjectsToggle)
				.append(subjectsData)
				// .append(subjectsSource);
			
			$("#subjects").append(subjectsContainer);

		}
	}
}

function populateKeywords() {
	$("#keywords").empty()
	if (photo["keywords"] !== undefined) {
		for (var i=0; i<photo["keywords"].length; i++) {

			keywords = photo["keywords"][i];

			var keywordsToggle = $("<img class='clickable toggle'>")
				.addClass(keywords["status"])
				.attr("src", keywords["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "keywords" : keywords }, function(event) {
					photo["keywords"].map(function(keywords) {
						if (keywords === event.data.keywords && keywords["status"] === "accepted") { return Object.assign(keywords, { "status" : "suggested" })}
						else if (keywords === event.data.keywords && keywords["status"] === "suggested") { return Object.assign(keywords, { "status" : "accepted" })}
						else { return keywords }
					});
					// update UI
					populateKeywords();
				});

			var keywordsData = $("<span class='data' contenteditable>")
				.html(keywords["data"])
				.on('input',  { "keywords": keywords }, function(event) {
					photo["keywords"].map(function(keywords) {
						if (keywords === event.data.keywords) { 
							if (keywords["source"].indexOf("Edited") === -1) { 
								keywords["source"] = keywords["source"].concat(["Edited"]) 
								// update UI
								$($(event.target).parent()).find('.source').html("("+keywords["source"].join(', ')+")")
							}
							keywords["data"] = $(event.target).html();
						} 
						return keywords;
					});
				});

			var keywordsSource = $("<span class='source'>")
				.html("("+keywords["source"].join(', ')+")");

			var keywordsContainer = $("<div class='optionContainer'>")
				.append(keywordsToggle)
				.append(keywordsData)
				.append(keywordsSource);
			
			$("#keywords").append(keywordsContainer);

		}
	}
}
