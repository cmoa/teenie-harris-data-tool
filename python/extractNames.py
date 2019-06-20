import re, spacy, textacy, sys, os
from spacy.symbols import *
from nameparser import HumanName
import json

if sys.version_info[0] >= 3:
    unicode = str

data = {}

nlp = spacy.load('en_core_web_sm')

sents = nlp(unicode(sys.argv[1]));
people = [ee for ee in sents.ents if ee.label_ == 'PERSON']
listofnames = ""

i = 0;
for person in people:
	splitName = HumanName(person.text)
	name = {}
	name["data"] = person.text
	name["title"] = splitName.title
	name["first"] = splitName.first
	name["middle"] = splitName.middle
	name["last"] = splitName.last
	name["suffix"] = splitName.suffix
	name["nickname"] = splitName.nickname
	name["status"] = "accepted"
	data[i] = name
	i = i+1

json_data = json.dumps(data)
sys.stdout.write(json_data)
sys.stdout.flush()