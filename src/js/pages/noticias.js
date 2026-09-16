/**
 * pages/noticias.js — Baile de Munique
 * Galeria de jornais/edições das editoras parceiras.
 * Lê os arquivos estáticos de src/assets/news/ sem necessitar de JSON externo.
 */

import { renderLoading } from '../utils/helpers.js';

// ─── Mapa estático de todas as edições disponíveis ────────────────────────────
// Formato de nome: {Editora}_{tipo}{numero}_{DDMM}.jpg
// Editoras conhecidas: TheFicientsNews, BMNews (vazia por ora)

const THEFICIENTS_EDITIONS = [
    'TheFicientsNews_1ed_1507.jpg',
    'TheFicientsNews_2ed_1607.jpg',
    'TheFicientsNews_3ed_2107.jpg',
    'TheFicientsNews_4ed_2207.jpg',
    'TheFicientsNews_5ed_2307.jpg',
    'TheFicientsNews_6ed_2407.jpg',
    'TheFicientsNews_7ed_0308.jpg',
    'TheFicientsNews_8ed_0408.jpg',
    'TheFicientsNews_9ed_0608.jpg',
    'TheFicientsNews_10ed_0708.jpg',
    'TheFicientsNews_11ed_1008.jpg',
    'TheFicientsNews_12ed_1208.jpg',
    'TheFicientsNews_13ed_1408.jpg',
    'TheFicientsNews_14ed_1508.jpg',
    'TheFicientsNews_15ed_1708.jpg',
    'TheFicientsNews_16ed_1808.jpg',
    'TheFicientsNews_17ed_2008.jpg',
    'TheFicientsNews_18ed_2208.jpg',
    'TheFicientsNews_19ed_2808.jpg',
    'TheFicientsNews_20ed_0209.jpg',
    'TheFicientsNews_21ed_0509.jpg',
    'TheFicientsNews_22ed_0509.jpg',
    // Plantões
    'TheFicientsNews_plantao1_2807.jpg',
    'TheFicientsNews_plantao2_2907.jpg',
    'TheFicientsNews_plantao3_1208.jpg',
    'TheFicientsNews_plantao4_1308.jpg',
    'TheFicientsNews_plantao5_1308.jpg',
    'TheFicientsNews_plantao6_1608.jpg',
    // Poster
    'TheFicientsNews_poster_2508.jpg',
];

const BASE_PATH_THEFICIENTS = './src/assets/news/TheFicientsNews/';
const BASE_PATH_BMNEWS      = './src/assets/news/BMNews/';

// ─── Parser do nome de arquivo ────────────────────────────────────────────────
function parseEdition(filename) {
    // Extrai tudo após o prefixo da editora
    // Ex: TheFicientsNews_22ed_0509.jpg → tipo=ed, num=22, ddmm=0509
    // Ex: TheFicientsNews_plantao3_1208.jpg → tipo=plantao, num=3, ddmm=1208
    // Ex: TheFicientsNews_poster_2508.jpg → tipo=poster, ddmm=2508

    const noExt   = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const parts   = noExt.split('_');
    // parts[0] = editora, parts[1] = tipo+num, parts[2] = ddmm

    const tipoPart = parts[1] ?? '';
    const ddmm     = parts[2] ?? '';

    // Data formatada
    const dataFormatada = ddmm.length === 4
        ? `${ddmm.slice(0, 2)}/${ddmm.slice(2)}`
        : '—';

    let tipo, numero, rotulo;

    if (tipoPart.startsWith('poster')) {
        tipo   = 'poster';
        numero = null;
        rotulo = `Poster — ${dataFormatada}`;
    } else if (tipoPart.startsWith('plantao')) {
        tipo   = 'plantao';
        numero = parseInt(tipoPart.replace('plantao', ''), 10);
        rotulo = `Plantão #${numero} — ${dataFormatada}`;
    } else {
        // ex: "22ed"
        tipo   = 'edicao';
        numero = parseInt(tipoPart.replace('ed', ''), 10);
        rotulo = `Edição ${numero} — ${dataFormatada}`;
    }

    return { tipo, numero, rotulo, data: dataFormatada, filename };
}

// ─── Ordenação: edições regulares (por número) → plantões → posters ──────────
function ordenarEdicoes(lista) {
    const order = { edicao: 0, plantao: 1, poster: 2 };
    return [...lista].sort((a, b) => {
        if (order[a.tipo] !== order[b.tipo]) return order[a.tipo] - order[b.tipo];
        return (b.numero ?? 0) - (a.numero ?? 0); // mais recente primeiro
    });
}

