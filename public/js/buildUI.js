
function populateUI() {
	// display photograph
	$("#photograph").attr("src", "images/teenieimages/"+photo["emuInput"]["irn"]+".jpg");
	$("#photographfull").attr("src", "images/teenieimages/"+photo["emuInput"]["irn"]+".jpg")

	// add click events for full screen photo
	$("#photograph").on('click', function() { $("#photographfullcontainer").show(); });
	$("#photographfullcontainer").on('click', function() { $("#photographfullcontainer").hide(); });
	$("#photographfull").on('click', function() { $("#photographfullcontainer").hide(); });

	// populate emu record
	populateEmuRecord();
	// populate suggestions
	populateTitles();
	populatePeople();
	populateLocation();
	populateNewspaper();
	populateSubjects();
	populateKeywords();

	$("#loadingScreen").hide();
}

function updateEmuRecord(field, data) {
	photo["emuOutput"][field] = data;
	populateEmuRecord();
}

function populateEmuRecord() {
	$("#emurecord").empty();
	for (key in photo["emuOutput"]) {
		if (photo["emuInput"][key] !== photo["emuOutput"][key]) {
			var oldValue = (photo["emuInput"][key] === null || photo["emuInput"][key] === undefined) ? "" : photo["emuInput"][key];
			var newValue = (photo["emuOutput"][key] === null) ? "" : photo["emuOutput"][key];
			var fieldContainer = $("<div class='originaldata'>");
			fieldContainer.append("<div class='originaldatalabel'>"+key+":</div>");
			fieldContainer.append("<div id='"+key+"' style='color:red;opacity:0.7;'>"+oldValue+"</div>");
			fieldContainer.append("<div id='"+key+"' style='color:green;'>"+newValue+"</div>");
			$("#emurecord").append(fieldContainer);
		} else {
			var value = (photo["emuOutput"][key] === null) ? "" : photo["emuOutput"][key];
			var fieldContainer = $("<div class='originaldata'>");
			fieldContainer.append("<div class='originaldatalabel'>"+key+":</div>");
			fieldContainer.append("<div id='"+key+"'>"+value+"</div>");
			$("#emurecord").append(fieldContainer);
		}
	}
}


// Lets you select which title to use in emu record, 
// as well as make changes to the text fields
function populateTitles() {
	$("#titles").empty()
	if (photo["titles"] !== undefined) {
		for (var i=0; i<photo["titles"].length; i++) {
			title = photo["titles"][i];

			var titleToggle = $("<img class='clickable toggle'>")
				.addClass(title["status"])
				.attr("src", title["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "title" : title }, function(event) {
					photo["titles"].map(function(title) {
						if (title === event.data.title) { 
							title["status"] = "accepted"; 
							updateEmuRecord("TitMainTitle", event.data.title["data"]);
						}
						else { title["status"] = "suggested"; }
						return title;
					});
					// update UI
					populateTitles();
				});

			var titleData = $("<span class='data' contenteditable>")
				.html(title["data"])
				.on('input',  { "title": title }, function(event) {
					photo["titles"].map(function(title) {
						if (title === event.data.title) { 
							if (title["source"].indexOf("Edited") === -1) { 
								title["source"] = title["source"].concat(["Edited"]) 
								// update UI
								$($(event.target).parent()).find('.source').html("("+title["source"].join(', ')+")")
							}
							title["data"] = $(event.target).html();
							updateEmuRecord("TitMainTitle",$(event.target).html());
						} 
						return title;
					});
				});

			var titleSource = $("<span class='source'>").html("("+title["source"].join(', ')+")");
			var titleContainer = $("<div class='optionContainer'>").append(titleToggle).append(titleData).append(titleSource);
			$("#titles").append(titleContainer);
		}
	}
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

function populatePeople() {
	$("#people").empty()
	if (photo["people"] !== undefined) {
		for (var i=0; i<photo["people"].length; i++) {
			person = photo["people"][i];

			var personToggle = $("<img class='clickable toggle'>")
				.addClass(person["status"])
				.attr("src", person["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "person" : person }, function(event) {
					var namelist = "";
					photo["people"].map(function(person) {
						if (person === event.data.person && person["status"] === "accepted") {  return Object.assign(person, { "status" : "suggested" }) }
						else if (person === event.data.person && person["status"] === "suggested") { 
							namelist += person["data"] + ", "
							return Object.assign(person, { "status" : "accepted" });
						} else if (person["status"]==="accepted"){
							namelist += person["data"] + ", "
							return person;
						}
						else { return person }
					});
					populatePeople();
					formatPeople();
				});

			var personData = $("<span class='data' contenteditable>")
				.html(person["data"])
				.on('input',  { "person": person }, function(event) {
					for (var i = 0; i < event.data.person["source"].length; i++) {
						var name = event.data.person["data"];
						var source = event.data.person["source"][i];
						var sourceDOM = $("#"+source);
						if (sourceDOM.html() !== undefined) {
							var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
							sourceDOM.html(sourceDOM.html().replace(highlightedName, name));
						}
					}
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
					for (var i = 0; i < event.data.person["source"].length; i++) {
						var name = event.data.person["data"];
						var source = event.data.person["source"][i];
						var sourceDOM = $("#"+source);
						if (sourceDOM.html() !== undefined) {
							var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
							sourceDOM.html(sourceDOM.html().replace(name, highlightedName));
						}
					}
					formatPeople();
				})
				// FOLLOWING EVENTS HANDLE NAME HIGHLIGHTING ON HOVER
				.on('mouseenter',  { "person": person }, function(event) {
					for (var i = 0; i < event.data.person["source"].length; i++) {
						var name = event.data.person["data"];
						var source = event.data.person["source"][i];
						var sourceDOM = $("#"+source);
						if (sourceDOM.html() !== undefined) {
							var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
							sourceDOM.html(sourceDOM.html().replace(name, highlightedName));
						}
					}
				})
				.on('mouseleave',  { "person": person }, function(event) {
					for (var i = 0; i < event.data.person["source"].length; i++) {
						var name = event.data.person["data"];
						var source = event.data.person["source"][i];
						var sourceDOM = $("#"+source);
						if (sourceDOM.html() !== undefined) {
							var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
							sourceDOM.html(sourceDOM.html().replace(highlightedName, name));
						}
					}
				})
				.on('focusout',  { "person": person }, function(event) {
					for (var i = 0; i < event.data.person["source"].length; i++) {
						var name = event.data.person["data"];
						var source = event.data.person["source"][i];
						var sourceDOM = $("#"+source);
						if (sourceDOM.html() !== undefined) {
							var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
							sourceDOM.html(sourceDOM.html().replace(highlightedName, name));
						}
					}
				});

			var personSource = $("<span class='source'>")
				.html("("+person["source"].join(', ')+")");

			var personContainer = $("<div class='optionContainer'>")
				.append($("<img class='handle' src='images/handle.png'/>"))
				.append(personToggle)
				.append(personData)
				.append(personSource);
				
			$("#people").append(personContainer);

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
					formatPeople();
				},
			});
		}
	}
}

