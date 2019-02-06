// Reading the emu data from csv file
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
        error: function() { console.log("ERROR getting emu data") },
        complete: function() { },
     });
	return result;
}

// Sending the new data back to the server to be written to file
function exportEmuData(data) {
	$.ajax({
        url: "/exportemudata",
        type: 'post',
        data,
        complete: function (res) { console.log(res.responseText); },
     });
}

function getSelections() {

}

function postSelections() {

}

function getUpdates() {

}