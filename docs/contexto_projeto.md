# Documento de Contexto: Site do Baile de Munique

## 1. Visão Geral e Identidade Visual
* **Clube:** Baile de Munique, equipe do modo Pro Clubs no FC26.
* **Escudo:** Copo de cerveja centralizado, envolvido por um círculo interno azul e um anel externo vermelho.
* **Cores e UI:** Primárias em vermelho e branco; detalhes e destaques em azul. Visual moderno e suave (sem modo escuro). Design com foco total em Mobile-first.
* **Redes Sociais:** O Instagram da equipe (@bailedemunichofc) é a vitrine oficial do roleplay: https://www.instagram.com/bailedemunichofc/
* **Tática Padrão:** O time se organiza na formação 1-4-2-3-1.

## 2. Estrutura do elenco
O mapeamento entre a ID oficial da EA e a identidade interna será gerenciado via dicionário no Python ou mapeado no JSON. A escolha das fotos para os cards será feita manualmente.
* **Thiago (#8):** MEI, 1º Capitão.
* **Abreu (#15):** VOL (Origem: CA/VOL), 2º Capitão.
* **Gaps (#10):** CA, 3º Capitão.
* **Pedrão (#5):** LD (Origem: VOL).
* **DiLaurentis (#19):** ZAG (Origem: VOL).
* **Pinto (#23):** PE (Origem: PE).
* **Gabri (#27):** PD (Origem: MEI).
* **Cleiton (#30):** VOL (Origem: PD/VOL).
* **Formiga (#69):** PD (Origem: PD).

## 3. Arquitetura e Stack Tecnológica
* **Frontend:** HTML, CSS e JavaScript puro (Vanilla).
* **Backend/Coleta de Dados:** Scripts em Python consumindo a API não oficial de leaderboards da EA.
* **Hospedagem e Automação:** GitHub Pages para o site; GitHub Actions executando um *cron job* diário às 02h00 da manhã.
* **Banco de Dados:** Arquivos `.json` armazenados e atualizados diretamente na pasta do repositório.
* **Imagens:** Hospedadas no próprio repositório, sem restrição inicial de peso.

## 4. Regras de Negócio e Dados
* **Nomes:** É preciso registrar junto com os dados de cada jogador, seu ID oficial da EA relacionado.
* **Posições:** A EA registra a posição de atuação real na partida ("goalkeeper", "defender", "midfielder", "forward") e o arquétipo. Como cada jogador atua em apenas uma posição por partida, posições divididas no elenco servem apenas como contexto de versatilidade.
* **Notícias:** O sistema suportará categorias/editoriais flexíveis (ex: pós-jogo, mercado), permitindo a inclusão de novas editorias no futuro.
* **Gatilho:** A atualização é restrita à automação cronometrada (ou execução privada), sem botões públicos na interface para evitar sobrecarga.

## 5. Requisitos Funcionais
* **Estatísticas Multinível:**
  1. **Visão do Clube:** Totais gerais (partidas, gols marcados, gols sofridos).
  2. **Resumo do Elenco:** Rankings internos (artilheiros, líderes de assistência).
  3. **Visão Individual:** Resumo do jogador com botão para expandir os números completos.
  * *Extra:* Gráficos de tendência (funcionalidade futura). Filtros combinados ativos em todas as telas.
* **Últimos Jogos:** Card contendo adversário, placar final, marcadores, assistentes, MVP e seletor de tipo de jogo (Liga vs. Amistoso).
* **Feedback de Atualização:** A interface deve exibir a data da última atualização do JSON. Caso o script Python falhe no Actions, um indicador visual de erro deve ser exibido ao lado desta data.

## 6. Estrutura de Diretórios Sugerida
```text
site-bm/
├── .github/
│   └── workflows/
│       └── update_stats.yml      # Cron job configurado para as 02h00
├── docs/
│   └── contexto_projeto.md               # Markdown descrevendo todas as funcionalidades do projeto
│   └── status.md                 # Markdown de rastreabilidade do estado de desenvolvimento do projeto
├── data/
│   ├── players.json              # Mapeamento do elenco e metadados
│   ├── stats.json                # Banco de dados de estatísticas
│   └── matches.json              # Histórico de partidas
├── scripts/
│   ├── fetch_ea_data.py          # Script Python que raspa a API
│   ├── process_stats.py          # Script de cálculo e formatação
│   └── requirements.txt          # Dependências do Python (ex: requests)
├── src/
│   ├── css/
│   │   ├── main.css              # Estilos globais e variáveis de cores
│   │   └── components.css        # Estilos dos cards, navbar, tabelas
│   ├── js/
│   │   ├── app.js                # Lógica principal, rotas simples e eventos
│   │   ├── api.js                # Funções de fetch() para ler os JSONs
│   │   └── ui.js                 # Funções de renderização no DOM
│   └── assets/
│       ├── img/                  # Escudo e identidade visual
│       ├── players/              # Fotos manuais do elenco
│       └── news/                 # Capas de jornais fictícios
├── index.html                    # Ponto de entrada (Single Page ou Multi-page)
└── .gitignore
```