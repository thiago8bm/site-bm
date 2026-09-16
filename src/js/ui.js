/**
 * ui.js — Baile de Munique | Camada de Renderização
 * Funções que transformam dados JSON em HTML no DOM.
 */

import { getElenco, getPartidas, getStats } from './api.js';

// =====================================================
// HELPERS VISUAIS
// =====================================================

/**
 * Retorna caminho da foto de um jogador dado o nome da pasta.
 * Tenta a imagem de "apresentação" como padrão.
 * Mapeia para arquivos reais encontrados nos assets.
 */
const FOTO_MAP = {
    Thiago:      'src/assets/players/Thiago/face_thiago.jpeg',
    Abreu:       'src/assets/players/Abreu/apresentacao_abreu.jpg',
    Gaps:        'src/assets/players/Gaps/apresentacao_Gaps.jpg',
    Pedrao:      'src/assets/players/Pedrao/face_pedrao.png',
    DiLaurentis: 'src/assets/players/DiLaurentis/apresentacao_DiLaurentis.jpg',
    Pinto:       'src/assets/players/Pinto/apresentacao_pinto.webp',
    Gabri:       'src/assets/players/Gabri/face_gabri.png',
    Cleiton:     'src/assets/players/Cleiton/foto_cleiton.jpg',
    Formiga:     null,  // sem foto ainda
};

function getFotoPath(fotosPasta) {
    return FOTO_MAP[fotosPasta] ?? null;
}

/** Ícone de capitania */
function getCapitaniaIcon(capitania) {
    if (!capitania) return '';
    const num = capitania.replace(/[^0-9]/g, '');
    return `<span class="capitania-badge" title="${capitania}">${num}°C</span>`;
}

/** Cor de fundo da badge de posição */
const POSICAO_COLORS = {
    GK:  '#f39c12',
    ZAG: '#3498db', ZGE: '#3498db', ZGD: '#3498db',
    LD:  '#2ecc71', LE:  '#2ecc71',
    VOL: '#9b59b6', VLD: '#9b59b6', VLE: '#9b59b6',
    MEI: '#1abc9c',
    PD:  '#e74c3c', PE:  '#e74c3c',
    CA:  '#c8102e',
};

function getPosicaoColor(posicao) {
    return POSICAO_COLORS[posicao] ?? '#8a8a8a';
}

/** Ícone e classe de resultado de partida */
function getResultadoInfo(resultado) {
    const map = {
        vitoria: { label: 'V', class: 'match--win',  icon: '✓' },
        empate:  { label: 'E', class: 'match--draw', icon: '–' },
        derrota: { label: 'D', class: 'match--loss', icon: '✗' },
    };
    return map[resultado] ?? { label: '?', class: '', icon: '?' };
}

/** Formata data ISO para pt-BR */
function formatarData(dataStr) {
    if (!dataStr) return '—';
    try {
        const [y, m, d] = dataStr.split('-');
        return `${d}/${m}/${y}`;
    } catch { return dataStr; }
}

/** Renderiza estrelas de nota */
function renderStars(nota) {
    const full = Math.round(nota);
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < full ? 'star--on' : 'star--off'}">★</span>`
    ).join('');
}

// =====================================================
// LOADING / ERRO
// =====================================================
function renderLoading(container, msg = 'Carregando...') {
    container.innerHTML = `
        <div class="loading-wrapper">
            <div class="spinner"></div>
            <p>${msg}</p>
        </div>`;
}

function renderError(container, msg = 'Erro ao carregar dados.') {
    container.innerHTML = `
        <div class="empty-state">
            <span class="empty-state__icon">⚠️</span>
            <p class="empty-state__title">${msg}</p>
            <p class="empty-state__desc">Verifique se os scripts Python já foram executados via GitHub Actions.</p>
        </div>`;
}

