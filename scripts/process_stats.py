"""
process_stats.py — Baile de Munique
Lê os JSONs brutos gerados pelo fetch_ea_data.py e gera
JSONs finais e enxutos para o frontend consumir.

Saída:
  data/elenco_processado.json  — membros do elenco com stats corrigidas
  data/matches_processado.json — histórico de partidas limpo
  data/stats.json              — metadados globais do clube (para o footer)
"""

import json
import os
from datetime import datetime

# =============================================
# CONFIGURAÇÃO
# =============================================
ID_CLUBE     = "1071934"
DATA_DIR     = "data"
MATCH_TYPES  = ["leagueMatch", "playoffMatch", "friendlyMatch"]

# =============================================
# DICIONÁRIO DE MAPEAMENTO DO ELENCO
# Chave: nome de usuário EA (campo "name" / "playername")
# Valor: metadados internos do clube
# =============================================
ELENCO_MAP = {
    "Thiago_Souza108": {
        "id":             "thiago",
        "nome_display":   "Thiago",
        "numero":         8,
        "posicao":        "MEI",
        "posicao_ea":     "midfielder",
        "capitania":      "1º Capitão",
        "foto_pasta":     "Thiago",
    },
    "DanyTheTrotos": {
        "id":             "abreu",
        "nome_display":   "Abreu",
        "numero":         15,
        "posicao":        "VOL",
        "posicao_ea":     "midfielder",
        "capitania":      "2º Capitão",
        "foto_pasta":     "Abreu",
    },
    "Gaps8459": {
        "id":             "gaps",
        "nome_display":   "Gaps",
        "numero":         10,
        "posicao":        "CA",
        "posicao_ea":     "forward",
        "capitania":      "3º Capitão",
        "foto_pasta":     "Gaps",
    },
    "ZeCriminoso": {
        "id":             "pedrao",
        "nome_display":   "Pedrão",
        "numero":         5,
        "posicao":        "GK",
        "posicao_ea":     "goalkeeper",
        "capitania":      None,
        "foto_pasta":     "Pedrao",
    },
    "brsferrari": {
        "id":             "dilaurentis",
        "nome_display":   "DiLaurentis",
        "numero":         19,
        "posicao":        "ZGE",
        "posicao_ea":     "defender",
        "capitania":      None,
        "foto_pasta":     "DiLaurentis",
    },
    "SRGT_XEREQUINHA": {
        "id":             "pinto",
        "nome_display":   "Pinto",
        "numero":         23,
        "posicao":        "PE",
        "posicao_ea":     "midfielder",
        "capitania":      None,
        "foto_pasta":     "Pinto",
    },
    "gavrielcrvg": {
        "id":             "gabri",
        "nome_display":   "Gabri",
        "numero":         27,
        "posicao":        "PD",
        "posicao_ea":     "midfielder",
        "capitania":      None,
        "foto_pasta":     "Gabri",
    },
    "Wendelkkho": {
        "id":             "cleiton",
        "nome_display":   "Cleiton",
        "numero":         30,
        "posicao":        "VOL",
        "posicao_ea":     "midfielder",
        "capitania":      None,
        "foto_pasta":     "Cleiton",
    },
    # Formiga ainda não aparece no players_club_stats — espaço reservado
    # "formiga_ea_username": {
    #     "id":            "formiga",
    #     "nome_display":  "Formiga",
    #     "numero":        69,
    #     "posicao":       "PD",
    #     "posicao_ea":    "midfielder",
    #     "capitania":     None,
    #     "foto_pasta":    "Formiga",
    # },
}

