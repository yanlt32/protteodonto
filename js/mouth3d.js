/* Protte Odonto — protótipo 3D de arcadas dentárias (Three.js)
   Arcada superior e inferior completas, gengiva úmida, língua e boca aberta, vistas de lado.
   Os dentes começam desalinhados e vão para o lugar conforme a rolagem pelas etapas
   (o progresso vem de main.js em stage._mouth). Se o WebGL ou o CDN falharem,
   a boca em SVG continua no lugar. */
(() => {
  const stage = document.querySelector('[data-mouth-stage]');
  const host = document.querySelector('[data-mouth-3d]');
  if (!stage || !host) return;

  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return;
  } catch { return; }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')])
    .then(([THREE, env]) => init(THREE, env.RoomEnvironment))
    .catch((e) => console.warn('Boca 3D indisponível; mantendo a versão em SVG.', e));

  function init(THREE, RoomEnvironment) {
    /* ---------- renderer, cena, câmera ---------- */
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    const hint = document.createElement('span');
    hint.className = 'mouth-stage__hint';
    hint.textContent = 'Arraste para girar';
    host.appendChild(hint);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;

    const ASPECT = 1.6;
    const camera = new THREE.PerspectiveCamera(30, ASPECT, 0.1, 100);
    camera.position.set(-6.5, 3.35, 10.9);
    camera.lookAt(0.25, -0.2, -1.9);

    const key = new THREE.DirectionalLight(0xfff4ea, 2.6);
    key.position.set(-4, 7, 8);
    const fill = new THREE.DirectionalLight(0xffe8e8, 0.8);
    fill.position.set(6, 1, 5);
    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(3, 4, -8);
    scene.add(key, fill, rim, new THREE.HemisphereLight(0xffffff, 0x40202a, 0.35));

    /* ---------- materiais ---------- */
    const enamel = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, vertexColors: true,
      roughness: 0.26, clearcoat: 0.85, clearcoatRoughness: 0.18,
      sheen: 0.2, sheenColor: new THREE.Color(0xffffff), specularIntensity: 0.75,
    });
    const gumMat = new THREE.MeshPhysicalMaterial({   // gengiva vermelha e úmida
      color: 0x6e1420, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.08,
      sheen: 0.45, sheenColor: new THREE.Color(0xd0505f), sheenRoughness: 0.45,
    });
    const tongueMat = new THREE.MeshPhysicalMaterial({
      color: 0xa23a4c, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.2,
      sheen: 0.8, sheenColor: new THREE.Color(0xff9aa8), sheenRoughness: 0.5,
    });
    // alinhador: plástico transparente levemente azulado, bem visível sobre os dentes
    const alignerMat = new THREE.MeshPhysicalMaterial({
      color: 0x9fd0ff, emissive: new THREE.Color(0x2f7fe0), emissiveIntensity: 0.6,
      roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
      transparent: true, opacity: 0, depthWrite: false,
    });
    const SCAN_BLUE = new THREE.Color(0x1f7fe0);
    const SCAN_TINT = new THREE.Color(0x7cc0ff);
    const WHITE = new THREE.Color(0xffffff);

    /* ---------- geometria de cada dente (esfera deformada) ---------- */
    // w = meia largura, h = meia altura da coroa, d = meia profundidade
    const TYPES = {
      inc:  { w: 0.43, h: 0.6,  d: 0.25 }, // incisivo central superior
      lat:  { w: 0.33, h: 0.52, d: 0.23 }, // incisivo lateral superior
      linc: { w: 0.27, h: 0.48, d: 0.23 }, // incisivos inferiores
      can:  { w: 0.38, h: 0.62, d: 0.34 }, // canino
      pre:  { w: 0.35, h: 0.44, d: 0.44 }, // pré-molar
      mol:  { w: 0.5,  h: 0.4,  d: 0.54 }, // molar
    };
    const sq = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
    const cEdge = new THREE.Color(0xd8dee3);   // borda levemente translúcida
    const cMid = new THREE.Color(0xf5f0e6);
    const cNeck = new THREE.Color(0xdcc39a);   // colo mais amarelado
    const geoCache = {};
    const toothGeo = (type) => {
      if (geoCache[type]) return geoCache[type];
      const P = TYPES[type];
      const g = new THREE.SphereGeometry(1, 40, 28);
      const pos = g.attributes.position;
      const colors = [];
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        let X = sq(x, 0.6), Y = sq(y, 0.75), Z = sq(z, 0.65);
        const t = (Y + 1) / 2; // 0 = borda, 1 = colo
        const up = Math.max(0, Y);
        X *= 1 - 0.22 * up * up;
        Z *= 1 - 0.25 * up * up;
        if (type === 'inc' || type === 'lat' || type === 'linc') Z *= 0.55 + 0.45 * t;
        if (type === 'can') { X *= 1 - 0.45 * Math.pow(Math.max(0, -Y), 1.6); Z *= 0.7 + 0.3 * t; }
        if (Z > 0) Z *= 1.08;
        let yy = Y * P.h;
        if ((type === 'pre' || type === 'mol') && Y < -0.5) { // cúspides
          const k = type === 'mol' ? 2 : 1;
          yy -= 0.08 * Math.cos(X * Math.PI * k) * Math.cos(Z * Math.PI * k * 0.5) * ((-Y - 0.5) / 0.5);
        }
        pos.setXYZ(i, X * P.w, yy, Z * P.d);
        if (t < 0.5) tmp.copy(cEdge).lerp(cMid, t / 0.5); else tmp.copy(cMid).lerp(cNeck, (t - 0.5) / 0.5);
        colors.push(tmp.r, tmp.g, tmp.b);
      }
      g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      g.computeVertexNormals();
      return (geoCache[type] = g);
    };
    const papillaGeo = new THREE.SphereGeometry(1, 24, 16);

    /* ---------- arcada (dentes + gengiva) ---------- */
    const rnd = (i) => { const s = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };
    const teeth = [];
    let seed = 1;

    const buildArch = ({ k, types, upper, scale }) => {
      // curva da arcada: z = -k·x², com tabela de comprimento de arco
      const xs = [], ls = [];
      let L = 0, px = 0, pz = 0;
      for (let x = 0; x <= 6; x += 0.002) {
        const z = -k * x * x;
        if (x > 0) L += Math.hypot(x - px, z - pz);
        xs.push(x); ls.push(L); px = x; pz = z;
      }
      const xAt = (len) => {
        let lo = 0, hi = ls.length - 1;
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ls[m] < len) lo = m; else hi = m; }
        return xs[hi];
      };
      const normalAt = (x) => { const nx = 2 * k * x, nl = Math.hypot(nx, 1); return [nx / nl, 1 / nl]; };

      const arch = new THREE.Group();
      const GUM = 0.9;                          // do plano oclusal até a margem da gengiva
      const dir = upper ? 1 : -1;
      let acc = 0.015;
      const centers = [];

      types.forEach((type) => {
        const P = TYPES[type];
        const w = P.w * 2 * scale;
        const center = acc + w / 2;
        centers.push({ len: center, w, P });
        acc += w + 0.03;
        const x = xAt(center);
        const angle = Math.atan(2 * k * x);
        [1, -1].forEach((side) => {
          const pivot = new THREE.Group();
          pivot.position.set(side * x, dir * (GUM + 0.14 - P.h * scale), -k * x * x);
          pivot.rotation.y = side * angle;
          const flip = new THREE.Group();
          if (!upper) flip.rotation.x = Math.PI;
          // material próprio por dente: permite pintar de azul só os já escaneados
          const mesh = new THREE.Mesh(toothGeo(type), enamel.clone());
          mesh.scale.setScalar(scale);
          mesh.userData.x = side * x;
          const shell = new THREE.Mesh(toothGeo(type), alignerMat);
          shell.scale.setScalar(1.13);
          mesh.add(shell);
          flip.add(mesh);
          pivot.add(flip);
          arch.add(pivot);
          // desalinhamento bem visível nos dentes da frente
          const amt = type === 'mol' ? 0.3 : type === 'pre' ? 0.6 : 1;
          const r = () => rnd(seed++) - 0.5;
          const sgn = () => (rnd(seed++) > 0.5 ? 1 : -1);
          mesh.userData.off = {
            ry: sgn() * (0.35 + Math.abs(r()) * 0.9) * amt,   // giro de 20° a 45°
            rz: r() * 0.6 * amt, rx: r() * 0.35 * amt,
            dz: r() * 0.9 * amt, dy: r() * 0.3 * amt,
          };
          teeth.push(mesh);
        });
      });

      // papilas: pontas de gengiva entre os dentes (formam o contorno recortado)
      const papAt = [0, ...centers.slice(0, -1).map((c, i) => c.len + c.w / 2 + 0.015)];
      papAt.forEach((len, i) => {
        const x = xAt(len), [nx, nz] = normalAt(x);
        const depth = (centers[Math.min(i, centers.length - 1)].P.d + 0.1) * scale;
        [1, -1].forEach((side) => {
          if (i === 0 && side === -1) return; // a do meio é uma só
          const pap = new THREE.Mesh(papillaGeo, gumMat);
          pap.scale.set(0.27, 0.3, depth * 1.05);
          pap.position.set(side * x - side * nx * 0.03, dir * (GUM + 0.05), -k * x * x - nz * 0.03);
          pap.rotation.y = side * Math.atan(2 * k * x);
          arch.add(pap);
        });
      });

      // base da gengiva: placa arredondada com o contorno da arcada (fecha o céu da boca / assoalho)
      const xEnd = xAt(acc + 0.1);
      const outer = [];
      for (let x = -xEnd; x <= xEnd + 1e-6; x += 0.06) {
        const [nx, nz] = normalAt(x), z = -k * x * x, o = 0.24;
        outer.push(new THREE.Vector2(x + nx * o, -(z + nz * o)));
      }
      const back = -(-k * xEnd * xEnd - 0.55);
      const shape = new THREE.Shape([
        ...outer,
        new THREE.Vector2(xEnd * 0.82, back), new THREE.Vector2(0, back - 0.25), new THREE.Vector2(-xEnd * 0.82, back),
      ]);
      const plateGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.75, bevelEnabled: true, bevelThickness: 0.34, bevelSize: 0.3, bevelSegments: 10, curveSegments: 8, steps: 1,
      });
      plateGeo.rotateX(-Math.PI / 2);
      const plate = new THREE.Mesh(plateGeo, gumMat);
      // a borda arredondada da placa vira a margem da gengiva
      plate.position.y = upper ? GUM + 0.32 : -GUM - 1.07;
      arch.add(plate);
      return arch;
    };

    /* ---------- maxila e mandíbula, abertas como na referência ---------- */
    const HINGE_Z = -4.2;
    const jaw = (arch, open) => {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0, HINGE_Z);
      arch.position.z = -HINGE_Z;
      pivot.add(arch);
      pivot.rotation.x = open;
      return pivot;
    };
    const upperArch = buildArch({ k: 0.42, types: ['inc', 'lat', 'can', 'pre', 'pre', 'mol', 'mol'], upper: true, scale: 1 });
    const lowerArch = buildArch({ k: 0.46, types: ['linc', 'linc', 'can', 'pre', 'pre', 'mol', 'mol'], upper: false, scale: 0.96 });
    lowerArch.position.z -= 0.25; // mordida: incisivos de baixo atrás dos de cima

    // língua dentro da arcada inferior
    const tongueGeo = new THREE.SphereGeometry(1, 48, 32);
    {
      const pos = tongueGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const front = Math.max(0, z);                 // ponta mais fina e arredondada
        x *= 1 - 0.35 * front * front;
        if (y > 0) y *= 0.55 + 0.25 * Math.cos(x * 1.4); // sulco central suave
        y -= 0.12 * x * x;
        pos.setXYZ(i, x, y, z);
      }
      tongueGeo.computeVertexNormals();
    }
    const tongue = new THREE.Mesh(tongueGeo, tongueMat);
    tongue.scale.set(1.3, 0.38, 2.1);
    tongue.position.set(0, -1.12, -2.25); // baixa e recuada: fica atrás dos dentes de baixo
    tongue.rotation.x = -0.05;
    lowerArch.add(tongue);

    const upperJaw = jaw(upperArch, -0.2);
    const lowerJaw = jaw(lowerArch, 0.24);
    const model = new THREE.Group();
    model.add(upperJaw, lowerJaw);
    model.position.y = -0.1;
    scene.add(model);

    /* ---------- feixe de escaneamento (lâmina de luz que atravessa a arcada) ---------- */
    const sheetTex = (() => {
      const c = document.createElement('canvas'); c.width = 4; c.height = 64;
      const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, 'rgba(255,214,140,0)'); gr.addColorStop(0.5, 'rgba(255,226,160,1)'); gr.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 4, 64);
      return new THREE.CanvasTexture(c);
    })();
    const scan = new THREE.Group();
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.8),
      new THREE.MeshBasicMaterial({ map: sheetTex, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    sheet.rotation.y = Math.PI / 2;
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 0.035),
      new THREE.MeshBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    edge.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    scan.add(sheet, edge);
    scan.position.set(0, 0, -2);
    scan.visible = false;
    model.add(scan);

    /* ---------- interação: arrastar para girar ---------- */
    let yaw = 0, yawTarget = 0, dragging = false, lastX = 0;
    canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); hint.style.opacity = '0'; });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      yawTarget = Math.max(-1.2, Math.min(1.2, yawTarget + (e.clientX - lastX) * 0.008));
      lastX = e.clientX;
    });
    const end = () => { dragging = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    /* ---------- tamanho ---------- */
    const resize = () => {
      const w = host.clientWidth || 400;
      renderer.setSize(w, Math.round(w / ASPECT), false);
    };
    new ResizeObserver(resize).observe(host);
    resize();

    /* ---------- loop (só roda com a cena visível) ---------- */
    // ângulo da boca em cada etapa (-0.54 = de frente para a câmera)
    const STAGE_YAW = [-0.1, 0.2, -0.54, -0.15];
    const cur = { s: 0, al: 0, base: STAGE_YAW[0] };
    let visible = false, raf = 0;
    const t0 = performance.now();
    const frame = (now) => {
      raf = 0;
      const t = (now - t0) / 1000;
      const m = stage._mouth || { p: 0, s: 0, al: 0, scan: 0, scanOn: false };
      const p = m.p || 0;
      const idx = p >= 0.995 ? 3 : Math.min(2, Math.floor(p * 3));
      cur.s += (m.s - cur.s) * 0.14;
      cur.al += (m.al - cur.al) * 0.18;
      const inv = 1 - cur.s;
      const scanX = -3.6 + (m.scan || 0) * 7.2;
      // azul do escaneamento: o dente fica azul quando a luz passa e volta ao branco no uso das placas
      const scanFade = idx === 1 ? 1 : idx === 2 ? Math.max(0, 1 - (p * 3 - 2) / 0.15) : 0;
      for (const mesh of teeth) {
        const o = mesh.userData.off;
        mesh.rotation.set(o.rx * inv, o.ry * inv, o.rz * inv);
        mesh.position.set(0, o.dy * inv, o.dz * inv);
        const scanned = idx > 1 || (idx === 1 && mesh.userData.x < scanX) ? 1 : 0;
        const mat = mesh.material;
        const e = mat.userData.e || 0;
        mat.userData.e = e + (scanned * scanFade - e) * 0.2;
        // dente escaneado: cor azul-digital + leve brilho próprio
        mat.color.copy(WHITE).lerp(SCAN_TINT, mat.userData.e);
        mat.emissive.copy(SCAN_BLUE).multiplyScalar(0.45 * mat.userData.e);
      }
      alignerMat.opacity = 0.7 * cur.al;
      scan.visible = !!m.scanOn;
      scan.position.x = scanX;

      if (!dragging) yawTarget *= 0.985; // volta devagar à posição da etapa
      yaw += (yawTarget - yaw) * 0.1;
      cur.base += (STAGE_YAW[idx] - cur.base) * 0.05;
      const sway = reduced ? 0 : Math.sin(t * 0.4) * 0.06;
      model.rotation.y = cur.base + sway + yaw;

      renderer.render(scene, camera);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; start(); }, { rootMargin: '100px' }).observe(host);
    document.addEventListener('visibilitychange', start);

    renderer.render(scene, camera);
    stage.classList.add('is-3d');
  }
})();
