/**
 * api.js — Baile de Munique | Camada de Dados Multi-Temporada
 */

const _cache = new Map();
const SEASON_STORAGE_KEY = 'bm_season';
const DEFAULT_SEASON = 'fc27';
const VALID_SEASONS = ['fc27', 'fc26'];

export function getActiveSeason() {
    const saved = localStorage.getItem(SEASON_STORAGE_KEY);
    return VALID_SEASONS.includes(saved) ? saved : DEFAULT_SEASON;
}

export function setActiveSeason(seasonId) {
    if (!VALID_SEASONS.includes(seasonId)) return false;
    localStorage.setItem(SEASON_STORAGE_KEY, seasonId);
    return true;
}

export function getSeasonLabel(seasonId = getActiveSeason()) {
    return seasonId === 'fc26' ? 'FC26' : 'FC27';
    // return seasonId === 'fc26' ? 'EA FC 26' : 'EA FC 27';
}

function getPaths(season = getActiveSeason()) {
    return {
        seasons:  'config/seasons.json',
        club:     `config/${season}/club.json`,
        elencoCfg:`config/${season}/elenco.json`,
        stats:    `data/${season}/processed/stats.json`,
        elenco:   `data/${season}/processed/elenco_processado.json`,
        partidas: `data/${season}/processed/matches_processado.json`,
        players:  `data/${season}/processed/players.json`,
        pesquisa: `data/${season}/survey/pesquisa.json`,
    };
}

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

export const getSeasonsConfig = () => fetchJSON('config/seasons.json');
export const getClubConfig    = (s) => fetchJSON(getPaths(s).club);
export const getStats         = (s) => fetchJSON(getPaths(s).stats);
export const getElenco        = (s) => fetchJSON(getPaths(s).elenco);
export const getPartidas      = (s) => fetchJSON(getPaths(s).partidas);
export const getPlayersBase   = (s) => fetchJSON(getPaths(s).players);
export const getPesquisa      = (s) => fetchJSON(getPaths(s).pesquisa);
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
