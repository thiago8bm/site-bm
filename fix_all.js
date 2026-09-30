const fs = require('fs');

let content = fs.readFileSync('src/js/pages/noticias.js', 'utf8');

const regex = /function initLightbox\(\) \{[\s\S]*\}\n\n\/\/ --- Card de edição ---/;

const cleanFunction = `function initLightbox() {
    const lightbox  = document.getElementById('lightbox');
    const imgEl     = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const btnClose  = document.getElementById('lightbox-close');
    const btnPrev   = document.getElementById('lb-prev');
    const btnNext   = document.getElementById('lb-next');

    if (!lightbox) return;

    const cards = Array.from(document.getElementById('noticias-view').querySelectorAll('.noticia-card'));
    let currentIdx = 0;

    const formatDate = (dateStr) => {
        if (!dateStr || !dateStr.includes('T')) return dateStr;
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
        } catch(e) { return dateStr; }
    };

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
        
        const editionId = card.dataset.src.split('/').pop().replace(/\\.[^/.]+$/, "");
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
                    const myComments = JSON.parse(localStorage.getItem('bm_my_comments') || '[]');
                    data.comments.forEach(c => {
                        const isMine = c.id && myComments.includes(c.id);
                        const deleteBtn = isMine ? \`<button class="btn-delete-comment" data-id="\${c.id}" title="Apagar comentário">🗑️</button>\` : '';
                        list.innerHTML += \`<div class="comment-item" id="comment-\${c.id}">
                            \${deleteBtn}
                            <strong>\${c.name}</strong> <span class="comment-date">\${formatDate(c.date)}</span>
                            <p>\${c.text}</p>
                        </div>\`;
                    });
                    
                    list.querySelectorAll('.btn-delete-comment').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const id = e.target.dataset.id;
                            if(confirm('Tem certeza que deseja apagar seu comentário?')) {
                                const cmtDiv = document.getElementById('comment-' + id);
                                if(cmtDiv) cmtDiv.style.opacity = '0.5';
                                fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec', {
                                    method: 'POST',
                                    body: JSON.stringify({ action: 'delete_comment', editionId: editionId, commentId: id }),
                                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                                }).then(() => {
                                    if(cmtDiv) cmtDiv.remove();
                                });
                            }
                        });
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

    cards.forEach((card, idx) => {
        card.addEventListener('click', () => open(idx));
        card.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') open(idx); });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    imgEl.addEventListener('click', (e) => {
        e.stopPropagation();
        lightbox.classList.toggle('is-zoomed');
    });

    lightbox.addEventListener('click', e => { 
        if (e.target === lightbox || e.target.classList.contains('lightbox__inner')) {
            close();
        }
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   prev();
        if (e.key === 'ArrowRight')  next();
    });

    if (sessionStorage.getItem('openLatestNews') === 'true') {
        sessionStorage.removeItem('openLatestNews');
        setTimeout(() => open(0), 100);
    }

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
        const currentState = interacted[editionId];
        
        let actionsToSend = [];
        
        if (currentState === type) {
            delete interacted[editionId];
            actionsToSend.push('remove_' + type);
            const span = document.getElementById(type + '-count');
            span.textContent = Math.max(0, parseInt(span.textContent || 0) - 1);
        } else if (currentState && currentState !== type) {
            interacted[editionId] = type;
            actionsToSend.push('remove_' + currentState);
            actionsToSend.push(type);
            
            const oldSpan = document.getElementById(currentState + '-count');
            oldSpan.textContent = Math.max(0, parseInt(oldSpan.textContent || 0) - 1);
            const newSpan = document.getElementById(type + '-count');
            newSpan.textContent = parseInt(newSpan.textContent || 0) + 1;
        } else {
            interacted[editionId] = type;
            actionsToSend.push(type);
            const span = document.getElementById(type + '-count');
            span.textContent = parseInt(span.textContent || 0) + 1;
        }
        
        localStorage.setItem('bm_reactions', JSON.stringify(interacted));
        updateBtnStyles(interacted[editionId] === 'like', interacted[editionId] === 'dislike');
        
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
            
            const commentId = 'cmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            
            fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec', {
                method: 'POST',
                body: JSON.stringify({ action: 'comment', editionId: lightbox.dataset.editionId, name: name, comment: text, commentId: commentId }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            }).then(() => {
                const myComments = JSON.parse(localStorage.getItem('bm_my_comments') || '[]');
                myComments.push(commentId);
                localStorage.setItem('bm_my_comments', JSON.stringify(myComments));
                
                const list = document.getElementById('comments-list');
                const empty = list.querySelector('.empty-comments');
                if(empty) empty.remove();
                
                const deleteBtn = \`<button class="btn-delete-comment" data-id="\${commentId}" title="Apagar comentário">🗑️</button>\`;
                const newComment = \`<div class="comment-item" id="comment-\${commentId}">\${deleteBtn}<strong>\${name}</strong> <span class="comment-date">Agora mesmo</span><p>\${text}</p></div>\`;
                list.insertAdjacentHTML('afterbegin', newComment);
                commentForm.reset();
                
                const recBtn = list.querySelector(\`.btn-delete-comment[data-id="\${commentId}"]\`);
                if(recBtn) {
                    recBtn.addEventListener('click', () => {
                        if(confirm('Tem certeza que deseja apagar seu comentário?')) {
                            const cmtDiv = document.getElementById('comment-' + commentId);
                            if(cmtDiv) cmtDiv.style.opacity = '0.5';
                            fetch('https://script.google.com/macros/s/AKfycbyBH4hq66XZuuHoKQtaoyTGCP3M2WbYNwJlRF0Qw8V40iMmHaZA82vmJFkABZALHSFrTg/exec', {
                                method: 'POST',
                                body: JSON.stringify({ action: 'delete_comment', editionId: lightbox.dataset.editionId, commentId: commentId }),
                                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                            }).then(() => {
                                if(cmtDiv) cmtDiv.remove();
                            });
                        }
                    });
                }
            }).finally(() => {
                btn.disabled = false;
                btn.textContent = 'Enviar';
            });
        });
    }
}

// --- Card de edição ---`;

content = content.replace(regex, cleanFunction);

// Remover os caracteres estranhos do HTML tbm
content = content.replace(/Comentǭrios/g, 'Comentários');
content = content.replace(/comentǭrios/g, 'comentários');
content = content.replace(/comentǭrio/g, 'comentário');

fs.writeFileSync('src/js/pages/noticias.js', content, 'utf8');
