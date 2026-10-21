import pytest
from app.services.chat_policy import explanation_topic_chunks


def test_explanation_prefers_requested_topic_over_incidental_words():
    low = {'content': 'Shock is defined as low systolic blood pressure.'}
    high = {'content': 'High blood pressure means increased pressure in arteries.'}
    assert explanation_topic_chunks([low, high], 'Explain high blood pressure in simple words.') == [high]


def test_lexical_guard_preserves_semantic_fallback_and_non_explanations():
    chunks = [{'content': 'Hypertension information.'}]
    assert explanation_topic_chunks(chunks, 'Explain high blood pressure') == chunks
    assert explanation_topic_chunks(chunks, 'Blood pressure treatment options') == chunks
from app.services.chat_policy import retrieval_question, unsafe_medication_advice
from app.services.ai_service import build_grounded_prompt


@pytest.mark.parametrize('question', ["I didn't understand, explain more simply", "मुझे समझ नहीं आया आसान भाषा में बताओ", "నాకు అర్థం కాలేదు సులభంగా చెప్పండి"])
def test_followup_retrieves_patient_topic(question):
    history = [dict(role='user', content='Explain high blood pressure'),
               dict(role='assistant', content='Untrusted generated medical fact')]
    assert retrieval_question(question, history) == 'Explain high blood pressure'
    assert retrieval_question(question, []) == question


@pytest.mark.parametrize('text', ['You can take paracetamol.', 'पैरासिटामोल ले सकते हैं।', 'పారాసిటమాల్ తీసుకోవచ్చు.'])
def test_blocks_independent_medication_recommendations(text):
    assert unsafe_medication_advice(text)


@pytest.mark.parametrize('text', ['Do not take two tablets.', 'दो गोली मत लें।', 'మందు తీసుకోకూడదు.', 'Ask your pharmacist about the missed medicine.'])
def test_allows_caution_and_referral(text):
    assert not unsafe_medication_advice(text)


def test_prompt_does_not_supply_unsourced_clinical_advice():
    system, _ = build_grounded_prompt('fever', [], 'en', '')
    assert '48 hours' not in system
    assert 'tender coconut' not in system
    assert '120 words' in system


@pytest.mark.parametrize('language', ['en', 'hi', 'te'])
def test_conversational_prompt_preserves_grounding_and_uncertainty(language):
    system, _ = build_grounded_prompt('SYN question', [], language, '')
    assert 'one short relevant question' in system
    assert 'Do not impersonate a human or clinician' in system
    assert 'Never promise that they are safe' in system
    assert 'numbers, units and negation intact' in system
    assert 'Ground medical claims strictly' in system


def test_new_topic_is_not_mistaken_for_followup():
    question = 'ब्लड प्रेशर का मतलब आसान शब्दों में बताओ'
    assert retrieval_question(question, [dict(role='user', content='fever')]) == question


def test_native_bridge_runs_even_with_strong_heading_similarity():
    from unittest.mock import MagicMock, patch
    from app.services.ai_service import retrieve_multilingual_chunks
    gateway = MagicMock()
    gateway.translate.return_value = 'Explain high blood pressure'
    chunk = dict(chunk_id='one', similarity=0.8, content='test')
    with patch('app.services.ai_service.retrieve_relevant_chunks', return_value=[chunk]) as retrieve:
        result = retrieve_multilingual_chunks(MagicMock(), 'बीपी समझाओ', 'hi', gateway, always_translate=True)
    assert result
    assert retrieve.call_count == 2
    gateway.translate.assert_called_once()


def test_explanation_ranking_prefers_definition_without_changing_similarity():
    from app.services.chat_policy import evidence_rank
    definition = dict(content='Blood pressure is the force described in the source.', similarity=0.54)
    treatment = dict(content='Treatment recommendations', similarity=0.64)
    assert evidence_rank(definition, True) > evidence_rank(treatment, True)
    assert evidence_rank(definition, False) < evidence_rank(treatment, False)
    assert definition['similarity'] == 0.54


@pytest.mark.parametrize('language,question', [
    ('en', 'I forgot my morning medicine. Can I take two tablets tonight?'),
    ('hi', 'दवा लेना भूल गया। क्या दो गोलियां ले लूं?'),
    ('te', 'మందు వేసుకోవడం మర్చిపోయాను. రెండు మాత్రలు వేసుకోవచ్చా?'),
])
def test_missed_dose_has_localized_nonclinical_boundary(language, question):
    from app.services.chat_policy import missed_dose_boundary
    assert missed_dose_boundary(question, language)
    assert missed_dose_boundary('What does blood pressure mean?', language) is None
