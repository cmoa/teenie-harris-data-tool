# Teenie Harris Data Tool

Scripts and data created for Carnegie Museum of Art's Teenie Harris Archive. Natural langauge processing, computer vision, web scraping, and geocoding were implemented in order to improve the Teenie Harris Archive metadata. An electron app prototype was developed in order to assist archivists in reviewing the computed data.

## Data Processing

`data_processing` contains a number of scripts that were used to work with the data. Each script is in its own folder with its own inputs / outputs. Because the archive is so large, you will see that we've added `--max-old-space-size=8192` to each node command in order to increase the memory to 8GB for each process. 

### 1. Converting EMu CSV to JSON

| `data_processing/emuCsv_to_json` |  |
|--------------|---------------------------|
| Installation | From the `data_processing` directory, `npm i` |
| Running      | `node --max-old-space-size=8192 convert.js`|
| Inputs       | `ecatalog.csv` and `MulMulti.csv` exported from EMu, the museum's collection management system |
| Outputs      | A directory of `.json` files - one for each record - named according to IRN (ex. `928.json`)|

###### Sample Output
`928.json`
```
{
	"ecatalogue_key": 146,
	"irn": 928,
	"TitAccessionNo": "2001.35.148",
	"CreDateCreated": "May 1953",
	"CreEarliestDate": "1953-05-01",
	"CreLatestDate": "1953-05-30",
	"PhyMediumComments": "black-and-white: Kodak safety film",
	"CatDescriptText": "Cutline of image published in Pittsburgh Courier newspaper, May 30, 1953, pg. 27, reads: \"Uptown Little League Opens Friday Evening.  Ready for LL Opener - The four teams who'll participate in the Uptown little League this summer are shown in the uniforms in which they'll play Friday evening when the first games of the season will be played.  The teams are shown above... Upper right is the Pittsburgh Lions.  Kneeling, left to right, Robert Dalley, John King, James Dunmore, William Smith, Stanley Edward and Lessie Washington.  Standing: Bridder Pearson, Levi Williams, Willie Millender, Fred Wynn, Robert Sneed, Donald Primus, Tommy Wallace, Charles McKay and Raymond Woods... Harris Photos.\"",
	"TitMainTitle": "Pittsburgh Lions Little League baseball team, kneeling from left: Robert Dalley, John King, James Dunmore, William Smith, Stanley Edward, Lessie Washington; standing: Bridder Pearson, Levi Williams, Willie Millender, Fred Wynn, Robert Sneed, Donald Primus, Tommy Wallace, Charles McKay and Raymond Woods, on Kennard Field with Terrace Village in background",
	"CreCountry_tab": "United States",
	"CreState_tab": "Pennsylvania",
	"CreDistrict_tab": "Allegheny county",
	"CreCity_tab": "Pittsburgh",
	"CrePlaceQualifier_tab": "",
	"CatSubject_tab": "Boys--Pennsylvania--Pittsburgh.Baseball--Pennsylvania--Pittsburgh.Baseball players--Pennsylvania--Pittsburgh.Athletes--Pennsylvania--Pittsburgh.Kennard Field (Pittsburgh, Pa.)Terrace Village (Pittsburgh, Pa.)Little League Baseball, inc.",
	"AdmGUIDValue_tab": "68899705-aea6-4a83-bf9a-b48f73cb5d31",
	"AdmPublishWebNoPassword": "Yes",
	"MultiMedia_irn": 15053,
	"MulMultiMediaRef_key": 147,
	"image_url": "https://cmoa-collection-images.s3.amazonaws.com/teenie/15053/sizes/928-1680.jpg"
}
```

### 2. Converting JSON to Enhanced Records

