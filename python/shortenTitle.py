import csv, re, spacy, textacy, sys, os
from spacy.symbols import *

if sys.version_info[0] >= 3:
    unicode = str

nlp = spacy.load('en_core_web_sm')

# trim unneccessary leading phrases
def trim_leading(text):
    return re.sub('^(Group )?portrait(,| of) ', '', text, flags=re.I)

# trim unneccessary trailing phrases
def trim_trailing(text):
    return re.sub(', another (version|pose)\s*$', '', text, flags=re.I)


emuTitle = sys.argv[1];
# print emuTitle

title = trim_leading(trim_trailing(sys.argv[1]))
doc = nlp(unicode(title))

## print info for each token
# for token in doc:
#    print token.text, token.pos_, token.tag_, token.dep_

new_title = []
root_np = None
root_index = None

# find prepositional phrases
PP_PATTERN = '<ADP> <DET>? <NUM>* (<ADJ> <PUNCT>? <CONJ>?)* (<NOUN>|<PROPN> <PART>?)+'
pp_matches = list(textacy.extract.pos_regex_matches(doc, PP_PATTERN))

# find verbs
VERB_PATTERN = '<ADV>*<VERB>'
verb_matches = list(textacy.extract.pos_regex_matches(doc, VERB_PATTERN))

# find nominal subject or root noun phrase
noun_chunks = enumerate(doc.noun_chunks)
np_index = None
for index, chunk in noun_chunks:
    if chunk.root.dep_ in ['nsubj', 'ROOT']:
        root_np = chunk
        root_index = chunk.root.i
        np_index = index
        new_title.append(chunk.text)
        break

# check children of root np
child_prep_phrases = []
if root_np and root_np.root.children:
    for child in root_np.root.children:
        # if child is a coordinating conjunction
        if child.pos_ == 'CCONJ':
            conjunction = child.text

            # loop through noun phrases to find object of this conjunction
            for i, c in noun_chunks:
                if i <= np_index:
                    continue
                
                # print c.text, c.root.head, c.root.head.i
                if c.root.head.i == root_index and c.root.dep_ == 'conj':
                    new_title.append(conjunction)
                    new_title.append(c.text)

        # if a child is an adposition
        if child.pos_ == 'ADP':
            for pp in pp_matches:
                if pp.root.i == child.i:
                    new_title.append(pp.text)
                    child_prep_phrases.append(pp.root.i)
    
    # get verbs
    # for verb in verb_matches:
    #     print verb.text, [c for c in verb.root.children]

    # get location from late prepositional phrases
    trailing_pp = []
    for pi, pp in enumerate(reversed(pp_matches)):
        if pi < 2 and pp.root.text in ['in', 'at'] and pp.root.i not in child_prep_phrases:
            trailing_pp.append(pp.text)
    new_title.extend(reversed(trailing_pp))

    # get location from trailing proper noun(s) preceded by a comma
    propn_pattern = '<PUNCT> <PROPN>+$'
    for propn in textacy.extract.pos_regex_matches(doc, propn_pattern):
        if propn.text[0] == ',':
            new_title.append(propn.text)

# print '\n', title
sys.stdout.write(" ".join(new_title))
sys.stdout.flush() 
