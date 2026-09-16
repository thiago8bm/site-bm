/**
 * api.js — Baile de Munique | Camada de Dados
 * Funções assíncronas para consumir os arquivos .json em /data/.
 */

const BASE_DATA_PATH = './data';

// Cache em memória para evitar múltiplos fetches na mesma sessão
const _cache = {};

/**
 * Fetch genérico com cache e tratamento de erros.
 * @param {string} filename — nome do arquivo JSON (ex: 'stats.json')
 * @returns {Promise<object|null>}
 */
async function fetchJSON(filename) {
    if (_cache[filename]) return _cache[filename];

    try {
        const res = await fetch(`${BASE_DATA_PATH}/${filename}`);
        if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${filename}`);
        const data = await res.json();
        _cache[filename] = data;
        return data;
    } catch (err) {
        console.error(`[API] Erro ao carregar ${filename}:`, err.message);
        return null;
    }
}

// =====================================================
// FUNÇÕES PÚBLICAS DE ACESSO AOS DADOS
// =====================================================

/**
 * Retorna os dados globais do clube (stats.json).
 * Contém last_updated, info da liga, rankings, etc.
 */
export async function getStats() {
    return await fetchJSON('stats.json');
}

/**
 * Retorna o elenco processado (elenco_processado.json).
 * Cada item tem: nome, posição tática corrigida, stats, etc.
 */
export async function getElenco() {
    const raw = await fetchJSON('elenco_processado.json');
    return raw ? raw.data ?? [] : [];
}

/**
 * Retorna as partidas processadas (matches_processado.json).
 * Cada item tem: adversário, placar, resultado, marcadores, mvp.
 * @param {string} [tipo] — filtra por tipo: 'leagueMatch', 'friendlyMatch', etc.
 *                          Se omitido, retorna todas.
 */
export async function getPartidas(tipo = null) {
    const raw = await fetchJSON('matches_processado.json');
    if (!raw) return [];
    const partidas = raw.data ?? [];
    if (!tipo) return partidas;
    return partidas.filter(p => p.tipo === tipo);
}

/**
 * Retorna os dados da pesquisa de elenco (pesquisa.json).
 */
export async function getPesquisa() {
    return await fetchJSON('pesquisa.json');
}

/**
 * Retorna os dados brutos dos jogadores definidos manualmente (players.json).
 * Usado para metadados como fotos e capitania quando o processado não tiver.
 */
export async function getPlayersBase() {
    const raw = await fetchJSON('players.json');
    return raw ? raw.data ?? [] : [];
}

/**
 * Retorna o timestamp da última atualização lendo stats.json.
 * Retorna null se não disponível.
 */
export async function getLastUpdated() {
    const stats = await getStats();
    return stats?.last_updated ?? null;
}

/**
 * Invalida o cache de um arquivo específico (útil em dev ou refresh manual).
 * @param {string} [filename] — se omitido, limpa todo o cache.
 */
export function invalidateCache(filename = null) {
    if (filename) {
        delete _cache[filename];
    } else {
        Object.keys(_cache).forEach(k => delete _cache[k]);
    }
}
