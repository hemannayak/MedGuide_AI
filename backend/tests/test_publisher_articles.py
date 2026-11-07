import hashlib
import pytest

from app.services.publisher_articles import extract_cdc_article, section_chunks


def article(body):
    return '<h1>Patient education</h1><nav><p>Ignore navigation</p></nav><div class="cdc-dfe-body__center">' + body + '</div><aside>Ignore sidebar</aside>'


def test_extracts_verbatim_unicode_without_chrome():
    text = 'Wash hands with soap. हिन्दी తెలుగు. ' * 12
    parsed = extract_cdc_article(article(f'<h2>Prevention</h2><p>{text}</p><p>Keep this second paragraph.</p>'))
    assert parsed['title'] == 'Patient education'
    content = '\n'.join(p['text'] for p in parsed['sections'])
    assert 'Ignore' not in content
    assert 'हिन्दी తెలుగు' in content
    assert parsed['content_sha256'] == hashlib.sha256(content.encode()).hexdigest()
    assert all(p['heading'] == 'Prevention' for p in parsed['sections'])


@pytest.mark.parametrize('html', ['<h1>Title</h1><p>Outside article</p>', article('<p>Short</p><p>Text</p>'), article('<p>' + 'Copyright ' * 40 + '</p><p>Restricted</p>')])
def test_missing_or_restricted_source_fails_closed(html):
    with pytest.raises(ValueError):
        extract_cdc_article(html)


def test_chunks_preserve_words_and_exclude_foreign_service_numbers():
    parsed = {'sections': [
        {'heading': 'Help', 'text': 'Call 911 for help.'},
        {'heading': 'Prevention', 'text': 'Wash hands with soap and clean water. ' * 20},
    ]}
    chunks = section_chunks(parsed, max_chars=150)
    assert chunks and all(len(c['content']) <= 150 for c in chunks)
    assert all('911' not in c['content'] for c in chunks)
    assert all(c['section_title'] == 'Prevention' for c in chunks)
    assert len({c['content_sha256'] for c in chunks}) == len(chunks)
    assert [c['chunk_index'] for c in chunks] == list(range(len(chunks)))


def test_overlong_source_token_rejected():
    with pytest.raises(ValueError):
        section_chunks({'sections': [{'heading': 'Help', 'text': 'x' * 501}]})
