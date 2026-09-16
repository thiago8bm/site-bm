"""
process_stats.py — Baile de Munique
Lê os JSONs brutos gerados pelo fetch_ea_data.py (em data/raw/) e gera
JSONs finais e enxutos para o frontend consumir (em data/processed/).

Saída:
  data/processed/elenco_processado.json  — membros do elenco com stats corrigidas
  data/processed/matches_processado.json — histórico de partidas limpo e detalhado
  data/processed/stats.json              — metadados globais do clube (para o footer)
"""

import json
import os
from datetime import datetime

# =============================================
# CONFIGURAÇÃO
# =============================================
ID_CLUBE     = "1071934"
RAW_DIR      = os.path.join("data", "raw")
OUT_DIR      = os.path.join("data", "processed")
MATCH_TYPES  = ["leagueMatch", "playoffMatch", "friendlyMatch"]

# =============================================
# DICIONÁRIO DE MAPEAMENTO DO ELENCO
# Chave: nome de usuário EA (campo "name" / "playername")
# =============================================
ELENCO_MAP = {
    "Thiago_Souza108": {
        "id":           "thiago",
        "nome_display": "Thiago",
        "numero":       8,
        "posicao":      "MEI",
        "posicao_ea":   "midfielder",
        "capitania":    "1º Capitão",
        "foto_pasta":   "Thiago",
    },
    "DanyTheTrotos": {
        "id":           "abreu",
        "nome_display": "Abreu",
        "numero":       15,
        "posicao":      "VOL",
        "posicao_ea":   "midfielder",
        "capitania":    "2º Capitão",
        "foto_pasta":   "Abreu",
    },
    "Gaps8459": {
        "id":           "gaps",
        "nome_display": "Gaps",
        "numero":       10,
        "posicao":      "CA",
        "posicao_ea":   "forward",
        "capitania":    "3º Capitão",
        "foto_pasta":   "Gaps",
    },
    "ZeCriminoso": {
        "id":           "pedrao",
        "nome_display": "Pedrão",
        "numero":       5,
        "posicao":      "GK",
        "posicao_ea":   "goalkeeper",
        "capitania":    None,
        "foto_pasta":   "Pedrao",
    },
    "brsferrari": {
        "id":           "dilaurentis",
        "nome_display": "DiLaurentis",
        "numero":       19,
        "posicao":      "ZGE",
        "posicao_ea":   "defender",
        "capitania":    None,
        "foto_pasta":   "DiLaurentis",
    },
    "SRGT_XEREQUINHA": {
        "id":           "pinto",
        "nome_display": "Pinto",
        "numero":       23,
        "posicao":      "PE",
        "posicao_ea":   "midfielder",
        "capitania":    None,
        "foto_pasta":   "Pinto",
    },
    "gavrielcrvg": {
        "id":           "gabri",
        "nome_display": "Gabri",
        "numero":       27,
        "posicao":      "PD",
        "posicao_ea":   "midfielder",
        "capitania":    None,
        "foto_pasta":   "Gabri",
    },
    # Cleiton = NortonJONES / C. da Costa (confirmado)
    "NortonJONES": {
        "id":           "cleiton",
        "nome_display": "Cleiton",
        "numero":       30,
        "posicao":      "VOL",
        "posicao_ea":   "midfielder",
        "capitania":    None,
        "foto_pasta":   "Cleiton",
    },
    # Formiga = Wendelkkho / Tijolinho (confirmado)
    "Wendelkkho": {
        "id":           "formiga",
        "nome_display": "Formiga",
        "numero":       69,
        "posicao":      "PD",
        "posicao_ea":   "midfielder",
        "capitania":    None,
        "foto_pasta":   "Formiga",
    },
}

# =============================================
# UTILITÁRIOS
# =============================================
def carregar_json(filepath: str) -> dict | None:
    if not os.path.exists(filepath):
        print(f"  [AVISO] Arquivo não encontrado: {filepath}")
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"  [ERRO] Não foi possível ler {filepath}: {e}")
        return None

