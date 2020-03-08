# Teenie Harris Data Tool

Scripts and data created for Carnegie Museum of Art's Teenie Harris Archive. Natural langauge processing, computer vision, web scraping, and geocoding were implemented in order to improve the Teenie Harris Archive metadata. An electron app prototype was developed in order to assist archivists in reviewing the computed data.

## Data Processing

`data_processing` contains a number of scripts that were used to work with the data. Each script is in its own folder with its own inputs / outputs.

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
| Config | You will need a [Google Geocoding API Key](https://developers.google.com/maps/documentation/geocoding/start?utm_source=google&utm_medium=cpc&utm_campaign=FY18-Q2-global-demandgen-paidsearchonnetworkhouseads-cs-maps_contactsal_saf&utm_content=text-ad-none-none-DEV_c-CRE_315916117595-ADGP_Hybrid+%7C+AW+SEM+%7C+BKWS+~+Google+Maps+Geocoding+API-KWID_43700039136946117-kwd-300650646186-userloc_9067609&utm_term=KW_google%20geocoding%20api-ST_google+geocoding+api&gclid=CjwKCAiAzJLzBRAZEiwAmZb0avP8bLbchaTwUPNsunOAl2yto6T1_nM9aD9In0rdtgPEq-Xo4HxiDRoC3-gQAvD_BwE) in order to generate location data <br> Include it [here](https://github.com/cmoa/teenie-harris-data-tool/blob/49c908d7ab3e1ba552980e80aa16aa3b20913809/data_processing/json_to_enhancedRecords/processEntries.py#L189)|
| Running      | `python processEntries.py`|
| Optional Arguments | `--help` Show the help message <br> `--irn IRN`  Specify specific record for processing |
| Inputs       | Records in `data_processing/emuCsv_to_json/output/jsonRecords` <br> Processed data from the [Teenie Harris Project](https://github.com/CreativeInquiry/TeenieHarrisProject) (included in this repo)  |
| Outputs      |  A directory of enhanced `.json` files - one for each record - named according to IRN (ex. `928.json`)|

###### Sample Output
`928.json`
```
{
    "objectID": 928,
    "irn": 928,
    "ecatalogue_key": 146,
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
    "image_url": "https://cmoa-collection-images.s3.amazonaws.com/teenie/15053/sizes/928-1680.jpg",
    "date_timestamp_earliest": -526089600.0,
    "date_timestamp_latest": -523584000.0,
    "decades": [
        "1950s"
    ],
    "people": [
        "Robert Dalley",
        "Stanley Edward",
        "Robert Sneed",
        "Charles McKay",
        "Tommy Wallace",
        "Levi Williams",
        "Bridder Pearson",
        "James Dunmore",
        "William Smith",
        "Donald Primus",
        "Fred Wynn",
        "John King",
        "Raymond Woods",
        "Willie Millender"
    ],
    "places": [
        {
            "type": "place",
            "score": 100,
            "long_name": "Lessie Washington",
            "short_name": "Lessie Washington"
        },
        {
            "type": "place",
            "score": 100,
            "long_name": "Terrace Village",
            "short_name": "Terrace Village"
        },
        {
            "type": "place",
            "score": 100,
            "long_name": "Pennsylvania",
            "short_name": "Pennsylvania"
        },
        {
            "type": "place",
            "score": 100,
            "long_name": "Pittsburgh",
            "short_name": "Pittsburgh"
        },
        {
            "type": "place",
            "score": 100,
            "long_name": "Pa.)Terrace Village",
            "short_name": "Pa.)Terrace Village"
        }
    ],
    "bibliography": {
        "publication": [
            "Pittsburgh Courier"
        ],
        "date": [
            "May 30, 1953"
        ],
        "page": [
            "27"
        ],
        "cutline": [
            "Uptown Little League Opens Friday Evening.  Ready for LL Opener - The four teams who'll participate in the Uptown little League this summer are shown in the uniforms in which they'll play Friday evening when the first games of the season will be played.  The teams are shown above... Upper right is the Pittsburgh Lions.  Kneeling, left to right, Robert Dalley, John King, James Dunmore, William Smith, Stanley Edward and Lessie Washington.  Standing: Bridder Pearson, Levi Williams, Willie Millender, Fred Wynn, Robert Sneed, Donald Primus, Tommy Wallace, Charles McKay and Raymond Woods... Harris Photos."
        ]
    },
    "people_count": 15,
    "google_text_in_image": "",
    "subjects": [
        "Boys",
        "Baseball",
        "Baseball players",
        "Athletes",
        "Pittsburgh courier"
    ],
    "keywords": [
        {
            "keyword": "Evening",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Pittsburgh Courier",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Uptown Little League Opens",
            "score": 0.3333333333333333
        },
        {
            "keyword": "William Smith",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Baseball",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Athletes",
            "score": 0.3333333333333333
        },
        {
            "keyword": "evening",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Raymond Woods",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Fred Wynn",
            "score": 0.3333333333333333
        },
        {
            "keyword": ")Terrace Village ",
            "score": 0.3333333333333333
        },
        {
            "keyword": "May 30, 1953",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Kennard Field",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Baseball players",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Levi Williams",
            "score": 0.3333333333333333
        },
        {
            "keyword": "John King",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Robert Dalley",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Pittsburgh Lions Little League",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Stanley Edward",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Friday",
            "score": 0.3333333333333333
        },
        {
            "keyword": ")Little League Baseball, inc",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Kennard Field ",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Charles McKay",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Boys",
            "score": 0.3333333333333333
        },
        {
            "keyword": "Tommy Wallace",
            "score": 0.3333333333333333
        },
        {
            "keyword": "the Pittsburgh Lions",
            "score": 0.3333333333333333
        },
        {
            "keyword": "this summer",
            "score": 0.3333333333333333
        },
        {
            "keyword": "team",
            "score": 0.31906993333333333
        },
        {
            "keyword": "black and white",
            "score": 0.2945623
        },
        {
            "keyword": "team sport",
            "score": 0.26346189999999997
        },
        {
            "keyword": "photography",
            "score": 0.26322855666666667
        },
        {
            "keyword": "sports",
            "score": 0.25955788333333335
        },
        {
            "keyword": "player",
            "score": 0.2437732296875
        },
        {
            "keyword": "monochrome photography",
            "score": 0.24176611666666667
        },
        {
            "keyword": "monochrome",
            "score": 0.23689474666666666
        },
        {
            "keyword": "recreation",
            "score": 0.20440554666666666
        }
    ]
}
```

### 3. Generating a Related Map from Enhanced Records

| `data_processing/enhancedRecords_to_relatedMap` |  |
|--------------|---------------------------|
| Installation | Download and install [Conda](https://conda.io/projects/conda/en/latest/index.html) <br> From the `data_processing` directory, <br>`conda env create -f environment.yml`|
| Running      | `python makeRelatedMap.py`|
| Inputs       | Records in `data_processing/json_to_enhancedRecords/output/jsonRecords` |
| Outputs      |  [`relatedMap.json`](https://github.com/cmoa/teenie-harris-data-tool/blob/master/data_processing/enhancedRecords_to_relatedMap/output/relatedMap.json) - a dictionary that maps a keyword to a list of records (by IRN) containing that keyword |

## Review Tool

Witness in the above enhanced record sample, that the computed data is not 100% reliable. Before integrating the new data into EMu, the collection management system, the data must be reviewed. `tool` contains an electron app prototype that was developed in order to assist archivists in efficiently reviewing the computed data.

PICTURE OF INTERFACE

| `data_processing/tool` |  |
|--------------|---------------------------|
| Installation | `npm i` |
| Running      | `npm run-script start`|
| Inputs       | Enhanced `.json` records |
| Outputs      | A `.csv` that can be uploaded to EMu |

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
To learn more about Teenie Harris and Carnegie Museum of Art, visit [https://cmoa.org/art/teenie-harris-archive/](https://cmoa.org/art/teenie-harris-archive/)
