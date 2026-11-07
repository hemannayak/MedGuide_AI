"""Serve an Expo single-page export on loopback for review, without restarting Metro."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class ReviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        route = urlsplit(self.path).path
        target = Path(self.translate_path(route))
        if not target.exists() and not Path(route).suffix:
            self.path = '/index.html'
        super().do_GET()

    def log_message(self, *_args):
        # No request paths, account identifiers or query strings in review logs.
        pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8085)
    parser.add_argument('--directory', type=Path, required=True)
    args = parser.parse_args()
    root = args.directory.resolve()
    if not (root / 'index.html').is_file():
        parser.error('The directory must contain an Expo web export index.html')
    ThreadingHTTPServer(('127.0.0.1', args.port), partial(ReviewHandler, directory=str(root))).serve_forever()
