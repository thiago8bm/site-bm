/**
 * pages/jogos.js — Baile de Munique
 * Renderiza o histórico de partidas com filtro por tipo.
 */

import { getPartidas } from '../api.js';
import { renderLoading, renderError, getResultadoInfo, formatarData, formatMatchType } from '../utils/helpers.js';

let _todasPartidas = [];
let _filtroAtivo   = 'leagueMatch';

export async function renderUltimosJogos() {
    const section = document.getElementById('jogos-view');
    if (!section) return;

    renderLoading(section, 'Carregando partidas...');

    const raw = await getPartidas();
    _todasPartidas = raw?.data ?? [];

    if (!_todasPartidas.length) {
        renderError(section, 'Nenhuma partida encontrada ainda.');
        return;
    }

    // Descobre quais tipos de partida existem nos dados
    const tiposDisponiveis = [...new Set(_todasPartidas.map(p => p.tipo))];

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Últimos Jogos</h2>
            <p class="section-subtitle">${_todasPartidas.length} partidas registradas</p>
            <div class="matches-filter" id="matches-filter">
                ${tiposDisponiveis.map(tipo => `
                    <button
                        class="btn btn--outline btn--sm filter-btn ${tipo === _filtroAtivo ? 'active' : ''}"
                        data-tipo="${tipo}"
                    >
                        ${formatMatchType(tipo)}
                    </button>`).join('')}
                <button
                    class="btn btn--outline btn--sm filter-btn ${_filtroAtivo === 'all' ? 'active' : ''}"
                    data-tipo="all"
                >
                    Todas
                </button>
            </div>
            <div class="matches-list" id="matches-list"></div>
        </div>`;

    renderMatchList(_filtroAtivo);

    // Event listeners dos filtros
    section.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _filtroAtivo = btn.dataset.tipo;
            renderMatchList(_filtroAtivo);
        });
    });
}

function renderMatchList(tipo) {
    const container = document.getElementById('matches-list');
    if (!container) return;

    const filtradas = tipo === 'all'
        ? _todasPartidas
        : _todasPartidas.filter(p => p.tipo === tipo);

    if (!filtradas.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state__icon">📭</span>
                <p class="empty-state__title">Nenhuma partida nesta categoria</p>
            </div>`;
        return;
    }

    container.innerHTML = filtradas.map(p => buildMatchCard(p)).join('');
}

function buildMatchCard(p) {
    const { class: cls, icon } = getResultadoInfo(p.resultado);

    const marcadoresStr  = p.marcadores?.length
        ? p.marcadores.map(m => `${m.nome}${m.gols > 1 ? ` (${m.gols})` : ''}`).join(', ')
        : null;
    const assistentesStr = p.assistentes?.length
        ? p.assistentes.map(a => `${a.nome}${a.assists > 1 ? ` (${a.assists})` : ''}`).join(', ')
        : null;
    const mvpStr = p.mvp ?? null;

    return `
    <div class="match-card ${cls}">
        <div class="match-card__result-badge">${icon}</div>

        <div class="match-card__main">
            <div class="match-card__score">
                <span class="match-card__team">Baile de Munique</span>
                <div class="match-card__scoreline">
                    <span>${p.placar_nos}</span>
                    <span style="opacity:0.4">×</span>
                    <span>${p.placar_adv}</span>
                </div>
                <span class="match-card__team match-card__team--opp">${p.adversario}</span>
            </div>
            <div class="match-card__details">
                <span class="match-card__date">${formatarData(p.data)}</span>
                <span class="badge badge--gray">${formatMatchType(p.tipo)}</span>
            </div>
        </div>

        <div class="match-card__scorers">
            ${marcadoresStr  ? `<div class="scorer-row"><span class="scorer-label">⚽ Gols:</span><span>${marcadoresStr}</span></div>` : ''}
            ${assistentesStr ? `<div class="scorer-row"><span class="scorer-label">🅰️ Assists:</span><span>${assistentesStr}</span></div>` : ''}
            ${mvpStr         ? `<div class="scorer-row"><span class="scorer-label">⭐ MVP:</span><span>${mvpStr}</span></div>` : ''}
        </div>
    </div>`;
}
