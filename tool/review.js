var vue;
const mainWindow = getMainWindow();

$(document).ready(function() {
	// Setup the Vue and its methods
	vue = new Vue({
	  el: '#page',
	  data: { 
	  	photo: undefined,
	  	expanded: false,
	  	saveButtonText: "Save",
	  	saveAndNextButtonText: "Save & Quit",
	  },
	  methods: {
	  	toggleImageExpansion: function () {
	  		this.expanded = !this.expanded;
	  	},
	  	toggleFlag: function (field) {
	  		if (this.photo["flags"][field] == 0) { this.photo["flags"][field] = 1; }
	  		else if (this.photo["flags"][field] == 1) { this.photo["flags"][field] = 0; }
	  	},
	  	toggleReview: function (field) {
	  		this.photo["inReview"][field] = 1;
	  	},
	  	updateEmuOutput: function (field) {
			var emuString = "";

			for (var i = 0; i < this.photo["suggestions"][field].length; i++) {
				var suggestion = this.photo["suggestions"][field][i];
						console.log(suggestion)

				if (suggestion["status"] === "accepted" && suggestion["data"] !== "") {
					emuString += suggestion["data"] + "\n";
				}
			}
			this.photo["emuOutput"][field] = emuString.substring(0, emuString.length - 1);
			this.photo["inReview"][field] = 0;
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
	  		var filteredList = this.photo["suggestions"][field].filter(function(e, i) { return (i != index); });
	  		this.photo["suggestions"][field] = filteredList;
	  	},
	  	addSuggestion: function (field) {
	  		var pushedList = (this.photo["suggestions"][field]).push({ data: "", status: "suggested" })
	  	},
	  	save: function(quit=false, next=false) {
			var entryPath = "./catalog/" + this.photo.irn + ".json"
			var data = JSON.stringify(this.photo, null, '\t');
			try {
				fs.writeFileSync(entryPath, data, 'utf8'); 
				mainWindow.reload()
				if (quit) self.close();
				if (next) console.log("Go to next photo");
			} catch (e) {
				console.log('ERROR SAVING JSON FILE (' + entryPath + '): ' + e);
			}
	  	}
	  }
	});

	vue.photo = loadPhoto();
});


function loadPhoto() {
	if (window.location.hash) {
		var irn = window.location.hash.substr(1);

		var entryPath = "./catalog/" + irn + ".json"
		try {
			return JSON.parse(fs.readFileSync(entryPath));
		} catch (e) {
			console.log('ERROR READING JSON FILE (' + entryPath + '): ' + e);
		}
	}
}





