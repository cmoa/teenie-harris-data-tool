function attachControls() {
	attachPhotoControls();
}

function attachPhotoControls() {
	// Click events for full screen photo
	$("#photograph").on('click', function() { $("#photographfullcontainer").show(); });
	$("#photographfullcontainer").on('click', function() { $("#photographfullcontainer").hide(); });
	$("#photographfull").on('click', function() { $("#photographfullcontainer").hide(); });
}

function attachTitleControls(index, title) {
	// Title checklist toggle
	$("#titleToggle"+index).on("click", { "title" : title }, function(event) {
		photo["titles"].map(function(title) {
			if (title === event.data.title && title["status"] === "accepted") {  return Object.assign(title, { "status" : "suggested" }) }
			else if (title === event.data.title && title["status"] === "suggested") { 
				return Object.assign(title, { "status" : "accepted" });
			} else { return title }
		});
		// See model.js && view.js
		updateEmuOutput()
		populateTitleView();
	});

	// Title editing
	$("#titleText"+index).on('input',  { "title": title }, function(event) {
		photo["titles"].map(function(title) {
			if (title === event.data.title) { 
				if (title["source"].indexOf("Edited") === -1) {
					title["source"] = title["source"].concat(["Edited"]) 
					// update UI
					$($(event.target).parent()).find('.source').html("("+title["source"].join(', ')+")")
				} 
				title["data"] = $(event.target).html();
			} 
			return title;
		});
		// See model.js
		updateEmuOutput();
	});
}

function attachTitleHeaderControls() {
	$("#titleFlag").on("click", function(event) {
		photo["flags"]["titles"] = !JSON.parse(photo["flags"]["titles"]);
		// See view.js
		populateTitleView();
	});

	$("#addTitleButton").on("click", function(event) {
		console.log("Add title");
		var newTitle = {
			data: "",
			source: ["Edited"],
			status: "suggested",
		};
		photo["titles"].push(newTitle);

		// See model.js && view.js
		updateEmuOutput();
		populateTitleView();
	});
}


function attachPersonControls(index, person) {
	// Person checklist toggle
	$("#personToggle"+index).on("click", { "person" : person }, function(event) {
		photo["people"].map(function(person) {
			if (person === event.data.person && person["status"] === "accepted") {  return Object.assign(person, { "status" : "suggested" }) }
			else if (person === event.data.person && person["status"] === "suggested") { 
				return Object.assign(person, { "status" : "accepted" });
			} else { return person }
		});
		// See model.js && view.js
		updateEmuOutput();
		populatePeopleView();
	});

	// Name editing
	$("#personText"+index).on('input',  { "person": person }, function(event) {

		removeHighlightFromText(event.data.person["data"]);
		
		photo["people"].map(function(person) {
			if (person === event.data.person) { 
				if (person["source"].indexOf("Edited") === -1) { 
					person["source"] = person["source"].concat(["Edited"]) 
					// update UI
					$($(event.target).parent()).find('.source').html("("+person["source"].join(', ')+")")
				}
				person["data"] = $(event.target).html();
			} 
			return person;
		});
		
		highlightText(event.data.person["data"]);

		// See model.js 
		updateEmuOutput();
	});


	// Hover to highlight name in emu record
	// $("#personText"+index)
	//	.on('mouseenter',  { "person": person }, function(event) { highlightText(event.data.person["data"]); })
	//	.on('mouseleave',  { "person": person }, function(event) { removeHighlightFromText(event.data.person["data"]); })
	//	.on('focusout',  { "person": person }, function(event) { removeHighlightFromText(event.data.person["data"]); });

}


function attachPeopleSortingControls() {
	// Add sorting functionality
	var el = document.getElementById('people');
	var sortable = Sortable.create(el, {
		ghostClass: 'ghost',
		dragClass: "sortable-drag",
		animation: 50,
		handle: ".handle",
		onStart: function () {
			$(".handle").each(function() { $(this).addClass("nohoverhandle") });
		},
		onUpdate: function (evt) {
			var updatedPerson = photo["people"].splice(evt.oldIndex, 1);
			photo["people"].splice(evt.newIndex, 0, updatedPerson[0]);
			$(".handle").each(function() { 
				$(this).removeClass("nohoverhandle")
			});
			// See model.js 
			updateEmuOutput();
		},
	});
}

function attachPeopleHeaderControls() {
	$("#peopleFlag").on("click", function(event) {
		photo["flags"]["people"] = !JSON.parse(photo["flags"]["people"]);
		// See view.js
		populatePeopleView();
	});

	$("#addPersonButton").on("click", function(event) {
		var newPerson = {
			data: "",
			source: ["Edited"],
			status: "suggested",
		};
		photo["people"].push(newPerson);

		// See model.js && view.js
		updateEmuOutput();
		populatePeopleView();
	});
}



