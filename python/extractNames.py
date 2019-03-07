import re, spacy, textacy, sys, os
from spacy.symbols import *

nlp = spacy.load('en_core_web_sm')

sents = nlp(unicode(sys.argv[1]));
people = [ee for ee in sents.ents if ee.label_ == 'PERSON']
listofnames = ""

for person in people:
	listofnames += person.text + ','
 
listofnames = listofnames[:-1]
sys.stdout.write(listofnames)
sys.stdout.flush()