// =====================================================
// SEÇÃO: ELENCO
// =====================================================
export async function renderElenco() {
    const section = document.getElementById('elenco-view');
    if (!section) return;

    renderLoading(section, 'Carregando elenco...');

    const jogadores = await getElenco();

    if (!jogadores.length) {
        renderError(section, 'Elenco ainda não disponível.');
        return;
    }

    // Ordena: capitães primeiro, depois por número de camisa
    const ordenados = [...jogadores].sort((a, b) => {
        const capOrder = (j) => j.capitania ? parseInt(j.capitania) : 99;
        return capOrder(a) - capOrder(b) || a.numero - b.numero;
    });

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Elenco</h2>
            <p class="section-subtitle">Nossos guerreiros na formação 1-4-2-3-1</p>
            <div class="elenco-grid" id="elenco-grid">
                ${ordenados.map(j => buildPlayerCard(j)).join('')}
            </div>
        </div>`;

    // Listeners para expandir card
    section.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('is-expanded'));
    });
}

function buildPlayerCard(jogador) {
    const foto        = getFotoPath(jogador.foto_pasta);
    const posColor    = getPosicaoColor(jogador.posicao);
    const capIcon     = getCapitaniaIcon(jogador.capitania);
    const fotoHTML    = foto
        ? `<img src="./${foto}" alt="${jogador.nome_display}" class="player-card__photo" loading="lazy" onerror="this.src=''; this.classList.add('photo--fallback');">`
        : `<div class="player-card__photo player-card__photo--placeholder">
               <span>${jogador.nome_display.charAt(0)}</span>
           </div>`;

    const overall = jogador.overall ?? '—';

    return `
    <article class="player-card card" data-id="${jogador.id}" tabindex="0" role="button" aria-expanded="false">
        <div class="player-card__header">
            ${fotoHTML}
            <div class="player-card__overlay">
                <span class="player-card__number">#${jogador.numero}</span>
                <span class="player-card__posicao" style="background:${posColor}">${jogador.posicao}</span>
            </div>
            ${capIcon}
        </div>
        <div class="player-card__body">
            <h3 class="player-card__name">${jogador.nome_display}</h3>
            <div class="player-card__meta">
                <span class="badge badge--gray">OVR ${overall}</span>
                <span class="badge badge--blue">${jogador.partidas} jogos</span>
            </div>
        </div>
        <div class="player-card__stats" aria-hidden="true">
            <div class="stat-row">
                <span class="stat-label">⚽ Gols</span>
                <span class="stat-value">${jogador.gols}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎯 Assist.</span>
                <span class="stat-value">${jogador.assistencias}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🏆 MVP</span>
                <span class="stat-value">${jogador.mvp}x</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">📊 Nota</span>
                <span class="stat-value">${jogador.media_nota.toFixed(1)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🔥 WR%</span>
                <span class="stat-value">${jogador.win_rate}%</span>
            </div>
        </div>
        <p class="player-card__hint">Toque para ver estatísticas</p>
    </article>`;
}

// =====================================================
// SEÇÃO: ÚLTIMOS JOGOS
// =====================================================
export async function renderUltimosJogos() {
    const section = document.getElementById('jogos-view');
    if (!section) return;

    renderLoading(section, 'Carregando partidas...');

    // Por padrão exibe Liga; guarda todas para filtragem dinâmica
    const todasPartidas = await getPartidas();

    if (!todasPartidas.length) {
        renderError(section, 'Nenhuma partida encontrada.');
        return;
    }

    // Tipos disponíveis
    const tiposDisponiveis = [...new Set(todasPartidas.map(p => p.tipo))];

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Últimos Jogos</h2>
            <p class="section-subtitle">Histórico de partidas do Baile de Munique</p>

            <div class="matches-filter" role="group" aria-label="Filtro por tipo de partida">
                <button class="btn btn--sm filter-btn active" data-tipo="all">Todos</button>
                ${tiposDisponiveis.map(tipo => `
                    <button class="btn btn--sm filter-btn" data-tipo="${tipo}">
                        ${formatMatchType(tipo)}
                    </button>`).join('')}
            </div>

            <div class="matches-list" id="matches-list">
                ${todasPartidas.map(p => buildMatchCard(p)).join('')}
            </div>
        </div>`;

    // Filtro por tipo de partida
    section.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tipo = btn.dataset.tipo;
            const list = section.querySelector('#matches-list');
            const partidas = tipo === 'all' ? todasPartidas : todasPartidas.filter(p => p.tipo === tipo);
            list.innerHTML = partidas.length
                ? partidas.map(p => buildMatchCard(p)).join('')
                : '<p class="text-center mt-lg" style="color:var(--text-secondary)">Nenhuma partida deste tipo ainda.</p>';
        });
    });
}

function formatMatchType(tipo) {
    const map = {
        leagueMatch:   'Liga',
        friendlyMatch: 'Amistoso',
        playoffMatch:  'Playoff',
    };
    return map[tipo] ?? tipo;
}

