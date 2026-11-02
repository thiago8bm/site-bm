"""
tests/test_04_endpoints_diagnostic.py — Bateria de Testes 04: Diagnóstico de Endpoints e Integrações Externas
Execução: python tests/test_04_endpoints_diagnostic.py
"""

import os
import sys

# Garante saída UTF-8 no console Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# Adiciona raiz do projeto ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.test_endpoints import EndpointDiagnosticSuite


def main():
    print("=" * 80)
    print(" BATERIA DE TESTES 04: DIAGNÓSTICO DE ENDPOINTS EXTERNOS (FC 27 & INTEGRAÇÕES)")
    print("=" * 80)

    suite = EndpointDiagnosticSuite(season="fc27", verbose=False)
    success = suite.run_all()

    if success:
        print("\n[OK] Todos os testes de endpoints e serviços externos passaram com sucesso!")
        sys.exit(0)
    else:
        print("\n[ERRO] Uma ou mais asserções de endpoints falharam. Verifique os logs.")
        sys.exit(1)


if __name__ == "__main__":
    main()
