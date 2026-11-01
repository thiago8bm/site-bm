/**
 * app.js — Baile de Munique | SPA Router Principal
 * Gerencia a navegação entre views sem reload de página.
 */

import { renderHome }         from './pages/home.js';
import { renderElenco }       from './pages/elenco.js';
import { renderUltimosJogos } from './pages/jogos.js';
import { renderEstatisticas } from './pages/estatisticas.js';
import { renderPesquisa }     from './pages/pesquisa.js';
import { renderNoticias }     from './pages/noticias.js';
import { getActiveSeason, setActiveSeason, getSeasonLabel, getStats, getClubConfig } from './api.js';

// =====================================================
// CONSTANTES E CONFIGURAÇÃO
// =====================================================
const ROUTES       = ['home', 'elenco', 'noticias', 'jogos', 'estatisticas', 'pesquisa'];
const DEFAULT_ROUTE = 'home';

// Controla quais rotas já foram renderizadas (lazy render)
const _rendered = new Set();


// =====================================================
// BOOTSTRAP (aguarda DOM estar pronto)
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initTheme();
    initSeasonSelector();
    initRouter();
    initFooter();
    initTwitchLiveStatus();
});


// =====================================================
// HEADER — Hambúrguer + Overlay
// =====================================================
function initHeader() {
    const header    = document.querySelector('.header');
    const hamburger = document.querySelector('.hamburger');
    const navbar    = document.querySelector('.navbar');

    if (!header || !hamburger || !navbar) return;

    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    const openMenu  = () => {
        hamburger.classList.add('is-open');
        navbar.classList.add('is-open');
        overlay.classList.add('is-visible');
        hamburger.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        hamburger.classList.remove('is-open');
        navbar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    hamburger.addEventListener('click', () =>
        hamburger.classList.contains('is-open') ? closeMenu() : openMenu()
    );

    overlay.addEventListener('click', closeMenu);
    navbar.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
}


// =====================================================
// ROUTER — SPA Navigation
// =====================================================
function initRouter() {
    ensureAllViewsExist();

    const initialRoute = getRouteFromHash() || DEFAULT_ROUTE;
    navigateTo(initialRoute, false);

    // Cliques nos links de navegação
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('data-route'));
        });
    });

    // Botão voltar/avançar do browser
    window.addEventListener('hashchange', () => {
        const route = getRouteFromHash();
        if (route) navigateTo(route, false);
    });
}

function getRouteFromHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return ROUTES.includes(hash) ? hash : null;
}

function navigateTo(route, updateHash = true) {
    if (!ROUTES.includes(route)) {
        console.warn(`[Router] Rota desconhecida: "${route}". Redirecionando para home.`);
        route = DEFAULT_ROUTE;
    }

    // Oculta todas as seções
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

    // Fecha qualquer lightbox ativo (evita modal vazando em outras telas)
    document.querySelectorAll('.lightbox.is-open').forEach(lb => {
        lb.classList.remove('is-open');
        document.body.style.overflow = '';
    });

    // Exibe a seção alvo
    document.getElementById(`${route}-view`)?.classList.add('active');

    // Atualiza link ativo na navbar
    document.querySelectorAll('[data-route]').forEach(link =>
        link.classList.toggle('active', link.getAttribute('data-route') === route)
    );

    // Atualiza hash
    if (updateHash) history.pushState(null, '', `#${route}`);

    // Scroll suave ao topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Renderiza a rota (lazy: apenas na 1ª visita)
    renderRoute(route);
}

/**
 * Despacha o renderizador correto para cada rota.
 * Lazy rendering: cada rota só é processada uma vez.
 */
async function renderRoute(route) {
    if (_rendered.has(route)) return;
    _rendered.add(route);

    switch (route) {
        case 'home':         await renderHome();          break;
        case 'elenco':       await renderElenco();        break;
        case 'jogos':        await renderUltimosJogos();  break;
        case 'estatisticas': await renderEstatisticas();  break;
        case 'pesquisa':     await renderPesquisa();      break;
        case 'noticias':     await renderNoticias();      break;
        default: break;
    }
}

/**
 * Garante que todas as seções de rota existam no DOM.
 * home-view já existe no HTML; as demais são criadas aqui.
 */
function ensureAllViewsExist() {
    const appContent = document.getElementById('app-content');
    if (!appContent) return;

    ROUTES.forEach(route => {
        const sectionId = `${route}-view`;
        if (!document.getElementById(sectionId)) {
            const section = document.createElement('section');
            section.id        = sectionId;
            section.className = 'view-section';
            section.innerHTML = buildPlaceholderHTML(route);
            appContent.appendChild(section);
        }
    });
}

function buildPlaceholderHTML(route) {
    const labels = {
        home:         { icon: '🏠', title: 'Home',              desc: 'Bem-vindo ao Baile de Munique!' },
        elenco:       { icon: '👕', title: 'Elenco',            desc: 'Os jogadores do nosso clube.' },
        noticias:     { icon: '📰', title: 'Notícias',          desc: 'As últimas novidades do Baile.' },
        jogos:        { icon: '⚽', title: 'Últimos Jogos',      desc: 'Resultados das partidas recentes.' },
        estatisticas: { icon: '📊', title: 'Estatísticas',      desc: 'Dados e métricas do clube.' },
        pesquisa:     { icon: '🔍', title: 'Pesquisa de Elenco', desc: 'Dashboard interno do elenco.' },
    };

    const { icon, title, desc } = labels[route] ?? { icon: '📄', title: route, desc: '' };
    return `
        <div class="container">
            <div class="empty-state">
                <span class="empty-state__icon">${icon}</span>
                <h2 class="section-title">${title}</h2>
                <p class="empty-state__desc">${desc}</p>
            </div>
        </div>`;
}


