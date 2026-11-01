# 🗺️ REPO_MAP.md — Mapa Vivo do Repositório (Baile de Munique)

> **Nota sobre o `.gitignore` e Versionamento**:  
> Os arquivos `README.md` e `REPO_MAP.md` residem propositalmente na **raiz do repositório (`site-bm/`)**, não sendo ignorados pelo `.gitignore`. Isso assegura versionamento contínuo pelo Git, rastreabilidade de mudanças estruturais e visibilidade imediata para desenvolvedores e agentes autônomos de IA.

---

## 🤖 Seção 1 — Protocolo Operacional para Agentes Autônomos

> [!IMPORTANT]
> **DIRETRIZ OBRIGATÓRIA PARA MODELOS E AGENTES DE IA (Zero File-Spam / Zero Blind-Crawling)**:
> 
> 1. **Consulte este mapa antes de qualquer busca**: Nunca faça varreduras recursivas indiscriminadas (`dir -Recurse`, `find`, `grep` em massa) no repositório. Utilize este arquivo para identificar exatamente onde cada funcionalidade, estilo, script ou arquivo de dados se localiza.
> 2. **Atualização incremental obrigatória no mesmo commit**: Sempre que você (agente) criar novos arquivos, mover, renomear, decompor módulos ou alterar a estrutura de seções e modais do `index.html` ou de `src/`, **você deve atualizar as seções correspondentes deste `REPO_MAP.md` no mesmo commit**.
> 3. **Preservação de Integridade**: Mantenha o formato de tabelas, faixas de linhas atualizadas e referências clicáveis.

---

## 🌲 Seção 2 — Árvore Completa de Diretórios e Arquivos

Tamanhos aproximados e papéis de cada arquivo versionado no repositório:

