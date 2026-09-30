/**
 * pages/noticias.js — Baile de Munique
 * Galeria de jornais/edições das editoras parceiras.
 * Lê os arquivos estáticos de src/assets/news/ sem necessitar de JSON externo.
 */

import { renderLoading } from '../utils/helpers.js';

// ─── Mapa estático de todas as edições disponíveis ────────────────────────────
// Formato de nome: {Editora}_{tipo}{numero}_{DDMM}.jpg
// Editoras conhecidas: TheFicientsNews, BMNews (vazia por ora)

// A lista de edições agora é lida dinamicamente do arquivo config/news_index.json

export const BASE_PATH_THEFICIENTS = './src/assets/news/TheFicientsNews/';
const BASE_PATH_BMNEWS      = './src/assets/news/BMNews/';

// ─── Parser do nome de arquivo ────────────────────────────────────────────────
export function parseEdition(filename) {
    const noExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    let tipo, numero, rotulo, dataFormatada;

    // Padrão Universal: {tipo}{numero}_{YYYY-MM-DD}_{Titulo}
    // Exemplos: edicao25_2026-09-25_Estreia-Tesao.jpg, plantao07_2026-08-16_Urgente.jpg, poster_2026-08-25_Campeoes.jpg
    const matchUniversal = noExt.match(/^(edicao|plantao|poster)(\d*)_(\d{4}-\d{2}-\d{2})_?(.*)$/i);
    if (matchUniversal) {
        tipo = matchUniversal[1].toLowerCase();
        numero = matchUniversal[2] ? parseInt(matchUniversal[2], 10) : null;
        
        const isoDate = matchUniversal[3];
        const dateParts = isoDate.split('-');
        dataFormatada = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        const tituloLimpo = matchUniversal[4] ? matchUniversal[4].replace(/-/g, ' ') : '';
        
        if (tipo === 'edicao') {
            rotulo = `Edição Nº ${numero}${tituloLimpo ? ' — ' + tituloLimpo : ''}`;
        } else if (tipo === 'plantao') {
            rotulo = `Plantão ${numero ? 'Nº '+numero : ''}${tituloLimpo ? ' — ' + tituloLimpo : ''}`;
        } else {
            rotulo = `Poster${tituloLimpo ? ' — ' + tituloLimpo : ''}`;
        }
        
        return { tipo, numero, rotulo, data: dataFormatada, filename, titulo: tituloLimpo };
    }

    // Antigo padrão: TheFicientsNews_22ed_0509
    const parts = noExt.split('_');
    const tipoPart = parts[1] ?? '';
    const ddmm = parts[2] ?? '';

    dataFormatada = ddmm.length === 4
        ? `${ddmm.slice(0, 2)}/${ddmm.slice(2)}`
        : '—';

    if (tipoPart.startsWith('poster')) {
        tipo = 'poster';
        numero = null;
        rotulo = `Poster — ${dataFormatada}`;
    } else if (tipoPart.startsWith('plantao')) {
        tipo = 'plantao';
        numero = parseInt(tipoPart.replace('plantao', ''), 10);
        rotulo = `Plantão #${numero} — ${dataFormatada}`;
    } else {
        tipo = 'edicao';
        numero = parseInt(tipoPart.replace('ed', ''), 10);
        rotulo = `Edição ${numero} — ${dataFormatada}`;
    }

    return { tipo, numero, rotulo, data: dataFormatada, filename, titulo: rotulo };
}

