#!/usr/bin/env python3
"""Local preview that mimics Vercel's cleanUrls: /planning -> planning.html,
/journal/slug -> journal/slug.html. Usage: python3 scripts/serve.py [port]"""
import http.server, os, sys, functools
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = super().translate_path(path.split("?")[0].split("#")[0])
        if not os.path.exists(p):
            if os.path.exists(p + ".html"): return p + ".html"
            if os.path.isdir(p.rstrip("/")) and os.path.exists(os.path.join(p, "index.html")): return os.path.join(p, "index.html")
            return os.path.join(ROOT, "404.html")
        return p
    def log_message(self, *a): pass
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8930
handler = functools.partial(H, directory=ROOT)
print(f"Hazel preview → http://localhost:{port}")
http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
