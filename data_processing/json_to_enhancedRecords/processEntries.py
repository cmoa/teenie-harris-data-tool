from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from difflib import SequenceMatcher
import json
from nameparser import HumanName
import numpy as np
import pandas as pd
from multiprocessing import Pool
from pyquery import PyQuery as pq
import os
import re
import requests
from requests.exceptions import HTTPError
import spacy
from spacy.matcher import Matcher
from spacy.symbols import *
import sys
from spacy.lang.en.stop_words import STOP_WORDS

# en_core_web_md
print('--------------------------------------------------')
print(f'Loading spacy medium core....this can take a minute or so...')
print('--------------------------------------------------')
nlp = spacy.load('en_core_web_md')

def findApprovedSubjects(subject, subject_type, addToKeywords=False):
    result = []
    extras = []
    if subject_type.lower() == 'name':
        url = f'http://id.loc.gov/search/?q=cs:http://id.loc.gov/authorities/names&q={subject}'
        minMatchRatioThreshold = .9;
    elif subject_type.lower() == 'subject':
        url = f'http://id.loc.gov/search/?q=cs:http://id.loc.gov/authorities/subjects&q={subject}';
        minMatchRatioThreshold = .9;
    else:
        print(f'Unexpected subject_type "{subject_type}" in findApprovedSubjects()')

    queryable_response = pq(url, headers={'user-agent': 'pyquery'})
    matchedDOMElements = queryable_response('a').filter('[title="Click to view record"]')
    for matchedDOMElement in matchedDOMElements:
        text = matchedDOMElement.text
        variants = pq(matchedDOMElement).parents('tbody').find('[title="Variant Labels"]').text().split(' ; ')

        # if the text is a close match, it is an approved subject header 
        if SequenceMatcher(None, subject, text).ratio() > minMatchRatioThreshold:
            result.append(text)
        # other wise, check its variants to see if it is ok
        else:
            for variant in variants:
                if SequenceMatcher(None, subject, variant).ratio() > minMatchRatioThreshold:
                    result.append(text)
                    extras.append(variant)
                    break

        extras.append(subject)

    if not result and addToKeywords:
        # No subjects found in query, return the input
        # add the subject to keywords
        return ([], [subject])

    return (list(set(result)), list(set(extras)))


def cleanEMUSubjects(subjects):
    result = []
    # trim trailing '.'
    subjects = subjects[:-1]
    emuSubjects = subjects.split('.')
    for emuSubject in emuSubjects:
        cleanEMUSubject = emuSubject
        if '--' in emuSubject:
            cleanEMUSubject = emuSubject.split('--')[0]
        elif '(' in emuSubject:
            cleanEMUSubject = emuSubject.split('(')[0]
        result.append(cleanEMUSubject)
    return result


def getKeyword(keywordObject): 
    return keywordObject.keyword

def getSuggestedSubjects(subjects, names, entities):
    result = set()
    extras = set()

    with ThreadPoolExecutor() as executor:
        futures = []

        cleanSubjects = cleanEMUSubjects(subjects)
        for subject in cleanSubjects:
            futures.append(executor.submit(findApprovedSubjects, subject, "subject", True))

        for entity in entities:
            futures.append(executor.submit(findApprovedSubjects, entity, "name", True))

        for name in names:
            futures.append(executor.submit(findApprovedSubjects, name, "name", False))

        for future in futures:
            future_result = future.result()
            result.update(future_result[0])
            extras.update(future_result[1])

    return list(result), list(extras)

def extractBibliography(entry):
    result = {}
    description = entry['CatDescriptText']
    section_pattens = {
        'publication': 'in (.*) newspaper',
        'date': ', (.*), pg|newspaper (.*), pg',
        'page': 'pg. ([0-9]*)|pg ([0-9]*)|page ([0-9]*)',
        'cutline': 'reads: "(.*)"|reads "(.*)"'
    }
    for section, pattern in section_pattens.items():
        extractedSections = re.findall(pattern, description)
        if extractedSections:
            result[section] = []
            for extractedSection in extractedSections:
                if isinstance(extractedSection, tuple):
                    result[section].extend([text for text in extractedSection if text])
                else:
                    result[section].append(extractedSection)
    return result

