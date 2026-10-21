import pytest
from app.core.triage import evaluate_symptom_triage
from app.services.ai_service import detect_red_flags


@pytest.mark.parametrize('text', [
    'I have no chest pain.', "I don't have chest pain.",
    'सीने में दर्द नहीं है', 'ఛాతీ నొప్పి లేదు',
    'seene me dard nahi hai', 'chathi noppi ledu',
])
def test_explicit_denials_do_not_assert_emergency(text):
    assert evaluate_symptom_triage(text)[0] == 'ROUTINE'
    assert detect_red_flags(text) == []


@pytest.mark.parametrize('text', [
    'No chest pain, but now I have chest pain.',
    'I am unsure whether I have no chest pain.',
    'ఊపిరి అందడం లేదు', 'सांस नहीं आ रही', 'oopiri andatam ledu',
])
def test_positive_uncertain_and_negative_worded_danger_remain(text):
    # Some existing core and chat vocabularies differ; at least the applicable
    # pre-existing detector must retain the signal.
    assert evaluate_symptom_triage(text)[0] == 'EMERGENCY' or detect_red_flags(text)


def test_structured_positive_is_not_negated_by_another_field():
    assert evaluate_symptom_triage('No chest pain', ['chest pain'])[0] == 'EMERGENCY'


def test_unmatched_input_never_claims_safe_or_recommends_treatment():
    level, _, guidance, _ = evaluate_symptom_triage('An unfamiliar symptom')
    assert level == 'ROUTINE'  # existing API enum retained
    assert 'does not establish' in guidance
    assert 'hydration' not in guidance
