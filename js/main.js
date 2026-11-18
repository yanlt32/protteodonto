/* Protte Odonto: interações e movimento */
(() => {
  window.protteReady = true; // avisa a rede de segurança do <head> que o script rodou
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* dispara uma vez quando o elemento entra na tela */
  const onceVisible = (els, fn, options = { threshold: 0.35 }) => {
    if (reduced || !hasIO) { els.forEach(fn); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); } });
    }, options);
    els.forEach((el) => io.observe(el));
  };

  /* ---------- títulos: cada palavra num trilho próprio, para subir por trás de uma linha ---------- */
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) { walk(n); return; }
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const outer = document.createElement('span');
          const inner = document.createElement('span');
          outer.className = 'w';
          inner.className = 'w__i';
          inner.style.setProperty('--wi', i++);
          inner.textContent = part;
          outer.append(inner);
          frag.append(outer);
        });
        n.replaceWith(frag);
      });
    };
    walk(el);
    el.classList.add('is-split');
    return i;
  };
  const splits = [...document.querySelectorAll('[data-split]')];
  splits.forEach(splitWords);

  /* ---------- abertura: espera a fonte para não animar com a fonte errada ---------- */
  const heroTitle = document.querySelector('.hero__title');
  const heroMark = document.querySelector('.hero [data-mark]');
  const start = () => {
    if (root.classList.contains('is-loaded')) return;
    root.classList.add('is-loaded');
    if (heroTitle) heroTitle.classList.add('is-in');
    if (heroMark) setTimeout(() => heroMark.classList.add('is-marked'), reduced ? 0 : 1150);
  };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(() => requestAnimationFrame(start));
  } else {
    requestAnimationFrame(start);
  }

  /* ---------- entradas ao rolar ---------- */
  document.querySelectorAll('[data-reveal="rows"] tbody tr, [data-reveal="rows"] thead tr').forEach((tr) => {
    tr.style.setProperty('--ri', tr.parentElement.tagName === 'THEAD' ? 0 : tr.sectionRowIndex + 1);
  });
  document.querySelectorAll('[data-reveal="stagger"]').forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty('--ri', i));
  });
  onceVisible(
    [...document.querySelectorAll('[data-reveal]'), ...splits.filter((s) => s !== heroTitle)],
    (el) => el.classList.add('is-in'),
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  /* ---------- ano no rodapé ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- cabeçalho: linha de base depois que a página rola ---------- */
  const header = document.querySelector('[data-header]');
  const top = document.querySelector('[data-top]');
  if (header && top && hasIO) {
    new IntersectionObserver(([en]) => header.classList.toggle('is-scrolled', !en.isIntersecting)).observe(top);
  }

  /* ---------- menu do celular ---------- */
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
  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean).forEach((s) => spy.observe(s));
  }

  /* ---------- marca-texto: passa uma vez sobre a linha que importa ---------- */
  const marks = [...document.querySelectorAll('[data-mark]')].filter((m) => m !== heroMark);
  onceVisible(marks, (m) => setTimeout(() => m.classList.add('is-marked'), reduced ? 0 : 500), { threshold: 0.9 });

  /* ---------- faixas cruzadas ("fly") ----------
     Andam sozinhas devagar, aceleram com a velocidade da rolagem, trocam de sentido
     quando a pessoa rola para cima e se inclinam um pouco na direção do movimento.
     O laço só roda com as faixas na tela. */
  const fly = document.querySelector('[data-fly]');
  if (fly) {
    const tracks = [...fly.querySelectorAll('[data-fly-track]')].map((el) => ({
      el, dir: Number(el.dataset.dir) || -1, unit: el.innerHTML, x: 0, w: 1,
    }));
    // repete o bloco até cobrir a faixa inteira com folga, para o laço não ter emenda
    const fill = () => tracks.forEach((t) => {
      t.el.innerHTML = t.unit;
      const first = t.el.firstElementChild;
      t.w = first.getBoundingClientRect().width || 1;
      const need = t.el.parentElement.getBoundingClientRect().width + t.w * 2;
      let total = t.w;
      while (total < need) { t.el.insertAdjacentHTML('beforeend', t.unit); total += t.w; }
      t.x = -t.w * 0.37 * (t.dir > 0 ? 1 : 0.5);
    });
    fill();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);
    if ('ResizeObserver' in window) {
      let lastW = fly.offsetWidth;
      new ResizeObserver(() => { if (Math.abs(fly.offsetWidth - lastW) > 2) { lastW = fly.offsetWidth; fill(); } }).observe(fly);
    }

    const place = (skew) => tracks.forEach((t) => {
      t.x = ((t.x % t.w) + t.w) % t.w - t.w; // mantém entre -w e 0
      t.el.style.transform = `translate3d(${t.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    });
    place(0);

    if (!reduced) {
      let running = false, raf = 0, last = 0, lastY = window.scrollY;
      let vel = 0, sense = 1, slow = 0, slowTarget = 0, skew = 0;
      const BASE = 34; // px por segundo, parado
      fly.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') slowTarget = 1; });
      fly.addEventListener('pointerleave', () => { slowTarget = 0; });

      const tick = (now) => {
        const dt = Math.min(0.064, (now - (last || now)) / 1000) || 0.016;
        last = now;
        const y = window.scrollY;
        const v = (y - lastY) / dt; // px/s da rolagem
        lastY = y;
        if (Math.abs(v) > 30) sense = Math.sign(v);
        vel += (v - vel) * 0.1;
        slow += (slowTarget - slow) * 0.08;
        const speed = (BASE + Math.min(1400, Math.abs(vel)) * 0.55) * (1 - slow * 0.8) * sense;
        tracks.forEach((t) => { t.x += t.dir * speed * dt; });
        skew += (Math.max(-9, Math.min(9, -vel * 0.006)) - skew) * 0.12;
        place(skew);
        if (running) raf = requestAnimationFrame(tick);
      };
      if (hasIO) {
        new IntersectionObserver(([en]) => {
          running = en.isIntersecting;
          if (running) { last = 0; lastY = window.scrollY; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
          else cancelAnimationFrame(raf);
        }).observe(fly);
      }
    }
  }

  /* ---------- carimbo ---------- */
  onceVisible([...document.querySelectorAll('[data-stamp]')], (s) => s.classList.add('is-stamped'), { threshold: 0.8 });

  /* ---------- odontograma ---------- */
  const chart = document.querySelector('[data-chart]');
  if (chart) {
    const POS = { 1: 'incisivo central', 2: 'incisivo lateral', 3: 'canino', 4: 'primeiro pré-molar', 5: 'segundo pré-molar', 6: 'primeiro molar', 7: 'segundo molar', 8: 'terceiro molar' };
    const QUAD = { 1: 'superior direito', 2: 'superior esquerdo', 3: 'inferior esquerdo', 4: 'inferior direito' };
    const nameOf = (n) => {
      const q = Math.floor(n / 10), d = n % 10;
      return `${POS[d]} ${QUAD[q]}${d === 8 ? ' (siso)' : ''}`;
    };
    const rows = [...chart.querySelectorAll('.chart__arch')].map((arch) => [...arch.querySelectorAll('.tooth')]);
    const teeth = rows.flat();
    const readNum = chart.querySelector('[data-readout-num]');
    const readText = chart.querySelector('[data-readout]');
    const idle = readText.textContent;
    let current = teeth.find((t) => t.dataset.n === '11') || teeth[0];

    // o feixe do exame anda da esquerda para a direita: cada coluna acende quando ele passa
    rows.forEach((row) => row.forEach((t, c) => t.style.setProperty('--c', c)));
    const board = chart.querySelector('[data-chart-board]');
    const sizeBoard = () => board.style.setProperty('--bw', `${board.offsetWidth}px`);
    sizeBoard();
    if ('ResizeObserver' in window) new ResizeObserver(sizeBoard).observe(board);

    teeth.forEach((t) => {
      const n = Number(t.dataset.n);
      t.setAttribute('aria-label', `Dente ${n}, ${nameOf(n)}`);
      t.setAttribute('aria-pressed', 'false');
      t.tabIndex = t === current ? 0 : -1;
    });

    const show = (t) => {
      const name = nameOf(Number(t.dataset.n));
      readNum.textContent = t.dataset.n;
      readText.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    };
    const reset = () => {
      const picked = teeth.find((t) => t.getAttribute('aria-pressed') === 'true');
      if (picked) show(picked); else { readNum.textContent = ''; readText.textContent = idle; }
    };
    const pick = (t) => {
      teeth.forEach((o) => o.setAttribute('aria-pressed', String(o === t)));
      show(t);
    };
    const focusTooth = (t) => {
      current.tabIndex = -1; current = t; t.tabIndex = 0; t.focus();
    };

    teeth.forEach((t) => {
      t.addEventListener('click', () => { pick(t); current.tabIndex = -1; current = t; t.tabIndex = 0; });
      t.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(t); });
      t.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') reset(); });
      t.addEventListener('focus', () => show(t));
      t.addEventListener('blur', reset);
    });

    // setas percorrem a ficha como ela é lida: linha de cima e linha de baixo
    chart.addEventListener('keydown', (e) => {
      const r = rows.findIndex((row) => row.includes(current));
      if (r < 0) return;
      const c = rows[r].indexOf(current);
      let next = null;
      if (e.key === 'ArrowRight') next = rows[r][Math.min(c + 1, rows[r].length - 1)];
      if (e.key === 'ArrowLeft') next = rows[r][Math.max(c - 1, 0)];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') next = rows[e.key === 'ArrowDown' ? 1 : 0][c];
      if (e.key === 'Home') next = rows[r][0];
      if (e.key === 'End') next = rows[r][rows[r].length - 1];
      if (next) { e.preventDefault(); focusTooth(next); }
    });

    onceVisible([chart], (c) => c.classList.add('is-examined'), { threshold: 0.5 });
  }

  /* ---------- arcada em SVG (reserva caso o 3D não carregue) ---------- */
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
    // largura e altura do centro para fora (incisivo, lateral, canino, pré-molares)
    const U = row([30, 25, 23, 21, 18]), uH = [40, 34, 37, 29, 25];
    const L = row([21, 21, 22, 21, 19]), lH = [28, 29, 31, 27, 23];
    // desalinhamento inicial de cada dente (da esquerda para a direita)
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
        <linearGradient id="${id}-scan" x1="0" x2="1"><stop offset="0" stop-color="#ffcc29" stop-opacity="0"/><stop offset=".5" stop-color="#ffe7a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffcc29" stop-opacity="0"/></linearGradient>
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

  /* ---------- etapas + arcada que se alinha com a rolagem ---------- */
  const steps = document.querySelector('[data-steps]');
  const stage = document.querySelector('[data-mouth-stage]');
  const label = stage && stage.querySelector('[data-mouth-label]');
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const stageNames = ['Avaliação', 'Escaneamento', 'Uso das placas', 'Contenção'];
  const stageIndex = (p) => (p >= 0.995 ? 3 : Math.min(2, Math.floor(p * 3)));
  /* p vai de 0 a 1; cada etapa ocupa 1/3 do trajeto entre a Etapa 1 e a Etapa 4:
       Etapa 1 (0 a 1/3): avaliação, dentes desalinhados
       Etapa 2 (1/3 a 2/3): escaneamento, o feixe amarelo percorre os dentes
       Etapa 3 (2/3 a 1): o alinhador aparece e os dentes vão para o lugar
       Etapa 4 (p = 1): contenção, sem alinhador, dentes alinhados */
  const updateMouth = (p) => {
    if (!stage) return;
    const phase = p * 3;
    const scan = phase >= 1 && phase < 2 ? phase - 1 : phase >= 2 ? 1 : 0;
    const f = clamp01(phase - 2);
    const s = ease(clamp01((f - 0.08) / 0.8));
    let al = 0;
    if (phase >= 2 && p < 0.995) al = f < 0.1 ? f / 0.1 : f > 0.9 ? Math.max(0, (1 - f) / 0.1) : 1;
    const done = p >= 0.995;
    stage.style.setProperty('--s', s.toFixed(3));
    stage.style.setProperty('--al', al.toFixed(3));
    stage.style.setProperty('--scan', scan.toFixed(3));
    stage.style.setProperty('--so', scan > 0 && scan < 1 ? '1' : '0');
    stage.style.setProperty('--sp', done ? '1' : '0');
    // estado lido pela versão 3D (js/mouth3d.js)
    stage._mouth = { p, s, al, scan, scanOn: scan > 0 && scan < 1, done };
    stage.toggleAttribute('data-mouth-done', done);
    if (label) label.textContent = stageNames[stageIndex(p)];
  };
  const mobileQ = window.matchMedia('(max-width: 960px)');

  if (steps) {
    const items = [...steps.querySelectorAll('.step')];
    let ticking = false;
    const update = () => {
      ticking = false;
      // linha de leitura: logo abaixo da arcada presa no topo (celular) ou a 45% da tela
      const mark = mobileQ.matches && stage
        ? stage.getBoundingClientRect().bottom + 40
        : window.innerHeight * 0.45;
      // cada etapa conta igual, não importa a altura do texto
      const tops = items.map((it) => it.getBoundingClientRect().top);
      const first = tops[0], n = tops.length;
      let p = 0;
      if (mark >= tops[n - 1]) p = 1;
      else if (mark > first) {
        let i = 0;
        while (i < n - 2 && mark >= tops[i + 1]) i++;
        p = (i + clamp01((mark - tops[i]) / Math.max(1, tops[i + 1] - tops[i]))) / (n - 1);
      }
      const idx = stageIndex(p);
      steps.style.setProperty('--fill', p.toFixed(3));
      items.forEach((it, i) => it.classList.toggle('is-active', mark > first && i <= idx));
      updateMouth(p);
    };
    // a arcada é animada pela rolagem (scrub), então o progresso é lido a cada quadro com rAF
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- dúvidas: uma aberta por vez ---------- */
  const qas = document.querySelectorAll('.qa');
  qas.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) qas.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
