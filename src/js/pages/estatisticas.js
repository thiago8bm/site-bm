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
            <div class="stats-overview">
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
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_marcados ?? 0}</span>
                    <span class="stat-card__label">Gols Pró</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.gols_sofridos ?? 0}</span>
                    <span class="stat-card__label">Gols Con.</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.saldo_gols ?? 0}</span>
                    <span class="stat-card__label">Saldo</span>
                </div>
                <div class="stat-card">
                    <span class="stat-card__value">${liga.win_rate ?? 0}%</span>
                    <span class="stat-card__label">Aproveit.</span>
                </div>
            </div>

            <!-- Tabs de ranking de jogadores -->
            <div class="stats-tabs" id="stats-tabs">
                <button class="tab-btn active" data-tab="gols">⚽ Artilheiros</button>
                <button class="tab-btn" data-tab="assists">🅰️ Assistências</button>
                <button class="tab-btn" data-tab="ga">G+A</button>
                <button class="tab-btn" data-tab="mvp">⭐ MVPs</button>
                <button class="tab-btn" data-tab="completo">📋 Completo</button>
            </div>

            <div id="stats-tab-content">
                <div class="tab-panel active" id="tab-gols">
                    ${buildRankingTable(jogadores, 'gols', '⚽ Artilheiros', 'Gols')}
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

function buildFullTable(jogadores) {
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
                    <th>Final.</th>
                    <th>Passes</th>
                    <th>Desarmes</th>
                    <th>MVP</th>
                    <th>Nota</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(j => {
                    const finalizacoes = j.taxa_chute ? Math.round((j.gols * 100) / j.taxa_chute) : 0;
                    return `
                <tr>
                    <td><strong>${j.nome_display}</strong></td>
                    <td><span class="posicao-pill" style="background:${getPosicaoColor(j.posicao)}">${j.posicao}</span></td>
                    <td>${j.partidas ?? 0}</td>
                    <td>${j.gols ?? 0}</td>
                    <td>${j.assistencias ?? 0}</td>
                    <td><strong>${(j.gols ?? 0) + (j.assistencias ?? 0)}</strong></td>
                    <td>${finalizacoes}</td>
                    <td>${j.passes_feitos ?? 0}</td>
                    <td>${j.desarmes ?? 0}</td>
                    <td>${j.mvp ?? 0}</td>
                    <td>${j.media_nota?.toFixed(2) ?? '—'}</td>
                </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}
