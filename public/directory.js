var catalog;

// First load in data to global store
$(document).ready(function() {
	catalog = loadCatalog();

	for (id in catalog) { 
		if (id !== "currentPhoto") {

			var status;

			if (catalog[id]["flagged"] === true || catalog[id]["flagged"] === "true") status = "needs review";
			else if (catalog[id]["reviewed"] === true || catalog[id]["reviewed"] === "true") status = "approved";
			else status = "sdf";

			var photoContainer = $("<tr>")
				.addClass("directoryPhotoContainer")
				.append("<br>")
				.append("<td><a href='/#"+id+"'>" + catalog[id]["emu"]["TitAccessionNo"] + "</a></td>")
				.append("<td>" + status + "</td>");

			$("#directory").append(photoContainer);
		}
	}
});

