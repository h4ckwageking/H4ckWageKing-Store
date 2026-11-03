(function () {
  const $ = s => document.querySelector(s);
  $('#yr').textContent = new Date().getFullYear();

  // ---- toast (Bootstrap Toast, with plain fallback) ----
  const toastEl = $('#toast'), toastMsg = $('#toastMsg');
  let tFallback;
  function say(msg) {
    toastMsg.textContent = msg;
    if (window.bootstrap) { bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1800 }).show(); return; }
    toastEl.classList.add('show'); clearTimeout(tFallback);
    tFallback = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ---- clipboard ----
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((ok, no) => {
      const a = document.createElement('textarea');
      a.value = text; a.setAttribute('readonly', '');
      a.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
      document.body.appendChild(a); a.select(); a.setSelectionRange(0, a.value.length);
      try { document.execCommand('copy') ? ok() : no(); } catch (e) { no(e); }
      a.remove();
    });
  }
  document.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', () => {
    copyText(btn.dataset.copy).then(() => {
      say('Copied: ' + btn.dataset.name);
      const label = btn.querySelector('span'), icon = btn.querySelector('use');
      btn.classList.add('copied'); label.textContent = 'Copied'; icon.setAttribute('href', '#i-clipboard-check');
      setTimeout(() => { btn.classList.remove('copied'); label.textContent = 'Copy'; icon.setAttribute('href', '#i-clipboard'); }, 1500);
    }).catch(() => say('Copy failed – please copy manually'));
  }));

  // ---- touch / click feedback (works on phones, not only hover) ----
  document.addEventListener('pointerdown', e => {
    const t = e.target.closest('.tool-card,.v7-card,.btn-soft'); if (!t) return;
    t.classList.add('tap'); clearTimeout(t._tap); t._tap = setTimeout(() => t.classList.remove('tap'), 600);
  });

  // ---- mobile menu: close the Bootstrap collapse after choosing a link ----
  const menu = $('#menu');
  menu.addEventListener('click', e => {
    if (!e.target.closest('a') || !menu.classList.contains('show') || !window.bootstrap) return;
    bootstrap.Collapse.getOrCreateInstance(menu).hide();
  });

  // ---- active menu link while scrolling ----
  const links = [...document.querySelectorAll('#navList .nav-link')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  let ticking = false;
  function spy() {
    ticking = false;
    const line = window.innerHeight * 0.35;
    const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let idx = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) idx = i; });
    if (atEnd) idx = secs.length - 1;
    links.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  addEventListener('resize', spy); spy();

  // ---- DPI tool: original logic from DPI_Tool_Code.zip (formula unchanged) ----
  function caculateDPI() {
    const numberDPI = Number($('#dpi_input').value);
    const box = $('#dpi_box'), loaderSpan = $('#dpi_loader');
    if (!Number.isFinite(numberDPI) || numberDPI <= 0) {
      loaderSpan.textContent = 'Please enter a valid DPI value.'; box.classList.add('d-none'); return;
    }
    const balance = numberDPI * 0.55 + parseInt(numberDPI, 10);
    box.classList.add('d-none');
    loaderSpan.innerHTML = '<div class="spinner-border spinner-border-sm text-danger mb-2" role="status"></div><p class="mb-0">Calculating recommended DPI...</p>';
    setTimeout(() => {
      loaderSpan.innerHTML = '';
      box.classList.remove('d-none');
      $('#dpi_balance').innerHTML = '<span class="display-6 fw-bold">' + Math.round(balance) + '</span> DPI <small class="text-body-secondary fw-light fs-6">(recommended)</small>';
    }, 1200);
  }
  $('#dpiBtn').addEventListener('click', caculateDPI);
  $('#dpi_input').addEventListener('keydown', e => { if (e.key === 'Enter') caculateDPI(); });
})();
