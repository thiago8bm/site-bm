# FASE 2: Processamento de Dados da EA (Backend)

## Contexto Atual
Nós já temos o script de raspagem `scripts/fetch_ea_data.py` finalizado e funcional. Ele roda usando `curl_cffi` e gera arquivos brutos em `/data/` (`matches_leagueMatch.json`, `players_club_stats.json`, etc.). 

## Suas Tarefas nesta Fase

1. **Criar o Script de Processamento (`scripts/process_stats.py`):**
   - Este script será responsável por ler os JSONs brutos gerados pelo `fetch_ea_data.py` e criar JSONs finais e enxutos para o frontend consumir.
   
2. **Implementar as Regras de Negócio (Mapeamento de Elenco):**
   - Crie um dicionário relacionando os Nomes/IDs da EA com o nome interno do nosso roleplay.
   - **Correção Tática (MUITO IMPORTANTE):** A EA registra a "posição favorita" baseada na build. Você deve forçar no JSON final as posições reais da nossa tática 1-4-2-3-1:
     - Thiago (#8): MEI (1º Capitão)
     - Abreu (#15): VOL (2º Capitão)
     - Gaps (#10): CA (3º Capitão)
     - Pedrão (#5): GK
     - DiLaurentis (#19): ZGE
     - Pinto (#23): PE
     - Gabri (#27): PD
     - Cleiton (#30): VOL
     - Formiga (#69): PD

3. **Saída Esperada:**
   - O script deve gerar na pasta `/data/`:
     - `elenco_processado.json` (com estatísticas gerais e posições corrigidas).
     - `matches_processado.json` (com as últimas partidas limpas, mantendo apenas placar, adversário e resultado).