/**
 * utils/helpers.js — Baile de Munique
 * Funções utilitárias compartilhadas por todos os módulos de página.
 */

// ─── Cores por posição tática ────────────────────────────────
const POSICAO_COLORS = {
    GK:  '#f39c12',
    ZAG: '#3498db', ZGE: '#3498db', ZGD: '#3498db',
    LD:  '#2ecc71', LE:  '#2ecc71',
    VOL: '#9b59b6', VLD: '#9b59b6', VLE: '#9b59b6',
    MEI: '#1abc9c',
    PD:  '#e74c3c', PE:  '#e74c3c',
    CA:  '#c8102e',
};

export function getPosicaoColor(posicao) {
    return POSICAO_COLORS[posicao] ?? '#8a8a8a';
}

// ─── Resultado de partida ────────────────────────────────────
export function getResultadoInfo(resultado) {
    const map = {
        vitoria: { label: 'V', class: 'match-card--win',  icon: '✓' },
        empate:  { label: 'E', class: 'match-card--draw', icon: '–' },
        derrota: { label: 'D', class: 'match-card--loss', icon: '✗' },
    };
    return map[resultado] ?? { label: '?', class: '', icon: '?' };
}

// ─── Formatação de data ISO → pt-BR ─────────────────────────
export function formatarData(dataStr) {
    if (!dataStr) return '—';
    try {
        const [y, m, d] = dataStr.split('-');
        return `${d}/${m}/${y}`;
    } catch { return dataStr; }
}

// ─── Tipo de partida → rótulo legível ───────────────────────
export function formatMatchType(tipo) {
    const map = {
        leagueMatch:   'Liga',
        friendlyMatch: 'Amistoso',
        playoffMatch:  'Playoff',
    };
    return map[tipo] ?? tipo;
}

// ─── Estrelas de nota ────────────────────────────────────────
export function renderStars(nota) {
    const full = Math.round(nota);
    return Array.from({ length: 5 }, (_, i) =>
        `<span class="star ${i < full ? 'star--on' : 'star--off'}">★</span>`
    ).join('');
}

// ─── HTML de carregamento ────────────────────────────────────
export function renderLoading(container, msg = 'Carregando...') {
    container.innerHTML = `
        <div class="loading-wrapper">
            <div class="spinner"></div>
            <p>${msg}</p>
        </div>`;
}

// ─── HTML de erro ────────────────────────────────────────────
export function renderError(container, msg = 'Erro ao carregar dados.') {
    container.innerHTML = `
        <div class="empty-state">
            <span class="empty-state__icon">⚠️</span>
            <p class="empty-state__title">${msg}</p>
            <p class="empty-state__desc">Verifique se os scripts Python já foram executados via GitHub Actions.</p>
        </div>`;
}

// ─── Capitania badge ─────────────────────────────────────────
export function getCapitaniaIcon(capitania) {
    if (!capitania) return '';
    const num = capitania.replace(/[^0-9]/g, '');
    return `<span class="capitania-badge" title="${capitania}">${num}°C</span>`;
}

// ─── Mapeamento de fotos por pasta ───────────────────────────
const FOTO_MAP = {
    Thiago:      'src/assets/players/Thiago/face_thiago.jpeg',
    Abreu:       'src/assets/players/Abreu/apresentacao_abreu.jpg',
    Gaps:        'src/assets/players/Gaps/apresentacao_Gaps.jpg',
    Pedrao:      'src/assets/players/Pedrao/face_pedrao.png',
    DiLaurentis: 'src/assets/players/DiLaurentis/apresentacao_DiLaurentis.jpg',
    Pinto:       'src/assets/players/Pinto/apresentacao_pinto.webp',
    Gabri:       'src/assets/players/Gabri/face_gabri.png',
    Cleiton:     'src/assets/players/Cleiton/foto_cleiton.jpg',
    Formiga:     null,  // Sem foto mapeada ainda
};

export function getFotoPath(fotoPasta) {
    return FOTO_MAP[fotoPasta] ?? null;
}