// =====================================================
// FOOTER — Indicador de última atualização
// =====================================================
async function initFooter() {
    const lastUpdateEl  = document.getElementById('last-update');
    const updateErrorEl = document.getElementById('update-error');
    if (!lastUpdateEl) return;

    const season = getActiveSeason();
    const data = await getStats();
    const ts = data?.last_updated;

    if (ts) {
        const formatted = new Date(ts).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
        const suffix = season === 'fc26' ? ' (Arquivo FC 26)' : '';
        lastUpdateEl.textContent = `Última atualização de dados: ${formatted}${suffix}`;
        if (updateErrorEl) updateErrorEl.style.display = 'none';
    } else if (season === 'fc27') {
        lastUpdateEl.textContent = 'Temporada FC 27 — Aguardando 1ª sincronização';
        if (updateErrorEl) updateErrorEl.style.display = 'none';
    } else {
        lastUpdateEl.textContent = 'Dados ainda não sincronizados.';
        if (updateErrorEl) updateErrorEl.style.display = 'inline';
    }
}


// =====================================================
// SELETOR DE TEMPORADA
// =====================================================
function syncSeasonButtons() {
    const season = getActiveSeason();
    document.querySelectorAll('.season-btn[data-season]').forEach(btn => {
        const isActive = btn.getAttribute('data-season') === season;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
    document.title = `Baile de Munique | ${getSeasonLabel()} Pro Clubs`;
}

function initSeasonSelector() {
    syncSeasonButtons();
    document.querySelectorAll('.season-btn[data-season]').forEach(btn => {
        btn.addEventListener('click', () => switchSeason(btn.getAttribute('data-season')));
    });
}

function switchSeason(seasonId) {
    if (!setActiveSeason(seasonId)) return;
    syncSeasonButtons();
    _rendered.clear();
    initFooter();
    renderRoute(getRouteFromHash() || DEFAULT_ROUTE);
}

// =====================================================
// TEMA (DARK/LIGHT MODE)
// =====================================================
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    const iconSun = document.getElementById('theme-icon-sun');
    const iconMoon = document.getElementById('theme-icon-moon');
    const rootElement = document.documentElement;
    
    // O padrão é dark. Verifica se o usuário já salvou "light" no localStorage
    const savedTheme = localStorage.getItem('site-theme');
    if (savedTheme === 'light') {
        rootElement.setAttribute('data-theme', 'light');
        if (iconSun) iconSun.style.display = 'none';
        if (iconMoon) iconMoon.style.display = 'block';
    } else {
        rootElement.removeAttribute('data-theme');
        if (iconSun) iconSun.style.display = 'block';
        if (iconMoon) iconMoon.style.display = 'none';
    }

    toggleBtn.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            rootElement.removeAttribute('data-theme');
            localStorage.setItem('site-theme', 'dark');
            if (iconSun) iconSun.style.display = 'block';
            if (iconMoon) iconMoon.style.display = 'none';
        } else {
            rootElement.setAttribute('data-theme', 'light');
            localStorage.setItem('site-theme', 'light');
            if (iconSun) iconSun.style.display = 'none';
            if (iconMoon) iconMoon.style.display = 'block';
        }
        
        // Se a pessoa alternar de tema e estiver na aba de pesquisa, recomendamos dar refresh 
        // para os gráficos do Chart.js atualizarem as cores (opcional/UX enhancement)
        if (window.location.hash.includes('pesquisa')) {
            window.location.reload();
        }
    });
}


// =====================================================
// EXPORTS
// =====================================================
export { navigateTo, switchSeason, ROUTES, DEFAULT_ROUTE };

// =====================================================
// TWITCH LIVE STATUS
// =====================================================
async function initTwitchLiveStatus() {
    let isLive = false;
    let streamUrl = 'https://twitch.tv/oboueri';

    try {
        const clubConfig = await getClubConfig('fc27');
        if (clubConfig?.ao_vivo === true) {
            isLive = true;
        }
        
        if (!isLive) {
            const resTwitch = await fetch('https://decapi.me/twitch/uptime/oboueri');
            if (resTwitch.ok) {
                const text = await resTwitch.text();
                if (!text.toLowerCase().includes('offline')) {
                    isLive = true;
                }
            }
        }
    } catch (e) {
        console.warn('Não foi possível verificar status da Twitch.', e);
    }

    if (isLive) {
        const liveBtn = document.createElement('a');
        liveBtn.href = streamUrl;
        liveBtn.target = '_blank';
        liveBtn.rel = 'noopener noreferrer';
        liveBtn.className = 'floating-live-btn';
        liveBtn.innerHTML = '<div class="live-pulse"></div><span>ESTAMOS AO VIVO</span>';
        document.body.appendChild(liveBtn);
    }
}

