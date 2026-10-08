(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Palavras rotativas com efeito de digitação
  const words = ['vinhedos', 'queijos e vinhos', 'vilas históricas', 'pequenos grupos', 'roteiros autorais', 'memórias'];
  const rot = document.getElementById('rot');
  let w = 0, c = 0, del = false;
  (function type() {
    const word = words[w];
    c += del ? -1 : 1;
    rot.textContent = word.slice(0, c);
    let t = del ? 40 : 90;
    if (!del && c === word.length) { del = true; t = 1400; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; t = 300; }
    setTimeout(type, t);
  })();

  // Ripple + toast ao clicar nos links
  const toast = document.getElementById('toast');
  document.querySelectorAll('.bio-link').forEach(a => {
    a.addEventListener('click', e => {
      const r = a.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      const size = 60;
      s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      a.appendChild(s);
      setTimeout(() => s.remove(), 700);
      toast.classList.add('on');
      setTimeout(() => toast.classList.remove('on'), 1600);
    });
    if (reduce) return;
    // Inclinação 3D + brilho que segue o mouse
    a.addEventListener('pointermove', e => {
      const r = a.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      a.style.setProperty('--mx', x * 100 + '%');
      a.style.setProperty('--my', y * 100 + '%');
      a.style.transform = `perspective(600px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-2px)`;
    });
    a.addEventListener('pointerleave', () => { a.style.transform = ''; });
  });
  if (reduce) return;

  // Brilho que segue o cursor
  const glow = document.querySelector('.cursor-glow');
  addEventListener('pointermove', e => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

  // Parallax da capa
  const hero = document.querySelector('.cover__hero');
  addEventListener('scroll', () => {
    const y = Math.min(scrollY, 400);
    hero.style.transform = `scale(1.08) translateY(${y * 0.25}px)`;
  }, { passive: true });

  // Bolhas de espumante subindo
  const cv = document.getElementById('fx'), ctx = cv.getContext('2d');
  let W, H, dpr;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
  };
  resize(); addEventListener('resize', resize);
  const mk = (init) => ({
    x: Math.random() * W, y: init ? Math.random() * H : H + 20,
    r: (1 + Math.random() * 3.5) * dpr, v: (0.25 + Math.random() * 0.7) * dpr,
    p: Math.random() * 6.28, a: 0.15 + Math.random() * 0.35
  });
  const bubbles = Array.from({ length: 38 }, () => mk(true));
  const bursts = [];
  (function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const b of bubbles) {
      b.y -= b.v; b.p += 0.02; b.x += Math.sin(b.p) * 0.4 * dpr;
      if (b.y < -20) Object.assign(b, mk(false));
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.28);
      ctx.strokeStyle = `rgba(230,203,159,${b.a})`; ctx.lineWidth = dpr; ctx.stroke();
      ctx.fillStyle = `rgba(255,250,242,${b.a * 0.25})`; ctx.fill();
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.12 * dpr; p.life -= 0.02;
      if (p.life <= 0) { bursts.splice(i, 1); continue; }
      ctx.fillStyle = p.c.replace('A', p.life); ctx.fillRect(p.x, p.y, 4 * dpr, 6 * dpr);
    }
    requestAnimationFrame(frame);
  })();

  // Confete de brinde ao clicar no logo
  const cols = ['rgba(100,31,56,A)', 'rgba(185,145,84,A)', 'rgba(230,203,159,A)', 'rgba(255,250,242,A)'];
  document.querySelector('.profile__monogram').addEventListener('click', e => {
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * 6.28, s = (2 + Math.random() * 6) * dpr;
      bursts.push({ x: e.clientX * dpr, y: e.clientY * dpr, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4 * dpr, life: 1, c: cols[i % 4] });
    }
  });
})();
