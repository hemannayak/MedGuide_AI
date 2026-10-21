import importlib.util
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[2] / 'evaluation/stage_medquad.py'
spec = importlib.util.spec_from_file_location('medquad_stage', SCRIPT)
stage = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stage)


def test_restricted_collections_are_not_read():
    assert all(not collection.startswith(('10_', '11_', '12_')) for collection in stage.COLLECTIONS)


def test_removed_answers_and_treatment_questions_are_excluded(tmp_path):
    stage.DATASET = tmp_path
    path = tmp_path / 'synthetic.xml'
    path.write_text('''<Document source="SYN" url="https://example.invalid"><Focus>Diabetes</Focus><QAPairs>
    <QAPair><Question qtype="information">SYN empty?</Question><Answer/></QAPair>
    <QAPair><Question qtype="treatment">SYN treatment?</Question><Answer>Synthetic excluded.</Answer></QAPair>
    <QAPair><Question qtype="symptoms">SYN symptoms?</Question><Answer>Synthetic answer.</Answer></QAPair>
    </QAPairs></Document>''')
    record = stage.read_document(path)
    assert len(record['qa_pairs']) == 1
    assert record['qa_pairs'][0]['question_type'] == 'symptoms'
    assert record['clinical_review'] == 'PENDING'
    assert record['indexed'] is False


def test_identical_focus_keeps_related_documents_in_same_split(tmp_path):
    stage.DATASET = tmp_path
    template = '<Document source="SYN" url="https://example.invalid/{id}"><Focus>Asthma</Focus><QAPairs><QAPair><Question qtype="information">SYN?</Question><Answer>Synthetic {id}.</Answer></QAPair></QAPairs></Document>'
    records = []
    for number in (1, 2):
        path = tmp_path / f'{number}.xml'
        path.write_text(template.format(id=number))
        records.append(stage.read_document(path))
    assert records[0]['research_split'] == records[1]['research_split']
    assert records[0]['focus_group'] == records[1]['focus_group']
