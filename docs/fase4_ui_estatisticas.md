# FASE 4: Renderização de Elenco e Estatísticas (Frontend)

## Contexto Atual
Agora temos a base da interface (`src/js/app.js`, HTML, CSS) e os dados finais da EA (`elenco_processado.json`, `matches_processado.json`) aguardando para serem consumidos.

## Suas Tarefas nesta Fase

1. **Criar a Camada de Dados (`src/js/api.js`):**
   - Crie funções assíncronas usando `fetch()` para ler os arquivos `.json` que estão na pasta `/data/`. 
   - Lide com potenciais erros (ex: caso o arquivo não exista no repositório).

2. **Criar a Interface de Renderização (`src/js/ui.js`):**
   - Crie a função que renderiza a tela "Elenco": itere sobre os jogadores e monte os Cards (com foto placeholder, posição corrigida, status e hierarquia de capitão).
   - Crie a função que renderiza a tela "Últimos Jogos": uma grade ou lista vertical exibindo adversário, placar e resultado.
   - Crie a função que renderiza "Estatísticas": monte uma tabela simples ordenada pelos artilheiros e líderes de assistência.

3. **Feedback Visual no Rodapé:**
   - Atualize a `<div class="update-status">` do Footer lendo o campo `last_updated` do JSON. Se o `fetch` falhar, exiba o `span` de erro que já existe no HTML.