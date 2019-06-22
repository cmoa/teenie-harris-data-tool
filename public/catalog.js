$(document).ready(function() {

	var catalog = new Vue({
		el: '#catalog',
		data: {
		    photos: [],
		    catalogSize: 0,
		    pageSize: 0,
		    pageCount: 0,
		    catalogPage: 0,
		},
		created: function () {
			this.catalogSize = getCatalogSize();
			this.pageSize = 10;
			this.catalogPage = parseInt(localStorage.getItem('catalogPage')) || 0;
			this.pageCount = Math.ceil( this.catalogSize / this.pageSize )

			getEntries(this);
		},
		mounted: function () {
			this.$refs.pageChanger.value = this.catalogPage + 1;
		},
		methods: {
		 	prevPage: function () { changePage(this.catalogPage - 1, this) },
		 	nextPage: function () { changePage(this.catalogPage + 1, this) },
			submit : function(){ changePage(this.$refs.pageChanger.value - 1, this) },
			exportCatalog : function() { 
				console.log("EXPORTING")
				$.ajax({
			        url: "/exportcatalog",
			        type: 'get',
			        async: false,
			        success: function(data) {
			        	var blob = new Blob([data], {type: 'text/csv'});
					    if(window.navigator.msSaveOrOpenBlob) {
					        window.navigator.msSaveBlob(blob, "ecatalog.csv");
					    }
					    else{
					        var elem = window.document.createElement('a');
					        elem.href = window.URL.createObjectURL(blob);
					        elem.download = "ecatalog.csv";        
					        document.body.appendChild(elem);
					        elem.click();        
					        document.body.removeChild(elem);
					    }
			        },
			        error: function(e) { 
			        	console.log("ERROR exporting entries! " + e)
			    	}
			    });

			}
		}
	});

});


function changePage(page, view) {
	if (page < 0) {
		view.catalogPage = 0;
	} else if (page > view.pageCount - 1) {
		view.catalogPage = view.pageCount - 1;
	} else {
		view.catalogPage = page;
	}

	view.$refs.pageChanger.value = view.catalogPage + 1;
	localStorage.setItem('catalogPage', view.catalogPage);
	getEntries(view);
}


function getEntries(view) {
	$.ajax({
        url: "/getentries",
        data: { "index": view.catalogPage * view.pageSize, "length": view.pageSize },
        type: 'get',
        async: false,
        success: function(data) {
            view.photos = data.map((photo) => {

            	var flagged = false;
            	if (photo["inReview"] === undefined) { flagged = true; } 
            	else {
	            	for (var field in photo["inReview"]) {
	            		if (photo["inReview"][field] == 1) { flagged = true; } 
	            	}
	            }

            	return {
            		irn: photo["irn"],
            		accession: photo["emuInput"]["TitAccessionNo"],
            		title: photo["emuInput"]["TitMainTitle"],
            		flagged,
            	}
            });
        },
        error: function() { 
        	view.photos = [];
    	}
     });
}


function getCatalogSize() {
	var size;
	$.ajax({
        url: "/catalogsize",
        type: 'get',
        async: false,
        success: function(data) {
            size =  parseInt(data);
        },
        error: function() { 
        	size = 0;
    	}
    });
    return size;
}