def salvar_json(dados: dict, filename: str, subdir: str = OUT_DIR) -> None:
    os.makedirs(subdir, exist_ok=True)
    path = os.path.join(subdir, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)
    print(f"  [OK] Salvo: {path}")

def safe_int(val, default=0) -> int:
    try:
        return int(val)
    except (TypeError, ValueError):
        return default

def safe_float(val, default=0.0) -> float:
    try:
        return float(val)
    except (TypeError, ValueError):
        return default

# =============================================
# PROCESSAMENTO DO ELENCO
# =============================================
def processar_elenco() -> list:
    """Lê players_club_stats.json e retorna lista de jogadores mapeados."""
    raw = carregar_json(os.path.join(RAW_DIR, "players_club_stats.json"))
    if not raw:
        print("  [AVISO] Não foi possível processar elenco.")
        return []

    membros_brutos = raw.get("data", {}).get("members", [])
    elenco_final   = []

    for membro in membros_brutos:
        ea_username = membro.get("name", "")
        meta        = ELENCO_MAP.get(ea_username)

        if not meta:
            print(f"  [INFO] Jogador não mapeado ignorado: {ea_username}")
            continue

        gamesPlayed   = safe_int(membro.get("gamesPlayed"))
        goals         = safe_int(membro.get("goals"))
        assists       = safe_int(membro.get("assists"))
        winRate       = safe_int(membro.get("winRate"))
        ratingAve     = safe_float(membro.get("ratingAve"))
        manOfTheMatch = safe_int(membro.get("manOfTheMatch"))
        redCards      = safe_int(membro.get("redCards"))
        passesmade    = safe_int(membro.get("passesMade"))
        passSuccess   = safe_int(membro.get("passSuccessRate"))
        shotSuccess   = safe_int(membro.get("shotSuccessRate"))
        tackles       = safe_int(membro.get("tacklesMade"))
        tackleSuccess = safe_int(membro.get("tackleSuccessRate"))
        proOverall    = safe_int(membro.get("proOverall"))
        cleanSheetsDef= safe_int(membro.get("cleanSheetsDef"))
        cleanSheetsGK = safe_int(membro.get("cleanSheetsGK"))

        # Últimas 10 partidas de gols (índices prevGoals0..prevGoals10)
        prev_goals = [safe_int(membro.get(f"prevGoals{'' if i == 0 else i}")) for i in range(11)]

        jogador = {
            "id":           meta["id"],
            "nome_display": meta["nome_display"],
            "ea_username":  ea_username,
            "pro_name":     membro.get("proName", ""),
            "numero":       meta["numero"],
            "posicao":      meta["posicao"],
            "posicao_ea":   meta["posicao_ea"],
            "capitania":    meta["capitania"],
            "foto_pasta":   meta["foto_pasta"],
            "status":       "ativo",

            # Estatísticas Globais
            "partidas":            gamesPlayed,
            "gols":                goals,
            "assistencias":        assists,
            "win_rate":            winRate,
            "media_nota":          ratingAve,
            "mvp":                 manOfTheMatch,
            "cartoes_vermelhos":   redCards,
            "passes_feitos":       passesmade,
            "taxa_passe":          passSuccess,
            "taxa_chute":          shotSuccess,
            "desarmes":            tackles,
            "taxa_desarme":        tackleSuccess,
            "overall":             proOverall,
            "clean_sheets_def":    cleanSheetsDef,
            "clean_sheets_gk":     cleanSheetsGK,

            "tendencia_gols":      prev_goals[1:],  # últimas 10
            "participacoes_gol":   goals + assists,
            "processado_em":       datetime.now().isoformat(),
        }

        elenco_final.append(jogador)
        print(f"  [OK] Processado: {meta['nome_display']} ({ea_username})")

    elenco_final.sort(key=lambda x: x["numero"])
    return elenco_final


