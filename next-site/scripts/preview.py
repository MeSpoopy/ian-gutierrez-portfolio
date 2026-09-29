from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import os
root=Path(__file__).resolve().parents[2]
os.chdir(root)
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        prefix='/ian-gutierrez-portfolio'
        if self.path.startswith(prefix+'/'):
            self.path=self.path[len(prefix):]
        return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