// ─── Render principal ─────────────────────────────────────────────────────────
export async function renderNoticias() {
    const section = document.getElementById('noticias-view');
    if (!section) return;

    renderLoading(section, 'Carregando edições...');

    const theficientsParsed = THEFICIENTS_EDITIONS.map(parseEdition);
    const theficientsOrdenadas = ordenarEdicoes(theficientsParsed);

    const edicoes      = theficientsOrdenadas.filter(e => e.tipo === 'edicao');
    const plantoes     = theficientsOrdenadas.filter(e => e.tipo === 'plantao');
    const posters      = theficientsOrdenadas.filter(e => e.tipo === 'poster');

    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">Notícias</h2>
            <p class="section-subtitle">Cobertura da imprensa esportiva do Baile de Munique</p>

            <!-- TheFicients News -->
            <div class="editora-bloco">
                <div class="editora-header">
                    <div>
                        <h3 class="editora-nome">📰 TheFicients News</h3>
                        <p class="editora-desc">${edicoes.length} edições · ${plantoes.length} plantões · ${posters.length} poster</p>
                    </div>
                </div>

                <h4 class="noticias-subtitulo">Edições Regulares</h4>
                <div class="noticias-grid" id="grid-edicoes">
                    ${edicoes.map(e => buildCard(e, BASE_PATH_THEFICIENTS)).join('')}
                </div>

                ${plantoes.length ? `
                <h4 class="noticias-subtitulo">Plantões</h4>
                <div class="noticias-grid">
                    ${plantoes.map(e => buildCard(e, BASE_PATH_THEFICIENTS)).join('')}
                </div>` : ''}

                ${posters.length ? `
                <h4 class="noticias-subtitulo">Posters</h4>
                <div class="noticias-grid noticias-grid--poster">
                    ${posters.map(e => buildCard(e, BASE_PATH_THEFICIENTS)).join('')}
                </div>` : ''}
            </div>

            <!-- BMNews (vazia por enquanto) -->
            <div class="editora-bloco">
                <div class="editora-header">
                    <h3 class="editora-nome">📋 BMNews</h3>
                </div>
                <div class="empty-state" style="padding:var(--spacing-xl) 0;">
                    <span class="empty-state__icon" style="opacity:0.3">📭</span>
                    <p class="empty-state__title">Primeiras edições em breve!</p>
                    <p class="empty-state__desc">A BMNews ainda não possui edições publicadas.</p>
                </div>
            </div>
        </div>

        <!-- Lightbox -->
        <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Visualizar jornal">
            <button class="lightbox__close" id="lightbox-close" aria-label="Fechar">✕</button>
            <button class="lightbox__nav lightbox__nav--prev" id="lb-prev" aria-label="Anterior">‹</button>
            <div class="lightbox__inner">
                <img class="lightbox__img" id="lightbox-img" src="" alt="">
                <p class="lightbox__caption" id="lightbox-caption"></p>
            </div>
            <button class="lightbox__nav lightbox__nav--next" id="lb-next" aria-label="Próximo">›</button>
        </div>`;

    initLightbox();
}

// ─── Card de edição ───────────────────────────────────────────────────────────
function buildCard(edicao, basePath) {
    const imgSrc = `${basePath}${edicao.filename}`;
    const badgeClass = {
        edicao:  'badge--blue',
        plantao: 'badge--red',
        poster:  'badge--green',
    }[edicao.tipo] ?? 'badge--gray';

    const badgeLabel = {
        edicao:  `Nº ${edicao.numero}`,
        plantao: 'Plantão',
        poster:  'Poster',
    }[edicao.tipo] ?? '';

    return `
    <div class="noticia-card" data-src="${imgSrc}" data-caption="${edicao.rotulo}" role="button" tabindex="0" aria-label="Abrir ${edicao.rotulo}">
        <div class="noticia-card__thumb">
            <img src="${imgSrc}" alt="${edicao.rotulo}" loading="lazy">
            <div class="noticia-card__overlay">
                <span class="noticia-card__zoom">🔍</span>
            </div>
        </div>
        <div class="noticia-card__info">
            <span class="badge ${badgeClass}">${badgeLabel}</span>
            <span class="noticia-card__data">${edicao.data}</span>
        </div>
    </div>`;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function initLightbox() {
    const lightbox  = document.getElementById('lightbox');
    const imgEl     = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const btnClose  = document.getElementById('lightbox-close');
    const btnPrev   = document.getElementById('lb-prev');
    const btnNext   = document.getElementById('lb-next');

    if (!lightbox || !imgEl) return;

    const cards = Array.from(document.getElementById('noticias-view').querySelectorAll('.noticia-card'));
    let currentIdx = 0;

    const open = (idx) => {
        currentIdx = idx;
        const card  = cards[idx];
        imgEl.src   = card.dataset.src;
        imgEl.alt   = card.dataset.caption;
        captionEl.textContent = card.dataset.caption;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
        imgEl.src = '';
    };

    const prev = () => open((currentIdx - 1 + cards.length) % cards.length);
    const next = () => open((currentIdx + 1) % cards.length);

    // Cliques nos cards
    cards.forEach((card, idx) => {
        card.addEventListener('click', () => open(idx));
        card.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') open(idx); });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    // Fechar ao clicar fora da imagem
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    // Teclado
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   prev();
        if (e.key === 'ArrowRight')  next();
    });
}
