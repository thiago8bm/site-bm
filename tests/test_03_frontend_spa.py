"""
tests/test_03_frontend_spa.py — Launcher da Bateria 03 (Frontend SPA)
Sobe um servidor HTTP local na raiz do projeto e abre tests/runner_frontend.html no navegador.
Execução: python tests/test_03_frontend_spa.py [porta]
"""

import functools
import http.server
import os
import sys
import threading
import webbrowser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5500
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    url = f"http://localhost:{port}/tests/runner_frontend.html"
    print(f"Servindo {ROOT} em http://localhost:{port}")
    print(f"Abrindo runner: {url} (Ctrl+C para encerrar)")
    threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")


if __name__ == "__main__":
    main()
