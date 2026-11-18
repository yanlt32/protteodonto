/* Protte Odonto — interações */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entrada do hero ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));

  /* ---------- ano no rodapé ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- header ao rolar ---------- */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- menu mobile ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- link ativo no menu ---------- */
  const navLinks = [...document.querySelectorAll('.nav__list a[href^="#"]')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- reveal ao rolar ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    // escalonamento entre irmãos
    reveals.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
      el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 5) * 0.08}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- boca em SVG (gerada aqui para manter o HTML limpo) ---------- */
  const buildMouth = (svg) => {
    const id = 'm' + Math.random().toString(36).slice(2, 7);
    const gumU = (x) => 90 + ((x - 200) / 150) ** 2 * 26;   // linha da gengiva de cima
    const gumL = (x) => 160 - ((x - 200) / 150) ** 2 * 24;  // linha da gengiva de baixo
    const f = (n) => Math.round(n * 10) / 10;
    const row = (widths) => {
      const right = []; let x = 200.8;
      widths.forEach((w, k) => { right.push({ x, w, k }); x += w + 1.6; });
      const left = right.map((t) => ({ x: 400 - t.x - t.w, w: t.w, k: t.k })).reverse();
      return [...left, ...right];
    };
    // largura/altura do centro para fora (incisivo, lateral, canino, pré-molares)
    const U = row([30, 25, 23, 21, 18]), uH = [40, 34, 37, 29, 25];
    const L = row([21, 21, 22, 21, 19]), lH = [28, 29, 31, 27, 23];
    // desalinhamento inicial de cada dente (esquerda → direita)
    const uR = [5, -7, 4, -9, 6, -5, 8, -4, 7, -5], uY = [2, -3, 4, -2, 3, -4, 2, 5, -3, 2], uX = [1, -2, 2, -1, 0, 0, 1, -2, 2, -1];
    const lR = [-6, 5, -8, 6, -4, 7, -5, 9, -6, 4], lY = [-2, 3, -4, 2, -3, 4, -2, 3, -3, 2], lX = [1, -1, 2, -2, 1, -1, 2, -1, 1, -2];

    const upperTooth = ({ x, w, k }, i) => {
      const cx = x + w / 2, top = gumU(cx) - 8, bot = gumU(cx) + uH[k], r = Math.min(w * 0.4, 9);
      return `<path class="tooth" style="--r:${uR[i]};--dy:${uY[i]};--dx:${uX[i]}" d="M${f(x)},${f(top)}V${f(bot - r)}Q${f(x)},${f(bot)} ${f(x + r)},${f(bot)}H${f(x + w - r)}Q${f(x + w)},${f(bot)} ${f(x + w)},${f(bot - r)}V${f(top)}Z"/>`;
    };
    const lowerTooth = ({ x, w, k }, i) => {
      const cx = x + w / 2, base = gumL(cx) + 8, top = gumL(cx) - lH[k], r = Math.min(w * 0.35, 6);
      return `<path class="tooth" style="--r:${lR[i]};--dy:${lY[i]};--dx:${lX[i]}" d="M${f(x)},${f(base)}V${f(top + r)}Q${f(x)},${f(top)} ${f(x + r)},${f(top)}H${f(x + w - r)}Q${f(x + w)},${f(top)} ${f(x + w)},${f(top + r)}V${f(base)}Z"/>`;
    };
    const sample = (fn, x0, x1) => { const p = []; for (let x = x0; x <= x1 + 0.01; x += 8) p.push(`${f(x)},${f(fn(x))}`); return p; };

    const opening = 'M52 113C100 92 150 82 200 84C250 82 300 92 348 113C300 150 250 168 200 168C150 168 100 150 52 113Z';
    const outer = 'M20 112C60 70 120 46 165 52C180 54 190 62 200 62C210 62 220 54 235 52C280 46 340 70 380 112C340 170 270 205 200 205C130 205 60 170 20 112Z';
    const gumUpper = `M30,0L${sample(gumU, 30, 370).join('L')}L370,0Z`;
    const gumLower = `M30,230L${sample(gumL, 30, 370).join('L')}L370,230Z`;
    const ux0 = U[0].x - 2, ux1 = U[U.length - 1].x + U[U.length - 1].w + 2;
    const lx0 = L[0].x - 2, lx1 = L[L.length - 1].x + L[L.length - 1].w + 2;
    const alU = `M${sample((x) => gumU(x) - 2, ux0, ux1).join('L')}L${sample((x) => gumU(x) + 40 - Math.abs(x - 200) * 0.11 + 3, ux0, ux1).reverse().join('L')}Z`;
    const alL = `M${sample((x) => gumL(x) - 31 + Math.abs(x - 200) * 0.06 - 3, lx0, lx1).join('L')}L${sample((x) => gumL(x) + 2, lx0, lx1).reverse().join('L')}Z`;

    svg.innerHTML = `
      <defs>
        <clipPath id="${id}-c"><path d="${opening}"/></clipPath>
        <linearGradient id="${id}-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#ece2cf"/></linearGradient>
        <linearGradient id="${id}-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9858a"/><stop offset=".5" stop-color="#c4646c"/><stop offset="1" stop-color="#a64952"/></linearGradient>
        <radialGradient id="${id}-cav" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#6a1a26"/><stop offset="1" stop-color="#2b0910"/></radialGradient>
        <linearGradient id="${id}-scan" x1="0" x2="1"><stop offset="0" stop-color="#e8b44f" stop-opacity="0"/><stop offset=".5" stop-color="#ffe3a3" stop-opacity=".85"/><stop offset="1" stop-color="#e8b44f" stop-opacity="0"/></linearGradient>
        <linearGradient id="${id}-sh" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <g class="mouth__body">
        <g clip-path="url(#${id}-c)">
          <path d="${opening}" fill="url(#${id}-cav)"/>
          <ellipse cx="200" cy="154" rx="95" ry="26" fill="#b44b57"/>
          <g fill="url(#${id}-t)" stroke="#d6cab4" stroke-width=".8">${L.map(lowerTooth).join('')}</g>
          <path d="${gumLower}" fill="#e48a90" stroke="#cf6f77" stroke-width="1"/>
          <g fill="url(#${id}-t)" stroke="#d6cab4" stroke-width=".8">${U.map(upperTooth).join('')}</g>
          <path d="${gumUpper}" fill="#e48a90" stroke="#cf6f77" stroke-width="1"/>
          <g class="mouth__aligner" fill="rgba(214,236,255,.28)" stroke="rgba(255,255,255,.9)" stroke-width="1.4" stroke-linejoin="round">
            <path d="${alU}"/><path d="${alL}"/>
          </g>
          <g class="mouth__scan"><rect x="-14" y="70" width="28" height="110" fill="url(#${id}-scan)"/><rect x="-1" y="70" width="2" height="110" fill="#ffe9b8"/></g>
          <g class="mouth__shine"><rect x="-60" y="60" width="56" height="130" fill="url(#${id}-sh)" transform="skewX(-18)"/></g>
          <path d="${opening}" fill="none" stroke="#3a0b14" stroke-opacity=".45" stroke-width="10"/>
        </g>
        <path d="${outer} ${opening}" fill-rule="evenodd" fill="url(#${id}-l)" stroke="#9c4049" stroke-width="1"/>
        <path d="M120 186C160 197 240 197 280 186" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="4" stroke-linecap="round"/>
        <path d="M150 62C170 58 185 66 200 68C215 66 230 58 250 62" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <path class="mouth__spark" d="M318 64l3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5Z" fill="#fff"/>
      <path class="mouth__spark mouth__spark--b" d="M92 82l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill="#fff"/>`;
  };
  document.querySelectorAll('[data-mouth]').forEach(buildMouth);

  /* ---------- etapas + boca que se alinha com a rolagem ---------- */
  const steps = document.querySelector('[data-steps]');
  const stage = document.querySelector('[data-mouth-stage]');
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const stageNames = ['Avaliação', 'Escaneamento', 'Uso das placas', 'Contenção'];
  /* p vai de 0 a 1 e é dividido por etapa: cada etapa ocupa 1/3 do trajeto entre o
     ponto da Etapa 1 e o da Etapa 4 (calculado pela posição real de cada etapa na tela).
       Etapa 1 (0 → 1/3): avaliação, dentes desalinhados
       Etapa 2 (1/3 → 2/3): escaneamento, a linha dourada varre os dentes
       Etapa 3 (2/3 → 1): alinhador aparece e os dentes vão para o lugar
       Etapa 4 (p = 1): contenção, sem alinhador, dentes alinhados */
  const updateMouth = (p) => {
    if (!stage) return;
    const phase = p * 3;
    const scan = phase >= 1 && phase < 2 ? phase - 1 : phase >= 2 ? 1 : 0;
    const f = clamp01(phase - 2);                        // progresso dentro da etapa 3
    const s = ease(clamp01((f - 0.08) / 0.8));           // alinhamento progressivo
    let al = 0;                                          // alinhador durante o uso das placas
    if (phase >= 2 && p < 0.995) al = f < 0.1 ? f / 0.1 : f > 0.9 ? Math.max(0, (1 - f) / 0.1) : 1;
    stage.style.setProperty('--s', s.toFixed(3));
    stage.style.setProperty('--al', al.toFixed(3));
    stage.style.setProperty('--scan', scan.toFixed(3));
    stage.style.setProperty('--so', scan > 0 && scan < 1 ? '1' : '0');
    const done = p >= 0.995;
    // estado lido pela versão 3D (js/mouth3d.js)
    stage._mouth = { p, s, al, scan, scanOn: scan > 0 && scan < 1, done };
    stage.style.setProperty('--sp', done ? '1' : '0');
    if (done) stage.setAttribute('data-mouth-done', ''); else stage.removeAttribute('data-mouth-done');
    stage.querySelector('[data-mouth-label]').textContent = stageNames[stageIndex(p)];
    stage.querySelector('[data-mouth-pct]').textContent = Math.round(s * 100);
  };
  const stageIndex = (p) => (p >= 0.995 ? 3 : Math.min(2, Math.floor(p * 3)));
  const mobileQ = window.matchMedia('(max-width: 900px)');

  if (steps) {
    const items = [...steps.querySelectorAll('.step')];
    let ticking = false;
    const update = () => {
      ticking = false;
      // linha de leitura: logo abaixo da boca presa no topo (celular) ou a 45% da tela (desktop)
      const mark = mobileQ.matches && stage
        ? stage.getBoundingClientRect().bottom + 40
        : window.innerHeight * 0.45;
      // progresso por trechos: cada etapa conta igual, não importa a altura do texto
      const tops = items.map((it) => it.getBoundingClientRect().top);
      const first = tops[0], n = tops.length;
      let p = 0;
      if (mark >= tops[n - 1]) p = 1;
      else if (mark > first) {
        let i = 0;
        while (i < n - 2 && mark >= tops[i + 1]) i++;
        p = (i + clamp01((mark - tops[i]) / Math.max(1, tops[i + 1] - tops[i]))) / (n - 1);
      }
      // etapa ativa, linha dourada e boca usam o mesmo progresso
      const idx = stageIndex(p);
      steps.style.setProperty('--fill', p.toFixed(3));
      items.forEach((it, i) => it.classList.toggle('is-active', mark > first && i <= idx));
      updateMouth(p);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- carrossel ---------- */
  document.querySelectorAll('[data-carousel]').forEach((car) => {
    const section = car.closest('section');
    const track = car.querySelector('[data-track]');
    const slides = [...track.children];
    const prev = section.querySelector('[data-prev]');
    const next = section.querySelector('[data-next]');
    const bar = section.querySelector('[data-progress]');
    const count = section.querySelector('[data-current]');
    let index = 0;

    const step = () => slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    const maxScroll = () => track.scrollWidth - track.clientWidth;

    const goTo = (i) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: Math.min(i * step(), maxScroll()), behavior: reduced ? 'auto' : 'smooth' });
    };

    const sync = () => {
      const atEnd = track.scrollLeft >= maxScroll() - 4;
      index = atEnd ? slides.length - 1 : Math.round(track.scrollLeft / step());
      slides.forEach((s, i) => s.classList.toggle('is-current', i === index));
      if (count) count.textContent = String(index + 1).padStart(2, '0');
      if (bar) bar.style.width = `${((index + 1) / slides.length) * 100}%`;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = atEnd;
    };

    let raf;
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    prev && prev.addEventListener('click', () => goTo(index - 1));
    next && next.addEventListener('click', () => goTo(index + 1));

    // teclado
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    });

    // arrastar com o mouse (toque já é nativo)
    let down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('is-dragging');
        goTo(Math.round(track.scrollLeft / step()));
      }
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // autoplay suave: avança a cada 5s, pausa com mouse, foco, toque ou aba oculta
    let timer = null, paused = false;
    const play = () => {
      if (reduced) return;
      stop();
      timer = setInterval(() => {
        if (paused || document.hidden) return;
        const r = car.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        goTo(index >= slides.length - 1 ? 0 : index + 1);
      }, 5000);
    };
    const stop = () => { clearInterval(timer); timer = null; };
    [section].forEach((el) => {
      el.addEventListener('mouseenter', () => (paused = true));
      el.addEventListener('mouseleave', () => (paused = false));
      el.addEventListener('focusin', () => (paused = true));
      el.addEventListener('focusout', () => (paused = false));
    });
    track.addEventListener('touchstart', () => { paused = true; stop(); }, { passive: true });

    sync();
    play();
  });

  /* ---------- FAQ: abre um por vez ---------- */
  const qas = document.querySelectorAll('.qa');
  qas.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
