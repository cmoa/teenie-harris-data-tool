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


//////////////////////// LOAD / SAVE CATALOG ///////////////////////

function loadCatalog() {
    var result;
    $.ajax({
        url: "/loadcatalog",
        type: 'get',
        async: false,
        success: function(data) {
            console.log("SUCCESS reading catalog");
            result = JSON.parse(data);
        },
        error: function() { console.log("ERROR reading catalog"); }
     });
    return result;
}

function saveCatalog() {
    $.ajax({
        url: "/savecatalog",
        type: 'post',
        data: catalog,
        async: false,
        complete: function (res) { 
            console.log(res.responseText);
        },
     });
}

//////////////////////// LOAD / SAVE CURRENT PHOTO ///////////////////////

function loadPhoto() {
    var result;
    $.ajax({
        url: "/loadphoto",
        type: 'get',
        async: false,
        success: function(data) {
            console.log("SUCCESS reading photo");
            result = JSON.parse(data);
        },
        error: function() { console.log("ERROR reading photo"); }
     });
    return result;
}


//////////////////////// DATA ALGORITHMS ///////////////////////


// Save new selections to .json file
function shortenTitle(title) {
    var shortenedTitle = {};
    $.ajax({
        url: "/shortentitle",
        type: 'post',
        async: false,
        data: {"title" : title},
        complete: function (res) { 
            // Add completed title to manifest and refresh title div
            shortenedTitle["data"] = res.responseText;
            shortenedTitle["source"] = ["Spacy"];
            shortenedTitle["status"] = "suggested";
        },
     });
    return shortenedTitle;
}

// Save new selections to .json file
function extractNames(title) {
    $.ajax({
        url: "/extractnames",
        type: 'post',
        async: false,
        data: {"title" : title},
        complete: function (res) { 
            var people = res.responseText.split(",");
            for (var i = 0; i < people.length; i++) {
                var suggestedPerson = {};
                suggestedPerson["data"] = people[i];
                suggestedPerson["source"] = ["Spacy"];
                suggestedPerson["status"] = "suggested";
                photo["people"].push(suggestedPerson);
            }
        },
     });
}