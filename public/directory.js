var catalog;

// First load in data to global store
$(document).ready(function() {
	catalog = loadCatalog();

	for (id in catalog) { 
		if (id !== "currentPhoto") {
			console.log(catalog[id]);

			var photo = $("<img>")
				.addClass("directoryPhoto")
				.attr("src", "images/teenieimages/"+catalog[id]["emu"]["irn"]+".jpg");

			var photoContainer = $("<a>")
				.addClass("directoryPhotoContainer")
				.append(photo)
				.append("<br>")
				.attr("href", "/#"+id)
				.append("<span>" + catalog[id]["emu"]["irn"] + "</span>");



			if (catalog[id]["flagged"] !== 'false' && catalog[id]["flagged"] !== false) {
				photoContainer.append("<span id='flag' style='display:inline-block;background-color:red !important; height: 10px;width: 10px;margin-left:5px;'></span>")
			}

			$("#directory").append(photoContainer);
		}
	}
});

