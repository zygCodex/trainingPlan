"""Independent expectations transcribed while checking the linked source article."""
from pathlib import Path
import json

root = Path(__file__).resolve().parent.parent
content = json.loads((root / 'src/data/training.json').read_text())
plan = {item['id']: item for item in content['plan']}
# id: preparation kind / count, work set interval, rep interval, explicit per-side dose
expected = {
    'P003': ('适应', 1, [3, 3], [10, 12], False),
    'P004': ('热身', 1, [5, 5], [8, 10], False),
    'P005': ('适应', 1, [3, 3], [10, 12], False),
    'P006': ('适应', 1, [3, 3], [10, 12], False),
    'P007': (None, None, [3, 4], [10, 12], False),
    'P010': (None, None, [4, 4], [12, 15], False),
    'P011': (None, None, [4, 4], [12, 12], True),
    'P012': (None, None, [4, 4], [10, 12], False),
    'P013': (None, None, [4, 4], [12, 15], False),
    'P014': (None, None, [4, 4], [12, 15], False),
    'P015': (None, None, [4, 4], [10, 12], False),
    'P018': (None, None, [4, 4], [15, 20], False),
    'P019': (None, None, [3, 3], [12, 12], True),
    'P020': (None, None, [3, 3], [10, 12], True),
    'P021': (None, None, [3, 3], [10, 10], False),
    'P022': (None, None, [3, 4], [15, 20], False),
    'P025': (None, None, [4, 4], [12, 15], False),
    'P026': (None, None, [5, 5], [8, 10], False),
    'P027': (None, None, [4, 4], [10, 15], False),
    'P028': (None, None, [4, 4], [10, 12], False),
    'P029': (None, None, [4, 4], [10, 12], False),
    'P030': (None, None, [4, 4], [10, 12], False),
}
assert set(expected) == {id for id, item in plan.items() if item['stage'] == '正式训练'}
for id, (kind, count, sets, reps, per_side) in expected.items():
    item = plan[id]
    parsed = item['prescription']
    assert parsed['work'] == {'sets': sets, 'reps': reps}, id
    assert parsed['preparation'] == ({'kind': kind, 'sets': count, 'reps': None} if kind else None), id
    assert (item['side'] == '每侧') == per_side, id
for item in plan.values():
    if item['stage'] == '热身':
        assert item['prescription'] == {'preparation': None, 'work': None}
assert len(plan) == 30
assert plan['P029']['superset'] == plan['P030']['superset'] == 'D4-A'
print('Source audit passed: 22 formal prescriptions, 8 unspecified warmup entries, per-side flags and superset pairing.')
