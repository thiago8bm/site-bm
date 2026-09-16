"""
script_pesquisa_elenco.py — Baile de Munique
Lê a planilha de pesquisa interna (Google Forms → .xlsx) e gera
data/pesquisa.json com todos os dados processados para o frontend consumir.

IMPORTANTE: Este script NÃO gera HTML. Toda a interface visual é
responsabilidade do frontend (src/js/). Apenas empacota os dados em JSON.
"""

import pandas as pd
from collections import Counter
import json
import os
from datetime import datetime

# =============================================
# CONFIGURAÇÃO
# =============================================
CAMINHO_XLSX  = os.path.join("data", "raw", "Pesquisa_de_elenco_-_BM_(respostas).xlsx")
CAMINHO_JSON  = os.path.join("data", "survey", "pesquisa.json")

# =============================================
# UTILITÁRIO: Extrair top N com suporte a empates
# =============================================
def pegar_top_n_com_empates(coluna_serie, n=3) -> list:
    """
    Retorna lista de dicts [{posicao, nome, votos}, ...]
    respeitando empates (ex: 2 jogadores empatados no 1º lugar).
    """
    votos_str   = coluna_serie.dropna().astype(str).str.cat(sep=',')
    votos_lista = [v.strip() for v in votos_str.split(',') if v.strip()]
    if not votos_lista:
        return []

    contagem = Counter(votos_lista)
    ranking  = contagem.most_common()

    # Agrupa por quantidade de votos (para tratar empates)
    votos_por_qtd = {}
    for nome, qtd in ranking:
        votos_por_qtd.setdefault(qtd, []).append(nome)

    resultado    = []
    posicao_atual = 1
    for qtd in sorted(votos_por_qtd.keys(), reverse=True):
        if posicao_atual > n:
            break
        nomes = votos_por_qtd[qtd]
        for nome in nomes:
            resultado.append({
                "posicao": posicao_atual,
                "nome":    nome,
                "votos":   qtd,
            })
        posicao_atual += len(nomes)

    return resultado