# =============================================
# UTILITÁRIOS
# =============================================
def carregar_json(filename: str) -> dict | None:
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        print(f"  [AVISO] Arquivo não encontrado: {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"  [ERRO] Não foi possível ler {path}: {e}")
        return None

def salvar_json(dados: dict, filename: str) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    path = os.path.join(DATA_DIR, filename)
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
    """
    Lê players_club_stats.json e retorna lista de dicts
    com as estatísticas de cada membro do elenco mapeado,
    com posições corrigidas para a tática 1-4-2-3-1.
    """
    raw = carregar_json("players_club_stats.json")
    if not raw:
        print("  [AVISO] Não foi possível processar elenco.")
        return []

    membros_brutos = raw.get("data", {}).get("members", [])
    elenco_final   = []

    for membro in membros_brutos:
        ea_username = membro.get("name", "")
        meta        = ELENCO_MAP.get(ea_username)

        # Ignora jogadores que não fazem parte do elenco oficial mapeado
        if not meta:
            print(f"  [INFO] Jogador não mapeado ignorado: {ea_username}")
            continue

        # Coleta estatísticas brutas
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

        # Últimos 10 gols (tendência)
        prev_goals = [safe_int(membro.get(f"prevGoals{i if i > 0 else ''}")) for i in range(11)]

        jogador = {
            # --- Identidade ---
            "id":           meta["id"],
            "nome_display": meta["nome_display"],
            "ea_username":  ea_username,
            "pro_name":     membro.get("proName", ""),
            "numero":       meta["numero"],
            "posicao":      meta["posicao"],          # Posição tática corrigida
            "posicao_ea":   meta["posicao_ea"],
            "capitania":    meta["capitania"],
            "foto_pasta":   meta["foto_pasta"],
            "status":       "ativo",

            # --- Estatísticas Globais ---
            "partidas":     gamesPlayed,
            "gols":         goals,
            "assistencias": assists,
            "win_rate":     winRate,
            "media_nota":   ratingAve,
            "mvp":          manOfTheMatch,
            "cartoes_vermelhos": redCards,
            "passes_feitos": passesmade,
            "taxa_passe":   passSuccess,
            "taxa_chute":   shotSuccess,
            "desarmes":     tackles,
            "taxa_desarme": tackleSuccess,
            "overall":      proOverall,
            "clean_sheets_def": cleanSheetsDef,
            "clean_sheets_gk":  cleanSheetsGK,

            # Tendência de gols (últimas 10 partidas contadas pelo acumulado)
            "tendencia_gols": prev_goals[1:],  # índices 1-10 = últimas 10

            # Relação gols+assistências
            "participacoes_gol": goals + assists,

            # Timestamp de quando foi processado
            "processado_em": datetime.now().isoformat(),
        }

        elenco_final.append(jogador)
        print(f"  [OK] Processado: {meta['nome_display']} ({ea_username})")

    # Ordena por número de camisa
    elenco_final.sort(key=lambda x: x["numero"])
    return elenco_final


# =============================================
# PROCESSAMENTO DE PARTIDAS
# =============================================
def processar_partidas() -> list:
    """
    Lê todos os matches_*.json e gera uma lista consolidada
    de partidas limpas, com placar, adversário, marcadores e resultado.
    """
    todas_partidas = {}

    for match_type in MATCH_TYPES:
        raw = carregar_json(f"matches_{match_type}.json")
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

            # Identifica nosso clube e o adversário
            nosso   = clubs.get(ID_CLUBE, {})
            adversarios = {k: v for k, v in clubs.items() if k != ID_CLUBE}
            adversario  = next(iter(adversarios.values()), {}) if adversarios else {}
            adv_details = adversario.get("details", {})

            nossos_gols  = safe_int(nosso.get("goals"))
            adv_gols     = safe_int(adversario.get("goals", adversario.get("goalsAgainst", 0)))
            result_code  = safe_int(nosso.get("result"))  # 1=vitória, 2=derrota, 0=empate

            if result_code == 1:
                resultado = "vitoria"
            elif result_code == 2:
                resultado = "derrota"
            else:
                resultado = "empate"

            # Extrai marcadores e assistentes do nosso clube
            nossos_jogadores_na_partida = players.get(ID_CLUBE, {})
            marcadores  = []
            assistentes = []
            mvp         = None
            max_mom     = -1

            for player_id, pdata in nossos_jogadores_na_partida.items():
                ea_username = pdata.get("playername", "")
                meta        = ELENCO_MAP.get(ea_username)
                nome        = meta["nome_display"] if meta else ea_username

                gols_partida     = safe_int(pdata.get("goals"))
                assists_partida  = safe_int(pdata.get("assists"))
                is_mom           = safe_int(pdata.get("mom"))
                nota             = safe_float(pdata.get("rating"))

                if gols_partida > 0:
                    marcadores.append({
                        "nome":  nome,
                        "gols":  gols_partida,
                    })

                if assists_partida > 0:
                    assistentes.append({
                        "nome":     nome,
                        "assists":  assists_partida,
                    })

                if is_mom == 1 or nota > max_mom:
                    if is_mom == 1:
                        mvp      = nome
                        max_mom  = 999  # prioriza MoM oficial
                    elif max_mom < nota:
                        mvp      = nome
                        max_mom  = nota

            # Data formatada
            try:
                data_partida = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
            except (OSError, ValueError):
                data_partida = None

            partida_limpa = {
                "match_id":        match_id,
                "timestamp":       timestamp,
                "data":            data_partida,
                "tipo":            match_type,
                "adversario":      adv_details.get("name", "Adversário Desconhecido"),
                "placar_nos":      nossos_gols,
                "placar_adv":      adv_gols,
                "resultado":       resultado,
                "marcadores":      marcadores,
                "assistentes":     assistentes,
                "mvp":             mvp,
            }

            todas_partidas[match_id] = partida_limpa

    # Ordena do mais recente para o mais antigo
    lista_final = list(todas_partidas.values())
    lista_final.sort(key=lambda x: x["timestamp"], reverse=True)

    return lista_final


# =============================================
# GERAÇÃO DE STATS.JSON (metadata global)
# =============================================
def gerar_stats_globais(elenco: list, partidas: list) -> dict:
    """
    Compila um resumo global do clube para uso no footer
    e nas seções de Estatísticas da home.
    """
    # Filtra apenas Liga para estatísticas oficiais
    liga = [p for p in partidas if p["tipo"] == "leagueMatch"]
    todos = partidas  # para contagem total

    total_partidas  = len(liga)
    vitorias        = sum(1 for p in liga if p["resultado"] == "vitoria")
    empates         = sum(1 for p in liga if p["resultado"] == "empate")
    derrotas        = sum(1 for p in liga if p["resultado"] == "derrota")
    gols_marcados   = sum(p["placar_nos"] for p in liga)
    gols_sofridos   = sum(p["placar_adv"] for p in liga)

    # Artilheiros (baseado em elenco processado)
    artilheiros = sorted(elenco, key=lambda x: x["gols"], reverse=True)[:5]
    garcons     = sorted(elenco, key=lambda x: x["assistencias"], reverse=True)[:5]
    mvps        = sorted(elenco, key=lambda x: x["mvp"], reverse=True)[:5]

    return {
        "last_updated": datetime.now().isoformat(),
        "status": "success",
        "clube": {
            "nome":          "Baile de Munique",
            "id_ea":         ID_CLUBE,
            "tatica":        "1-4-2-3-1",
            "instagram":     "https://www.instagram.com/bailedemunichofc/",
        },
        "liga": {
            "total_partidas": total_partidas,
            "vitorias":       vitorias,
            "empates":        empates,
            "derrotas":       derrotas,
            "gols_marcados":  gols_marcados,
            "gols_sofridos":  gols_sofridos,
            "saldo_gols":     gols_marcados - gols_sofridos,
            "win_rate":       round((vitorias / total_partidas * 100) if total_partidas > 0 else 0, 1),
        },
        "total_partidas_all":  len(todos),
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

    # 1. Processa elenco
    print("\n[1/3] Processando elenco...")
    elenco = processar_elenco()
    salvar_json({
        "last_updated": datetime.now().isoformat(),
        "status":       "success",
        "total":        len(elenco),
        "data":         elenco,
    }, "elenco_processado.json")

    # 2. Processa partidas
    print("\n[2/3] Processando partidas...")
    partidas = processar_partidas()
    salvar_json({
        "last_updated": datetime.now().isoformat(),
        "status":       "success",
        "total":        len(partidas),
        "data":         partidas,
    }, "matches_processado.json")

    # 3. Gera stats globais
    print("\n[3/3] Gerando stats globais...")
    stats = gerar_stats_globais(elenco, partidas)
    salvar_json(stats, "stats.json")

    print("\n" + "=" * 60)
    print(f"  Concluído! {len(elenco)} jogadores | {len(partidas)} partidas")
    print("=" * 60)


if __name__ == "__main__":
    main()
