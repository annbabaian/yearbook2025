(() => {
  const TOTAL = 43;
  // Requested sequence: original PDF pages 38,39,40 are placed before original page 37.
  const PAGE_ORDER = [
    ...Array.from({length:36},(_,i)=>i+1),
    38,39,40,37,
    41,42,43
  ];

  // Image-only numbering corrections requested for the reordered block.
  // Original page 37 has its printed 36 replaced by 40, original page 40 gets a 39 badge.
  const editedImage = new Map([[37,'page-37-edit.jpg'],[40,'page-40-edit.jpg']]);

  const flipbookEl = document.getElementById('flipbook');
  const bookWrap = document.getElementById('bookWrap');
  const bookStage = document.getElementById('bookStage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const thumbBtn = document.getElementById('thumbBtn');
  const thumbPanel = document.getElementById('thumbPanel');
  const thumbStrip = document.getElementById('thumbStrip');
  const pageIndicator = document.getElementById('pageIndicator');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const fitBtn = document.getElementById('fitBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  function imagePath(originalPage){
    const file = editedImage.get(originalPage) || `page-${String(originalPage).padStart(2,'0')}.jpg`;
    return `assets/pages/${file}`;
  }

  function buildPages(){
    const frag = document.createDocumentFragment();
    PAGE_ORDER.forEach((originalPage, displayIndex) => {
      const page = document.createElement('div');
      page.className = 'page';
      page.dataset.density = 'soft';
      page.dataset.originalPage = originalPage;
      page.dataset.displayPage = displayIndex + 1;
      const img = document.createElement('img');
      img.src = imagePath(originalPage);
      img.alt = `Yearbook page ${displayIndex + 1}`;
      img.draggable = false;
      img.loading = displayIndex < 6 ? 'eager' : 'lazy';
      img.decoding = 'async';
      page.appendChild(img);
      frag.appendChild(page);
    });
    flipbookEl.appendChild(frag);
  }

  function buildThumbs(){
    const frag = document.createDocumentFragment();
    PAGE_ORDER.forEach((originalPage,index)=>{
      const btn = document.createElement('button');
      btn.className = 'thumb';
      btn.type = 'button';
      btn.dataset.index = index;
      btn.setAttribute('aria-label',`Go to page ${index+1}`);
      btn.innerHTML = `<div class="thumb-image"><img src="${imagePath(originalPage)}" alt="" loading="lazy"></div><div class="thumb-label">${index+1}</div>`;
      btn.addEventListener('click',()=>pageFlip.flip(index));
      frag.appendChild(btn);
    });
    thumbStrip.appendChild(frag);
  }

  buildPages();
  buildThumbs();

  const pageFlip = new St.PageFlip(flipbookEl, {
    width: 756,
    height: 1012,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 756,
    minHeight: 375,
    maxHeight: 1012,
    maxShadowOpacity: 0.16,
    showCover: true,
    mobileScrollSupport: false,
    usePortrait: true,
    flippingTime: 720,
    drawShadow: true,
    autoSize: true,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 24,
    showPageCorners: true,
    disableFlipByClick: false
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));

  let zoom = 1;
  function setZoom(value){
    zoom = Math.max(0.8,Math.min(2.2,value));
    bookWrap.style.transform = `scale(${zoom})`;
    bookStage.style.cursor = zoom > 1 ? 'grab' : 'default';
  }

  function updateUI(index = pageFlip.getCurrentPageIndex()){
    const landscape = window.innerWidth > 800;
    const isPortrait = !landscape;
    let label;
    if(index === 0 || isPortrait){
      label = `${index + 1} / ${TOTAL}`;
    }else{
      const first = index + 1;
      const second = Math.min(TOTAL, first + 1);
      label = second > first ? `${first}–${second} / ${TOTAL}` : `${first} / ${TOTAL}`;
    }
    pageIndicator.textContent = label;
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= TOTAL - 1;
    document.querySelectorAll('.thumb').forEach((el,i)=>el.classList.toggle('active',i===index || (landscape && index>0 && i===index+1)));
    const active = thumbStrip.querySelector('.thumb.active');
    if(active && !thumbPanel.hidden) active.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  }

  pageFlip.on('flip',e=>updateUI(e.data));
  pageFlip.on('changeOrientation',()=>setTimeout(updateUI,0));
  pageFlip.on('changeState',()=>{});

  prevBtn.addEventListener('click',()=>pageFlip.flipPrev());
  nextBtn.addEventListener('click',()=>pageFlip.flipNext());

  thumbBtn.addEventListener('click',()=>{
    thumbPanel.hidden = !thumbPanel.hidden;
    thumbBtn.setAttribute('aria-expanded', String(!thumbPanel.hidden));
    updateUI();
  });

  zoomInBtn.addEventListener('click',()=>setZoom(zoom+0.15));
  zoomOutBtn.addEventListener('click',()=>setZoom(zoom-0.15));
  fitBtn.addEventListener('click',()=>setZoom(1));

  fullscreenBtn.addEventListener('click',async()=>{
    try{
      if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    }catch(e){ console.warn('Fullscreen unavailable',e); }
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){ e.preventDefault(); pageFlip.flipPrev(); }
    if(e.key==='ArrowRight'){ e.preventDefault(); pageFlip.flipNext(); }
    if(e.key==='Escape' && document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  });

  window.addEventListener('resize',()=>setTimeout(updateUI,100));
  updateUI(0);
})();
