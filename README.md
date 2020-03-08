# Teenie Harris Data Tool

Scripts and data created for Carnegie Museum of Art's Teenie Harris Archive. Natural langauge processing, computer vision, web scraping, and geocoding were implemented in order to improve the Teenie Harris Archive metadata. 

## Data Processing

`data_processing` contains a number of scripts that were used to work with the data. Each script is in its own folder with its own inputs / outputs. Because the archive is so large, you will see that we've added `--max-old-space-size=8192` to each node command in order to increase the memory to 8GB for each process. 

#### 1. Converting EMu CSV to JSON

| `data_processing/emuCsv_to_json` |  |
|--------------|---------------------------|
| Installation | `npm i`                   |
| Running      | `node --max-old-space-size=8192 convert.js`|
| Inputs       | sdfsd and jsdflsdf files  |
| Outputs      |                           |

#### 2. Converting JSON to Enhanced Records

| `data_processing/json_to_enhancedRecords` |  |
|--------------|---------------------------|
| Installation |                  |
| Running      | `python processEntries.py`|
| Optional Arguments | `--help` Show the help message <br> `--irn IRN`  Specify specific record for processing |
| Inputs       |   |
| Outputs      |   |

#### 3. Converting Enhanced Records to Tool Records

#### 4. Converting Enhanced Records to Related Map


## Tool

`tool` contains an electron application designed to aid archivists in reviewing the computed suggestions. 

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