def extractNames(entry):
    people = []
    namesDoc = nlp(entry['TitMainTitle'] + ' ... ' + entry['CatDescriptText'])
    currentName = ''
    for token in namesDoc:
        if (token.text.lower() == 'unknown'):
            people.append('Unknown')
        elif (token.ent_iob_ == 'B' and token.ent_type_ == 'PERSON'): #start of entitity
            currentName = token.text
        elif (token.ent_iob_ == 'I' and token.ent_type_ == 'PERSON'): #continuation of entitity
            currentName += ' ' + token.text
        else:
            # no longer entitity
            if (currentName != ''
                    and 'harris photo' not in currentName.lower()
                    and not currentName in people):
                people.append(currentName)
                currentName = ''
    return list(set(people))

#### TO DO 
def extractEntities(entry):
    subjects = []
    subjectEntityTypes = ['FAC', 'LOC', 'NORP', 'ORG', 'PRODUCT', 'EVENT', 'WORK_OF_ART', 'LAW', 'LANGUAGE', 'DATE', 'TIME']
    subjectsDoc = nlp(entry['TitMainTitle'] + ' ... ' + entry['CatDescriptText'])
    for ent in subjectsDoc.ents:
        if ent.label_ in subjectEntityTypes:
            subjects.append(ent.text)

    return subjects

### PLACES
def extractPlaces(entry):
    mappedQueries = []
    places = []
    placeEntityTypes = ['FAC', 'LOC', 'GPE']
    placesDoc = nlp(entry['TitMainTitle'] + ' ... ' + entry['CatDescriptText'] + '...' + entry['CatSubject_tab'])
    for ent in placesDoc.ents:
        if ent.label_ in placeEntityTypes:
            if (ent.text not in mappedQueries):
                places.extend(getAddressFromPlace(ent.text))
                mappedQueries.append(ent.text)
    places = sorted(places, key=lambda x: x['score'], reverse=True)
    places = arbitratePlaces(places);
    return places

def arbitratePlaces(places):
    arbitratedPlaces = []
    seenPlaces = []

    for place in places:
        name = place.get("long_name", "")
        if name not in seenPlaces:
            arbitratedPlaces.append(place)
            seenPlaces.append(name)

    return arbitratedPlaces


def getAddressFromPlace(place):
    result = []

    googleMapsApiKey = 'PUT YOUR API KEY HERE';

    url =  ('https://maps.googleapis.com/maps/api/geocode/json?address={}&key='+googleMapsApiKey).format(place+' near Pittsburgh')
    headers = {'User-Agent': 'request'}
    response = requests.get(url, headers=headers).json()
    address_results = response.get('results')
    if address_results:
        result.extend(parseAddressComponents(address_results[0].get('address_components', [])))
    else:
        result.append({
            'type': 'place',
            'score': 100,
            'long_name': place,
            'short_name': place
        })
    return result

def parseAddressComponents(address_components):
    address_component_rank = {
        'street_address': 100,
        'point_of_interest': 90,
        'establishment': 90,
        'park': 90,
        'airport': 90,
        'natural_feature': 90,
        'neighborhood': 80,
        'intersection': 80,
        'sublocality': 60,
        'locality': 50,
        'colloquial_area': 50, 
        'route': 50,
        'administrative_area_level_3': 40,
        'administrative_area_level_2': 30,
        'administrative_area_level_1': 20,
        'country': 10,
    }
    result = []
    for component in address_components:
        address_types = [t for t in component.get('types', []) if t in address_component_rank.keys()]
        for address_type in address_types:
            result.append({
                'type': address_type,
                'score': address_component_rank[address_type],
                'long_name': component.get('long_name'),
                'short_name': component.get('short_name')
            })
    return result

### END PLACES


# trim unneccessary leading phrases
def trim_leading(text):
    return re.sub('^(Group )?portrait(,| of) ', '', text, flags=re.I)

# trim unneccessary trailing phrases
def trim_trailing(text):
    return re.sub(', another (version|pose)\s*$', '', text, flags=re.I)