```
site-bm/
│
├── index.html                           [6.7 KB]  # Shell principal da SPA; importa CSS, CDN Chart.js, router JS
├── serve.bat                            [0.3 KB]  # Script de conveniência: inicia servidor local em http://localhost:5500
├── disparar.ps1                         [5.3 KB]  # Script PowerShell: dispara via API do GitHub a Action de sincronização
├── atualizar_jornais.bat                [0.3 KB]  # Atalho para executar disparar.ps1 em ambiente Windows
├── .gitignore                           [0.4 KB]  # Ignora ambientes virtuais, credenciais, temporários e pastas brutas
├── .nojekyll                            [0.0 KB]  # Desativa o processador Jekyll no GitHub Pages (preserva pastas com underline)
├── README.md                            [~7 KB]   # Documentação completa de negócio, arquitetura e instruções
├── REPO_MAP.md                          [~15 KB]  # Este documento: mapa arquitetural vivo e otimizado para IA
│
├── .github/
│   └── workflows/
│       ├── sync_news.yml                [1.4 KB]  # Workflow GitHub Actions: sincroniza jornais do Google Drive diariamente
│       └── update_stats.yml             [1.2 KB]  # Workflow GitHub Actions: raspa dados da EA e processa estatísticas
│
├── config/
│   ├── seasons.json                     [0.6 KB]  # Metadados e datas de corte de cada temporada (fc26, fc27, default)
│   ├── news_index.json                  [1.5 KB]  # Catálogo JSON gerado automaticamente com os nomes de arquivos de jornais
│   ├── fc26/                            # Configurações da temporada EA FC 26 (Histórico)
│   │   ├── club.json                    [0.4 KB]  # Configurações do clube no FC 26: IDs EA, divisão, reputação e torcedores
│   │   └── elenco.json                  [2.5 KB]  # Dicionário do elenco no FC 26: ID EA Sports, posição, instagram, fotos
│   └── fc27/                            # Configurações da temporada EA FC 27 (Atual)
│       ├── club.json                    [0.4 KB]  # Configurações do clube no FC 27: IDs EA, divisão, reputação e torcedores
│       └── elenco.json                  [0.1 KB]  # Dicionário do elenco no FC 27
│
├── data/
│   ├── fc26/                            # Dados históricos da temporada EA FC 26
│   │   ├── manual/                      # Dados manuais de contingência do FC 26
│   │   │   ├── manual_club_stats.json   [0.3 KB]  # Sobrescrita manual das estatísticas totais acumuladas do clube
│   │   │   ├── manual_matches.json      [0.1 KB]  # Partidas adicionadas manualmente quando a API da EA omite jogos
│   │   │   ├── manual_stats.json        [2.7 KB]  # Estatísticas manuais por jogador (usando ID da EA como chave)
│   │   │   └── README.md                [4.1 KB]  # Instruções detalhadas para preenchimento dos arquivos manuais
│   │   ├── processed/                   # Dados higienizados do FC 26 consumidos pelo frontend
│   │   │   ├── elenco_processado.json   [13.5 KB] # Lista completa de atletas com métricas consolidadas e fotos
│   │   │   ├── matches_processado.json  [40.7 KB] # Histórico estruturado de partidas com gols, assistências e MVP
│   │   │   ├── players.json             [3.5 KB]  # Cadastro base dos atletas sincronizado com elenco.json
│   │   │   └── stats.json               [2.4 KB]  # Estatísticas consolidadas do clube e timestamp de atualização
│   │   ├── raw/                         # Extrações brutas da API EA Pro Clubs no FC 26 (ignorado pelo git)
│   │   ├── survey/                      # Dados da pesquisa interna do elenco no FC 26
│   │   │   └── pesquisa.json            [5.6 KB]  # Dados estruturados do Forms: termômetro, premiações, XI ideal
│   │   └── _raw/                        # Arquivos brutos de arquivo e backups do FC 26 (ignorado pelo git)
│   └── fc27/                            # Dados da temporada atual EA FC 27
│       ├── manual/                      # Dados manuais de contingência do FC 27
│       │   ├── manual_club_stats.json   [0.1 KB]  # Sobrescrita manual de estatísticas do clube no FC 27
│       │   ├── manual_matches.json      [0.1 KB]  # Partidas adicionadas manualmente no FC 27
│       │   └── manual_stats.json        [0.1 KB]  # Estatísticas manuais por jogador no FC 27
│       ├── processed/                   # Dados higienizados do FC 27
│       │   ├── elenco_processado.json   [0.1 KB]  # Lista de atletas do FC 27
│       │   ├── matches_processado.json  [0.1 KB]  # Histórico de partidas do FC 27
│       │   └── stats.json               [0.4 KB]  # Estatísticas consolidadas do clube no FC 27
│       ├── raw/                         # Extrações brutas da API EA Pro Clubs no FC 27 (ignorado pelo git)
│       └── survey/                      # Dados da pesquisa do FC 27
│           └── pesquisa.json            [0.1 KB]  # Dados estruturados da pesquisa no FC 27
│
├── logs/
│   ├── sync_news.log                    [1.7 KB]  # Log de execução do pipeline de sincronização de notícias
│   └── update_stats.log                 [0.2 KB]  # Log de execução do pipeline de atualização de estatísticas
│
├── scripts/
│   ├── fetch_ea_data.py                 [8.8 KB]  # Coleta dados nos endpoints públicos da EA Pro Clubs via curl_cffi
│   ├── process_stats.py                 [21.5 KB] # Mescla dados brutos com manual e config/elenco.json gerando data/processed/
│   ├── sync_drive_news.py               [4.9 KB]  # Sincroniza edições de jornais de pastas do Google Drive para src/assets/news/
│   ├── generate_news_index.py           [1.2 KB]  # Varre src/assets/news/ e gera config/news_index.json
│   ├── script_pesquisa_elenco.py        [10.8 KB] # Lê data/raw/*.xlsx, calcula rankings/médias e gera data/survey/pesquisa.json
│   └── requirements.txt                 [0.1 KB]  # Dependências Python (requests, curl_cffi, python-dotenv, openpyxl, pandas)
│
└── src/
    ├── assets/
    │   ├── img/                         # Imagens institucionais e insígnias do jogo
    │   │   ├── EscudoBM.jpeg            [43.0 KB] # Brasão oficial do Baile de Munique
    │   │   ├── estadioBM.png            [2.5 MB]  # Imagem de fundo renderizada do estádio (usada no Hero e no body)
    │   │   ├── estadioBMraw.png         [3.9 MB]  # Imagem em alta resolução do estádio (matriz original)
    │   │   ├── divisao5.png a divisaoElite.png [~80 KB cada] # Emblemas oficiais de cada divisão do Pro Clubs
    │   │   └── reputacao-tier0.png a tier3.png [~15 KB cada] # Insígnias dos níveis de reputação do clube
    │   ├── news/                        # Arquivos das edições de jornais
    │   │   ├── TheFicientsNews/         [~35 arquivos JPG] # Edições regulares, plantões e posters do TheFicients News
    │   │   └── BMNews/                  [vazio por ora]    # Pasta reservada para a editora parceira BMNews
    │   └── players/                     # Pastas individuais de fotos dos atletas
    │       ├── Abreu/                   [~210 KB] # Fotos oficiais do jogador Abreu
    │       ├── Cleiton/                 [~570 KB] # Fotos oficiais do jogador Cleiton
    │       ├── DiLaurentis/             [~1.1 MB] # Fotos oficiais do jogador DiLaurentis
    │       ├── Formiga/                 [pasta reservada]
    │       ├── Gabri/                   [~820 KB] # Fotos oficiais do jogador Gabri
    │       ├── Gaps/                    [~380 KB] # Fotos oficiais do jogador Gaps
    │       ├── Pedrao/                  [~3.0 MB] # Fotos oficiais do jogador Pedrão
    │       ├── Pinto/                   [~300 KB] # Fotos oficiais do jogador Pinto
    │       └── Thiago/                  [~8.1 MB] # Fotos oficiais do jogador Thiago
    │
    ├── css/
    │   ├── main.css                     [8.3 KB]  # Reset global, variáveis CSS (:root / data-theme="light"), container e tipografia
    │   ├── components/
    │   │   ├── buttons.css              [2.8 KB]  # Estilização de botões (.btn, .btn--primary, .floating-live-btn, etc.)
    │   │   ├── cards.css                [3.2 KB]  # Estilos base de cartões, estados vazios (.empty-state) e badges
    │   │   ├── footer.css               [1.3 KB]  # Estilos do rodapé, ícones sociais e status de atualização
    │   │   └── header.css               [4.7 KB]  # Cabeçalho fixo, logo, menu navbar desktop/mobile e alternador de tema
    │   └── pages/
    │       ├── home.css                 [8.0 KB]  # Hero com estádio, barra de divisões, reputação, card de jornal e Twitch
    │       ├── elenco.css               [4.2 KB]  # Grid de atletas, cards expansíveis (.player-card), fotos e stats
    │       ├── jogos.css                [2.5 KB]  # Lista de partidas, filtros (.matches-filter) e cards de placar
    │       ├── estatisticas.css         [3.8 KB]  # Painéis gerais, sanfona retrátil, abas (.stats-tabs) e tabelas de ranking
    │       ├── noticias.css             [9.7 KB]  # Grid de jornais, thumbnails e visualizador Lightbox com sidebar interativa
    │       └── pesquisa.css             [6.1 KB]  # Dashboard interno: termômetro, premiações, campinho 1-4-2-3-1 e gráficos
    │
    └── js/
        ├── app.js                       [11.6 KB] # Núcleo da SPA: roteamento de hash, inicialização de views, tema e live Twitch
        ├── api.js                       [1.9 KB]  # Camada de comunicação assíncrona com cache em memória (Map)
        ├── utils/
        │   └── helpers.js               [4.2 KB]  # Utilitários compartilhados (formatadores, cores por posição, estrelas, spinners)
        └── pages/
            ├── home.js                  [9.4 KB]  # Monta a tela Home (Hero, Divisões, Reputação, Última Edição, Twitch)
            ├── elenco.js                [6.2 KB]  # Monta o plantel (cards expansíveis, ciclo de fotos no clique, links Instagram)
            ├── jogos.js                 [4.6 KB]  # Monta a tela de jogos (filtros interativos, placares e marcadores)
            ├── estatisticas.js          [14.3 KB] # Monta a tela de estatísticas (overview do clube, abas de artilharia, assistências, etc.)
            ├── noticias.js              [23.3 KB] # Monta a galeria de jornais, parser de edições e Lightbox com comentários/likes
            └── pesquisa.js              [10.2 KB] # Monta o dashboard da pesquisa de elenco, campinho tático e gráficos Chart.js
```

