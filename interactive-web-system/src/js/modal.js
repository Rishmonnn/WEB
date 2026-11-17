// modal factory + love-letter renderer

export function createModal({ title = '', content = '', className = '' } = {}) {
    // remove existing modal
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.tabIndex = -1;

    const modal = document.createElement('div');
    modal.className = `modal ${className}`.trim();
    modal.tabIndex = -1;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    if (title) {
        const hdr = document.createElement('div');
        hdr.className = 'modal-header';
        const h = document.createElement('h2');
        h.innerText = title;
        hdr.appendChild(h);
        modalContent.appendChild(hdr);
    }

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    if (typeof content === 'string') modalBody.innerHTML = content; else modalBody.appendChild(content);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close';
    closeBtn.type = 'button';
    closeBtn.innerText = 'Close';
    closeBtn.onclick = close;
    modalFooter.appendChild(closeBtn);

    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // enter
    requestAnimationFrame(() => overlay.classList.add('open'));

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    function close() {
        // NEW: Add 'closing' class for the exit animation
        overlay.classList.remove('open');
        overlay.classList.add('closing');
        document.removeEventListener('keydown', onKey);
        
        // Only remove the element after the CSS transition finishes
        overlay.addEventListener('transitionend', (e) => {
            // Ensure we only listen to the opacity transition on the overlay
            if (e.propertyName === 'opacity' && e.target === overlay) {
                overlay.remove();
            }
        }, { once: true });
    }
    function onKey(e){ if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    // focus modal for accessibility after animation
    setTimeout(()=> modal.focus(), 220);
    return { overlay, modal, close };
}

/**
 * Create a romantic love-letter modal
 * letter = { from, to, date, subject, body, signature }
 */
export function createLetterModal(letter = {}) {
    const paper = document.createElement('div');
    paper.className = 'letter';

    const header = document.createElement('div');
    header.className = 'letter-header';
    header.innerHTML = `
      <div><strong>From:</strong> ${escapeHtml(letter.from || '')}</div>
      <div><strong>To:</strong> ${escapeHtml(letter.to || '')}</div>
      <div class="letter-subject"><strong>${escapeHtml(letter.subject || '')}</strong></div>
      <div style="font-size:0.9rem;color:var(--muted)"><em>${escapeHtml(letter.date || '')}</em></div>
    `;

    const body = document.createElement('div');
    body.className = 'letter-body';
    body.innerHTML = escapeHtml(letter.body || '').replace(/\n/g, '<br>');

    const sign = document.createElement('div');
    sign.className = 'letter-signature';
    sign.innerText = letter.signature || '';

    // small heart decoration
    const heart = document.createElement('div');
    heart.style.position = 'absolute';
    heart.style.right = '18px';
    heart.style.top = '18px';
    heart.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="${escapeHtml(letter.accent || '#b5526a')}" aria-hidden="true"><path d="M12 21s-7.5-4.35-9.5-7.03C.98 11.42 3.06 7 6.5 7c1.74 0 3.1 1.08 3.5 2.6.4-1.52 1.76-2.6 3.5-2.6 3.44 0 5.52 4.42 4 6.97C19.5 16.65 12 21 12 21z"/></svg>`;

    paper.appendChild(header);
    paper.appendChild(body);
    paper.appendChild(sign);
    paper.appendChild(heart);

    // FIX APPLIED: Removed the 'title' argument to prevent the redundant header.
    return createModal({ content: paper, className: 'letter-modal' });

    function escapeHtml(str) {
        return String(str || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }
}