def shortenTitle(entry):
    ## print(entry["TitMainTitle"])
    title = trim_leading(trim_trailing(entry["TitMainTitle"]))
    titleDoc = nlp(unicode(title))

    new_title = []

    ## print info for each token

    # main subject
    subjectIndexStart = None
    subjectIndexEnd = None
    for token in titleDoc:
        if token.pos_ == "PROPN" and subjectIndexStart == None:
            subjectIndexStart = token.i
            new_title.append(token.text)
        elif (token.pos_ == "PROPN" or token.pos_ == "NOUN" or token.text == "," or token.text == "and") and subjectIndexStart != None:
            new_title.append(token.text)
        elif subjectIndexStart != None:
            subjectIndexEnd = token.i
            break;

    # main action
    actionIndexStart = None
    actionIndexEnd = None
    for token in titleDoc:
        if token.i >= subjectIndexEnd: 
            if token.pos_ == "VERB" and actionIndexStart == None:
                actionIndexStart = token.i
                new_title.append(token.text)
            elif token.text != "," and actionIndexStart != None:
                new_title.append(token.text)
            elif actionIndexStart != None:
                actionIndexEnd = token.i
                break;


    placeIndexStart = None
    placeIndexEnd = None
    for token in titleDoc:
        if token.text == "on" or token.text == "at" and placeIndexStart == None:
            placeIndexStart = token.i
            new_title.append(token.text)
        elif (token.pos_ == "NOUN" or token.pos_ == "PROPN" or token.text == "of") and placeIndexStart != None:
            new_title.append(token.text)
        elif placeIndexStart != None:
            placeIndexEnd = token.i
            break;

    result = " ".join(new_title)
    return [result, result + "."]


def splitNames(names):
    splitNames = []
    for name in names:
        splitName = HumanName(person)
        name = {}
        name["data"] = person
        name["title"] = splitName.title
        name["first"] = splitName.first
        name["middle"] = splitName.middle
        name["last"] = splitName.last
        name["suffix"] = splitName.suffix
        name["nickname"] = splitName.nickname
        splitNames.append(name)
    return splitNames


def arbitrateKeywords(imagga_keywords, google_keywords, extraSubjects):
    
    all_keywords = {}

    for keyword in extraSubjects:
        all_keywords[keyword] = 1

    for entry in imagga_keywords:
        keyword = entry['description']
        score = entry['score']
        if keyword not in all_keywords:
            all_keywords[keyword] = 0
        all_keywords[keyword] += score / 100.0

    for entry in google_keywords:
        keyword = entry['description']
        score = entry['score']
        if keyword not in all_keywords:
            all_keywords[keyword] = 0
        all_keywords[keyword] += score

    all_keywords = [{'keyword': keyword, 'score': score / 3.0} for keyword, score in all_keywords.items()]
    all_keywords = sorted(all_keywords, key=lambda x: x['score'], reverse=True)
    all_keywords = list(filter(pruneKeywords, all_keywords))
    return all_keywords

def pruneKeywords(keyword):
    removeWords = ["black", "white", "", "photograph", "Women's work"]
    if (keyword.get("score", 0) > .2 and keyword.get("keyword", "") not in removeWords):
        return True
    else:
        return False


def extractDecades(entry): 
    start1920 = pd.to_datetime('1920').timestamp()
    start1930 = pd.to_datetime('1930').timestamp()
    start1940 = pd.to_datetime('1940').timestamp()
    start1950 = pd.to_datetime('1950').timestamp()
    start1960 = pd.to_datetime('1960').timestamp()
    start1970 = pd.to_datetime('1970').timestamp()
    start1980 = pd.to_datetime('1980').timestamp()

    decades = []
    
    if (entry["date_timestamp_earliest"] >= start1920 and entry['date_timestamp_latest'] < start1930): decades.append("1920s")
    elif (entry["date_timestamp_earliest"] >= start1930 and entry['date_timestamp_latest'] < start1940): decades.append("1930s")
    elif (entry["date_timestamp_earliest"] >= start1940 and entry['date_timestamp_latest'] < start1950): decades.append("1940s")
    elif (entry["date_timestamp_earliest"] >= start1950 and entry['date_timestamp_latest'] < start1960): decades.append("1950s")
    elif (entry["date_timestamp_earliest"] >= start1960 and entry['date_timestamp_latest'] < start1970): decades.append("1960s")
    elif (entry["date_timestamp_earliest"] >= start1970 and entry['date_timestamp_latest'] < start1980): decades.append("1970s")

    return decades

          

