(() => {
  const TOTAL = 43;
  const bookEl = document.getElementById('book');
  const loading = document.getElementById('loading');
  const pageIndicator = document.getElementById('pageIndicator');
  const slider = document.getElementById('pageSlider');
  const thumbsPanel = document.getElementById('thumbsPanel');
  const thumbsGrid = document.getElementById('thumbsGrid');
  const bookStage = document.getElementById('bookStage');
  const zoomLabel = document.getElementById('zoomLabel');

  let zoom = 1;
  let pageFlip;

  const pad = n => String(n).padStart(2, '0');

  function buildPages() {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= TOTAL; i++) {
      const page = document.createElement('div');
      page.className = 'page' + (i === 1 || i === TOTAL ? ' page-cover' : '');
      const img = document.createElement('img');
      img.src = `pages/page-${pad(i)}.jpg`;
      img.alt = `SIL Insurance Yearbook 2026 — page ${i}`;
      img.loading = i <= 4 ? 'eager' : 'lazy';
      img.draggable = false;
      page.appendChild(img);
      frag.appendChild(page);
    }
    bookEl.appendChild(frag);
  }

  function buildThumbs() {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= TOTAL; i++) {
      const b = document.createElement('button');
      b.className = 'thumb';
      b.type = 'button';
      b.dataset.page = i;
      b.innerHTML = `<img loading="lazy" src="pages/page-${pad(i)}.jpg" alt="Page ${i}"><span>${i}</span>`;
      b.addEventListener('click', () => {
        pageFlip.flip(i - 1);
        closeThumbs();
      });
      frag.appendChild(b);
    }
    thumbsGrid.appendChild(frag);
  }

  function updateUI(index) {
    const page = Math.min(TOTAL, Math.max(1, index + 1));
    pageIndicator.textContent = `${page} / ${TOTAL}`;
    slider.value = page;
    bookEl.classList.toggle('spread-view', index > 0 && index < TOTAL - 1);
    document.querySelectorAll('.thumb').forEach(t => t.classList.toggle('active', Number(t.dataset.page) === page));
    const active = document.querySelector('.thumb.active');
    if (active && thumbsPanel.classList.contains('open')) active.scrollIntoView({block:'nearest'});
  }

  function openThumbs() {
    thumbsPanel.classList.add('open');
    thumbsPanel.setAttribute('aria-hidden', 'false');
  }
  function closeThumbs() {
    thumbsPanel.classList.remove('open');
    thumbsPanel.setAttribute('aria-hidden', 'true');
  }

  function setZoom(next) {
    zoom = Math.min(1.5, Math.max(.7, next));
    bookStage.style.transform = `scale(${zoom})`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  }

  async function init() {
    buildPages();
    buildThumbs();

    pageFlip = new St.PageFlip(bookEl, {
      width: 756,
      height: 1024,
      size: 'stretch',
      minWidth: 300,
      maxWidth: 756,
      minHeight: 406,
      maxHeight: 1024,
      maxShadowOpacity: 0.18,
      showCover: true,
      mobileScrollSupport: false,
      useMouseEvents: true,
      flippingTime: 680,
      drawShadow: true,
      autoSize: true,
      clickEventForward: true,
      usePortrait: true,
      startZIndex: 0,
      showPageCorners: true,
      disableFlipByClick: false
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    pageFlip.on('flip', e => updateUI(e.data));
    pageFlip.on('changeOrientation', () => setTimeout(() => pageFlip.update(), 80));
    pageFlip.on('init', e => updateUI(e.data.page));
    loading.style.display = 'none';
  }

  document.getElementById('prevBtn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('nextBtn').addEventListener('click', () => pageFlip.flipNext());
  document.getElementById('prevBottom').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('nextBottom').addEventListener('click', () => pageFlip.flipNext());
  document.getElementById('thumbsBtn').addEventListener('click', () => thumbsPanel.classList.contains('open') ? closeThumbs() : openThumbs());
  document.getElementById('closeThumbs').addEventListener('click', closeThumbs);
  slider.addEventListener('input', () => pageFlip.flip(Number(slider.value) - 1));
  document.getElementById('zoomIn').addEventListener('click', () => setZoom(zoom + .1));
  document.getElementById('zoomOut').addEventListener('click', () => setZoom(zoom - .1));
  document.getElementById('fullscreenBtn').addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch (_) {}
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') pageFlip.flipNext();
    if (e.key === 'ArrowLeft') pageFlip.flipPrev();
    if (e.key === 'Escape') closeThumbs();
  });

  let x0 = null;
  bookStage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
  bookStage.addEventListener('touchend', e => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 48) dx < 0 ? pageFlip.flipNext() : pageFlip.flipPrev();
    x0 = null;
  }, {passive:true});

  init();
})();
