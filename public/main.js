// First load in data to global store
$(document).ready(function() {
	var { entries, updates, selections } = load();
	exportEmuData(entries);
});


function load(entries, updates) {
	entries = importEmuData();
	//updates = getUpdates();
	//selections = getSelections();
	return { entries, undefined, undefined };
}




