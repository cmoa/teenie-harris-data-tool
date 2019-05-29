var catalog;

// First load in data to global store
$(document).ready(function() {
	catalog = loadCatalog();

	for (id in catalog) { 
		if (id !== "currentPhoto") {

			var status;
			var flagged = false;

			for (flag in catalog[id]["flags"]) {
				if (JSON.parse(catalog[id]["flags"][flag])) {
					flagged = true;
				}
			}

			if (flagged) status = "Needs Additional Review";
			else if (catalog[id]["approved"] === true || catalog[id]["approved"] === "true") status = "Complete";
			else status = "Needs Review";

			var photoContainer = $("<tr>")
				.addClass("directoryPhotoContainer")
				.append("<br>")
				.append("<td><a href='/#"+id+"'>" + catalog[id]["emuInput"]["irn"] + "</a></td>")
				.append("<td>" + status + "</td>");

			$("#directory").append(photoContainer);
		}
	}
});