# =============================================
# PROCESSAMENTO DE PARTIDAS
# =============================================
def processar_partidas() -> list:
    """
    Lê todos os matches_*.json em data/raw/ e gera lista consolidada de
    partidas com placar, adversário, e estatísticas completas por jogador.
    """
    todas_partidas = {}

    for match_type in MATCH_TYPES:
        filepath = os.path.join(RAW_DIR, f"matches_{match_type}.json")
        raw = carregar_json(filepath)
        if not raw:
            continue

        partidas = raw.get("data", [])
        print(f"  [INFO] Lendo {len(partidas)} partidas de {match_type}")

        for partida in partidas:
            match_id  = partida.get("matchId")
            if not match_id or match_id in todas_partidas:
                continue

            clubs     = partida.get("clubs", {})
            players   = partida.get("players", {})
            timestamp = safe_int(partida.get("timestamp"))

            nosso       = clubs.get(ID_CLUBE, {})
            adversarios = {k: v for k, v in clubs.items() if k != ID_CLUBE}
            adversario  = next(iter(adversarios.values()), {})
            adv_details = adversario.get("details", {})

            nossos_gols = safe_int(nosso.get("goals"))
            adv_gols    = safe_int(adversario.get("goals", adversario.get("goalsAgainst", 0)))
            result_code = safe_int(nosso.get("result"))

            resultado = "vitoria" if result_code == 1 else ("derrota" if result_code == 2 else "empate")

            # ─── Stats por jogador ───
            nossos_players = players.get(ID_CLUBE, {})
            marcadores   = []
            assistentes  = []
            mvp          = None
            max_mom      = -1
            jogadores_partida = []

            for player_id, pdata in nossos_players.items():
                ea_username    = pdata.get("playername", "")
                meta           = ELENCO_MAP.get(ea_username)
                nome           = meta["nome_display"] if meta else ea_username
                pos            = pdata.get("pos", "")
                is_gk          = pos == "goalkeeper"

                gols_p     = safe_int(pdata.get("goals"))
                assists_p  = safe_int(pdata.get("assists"))
                is_mom     = safe_int(pdata.get("mom"))
                nota       = safe_float(pdata.get("rating"))

                # Estatísticas comuns a todos os jogadores
                stats_jogador = {
                    "nome":            nome,
                    "ea_username":     ea_username,
                    "posicao":         pos,
                    "goals":           gols_p,
                    "assists":         assists_p,
                    "rating":          nota,
                    "mom":             bool(is_mom),
                    "shots":           safe_int(pdata.get("shots")),
                    "passattempts":    safe_int(pdata.get("passattempts")),
                    "passesmade":      safe_int(pdata.get("passesmade")),
                    "tackleattempts":  safe_int(pdata.get("tackleattempts")),
                    "tacklesmade":     safe_int(pdata.get("tacklesmade")),
                    "redcards":        safe_int(pdata.get("redcards")),
                    "goalsconceded":   safe_int(pdata.get("goalsconceded")),
                    "score":           safe_int(pdata.get("SCORE")),
                }

                # Estatísticas exclusivas de goleiro
                if is_gk:
                    stats_jogador.update({
                        "saves":                  safe_int(pdata.get("saves")),
                        "cleansheetsgk":          safe_int(pdata.get("cleansheetsgk")),
                        "cleansheetsdef":         safe_int(pdata.get("cleansheetsdef")),
                        "goodDirectionSaves":      safe_int(pdata.get("goodDirectionSaves")),
                        "crossSaves":             safe_int(pdata.get("crossSaves")),
                        "parrySaves":             safe_int(pdata.get("parrySaves")),
                        "reflexSaves":            safe_int(pdata.get("reflexSaves")),
                    })

                jogadores_partida.append(stats_jogador)

                # Listas de marcadores/assistentes e MVP
                if gols_p > 0:
                    marcadores.append({"nome": nome, "gols": gols_p})
                if assists_p > 0:
                    assistentes.append({"nome": nome, "assists": assists_p})
                if is_mom == 1 or nota > max_mom:
                    if is_mom == 1:
                        mvp     = nome
                        max_mom = 999
                    elif max_mom < nota:
                        mvp     = nome
                        max_mom = nota

            # Ordena jogadores por nota desc
            jogadores_partida.sort(key=lambda x: x["rating"], reverse=True)

            try:
                data_partida = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
            except (OSError, ValueError):
                data_partida = None

            partida_limpa = {
                "match_id":   match_id,
                "timestamp":  timestamp,
                "data":       data_partida,
                "tipo":       match_type,
                "adversario": adv_details.get("name", "Adversário Desconhecido"),
                "placar_nos": nossos_gols,
                "placar_adv": adv_gols,
                "resultado":  resultado,
                "marcadores":  marcadores,
                "assistentes": assistentes,
                "mvp":         mvp,
                "jogadores":   jogadores_partida,
            }

            todas_partidas[match_id] = partida_limpa

    lista_final = list(todas_partidas.values())
    lista_final.sort(key=lambda x: x["timestamp"], reverse=True)
    return lista_final


