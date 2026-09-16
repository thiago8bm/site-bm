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

    // Adiciona interação de expand/collapse no card, e ciclo de fotos na imagem
    section.querySelectorAll('.player-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Se clicou no link do instagram, não faz nada com o card
            if (e.target.closest('.player-card__insta')) return;

            // Se clicou na foto e tem múltiplas fotos, cicla
            const imgEl = e.target.closest('.player-card__photo');
            if (imgEl && imgEl.dataset.fotos) {
                e.stopPropagation(); // Evita expandir/colapsar o card
                const fotos = JSON.parse(imgEl.dataset.fotos);
                if (fotos.length > 1) {
                    let idx = parseInt(imgEl.dataset.idx, 10);
                    idx = (idx + 1) % fotos.length;
                    imgEl.dataset.idx = idx;
                    imgEl.src = fotos[idx];
                }
                return;
            }

            card.classList.toggle('is-expanded');
        });

        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (!e.target.closest('.player-card__insta')) {
                    card.classList.toggle('is-expanded');
                }
            }
        });
    });
}

function buildPlayerCard(j) {
    const posColor = getPosicaoColor(j.posicao);
    const capitaniaBadge = getCapitaniaIcon(j.capitania);

    let fotoHTML = '';
    if (j.fotos && j.fotos.length > 0) {
        // Guarda o array de fotos no dataset para o JS ler
        const fotosAttr = JSON.stringify(j.fotos).replace(/"/g, '&quot;');
        fotoHTML = `<img src="${j.fotos[0]}" alt="Foto ${j.nome_display}" class="player-card__photo" data-fotos="${fotosAttr}" data-idx="0" loading="lazy" style="${j.fotos.length > 1 ? 'cursor: e-resize;' : ''}">`;
    } else {
        fotoHTML = `<div class="player-card__photo--placeholder">${j.nome_display[0]}</div>`;
    }

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

    const instaButton = j.instagram ? `
        <a href="https://instagram.com/${j.instagram}" target="_blank" rel="noopener noreferrer" class="player-card__insta" aria-label="Instagram de ${j.nome_display}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @${j.instagram}
        </a>
    ` : '';

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
            <div class="player-card__name-row">
                <span class="player-card__name">${j.nome_display}</span>
                <span class="posicao-pill" style="background:${posColor}">${j.posicao}</span>
            </div>
            ${instaButton}
        </div>
        <div class="player-card__stats">${statsHTML}</div>
        <p class="player-card__hint">Toque para ver stats</p>
    </div>`;
}
