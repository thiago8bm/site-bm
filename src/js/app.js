/**
 * app.js — Baile de Munique | SPA Router Principal
 * Gerencia a navegação entre views sem reload de página.
 */

import { renderHome, renderElenco, renderUltimosJogos, renderEstatisticas, renderPesquisa } from './ui.js';

// =====================================================
// CONSTANTES E CONFIGURAÇÃO
// =====================================================
const ROUTES = ['home', 'elenco', 'noticias', 'jogos', 'estatisticas', 'pesquisa'];
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

    // Cria overlay para fechar menu ao clicar fora (mobile)
    let overlay = document.querySelector('.nav-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
    }

    function openMenu() {
        hamburger.classList.add('is-open');
        navbar.classList.add('is-open');
        overlay.classList.add('is-visible');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        hamburger.classList.remove('is-open');
        navbar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.contains('is-open');
        isOpen ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    // Fechar ao clicar em link de navegação (mobile)
    navbar.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Fechar ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMenu();
    });
}



// =====================================================
// ROUTER — SPA Navigation
// =====================================================
function initRouter() {
    ensureAllViewsExist();

    // Lê a rota inicial do hash da URL
    const initialRoute = getRouteFromHash() || DEFAULT_ROUTE;
    navigateTo(initialRoute, false);

    // Escuta cliques nos links de navegação
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // Escuta mudanças de hash (botão voltar/avançar do browser)
    window.addEventListener('hashchange', () => {
        const route = getRouteFromHash();
        if (route) navigateTo(route, false);
    });
}

/**
 * Extrai a rota do hash da URL (ex: #elenco → 'elenco').
 * Retorna null se o hash não corresponder a uma rota válida.
 */
function getRouteFromHash() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return ROUTES.includes(hash) ? hash : null;
}

/**
 * Navega para a rota especificada:
 * 1. Oculta todas as view-sections
 * 2. Exibe a seção correta
 * 3. Atualiza o link ativo na navbar
 * 4. Atualiza o hash da URL
 */
function navigateTo(route, updateHash = true) {
    if (!ROUTES.includes(route)) {
        console.warn(`[Router] Rota desconhecida: "${route}". Redirecionando para home.`);
        route = DEFAULT_ROUTE;
    }

    // Oculta todas as seções
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });

    // Exibe a seção alvo
    const targetSection = document.getElementById(`${route}-view`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Atualiza link ativo na navbar
    document.querySelectorAll('[data-route]').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-route') === route);
    });

    // Atualiza hash sem disparar hashchange novamente
    if (updateHash) {
        history.pushState(null, '', `#${route}`);
    }

    // Scroll suave ao topo ao trocar de seção
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Renderiza o conteúdo da rota (lazy: apenas na primeira visita)
    renderRoute(route);

    console.log(`[Router] Navegou para: ${route}`);
}

/**
 * Despacha o renderizador correto para cada rota.
 * Usa lazy rendering: só executa na primeira visita.
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
        // noticias será implementado futuramente
        default: break;

    }
}

/**
 * Garante que todas as seções de rota existam no DOM.

 * Se não existir, cria um placeholder com loading state.
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
            console.log(`[Router] Seção criada dinamicamente: #${sectionId}`);
        }
    });
}

/**
 * Gera HTML de placeholder enquanto a seção ainda não
 * possui conteúdo real (será preenchida nas fases seguintes).
 */
function buildPlaceholderHTML(route) {
    const labels = {
        home:         { icon: '🏠', title: 'Home',              desc: 'Bem-vindo ao Baile de Munique!' },
        elenco:       { icon: '👕', title: 'Elenco',            desc: 'Os jogadores do nosso clube.' },
        noticias:     { icon: '📰', title: 'Notícias',          desc: 'As últimas novidades do Baile.' },
        jogos:        { icon: '⚽', title: 'Últimos Jogos',      desc: 'Resultados das partidas recentes.' },
        estatisticas: { icon: '📊', title: 'Estatísticas',      desc: 'Dados e métricas do clube.' },
        pesquisa:     { icon: '🔍', title: 'Pesquisa de Elenco', desc: 'Dashboard interno do elenco.' },
    };

    const { icon, title, desc } = labels[route] || { icon: '📄', title: route, desc: '' };

    return `
        <div class="container">
            <div class="empty-state">
                <span class="empty-state__icon">${icon}</span>
                <h2 class="section-title">${title}</h2>
                <p class="empty-state__desc">${desc}</p>
            </div>
        </div>
    `;
}

// =====================================================
// FOOTER — Indicador de última atualização
// =====================================================
function initFooter() {
    const lastUpdateEl  = document.getElementById('last-update');
    const updateErrorEl = document.getElementById('update-error');

    if (!lastUpdateEl) return;

    // Tenta ler o timestamp do arquivo stats.json gerado pelos scripts Python
    fetch('./data/stats.json')
        .then(res => {
            if (!res.ok) throw new Error('stats.json não encontrado');
            return res.json();
        })
        .then(data => {
            const ts = data?.last_updated;
            if (ts) {
                const date = new Date(ts);
                const formatted = date.toLocaleString('pt-BR', {
                    day:    '2-digit',
                    month:  '2-digit',
                    year:   'numeric',
                    hour:   '2-digit',
                    minute: '2-digit',
                });
                lastUpdateEl.textContent = `Última atualização de dados: ${formatted}`;
            } else {
                lastUpdateEl.textContent = 'Última atualização de dados: desconhecida';
            }
        })
        .catch(() => {
            // Tenta fallback com players_club_stats.json
            return fetch('./data/players_club_stats.json')
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    const ts = data?.last_updated;
                    if (ts) {
                        const date = new Date(ts);
                        lastUpdateEl.textContent = `Última atualização de dados: ${date.toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        })}`;
                    } else {
                        lastUpdateEl.textContent = 'Dados ainda não sincronizados.';
                        if (updateErrorEl) {
                            updateErrorEl.style.display = 'inline';
                        }
                    }
                })
                .catch(() => {
                    lastUpdateEl.textContent = 'Dados ainda não sincronizados.';
                    if (updateErrorEl) updateErrorEl.style.display = 'inline';
                });
        });
}

// =====================================================
// EXPORTS (para uso nos módulos das fases seguintes)
// =====================================================
export { navigateTo, ROUTES, DEFAULT_ROUTE };