# =============================================
# STATS GLOBAIS
# =============================================
def gerar_stats_globais(elenco: list, partidas: list) -> dict:
    liga = [p for p in partidas if p["tipo"] == "leagueMatch"]

    total    = len(liga)
    vitorias = sum(1 for p in liga if p["resultado"] == "vitoria")
    empates  = sum(1 for p in liga if p["resultado"] == "empate")
    derrotas = sum(1 for p in liga if p["resultado"] == "derrota")
    gols_m   = sum(p["placar_nos"] for p in liga)
    gols_s   = sum(p["placar_adv"] for p in liga)

    artilheiros = sorted(elenco, key=lambda x: x["gols"], reverse=True)[:5]
    garcons     = sorted(elenco, key=lambda x: x["assistencias"], reverse=True)[:5]
    mvps        = sorted(elenco, key=lambda x: x["mvp"], reverse=True)[:5]

    return {
        "last_updated": datetime.now().isoformat(),
        "status":       "success",
        "clube": {
            "nome":      "Baile de Munique",
            "id_ea":     ID_CLUBE,
            "tatica":    "1-4-2-3-1",
            "instagram": "https://www.instagram.com/bailedemunichofc/",
        },
        "liga": {
            "total_partidas": total,
            "vitorias":       vitorias,
            "empates":        empates,
            "derrotas":       derrotas,
            "gols_marcados":  gols_m,
            "gols_sofridos":  gols_s,
            "saldo_gols":     gols_m - gols_s,
            "win_rate":       round((vitorias / total * 100) if total > 0 else 0, 1),
        },
        "total_partidas_all": len(partidas),
        "top_artilheiros": [
            {"nome": j["nome_display"], "gols": j["gols"], "posicao": j["posicao"]}
            for j in artilheiros
        ],
        "top_assistentes": [
            {"nome": j["nome_display"], "assists": j["assistencias"], "posicao": j["posicao"]}
            for j in garcons
        ],
        "top_mvp": [
            {"nome": j["nome_display"], "mvps": j["mvp"], "posicao": j["posicao"]}
            for j in mvps
        ],
        "membros_ativos": len(elenco),
    }


# =============================================
# MAIN
# =============================================
def main():
    print("=" * 60)
    print("  process_stats.py — Baile de Munique")
    print(f"  Iniciando em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print("\n[1/3] Processando elenco...")
    elenco = processar_elenco()
    salvar_json({
        "last_updated": datetime.now().isoformat(),
        "status":       "success",
        "total":        len(elenco),
        "data":         elenco,
    }, "elenco_processado.json")

    print("\n[2/3] Processando partidas...")
    partidas = processar_partidas()
    salvar_json({
        "last_updated": datetime.now().isoformat(),
        "status":       "success",
        "total":        len(partidas),
        "data":         partidas,
    }, "matches_processado.json")

    print("\n[3/3] Gerando stats globais...")
    stats = gerar_stats_globais(elenco, partidas)
    salvar_json(stats, "stats.json")

    print("\n" + "=" * 60)
    print(f"  Concluído! {len(elenco)} jogadores | {len(partidas)} partidas")
    print("=" * 60)


if __name__ == "__main__":
    main()
