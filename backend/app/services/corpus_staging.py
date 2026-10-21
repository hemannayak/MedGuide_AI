"""Offline staging of reviewed publisher HTML. No network or live DB mutation."""
import hashlib
from html.parser import HTMLParser
import re


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.capture_depth = None
        self.blocked_depth = None
        self.parts = []
        self.blocks = []
        self.heading = 'Overview'
        self.block_tag = None

    def handle_starttag(self, tag, attrs):
        self.depth += 1
        attributes = dict(attrs)
        if self.capture_depth is None and 'sf-detail-body-wrapper' in attributes.get('class', '').split():
            self.capture_depth = self.depth
        if self.capture_depth is None:
            return
        if self.blocked_depth is None and tag in ('nav', 'footer', 'script', 'style', 'aside'):
            self.blocked_depth = self.depth
        if self.blocked_depth is None and tag in ('h2', 'h3', 'p', 'li') and self.block_tag is None:
            self.block_tag = tag
            self.parts = []
        if tag in ('br', 'img', 'hr', 'meta', 'link', 'input', 'source', 'wbr'):
            self.depth -= 1

    def handle_data(self, data):
        if self.capture_depth is not None and self.blocked_depth is None and self.block_tag:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if self.capture_depth is not None and self.blocked_depth is None and tag == self.block_tag:
            text = re.sub(r'\s+', ' ', ''.join(self.parts)).strip()
            if tag in ('h2', 'h3') and text:
                self.heading = text
            elif text:
                self.blocks.append({'section': self.heading, 'text': text})
            self.block_tag = None
            self.parts = []
        if self.blocked_depth == self.depth:
            self.blocked_depth = None
        if self.capture_depth == self.depth:
            self.capture_depth = None
        self.depth = max(0, self.depth - 1)


def stage_article(html: str, metadata: dict, max_chars: int = 1400) -> dict:
    required = ('title', 'publisher', 'source_url', 'retrieved_at', 'reuse_basis')
    if any(not metadata.get(key) for key in required):
        raise ValueError('Complete provenance and documented reuse basis are required')
    if max_chars < 100:
        raise ValueError('Chunk size must be at least 100 characters')
    parser = ArticleParser()
    parser.feed(html)
    if not parser.blocks:
        raise ValueError('Publisher article container is missing or empty; do not index navigation')
    seen, chunks = set(), []
    for block in parser.blocks:
        words, current = block['text'].split(), ''
        fragments = []
        for word in words:
            if current and len(current) + len(word) + 1 > max_chars:
                fragments.append(current)
                current = ''
            current = (current + ' ' + word).strip()
        if current:
            fragments.append(current)
        for text in fragments:
            digest = hashlib.sha256(text.encode()).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            chunks.append({'chunk_index': len(chunks), 'content': text,
                           'section_title': block['section'], 'content_sha256': digest})
    return {'metadata': dict(metadata), 'html_sha256': hashlib.sha256(html.encode()).hexdigest(),
            'review_status': 'STAGED_NOT_APPROVED', 'indexed': False, 'chunks': chunks}
