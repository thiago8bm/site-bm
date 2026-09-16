# FASE 3: Refatoração da Pesquisa de Elenco (Backend)

## Contexto Atual
Temos um script chamado `script_pesquisa_elenco.py` que atualmente lê um `.xlsx` (Google Forms) e gera um arquivo `.html` gigantesco contendo CSS inline e scripts do Chart.js.

## Suas Tarefas nesta Fase

1. **Refatorar `script_pesquisa_elenco.py` para gerar JSON:**
   - Remova TODA a parte do código que gera a string `html_template` e injeta dados no HTML. O backend não deve ditar a interface visual do site.
   - O script deve continuar usando o `pandas` e o `Counter` para calcular: médias (termômetro), outliers de autoavaliação, top 3 consistentes/decisivos, posições favoritas, votos de capitães, coringas e escalação ideal.
   - Todo esse dado processado deve ser empacotado em um dicionário Python e salvo na pasta `/data/pesquisa.json`.

2. **Estrutura sugerida para o `pesquisa.json`:**
   ```json
   {
     "termometro": { "media_coletiva": X, "media_auto": Y, "alertas_outliers": "..." },
     "premiacoes": { "consistentes": [], "decisivos": [], "evoluiram": [], "precisam_melhorar": Z },
     "coringas": { "ZAG": "...", "VOL": "..." },
     "escalacao_ideal": { "GK": "...", "LD": "...", "ZGD": "..." },
     "graficos": { "posicoes_fav": {...}, "capitaes": {...} }
   }