function buildMatchCard(partida) {
    const res    = getResultadoInfo(partida.resultado);
    const data   = formatarData(partida.data);
    const tipo   = formatMatchType(partida.tipo);

    const marcadores  = partida.marcadores?.length
        ? partida.marcadores.map(m => `${m.nome} (${m.gols})`).join(', ')
        : '—';
    const assistentes = partida.assistentes?.length
        ? partida.assistentes.map(a => `${a.nome} (${a.assists})`).join(', ')
        : '—';
    const mvp = partida.mvp ?? '—';

    return `
    <article class="match-card ${res.class}">
        <div class="match-card__result-badge">${res.icon}</div>
        <div class="match-card__main">
            <div class="match-card__score">
                <span class="match-card__team">Baile de Munique</span>
                <span class="match-card__scoreline">
                    <strong>${partida.placar_nos}</strong>
                    <span>×</span>
                    <strong>${partida.placar_adv}</strong>
                </span>
                <span class="match-card__team match-card__team--opp">${partida.adversario}</span>
            </div>
            <div class="match-card__details">
                <span class="badge badge--gray">${tipo}</span>
                <span class="match-card__date">${data}</span>
            </div>
        </div>
        <div class="match-card__scorers">
            <div class="scorer-row"><span class="scorer-label">⚽ Gols</span><span>${marcadores}</span></div>
            <div class="scorer-row"><span class="scorer-label">🎯 Assists</span><span>${assistentes}</span></div>
            <div class="scorer-row"><span class="scorer-label">🏆 MVP</span><span>${mvp}</span></div>
        </div>
    </article>`;
}

// =====================================================
// SEÇÃO: ESTATÍSTICAS
// =====================================================
export async function renderEstatisticas() {
    const section = document.getElementById('estatisticas-view');
    if (!section) return;

    renderLoading(section, 'Carregando estatísticas...');

    const [jogadores, stats] = await Promise.all([getElenco(), getStats()]);

    if (!jogadores.length) {
        renderError(section, 'Estatísticas ainda não disponíveis.');
        return;
    }

    const liga    = stats?.liga ?? {};
    const topGols = [...jogadores].sort((a, b) => b.gols - a.gols);
    const topAss  = [...jogadores].sort((a, b) => b.assistencias - a.assistencias);
    const topMvp  = [...jogadores].sort((a, b) => b.mvp - a.mvp);
    const topParticipacoes = [...jogadores].sort((a, b) => b.participacoes_gol - a.participacoes_gol);

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Estatísticas</h2>
            <p class="section-subtitle">Números do Baile de Munique na temporada</p>

            <!-- Resumo do Clube -->
            <div class="stats-overview">
                <div class="stat-card">
                    <span class="stat-card__value">${liga.total_partidas ?? '—'}</span>
                    <span class="stat-card__label">Partidas</span>
                </div>
                <div class="stat-card stat-card--win">
                    <span class="stat-card__value">${liga.vitorias ?? '—'}</span>
                    <span class="stat-card__label">Vitórias</span>
                </div>
                <div class="stat-card stat-card--draw">
                    <span class="stat-card__value">${liga.empates ?? '—'}</span>
                    <span class="stat-card__label">Empates</span>
                </div>
                <div class="stat-card stat-card--loss">
                    <span class="stat-card__value">${liga.derrotas ?? '—'}</span>
                    <span class="stat-card__label">Derrotas</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_marcados ?? '—'}</span>
                    <span class="stat-card__label">Gols Marcados</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_sofridos ?? '—'}</span>
                    <span class="stat-card__label">Gols Sofridos</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.saldo_gols !== undefined ? (liga.saldo_gols > 0 ? '+' : '') + liga.saldo_gols : '—'}</span>
                    <span class="stat-card__label">Saldo</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.win_rate !== undefined ? liga.win_rate + '%' : '—'}</span>
                    <span class="stat-card__label">Aproveitamento</span>
                </div>
            </div>

            <!-- Tabs de Rankings -->
            <div class="stats-tabs" role="tablist">
                <button class="tab-btn active" data-tab="artilheiros" role="tab" aria-selected="true">⚽ Artilheiros</button>
                <button class="tab-btn" data-tab="assistentes" role="tab" aria-selected="false">🎯 Assistências</button>
                <button class="tab-btn" data-tab="participacoes" role="tab" aria-selected="false">🔥 G+A</button>
                <button class="tab-btn" data-tab="mvp" role="tab" aria-selected="false">🏆 MVP</button>
                <button class="tab-btn" data-tab="completo" role="tab" aria-selected="false">📊 Completo</button>
            </div>

            <div class="stats-tab-content">
                <div id="tab-artilheiros" class="tab-panel active">
                    ${buildRankingTable(topGols, ['nome_display', 'posicao', 'partidas', 'gols'], ['Jogador', 'Pos.', 'Jogos', 'Gols'], 'gols')}
                </div>
                <div id="tab-assistentes" class="tab-panel">
                    ${buildRankingTable(topAss, ['nome_display', 'posicao', 'partidas', 'assistencias'], ['Jogador', 'Pos.', 'Jogos', 'Assist.'], 'assistencias')}
                </div>
                <div id="tab-participacoes" class="tab-panel">
                    ${buildRankingTable(topParticipacoes, ['nome_display', 'posicao', 'gols', 'assistencias', 'participacoes_gol'], ['Jogador', 'Pos.', 'G', 'A', 'G+A'], 'participacoes_gol')}
                </div>
                <div id="tab-mvp" class="tab-panel">
                    ${buildRankingTable(topMvp, ['nome_display', 'posicao', 'partidas', 'mvp'], ['Jogador', 'Pos.', 'Jogos', 'MVPs'], 'mvp')}
                </div>
                <div id="tab-completo" class="tab-panel">
                    ${buildFullTable(jogadores)}
                </div>
            </div>
        </div>`;

    // Tabs logic
    section.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const target = section.querySelector(`#tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });
}

