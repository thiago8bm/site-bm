/**
 * pages/elenco.js — Baile de Munique
 * Renderiza os cards do elenco com foto, posição, capitania e stats expandidas.
 */

import { getElenco } from '../api.js';
import { renderLoading, renderError, getPosicaoColor, getFotoPath, getCapitaniaIcon } from '../utils/helpers.js';

export async function renderElenco() {
    const section = document.getElementById('elenco-view');
    if (!section) return;

    renderLoading(section, 'Carregando elenco...');

    const raw = await getElenco();
    const jogadores = raw?.data ?? [];

    if (!jogadores.length) {
        renderError(section, 'Dados do elenco não disponíveis ainda.');
        return;
    }

    const cardsHTML = jogadores.map(j => buildPlayerCard(j)).join('');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Elenco</h2>
            <p class="section-subtitle">${jogadores.length} jogadores · Temporada EA FC 26</p>
            <div class="elenco-grid">${cardsHTML}</div>
        </div>`;

    // Adiciona interação de expand/collapse em cada card
    section.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('is-expanded'));
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', e => {
            if (e.key === 'Enter' || e.key === ' ') card.classList.toggle('is-expanded');
        });
    });
}

function buildPlayerCard(j) {
    const fotoPath = getFotoPath(j.foto_pasta);
    const posColor = getPosicaoColor(j.posicao);
    const capitaniaBadge = getCapitaniaIcon(j.capitania);

    const fotoHTML = fotoPath
        ? `<img src="${fotoPath}" alt="Foto ${j.nome_display}" class="player-card__photo" loading="lazy">`
        : `<div class="player-card__photo--placeholder">${j.nome_display[0]}</div>`;

    const isGK = j.posicao === 'GK';

    const statsRows = [
        { label: 'Partidas',    value: j.partidas },
        { label: 'Gols',        value: j.gols },
        { label: 'Assistências',value: j.assistencias },
        { label: 'MVPs',        value: j.mvp },
        { label: 'Média',       value: j.media_nota?.toFixed(2) ?? '—' },
        { label: 'Aproveit.',   value: `${j.win_rate}%` },
        ...(isGK ? [
            { label: 'Defesas',  value: j.clean_sheets_gk },
            { label: 'CS Def',   value: j.clean_sheets_def },
        ] : [
            { label: 'Taxa Passe', value: `${j.taxa_passe}%` },
            { label: 'Desarmes',   value: j.desarmes },
        ]),
    ];

    const statsHTML = statsRows.map(r =>
        `<div class="stat-row">
            <span class="stat-label">${r.label}</span>
            <span class="stat-value">${r.value}</span>
        </div>`
    ).join('');

    return `
    <div class="card player-card" role="button" aria-label="Ver stats de ${j.nome_display}">
        <div class="player-card__header">
            ${fotoHTML}
            ${capitaniaBadge}
            <div class="player-card__overlay">
                <span class="player-card__number">#${j.numero}</span>
                <span class="player-card__posicao" style="background:${posColor}">${j.posicao}</span>
            </div>
        </div>
        <div class="player-card__body">
            <span class="player-card__name">${j.nome_display}</span>
            <div class="player-card__meta">
                <span class="posicao-pill" style="background:${posColor}">${j.posicao}</span>
            </div>
        </div>
        <div class="player-card__stats">${statsHTML}</div>
        <p class="player-card__hint">Toque para ver stats</p>
    </div>`;
}