function attachLocationControls(category, place, data) {
	// Location checklist toggle
	$("#placeToggle"+place).on("click", { "category": category, "place": place }, function(event) {
		var { category, place } = event.data;
		for (placeKey in photo["location"][category]) {
			if (place === placeKey && photo["location"][category][placeKey]["status"] === "suggested") { photo["location"][category][placeKey]["status"] = "accepted"; }
			else if (place === placeKey && photo["location"][category][placeKey]["status"] === "accepted") { photo["location"][category][placeKey]["status"] = "suggested"; }
			else { photo["location"][category][placeKey]["status"] = "suggested"; }
		}
		// See model.js && view.js
		updateEmuOutput();
		populateLocationView();
	});

	// Location text editing
	$("#placeText"+place).on('input',  { "place": data }, function(event) {
		removeHighlightFromText(event.data.place["data"]);

		if (data["source"].indexOf("Edited") === -1) { 
			data["source"] = data["source"].concat(["Edited"]) 
			// update UI
			$($(event.target).parent()).find('.source').html("("+data["source"].join(', ')+")")
		}
		data["data"] = $(event.target).html();

		//highlightText(event.data.place["data"]);
		updateEmuOutput();
	});

	// Hover to highlight location in emu record
	// $("#placeText"+place)
	//	.on('mouseenter',  { "place": place }, function(event) { highlightText(event.data.place); })
	//	.on('mouseleave',  { "place": place }, function(event) { removeHighlightFromText(event.data.place); })
	//	.on('focusout',  { "place": place }, function(event) { removeHighlightFromText(event.data.place); });

}

function attachLocationHeaderControls() {
	$("#locationFlag").on("click", function(event) {
		photo["flags"]["location"] = !JSON.parse(photo["flags"]["location"]);
		// See view.js
		populateLocationView();
	});
}


function attachArticleControls(index, article) {
	$("#articleToggle"+index).on("click", { "article" : article }, function(event) {
		photo["article"].map(function(article) {
			if (article === event.data.article && article["status"] === "accepted") { return Object.assign(article, { "status" : "suggested" })}
			else if (article === event.data.article && article["status"] === "suggested") { return Object.assign(article, { "status" : "accepted" })}
			else { return article }
		});
		// See view.js
		populateArticleView();
		updateEmuOutput();
	});

	$("#articleText"+index).on('input',  { "article": article }, function(event) {
		photo["article"].map(function(article) {
			if (article === event.data.article) { 
				if (article["source"].indexOf("Edited") === -1) { 
					article["source"] = article["source"].concat(["Edited"]) 
					// update UI
					$($(event.target).parent()).find('.source').html("("+article["source"].join(', ')+")")
				}
				article["data"] = $(event.target).html();
			} 
			return article;
		});
		
		updateEmuOutput();
	});

	// Hover to highlight article in emu record
	// $("#articleText"+index)
	// 	.on('mouseenter',  { "article": article }, function(event) { highlightText(event.data.article["data"]); })
	// 	.on('mouseleave',  { "article": article }, function(event) { removeHighlightFromText(event.data.article["data"]); })
	// 	.on('focusout',  { "article": article }, function(event) { removeHighlightFromText(event.data.article["data"]); });
}

function attachArticleHeaderControls() {
	$("#articleFlag").on("click", function(event) {
		photo["flags"]["article"] = !JSON.parse(photo["flags"]["article"]);
		// See view.js
		populateArticleView();
	});
}


function attachSubjectControls(subject, subjectData) {
	// $("#subjectText"+subject).on("click", { "subjectData" : subjectData }, function(event) {
	// 	photo["subjects"].map(function(subjects) {
	// 		if (subjects === event.data.subjects && subjects["status"] === "accepted") { return Object.assign(subjects, { "status" : "suggested" })}
	// 		else if (subjects === event.data.subjects && subjects["status"] === "suggested") { return Object.assign(subjects, { "status" : "accepted" })}
	// 		else { return subjects }
	// 	});
	// 	// update UI
	// 	populateSubjectView();
	// });

// .on('input',  { "subjects": subjects }, function(event) {
					// 	photo["subjects"].map(function(subjects) {
					// 		if (subjects === event.data.subjects) { 
					// 			if (subjects["source"].indexOf("Edited") === -1) { 
					// 				subjects["source"] = subjects["source"].concat(["Edited"]) 
					// 				// update UI
					// 				$($(event.target).parent()).find('.source').html("("+subjects["source"].join(', ')+")")
					// 			}
					// 			subjects["data"] = $(event.target).html();
					// 		} 
					// 		return subjects;
					// 	});
					// });
}



// Highlight functions
function highlightText(text) {
	console.log(text);
	var sourceDOM = $("#emurecord");
	if (sourceDOM.html() !== undefined && text !== "" && text.length > 1) {
		var highlightedText = '<span style="background-color:yellow">'+text+'</span>';
		sourceDOM.html(sourceDOM.html().replace(new RegExp(text, 'g'), highlightedText));
	}
}

function removeHighlightFromText(text) {
	console.log(text);
	var sourceDOM = $("#emurecord");
	if (sourceDOM.html() !== undefined && text !== "" && text.length > 1) {
		var highlightedText = '<span style="background-color:yellow">'+text+'</span>';
		sourceDOM.html(sourceDOM.html().replace(new RegExp(highlightedText, 'g'), text));
	}
}
