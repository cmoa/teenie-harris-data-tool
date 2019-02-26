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
function saveManifest() {
	$.ajax({
        url: "/savemanifest",
        type: 'post',
        data: manifest,
        complete: function (res) { 
            console.log(res.responseText); 
            populateUI();
        },
     });
}

// Save new selections to .json file
function shortenTitle(title, id) {
    $.ajax({
        url: "/shortentitlepythonnlp",
        type: 'post',
        data: {"title" : title},
        complete: function (res) { 
            // Add completed title to manifest and refresh title div
            var suggestedTitle = {};
            suggestedTitle["data"] = res.responseText;
            suggestedTitle["source"] = ["Python NLP"];
            suggestedTitle["status"] = "suggested";
            manifest[id]["titles"].push(suggestedTitle);
            saveManifest();

            $.ajax({
                url: "/shortentitlegooglenlp",
                type: 'post',
                data: {"title" : title},
                complete: function (res) { 
                    // Add completed title to manifest and refresh title div
                    var suggestedTitle = {};
                    suggestedTitle["data"] = res.responseText;
                    suggestedTitle["source"] = ["Google NLP"];
                    suggestedTitle["status"] = "suggested";

                    manifest[id]["titles"].push(suggestedTitle);
                    saveManifest();
                },
             });
        },
     });
}