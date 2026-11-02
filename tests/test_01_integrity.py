"""
tests/test_01_integrity.py — Bateria de Testes 01: Integridade Estrutural e Schemas JSON
Execução: python tests/test_01_integrity.py
"""

import json
import os
import sys

PASS_COUNT = 0
FAIL_COUNT = 0


def check(condition: bool, msg: str, detail: str = "") -> None:
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
        print(f"  [PASS] {msg}")
    else:
        FAIL_COUNT += 1
        print(f"  [FAIL] {msg}" + (f" -> {detail}" if detail else ""))


def load_json_safe(path: str):
    if not os.path.exists(path):
        check(False, f"Arquivo existe: {path}", "Arquivo não encontrado")
        return None
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
        check(True, f"JSON válido: {path}")
        return data
    except Exception as e:
        check(False, f"JSON válido: {path}", str(e))
        return None


def test_configs():
    print("\n=== 1. Testando Arquivos de Configuração (config/) ===")
    seasons = load_json_safe("config/seasons.json")
    if seasons:
        check(seasons.get("default_season") == "fc27", "default_season é 'fc27'")
        check("fc26" in seasons.get("seasons", {}), "Temporada 'fc26' declarada em seasons.json")
        check("fc27" in seasons.get("seasons", {}), "Temporada 'fc27' declarada em seasons.json")

    for s in ["fc26", "fc27"]:
        club = load_json_safe(f"config/{s}/club.json")
        if club:
            for field in ["seasonId", "seasonName", "nome_clube_ea", "id_clube_ea", "plataforma_ea", "divisaoAtual", "reputacaoNivel"]:
                check(field in club, f"config/{s}/club.json possui campo '{field}'")
        elenco_cfg = load_json_safe(f"config/{s}/elenco.json")
        check(isinstance(elenco_cfg, dict), f"config/{s}/elenco.json é um dicionário")
        if s == "fc26" and elenco_cfg:
            check(len(elenco_cfg) >= 8, f"config/fc26/elenco.json preserva jogadores históricos ({len(elenco_cfg)} encontrados)")

    news_idx = load_json_safe("config/news_index.json")
    if news_idx:
        tf_list = news_idx.get("TheFicientsNews", [])
        check(len(tf_list) > 0, f"config/news_index.json contém edições ({len(tf_list)} arquivos)")
        missing_news = [
            f for f in tf_list
            if not os.path.exists(os.path.join("src", "assets", "news", "TheFicientsNews", f))
        ]
        check(len(missing_news) == 0, "Todas as imagens listadas em news_index.json existem em src/assets/news/", f"Faltando: {missing_news}")


def test_fc26_historical_data():
    print("\n=== 2. Testando Preservação dos Dados Históricos (data/fc26/) ===")
    elenco = load_json_safe("data/fc26/processed/elenco_processado.json")
    if elenco:
        jogadores = elenco.get("data", [])
        check(len(jogadores) >= 8, f"FC26 elenco_processado.json possui {len(jogadores)} jogadores")
        missing_photos = []
        for j in jogadores:
            for foto in j.get("fotos", []):
                if not os.path.exists(foto):
                    missing_photos.append(foto)
        check(len(missing_photos) == 0, "Todas as fotos de jogadores do FC26 existem fisicamente", f"Faltando: {missing_photos}")

    matches = load_json_safe("data/fc26/processed/matches_processado.json")
    if matches:
        lista = matches.get("data", [])
        check(len(lista) > 0, f"FC26 matches_processado.json possui {len(lista)} partidas registradas")

    stats = load_json_safe("data/fc26/processed/stats.json")
    if stats:
        liga = stats.get("liga", {})
        check(liga.get("total_partidas", 0) > 0, f"FC26 stats.json possui total_partidas={liga.get('total_partidas')}")

    pesquisa = load_json_safe("data/fc26/survey/pesquisa.json")
    if pesquisa:
        check(pesquisa.get("status") == "success", "FC26 pesquisa.json possui status='success'")
        check(pesquisa.get("total_respostas", 0) > 0, f"FC26 pesquisa.json possui {pesquisa.get('total_respostas')} respostas")


def test_fc27_initial_data():
    print("\n=== 3. Testando Estrutura Inicial (data/fc27/) ===")
    for p in [
        "data/fc27/manual/manual_club_stats.json",
        "data/fc27/manual/manual_matches.json",
        "data/fc27/manual/manual_stats.json",
        "data/fc27/processed/elenco_processado.json",
        "data/fc27/processed/matches_processado.json",
        "data/fc27/processed/stats.json",
        "data/fc27/survey/pesquisa.json",
    ]:
        load_json_safe(p)


if __name__ == "__main__":
    test_configs()
    test_fc26_historical_data()
    test_fc27_initial_data()
    print("\n" + "=" * 55)
    print(f"RESULTADO T01: {PASS_COUNT} passaram | {FAIL_COUNT} falharam")
    print("=" * 55)
    sys.exit(1 if FAIL_COUNT > 0 else 0)
