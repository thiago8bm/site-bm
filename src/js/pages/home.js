/**
 * pages/home.js — Baile de Munique
 * Renderiza a seção Home refatorada (Hero Temático, Divisões, Reputação e TheFicients News).
 */

import { renderLoading } from '../utils/helpers.js';
import { THEFICIENTS_EDITIONS, parseEdition, ordenarEdicoes, BASE_PATH_THEFICIENTS } from './noticias.js';

export async function renderHome() {
    const section = document.getElementById('home-view');
    if (!section) return;

    renderLoading(section, 'Carregando...');

    // Busca as configurações do clube no JSON dedicado
    let clubConfig = {
        divisaoAtual: 5,
        reputacaoNivel: 7,
        torcedores: "12.482.942",
        heroGradient: "linear-gradient(to bottom, rgba(0,0,0,0.40), rgba(0,0,0,0.80))"
    };

    try {
        const res = await fetch('./config/club.json');
        if (res.ok) {
            clubConfig = await res.json();
        }
    } catch (e) {
        console.warn('Não foi possível carregar config/club.json. Usando valores padrão.');
    }

    // Pega a última edição de forma dinâmica usando a lógica de noticias.js
    const theficientsParsed = THEFICIENTS_EDITIONS.map(parseEdition);
    const edicoes = ordenarEdicoes(theficientsParsed).filter(e => e.tipo === 'edicao');
    const ultimaEdicao = edicoes[0];
    const imgSrc = `${BASE_PATH_THEFICIENTS}${ultimaEdicao.filename}`;

    // Divisões
    const divisions = [
        { level: 5, src: 'divisao5.png', alt: 'Divisão 5' },
        { level: 4, src: 'divisao4.png', alt: 'Divisão 4' },
        { level: 3, src: 'divisioncrest3.png', alt: 'Divisão 3' },
        { level: 2, src: 'divisioncrest2.png', alt: 'Divisão 2' },
        { level: 1, src: 'divisao1.png', alt: 'Divisão 1' },
        { level: 0, src: 'divisaoElite.png', alt: 'Divisão Elite' }
    ];

    // Cálculo do Tier de Reputação
    let reputacaoTier = 0;
    let reputacaoTitulo = "Orgulho da cidade";
    
    if (clubConfig.reputacaoNivel >= 9) {
        reputacaoTier = 3;
        reputacaoTitulo = "Famoso mundialmente";
    } else if (clubConfig.reputacaoNivel >= 7) {
        reputacaoTier = 2;
        reputacaoTitulo = "Conhecido";
    } else if (clubConfig.reputacaoNivel >= 4) {
        reputacaoTier = 1;
        reputacaoTitulo = "Emergente";
    }

    section.innerHTML = '<div class="home-hero-wrapper" style="background-image: ' + clubConfig.heroGradient + ', url(\'./src/assets/img/estadioBM.png\');">' +
        '<div class="home-hero">' +
            '<div class="home-hero__content">' +
                '<img src="./src/assets/img/EscudoBM.jpeg" alt="Escudo Baile de Munique" class="home-hero__escudo">' +
                '<h2 class="home-hero__title">Baile de Munique</h2>' +
                '<p class="home-hero__subtitle">FC26 Pro Clubs · Formação 1-4-2-3-1</p>' +
                '<a href="https://www.instagram.com/bailedemunichofc/" target="_blank" rel="noopener noreferrer" class="btn btn--instagram home-hero__instagram" aria-label="Instagram do Baile de Munique">' +
                    '<svg class="instagram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">' +
                        '<defs>' +
                            '<radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">' +
                                '<stop offset="0%"  stop-color="#fdf497"/>' +
                                '<stop offset="5%"  stop-color="#fdf497"/>' +
                                '<stop offset="45%" stop-color="#fd5949"/>' +
                                '<stop offset="60%" stop-color="#d6249f"/>' +
                                '<stop offset="90%" stop-color="#285AEB"/>' +
                            '</radialGradient>' +
                        '</defs>' +
                        '<rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad)"/>' +
                        '<circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>' +
                        '<circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>' +
                    '</svg>' +
                    '@bailedemunichofc' +
                '</a>' +
            '</div>' +
        '</div>' +
    '</div>' +

    '<div class="container home-status-section">' +
        '<div class="status-grid">' +
            '<div class="status-card divisions-track-card">' +
                '<h4 class="status-card__title">Escalada de Divisões</h4>' +
                '<div class="divisions-track-container">' +
                    '<div class="divisions-progress-line"></div>' +
                    '<div class="divisions-track">' +
                        divisions.map(div => {
                            const isCurrent = div.level === clubConfig.divisaoAtual;
                            const isReached = div.level >= clubConfig.divisaoAtual;
                            const reachedClass = isReached ? 'is-reached' : 'not-reached';
                            const activeClass = isCurrent ? 'is-current' : '';
                            return '<div class="division-item ' + activeClass + ' ' + reachedClass + '" title="' + div.alt + '">' +
                                   '<img src="./src/assets/img/' + div.src + '" alt="' + div.alt + '">' +
                                   '</div>';
                        }).join('') +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="status-card reputation-card">' +
                '<h4 class="status-card__title">Reputação</h4>' +
                '<div class="reputation-content">' +
                    '<img src="./src/assets/img/reputacao-tier' + reputacaoTier + '.png" alt="Reputação do Clube" class="reputation-icon">' +
                    '<div class="reputation-info">' +
                        '<span class="reputation-level">Nível ' + clubConfig.reputacaoNivel + '</span>' +
                        '<span class="reputation-label">' + reputacaoTitulo + '</span>' +
                        '<span class="reputation-fans">' + clubConfig.torcedores + ' torcedores</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +

    '<div class="container home-news-section">' +
        '<h3 class="section-title">Última Edição do Jornal</h3>' +
        '<div class="latest-news-card">' +
            '<div class="latest-news__thumb">' +
                '<div class="latest-news__tag">ÚLTIMA EDIÇÃO</div>' +
                '<img src="' + imgSrc + '" alt="' + ultimaEdicao.rotulo + '">' +
            '</div>' +
            '<div class="latest-news__info">' +
                '<span class="latest-news__date">' + ultimaEdicao.data + '</span>' +
                '<h4 class="latest-news__title">' + ultimaEdicao.titulo + '</h4>' +
                '<p class="latest-news__desc">Acompanhe todos os bastidores, análises pós-jogo e entrevistas exclusivas na íntegra.</p>' +
                '<a href="#noticias" class="btn btn--primary" id="btn-ler-edicao">Ler Edição Completa</a>' +
            '</div>' +
        '</div>' +
    '</div>';

    const btnLer = document.getElementById('btn-ler-edicao');
    if (btnLer) {
        btnLer.addEventListener('click', () => {
            sessionStorage.setItem('openLatestNews', 'true');
            window.scrollTo(0, 0);
        });
    }
}
