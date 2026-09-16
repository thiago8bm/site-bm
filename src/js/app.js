/**
 * app.js — Baile de Munique | SPA Router Principal
 * Gerencia a navegação entre views sem reload de página.
 */

import { renderHome }         from './pages/home.js';
import { renderElenco }       from './pages/elenco.js';
import { renderUltimosJogos } from './pages/jogos.js';
import { renderEstatisticas } from './pages/estatisticas.js';
import { renderPesquisa }     from './pages/pesquisa.js';

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
    initRouter();
    initFooter();
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
        case 'noticias':     /* placeholder — Fase futura */ break;
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
function initFooter() {
    const lastUpdateEl  = document.getElementById('last-update');
    const updateErrorEl = document.getElementById('update-error');
    if (!lastUpdateEl) return;

    fetch('./data/processed/stats.json')
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            const ts = data?.last_updated;
            if (ts) {
                const formatted = new Date(ts).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                });
                lastUpdateEl.textContent = `Última atualização de dados: ${formatted}`;
            }
        })
        .catch(() => {
            lastUpdateEl.textContent = 'Dados ainda não sincronizados.';
            if (updateErrorEl) updateErrorEl.style.display = 'inline';
        });
}


// =====================================================
// EXPORTS
// =====================================================
export { navigateTo, ROUTES, DEFAULT_ROUTE };
