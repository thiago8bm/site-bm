# ⚽ Baile de Munique — Portal Oficial do Clube (EA FC 26 Pro Clubs)

Bem-vindo ao repositório do portal oficial do **Baile de Munique (BM)**, equipe competitiva de EA SPORTS FC 26 Pro Clubs. Este projeto reúne estatísticas em tempo real, galeria histórica de edições de jornais esportivos, controle tático do elenco, dashboard de pesquisas internas e integração com transmissões ao vivo.

O site foi desenvolvido como uma **Single Page Application (SPA) nativa** em HTML5, CSS3 modular e JavaScript moderno (ES Modules), sem dependência de frameworks pesados no cliente, garantindo carregamento instantâneo, alta performance e fácil manutenção.

---

## 🚀 Visão Geral do Sistema & Principais Funcionalidades

O portal é estruturado em rotas dinâmicas via hash (`#home`, `#elenco`, `#noticias`, `#jogos`, `#estatisticas`, `#pesquisa`) com carregamento sob demanda (*lazy rendering*):

> **Multi-temporada (FC 27 / FC 26)**: todas as views refletem a temporada selecionada, exibem *empty states* com atalho para o histórico do EA FC 26 quando não há dados do FC 27 e a página de Notícias possui filtros por versão (Todas / EA FC 27 / EA FC 26), mês/período e ordenação.

1. **🏠 Home (Visão Geral do Clube)**
   - **Hero Temático**: Apresentação visual imersiva com imagem do estádio do clube, escudo oficial, redes sociais integradas e indicação do esquema tático padrão (1-4-2-3-1).
   - **Escalada de Divisões**: Barra visual de progresso que rastreia a ascensão do clube da Divisão 5 até a cobiçada Divisão Elite.
   - **Nível de Reputação**: Exibição da contagem total de torcedores, nível atual e classificação (*Emergente*, *Conhecido*, *Orgulho da cidade*, *Famoso mundialmente*).
   - **Destaque da Última Edição**: Chamada com card dinâmico para a edição mais recente publicada da imprensa esportiva.
   - **Transmissões ao Vivo**: Player embutido da Twitch (`oboueri`) para acompanhar partidas ao vivo, além de badge flutuante (*"ESTAMOS AO VIVO"*) quando a live estiver ativa.

2. **👕 Elenco (Plantel & Atletas)**
   - Grid interativo de atletas com número da camisa, badges de capitania (1º, 2º e 3º Capitão) e cores por posição tática.
   - **Carrossel interativo de fotos**: Clique na imagem do jogador para alternar entre diferentes fotos oficiais (apresentação, treino, campo, assinatura de contrato).
   - **Estatísticas detalhadas**: Expansão do card para visualizar partidas, gols, assistências, MVPs, nota média, aproveitamento (% de vitória), taxa de passes, desarmes e jogos sem sofrer gol (*clean sheets* para zagueiros e goleiros).
   - Link direto para o perfil oficial de cada jogador no Instagram.

3. **📰 Notícias (Imprensa Esportiva & Lightbox Interativo)**
   - Cobertura da imprensa esportiva do clube dividida entre editoras parceiras: **TheFicients News** e **BMNews**.
   - Categorização automática em **Edições Regulares**, **Plantões de Notícias** e **Posters Comemorativos**.
   - **Visualizador em Tela Cheia (Lightbox)**:
     - Navegação por setas (anterior/próximo e atalhos no teclado `←` `→` `Esc`).
     - Zoom de alta resolução no clique para leitura facilitada dos textos das edições.
     - Painel lateral interativo de **Reações (Likes/Dislikes)** e **Comentários da Torcida** em tempo real integrado via Google Apps Script e persistido no `localStorage`.

4. **⚽ Últimos Jogos (Histórico de Partidas)**
   - Feed completo das partidas disputadas pelo Baile de Munique na temporada.
   - Filtros rápidos por tipo de jogo: **Liga**, **Playoffs**, **Amistosos** ou **Todas**.
   - Cards com placar detalhado, adversário, data formatada, lista de marcadores com múltiplos gols, assistentes e jogador eleito MVP (*Craque do Jogo*).

