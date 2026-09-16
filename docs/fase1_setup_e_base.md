# FASE 1: Setup e Base do Frontend

## Contexto Atual
Já possuímos o arquivo `index.html` base na raiz do projeto. Ele contém a estrutura semântica (`<header>`, `<nav>`, `<main id="app-content">`, `<footer>`) e referências para os arquivos CSS e JS que você irá criar agora.

## Suas Tarefas nesta Fase

1. **Criar a Base de Estilos (`src/css/main.css` e `src/css/components.css`):**
   - No `main.css`, defina as variáveis globais (`:root`) respeitando a identidade visual do Baile de Munique: Vermelho e Branco como primárias, Azul para destaques. Fundo claro/suave (sem modo escuro). 
   - Estilize a tipografia e o reset básico.
   - No `components.css`, crie o layout do Header (navbar horizontal, responsiva via menu hambúrguer no mobile), botões padrão, e o Footer (onde já existe um indicador de status de atualização).

2. **Criar a Lógica de Roteamento (`src/js/app.js`):**
   - O site será um SPA (Single Page Application) em Vanilla JS.
   - Escreva a lógica que "escuta" os cliques nos links da navbar (`data-route`).
   - Ao clicar em um link (ex: "Elenco"), o JS deve ocultar todas as `<section class="view-section">` dentro de `<main id="app-content">` e mostrar apenas a correspondente.
   - Crie seções vazias dinamicamente no DOM caso elas não existam no HTML base (ex: `<section id="elenco-view">`, `<section id="estatisticas-view">`).

3. **Validação:**
   - Certifique-se de que a navegação entre abas funciona sem recarregar a página e que o site está responsivo (Mobile-First). Não crie lógica de consumo de dados ainda.