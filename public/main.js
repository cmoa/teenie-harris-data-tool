var catalog;
var photo;

var startFromEmpty = false;

// First load in data to global store
$(document).ready(function() {

	$("#photographfullcontainer").hide();
	$("#loadingScreen").show();
	catalog = loadCatalog();
	if ($.isEmptyObject(catalog) || startFromEmpty) {
		console.log("NEED TO MAKE CATALOG");
		ecatalog = importEmuData();
		createCatalog(ecatalog);
	}

	if(window.location.hash) {
	  console.log(window.location.hash.substr(1))
	  catalog["currentPhoto"] = catalog[window.location.hash.substr(1)];
	  saveCatalog();
	  window.location.replace(window.location.href.split('#')[0]);
	}
	
	loadPhoto();
});


function loadPhoto() {
	if (!catalog["currentPhoto"]["generated"] || catalog["currentPhoto"]["generated"] === "false") {
		console.log("NEED TO GENERATE PHOTO"); 
		generatePhoto(catalog["currentPhoto"]).then(function(photoData){
			catalog["currentPhoto"] = photoData;
			photo = JSON.parse(JSON.stringify(catalog["currentPhoto"]));
			updateEmuOutput();
			populateUI();
			saveCatalog();
		}); 
	} else {
		photo = JSON.parse(JSON.stringify(catalog["currentPhoto"]));
		updateEmuOutput();
		populateUI();
	}
}

///////////////////////////////// BUTTON HANDLERS /////////////////////////////////

function saveChanges() {
	catalog["currentPhoto"] = JSON.parse(JSON.stringify(photo));
	console.log(photo["id"])
	catalog[photo["id"]] = JSON.parse(JSON.stringify(photo));
    saveCatalog();
}

function undoChanges() {
	var catalog = loadCatalog();
	photo = JSON.parse(JSON.stringify(catalog["currentPhoto"]));
	updateEmuOutput();
	populateUI();
}

function startOver() {
	if (confirm("Are you sure you want to start over for this photo?\nYou will lose ALL changes.")) {
  		$("#loadingScreen").show();
  		window.setTimeout(function() {
  			generatePhoto(catalog[catalog["currentPhoto"]["id"]]).then(function(photoData){
  			catalog[photoData["id"]] = JSON.parse(JSON.stringify(photoData));
			catalog["currentPhoto"] = JSON.parse(JSON.stringify(photoData));
			photo = JSON.parse(JSON.stringify(catalog["currentPhoto"]));
			updateEmuOutput();
			populateUI();
			saveCatalog();
		})}, 0)
 	}	
}

function flagForReview() {
  if (!photo["flagged"] || photo["flagged"] === "false") {
  	photo["flagged"] = true;
  	$("#flagForReview").html("<span id='flag' style='display:inline-block;background-color:red !important; height: 10px;width: 10px;'></span>Unflag");
  } else {
  	photo["flagged"] = false;
    $("#flagForReview").html("Flag For Review")
  }
 }

function nextPhoto() {
		$("#loadingScreen").show();
		window.setTimeout(function() {
			// change current photos
			var id = parseInt(photo["id"]);
			if (catalog[String(id+1)] !== undefined) {
				catalog["currentPhoto"] = JSON.parse(JSON.stringify(catalog[String(id+1)]));
			} else {
				catalog["currentPhoto"] = JSON.parse(JSON.stringify(catalog["1"]));			
			}
			saveCatalog();
			// then load photo
			loadPhoto();
		}, 0);
}


function toggleApproved() {
	if (JSON.parse(photo["approved"])) {
		photo["approved"] = false;
	} else {
		photo["approved"] = true;
	}
	catalog[photo["id"]] = JSON.parse(JSON.stringify(photo));
	saveCatalog();
	populateUI();
}




/*
function mapManifest() {
	saveManifest();
	var mappedManifest = {};
	for (var id in manifest) {

		var entry = photo;
		var mappedEntry = entry["emu"];

		var acceptedTitle = "";
		var titles = entry["titles"];

		for (var i=0; i<titles.length; i++) {
			if (titles[i]["status"]==="accepted") { acceptedTitle = titles[i]["data"]; }
		}

		mappedEntry["TitMainTitle"] = acceptedTitle;

		mappedphoto = mappedEntry;
	}
	exportEmuData(mappedManifest);
}

*/

