# Teenie Harris Data Tool

Builds off the TeenieWeek of Play to use automation and machine learning techniques to improve the Teenie Harris metadata. Refinement of code created during the initial week of experimentation, so that it can be applied to a large portion of the Teenie Archive and imported into EMu.

### Installing
```npm i```
### Running
```npm run-script run```

In browser, go to ```http://localhost:3000/```


## tool

## data_processing

The data processing contains a number of scripts that were used to work with the data. Each script is in its own folder with its own inputs / outputs. Because the archive is so large, you will see that we've added `--max-old-space-size=8192` to each node command in order to increase the memory to 8GB for each process. 

### convert_emuCsv_to_json

run `npm i` to install dependencies

run `node --max-old-space-size=8192 app.js`

#### INPUT

#### PROCESS

#### OUTPUT
```
{
	"ecatalogue_key": 57779,
	"irn": 91747,
	"TitAccessionNo": "2001.35.71845",
	"CreDateCreated": "c. 1960-1975",
	"CreEarliestDate": "1960",
	"CreLatestDate": "1975",
	"PhyMediumComments": "black-and-white: Kodak safety film",
	"CatDescriptText": "",
	"TitMainTitle": "Group portrait of twelve Cardinals \"Cards\" Little League baseball players, with front row holding batting helmets, and two men, possibly coaches standing on ends, posed on bench on athletic field with display of bats and mitts, another version",
	"CreCountry_tab": "United States",
	"CreState_tab": "",
	"CreDistrict_tab": "",
	"CreCity_tab": "",
	"CrePlaceQualifier_tab": "",
	"CatSubject_tab": "Boys--Pennsylvania--Pittsburgh.Men--Pennsylvania--Pittsburgh.Portraits--Pennsylvania--Pittsburgh.Fences--Pennsylvania--Pittsburgh.Benches--Pennsylvania--Pittsburgh.Baseball Equipment and supplies--Pennsylvania--Pittsburgh.Baseball players--Pennsylvania--Pittsburgh.Men--Portraits--Pennsylvania--Pittsburgh.Boys--Portraits--Pennsylvania--Pittsburgh.",
	"AdmGUIDValue_tab": "44bd63c4-0dc5-45cb-9b36-55a4660fd4a2",
	"AdmPublishWebNoPassword": "No",
	"MultiMedia_irn": 126706,
	"MulMultiMediaRef_key": 57789,
	"image_url": "https://cmoa-collection-images.s3.amazonaws.com/teenie/126706/sizes/91747-1680.jpg"
}
```

### convert_emuCsv_to_json

