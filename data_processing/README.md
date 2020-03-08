# Teenie Harris Data Tool






## Data Processing

A collections of scripts to improve the Teenie Harris Archive's metadata. 

### Convert EMu CSV to JSON records

#### Inputs

#### Outputs

#### Installing
* Go to `teenie-harris-data-tool/data_processing`
* ```npm i```

#### Running
* Go to `teenie-harris-data-tool/data_processing/emuCsv_to_json`
* ```node --max-old-space-size=8192 convert.js```


### Convert EMu CSV to JSON records



### Installing
```npm i```
### Running
```npm run-script run```

In browser, go to ```http://localhost:3000/```


Depedencies:

python 2.7
python libraries:
- spacy


# Installation

1. `pipenv install`
2. `pipenv run python -m spacy download en`
3. `pipenv run python trim.py`


# Running
`python processEntry.py irn [#]`
