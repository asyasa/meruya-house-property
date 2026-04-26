/* KPR / mortgage simulator */
(function () {
  'use strict';

  function formatIDR(n) {
    if (!isFinite(n)) n = 0;
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }

  function initCalculator() {
    const form = document.getElementById('kprForm');
    if (!form) return;
    const type = document.getElementById('kprType');
    const price = document.getElementById('kprPrice');
    const dp = document.getElementById('kprDp');
    const dpLabel = document.getElementById('kprDpLabel');
    const tenor = document.getElementById('kprTenor');
    const rate = document.getElementById('kprRate');
    const rateLabel = document.getElementById('kprRateLabel');
    const monthly = document.getElementById('kprMonthly');
    const total = document.getElementById('kprTotal');
    const interest = document.getElementById('kprInterest');

    let anim = {
      m: 0, t: 0, i: 0,
    };
    let qm, qt, qi;
    if (window.gsap) {
      qm = gsap.quickTo(anim, 'm', { duration: 0.5, ease: 'power3.out', onUpdate: () => (monthly.textContent = formatIDR(anim.m)) });
      qt = gsap.quickTo(anim, 't', { duration: 0.5, ease: 'power3.out', onUpdate: () => (total.textContent = formatIDR(anim.t)) });
      qi = gsap.quickTo(anim, 'i', { duration: 0.5, ease: 'power3.out', onUpdate: () => (interest.textContent = formatIDR(anim.i)) });
    }

    function update() {
      const P = Math.max(0, Number(price.value));
      const dpPct = Math.max(0, Number(dp.value));
      const years = Math.max(1, Number(tenor.value));
      const annual = Math.max(0.01, Number(rate.value));
      dpLabel.textContent = dpPct + '%';
      rateLabel.textContent = annual.toFixed(1).replace('.', ',') + '%';

      const loan = P * (1 - dpPct / 100);
      const r = annual / 100 / 12;
      const n = years * 12;
      const m = r === 0 ? loan / n : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const tot = m * n;
      const inter = tot - loan;

      if (qm) { qm(m); qt(tot); qi(inter); }
      else {
        monthly.textContent = formatIDR(m);
        total.textContent = formatIDR(tot);
        interest.textContent = formatIDR(inter);
      }
    }

    type.addEventListener('change', () => { price.value = type.value; update(); });
    [price, dp, tenor, rate].forEach((el) => el.addEventListener('input', update));
    update();
  }

  window.__initCalculator = initCalculator;
})();