---

## 🧭 Seção 3 — Mapa de Seções e Modais do `index.html`

O `index.html` atua como o casulo estático da Single Page Application (SPA). As seções de conteúdo são instanciadas e controladas dinamicamente pelo router em `src/js/app.js`.

### 3.1 Estrutura Declarada no `index.html`

| Elemento / Bloco | ID Principal DOM | Linha Início | Linha Fim | Papel & Comportamento |
| :--- | :--- | :---: | :---: | :--- |
| `<head>` | — | `L1` | `L28` | Meta tags, correção de slash do GitHub Pages (`L8-11`), import dos 11 arquivos CSS (`L14-26`) |
| **Cabeçalho Principal** | `<header class="header">` | `L30` | `L62` | Topo fixo da aplicação |
| ├── Logotipo & Nome | `.logo-container` | `L32` | `L36` | Escudo do clube e âncora navegável para `#home` |
| ├── Menu de Navegação | `.navbar` | `L38` | `L47` | Lista de links com atributo `data-route`: `home`, `elenco`, `noticias`, `jogos`, `estatisticas`, `pesquisa` |
| ├── Alternador de Tema | `#theme-toggle` | `L50` | `L53` | Botão Dark/Light com ícones `#theme-icon-sun` e `#theme-icon-moon` |
| └── Botão Hambúrguer Mobile | `.hamburger` | `L55` | `L59` | Gatilho para abrir o menu gaveta (*drawer*) em telas menores que 768px |
| **Container Central (SPA)** | `#app-content` | `L65` | `L70` | Ponto de montagem de todas as rotas da SPA |
| └── View Inicial (Home) | `#home-view` | `L66` | `L69` | Marcador inicial da rota Home (substituído pelo render dinâmico de `home.js`) |
| **Rodapé Global** | `<footer class="footer">`| `L72` | `L91` | Rodapé com links de redes sociais e status |
| ├── Redes Sociais | `.footer__socials` | `L73` | `L84` | Links externos oficiais para Instagram (`@bailedemunichofc`) e Twitch (`oboueri`) |
| └── Status de Atualização | `.update-status` | `L87` | `L90` | Elementos `#last-update` (data/hora lida de `stats.json`) e `#update-error` (alerta de falha) |
| **Scripts** | — | `L93` | `L97` | CDN do Chart.js v4.4.4 (`L94`) e carregamento do roteador modular `src/js/app.js` (`L96`) |