| `data_processing/json_to_enhancedRecords` |  |
|--------------|---------------------------|
| Installation | Download and install [Conda](https://conda.io/projects/conda/en/latest/index.html) <br> From the `data_processing` directory, <br>`conda env create -f environment.yml`|
| Running      | `python processEntries.py`|
| Optional Arguments | `--help` Show the help message <br> `--irn IRN`  Specify specific record for processing |
| Inputs       | Records in `data_processing/emuCsv_to_json/output/jsonRecords` <br> Processed data from the [Teenie Harris Project](https://github.com/CreativeInquiry/TeenieHarrisProject) (included in this repo)  |
| Outputs      |  A directory of enhanced `.json` files - one for each record - named according to IRN (ex. `928.json`)|

###### Sample Output
`928.json`
```
{
	"ecatalogue_key": 146,
	"irn": 928,
	"TitAccessionNo": "2001.35.148",
	"CreDateCreated": "May 1953",
	"CreEarliestDate": "1953-05-01",
	"CreLatestDate": "1953-05-30",
	"PhyMediumComments": "black-and-white: Kodak safety film",
	"CatDescriptText": "Cutline of image published in Pittsburgh Courier newspaper, May 30, 1953, pg. 27, reads: \"Uptown Little League Opens Friday Evening.  Ready for LL Opener - The four teams who'll participate in the Uptown little League this summer are shown in the uniforms in which they'll play Friday evening when the first games of the season will be played.  The teams are shown above... Upper right is the Pittsburgh Lions.  Kneeling, left to right, Robert Dalley, John King, James Dunmore, William Smith, Stanley Edward and Lessie Washington.  Standing: Bridder Pearson, Levi Williams, Willie Millender, Fred Wynn, Robert Sneed, Donald Primus, Tommy Wallace, Charles McKay and Raymond Woods... Harris Photos.\"",
	"TitMainTitle": "Pittsburgh Lions Little League baseball team, kneeling from left: Robert Dalley, John King, James Dunmore, William Smith, Stanley Edward, Lessie Washington; standing: Bridder Pearson, Levi Williams, Willie Millender, Fred Wynn, Robert Sneed, Donald Primus, Tommy Wallace, Charles McKay and Raymond Woods, on Kennard Field with Terrace Village in background",
	"CreCountry_tab": "United States",
	"CreState_tab": "Pennsylvania",
	"CreDistrict_tab": "Allegheny county",
	"CreCity_tab": "Pittsburgh",
	"CrePlaceQualifier_tab": "",
	"CatSubject_tab": "Boys--Pennsylvania--Pittsburgh.Baseball--Pennsylvania--Pittsburgh.Baseball players--Pennsylvania--Pittsburgh.Athletes--Pennsylvania--Pittsburgh.Kennard Field (Pittsburgh, Pa.)Terrace Village (Pittsburgh, Pa.)Little League Baseball, inc.",
	"AdmGUIDValue_tab": "68899705-aea6-4a83-bf9a-b48f73cb5d31",
	"AdmPublishWebNoPassword": "Yes",
	"MultiMedia_irn": 15053,
	"MulMultiMediaRef_key": 147,
	"image_url": "https://cmoa-collection-images.s3.amazonaws.com/teenie/15053/sizes/928-1680.jpg"
}
```

### 3. Converting Enhanced Records to Related Map

| `data_processing/enhancedRecords_to_relatedMap` |  |
|--------------|---------------------------|
| Installation | Download and install [Conda](https://conda.io/projects/conda/en/latest/index.html) <br> From the `data_processing` directory, <br>`conda env create -f environment.yml`|
| Running      | `python makeRelatedMap.py`|
| Optional Arguments | `--help` Show the help message <br> `--irn IRN`  Specify specific record for processing |
| Inputs       | Records in `data_processing/json_to_enhancedRecords/output/jsonRecords` |
| Outputs      |  [`relatedMap.json`]() - a dictionary that maps a keyword to a list of records (by IRN) containing that keyword |

## Review Tool

`tool` contains an electron app prototype that was developed in order to assist archivists in reviewing the computed data.

#### Installing
```npm i```

#### Running
```npm run-script run```

In browser, go to ```http://localhost:3000/```


### convert_emuCsv_to_json

## Open Source

We're open sourcing the *code* in this repo, feel free to reuse, remix, rethink the coded React application. The Teenie Harris photographs are property of the Carnegie Museum of Art, and are not open source.

## Collections As Data

Funding for the development of this application was provided by [Collections as Data: Part to Whole](https://collectionsasdata.github.io/part2whole/)

#### Team
Ed Motznik, Senior Administrator <br/>
Dominique Luster, Project Lead <br/>
Charlene Foggie-Barnett, Disciplinary Scholar <br/>
[Sam Ticknor](https://samt.work), Creative Technologist <br/>

#### Additional Thanks 
[Frank-Ratchye STUDIO for Creative Inquiry](https://github.com/CreativeInquiry) <br/>
Caroline Record <br/>
[Carney](https://carney.co/) <br />


## Learn More
* To learn more about Teenie Harris and Carnegie Museum of Art, visit [https://cmoa.org/art/teenie-harris-archive/](https://cmoa.org/art/teenie-harris-archive/)
* You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
* To learn React, check out the [React documentation](https://reactjs.org/)