5. **📊 Estatísticas (Desempenho Coletivo & Rankings)**
   - **Overview do Clube**: Painel com total de jogos, vitórias, empates, derrotas, aproveitamento, gols pró, gols contra, saldo e média de gols por jogo.
   - **Painel Sanfona**: Botão retrátil *"Ver mais estatísticas"* para métricas avançadas (jogos sem sofrer gols, classificação de habilidade, histórico de divisão).
   - **Rankings em Abas**:
     - 📊 *Resumo Geral*: Tabela condensada de todos os atletas ativos.
     - ⚽ *Artilharia*: Classificação dos maiores goleadores da temporada.
     - 🅰️ *Assistências*: Líderes em passes para gol.
     - 🎯 *G+A*: Participações diretas em gols somadas.
     - ⭐ *MVPs*: Ranking de prêmios de melhor em campo.
     - 📋 *Completo*: Tabela analítica completa com taxa de finalização, precisão de passes, desarmes, cartões e estatísticas defensivas.

6. **🔍 Pesquisa de Elenco (Dashboard Interno do Time)**
   - **Termômetro do Elenco**: Comparativo entre a percepção média coletiva e a autoavaliação dos atletas (escala de 1 a 5 estrelas) com alerta automático de *outliers*.
   - **Premiações Internas**: Jogadores eleitos como *Mais Consistentes*, *Mais Decisivos* e *Mais Evoluíram*, além de acompanhamento reservado de quem precisa evoluir.
   - **Campinho Tático (1-4-2-3-1)**: Visualização posicional do XI titular ideal votado democraticamente pelo plantel.
   - **Coringas por Setor**: Relação dos atletas mais versáteis do clube por setor do campo.
   - **Gráficos Chart.js**: Gráfico de barras horizontal com a votação para capitania e gráfico de rosca (*doughnut*) com as posições favoritas do elenco.

7. **🌓 Tema Claro / Escuro (Dark & Light Mode)**
   - Sistema de alternância de temas via botão no cabeçalho com persistência automática no `localStorage`.

8. **🎮 Seletor de Temporada / Versão do Jogo (FC 27 & FC 26)**
   - Alternância ágil entre a temporada atual (EA FC 27) e os registros históricos da temporada anterior (EA FC 26) diretamente pelo cabeçalho.

---


## ?? Testes Automatizados

```bash
python tests/test_01_integrity.py     # integridade de configs/dados/assets
python tests/test_02_pipeline_e2e.py  # pipeline ETL + simula??o FC27 (restaura o estado ao final)
python tests/test_03_frontend_spa.py  # abre tests/runner_frontend.html em http://localhost:5500
```

O `process_stats.py` inclui automaticamente (Auto-Discovery) membros da EA ausentes em `config/<season>/elenco.json` (desativado no FC26, arquivo hist?rico).

O `fetch_ea_data.py` tamb?m coleta `clubs/info`, `clubs/overallStats` e `members/career/stats` (em `data/<season>/raw/`) e atualiza `divisaoAtual` e `reputacaoTier` em `config/<season>/club.json`. O `process_stats.py` consolida o `stats.json` com a preced?ncia *manual > overallStats da EA > soma das partidas*. `torcedores` e `reputacaoNivel` n?o existem na API da EA e continuam manuais. O agendamento di?rio (`cron`) do workflow `update_stats.yml` permanece desativado at? o clube do FC 27 ser criado.

## 🏛️ Arquitetura do Projeto

O repositório é concebido com separação rigorosa entre camada de apresentação (HTML/CSS/JS nativos), camada de configuração, pipeline de extração e dados processados em JSON:

