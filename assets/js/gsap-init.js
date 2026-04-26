/*
 * GSAP + ScrollTrigger scene setup
 * - Lightweight split-text (chars/words) without paid plugins
 * - Section reveals, parallax, counters, magnetic buttons
 * - Horizontal scroll for .typologies
 * - SVG path draw
 */
(function () {
  'use strict';

  function splitChars(el) {
    if (el.dataset.splitDone === '1') return;
    const text = el.textContent;
    const frag = document.createDocumentFragment();
    const words = text.split(/(\s+)/);
    words.forEach((w) => {
      if (/^\s+$/.test(w)) {
        frag.appendChild(document.createTextNode(w));
        return;
      }
      const wrap = document.createElement('span');
      wrap.className = 'wd';
      wrap.style.overflow = 'hidden';
      wrap.style.display = 'inline-block';
      wrap.style.verticalAlign = 'bottom';
      [...w].forEach((c) => {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = c;
        wrap.appendChild(ch);
      });
      frag.appendChild(wrap);
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.splitDone = '1';
    el.classList.add('is-split-ready');
  }

  function splitWords(el) {
    if (el.dataset.splitDone === '1') return;
    // treat <em> children as a single word wrapper
    const nodes = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const parts = n.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (/^\s+$/.test(p)) {
            nodes.push(document.createTextNode(p));
          } else if (p.length) {
            const w = document.createElement('span'); w.className = 'wd'; w.textContent = p;
            w.style.display = 'inline-block';
            w.style.willChange = 'transform, opacity';
            nodes.push(w);
          }
        });
      } else {
        // wrap existing element so it animates as one word
        const w = document.createElement('span'); w.className = 'wd';
        w.style.display = 'inline-block';
        w.appendChild(n.cloneNode(true));
        nodes.push(w);
      }
    });
    el.innerHTML = '';
    nodes.forEach((n) => el.appendChild(n));
    el.dataset.splitDone = '1';
    el.classList.add('is-split-ready');
  }

  function initGSAPScene() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // ------- split targets -------
    document.querySelectorAll('[data-split-chars]').forEach(splitChars);
    document.querySelectorAll('[data-split-words]').forEach(splitWords);

    if (prefersReducedMotion) {
      document.querySelectorAll('.ch, .wd').forEach((n) => {
        n.style.transform = 'none';
        n.style.opacity = '1';
      });
    } else {
      // chars (hero title)
      document.querySelectorAll('[data-split-chars]').forEach((el) => {
        const chars = el.querySelectorAll('.ch');
        gsap.to(chars, {
          y: '0%', opacity: 1,
          duration: 1.1, ease: 'power4.out',
          stagger: { each: 0.02 },
          scrollTrigger: { trigger: el, start: 'top 90%' },
        });
      });
      // words (sections)
      document.querySelectorAll('[data-split-words]').forEach((el) => {
        const words = el.querySelectorAll('.wd');
        gsap.to(words, {
          y: '0%', rotate: 0, opacity: 1,
          duration: 0.9, ease: 'power3.out',
          stagger: { each: 0.045 },
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    }

    // ------- hero parallax on background + content -------
    if (!prefersReducedMotion) {
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || -0.2;
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('.hero') || el, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
      // hero content rises slightly slower
      const heroContent = document.querySelector('.hero__content');
      if (heroContent) {
        gsap.to(heroContent, {
          yPercent: -10, opacity: 0.6,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      }
    }

    // ------- counters -------
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseFloat(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target, duration: 1.6, ease: 'power3.out',
            onUpdate: () => {
              const val = target >= 100 ? Math.round(obj.v).toLocaleString('id-ID') : (Math.round(obj.v * 10) / 10);
              el.textContent = val + suffix;
            },
            onComplete: () => { el.textContent = target.toLocaleString('id-ID') + suffix; },
          });
        },
      });
    });

    // ------- generic reveals -------
    if (!prefersReducedMotion) {
      gsap.utils.toArray('.feature-card, .amenity, .community__card, .trust__card, .tips__card, .protection__node, .commercial__item, .about__media-frame').forEach((el, i) => {
        gsap.from(el, {
          y: 48, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        });
      });

      gsap.utils.toArray('.gallery__item').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          clipPath: 'inset(100% 0 0 0)',
          duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 92%' },
        });
      });
    }

    // ------- horizontal scroll: Typologies -------
    const track = document.getElementById('typologyTrack');
    if (track && !prefersReducedMotion && window.innerWidth >= 900) {
      const cards = track.querySelectorAll('.typology');
      const section = track.closest('.typologies');
      const progress = document.getElementById('typologyProgress');
      const indexLabel = document.getElementById('typologyIndex');

      function scrollDistance() {
        return track.scrollWidth - window.innerWidth + 80;
      }

      const scrub = gsap.to(track, {
        x: () => -scrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + scrollDistance(),
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (progress) progress.style.transform = `scaleX(${self.progress})`;
            if (indexLabel) {
              const idx = Math.min(cards.length, Math.floor(self.progress * cards.length) + 1);
              indexLabel.textContent = String(idx).padStart(2, '0');
            }
          },
        },
      });

      // tilt effect per card
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotationY: x * 6, rotationX: -y * 4, duration: 0.6, ease: 'power3.out' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'power3.out' });
        });
      });
    }

    // ------- SVG draw (protection path) -------
    const protPath = document.getElementById('protectionPath');
    if (protPath && !prefersReducedMotion) {
      const len = protPath.getTotalLength();
      gsap.set(protPath, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(protPath, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.protection__timeline', start: 'top 75%' },
      });
    }

    // ------- Magnetic buttons -------
    if (!window.matchMedia('(hover: none)').matches && !prefersReducedMotion) {
      document.querySelectorAll('.magnetic').forEach((btn) => {
        const q = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
        const r = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          q((e.clientX - cx) * 0.25);
          r((e.clientY - cy) * 0.35);
        });
        btn.addEventListener('mouseleave', () => { q(0); r(0); });
      });
    }

    // ------- Refresh ScrollTrigger after images load (helps horizontal pin) -------
    window.addEventListener('load', () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 500);
  }

  window.__initGSAPScene = initGSAPScene;
})();
