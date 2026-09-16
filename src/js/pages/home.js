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
                        class="btn btn--ghost home-hero__instagram"
                        aria-label="Instagram do Baile de Munique"
                    >
                        📸 @bailedemunichofc
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
