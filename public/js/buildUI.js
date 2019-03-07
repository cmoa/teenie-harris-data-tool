function populateUI() {
	// TOP BAR
	!photo["flagged"] || photo["flagged"] === "false" ? 
		$("#flagForReview").html("Flag For Review") : 
		$("#flagForReview").html("<span id='flag' style='display:inline-block;background-color:red !important; height: 10px;width: 10px;'></span>Unflag");

	$("#photograph").attr("src", "images/teenieimages/"+photo["emu"]["irn"]+".jpg");
	$("#photographfull").attr("src", "images/teenieimages/"+photo["emu"]["irn"]+".jpg")
	$("#photograph").on('click', function() { $("#photographfullcontainer").show(); });
	$("#photographfullcontainer").on('click', function() { $("#photographfullcontainer").hide(); });
	$("#photographfull").on('click', function() { $("#photographfullcontainer").hide(); });
	$("#irn").html("<span class='irnlabel'>IRN</span>" + photo["emu"]["irn"]);
	$("#accession").html("<span class='accessionlabel'>Accession</span>" + photo["emu"]["TitAccessionNo"]);

	// FIELDS
	populateTitles();


	$("#loadingScreen").hide();



	/*populateSection(photo, "people", multipleAllowed=true, sortable=true);
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
		},
	});

	populateSection(photo, "location", multipleAllowed=true, sortable=false);
	populateSection(photo, "subjects", multipleAllowed=true, sortable=false);
	populateSection(photo, "keywords", multipleAllowed=true, sortable=false);
	*/
}



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
						if (title === event.data.title) { title["status"] = "accepted"; }
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
								console.log($($(event.target).parent()).find('.source'))
								$($(event.target).parent()).find('.source').html("("+title["source"].join(', ')+")")
							}
							title["data"] = $(event.target).html();
						} 
						return title;
					});
				});

			var titleSource = $("<span class='source'>")
				.html("("+title["source"].join(', ')+")");

			var titleContainer = $("<div class='optionContainer'>")
				.append(titleToggle)
				.append(titleData)
				.append(titleSource);

			
			$("#titles").append(titleContainer);
		}
	}
}


/*
// POPULATE SECTION 
// Creates
// Entry = photo object from manifest
// Field = Which section to populate (from HTML skeleton)
// Multiple Allowed = Can user make multiple sections at once for this field
// Sortable = Can user sort the data in this field
function populateSection(field, multipleAllowed, sortable) {
	// $("#"+field).empty();
	var options = photo[field];

	if (options !== undefined) {
		
		for (var i = 0; i<options.length; i++) {
			option = options[i];
		
			var optionData = $("<span class='data' title='Sources'>");
			optionData.html(option["data"]);
			optionData.attr("contenteditable", "true");
			optionData.on('input', { "option" : option }, function(event) {
				var updatedOption = event.data.option;
				photo[field] = options.map(function(option) {
					if (option === updatedOption) { 
						var updatedSource = updatedOption["source"];
						if (updatedSource.indexOf("Edited") === -1) { 
							updatedSource = updatedSource.concat(["Edited"]) 
							$($(event.target).parent()).find('.source').html("("+updatedSource.join(', ')+")")
						}
						return Object.assign(updatedOption, 
							{ 
							  "data" : $(event.target).html(),
							  "source" : updatedSource,
							}
					)} else {
						return option;
					}
				});
			});
		
			var titleSource = $("<span class='source'>");
			titleSource.html("("+option["source"].join(', ')+")");

			var titleToggle = $("<img class='clickable toggle'>");
			if (option["status"] === "accepted") { 
				titleToggle.addClass("accepted"); 
				titleToggle.attr("src", multipleAllowed ? "images/checked_box.png" : "images/checked_button.png");
			} else {
				titleToggle.attr("src", multipleAllowed ? "images/unchecked_box.png" : "images/unchecked_button.png");
			}
			titleToggle.on("click", { "option" : option }, function(event) {
				var acceptedOption = event.data.option;
				if (multipleAllowed) {
					photo[field] = options.map(function(option) {
						if (option === acceptedOption && option["status"] === "accepted") { return Object.assign(acceptedOption, { "status" : "suggested" })}
						else if (option === acceptedOption && option["status"] === "suggested") { return Object.assign(acceptedOption, { "status" : "accepted" })}
						else { return option }
					});
				} else {
					photo[field] = options.map(function(option) {
						if (option === acceptedOption) { return Object.assign(acceptedOption, { "status" : "accepted" })}
						else { return Object.assign(option, { "status" : "suggested" }) }
					});
				}
				populateSection(entry, field, multipleAllowed, sortable);
			});

			var optionContainer = $("<div class='optionContainer'>");

			if (sortable) { optionContainer.append($("<img class='handle' src='images/handle.png'/>")); }

			optionContainer.append(titleToggle);
			optionContainer.append(optionData);
			optionContainer.append(titleSource);

			$("#"+field).append(optionContainer);
		}
	}
}

*/
