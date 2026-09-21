/**
 * pages/estatisticas.js — Baile de Munique
 * Renderiza overview do clube + ranking de jogadores em tabs.
 */

import { getStats, getElenco } from '../api.js';
import { renderLoading, renderError, getPosicaoColor } from '../utils/helpers.js';

export async function renderEstatisticas() {
    const section = document.getElementById('estatisticas-view');
    if (!section) return;

    renderLoading(section, 'Carregando estatísticas...');

    const [stats, elencoRaw] = await Promise.all([getStats(), getElenco()]);

    if (!stats) {
        renderError(section, 'Estatísticas ainda não disponíveis.');
        return;
    }

    const liga     = stats.liga ?? {};
    const jogadores = elencoRaw?.data ?? [];

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Estatísticas</h2>
            <p class="section-subtitle">Temporada EA FC 26 · Liga</p>

            <!-- Overview do Clube -->
            <!-- Overview do Clube - Principais -->
            <div class="stats-overview" style="margin-bottom: var(--spacing-sm);">
                <div class="stat-card">
                    <span class="stat-card__value">${liga.total_partidas ?? 0}</span>
                    <span class="stat-card__label">Partidas</span>
                </div>
                <div class="stat-card stat-card--win">
                    <span class="stat-card__value">${liga.vitorias ?? 0}</span>
                    <span class="stat-card__label">Vitórias</span>
                </div>
                <div class="stat-card stat-card--draw">
                    <span class="stat-card__value">${liga.empates ?? 0}</span>
                    <span class="stat-card__label">Empates</span>
                </div>
                <div class="stat-card stat-card--loss">
                    <span class="stat-card__value">${liga.derrotas ?? 0}</span>
                    <span class="stat-card__label">Derrotas</span>
                </div>
            </div>

            <!-- Overview do Clube - Secundárias (Oculto por padrão) -->
            <div class="stats-overview hidden" id="extra-stats" style="display: none; margin-bottom: 0;">
                <div class="stat-card">
                    <span class="stat-card__value">${liga.win_rate ?? 0}%</span>
                    <span class="stat-card__label">Aproveitamento</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_marcados ?? 0}</span>
                    <span class="stat-card__label">Gols Pró</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_sofridos ?? 0}</span>
                    <span class="stat-card__label">Gols Contra</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.ssg ?? 0}</span>
                    <span class="stat-card__label">Jogos Sem Sofrer Gols</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.saldo_gols ?? 0}</span>
                    <span class="stat-card__label">Saldo de Gols</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gpj ?? 0}</span>
                    <span class="stat-card__label">Gols / Jogo</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gspj ?? 0}</span>
                    <span class="stat-card__label">Gols Sofridos / Jogo</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.playoff_pontos ?? 0}</span>
                    <span class="stat-card__label">Partidas de Playoff</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.mda ?? 0}</span>
                    <span class="stat-card__label">Melhor Divisão</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.divisao ?? 0}</span>
                    <span class="stat-card__label">Divisão Atual</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.reputacao ?? 0}</span>
                    <span class="stat-card__label">Reputação</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.ch ?? 0}</span>
                    <span class="stat-card__label">Classif. Habilidade</span>
                </div>
            </div>

            <div class="stats-toggle-wrapper" style="text-align: center; margin-bottom: var(--spacing-xl); margin-top: 10px;">
                <button id="toggle-extra-stats" style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">
                    <span id="toggle-text">Ver mais estatísticas</span> <span id="toggle-arrow" style="transition: transform 0.3s; display: inline-block;">▼</span>
                </button>
            </div>

            <!-- Tabs de ranking de jogadores -->
            <div class="stats-tabs" id="stats-tabs">
                <button class="tab-btn active" data-tab="resumo">📊 Resumo</button>
                <button class="tab-btn" data-tab="gols">⚽ Artilharia</button>
                <button class="tab-btn" data-tab="assists">🅰️ Assistências</button>
                <button class="tab-btn" data-tab="ga">G+A</button>
                <button class="tab-btn" data-tab="mvp">⭐ MVPs</button>
                <button class="tab-btn" data-tab="completo">📋 Completo</button>
            </div>

            <div id="stats-tab-content">
                <div class="tab-panel active" id="tab-resumo">
                    ${buildResumoTable(jogadores)}
                </div>
                <div class="tab-panel" id="tab-gols">
                    ${buildRankingTable(jogadores, 'gols', '⚽ Artilharia', 'Gols')}
                </div>
                <div class="tab-panel" id="tab-assists">
                    ${buildRankingTable(jogadores, 'assistencias', '🅰️ Mais Assistências', 'Assists')}
                </div>
                <div class="tab-panel" id="tab-ga">
                    ${buildGATable(jogadores)}
                </div>
                <div class="tab-panel" id="tab-mvp">
                    ${buildRankingTable(jogadores, 'mvp', '⭐ Mais MVPs', 'MVPs')}
                </div>
                <div class="tab-panel" id="tab-completo">
                    ${buildFullTable(jogadores)}
                </div>
            </div>
        </div>`;

    // Toggle Extra Stats
    const toggleBtn = section.querySelector('#toggle-extra-stats');
    const extraStats = section.querySelector('#extra-stats');
    const toggleText = section.querySelector('#toggle-text');
    const toggleArrow = section.querySelector('#toggle-arrow');
    
    if (toggleBtn && extraStats) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = extraStats.style.display === 'none';
            if (isHidden) {
                extraStats.style.display = 'grid'; // because stats-overview is a grid
                toggleArrow.style.transform = 'rotate(180deg)';
                toggleText.textContent = 'Ocultar estatísticas';
            } else {
                extraStats.style.display = 'none';
                toggleArrow.style.transform = 'rotate(0deg)';
                toggleText.textContent = 'Ver mais estatísticas';
            }
        });
    }

    // Tabs interaction
    section.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const tabId = `tab-${btn.dataset.tab}`;
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

function buildRankingTable(jogadores, campo, titulo, colunaLabel) {
    const sorted = [...jogadores].sort((a, b) => (b[campo] ?? 0) - (a[campo] ?? 0));
    return `
    <div class="table-wrapper">
        <table class="stats-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Jogador</th>
                    <th>Pos.</th>
                    <th>${colunaLabel}</th>
                    <th>Partidas</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((j, i) => `
                <tr class="${i === 0 ? 'row--first' : ''}">
                    <td class="rank-cell">${i + 1}</td>
                    <td>${j.nome_display}</td>
                    <td><span class="posicao-pill" style="background:${getPosicaoColor(j.posicao)}">${j.posicao}</span></td>
                    <td class="cell--highlight">${j[campo] ?? 0}</td>
                    <td>${j.partidas ?? 0}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function buildGATable(jogadores) {
    const sorted = [...jogadores]
        .map(j => ({ ...j, ga: (j.gols ?? 0) + (j.assistencias ?? 0) }))
        .sort((a, b) => b.ga - a.ga);

    return `
    <div class="table-wrapper">
        <table class="stats-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Jogador</th>
                    <th>Pos.</th>
                    <th>G+A</th>
                    <th>Gols</th>
                    <th>Assists</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map((j, i) => `
                <tr class="${i === 0 ? 'row--first' : ''}">
                    <td class="rank-cell">${i + 1}</td>
                    <td>${j.nome_display}</td>
                    <td><span class="posicao-pill" style="background:${getPosicaoColor(j.posicao)}">${j.posicao}</span></td>
                    <td class="cell--highlight">${j.ga}</td>
                    <td>${j.gols ?? 0}</td>
                    <td>${j.assistencias ?? 0}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function buildResumoTable(jogadores) {
    const sorted = [...jogadores].sort((a, b) => (b.partidas ?? 0) - (a.partidas ?? 0));
    return `
    <div class="table-wrapper">
        <table class="stats-table stats-table--full">
            <thead>
                <tr>
                    <th>Jogador</th>
                    <th>Pos.</th>
                    <th>J</th>
                    <th>G</th>
                    <th>A</th>
                    <th>G+A</th>
                    <th>MVP</th>
                    <th>Nota</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(j => `
                <tr>
                    <td><strong>${j.nome_display}</strong></td>
                    <td><span class="posicao-pill" style="background:${getPosicaoColor(j.posicao)}">${j.posicao}</span></td>
                    <td>${j.partidas ?? 0}</td>
                    <td>${j.gols ?? 0}</td>
                    <td>${j.assistencias ?? 0}</td>
                    <td><strong>${(j.gols ?? 0) + (j.assistencias ?? 0)}</strong></td>
                    <td>${j.mvp ?? 0}</td>
                    <td>${j.media_nota?.toFixed(2) ?? '—'}</td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

function buildFullTable(jogadores) {
    const sorted = [...jogadores].sort((a, b) => (b.partidas ?? 0) - (a.partidas ?? 0));
    return `
    <div class="table-wrapper">
        <table class="stats-table stats-table--full">
            <thead>
                <tr>
                    <th>Jogador</th>
                    <th>Pos.</th>
                    <th>Overall</th>
                    <th>J</th>
                    <th>% Vit.</th>
                    <th>G</th>
                    <th>A</th>
                    <th>G+A</th>
                    <th>MVP</th>
                    <th>Nota</th>
                    <th>Final.</th>
                    <th>% Chute</th>
                    <th>Passes</th>
                    <th>% Passe</th>
                    <th>Desarmes</th>
                    <th>% Desarme</th>
                    <th>Verm.</th>
                    <th>CS Def</th>
                    <th>CS GK</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(j => {
                    const finalizacoes = j.taxa_chute ? Math.round((j.gols * 100) / j.taxa_chute) : 0;
                    return `
                <tr>
                    <td><strong>${j.nome_display}</strong></td>
                    <td><span class="posicao-pill" style="background:${getPosicaoColor(j.posicao)}">${j.posicao}</span></td>
                    <td>${j.overall ?? '—'}</td>
                    <td>${j.partidas ?? 0}</td>
                    <td>${j.win_rate ?? 0}%</td>
                    <td>${j.gols ?? 0}</td>
                    <td>${j.assistencias ?? 0}</td>
                    <td><strong>${(j.gols ?? 0) + (j.assistencias ?? 0)}</strong></td>
                    <td>${j.mvp ?? 0}</td>
                    <td>${j.media_nota?.toFixed(2) ?? '—'}</td>
                    <td>${finalizacoes}</td>
                    <td>${j.taxa_chute ?? 0}%</td>
                    <td>${j.passes_feitos ?? 0}</td>
                    <td>${j.taxa_passe ?? 0}%</td>
                    <td>${j.desarmes ?? 0}</td>
                    <td>${j.taxa_desarme ?? 0}%</td>
                    <td>${j.cartoes_vermelhos ?? 0}</td>
                    <td>${j.clean_sheets_def ?? 0}</td>
                    <td>${j.clean_sheets_gk ?? 0}</td>
                </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}
