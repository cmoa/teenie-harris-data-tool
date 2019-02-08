// First load in data to global store
$(document).ready(function() {
	var manifest = loadManifest();
	// if ($.isEmptyObject(manifest)) {
		originalEntries = importEmuData();
		manifest = buildManifest(originalEntries);
	// }
	console.log(manifest);

	// manifestEntries["928"]["hello"] = ":)";
	saveManifest(manifest);

	exportEmuData(originalEntries);
});