---

### 3.2 Seções Dinâmicas Criadas via JavaScript (`src/js/app.js` e páginas)

Todas as views secundárias são garantidas no DOM por `ensureAllViewsExist()` em `src/js/app.js`:

| Rota / Hash | ID da Seção Gerada | Módulo Renderizador | Descrição do Conteúdo Injetado |
| :--- | :--- | :--- | :--- |
| `#home` | `#home-view` | `src/js/pages/home.js` | Hero do estádio, cards de divisão/reputação, última edição de jornal e iframe Twitch |
| `#elenco` | `#elenco-view` | `src/js/pages/elenco.js` | Grid de cards de atletas (`.player-card`) com carrossel de fotos e estatísticas expansíveis |
| `#noticias`| `#noticias-view` | `src/js/pages/noticias.js`| Galerias por editora (`TheFicients News`, `BMNews`) com edições, plantões e posters |
| `#jogos` | `#jogos-view` | `src/js/pages/jogos.js` | Barra de filtros (`#matches-filter`) e lista de cards de partidas (`#matches-list`) |
| `#estatisticas`| `#estatisticas-view`| `src/js/pages/estatisticas.js` | Overview do clube, sanfona `#extra-stats`, tabs de ranking (`#stats-tabs`) e tabelas |
| `#pesquisa`| `#pesquisa-view` | `src/js/pages/pesquisa.js` | Termômetro com estrelas, premiações, prancheta tática 1-4-2-3-1 e gráficos Chart.js |

---

### 3.3 Modais, Drawers e Elementos Flutuantes Injetados no `<body>`

