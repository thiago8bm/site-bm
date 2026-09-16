/**
 * pages/home.js — Baile de Munique
 * Renderiza a seção Home com hero banner e stats do clube.
 */

import { getStats } from '../api.js';
import { renderLoading, renderError } from '../utils/helpers.js';

export async function renderHome() {
    const section = document.getElementById('home-view');
    if (!section) return;

    renderLoading(section, 'Carregando...');

    const stats = await getStats();

    const liga = stats?.liga ?? null;

    section.innerHTML = `
        <div class="container">
            <div class="home-hero">
                <div class="home-hero__content">
                    <img
                        src="./src/assets/img/EscudoBM.jpeg"
                        alt="Escudo Baile de Munique"
                        class="home-hero__escudo"
                    >
                    <h2 class="home-hero__title">Baile de Munique</h2>
                    <p class="home-hero__subtitle">FC26 Pro Clubs · Formação 1-4-2-3-1</p>

                    <a
                        href="https://www.instagram.com/bailedemunichofc/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn--instagram home-hero__instagram"
                        aria-label="Instagram do Baile de Munique"
                    >
                        <svg class="instagram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <defs>
                                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                                    <stop offset="0%"  stop-color="#fdf497"/>
                                    <stop offset="5%"  stop-color="#fdf497"/>
                                    <stop offset="45%" stop-color="#fd5949"/>
                                    <stop offset="60%" stop-color="#d6249f"/>
                                    <stop offset="90%" stop-color="#285AEB"/>
                                </radialGradient>
                            </defs>
                            <rect x="2" y="2" width="20" height="20" rx="6" ry="6" fill="url(#ig-grad)"/>
                            <circle cx="12" cy="12" r="4.5" fill="none" stroke="#fff" stroke-width="1.8"/>
                            <circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/>
                        </svg>
                        @bailedemunichofc
                    </a>
                </div>

                ${liga ? `
                <div class="home-hero__stats">
                    <div class="hero-stat">
                        <span class="hero-stat__value">${liga.total_partidas}</span>
                        <span class="hero-stat__label">Partidas</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat__value">${liga.vitorias}</span>
                        <span class="hero-stat__label">Vitórias</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat__value">${liga.gols_marcados}</span>
                        <span class="hero-stat__label">Gols</span>
                    </div>
                    <div class="hero-stat">
                        <span class="hero-stat__value">${liga.win_rate}%</span>
                        <span class="hero-stat__label">Aproveit.</span>
                    </div>
                </div>` : ''}
            </div>
        </div>`;
}
