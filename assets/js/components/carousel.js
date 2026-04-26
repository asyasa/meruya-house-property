/* Swiper testimonial carousel */
(function () {
  'use strict';
  function initCarousel() {
    if (typeof Swiper === 'undefined') return;
    const el = document.querySelector('.testimonialsSwiper');
    if (!el) return;
    /* eslint-disable no-new */
    new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      grabCursor: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      speed: 700,
      pagination: { el: '.testimonialsSwiper .swiper-pagination', clickable: true },
      navigation: { nextEl: '.testimonialsSwiper .swiper-button-next', prevEl: '.testimonialsSwiper .swiper-button-prev' },
      breakpoints: {
        640: { slidesPerView: 1.4, spaceBetween: 20 },
        960: { slidesPerView: 2, spaceBetween: 24 },
        1280: { slidesPerView: 2.4, spaceBetween: 28 },
      },
    });

    // stars fill animation (simple stagger)
    document.querySelectorAll('.testimonial__stars').forEach((starsEl) => {
      const stars = starsEl.querySelectorAll('i');
      if (!window.gsap) return;
      gsap.from(stars, {
        opacity: 0,
        scale: 0.6,
        stagger: 0.08,
        duration: 0.45,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: starsEl, start: 'top 95%' },
      });
    });
  }

  window.__initCarousel = initCarousel;
})();