function populateLocation() {
	$("#place").empty()
	if (photo["location"] !== undefined) {
		for (var i=0; i<photo["location"].length; i++) {

			place = photo["location"][i];

			var placeToggle = $("<img class='clickable toggle'>")
				.addClass(place["status"])
				.attr("src", place["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "place" : place }, function(event) {
					photo["location"].map(function(place) {
						if (place === event.data.place && place["status"] === "accepted") { return Object.assign(place, { "status" : "suggested" })}
						else if (place === event.data.place && place["status"] === "suggested") { return Object.assign(place, { "status" : "accepted" })}
						else { return place }
					});
					// update UI
					populateLocation();
				});

			var placeData = $("<span class='data' contenteditable>")
				.html(place["data"])
				.on('input',  { "place": place }, function(event) {
					photo["place"].map(function(place) {
						if (place === event.data.place) { 
							if (place["source"].indexOf("Edited") === -1) { 
								place["source"] = place["source"].concat(["Edited"]) 
								// update UI
								$($(event.target).parent()).find('.source').html("("+place["source"].join(', ')+")")
							}
							place["data"] = $(event.target).html();
						} 
						return place;
					});
				});

			var placeSource = $("<span class='source'>")
				.html("("+place["source"].join(', ')+")");

			var placeContainer = $("<div class='optionContainer'>")
				.append(placeToggle)
				.append(placeData)
				.append(placeSource);
			
			$("#place").append(placeContainer);
		}
	}
}


function populateNewspaper() {
	$("#article").empty()
	if (photo["article"] !== undefined) {
		for (var i=0; i<photo["article"].length; i++) {

			article = photo["article"][i];

			var articleToggle = $("<img class='clickable toggle'>")
				.addClass(article["status"])
				.attr("src", article["status"] === "accepted" ? "images/checked_button.png" : "images/unchecked_button.png")
				.on("click", { "article" : article }, function(event) {
					photo["article"].map(function(article) {
						if (article === event.data.article && article["status"] === "accepted") { return Object.assign(article, { "status" : "suggested" })}
						else if (article === event.data.article && article["status"] === "suggested") { return Object.assign(article, { "status" : "accepted" })}
						else { return article }
					});
					// update UI
					populateNewspaper();
				});

			var articleData = $("<span class='data' contenteditable>")
				.html(article["data"])
				.on('input',  { "article": article }, function(event) {
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
				});

			var articleSource = $("<span class='source'>")
				.html("("+article["source"].join(', ')+")");

			var articleContainer = $("<div class='optionContainer'>")
				.append(articleToggle)
				.append(articleData)
				.append(articleSource);
			
			$("#article").append(articleContainer);

		}
	}
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