| Componente | ID / Classe DOM | Módulo de Origem | Comportamento e Interatividade |
| :--- | :--- | :--- | :--- |
| **Lightbox de Jornais** | `#lightbox` | `src/js/pages/noticias.js` (L151-182) | Visualizador modal em tela cheia com `#lightbox-img`, zoom no clique (`.is-zoomed`), navegação por `#lb-prev`/`#lb-next`, e fechamento com `Esc` ou `#lightbox-close`. |
| ├── Painel de Reações | `.reactions-panel` | `src/js/pages/noticias.js` | Botões `#btn-like` e `#btn-dislike` conectados ao Google Apps Script com persistência local. |
| └── Sidebar de Comentários | `.comments-section` | `src/js/pages/noticias.js` | Feed `#comments-list` e formulário `#comment-form` para envio e exclusão de comentários do leitor. |
| **Overlay do Menu Mobile** | `.nav-overlay` | `src/js/app.js` (L47-50) | Cortina escura sobreposta quando o menu hambúrguer é aberto; fecha ao ser clicada. |
| **Botão Flutuante Twitch** | `.floating-live-btn` | `src/js/app.js` (L306-314) | Botão flutuante com animação de pulso inserido no canto da tela quando o canal da Twitch estiver transmitindo. |

---

## ⚡ Seção 4 — Mapa de Módulos JS (Exports e Guia Rápido "Onde Mexer")

### 4.1 Inventário de Arquivos JavaScript e Funções Exportadas

| Arquivo | Funções / Constantes Exportadas | Responsabilidade e Fluxo de Negócio |
| :--- | :--- | :--- |
| `src/js/app.js` | • `navigateTo(route, updateHash)`<br>• `ROUTES`<br>• `DEFAULT_ROUTE` | Roteador SPA central: escuta eventos de hash, manipula o histórico do browser, aplica *lazy loading* de rotas, gerencia Dark/Light Mode, abre/fecha menu mobile e checa status ao vivo da Twitch. |
| `src/js/api.js` | • `getStats()`<br>• `getElenco()`<br>• `getPartidas()`<br>• `getPlayersBase()`<br>• `getPesquisa()`<br>• `getPartidasByTipo(tipo)`<br>• `getLastUpdated()`<br>• `invalidateCache(path)` | Camada de dados centralizada: executa requisições `fetch()` para os JSONs estáticos da pasta `data/`, mantendo cache em memória (`Map`) para eliminar requisições redundantes. |
| `src/js/utils/helpers.js` | • `getPosicaoColor(posicao)`<br>• `getResultadoInfo(resultado)`<br>• `formatarData(dataStr)`<br>• `formatMatchType(tipo)`<br>• `renderStars(nota)`<br>• `renderLoading(container, msg)`<br>• `renderError(container, msg)`<br>• `getCapitaniaIcon(capitania)`<br>• `getFotoPath(fotoPasta)` | Biblioteca de utilitários: mapeia cores de posições (GK, ZAG, VOL, MEI, AT), formata datas ISO para pt-BR, gera estrelas de classificação, spinners de carregamento e badges de capitão. |
| `src/js/pages/home.js` | • `renderHome()` | Constrói a tela inicial: carrega configurações de divisão e reputação de `config/club.json`, obtém a última edição de notícias de `config/news_index.json` e embute o player de transmissão da Twitch. |
| `src/js/pages/elenco.js` | • `renderElenco()` | Renderiza a lista de atletas a partir de `data/processed/elenco_processado.json`. Implementa rotação cíclica de fotos no clique e expansão dos cartões de métricas individuais. |
| `src/js/pages/jogos.js` | • `renderUltimosJogos()` | Renderiza o histórico de jogos de `data/processed/matches_processado.json`, gerencia botões de filtro de categorias e formata placares e autores dos gols. |
| `src/js/pages/estatisticas.js` | • `renderEstatisticas()` | Exibe o resumo do clube, aciona o botão de sanfona ("Ver mais estatísticas") e controla o alternador de abas de ranking (Artilharia, Assistências, G+A, MVPs, Tabela Completa). |
| `src/js/pages/noticias.js` | • `renderNoticias()`<br>• `parseEdition(filename)`<br>• `ordenarEdicoes(lista)`<br>• `BASE_PATH_THEFICIENTS` | Catálogo e galeria de jornais: faz o parsing de nomes de arquivos, ordena por data/edição, monta a galeria em cards e gerencia todo o ciclo de vida do Lightbox com reações e comentários. |
| `src/js/pages/pesquisa.js` | • `renderPesquisa()` | Constrói o dashboard interno da pesquisa: termômetro, premiações de consistência e evolução, prancheta com o campinho tático 1-4-2-3-1 e instanciação dos gráficos com Chart.js. |

