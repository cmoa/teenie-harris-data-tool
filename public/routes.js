// Read eMU data from .csv file
function importEmuData() {
	var result;
	$.ajax({
        url: "/importemudata",
        type: 'get',
        async: false,
        success: function(data) {
        	console.log("SUCCESS getting emu data");
            result = JSON.parse(data);
        },
        error: function() { console.log("ERROR getting emu data"); }
     });
	return result;
}

// Send javascript the server to be written to .csv file for eMU
function exportEmuData(data) {
	$.ajax({
        url: "/exportemudata",
        type: 'post',
        data,
        complete: function (res) { console.log(res.responseText); },
    });
}

// Read .json file of generated suggestions and archivist selections
function loadManifest() {
	var result;
	$.ajax({
        url: "/loadmanifest",
        type: 'get',
        async: false,
        success: function(data) {
        	console.log("SUCCESS reading manifest");
            result = JSON.parse(data);
        },
        error: function() { console.log("ERROR reading manifest"); }
     });
	return result;
}

// Save new selections to .json file
function saveManifest(data) {
	$.ajax({
        url: "/savemanifest",
        type: 'post',
        data,
        complete: function (res) { console.log(res.responseText); },
     });
}