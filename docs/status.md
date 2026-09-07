**Estado Atual do Projeto: Baile de Munique**

**1. Infraestrutura (Concluído)**
* Repositório local inicializado e `.gitignore` configurado para proteger o ambiente virtual.
* Credenciais locais do Git vinculadas com sucesso à conta exclusiva do clube para o FC26[cite: 1].

**2. Automação e Arquitetura (Concluído)**
* Arquivo do GitHub Actions (`update_stats.yml`) criado, configurado para executar o *cron job* diariamente às 02h00.
* Estrutura de diretórios estabelecida: pasta `src/` isolando o frontend, com automação em Python alocada na raiz.

**3. Backend e Scripts (Em Progresso)**
* Arquivo `requirements.txt` estruturado com as dependências `requests` e `python-dotenv`.
* **Próximo Passo Imediato:** Iniciar o desenvolvimento do script `fetch_ea_data.py` para extrair os dados da API de leaderboards.
* **Pendente:** Criar dicionários no Python para traduzir as IDs de rede para a identidade interna dos líderes da equipe, como Thiago (#8), Gaps (#10) e Abreu (#15)[cite: 1].
* **Pendente:** Implementar a lógica de correção das posições de origem (ex: VOL para LD ou ZGE) para refletir com precisão as atuações na tática 1-4-2-3-1[cite: 1], corrigindo os dados de jogadores improvisados como Pedrão (#5), DiLaurentis (#19) e Cleiton (#30)[cite: 1].

**4. Frontend e UI (Pendente)**
* Esqueleto do `index.html` mapeado, aguardando implementação prática.
* Aplicação do CSS base, que deverá utilizar o vermelho e o branco como cores primárias e o azul para os destaques, harmonizando com o escudo do copo de cerveja[cite: 1].