---

### 4.2 Guia Rápido "Onde Mexer" (Índice de Tarefas Comuns)

| Objetivo da Manutenção | Arquivo(s) a Editar | Detalhes da Ação |
| :--- | :--- | :--- |
| **Alterar divisão atual ou nível de reputação** | `config/fc27/club.json`<br>*(ou `config/fc26/club.json`)* | Modifique os campos `divisaoAtual` (número de 0 a 5) ou `reputacaoNivel` (número). |
| **Forçar status de Live da Twitch para Ativo** | `config/fc27/club.json`<br>*(ou `config/fc26/club.json`)* | Defina `"ao_vivo": true` para exibir o botão flutuante mesmo que a API DecAPI falhe. |
| **Adicionar novo jogador ou alterar dados cadastrais** | `config/fc27/elenco.json`<br>*(ou `config/fc26/elenco.json`)* | Adicione a chave `"Nome (#Número)"` com `ea_id`, `posicao`, `instagram`, `capitania` e `foto_pasta`. |
| **Adicionar novas fotos de um atleta** | `src/assets/players/<Nome>/` | Salve a imagem na pasta do atleta e certifique-se de que o nome conste no processamento ou em `config/<temporada>/elenco.json`. |
| **Corrigir estatísticas quando a API da EA estiver fora do ar** | `data/<temporada>/manual/manual_stats.json` | Insira o ID da EA do jogador como chave e preencha jogos, vitórias, gols, passes e assistências (ver README em `manual/`). |
| **Inserir manualmente uma partida que a EA não contabilizou** | `data/<temporada>/manual/manual_matches.json` | Adicione um novo objeto com `match_id`, placar, marcadores, assistentes e `mvp`. |
| **Corrigir totais gerais de partidas/gols do clube** | `data/<temporada>/manual/manual_club_stats.json` | Ajuste os campos `total_partidas`, `vitorias`, `gols_marcados`, etc. |
| **Publicar novas edições de jornais manualmente** | `src/assets/news/TheFicientsNews/` | Salve a imagem seguindo o padrão `edicaoXX_YYYY-MM-DD_Titulo.jpg` e execute `python scripts/generate_news_index.py`. |
| **Adicionar nova rota ou página na SPA** | `index.html`<br>`src/js/app.js` | 1. Adicione o link `<a href="#nova" data-route="nova">` no `index.html`.<br>2. Inclua `'nova'` na constante `ROUTES` em `src/js/app.js`.<br>3. Crie `src/js/pages/nova.js` e adicione seu renderizador no `switch` de `renderRoute()`. |
| **Alterar cores institucionais ou variáveis de tema** | `src/css/main.css` | Edite as variáveis CSS no bloco `:root` (tema escuro padrão) ou no bloco `[data-theme="light"]` (tema claro). |
| **Modificar aparência do cabeçalho ou menu móvel** | `src/css/components/header.css` | Ajuste regras de layout da classe `.header`, do menu `.navbar` ou da gaveta móvel `.nav-links`. |
| **Ajustar cards ou animações do Elenco** | `src/css/pages/elenco.css`<br>`src/js/pages/elenco.js` | Edite as classes `.player-card`, `.is-expanded` ou o template retornado por `buildPlayerCard()`. |
| **Ajustar layout do campinho tático** | `src/css/pages/pesquisa.css`<br>`src/js/pages/pesquisa.js` | Modifique as classes `.campinho`, `.campinho__linha` e a função `buildCampinho()`. |
| **Ajustar raspagem da API oficial da EA Sports** | `scripts/fetch_ea_data.py` | Modifique os parâmetros de requisição, headers ou tratamento de status code na classe `API`. |
| **Ajustar regras de consolidação e cálculo de stats** | `scripts/process_stats.py` | Altere o cálculo de médias, taxas de aproveitamento ou a lógica de mesclagem de dados manuais. |

