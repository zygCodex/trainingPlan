"""Validate authored alternatives independently of the UI merge code."""
from collections import Counter
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
original = json.loads((root / 'src/data/training.json').read_text())
supplements = json.loads((root / 'src/data/supplemental-alternatives.json').read_text())
entries = original['warmups'] + original['exercises'] + supplements['actions']
counts = Counter(action['id'] for action in entries)
assert all(count == 1 for count in counts.values()), 'Duplicate action IDs'
actions = {action['id']: action for action in entries}
recommendations = supplements['recommendations']
assert set(recommendations) <= actions.keys()
assert set(supplements['instructions']) <= actions.keys()
for action in entries:
    id = action['id']
    source = action['alternatives']
    suggested = recommendations.get(id, [])
    targets = source + [entry['id'] for entry in suggested]
    assert 1 <= len(targets) <= 2, (id, targets)
    assert len(targets) == len(set(targets)), id
    for target in targets:
        assert target in actions and target != id, (id, target)
        assert target[0] == id[0], f'Training-stage mismatch: {id} -> {target}'
        if id.startswith('E'):
            assert actions[target]['module'] == action['module'], (id, target)
    for entry in suggested:
        assert entry['reason'].strip(), (id, entry)
    if action.get('supplemental'):
        assert not source, f'Authored action must not claim source-listed alternatives: {id}'
        for field in ['name', 'module', 'equipment', 'muscles', 'instructions', 'source']:
            assert action[field].strip(), (id, field)
        assert '非原教程' in action['source'], id
        assert 'prescription' not in action and 'dose' not in action, id
# The original tutorial's prescription links must stay separate from suggestions.
assert actions['E012']['alternatives'] == ['E013', 'E014']
assert actions['E007']['alternatives'] == ['E023']
assert not actions['E002']['alternatives']
assert len(original['plan']) == 30
assert all(item['actionId'] in actions and not actions[item['actionId']].get('supplemental')
           for item in original['plan'])
print(f'Alternatives passed: all {len(entries)} actions have 1–2 valid options; '
      f'{len(supplements["actions"])} authored variants; tutorial prescriptions remain separate.')
