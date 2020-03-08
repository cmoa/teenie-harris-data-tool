
var catalog;

$(document).ready(function() {

	catalog = new Vue({
		el: '#catalog',
		data: {
		    photos: [],
		    windows: {},
		    catalogSize: 0,
		    pageSize: 10,
		    pageCount: 0,
		    catalogPage: parseInt(localStorage.getItem('catalogPage')) || 0,
		    buttonText: "Export All Photos (400)",
		},
		created: function () {
			getCatalog(this);
			getPage(this);
		},
		mounted: function () {
			this.$refs.pageChanger.value = this.catalogPage + 1;
		},
		methods: {
		 	prevPage: function () { changePage(this.catalogPage - 1, this) },
		 	nextPage: function () { changePage(this.catalogPage + 1, this) },
			submit : function(){ changePage(this.$refs.pageChanger.value - 1, this) },
			// Open Photo Window, Bring Into Focus If Already Opened
			openPhotoReview: function(irn, accession) { 
				if (this.windows[irn] === undefined || this.windows[irn].closed) {
					var win = window.open('./review.html#'+irn, accession, 'nodeIntegration=yes')
					this.windows[irn] = win;
				} else {
					this.windows[irn].focus();
				}
			},
			exportCatalog : function(pageOnly=false) { 
				
				this.buttonText = "Exporting...";

				// $.ajax({
			 //        url: "/exportcatalog",
			 //        type: 'get',
			 //        async: false,
			 //        success: function(data) {
			 //        	if (data.size === 0) { 
			 //        		catalog.buttonText = "No approved entries!"; 
			 //        		window.setTimeout(() => {
				// 		    	catalog.buttonText = "Export";
				// 		    }, 1000);
			 //        		return;
			 //        	} 
			 //        	else if (data.size === 1) { catalog.buttonText = "Exported "+ data.size +" entry!"; } 
			 //        	else { catalog.buttonText = "Exported "+ data.size +" entries!"; }
			 //        	window.setTimeout(() => {
				// 	    	catalog.buttonText = "Export";
				// 	    }, 1000);

			 //        	var blob = new Blob([data.csv], {type: 'text/csv'});
				// 	    if(window.navigator.msSaveOrOpenBlob) {
				// 	        window.navigator.msSaveBlob(blob, "ecatalog.csv");
				// 	    }
				// 	    else{
				// 	        var elem = window.document.createElement('a');
				// 	        elem.href = window.URL.createObjectURL(blob);
				// 	        elem.download = "ecatalog.csv";        
				// 	        document.body.appendChild(elem);
				// 	        elem.click();        
				// 	        document.body.removeChild(elem);
				// 	    }
			 //        },
			 //        error: function(e) { 
			 //        	this.buttonText = "Error!";
			 //        	window.setTimeout(() => {
				// 	    	this.buttonText = "Export";
				// 	    }, 1000);
			 //        	console.log("ERROR exporting entries! " + e)
			 //    	}
			 //    });

			}
		}
	});

});


function changePage(page, vue) {
	if (page < 0) {
		vue.catalogPage = 0;
	} else if (page > vue.pageCount - 1) {
		vue.catalogPage = vue.pageCount - 1;
	} else {
		vue.catalogPage = page;
	}

	vue.$refs.pageChanger.value = vue.catalogPage + 1;
	localStorage.setItem('catalogPage', vue.catalogPage);
	getPage(vue);
}


function getPage(vue) {
	var length = vue.pageSize;
	var index = vue.catalogPage * vue.pageSize

	var result = [];
	var keys = Object.keys(vue.catalog);

	for (var i = index; i < (index + length); i++) {

		if (keys[i] !== undefined) {
			var photo = vue.catalog[keys[i]];
			// console.log(photo)

			var generated = false;
			var flagged = false;
			var exported = false;

			// If there's no inReview column, then this photo wasn't generated (and shouldn't be reviewed probably)
	    	if (photo["inReview"] !== undefined) { generated = true; } 

	    	// If there are any un reviewed data, then flag this photo
        	for (var field in photo["inReview"]) {
        		if (photo["inReview"][field] == 1) { flagged = true; } 
        		console.log(flagged);
        	}

	    	result.push({
	    		irn: photo["irn"],
	    		accession: photo["emuInput"]["TitAccessionNo"],
	    		title: photo["emuInput"]["TitMainTitle"],
	    		generated,
	    		flagged,
    		});
		}
	}
	console.log(result);
	vue.photos = result;
}


function getCatalog(vue) {
	var catalog = {};
	var entryFileNames = (fs.readdirSync("./catalog")).filter((entryFileName) => { 
		return entryFileName.endsWith(".json");
	});
	for (var i in entryFileNames) {
		var entryPath =  "./catalog/" + entryFileNames[i];
		try {
			var entry = JSON.parse(fs.readFileSync(entryPath));
			catalog[entry['irn']] = entry;
		} catch (e) {
			console.log('ERROR PARSING JSON FILE (' + entryPath + '): ' + e);
		}
	}

	var size = Object.keys(catalog).length

	vue.catalog = catalog;
	vue.catalogSize = size;
	vue.pageCount = Math.ceil( size / vue.pageSize );

	return;
}