---

## 🎨 Seção 5 — Mapa de Arquivos CSS

Todas as folhas de estilo estão desacopladas por responsabilidade em `src/css/`:

| Arquivo CSS | Escopo / Seletor Principal | Responsabilidade e Componentes Estilizados |
| :--- | :--- | :--- |
| `src/css/main.css` | `*`, `:root`, `body`, `.container` | Reset universal do box model, tipografia principal (`Segoe UI`, `Inter`), paleta de variáveis CSS (cores, sombras, raios de borda, espaçamentos), background do estádio, spinners de carregamento (`.spinner`, `.loading-wrapper`) e estados vazios globais. |
| `src/css/components/header.css` | `.header`, `.navbar`, `.hamburger`, `.theme-toggle` | Cabeçalho fixo no topo (`sticky`), centralização da logo do clube, menu de links de navegação, transição de drawer mobile (largura `< 768px`), cortina escura `.nav-overlay` e botão de alternância Dark/Light. |
| `src/css/components/footer.css` | `.footer`, `.footer__socials`, `.update-status` | Rodapé com fundo contrastante, ícones de redes sociais com hover suave e linha informativa da última sincronização do GitHub Actions com alerta de erro. |
| `src/css/components/buttons.css` | `.btn`, `.btn--primary`, `.btn--outline`, `.btn--instagram`, `.btn--twitch`, `.floating-live-btn` | Sistema consistente de botões: primário (vermelho do clube), contorno vazado, gradiente do Instagram, roxo da Twitch, botões de ação do Lightbox e botão flutuante com animação de pulso para live online. |
| `src/css/components/cards.css` | `.card`, `.badge`, `.empty-state`, `.posicao-pill` | Moldura padrão de cartões com cantos arredondados e sombra, etiquetas com cores contextuais (`badge--blue`, `badge--red`, `badge--green`) e pílulas identificadoras de posições de jogadores. |
| `src/css/pages/home.css` | `.home-hero`, `.status-grid`, `.divisions-track`, `.reputation-card`, `.latest-news-card` | Banner Hero temático com overlay em gradiente e imagem do estádio, linha de progresso da subida de divisão, card com insígnia de reputação e torcida, card destacado da última edição e iframe da Twitch responsivo (proporção 16:9). |
| `src/css/pages/elenco.css` | `.elenco-grid`, `.player-card`, `.player-card__photo`, `.stat-row` | Grid responsivo de jogadores, transição suave para card expandido (`.is-expanded`), foto do atleta com indicação de clique para fotos adicionais, badges de capitania sobrepostas e lista de métricas táticas. |
| `src/css/pages/jogos.css` | `.matches-filter`, `.match-card`, `.match-card__scoreline`, `.scorer-row` | Botões de filtro de modalidade de partida, card de resultado com borda e badge colorida por desfecho (vitória em verde, empate em amarelo, derrota em vermelho), placar centralizado e lista de marcadores. |
| `src/css/pages/estatisticas.css` | `.stats-overview`, `.stats-tabs`, `.tab-btn`, `.stats-table`, `.table-wrapper` | Cartões de métricas consolidadas do clube, sanfona para estatísticas adicionais, botões de abas com indicador ativo, tabelas com suporte a rolagem horizontal em telas móveis e destaque da linha do 1º colocado. |
| `src/css/pages/pesquisa.css` | `.termometro-grid`, `.premiacoes-grid`, `.campinho`, `.campinho__jogador`, `.grafico-container` | Cards de autoavaliação com estrelas, cards de premiações de elenco, campo tático estilizado em verde gramado com posições demarcadas para o esquema 1-4-2-3-1 e containers responsivos para os gráficos Chart.js. |
| `src/css/pages/noticias.css` | `.editora-bloco`, `.noticias-grid`, `.noticia-card`, `.lightbox`, `.lightbox__content-wrapper` | Galeria de jornais com thumbnails de alta definição, efeito de zoom na miniatura, visualizador modal Lightbox em tela cheia com zoom ao clicar, navegação por setas e painel lateral com likes e comentários da torcida. |

---

*Mapa mantido pela equipe de desenvolvimento e agentes autônomos do Baile de Munique FC.*