"""
tests/test_02_pipeline_e2e.py — Bateria de Testes 02: Pipeline ETL Python & Simulação FC27
Execução: python tests/test_02_pipeline_e2e.py
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile

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


def test_fc26_fetch_protection():
    print("\n=== 1. Testando Trava de Segurança do fetch_ea_data.py para FC26 ===")
    res = subprocess.run(
        [sys.executable, "scripts/fetch_ea_data.py", "--season", "fc26"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    check(res.returncode != 0, "fetch_ea_data.py --season fc26 bloqueia execução sem --force")
    check("encerrada" in res.stdout or "manualmente" in res.stdout, "Exibe mensagem explicativa de proteção do FC26")


def test_fc26_idempotent_processing():
    print("\n=== 2. Testando Idempotência do process_stats.py no FC26 ===")
    with open("data/fc26/processed/stats.json", "r", encoding="utf-8") as f:
        before_stats = json.load(f)

    res = subprocess.run(
        [sys.executable, "scripts/process_stats.py", "--season", "fc26"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    check(res.returncode == 0, "process_stats.py --season fc26 executa com código 0", res.stderr)

    with open("data/fc26/processed/stats.json", "r", encoding="utf-8") as f:
        after_stats = json.load(f)

    check(
        before_stats["liga"]["total_partidas"] == after_stats["liga"]["total_partidas"],
        f"Preserva total_partidas do FC26 ({after_stats['liga']['total_partidas']} jogos)",
    )
    check(
        before_stats["membros_ativos"] == after_stats["membros_ativos"],
        f"Preserva membros_ativos do FC26 ({after_stats['membros_ativos']} jogadores)",
    )


def test_fc27_simulated_debut():
    print("\n=== 3. Simulando Estreia do Clube no EA FC 27 (Mock API EA -> Processamento) ===")
    backup_dir = tempfile.mkdtemp(prefix="bm_fc27_backup_")
    try:
        # Faz backup de config/fc27 e data/fc27
        shutil.copytree("config/fc27", os.path.join(backup_dir, "config_fc27"))
        shutil.copytree("data/fc27", os.path.join(backup_dir, "data_fc27"))

        # 1. Configura ID simulado do clube no FC27 e 1 jogador cadastrado + 1 jogador via Auto-Discovery
        with open("config/fc27/club.json", "r", encoding="utf-8") as f:
            club_cfg = json.load(f)
        club_cfg["id_clube_ea"] = "9992727"
        with open("config/fc27/club.json", "w", encoding="utf-8") as f:
            json.dump(club_cfg, f, indent=4, ensure_ascii=False)

        elenco_cfg_mock = {
            "Thiago (#8)": {
                "ea_id": "Thiago_Souza108",
                "posicao": "MEI",
                "instagram": "@thiago8ofc_",
                "posicao_ea": "midfielder",
                "capitania": "1º Capitão",
                "foto_pasta": "Thiago",
                "id_interno": "thiago"
            }
        }
        with open("config/fc27/elenco.json", "w", encoding="utf-8") as f:
            json.dump(elenco_cfg_mock, f, indent=4, ensure_ascii=False)

        # 2. Injeta dados brutos simulando retorno da API da EA para o FC27
        os.makedirs("data/fc27/raw", exist_ok=True)
        raw_members_mock = {
            "last_updated": "2026-11-01T23:00:00",
            "status": "success",
            "data": {
                "members": [
                    {
                        "name": "Thiago_Souza108",
                        "proName": "Thiago 8",
                        "gamesPlayed": "5",
                        "goals": "4",
                        "assists": "6",
                        "winRate": "80",
                        "ratingAve": "8.7",
                        "manOfTheMatch": "3",
                        "passesMade": "110",
                        "passSuccessRate": "85",
                        "shotSuccessRate": "50",
                        "tacklesMade": "8",
                        "tackleSuccessRate": "75",
                        "proOverall": "88",
                        "favoritePosition": "midfielder"
                    },
                    {
                        "name": "NovoCraque_FC27",
                        "proName": "Reforço BM",
                        "gamesPlayed": "5",
                        "goals": "7",
                        "assists": "2",
                        "winRate": "80",
                        "ratingAve": "8.9",
                        "manOfTheMatch": "2",
                        "passesMade": "65",
                        "passSuccessRate": "80",
                        "shotSuccessRate": "60",
                        "tacklesMade": "3",
                        "tackleSuccessRate": "60",
                        "proOverall": "86",
                        "favoritePosition": "forward"
                    }
                ]
            }
        }
        with open("data/fc27/raw/players_club_stats.json", "w", encoding="utf-8") as f:
            json.dump(raw_members_mock, f, indent=4, ensure_ascii=False)

        raw_matches_mock = {
            "last_updated": "2026-11-01T23:00:00",
            "status": "success",
            "total_matches": 1,
            "data": [
                {
                    "matchId": "fc27_match_001",
                    "timestamp": 1793580000,
                    "clubs": {
                        "9992727": {"goals": "3", "result": "1"},
                        "8881111": {"goals": "1", "result": "2", "details": {"name": "Rival FC 27"}}
                    },
                    "players": {
                        "9992727": {
                            "p1": {
                                "playername": "Thiago_Souza108",
                                "pos": "midfielder",
                                "goals": "1",
                                "assists": "2",
                                "mom": "1",
                                "rating": "9.2",
                                "shots": "3",
                                "passattempts": "25",
                                "passesmade": "22",
                                "tackleattempts": "4",
                                "tacklesmade": "3"
                            },
                            "p2": {
                                "playername": "NovoCraque_FC27",
                                "pos": "forward",
                                "goals": "2",
                                "assists": "0",
                                "mom": "0",
                                "rating": "8.8",
                                "shots": "4",
                                "passattempts": "15",
                                "passesmade": "12",
                                "tackleattempts": "1",
                                "tacklesmade": "1"
                            }
                        }
                    }
                }
            ]
        }
        with open("data/fc27/raw/matches_leagueMatch.json", "w", encoding="utf-8") as f:
            json.dump(raw_matches_mock, f, indent=4, ensure_ascii=False)

        overall_mock = {"last_updated": "2026-11-01T23:00:00", "status": "success", "data": [{
            "clubId": "9992727", "gamesPlayed": "14", "gamesPlayedPlayoff": "2", "goals": "56",
            "goalsAgainst": "28", "wins": "11", "ties": "1", "losses": "2",
            "bestDivision": None, "skillRating": "1669", "reputationtier": "2"}]}
        with open("data/fc27/raw/club_overall_stats.json", "w", encoding="utf-8") as f:
            json.dump(overall_mock, f, indent=4)
        career_mock = {"last_updated": "2026-11-01T23:00:00", "status": "success", "data": {"members": [
            {"name": "Thiago_Souza108", "gamesPlayed": "14", "goals": "9", "assists": "12",
             "manOfTheMatch": "5", "ratingAve": "8.6"}]}}
        with open("data/fc27/raw/players_career_stats.json", "w", encoding="utf-8") as f:
            json.dump(career_mock, f, indent=4)

        # 3. Executa process_stats.py --season fc27
        res = subprocess.run(
            [sys.executable, "scripts/process_stats.py", "--season", "fc27"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        check(res.returncode == 0, "process_stats.py --season fc27 processou dados simulados com sucesso", res.stderr)

        # 4. Verifica saídas geradas em data/fc27/processed/
        with open("data/fc27/processed/elenco_processado.json", "r", encoding="utf-8") as f:
            elenco_out = json.load(f)
        with open("data/fc27/processed/matches_processado.json", "r", encoding="utf-8") as f:
            matches_out = json.load(f)
        with open("data/fc27/processed/stats.json", "r", encoding="utf-8") as f:
            stats_out = json.load(f)

        check(elenco_out["total"] >= 1, f"Elenco FC27 gerou {elenco_out['total']} jogador(es)")
        check(matches_out["total"] == 1, "Partida de estreia FC27 processada em matches_processado.json")
        check(matches_out["data"][0]["adversario"] == "Rival FC 27", "Adversário da partida FC27 identificado corretamente")
        check(matches_out["data"][0]["resultado"] == "vitoria", "Resultado da partida FC27 calculado como 'vitoria'")
        liga = stats_out["liga"]
        check(liga["total_partidas"] == 14 and liga["vitorias"] == 11 and liga["gols_marcados"] == 56,
              "Stats da Liga FC27 usam club_overall_stats.json (14J, 11V, 56 GP)")
        check(liga["saldo_gols"] == 28 and liga["pontos"] == 34, "Saldo de gols (+28) e pontos (34) calculados")
        check(liga["aproveitamento"] == round(34 / 42 * 100, 1), "Aproveitamento calculado a partir dos pontos")
        check(liga["ch"] == 1669 and liga["reputacao"] == 2 and liga["playoff_pontos"] == 2,
              "skillRating, reputationtier e jogos de playoff mapeados")
        thiago = next((j for j in elenco_out["data"] if j["ea_username"] == "Thiago_Souza108"), {})
        check(thiago.get("carreira", {}).get("mvp") == 5, "Carreira (members/career/stats) anexada ao jogador")
        check(any(j["ea_username"] == "NovoCraque_FC27" for j in elenco_out["data"]), "Auto-Discovery inclui jogador nao cadastrado")

    finally:
        # Teardown: restaura config/fc27 e data/fc27 exatamente como estavam
        shutil.rmtree("config/fc27", ignore_errors=True)
        shutil.rmtree("data/fc27", ignore_errors=True)
        shutil.copytree(os.path.join(backup_dir, "config_fc27"), "config/fc27", dirs_exist_ok=True)
        shutil.copytree(os.path.join(backup_dir, "data_fc27"), "data/fc27", dirs_exist_ok=True)
        shutil.rmtree(backup_dir, ignore_errors=True)
        print("  [TEARDOWN] Estado original de config/fc27 e data/fc27 restaurado com sucesso.")


if __name__ == "__main__":
    test_fc26_fetch_protection()
    test_fc26_idempotent_processing()
    test_fc27_simulated_debut()
    print("\n" + "=" * 55)
    print(f"RESULTADO T02: {PASS_COUNT} passaram | {FAIL_COUNT} falharam")
    print("=" * 55)
    sys.exit(1 if FAIL_COUNT > 0 else 0)
