/* Booking form — client-side validation + success overlay */
(function () {
  'use strict';
  function initForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;
    const success = document.getElementById('cfSuccess');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = ['cfName', 'cfPhone', 'cfEmail'];
      let ok = true;
      required.forEach((id) => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.style.borderBottomColor = '#c04b5a';
          ok = false;
        } else {
          el.style.borderBottomColor = '';
        }
      });
      if (!ok) return;

      success.hidden = false;
      if (window.gsap) {
        gsap.fromTo(success, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      }
      setTimeout(() => {
        success.hidden = true;
        form.reset();
      }, 4500);
    });
  }

  window.__initForm = initForm;
})();