// ─── Ordenação: edições regulares (por número) → plantões → posters ──────────
export function ordenarEdicoes(lista) {
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

    let indexData = { TheFicientsNews: [], BMNews: [] };
    try {
        const response = await fetch('./config/news_index.json');
        if (response.ok) {
            indexData = await response.json();
        }
    } catch (e) {
        console.error('Erro ao carregar o json de notícias', e);
    }

    const theficientsParsed = (indexData.TheFicientsNews || []).map(parseEdition);
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
            <button class="lightbox__nav lightbox__nav--prev" id="lb-prev" aria-label="Anterior">⟨</button>
            <button class="lightbox__nav lightbox__nav--next" id="lb-next" aria-label="Próximo">⟩</button>
            
            <div class="lightbox__content-wrapper">
                <div class="lightbox__inner">
                    <img class="lightbox__img" id="lightbox-img" src="" alt="">
                    <p class="lightbox__caption" id="lightbox-caption"></p>
                </div>
                
                <div class="lightbox__sidebar">
                    <div class="reactions-panel">
                        <button class="reaction-btn btn-like" id="btn-like">👍 <span id="like-count">0</span></button>
                        <button class="reaction-btn btn-dislike" id="btn-dislike">👎 <span id="dislike-count">0</span></button>
                    </div>
                    
                    <div class="comments-section">
                        <h4 class="comments-title">Comentários da Torcida</h4>
                        <div class="comments-list" id="comments-list">
                            <div class="loading-comments" id="loading-comments">Carregando comentários...</div>
                        </div>
                        <form class="comment-form" id="comment-form">
                            <input type="text" id="comment-name" placeholder="Seu nome" required maxlength="30">
                            <textarea id="comment-text" placeholder="O que achou?" required rows="2" maxlength="200"></textarea>
                            <button type="submit" class="btn btn--primary btn--sm" id="btn-submit-comment">Enviar</button>
                        </form>
                    </div>
                </div>
            </div>
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
    
    // Remove do container atual e injeta no body para escapar de z-index e transform contexts
    if (lightbox.parentNode !== document.body) {
        document.body.appendChild(lightbox);
    }

    const cards = Array.from(document.getElementById('noticias-view').querySelectorAll('.noticia-card'));
    let currentIdx = 0;

    const open = (idx) => {
        currentIdx = idx;
        const card  = cards[idx];
        imgEl.src   = card.dataset.src;
        imgEl.alt   = card.dataset.caption;
        captionEl.textContent = card.dataset.caption;
        lightbox.classList.add('is-open');
        lightbox.classList.remove('is-zoomed');
        document.body.style.overflow = 'hidden';

        // --- LÓGICA DE REAÇÕES E COMENTÁRIOS ---
        document.getElementById('like-count').textContent = '...';
        document.getElementById('dislike-count').textContent = '...';
        document.getElementById('comments-list').innerHTML = '<div class="loading-comments">Carregando comentários...</div>';
        
        const editionId = card.dataset.src.split('/').pop().replace(/\.[^/.]+$/, "");
        lightbox.dataset.editionId = editionId;
        
        fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec?editionId=' + editionId)
            .then(res => res.json())
            .then(data => {
                if (lightbox.dataset.editionId !== editionId) return;
                
                document.getElementById('like-count').textContent = data.likes || 0;
                document.getElementById('dislike-count').textContent = data.dislikes || 0;
                
                // Reseta visual dos botões
                const interacted = JSON.parse(localStorage.getItem('bm_reactions') || '{}');
                const state = interacted[editionId];
                
                const btnLike = document.getElementById('btn-like');
                const btnDislike = document.getElementById('btn-dislike');
                
                btnLike.style.background = (state === 'like') ? 'rgba(46, 204, 113, 0.2)' : 'transparent';
                btnLike.style.borderColor = (state === 'like') ? '#2ecc71' : 'var(--color-gray-200)';
                
                btnDislike.style.background = (state === 'dislike') ? 'rgba(231, 76, 60, 0.2)' : 'transparent';
                btnDislike.style.borderColor = (state === 'dislike') ? '#e74c3c' : 'var(--color-gray-200)';

                const list = document.getElementById('comments-list');
                list.innerHTML = '';
                if (!data.comments || data.comments.length === 0) {
                    list.innerHTML = '<div class="empty-comments">Seja o primeiro a comentar!</div>';
                } else {
                    data.comments.forEach(c => {
                        list.innerHTML += `<div class="comment-item"><strong>${c.name}</strong> <span class="comment-date">${c.date}</span><p>${c.text}</p></div>`;
                    });
                }
            })
            .catch(err => {
                console.error(err);
                document.getElementById('comments-list').innerHTML = '<div class="empty-comments">Erro ao carregar comentários.</div>';
            });
    };

    const close = () => {
        lightbox.classList.remove('is-open');
        lightbox.classList.remove('is-zoomed');
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

    // Zoom ao clicar na imagem
    imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        lightbox.classList.toggle('is-zoomed');
    });

    // Fechar ao clicar fora da imagem
    lightbox.addEventListener('click', e => { 
        if (e.target === lightbox || e.target.classList.contains('lightbox__inner')) {
            close();
        }
    });

    // Teclado
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   prev();
        if (e.key === 'ArrowRight')  next();
    });

    // Auto-open via trigger da Home
    if (sessionStorage.getItem('openLatestNews') === 'true') {
        sessionStorage.removeItem('openLatestNews');
        setTimeout(() => open(0), 100);
    }

    // --- EVENTOS DE REAÇÃO E COMENTÁRIO ---
    const updateBtnStyles = (hasLiked, hasDisliked) => {
        const btnLike = document.getElementById('btn-like');
        const btnDislike = document.getElementById('btn-dislike');
        
        btnLike.style.background = hasLiked ? 'rgba(46, 204, 113, 0.2)' : 'transparent';
        btnLike.style.borderColor = hasLiked ? '#2ecc71' : 'var(--color-gray-200)';
        
        btnDislike.style.background = hasDisliked ? 'rgba(231, 76, 60, 0.2)' : 'transparent';
        btnDislike.style.borderColor = hasDisliked ? '#e74c3c' : 'var(--color-gray-200)';
    };

    const sendReaction = (type) => {
        const editionId = lightbox.dataset.editionId;
        if(!editionId) return;
        
        let interacted = JSON.parse(localStorage.getItem('bm_reactions') || '{}');
        const currentState = interacted[editionId]; // 'like', 'dislike' ou undefined
        
        let actionsToSend = [];
        
        // Se já está clicado no mesmo botão -> REMOVER
        if (currentState === type) {
            delete interacted[editionId];
            actionsToSend.push('remove_' + type);
            
            const span = document.getElementById(type + '-count');
            span.textContent = Math.max(0, parseInt(span.textContent || 0) - 1);
        } 
        // Se estava clicado no outro botão -> TROCAR
        else if (currentState && currentState !== type) {
            interacted[editionId] = type;
            actionsToSend.push('remove_' + currentState);
            actionsToSend.push(type);
            
            const oldSpan = document.getElementById(currentState + '-count');
            oldSpan.textContent = Math.max(0, parseInt(oldSpan.textContent || 0) - 1);
            
            const newSpan = document.getElementById(type + '-count');
            newSpan.textContent = parseInt(newSpan.textContent || 0) + 1;
        }
        // Se nunca clicou -> ADICIONAR
        else {
            interacted[editionId] = type;
            actionsToSend.push(type);
            
            const span = document.getElementById(type + '-count');
            span.textContent = parseInt(span.textContent || 0) + 1;
        }
        
        localStorage.setItem('bm_reactions', JSON.stringify(interacted));
        updateBtnStyles(interacted[editionId] === 'like', interacted[editionId] === 'dislike');
        
        // Dispara requisições
        actionsToSend.forEach(actionName => {
            fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec', {
                method: 'POST',
                body: JSON.stringify({ action: actionName, editionId: editionId }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
        });
    };
    
    document.getElementById('btn-like').addEventListener('click', () => sendReaction('like'));
    document.getElementById('btn-dislike').addEventListener('click', () => sendReaction('dislike'));
    
    const commentForm = document.getElementById('comment-form');
    if(commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('comment-name').value;
            const text = document.getElementById('comment-text').value;
            const btn = document.getElementById('btn-submit-comment');
            
            btn.disabled = true;
            btn.textContent = 'Enviando...';
            
            fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec', {
                method: 'POST',
                body: JSON.stringify({ action: 'comment', editionId: lightbox.dataset.editionId, name: name, comment: text }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            }).then(() => {
                const list = document.getElementById('comments-list');
                const empty = list.querySelector('.empty-comments');
                if(empty) empty.remove();
                
                const newComment = `<div class="comment-item"><strong>${name}</strong> <span class="comment-date">Agora mesmo</span><p>${text}</p></div>`;
                list.insertAdjacentHTML('afterbegin', newComment);
                commentForm.reset();
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Enviar';
            });
        });
    }
}
