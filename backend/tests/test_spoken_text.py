from app.services.spoken_text import prepare_spoken_text


def test_visual_markup_becomes_speech_without_changing_medical_values():
    assert prepare_spoken_text('## Your concern\n**Do not** change 2.5 mg or 5 mL.') == 'Your concern. Do not change 2.5 mg or 5 mL.'


def test_native_script_negation_numbers_and_source_markers_are_preserved():
    for text in ['మందు ఆపవద్దు. [1]', 'दवा की मात्रा न बदलें। 108', '2*3 is not a dose.']:
        assert prepare_spoken_text(text) == text


def test_spoken_format_preserves_emergency_content_and_uncertainty():
    text = 'I cannot determine the cause.\nSeek emergency help now.\nCall 112.'
    assert prepare_spoken_text(text) == 'I cannot determine the cause. Seek emergency help now. Call 112.'