def processar_pesquisa(caminho_xlsx: str) -> dict:
    print(f"  Lendo planilha: {caminho_xlsx}")
    try:
        df = pd.read_excel(caminho_xlsx)
    except FileNotFoundError:
        print(f"  [ERRO] Arquivo não encontrado: {caminho_xlsx}")
        return {}
    except Exception as e:
        print(f"  [ERRO] Falha ao ler xlsx: {e}")
        return {}

    print(f"  {len(df)} respostas encontradas.")

    # =============================================
    # MAPEAMENTO DINÂMICO DE COLUNAS (robusto a
    # variações de capitalização/espaçamento)
    # =============================================
    def find_col(keyword):
        matches = [col for col in df.columns if keyword.lower() in col.lower()]
        return matches[0] if matches else None

    col_pos_fav       = find_col('posição favorita')
    col_auto          = find_col('próprio desempenho')
    col_equipe        = find_col('desempenho da equipe')
    col_capitaes      = find_col('capitão do time')
    col_consistentes  = find_col('consistentes')
    col_decisivos     = find_col('decisivos')
    col_evoluiram     = find_col('evoluíram')
    col_melhorar      = find_col('precisam melhorar')

    cols_polivalencia = [col for col in df.columns if 'posições que cada um pode fazer' in col.lower()]
    cols_escalacao    = [col for col in df.columns if 'escalação ideal' in col.lower()]

    # =============================================
    # 1. TERMÔMETRO E CONFIANÇA
    # =============================================
    media_auto    = round(float(df[col_auto].mean()), 2) if col_auto else 0
    media_equipe  = round(float(df[col_equipe].mean()), 2) if col_equipe else 0

    # Distribuição de notas de autoavaliação (para gráfico)
    dist_auto = {}
    if col_auto:
        counts = df[col_auto].value_counts().sort_index()
        dist_auto = {str(int(k)): int(v) for k, v in counts.items()}

    # Outliers: jogadores que se avaliaram com >= 1 estrela de diferença da média
    alertas_outliers = []
    if col_auto:
        df_temp = df.copy()
        df_temp['Diferenca_Auto'] = abs(df_temp[col_auto] - media_auto)
        outliers_df = df_temp[df_temp['Diferenca_Auto'] >= 1.0]
        if not outliers_df.empty:
            notas_outliers = outliers_df[col_auto].astype(int).tolist()
            alertas_outliers = notas_outliers

    termometro = {
        "media_auto":          media_auto,
        "media_coletiva":      media_equipe,
        "dist_auto":           dist_auto,
        "qtd_outliers":        len(alertas_outliers),
        "notas_outliers":      alertas_outliers,
        "alerta_texto":        (
            f"ALERTA: {len(alertas_outliers)} jogador(es) se autoavaliaram com uma diferença "
            f"de mais do que 1 estrela em relação à média do grupo ({media_auto:.2f}). "
            f"Valores discrepantes: {', '.join([f'{n} estrela(s)' for n in alertas_outliers])}."
            if alertas_outliers
            else "Nenhuma autoavaliação apresentou discrepância maior que 1 estrela em relação à média do grupo."
        ),
    }

    # =============================================
    # 2. PREMIAÇÕES
    # =============================================
    consistentes = pegar_top_n_com_empates(df[col_consistentes], n=3) if col_consistentes else []
    decisivos    = pegar_top_n_com_empates(df[col_decisivos], n=3) if col_decisivos else []

    # Evoluíram (mínimo 3 votos — nominal)
    evoluiram = []
    if col_evoluiram:
        votos_evol = df[col_evoluiram].dropna().astype(str).str.cat(sep=',')
        lista_evol = [v.strip() for v in votos_evol.split(',') if v.strip()]
        evoluiram  = [
            {"nome": nome, "votos": qtd}
            for nome, qtd in Counter(lista_evol).most_common()
            if qtd >= 3
        ]

    # Precisam melhorar (somente quantitativo — privacidade)
    qtd_melhorar = 0
    if col_melhorar:
        votos_melhoria = df[col_melhorar].dropna().astype(str).str.cat(sep=',')
        lista_melhoria = [v.strip() for v in votos_melhoria.split(',') if v.strip()]
        qtd_melhorar   = len([n for n, q in Counter(lista_melhoria).items() if q >= 3])

    premiacoes = {
        "consistentes": consistentes,
        "decisivos":    decisivos,
        "evoluiram":    evoluiram,
        "precisam_melhorar_qtd": qtd_melhorar,
    }

    # =============================================
    # 3. ESCALAÇÃO IDEAL 11 (sem repetições)
    # =============================================
    votos_posicao = {}
    for col in cols_escalacao:
        # Extrai nome da posição do label da coluna: "... [GK]" → "GK"
        pos = col.split('[')[-1].replace(']', '').strip()
        votos_posicao[pos] = Counter(df[col].dropna().tolist())

    # Todos os votos consolidados, ordenados por quantidade
    todos_os_votos = []
    for pos, contagem in votos_posicao.items():
        for jogador, qtd in contagem.items():
            todos_os_votos.append({'jogador': jogador, 'posicao': pos, 'votos': qtd})
    todos_os_votos.sort(key=lambda x: x['votos'], reverse=True)

    escalacao_final   = {}
    jogadores_escalados = set()
    posicoes_preenchidas = set()
    POSICOES_ORDEM = ['GK', 'LD', 'ZGD', 'ZGE', 'LE', 'VLD', 'VLE', 'MEI', 'PD', 'CA', 'PE']

    for voto in todos_os_votos:
        jog = voto['jogador']
        pos = voto['posicao']
        votos = voto['votos']
        if pos not in posicoes_preenchidas and jog not in jogadores_escalados:
            escalacao_final[pos] = {"nome": jog, "votos": votos}
            posicoes_preenchidas.add(pos)
            jogadores_escalados.add(jog)

    # Preenche posições sem votos com placeholder
    for pos in POSICOES_ORDEM:
        if pos not in escalacao_final:
            escalacao_final[pos] = {"nome": "-", "votos": 0}

    # =============================================
    # 4. CORINGAS (Top 3 por setor de atuação)
    # =============================================
    SETORES = ['ZAG', 'LD/LE', 'VOL', 'MEI', 'PD/PE', 'CA']
    votos_por_setor = {s: [] for s in SETORES}

    for col in cols_polivalencia:
        jogador   = col.split('[')[-1].replace(']', '').strip()
        marcacoes = df[col].dropna().astype(str).str.cat(sep=',').upper()
        for setor in SETORES:
            count = marcacoes.count(setor)
            if count > 0:
                votos_por_setor[setor].extend([jogador] * count)

    coringas = {}
    for setor in SETORES:
        lista  = votos_por_setor[setor]
        top3   = Counter(lista).most_common(3)
        coringas[setor] = [{"nome": nome, "votos": qtd} for nome, qtd in top3]

    # =============================================
    # 5. GRÁFICOS (dados para Chart.js no frontend)
    # =============================================
    # Posições favoritas (doughnut)
    graficos_posicoes = {}
    if col_pos_fav:
        contagem_pos = df[col_pos_fav].value_counts()
        graficos_posicoes = {
            "labels": contagem_pos.index.tolist(),
            "data":   contagem_pos.values.tolist(),
        }

    # Votação de capitães (bar)
    graficos_capitaes = {}
    if col_capitaes:
        votos_cap = df[col_capitaes].dropna().astype(str).str.cat(sep=',').split(',')
        votos_cap = [v.strip() for v in votos_cap if v.strip()]
        rank_cap  = Counter(votos_cap).most_common()
        graficos_capitaes = {
            "labels": [x[0] for x in rank_cap],
            "data":   [x[1] for x in rank_cap],
        }

    # =============================================
    # EMPACOTAMENTO FINAL
    # =============================================
    return {
        "last_updated":   datetime.now().isoformat(),
        "status":         "success",
        "total_respostas": len(df),
        "termometro":     termometro,
        "premiacoes":     premiacoes,
        "escalacao_ideal": escalacao_final,
        "coringas":       coringas,
        "graficos": {
            "posicoes_fav": graficos_posicoes,
            "capitaes":     graficos_capitaes,
        },
    }


# =============================================
# MAIN
# =============================================
def main():
    print("=" * 60)
    print("  script_pesquisa_elenco.py — Baile de Munique")
    print(f"  Iniciando em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    dados = processar_pesquisa(CAMINHO_XLSX)

    if not dados:
        print("\n[ERRO] Nenhum dado processado. Abortando.")
        return

    os.makedirs("data", exist_ok=True)
    with open(CAMINHO_JSON, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=4, ensure_ascii=False)

    print(f"\n[OK] pesquisa.json salvo em: {CAMINHO_JSON}")
    print(f"  Total de respostas: {dados.get('total_respostas', '?')}")
    print("=" * 60)


if __name__ == "__main__":
    main()