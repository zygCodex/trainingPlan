"""Convert the three canonical Markdown tables into the Vue demo data."""
from pathlib import Path
import json
import re
root = Path(__file__).resolve().parent.parent
rows = [list(map(str.strip, line.split('|')[1:-1])) for line in (root / 'training-plan.md').read_text().splitlines() if re.match(r'^\| [WEP]\d{3} \|', line)]
warmups, exercises, plan = [], [], []
for r in rows:
    if r[0].startswith('W'):
        warmups.append(dict(zip(['id','name','instructions','muscles','days','notes','source'], r)) | {'equipment':'—', 'alternatives':[]})
    elif r[0].startswith('E'):
        item = dict(zip(['id','name','equipment','muscles','instructions','alternatives','notes','source'], r))
        item['alternatives'] = [] if item['alternatives']=='—' else item['alternatives'].split('；')
        exercises.append(item)
    else:
        item = dict(zip(['id','dayLabel','order','actionId','name','stage','dose','side','superset','remark'], r))
        item['day'] = int(re.search(r'Day (\d)', item['dayLabel'])[1]); item['order'] = int(item['order'])
        plan.append(item)
ids = [x['id'] for x in warmups + exercises + plan]
assert len(ids) == len(set(ids))
actions = {x['id'] for x in warmups + exercises}
assert all(x['actionId'] in actions for x in plan)
assert all(a in actions for x in exercises for a in x['alternatives'])
(root / 'src/data/training.json').write_text(json.dumps(dict(warmups=warmups, exercises=exercises, plan=plan), ensure_ascii=False, indent=2) + '\n')
print(f'Synced {len(warmups)} warmups, {len(exercises)} exercises, {len(plan)} plan items.')
