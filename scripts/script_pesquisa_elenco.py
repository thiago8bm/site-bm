import pandas as pd
from collections import Counter
import json

def gerar_dashboard_bm(caminho_xlsx, caminho_saida_html):
    print("Iniciando leitura e processamento de dados...")
    
    try:
        df = pd.read_excel(caminho_xlsx)
    except FileNotFoundError:
        print(f"Erro: O arquivo '{caminho_xlsx}' não foi encontrado.")
        return

    # ========================================================
    # MAPEAMENTO DINÂMICO DE COLUNAS
    # ========================================================
    col_pos_fav = [col for col in df.columns if 'posição favorita' in col.lower()][0]
    col_auto = [col for col in df.columns if 'próprio desempenho' in col.lower()][0]
    col_equipe = [col for col in df.columns if 'desempenho da equipe' in col.lower()][0]
    
    cols_q6_polivalencia = [col for col in df.columns if 'posições que cada um pode fazer' in col.lower()]
    cols_q7_escalacao = [col for col in df.columns if 'escalação ideal' in col.lower()]
    col_capitaes = [col for col in df.columns if 'capitão do time' in col.lower()][0]
    col_consistentes = [col for col in df.columns if 'consistentes' in col.lower()][0]
    col_decisivos = [col for col in df.columns if 'decisivos' in col.lower()][0]
    col_evoluiram = [col for col in df.columns if 'evoluíram' in col.lower()][0]
    col_melhorar = [col for col in df.columns if 'precisam melhorar' in col.lower()][0]

    # ========================================================
    # 1. TERMÔMETRO E CONFIANÇA (Outliers de Autoavaliação)
    # ========================================================
    media_auto = df[col_auto].mean()
    media_equipe = df[col_equipe].mean()
    
    df['Diferenca_Auto'] = abs(df[col_auto] - media_auto)
    outliers_df = df[df['Diferenca_Auto'] >= 1.0]
    qtd_outliers = len(outliers_df)
    
    if qtd_outliers > 0:
        notas_outliers = outliers_df[col_auto].astype(int).tolist()
        notas_formatadas = ", ".join([f"{nota} estrela(s)" for nota in notas_outliers])
        texto_alerta_outliers = f"<strong>ALERTA:</strong> Houveram <strong>{qtd_outliers}</strong> jogador(es) que se autoavaliaram \
            com muita discrepância da nota média de autoavaliação do grupo ({media_auto:.2f}), com 1 ou mais estrela(s) de diferença. \
            <br> --> Valores de autoavaliações discrepantes identificados: <strong>{notas_formatadas}</strong>."
    else:
        texto_alerta_outliers = "Nenhuma autoavaliação apresentou discrepância maior que 1 estrela em relação à média do grupo."

    # ========================================================
    # 2. PRÊMIOS (Top 3 e Empates)
    # ========================================================
    def pegar_top3_formatado(coluna):
        votos_str = df[coluna].dropna().astype(str).str.cat(sep=',')
        votos_lista = [v.strip() for v in votos_str.split(',') if v.strip()]
        if not votos_lista: return "Indefinido"
        
        contagem = Counter(votos_lista)
        ranking = contagem.most_common()
        
        votos_por_qtd = {}
        for nome, qtd in ranking:
            votos_por_qtd.setdefault(qtd, []).append(nome)
            
        top3_texto = ""
        posicao_atual = 1
        for qtd, nomes in sorted(votos_por_qtd.items(), reverse=True):
            if posicao_atual > 3: break
            nomes_str = " / ".join(nomes)
            top3_texto += f"<div style='margin-bottom: 8px;'>{posicao_atual}º {nomes_str} ({qtd}v)</div>"
            posicao_atual += len(nomes)
        return top3_texto

    mais_consistente_txt = pegar_top3_formatado(col_consistentes)
    mais_decisivo_txt = pegar_top3_formatado(col_decisivos)

    # ========================================================
    # 3. EVOLUÇÃO E SUPORTE (Min 3 votos)
    # ========================================================
    # Evoluíram (Nominal)
    votos_evol = df[col_evoluiram].dropna().astype(str).str.cat(sep=',')
    lista_evol = [v.strip() for v in votos_evol.split(',') if v.strip()]
    evol_filtrados = [(nome, qtd) for nome, qtd in Counter(lista_evol).most_common() if qtd >= 3]
    
    if not evol_filtrados:
        texto_evoluiram = "Nenhum jogador com 3+ votos."
    else:
        texto_evoluiram = "<br>".join([f"{nome} ({qtd}v)" for nome, qtd in evol_filtrados])
        
    # Precisam Melhorar (Apenas quantitativo)
    votos_melhoria = df[col_melhorar].dropna().astype(str).str.cat(sep=',')
    lista_melhoria = [v.strip() for v in votos_melhoria.split(',') if v.strip()]
    qtd_melhorar = len([nome for nome, qtd in Counter(lista_melhoria).items() if qtd >= 3])

    # ========================================================
    # 4. ESCALAÇÃO IDEAL 11 (Sem repetições)
    # ========================================================
    votos_posicao = {}
    for col in cols_q7_escalacao:
        pos = col.split('[')[-1].replace(']', '').strip()
        votos_posicao[pos] = Counter(df[col].dropna().tolist())

    escalacao_final = {}
    jogadores_escalados = set()
    posicoes_nomes_str = ['GK', 'LD', 'ZGD', 'ZGE', 'LE', 'VLD', 'VLE', 'MEI', 'PD', 'CA', 'PE']
    
    todos_os_votos = []
    for pos, contagem in votos_posicao.items():
        for jogador, qtd in contagem.items():
            todos_os_votos.append({'jogador': jogador, 'posicao': pos, 'votos': qtd})
            
    todos_os_votos.sort(key=lambda x: x['votos'], reverse=True)
    
    posicoes_preenchidas = set()
    for voto in todos_os_votos:
        jog = voto['jogador']
        pos = voto['posicao']
        if pos not in posicoes_preenchidas and jog not in jogadores_escalados:
            escalacao_final[pos] = jog
            posicoes_preenchidas.add(pos)
            jogadores_escalados.add(jog)
            
    for pos in posicoes_nomes_str:
        if pos not in escalacao_final:
            escalacao_final[pos] = '-'

    # ========================================================
    # 5. CORINGAS (Top 3 por setor)
    # ========================================================
    votos_por_setor = {'ZAG': [], 'LD/LE': [], 'VOL': [], 'MEI': [], 'PD/PE': [], 'CA': []}
    
    for col in cols_q6_polivalencia:
        jogador = col.split('[')[-1].replace(']', '').strip()
        marcacoes = df[col].dropna().astype(str).str.cat(sep=',').upper()
        
        if 'ZAG' in marcacoes: votos_por_setor['ZAG'].extend([jogador] * marcacoes.count('ZAG'))
        if 'LD/LE' in marcacoes: votos_por_setor['LD/LE'].extend([jogador] * marcacoes.count('LD/LE'))
        if 'VOL' in marcacoes: votos_por_setor['VOL'].extend([jogador] * marcacoes.count('VOL'))
        if 'MEI' in marcacoes: votos_por_setor['MEI'].extend([jogador] * marcacoes.count('MEI'))
        if 'PD/PE' in marcacoes: votos_por_setor['PD/PE'].extend([jogador] * marcacoes.count('PD/PE'))
        if 'CA' in marcacoes: votos_por_setor['CA'].extend([jogador] * marcacoes.count('CA'))

    def top_3_coringas(setor):
        lista = votos_por_setor[setor]
        if not lista: return "-"
        ranking = Counter(lista).most_common(3)
        return ", ".join([f"{nome} ({qtd}v)" for nome, qtd in ranking])

    # ========================================================
    # 6. GRÁFICOS (Pizza e Barras)
    # ========================================================
    contagem_pos_fav = df[col_pos_fav].value_counts()
    posicoes_labels = contagem_pos_fav.index.tolist()
    posicoes_data = contagem_pos_fav.values.tolist()

    votos_cap = df[col_capitaes].dropna().astype(str).str.cat(sep=',').split(',')
    votos_cap = [v.strip() for v in votos_cap if v.strip()]
    rank_capitaes = Counter(votos_cap).most_common()
    capitaes_nomes = [x[0] for x in rank_capitaes]
    capitaes_votos = [x[1] for x in rank_capitaes]

    # ========================================================
    # 7. INJEÇÃO NO HTML
    # ========================================================
    html_template = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Analítico - Baile de Munique</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root { --red: #D32F2F; --white: #FFFFFF; --blue: #1976D2; --light-bg: #F5F7FA; --dark-text: #2C3E50; --pitch-bg: #E8F0FE; --pitch-line: #B0BEC5; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--light-bg); color: var(--dark-text); padding-bottom: 50px; }
        header { background-color: var(--red); color: var(--white); padding: 25px 20px; text-align: center; border-bottom: 5px solid var(--blue); margin-bottom: 30px; }
        header h1 { font-size: 2.2rem; text-transform: uppercase; letter-spacing: 2px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .section-title { color: var(--blue); border-bottom: 2px solid #ddd; padding-bottom: 10px; margin: 40px 0 20px; font-size: 1.5rem; }
        
        .summary-cards-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .summary-cards-bottom { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }

        @media (max-width: 900px) { 
            .summary-cards-top, .summary-cards-bottom, .content-grid { grid-template-columns: 1fr; } 
        }

        .card { background: var(--white); padding: 25px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border-top: 4px solid var(--blue); display: flex; flex-direction: column; justify-content: flex-start; min-height: 160px; }
        .card h3 { font-size: 1.2rem; margin-bottom: 20px; color: var(--dark-text); font-weight: 600; }
        
        .media-box { font-size: 1.3rem; font-weight: bold; line-height: 1.8; }
        .media-coletivo { color: var(--red); }
        .media-auto { color: var(--blue); }
        
        .premio-box { font-size: 1.05rem; color: #444; line-height: 1.6; text-align: center; }
        
        .alert-box { background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin-top: 15px; font-size: 0.95rem; border-left: 5px solid #ffeeba; line-height: 1.5; }
        
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }
        .panel { background: var(--white); padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .versatility-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.95rem; }
        .versatility-table th, .versatility-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .versatility-table th { background-color: var(--light-bg); color: var(--blue); }
        .pitch { width: 100%; max-width: 350px; height: 500px; background-color: var(--pitch-bg); border: 3px solid var(--pitch-line); position: relative; border-radius: 5px; margin: 20px auto; overflow: hidden; }
        .pitch::before { content: ''; position: absolute; top: 50%; left: 0; width: 100%; height: 2px; background-color: var(--pitch-line); }
        .pitch::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; border: 2px solid var(--pitch-line); border-radius: 50%; }
        .penalty-area-top { position: absolute; top: 0; left: 20%; width: 60%; height: 15%; border: 2px solid var(--pitch-line); border-top: none; }
        .penalty-area-bottom { position: absolute; bottom: 0; left: 20%; width: 60%; height: 15%; border: 2px solid var(--pitch-line); border-bottom: none; }
        .player { width: auto; min-width: 35px; height: 30px; padding: 0 8px; background-color: var(--red); color: var(--white); border-radius: 15px; position: absolute; display: flex; justify-content: center; align-items: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: translate(-50%, -50%); z-index: 10; }
        .player.gk { background-color: #f39c12; }
        .chart-container { position: relative; height: 300px; width: 100%; }
    </style>
</head>
<body>
    <header>
        <h1>Baile de Munique</h1>
        <p>Pesquisa de Elenco</p>
    </header>
    <div class="container">
        <h2 class="section-title">1. Termômetro do Elenco & Premiações</h2>
        
        <div class="summary-cards-top">
            <div class="card">
                <h3>Percepção Média de Desempenho</h3>
                <div class="media-box">
                    <div class="media-coletivo">Coletivo: __MEDIA_EQUIPE__</div>
                    <div class="media-auto">Autoavaliação: __MEDIA_AUTO__</div>
                </div>
            </div>
            <div class="card">
                <h3>Jogadores mais Consistentes</h3>
                <div class="premio-box">__CONSISTENTE__</div>
            </div>
            <div class="card">
                <h3>Jogadores mais Decisivos</h3>
                <div class="premio-box">__DECISIVO__</div>
            </div>
        </div>

        <div class="summary-cards-bottom">
            <div class="card" style="border-top-color: #2ecc71;">
                <h3>Jogadores que mais evoluíram (3+ votos)</h3>
                <div class="value" style="font-size: 1.1rem; color: #333; margin-top:5px; line-height: 1.5;">
                    <span style="color: #2ecc71; font-weight: bold;">__TXT_EVOLUIRAM__</span>
                </div>
            </div>
            <div class="card" style="border-top-color: #e74c3c;">
                <h3>Jogadores que precisam evoluir... (3+ votos)</h3>
                <div class="value" style="font-size: 1.1rem; color: #333; margin-top:5px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <span style="color: #e74c3c; font-size: 1.2rem;"><strong>__QTD_MELHORAR__</strong> jogador(es)</span>
                    <span style="font-size: 0.85rem; color: #7f8c8d; margin-top: 8px;">(Serão contatados anonimamente)</span>
                </div>
            </div>
        </div>

        <div class="alert-box">
            __TEXTO_OUTLIERS__
        </div>

        <h2 class="section-title">2. Profundidade de elenco</h2>
        <div class="content-grid">
            <div class="panel">
                <h3 style="margin-bottom: 15px; color: var(--blue);">Posições Favoritas do Elenco</h3>
                <div class="chart-container" style="height: 250px;">
                    <canvas id="posicoesChart"></canvas>
                </div>
            </div>
            <div class="panel">
                <h3 style="margin-bottom: 10px; color: var(--blue);">Coringas (Percepção do Time)</h3>
                <p style="font-size: 0.9rem; color: #666;">Top 3 jogadores mais votados pelo elenco em cada setor.</p>
                <table class="versatility-table">
                    <tr><th>Posição</th><th>Jogadores Mais Votados</th></tr>
                    <tr><td>Zaga (ZAG)</td><td>__V_ZAG__</td></tr>
                    <tr><td>Laterais (LD/LE)</td><td>__V_LAT__</td></tr>
                    <tr><td>Volância (VOL)</td><td>__V_VOL__</td></tr>
                    <tr><td>Meia (MEI)</td><td>__V_MEI__</td></tr>
                    <tr><td>Pontas (PE/PD)</td><td>__V_PON__</td></tr>
                    <tr><td>Ataque (CA)</td><td>__V_CA__</td></tr>
                </table>
            </div>
        </div>

        <h2 class="section-title">3. Escalação Ideal e Liderança</h2>
        <div class="content-grid">
            <div class="panel">
                <h3 style="text-align: center; color: var(--blue);">O 11 Ideal votado</h3>
                <div class="pitch">
                    <div class="penalty-area-top"></div>
                    <div class="penalty-area-bottom"></div>
                    
                    <div class="player gk" style="bottom: 8%; left: 50%;">__GK__</div>
                    <div class="player" style="bottom: 22%; left: 15%;">__LE__</div>
                    <div class="player" style="bottom: 20%; left: 35%;">__ZGE__</div>
                    <div class="player" style="bottom: 20%; left: 65%;">__ZGD__</div>
                    <div class="player" style="bottom: 22%; left: 85%;">__LD__</div>
                    
                    <div class="player" style="bottom: 38%; left: 35%;">__VLE__</div>
                    <div class="player" style="bottom: 38%; left: 65%;">__VLD__</div>
                    
                    <div class="player" style="bottom: 58%; left: 15%;">__PE__</div>
                    <div class="player" style="bottom: 65%; left: 50%;">__MEI__</div>
                    <div class="player" style="bottom: 58%; left: 85%;">__PD__</div>
                    
                    <div class="player" style="bottom: 82%; left: 50%;">__CA__</div>
                </div>
            </div>

            <div class="panel">
                <h3 style="margin-bottom: 15px; color: var(--blue);">Votação para Capitães</h3>
                <div class="chart-container">
                    <canvas id="capitaoChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <script>
        const nomesCapitaes = __CAPITAES_NOMES__;
        const votosCapitaes = __CAPITAES_VOTOS__;
        const posicoesNomes = __POSICOES_NOMES__;
        const posicoesVotos = __POSICOES_VOTOS__;

        const colorRed = '#D32F2F'; const colorBlue = '#1976D2'; const colorGray = '#B0BEC5';

        const ctxCapitao = document.getElementById('capitaoChart').getContext('2d');
        new Chart(ctxCapitao, {
            type: 'bar',
            data: {
                labels: nomesCapitaes,
                datasets: [{ data: votosCapitaes, backgroundColor: [colorBlue, colorRed, colorRed, colorGray, colorGray, colorGray], borderRadius: 4 }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
        });

        const ctxPosicoes = document.getElementById('posicoesChart').getContext('2d');
        new Chart(ctxPosicoes, {
            type: 'doughnut',
            data: {
                labels: posicoesNomes,
                datasets: [{ data: posicoesVotos, backgroundColor: [colorBlue, colorRed, '#f39c12', '#2ecc71', '#9b59b6', '#34495e', '#e74c3c'], borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
    </script>
</body>
</html>"""

    # Injeção no HTML
    html_final = html_template.replace('__MEDIA_EQUIPE__', f"{media_equipe:.2f}")
    html_final = html_final.replace('__MEDIA_AUTO__', f"{media_auto:.2f}")
    html_final = html_final.replace('__TEXTO_OUTLIERS__', texto_alerta_outliers)
    
    html_final = html_final.replace('__CONSISTENTE__', mais_consistente_txt)
    html_final = html_final.replace('__DECISIVO__', mais_decisivo_txt)
    
    html_final = html_final.replace('__TXT_EVOLUIRAM__', texto_evoluiram)
    html_final = html_final.replace('__QTD_MELHORAR__', str(qtd_melhorar))
    
    html_final = html_final.replace('__V_ZAG__', top_3_coringas('ZAG'))
    html_final = html_final.replace('__V_LAT__', top_3_coringas('LD/LE'))
    html_final = html_final.replace('__V_VOL__', top_3_coringas('VOL'))
    html_final = html_final.replace('__V_MEI__', top_3_coringas('MEI'))
    html_final = html_final.replace('__V_PON__', top_3_coringas('PD/PE'))
    html_final = html_final.replace('__V_CA__', top_3_coringas('CA'))
    
    for posicao in posicoes_nomes_str:
        html_final = html_final.replace(f"__{posicao}__", escalacao_final.get(posicao, '-'))
        
    html_final = html_final.replace('__CAPITAES_NOMES__', json.dumps(capitaes_nomes))
    html_final = html_final.replace('__CAPITAES_VOTOS__', json.dumps(capitaes_votos))
    html_final = html_final.replace('__POSICOES_NOMES__', json.dumps(posicoes_labels))
    html_final = html_final.replace('__POSICOES_VOTOS__', json.dumps(posicoes_data))

    with open(caminho_saida_html, 'w', encoding='utf-8') as f:
        f.write(html_final)
        
    print(f"Sucesso! Dashboard v4 (Final) gerado em: {caminho_saida_html}")

gerar_dashboard_bm('data/Pesquisa_de_elenco_-_BM_(respostas).xlsx', 'dashboard_baile_de_munique_v4.html')