function buildRankingTable(jogadores, campos, headers, destaque) {
    return `
    <div class="table-wrapper">
        <table class="stats-table">
            <thead>
                <tr>
                    <th>#</th>
                    ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${jogadores.map((j, i) => `
                <tr class="${i === 0 ? 'row--first' : ''}">
                    <td class="rank-cell">${i + 1}</td>
                    ${campos.map((campo, ci) => {
                        const val  = j[campo] ?? '—';
                        const isHL = campo === destaque;
                        const isPos = campo === 'posicao';
                        if (isPos) {
                            const color = getPosicaoColor(val);
                            return `<td><span class="posicao-pill" style="background:${color}">${val}</span></td>`;
                        }
                        return `<td class="${isHL ? 'cell--highlight' : ''}">${val}</td>`;
                    }).join('')}
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function buildFullTable(jogadores) {
    return `
    <div class="table-wrapper">
        <table class="stats-table stats-table--full">
            <thead>
                <tr>
                    <th>Jogador</th>
                    <th>Pos.</th>
                    <th>Jogos</th>
                    <th>⚽</th>
                    <th>🎯</th>
                    <th>G+A</th>
                    <th>🏆</th>
                    <th>OVR</th>
                    <th>Nota</th>
                    <th>WR%</th>
                </tr>
            </thead>
            <tbody>
                ${jogadores.map(j => {
                    const color = getPosicaoColor(j.posicao);
                    return `<tr>
                        <td><strong>${j.nome_display}</strong></td>
                        <td><span class="posicao-pill" style="background:${color}">${j.posicao}</span></td>
                        <td>${j.partidas}</td>
                        <td>${j.gols}</td>
                        <td>${j.assistencias}</td>
                        <td class="cell--highlight">${j.participacoes_gol}</td>
                        <td>${j.mvp}</td>
                        <td>${j.overall}</td>
                        <td>${j.media_nota.toFixed(1)}</td>
                        <td>${j.win_rate}%</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

// =====================================================
// SEÇÃO: HOME (banner básico — será expandido)
// =====================================================
export async function renderHome() {
    const section = document.getElementById('home-view');
    if (!section) return;

    const stats = await getStats();
    const liga  = stats?.liga ?? {};

    section.innerHTML = `
        <div class="home-hero">
            <div class="home-hero__content">
                <img src="./src/assets/img/EscudoBM.jpeg" alt="Escudo Baile de Munique" class="home-hero__escudo">
                <h2 class="home-hero__title">Baile de Munique</h2>
                <p class="home-hero__subtitle">FC26 Pro Clubs · Formação 1-4-2-3-1</p>
                <a href="https://www.instagram.com/bailedemunichofc/" target="_blank" rel="noopener" class="btn btn--ghost home-hero__instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @bailedemunichofc
                </a>
            </div>
            ${liga.total_partidas ? `
            <div class="home-hero__stats">
                <div class="hero-stat">
                    <span class="hero-stat__value">${liga.total_partidas}</span>
                    <span class="hero-stat__label">Partidas</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat__value">${liga.vitorias}</span>
                    <span class="hero-stat__label">Vitórias</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat__value">${liga.gols_marcados}</span>
                    <span class="hero-stat__label">Gols</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat__value">${liga.win_rate}%</span>
                    <span class="hero-stat__label">Aproveit.</span>
                </div>
            </div>` : ''}
        </div>`;
}
