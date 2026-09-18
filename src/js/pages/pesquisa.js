/**
 * pages/pesquisa.js — Baile de Munique
 * Renderiza o Dashboard de Pesquisa de Elenco.
 * Lê data/survey/pesquisa.json e exibe termômetro, premiações,
 * campinho tático 1-4-2-3-1, coringas e gráficos Chart.js.
 */

import { getPesquisa } from '../api.js';
import { renderLoading, renderError, renderStars } from '../utils/helpers.js';

export async function renderPesquisa() {
    const section = document.getElementById('pesquisa-view');
    if (!section) return;

    renderLoading(section, 'Carregando pesquisa de elenco...');

    const dados = await getPesquisa();

    if (!dados || dados.status !== 'success') {
        renderError(section, 'Dados da pesquisa ainda não disponíveis.');
        return;
    }

    const { termometro, premiacoes, escalacao_ideal, coringas, graficos, total_respostas } = dados;

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Pesquisa de Elenco</h2>
            <p class="section-subtitle">Dashboard interno — ${total_respostas} respostas do Google Forms</p>

            <!-- 1. TERMÔMETRO -->
            <h3 class="pesquisa-section-title">🌡️ Termômetro do Elenco</h3>
            <div class="termometro-grid">
                <div class="termo-card">
                    <span class="termo-card__icon">👥</span>
                    <span class="termo-card__label">Percepção Média do Coletivo</span>
                    <span class="termo-card__value termo-card__value--blue">
                        ${termometro.media_coletiva.toFixed(2)}<small> / 5</small>
                    </span>
                    <div class="termo-stars">${renderStars(termometro.media_coletiva)}</div>
                </div>
                <div class="termo-card">
                    <span class="termo-card__icon">🧠</span>
                    <span class="termo-card__label">Autoavaliação Média</span>
                    <span class="termo-card__value termo-card__value--red">
                        ${termometro.media_auto.toFixed(2)}<small> / 5</small>
                    </span>
                    <div class="termo-stars">${renderStars(termometro.media_auto)}</div>
                </div>
            </div>

            ${termometro.qtd_outliers > 0 ? `
            <div class="alerta-outlier">
                <span class="alerta-outlier__icon">⚠️</span>
                <p>${termometro.alerta_texto}</p>
            </div>` : ''}

            <!-- 2. PREMIAÇÕES -->
            <h3 class="pesquisa-section-title">🏅 Premiações</h3>
            <div class="premiacoes-grid">
                <div class="premios-card">
                    <h4 class="premios-card__title">🎯 Mais Consistentes</h4>
                    ${buildPremiosList(premiacoes.consistentes)}
                </div>
                <div class="premios-card">
                    <h4 class="premios-card__title">⚡ Mais Decisivos</h4>
                    ${buildPremiosList(premiacoes.decisivos)}
                </div>
                <div class="premios-card">
                    <h4 class="premios-card__title">📈 Mais Evoluíram <small>(3+ votos)</small></h4>
                    ${premiacoes.evoluiram.length
                        ? premiacoes.evoluiram.map(j =>
                            `<div class="premio-row">
                                <span class="premio-nome">${j.nome}</span>
                                <span class="premio-votos">${j.votos}v</span>
                            </div>`).join('')
                        : '<p class="premio-empty">Nenhum com 3+ votos.</p>'}
                </div>
                <div class="premios-card premios-card--alert">
                    <h4 class="premios-card__title">⬇️ Precisam Evoluir <small>(3+ votos)</small></h4>
                    <div class="precisam-number">${premiacoes.precisam_melhorar_qtd}</div>
                    <p class="premio-empty">jogador(es) serão contatados individualmente.</p>
                </div>
            </div>

            <!-- 3. ESCALAÇÃO IDEAL + CORINGAS -->
            <h3 class="pesquisa-section-title">⚽ Escalação Ideal &amp; Versatilidade</h3>
            <div class="campo-coringas-grid">
                <div class="campo-wrapper">
                    <h4 class="campo-titulo">O XI Ideal votado pelo elenco</h4>
                    ${buildCampinho(escalacao_ideal)}
                </div>
                <div class="coringas-wrapper">
                    <h4 class="campo-titulo">Coringas por Setor</h4>
                    <p class="campo-desc">Top 3 votados em cada setor pelo elenco.</p>
                    ${buildCorinjasTable(coringas)}
                </div>
            </div>

            <!-- 4. GRÁFICOS -->
            <h3 class="pesquisa-section-title">📊 Gráficos</h3>
            <div class="graficos-grid">
                <div class="grafico-card">
                    <h4 class="grafico-card__title">Votação para Capitão</h4>
                    <div class="grafico-container">
                        <canvas id="chart-capitaes"></canvas>
                    </div>
                </div>
                <div class="grafico-card">
                    <h4 class="grafico-card__title">Posições Favoritas do Elenco</h4>
                    <div class="grafico-container">
                        <canvas id="chart-posicoes"></canvas>
                    </div>
                </div>
            </div>
        </div>`;

    initCharts(graficos);
}

// ─── Helpers internos ────────────────────────────────────────

function buildPremiosList(lista) {
    if (!lista?.length) return '<p class="premio-empty">Indefinido</p>';
    return lista.map(item => `
        <div class="premio-row">
            <span class="premio-pos">${item.posicao}°</span>
            <span class="premio-nome">${item.nome}</span>
            <span class="premio-votos">${item.votos}v</span>
        </div>`).join('');
}

function buildCampinho(esc) {
    const pos = chave => esc[chave]?.nome ?? '—';
    return `
    <div class="campinho">
        <div class="campinho__linha">
            <div class="campinho__jogador campinho__jogador--ca">${pos('CA')}</div>
        </div>
        <div class="campinho__linha">
            <div class="campinho__jogador campinho__jogador--pe">${pos('PE')}</div>
            <div class="campinho__jogador campinho__jogador--mei">${pos('MEI')}</div>
            <div class="campinho__jogador campinho__jogador--pd">${pos('PD')}</div>
        </div>
        <div class="campinho__linha">
            <div class="campinho__jogador">${pos('VLE')}</div>
            <div class="campinho__jogador">${pos('VLD')}</div>
        </div>
        <div class="campinho__linha">
            <div class="campinho__jogador">${pos('LE')}</div>
            <div class="campinho__jogador">${pos('ZGE')}</div>
            <div class="campinho__jogador">${pos('ZGD')}</div>
            <div class="campinho__jogador">${pos('LD')}</div>
        </div>
        <div class="campinho__linha">
            <div class="campinho__jogador campinho__jogador--gk">${pos('GK')}</div>
        </div>
    </div>`;
}

function buildCorinjasTable(coringas) {
    const setores = Object.entries(coringas);
    if (!setores.length) return '<p>Sem dados.</p>';
    return `
    <table class="stats-table coringas-table">
        <thead>
            <tr><th>Setor</th><th>Top 3 Jogadores</th></tr>
        </thead>
        <tbody>
            ${setores.map(([setor, lista]) => `
            <tr>
                <td><span class="badge badge--blue">${setor}</span></td>
                <td>${lista.map(j => `${j.nome} (${j.votos}v)`).join(', ')}</td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function initCharts(graficos) {
    // Garante que Chart.js esteja disponível (carregado via CDN no index.html)
    if (typeof Chart === 'undefined') {
        console.warn('[Pesquisa] Chart.js não carregado.');
        return;
    }

    // Adaptação para o Dark Theme global
    Chart.defaults.color = '#cccccc';
    Chart.defaults.borderColor = '#333333';

    const RED    = '#C8102E';
    const BLUE   = '#3b82f6'; // Azul mais claro para destacar no fundo escuro
    const COLORS = [BLUE, RED, '#f39c12', '#2ecc71', '#9b59b6', '#34495e', '#e74c3c'];

    // Horizontal bar — Votação para capitão
    const ctxCap = document.getElementById('chart-capitaes');
    if (ctxCap && graficos?.capitaes?.labels?.length) {
        new Chart(ctxCap, {
            type: 'bar',
            data: {
                labels: graficos.capitaes.labels,
                datasets: [{
                    data: graficos.capitaes.data,
                    backgroundColor: graficos.capitaes.labels.map((_, i) => i === 0 ? BLUE : i === 1 ? RED : '#555555'),
                    borderRadius: 6,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
            },
        });
    }

    // Doughnut — Posições favoritas
    const ctxPos = document.getElementById('chart-posicoes');
    if (ctxPos && graficos?.posicoes_fav?.labels?.length) {
        new Chart(ctxPos, {
            type: 'doughnut',
            data: {
                labels: graficos.posicoes_fav.labels,
                datasets: [{
                    data: graficos.posicoes_fav.data,
                    backgroundColor: COLORS,
                    borderWidth: 2,
                    borderColor: '#1e1e1e', // Cor do bg do card para recortar a rosca
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 13 } } },
                },
            },
        });
    }
}
