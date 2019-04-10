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
			if (title === event.data.title) { 
				title["status"] = "accepted"; 
				updateEmuRecord("TitMainTitle", event.data.title["data"]);
			}
			else { title["status"] = "suggested"; }
			return title;
		});
		// See view.js
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
				updateEmuRecord("TitMainTitle", $(event.target).html());
			} 
			return title;
		});
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
		// See view.js
		populatePeopleView();
	});

	// Name editing
	$("#personText"+index).on('input',  { "person": person }, function(event) {
		removeHighlightFromName(event.data.person);
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
		highlightName(event.data.person);
	});


	// Hover to highlight name in emu record
	$("#personText"+index)
		.on('mouseenter',  { "person": person }, function(event) { highlightName(event.data.person); })
		.on('mouseleave',  { "person": person }, function(event) { removeHighlightFromName(event.data.person); })
		.on('focusout',  { "person": person }, function(event) { removeHighlightFromName(event.data.person); });

}

function highlightName(person) {
	for (var i = 0; i < person["source"].length; i++) {
		var name = person["data"];
		var source = person["source"][i];
		var sourceDOM = $("#"+source);
		if (sourceDOM.html() !== undefined) {
			var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
			sourceDOM.html(sourceDOM.html().replace(new RegExp(name, 'g'), highlightedName));
		}
	}
}

function removeHighlightFromName(person) {
	for (var i = 0; i < person["source"].length; i++) {
		var name = person["data"];
		var source = person["source"][i];
		var sourceDOM = $("#"+source);
		if (sourceDOM.html() !== undefined) {
			var highlightedName = '<span style="background-color:yellow">'+name+'</span>';
			sourceDOM.html(sourceDOM.html().replace(new RegExp(highlightedName, 'g'), name));
		}
	}
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
		},
	});
}