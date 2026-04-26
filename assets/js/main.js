/*
 * Komplek Masyarakat Sejahtera — main bootstrap
 * Preloader, Lenis smooth scroll, nav, cursor, hero particles, lightbox,
 * amenities tabs. GSAP-related work lives in gsap-init.js.
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ------------------------------------------------------------------ */
  /* Preloader                                                          */
  /* ------------------------------------------------------------------ */
  const preloader = document.getElementById('preloader');
  const preloaderCount = document.getElementById('preloaderCount');
  const preloaderFill = preloader ? preloader.querySelector('.preloader__bar-fill') : null;
  const preloaderCurtain = preloader ? preloader.querySelector('.preloader__curtain') : null;

  function runPreloader() {
    return new Promise((resolve) => {
      if (!preloader) { resolve(); return; }
      let p = 0;
      const start = performance.now();
      const duration = prefersReducedMotion ? 300 : 1800;
      function tick(now) {
        const elapsed = now - start;
        p = Math.min(100, (elapsed / duration) * 100);
        if (preloaderCount) preloaderCount.textContent = Math.round(p);
        if (preloaderFill) preloaderFill.style.width = p + '%';
        if (p < 100) {
          requestAnimationFrame(tick);
        } else {
          // curtain out
          if (preloaderCurtain) {
            preloaderCurtain.style.transition = 'transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)';
            preloaderCurtain.style.transform = 'translateY(-100%)';
          }
          preloader.style.transition = 'opacity 0.6s ease 0.3s';
          setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
            document.body.classList.remove('no-scroll');
            setTimeout(() => { preloader.setAttribute('aria-hidden', 'true'); resolve(); }, 600);
          }, 400);
        }
      }
      requestAnimationFrame(tick);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lenis smooth scroll                                                */
  /* ------------------------------------------------------------------ */
  let lenis = null;
  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return null;
    lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
    }

    // anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -60, duration: 1.1 });
        const overlay = document.getElementById('menuOverlay');
        if (overlay && overlay.classList.contains('is-open')) closeMenu();
      });
    });
    window.__lenis = lenis;
    return lenis;
  }

  /* ------------------------------------------------------------------ */
  /* Navigation + mobile overlay                                        */
  /* ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('menuOverlay');
  const closeBtn = document.getElementById('menuClose');

  function updateNav() {
    if (!nav) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('is-scrolled', y > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  function openMenu() {
    if (!overlay) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  if (toggle) toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ------------------------------------------------------------------ */
  /* Custom cursor                                                      */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouch || prefersReducedMotion) return;
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    const label = cursor.querySelector('.cursor__label');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`; }, { passive: true });

    function raf() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('[data-cursor-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover', 'cursor--image'));
    });

    // Image cursor text
    document.querySelectorAll('.typology__img, .gallery__item, .amenities__gallery figure, .commercial__item figure, .about__media-frame').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover', 'cursor--image');
        label.textContent = el.closest('.gallery__item') ? 'Lihat' : (el.closest('.typology__img') ? 'Detail' : 'Zoom');
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover', 'cursor--image'));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero Three.js particle field                                       */
  /* ------------------------------------------------------------------ */
  function initHeroParticles() {
    if (prefersReducedMotion || typeof THREE === 'undefined') return;
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const hero = canvas.closest('.hero');
    if (!hero) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 6;

    const count = 420;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8d86c9, size: 0.035, sizeAttenuation: true,
      transparent: true, opacity: 0.85, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    function size() {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    size();
    window.addEventListener('resize', size);

    let mouseX = 0, mouseY = 0;
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    let tid = 0;
    function tick(t) {
      tid = requestAnimationFrame(tick);
      points.rotation.y = t * 0.00004 + mouseX * 0.08;
      points.rotation.x = mouseY * -0.06;
      renderer.render(scene, camera);
    }
    tick(0);

    // stop ticking when hero out of view to save battery
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) { cancelAnimationFrame(tid); }
        else { tick(performance.now()); }
      });
    }, { threshold: 0 });
    obs.observe(hero);
  }

  /* ------------------------------------------------------------------ */
  /* Amenities tabs                                                     */
  /* ------------------------------------------------------------------ */
  function initAmenities() {
    const tabs = document.querySelectorAll('.amenities__tab');
    const panes = document.querySelectorAll('.amenities__pane');
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.tab;
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        panes.forEach((p) => p.classList.toggle('is-active', p.dataset.pane === key));
        const active = document.querySelector(`.amenities__pane[data-pane="${key}"]`);
        if (active && window.gsap && !prefersReducedMotion) {
          gsap.fromTo(active.children,
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Gallery lightbox                                                   */
  /* ------------------------------------------------------------------ */
  function initLightbox() {
    const items = Array.from(document.querySelectorAll('.gallery__item'));
    if (!items.length) return;
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    const closeBtn = document.getElementById('lightboxClose');
    const prev = document.getElementById('lightboxPrev');
    const next = document.getElementById('lightboxNext');
    let idx = 0;

    function show(i) {
      idx = (i + items.length) % items.length;
      const src = items[idx].querySelector('img').src.replace(/w=\d+/, 'w=1800');
      const alt = items[idx].querySelector('img').alt;
      const captionEl = items[idx].querySelector('figcaption');
      img.src = src;
      img.alt = alt;
      cap.textContent = captionEl ? captionEl.textContent : '';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (lenis) lenis.stop();
    }
    function hide() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lenis) lenis.start();
    }

    items.forEach((item, i) => item.addEventListener('click', () => show(i)));
    closeBtn.addEventListener('click', hide);
    prev.addEventListener('click', () => show(idx - 1));
    next.addEventListener('click', () => show(idx + 1));
    box.addEventListener('click', (e) => { if (e.target === box) hide(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Lazy reveal fallback (for browsers/time when GSAP ScrollTrigger    */
  /* hasn't attached yet)                                               */
  /* ------------------------------------------------------------------ */
  function initLazyReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Scroll progress indicator                                          */
  /* ------------------------------------------------------------------ */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress__bar');
    const label = document.getElementById('scrollProgressLabel');
    if (!bar) return;
    const sections = Array.from(document.querySelectorAll('[data-section]'));
    function onScroll() {
      const h = document.documentElement;
      const pct = (h.scrollTop || window.scrollY) / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.setProperty('--progress', (pct * 100) + '%');
      let current = sections[0];
      const y = window.scrollY + 120;
      for (const s of sections) {
        if (s.offsetTop <= y) current = s;
      }
      if (current && label) label.textContent = current.dataset.section || '';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
  function boot() {
    runPreloader().then(() => {
      initLenis();
      initCursor();
      initHeroParticles();
      initAmenities();
      initLightbox();
      initLazyReveal();
      initScrollProgress();
      if (window.__initGSAPScene) window.__initGSAPScene();
      if (window.__initCarousel) window.__initCarousel();
      if (window.__initCalculator) window.__initCalculator();
      if (window.__initForm) window.__initForm();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
