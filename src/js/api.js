/**
 * api.js — Baile de Munique | Camada de Dados
 * Busca os JSONs estáticos de data/processed/ e data/survey/,
 * com cache em memória para evitar fetches redundantes.
 */

const _cache = new Map();

async function fetchJSON(path) {
    if (_cache.has(path)) return _cache.get(path);
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${path}`);
        const data = await res.json();
        _cache.set(path, data);
        return data;
    } catch (err) {
        console.error(`[API] Falha ao buscar ${path}:`, err);
        return null;
    }
}

// Caminhos dos JSONs processados
const PATHS = {
    stats:    'data/processed/stats.json',
    elenco:   'data/processed/elenco_processado.json',
    partidas: 'data/processed/matches_processado.json',
    pesquisa: 'data/survey/pesquisa.json',
};

export const getStats        = ()      => fetchJSON(PATHS.stats);
export const getElenco       = ()      => fetchJSON(PATHS.elenco);
export const getPartidas     = ()      => fetchJSON(PATHS.partidas);
export const getPesquisa     = ()      => fetchJSON(PATHS.pesquisa);

/** Retorna partidas filtradas por tipo ('leagueMatch', 'friendlyMatch', etc.) ou todas */
export async function getPartidasByTipo(tipo = null) {
    const raw = await getPartidas();
    if (!raw?.data) return [];
    if (!tipo) return raw.data;
    return raw.data.filter(p => p.tipo === tipo);
}

/** Retorna o timestamp da última atualização do stats.json */
export async function getLastUpdated() {
    const stats = await getStats();
    return stats?.last_updated ?? null;
}

/** Invalida o cache para um path específico (ou todos, se não passar argumento) */
export function invalidateCache(path = null) {
    if (path) _cache.delete(path);
    else _cache.clear();
}
