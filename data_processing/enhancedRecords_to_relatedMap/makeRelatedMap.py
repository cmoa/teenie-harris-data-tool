import json
import os
import re

def countTermOccurences(repo_root):
    result = {}
    count = 0

    photo_records_dir = os.path.join(repo_root,  'data_processing/json_to_enhancedRecords/output/jsonRecords/')
    for record_path in os.listdir(photo_records_dir):
        match = re.search('([0-9]+).json', record_path)
        if match:
            with open(os.path.join(photo_records_dir, record_path), 'r') as json_file:
                record = json.load(json_file)

                # Count people
                for person in record.get('people', []):
                    if person not in result:
                        result[person] = []
                    result[person].append(record['irn'])

                # Count neighborhoods
                for place in record.get('places', []):
                    if place.get('type', '') in ['establishment', 'place', 'neighborhood', 'route']:
                        long_name = place.get('long_name', '')
                        if long_name not in result:
                            result[long_name] = []
                        result[long_name].append(record['irn'])

                # Count dates
                date_created = record.get('CreDateCreated', '')
                if date_created not in result:
                    result[date_created] = []
                result[date_created].append(record['irn'])
                
                count += 1
                print(count)

    # Write results to output file.
    outfile_path = os.path.join(repo_root, f'data_processing/enhancedRecords_to_relatedMap/output/relatedMap.json')
    with open(outfile_path, 'w') as outfile:
        print(f'Writing results to {outfile_path}')
        json.dump(result, outfile, indent=2)

if __name__ == '__main__':
    repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
    countTermOccurences(repo_root)