```
site-bm/
├── index.html                   # Casca da SPA (HTML principal na raiz do projeto)
├── favicon.ico                  # Ícone oficial multi-resolução transparente da aba (16x16 a 64x64)
├── favicon.png                  # Ícone oficial em PNG com transparência e recorte circular
├── serve.bat                    # Atalho para servidor de desenvolvimento local
├── disparar.ps1                 # Script para acionar GitHub Actions localmente
├── atualizar_jornais.bat        # Atalho de sincronização rápida de jornais
├── README.md                    # Documentação geral do sistema
│
├── docs/                      # Configurações declarativas de negócio
│   └── REPO_MAP.md                  # Mapa vivo do repositório para devs e agentes IA
│
├── config/                      # Configurações declarativas de negócio
│   ├── seasons.json             # Metadados e datas de corte de cada temporada (fc26, fc27, default)
│   ├── news_index.json          # Índice compilado dos arquivos de notícias/jornais
│   ├── fc26/                    # Configurações da temporada histórica EA FC 26
│   │   ├── club.json            # Status da divisão, reputação, torcedores, live e EA club ID
│   │   └── elenco.json          # Mapeamento oficial dos jogadores do FC 26
│   └── fc27/                    # Configurações da temporada ativa EA FC 27
│       ├── club.json            # Status e configurações do clube no FC 27
│       └── elenco.json          # Mapeamento do elenco do FC 27
│
├── data/                        # Dados estruturados multi-temporada
│   ├── fc26/                    # Dados históricos da temporada EA FC 26
│   │   ├── manual/              # Dados manuais de contingência (sobrescrevem dados automáticos)
│   │   ├── processed/           # JSONs sanitizados consumidos pelo frontend
│   │   ├── raw/                 # JSONs brutos da API Pro Clubs da EA (ignorado no git)
│   │   ├── survey/              # JSON processado da pesquisa de elenco
│   │   └── _raw/                # Arquivos brutos adicionais e backups (ignorado no git)
│   └── fc27/                    # Dados da temporada ativa EA FC 27
│       ├── manual/              # Dados manuais de contingência do FC 27
│       ├── processed/           # JSONs sanitizados consumidos pelo frontend
│       ├── raw/                 # JSONs brutos da API Pro Clubs do FC 27 (ignorado no git)
│       └── survey/              # JSON processado da pesquisa de elenco do FC 27
│
├── scripts/                     # Automações em Python (ETL e integrações)
│   ├── test_endpoints.py        # Diagnóstico e testes automatizados de endpoints externos (EA FC 27, GAS, Twitch)
│   ├── fetch_ea_data.py         # Coleta dados da EA (--season; le config/<season>/club.json)
│   ├── process_stats.py         # Higieniza estatísticas e cruza com config/<season>/elenco.json (--season)
│   ├── sync_drive_news.py       # Baixa novos jornais do Google Drive via API
│   ├── generate_news_index.py   # Compila a lista de jornais em config/news_index.json
│   ├── script_pesquisa_elenco.py# Processa a planilha de pesquisa do Forms
│   └── requirements.txt         # Dependências dos scripts Python
│
├── src/                         # Código-fonte do cliente (Frontend)
│   ├── assets/                  # Mídias estáticas
│   │   ├── img/                 # Escudo, brasões de divisão, estádio e insígnias
│   │   ├── news/                # Jornais divididos por editora (TheFicientsNews, BMNews)
│   │   └── players/             # Fotos dos jogadores organizadas em subpastas individuais
│   ├── css/                     # Estilos modularizados
│   │   ├── main.css             # Reset, variáveis globais (:root / light mode) e tipografia
│   │   ├── components/          # Estilos de botões, cards, header e footer
│   │   └── pages/               # Estilos específicos de cada seção da aplicação
│   └── js/                      # Lógica JavaScript (ES Modules nativos)
│       ├── app.js               # Router SPA, tema, controle de cabeçalho e inicializador
│       ├── api.js               # Camada de fetch assíncrono com cache em memória
│       ├── pages/               # Renderizadores específicos de cada tela
│       └── utils/               # Funções auxiliares (cores, datas, badges, loaders)
│
└── .github/workflows/           # Automação de CI/CD (GitHub Actions)
    ├── sync_news.yml            # Sincronização automática diária de jornais do Drive
    └── update_stats.yml         # Raspagem e processamento automatizado para EA FC 27
```

