# Documentação: Dados Manuais

Esta pasta (`data/manual/`) é utilizada para inserir estatísticas e partidas manualmente quando a API da EA Sports estiver com problemas. Os dados inseridos aqui têm **prioridade máxima** e irão sobrescrever as informações obtidas automaticamente.

---

## 1. `manual_stats.json`

Este arquivo é utilizado para atualizar os dados gerais de cada jogador (exatamente como aparecem na tela de estatísticas do clube no jogo).

### Como preencher:
Você deve usar a **ID da EA** do jogador como chave e preencher os dados correspondentes. Se você não souber a ID da EA, pode verificar no arquivo `config/elenco.json`.

Exemplo de formato:
```json
{
    "Thiago_Souza108": {
        "gamesPlayed": 238,
        "winRate": 49,
        "goals": 84,
        "assists": 154,
        "cleanSheetsDef": 0,
        "cleanSheetsGK": 0,
        "shotSuccessRate": 32,
        "passesMade": 3640,
        "passSuccessRate": 73
    }
}
```

### Explicação dos Campos:
- `gamesPlayed`: Total de partidas jogadas (PJ).
- `winRate`: Porcentagem de vitórias (%V). Informe apenas o número (ex: 49 para 49%).
- `goals`: Total de gols marcados (GOLS).
- `assists`: Total de assistências (AST).
- `cleanSheetsDef`: Jogos sem sofrer gol atuando como defensor (SGD).
- `cleanSheetsGK`: Jogos sem sofrer gol atuando como goleiro (SGG).
- `shotSuccessRate`: Taxa de sucesso nos chutes / Finalizações certas (%FC). Informe apenas o número.
- `passesMade`: Total de passes realizados (P).
- `passSuccessRate`: Porcentagem de passes certos (%P). Informe apenas o número.

---

## 2. `manual_matches.json`

Este arquivo é utilizado para adicionar o histórico de partidas no site manualmente. Deve ser uma **lista (array)** contendo os objetos das partidas.

### Como preencher:
Para adicionar partidas, coloque os dados entre chaves `{}` separando cada partida por vírgula dentro dos colchetes `[]`. O arquivo começa apenas com `[]` quando estiver vazio.

Exemplo de formato:
```json
[
    {
        "match_id": "manual_1",
        "timestamp": 1726704000,
        "tipo": "leagueMatch",
        "adversario": "Exemplo FC",
        "placar_nos": 3,
        "placar_adv": 1,
        "resultado": "vitoria",
        "marcadores": [
            {"nome": "Gaps", "gols": 2}, 
            {"nome": "Thiago", "gols": 1}
        ],
        "assistentes": [
            {"nome": "Abreu", "assists": 1}
        ],
        "mvp": "Thiago"
    }
]
```

### Explicação dos Campos:
- `match_id`: ID único para a partida. Sempre inicie com `manual_` seguido de um número (ex: `manual_1`, `manual_2`) para evitar duplicação.
- `timestamp`: Código de tempo da partida em formato Unix (ex: `1726704000`). Pode usar sites como *unixtimestamp.com* para gerar um código para a data e hora desejada, ou apenas estimar um.
- `tipo`: Tipo da partida. Opções válidas: `"leagueMatch"` (Partida da Liga), `"playoffMatch"` (Playoffs) ou `"friendlyMatch"` (Amistoso).
- `adversario`: Nome do clube adversário (ex: `"Real Madrid"`).
- `placar_nos`: Quantos gols o Baile de Munique fez (ex: `3`).
- `placar_adv`: Quantos gols o adversário fez (ex: `1`).
- `resultado`: Resultado da partida. Opções válidas: `"vitoria"`, `"empate"` ou `"derrota"`.
- `marcadores`: Lista dos jogadores que fizeram gol. O `"nome"` deve ser o nome de display do jogador. O `"gols"` é a quantidade. Se ninguém fez gol, deixe vazio `[]`.
- `assistentes`: Semelhante aos marcadores, informando as assistências da partida. Se ninguém deu assistência, deixe `[]`.
- `mvp`: Nome de display do jogador que foi o melhor da partida. Caso não queira definir um, escreva `null` (sem aspas).

---

## 3. `manual_club_stats.json`

Este arquivo é utilizado para sobrescrever as estatísticas totais do clube (partidas, vitórias, gols, etc.) que aparecem no rodapé ou na home do site, corrigindo o problema de partidas antigas que a API não retornou.

### Exemplo de formato:
```json
{
    "total_partidas": 470,
    "vitorias": 208,
    "empates": 57,
    "derrotas": 205,
    "gols_marcados": 1075,
    "gols_sofridos": 1102
}
```
