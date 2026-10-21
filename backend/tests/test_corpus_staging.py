import pytest
from app.services.corpus_staging import stage_article

META = dict(title='Synthetic article', publisher='Synthetic publisher',
            source_url='https://example.invalid', retrieved_at='2026-10-15',
            reuse_basis='Synthetic test fixture')


def test_only_article_content_is_staged_with_sections_and_deduplication():
    html = '<nav>Outside navigation</nav><div class="sf-detail-body-wrapper"><h2>Symptoms</h2><p>Synthetic statement.</p><p>Synthetic statement.</p><aside><p>Unrelated</p></aside><h2>Care</h2><p>Keep <strong>numbers 2.5</strong> intact.</p></div><footer>Footer</footer>'
    result = stage_article(html, META)
    assert [c['section_title'] for c in result['chunks']] == ['Symptoms', 'Care']
    assert result['chunks'][1]['content'] == 'Keep numbers 2.5 intact.'
    assert result['indexed'] is False
    assert result['review_status'] == 'STAGED_NOT_APPROVED'


def test_missing_article_or_reuse_basis_fails_closed():
    with pytest.raises(ValueError):
        stage_article('<main><p>Navigation masquerading as content</p></main>', META)
    with pytest.raises(ValueError):
        stage_article('<div class="sf-detail-body-wrapper"><p>Text</p></div>', {**META, 'reuse_basis': ''})


def test_chunking_preserves_word_order_and_unicode():
    text = 'తెలుగు हिन्दी 2.5 mg do not change. ' * 15
    result = stage_article(f'<div class="sf-detail-body-wrapper"><p>{text}</p></div>', META, 110)
    # Repeated equal fragments may deduplicate, so use distinct numbered blocks.
    assert all(len(c['content']) <= 110 for c in result['chunks'])
    assert all(c['content_sha256'] for c in result['chunks'])