---

## 🛠️ Como Executar em Modo de Desenvolvimento

Como o projeto é uma SPA nativa construída em ES Modules (`type="module"`), os arquivos devem ser servidos via protocolo HTTP/HTTPS (e não diretamente por `file:///`) para que os navegadores permitam requisições `fetch()` e importações de módulos.

> [!IMPORTANT]
> O servidor HTTP deve sempre ser iniciado **na raiz do projeto (`site-bm/`)**, onde reside o arquivo `index.html`.

### Opção 1: Usando o arquivo de lote `serve.bat` (Recomendado para Windows)
Dê um duplo clique no arquivo `serve.bat` localizado na raiz do projeto, ou execute no terminal:
```powershell
.\serve.bat
```
O script iniciará um servidor HTTP local em `http://localhost:5500` e abrirá seu navegador padrão automaticamente.

### Opção 2: Usando o servidor HTTP nativo do Python
Se você possui Python instalado, abra o terminal na pasta raiz do projeto e execute:
```bash
python -m http.server 5500
```
Em seguida, acesse no navegador: [http://localhost:5500](http://localhost:5500)

### Opção 3: Usando a extensão Live Server (VS Code / Antigravity)
1. Abra a pasta raiz `site-bm/` na sua IDE.
2. Clique com o botão direito no arquivo `index.html` e selecione **"Open with Live Server"**.
3. O servidor subirá automaticamente em uma porta local (geralmente `5500`).

---

## 🐍 Execução dos Scripts de Dados (Python)

Caso queira atualizar os dados de estatísticas ou reprocessar planilhas localmente:

1. **Instale as dependências Python**:
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. **Para atualizar dados da EA Sports Pro Clubs**:
   ```bash
   python scripts/fetch_ea_data.py --season fc27   # FC26 exige --force (API encerrada)
   python scripts/process_stats.py --season fc27   # fc26 ou fc27
   ```

3. **Para diagnosticar endpoints e APIs integradas**:
   ```bash
   python scripts/test_endpoints.py              # Diagnóstico completo com relatório no terminal
   python tests/test_04_endpoints_diagnostic.py  # Execução via suite de testes
   ```

4. **Para reprocessar a pesquisa de elenco**:
   ```bash
   python scripts/script_pesquisa_elenco.py
   ```

5. **Para reindexar a pasta de notícias e jornais**:
   ```bash
   python scripts/generate_news_index.py
   ```

---

## ☁️ Automação e Deploy (GitHub Actions & Pages)

O repositório é configurado para hospedagem estática no **GitHub Pages** a partir do branch `main`.

- **Sincronização de Estatísticas**: O workflow `.github/workflows/update_stats.yml` executa os scripts de raspagem e processamento para a temporada atual (`--season fc27`), atualiza `data/fc27/processed/`, `config/fc27/club.json` e commita os dados automaticamente.
- **Sincronização de Notícias**: O workflow `.github/workflows/sync_news.yml` consulta o Google Drive da equipe diariamente via Service Account, baixa edições recentes para `src/assets/news/`, reconstrói `config/news_index.json` e publica as novidades.
- **Disparo Manual Local**: O script `disparar.ps1` (ou `atualizar_jornais.bat`) permite solicitar ao GitHub Actions uma sincronização imediata através da API do GitHub.

---

## 📄 Licença e Direitos

Projeto mantido pela diretoria do **Baile de Munique FC**. Todos os direitos reservados.
Escudo e identidade visual pertencem à comunidade Baile de Munique. Imagens de jornais de cortesia da redação do *TheFicients News*.