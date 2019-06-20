var view;
var photo;


function loadPhoto() {

	if (window.location.hash) {
		var irn = window.location.hash.substr(1);
		$.ajax({
	        url: "/loadphoto",
	        type: 'get',
	        data: { "irn": irn },
	        async: false,
	        success: function(result) {
	            photo = result;
	            console.log(photo);
	            console.log("SUCCESS loading photo " + irn);
	            console.log(photo);
	            view.photo = photo;
	        },
	        error: function() { 
	        	console.log("ERROR loading photo " + irn); 
	        	window.location = "/catalog"
	        }
	     });
	} else {
		window.location = "/catalog";
	}

	if (photo.emuOutput === undefined) {
		$.ajax({
	        url: "/generatephoto",
	        type: 'get',
	        data: { "irn": irn },
	        success: function(result) {
	            photo = JSON.parse(result);
	            console.log("SUCCESS generating photo " + irn);
	            console.log(photo);
	            view.photo = photo;
	        },
	        error: function() { 
	        	console.log("ERROR generating photo " + irn); 
	        	alert("ERROR generating photo " + irn);
	        	// window.location = "/catalog"
	        }
	    });
	}
}



$(window).on('hashchange', function() { window.location.reload(); });



$(document).ready(function() {

	view = new Vue({
	  el: '#page',
	  data: { 
	  	photo: undefined,
	  	expanded: false,
	  },
	  methods: {
	  	toggleImageExpansion: function () {
	  		view.expanded = !view.expanded;
	  	},
	  	toggleFlag: function (field) {
	  		if (photo["flags"][field] == 0) { photo["flags"][field] = 1; }
	  		else if (photo["flags"][field] == 1) { photo["flags"][field] = 0; }
	  	},
	  	toggleReview: function (field) {
	  		photo["inReview"][field] = 1;
	  	},
	  	updateEmuOutput: function (field) {
			var emuString = "";

			for (var i = 0; i < photo["suggestions"][field].length; i++) {
				var suggestion = photo["suggestions"][field][i];
						console.log(suggestion)

				if (suggestion["status"] === "accepted" && suggestion["data"] !== "") {
					emuString += suggestion["data"] + ",\n";
				}
			}
			photo["emuOutput"][field] = emuString.substring(0, emuString.length - 2);
			photo["inReview"][field] = 0;
		},
		endDrag() {
			console.log(event)
	    },
	    edit: function (suggestion) {
	    	suggestion.data = event.target.innerText;
	    },
		toggleSuggestion: function (suggestion) {
	  		if (suggestion.status === "accepted") { suggestion.status = "suggested"; } 
	  		else if (suggestion.status === "suggested") { suggestion.status = "accepted"; }
	  	},
	  	deleteSuggestion: function (field, index) {
	  		var filteredList = photo["suggestions"][field].filter(function(e, i) { return (i != index); });
	  		photo["suggestions"][field] = filteredList;
	  	},
	  	addSuggestion: function (field) {
	  		var pushedList = (photo["suggestions"][field]).push({ data: "", status: "suggested" })
	  	},
	  	save: function() {
	  		$.ajax({
			  type: 'POST',
			  url: "/savephoto",
			  data: JSON.stringify(photo),
			  error: function(e) {
			    console.log(e);
			  },
			  dataType: "json",
			  contentType: "application/json"
			});
	  	},
	  	saveAndNext: function() {
	  		console.log("Save and next");
	  	}
	  }
	});

	loadPhoto();
});