def generate_irn_metadata(inputs):
    irn, emu_record_path, people_count, imagga_results, google_results, output_path = inputs

    entry = {
        "objectID": irn,
        "irn": irn
    }

    with open(emu_record_path) as json_file:
        emu_record = json.load(json_file)

    entry.update(emu_record)

    try:
        entry['date_timestamp_earliest'] = pd.to_datetime(entry['CreEarliestDate']).timestamp()
        entry['date_timestamp_latest'] = pd.to_datetime(entry['CreLatestDate']).timestamp()
        entry['decades'] = extractDecades(entry)
    except Exception as e:
        entry["date_timestamp_earliest"] = None
        entry["date_timestamp_latest"] = None
        entry["decades"] = None
        print(f"Failed to parse date datetime for irn: {irn}")

    entry['people'] = extractNames(emu_record)
    entry['places'] = extractPlaces(emu_record)  
    entry['bibliography'] = extractBibliography(emu_record)

    entry['people_count'] = people_count.get(str(irn), {}).get('peopleCount', 0)

    imagga_keywords = imagga_results.get(str(irn), {}).get('imageLabels', [])

    google_keywords = google_results.get(str(irn), {}).get('imageLabels', [])
    entry['google_text_in_image'] = google_results.get(str(irn), {}).get('imageText', '')

    entry['subjects'], extraSubjects = getSuggestedSubjects(emu_record['CatSubject_tab'], entry['people'], extractEntities(emu_record))

    entry['keywords'] = arbitrateKeywords(imagga_keywords, google_keywords, extraSubjects)

    # write the file
    with open(output_path, "w") as json_file:
        json_file.write(json.dumps(entry, indent=4))
        print(f'Processed irn: {irn}')



if __name__ == '__main__':

    import argparse

    parser = argparse.ArgumentParser(description='Process entry')
    parser.add_argument(
        '--irn',
        type=int,
        help='Specify irn identifier to process. If not provided, will run for all irns with a ' \
                'photo record.'
    )

    args = parser.parse_args()

    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

    with open(os.path.join(repo_root, 'data_processing/json_to_enhancedRecords/input/STUDIOTeenieHarrisProjectData/people-in-images/peopleResults.json')) as json_file:
        people_count = json.load(json_file)

    with open(os.path.join(repo_root, 'data_processing/json_to_enhancedRecords/input/STUDIOTeenieHarrisProjectData/imagga_analyses_of_teenie_harris_archive/imaggaResults.json')) as json_file:
        imagga_results = json.load(json_file)

    with open(os.path.join(repo_root, 'data_processing/json_to_enhancedRecords/input/STUDIOTeenieHarrisProjectData/google_analyses_of_teenie_harris_archive/googleResults.json')) as json_file:
        google_results = json.load(json_file)

    json_records_dir = os.path.join(repo_root,  'data_processing/emuCsv_to_json/output/jsonRecords')
    output_dir = os.path.join(repo_root, f'data_processing/json_to_enhancedRecords/output/jsonRecords')

    if args.irn:
        emu_record_path = os.path.join(json_records_dir, f'{args.irn}.json')
        output_path = os.path.join(output_dir, f'{args.irn}.json')
        generate_irn_metadata((args.irn, emu_record_path, people_count, imagga_results, google_results, output_path))

    else:
        count = 0
        process_args = []
        for record in os.listdir(json_records_dir):
            match = re.search('([0-9]+).json', record)
            if not match:
                continue

            irn = int(match.group(1))
            count += 1
            output_path = os.path.join(output_dir, f'{irn}.json')
            if os.path.isfile(output_path):
                # Already processed irn
                continue

            emu_record_path = os.path.join(json_records_dir, record)
            process_args.append((irn, emu_record_path, people_count, imagga_results, google_results, output_path))

        print(f'Number of total emu json records: {count}')
        print(f'Number of unprocessed emu json records: {len(process_args)}')
        print(f'Begining Processing of {len(process_args)} records')
        print('--------------------------------------------------')
        print('Keep computer on and plugged in. It could take a few hours to process full collection.')
        print('--------------------------------------------------')

        with Pool() as p:
            p.map(generate_irn_metadata, process_args)
