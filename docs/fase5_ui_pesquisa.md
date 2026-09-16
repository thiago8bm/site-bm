# FASE 5: Dashboard de Pesquisa Nativamente no Site (Frontend)

## Contexto Atual
O arquivo `/data/pesquisa.json` já contém todos os cálculos e consolidações do forms do elenco. Precisamos criar a UI nativa para a seção "Pesquisa de Elenco" usando as cores do clube, importando de forma limpa o design que antes era feito por fora.

## Suas Tarefas nesta Fase

1. **Renderização do Dashboard (`src/js/ui.js`):**
   - Crie a função para renderizar a view `#pesquisa-view`.
   - Adicione os Cards de Resumo (Termômetro do Elenco, Premiações e Alertas de Outliers) lendo os nós do `pesquisa.json`.

2. **Campinho Tático (CSS):**
   - Migre o código do campinho (que existia no script Python antigo) para o `components.css`. 
   - Crie as `divs` da escalação ideal 1-4-2-3-1 e injete via JS os nomes mapeados no nó `escalacao_ideal` do JSON. 

3. **Gráficos (Chart.js):**
   - Importe a biblioteca Chart.js via CDN ou módulo no `app.js`/`ui.js`.
   - Crie as `<canvas>` necessárias e instancie os gráficos de "Votação para Capitães" (Bar) e "Posições Favoritas" (Doughnut) lendo os dados de `pesquisa.json`.

4. **Revisão Visual:**
   - Garanta que toda a tela esteja estilizada usando as variáveis do `main.css` (vermelho, branco e azul), de forma responsiva para celulares.