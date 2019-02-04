var entries;
var updates;
var selections;

// First load in data to global store
$(document).ready(function() {
});


function load(entries, updates) {
	loadEmuData();
}


function loadEmuData() {
	$.get("/emudata", function(data, status) {
		console.log(data);
	})
}