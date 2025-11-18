/* main.js — complet, compatible avec boutique.js & boost.js
   - click, image changes, +1 visual, cps, save/load, reset, rebirth
   - n'enlève rien, s'intègre si d'autres fonctions existent
*/

(() => {
  // --------- SHARED GAME OBJECT ---------
  window.BountyGame = window.BountyGame || {};
  if (window.BountyGame.count === undefined) window.BountyGame.count = 0;
  if (window.BountyGame.clickValue === undefined) window.BountyGame.clickValue = 1;
  if (window.BountyGame.addClickBonus === undefined) window.BountyGame.addClickBonus = 0; // gamelle
  if (window.BountyGame.addCageBonus === undefined) window.BountyGame.addCageBonus = 0;  // cage
  if (window.BountyGame.cps === undefined) window.BountyGame.cps = 0;

  // Rebirth persistent fields
  if (window.BountyGame.rebirths === undefined) window.BountyGame.rebirths = 0;
  if (window.BountyGame.rebirthBonusClick === undefined) window.BountyGame.rebirthBonusClick = 0;
  if (window.BountyGame.rebirthBonusCPS === undefined) window.BountyGame.rebirthBonusCPS = 0;
  if (window.BountyGame.rebirthPrice === undefined) window.BountyGame.rebirthPrice = 1_000_000;

  // --------- DOM ELEMENTS ---------
  const imgEl = document.getElementById('image');
  const counterEl = document.getElementById('counter');
  const cpsEl = document.getElementById('cps');
  const resetButton = document.getElementById('resetButton');
  const clickSound = document.getElementById('clickSound');

  // Some pages may not have store/boost containers in this context; guard references
  const storeDiv = document.getElementById('storeItems');
  const boostsDiv = document.getElementById('boostsContainer');

  // --------- IMAGE RANDOMIZER (clic feedback) ---------
  const images = [
    'image/bounty.jpg','image/bounty2.jpg','image/bounty3.jpg',
    'image/bounty4.jpg','image/bounty5.jpg','image/bounty6.jpg',
    'image/bounty7.jpg','image/bounty8.jpg','image/bountygraille.jpg'
  ];
  let lastImageIdx = -1;
  function changerImage(){
    if (!imgEl) return;
    let idx;
    do { idx = Math.floor(Math.random() * images.length); } while (images.length > 1 && idx === lastImageIdx);
    lastImageIdx = idx;
    imgEl.src = images[idx];
  }

  // --------- UI / PLUS-ONE VISUAL ---------
  function spawnPlusOne(x, y, value){
    const el = document.createElement('div');
    el.className = 'plus-one';
    el.textContent = `+${Math.floor(value)}`;
    // position near cursor but keep inside viewport
    const left = Math.min(window.innerWidth - 60, Math.max(8, x));
    const top = Math.min(window.innerHeight - 40, Math.max(8, y));
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 950);
  }

  // --------- UPDATE COUNTERS UI ---------
  function updateCounterUI(){
    if (counterEl) counterEl.textContent = `Croquettes : ${Math.floor(window.BountyGame.count)} (×${(window.BountyGame.multiplier ?? 1)})`;
    if (cpsEl) cpsEl.textContent = `CPS : ${Math.floor(window.BountyGame.cps)}`;
  }
  window.updateCounterUI = updateCounterUI;

  // --------- CPS CALCULATION (uses storeItemsData & boostsData if present) ---------
  function calculCPS(){
    let total = 0;
    const items = window.storeItemsData || [];
    const boosts = window.boostsData || [];

    items.forEach(it => {
      if (it.auto && it.owned) {
        let gain = it.auto * it.owned;
        // example boost interactions — keep as is if boosts present
        if (boosts[1] && boosts[1].active) gain *= 2; // employés compétents
        if (boosts[4] && boosts[4].active) gain *= 1.05; // augmentation droits
        total += gain;
      }
    });

    // add rebirth CPS bonus (permanent)
    total += (window.BountyGame.rebirthBonusCPS || 0);

    return total;
  }

  // --------- CLICK HANDLER (non-destructive) ---------
  // Use addEventListener to avoid overwriting other click handlers
  if (imgEl) {
    imgEl.addEventListener('click', (ev) => {
      try { if (clickSound) { clickSound.currentTime = 0; clickSound.volume = 0.9; clickSound.play(); } } catch(e){}

      // base multiplier logic if you have one
      let bonus = window.BountyGame.multiplier ?? 1;

      // apply temporary boosts from boostsData (if defined)
      const boosts = window.boostsData || [];
      if (boosts[0] && boosts[0].active) bonus *= 1.5; // bounty doré
      if (boosts[2] && boosts[2].active) {
        if (Math.random() < 0.5) bonus = 0;
        else bonus *= 2;
      }
      if (boosts[5] && boosts[5].active) bonus *= 1.10;
      if (boosts[8] && boosts[8].active) bonus *= 2;

      // compute gain: base clickValue + shop bonuses + rebirth click bonus, then * bonus multiplier
      const baseClick = (window.BountyGame.clickValue || 1) + (window.BountyGame.addClickBonus || 0) + (window.BountyGame.addCageBonus || 0) + (window.BountyGame.rebirthBonusClick || 0);
      let gain = baseClick * (bonus || 1);

      // add to total
      window.BountyGame.count += gain;

      // visual & feedback
      spawnPlusOne(ev.clientX, ev.clientY, gain);
      changerImage();

      // update
      updateCounterUI();
      if (typeof window.updateStore === 'function') window.updateStore();
      if (typeof window.sauvegarderJeu === 'function') window.sauvegarderJeu();
    });
  } else {
    console.warn("main.js — élément #image introuvable");
  }

  // --------- AUTO CPS INCOME ---------
  setInterval(() => {
    const cpsGain = calculCPS();
    window.BountyGame.count += cpsGain;
    window.BountyGame.cps = cpsGain;
    updateCounterUI();
    if (typeof window.updateStore === 'function') window.updateStore();
  }, 1000);

  // --------- SAVE / LOAD (compatible) ---------
  function sauvegarderJeu(){
    // try to preserve any existing save data structure — merge
    const prevRaw = localStorage.getItem('bountySave');
    let prev = {};
    if (prevRaw) {
      try { prev = JSON.parse(prevRaw); } catch(e){ prev = {}; }
    }

    const data = Object.assign({}, prev, {
      count: window.BountyGame.count,
      multiplier: window.BountyGame.multiplier ?? 1,
      clickValue: window.BountyGame.clickValue,
      addClickBonus: window.BountyGame.addClickBonus,
      addCageBonus: window.BountyGame.addCageBonus,
      cps: window.BountyGame.cps,
      rebirths: window.BountyGame.rebirths,
      rebirthPrice: window.BountyGame.rebirthPrice,
      rebirthBonusClick: window.BountyGame.rebirthBonusClick,
      rebirthBonusCPS: window.BountyGame.rebirthBonusCPS,
      storeItems: (window.storeItemsData || []).map(it=>({ owned: it.owned, price: it.price })),
      boosts: (window.boostsData || []).map(b=>({ active: !!b.active, permanent: !!b.permanent }))
    });

    localStorage.setItem('bountySave', JSON.stringify(data));
  }
  window.sauvegarderJeu = sauvegarderJeu;

  function chargerJeu(){
    const raw = localStorage.getItem('bountySave');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      window.BountyGame.count = data.count ?? window.BountyGame.count;
      window.BountyGame.multiplier = data.multiplier ?? window.BountyGame.multiplier ?? 1;
      window.BountyGame.clickValue = data.clickValue ?? window.BountyGame.clickValue;
      window.BountyGame.addClickBonus = data.addClickBonus ?? window.BountyGame.addClickBonus;
      window.BountyGame.addCageBonus = data.addCageBonus ?? window.BountyGame.addCageBonus;
      window.BountyGame.cps = data.cps ?? window.BountyGame.cps;

      window.BountyGame.rebirths = data.rebirths ?? window.BountyGame.rebirths;
      window.BountyGame.rebirthPrice = data.rebirthPrice ?? window.BountyGame.rebirthPrice;
      window.BountyGame.rebirthBonusClick = data.rebirthBonusClick ?? window.BountyGame.rebirthBonusClick;
      window.BountyGame.rebirthBonusCPS = data.rebirthBonusCPS ?? window.BountyGame.rebirthBonusCPS;

      if (Array.isArray(data.storeItems) && Array.isArray(window.storeItemsData)) {
        data.storeItems.forEach((s,i) => {
          if (window.storeItemsData[i]) {
            window.storeItemsData[i].owned = s.owned ?? window.storeItemsData[i].owned;
            window.storeItemsData[i].price = s.price ?? window.storeItemsData[i].price;
          }
        });
      }
      if (Array.isArray(data.boosts) && Array.isArray(window.boostsData)) {
        data.boosts.forEach((b,i) => {
          if (window.boostsData[i]) {
            window.boostsData[i].active = !!b.active;
            window.boostsData[i].permanent = !!b.permanent;
            if (window.boostsData[i].permanent) window.boostsData[i].available = false;
          }
        });
      }
    } catch (e) { console.warn("Load error", e); }
  }
  window.chargerJeu = chargerJeu;

  // --------- RESET ---------
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      if (!confirm("Réinitialiser le jeu et supprimer la sauvegarde ?")) return;
      window.BountyGame.count = 0;
      window.BountyGame.multiplier = 1;
      window.BountyGame.clickValue = 1;
      window.BountyGame.addClickBonus = 0;
      window.BountyGame.addCageBonus = 0;
      window.BountyGame.cps = 0;
      (window.storeItemsData || []).forEach(it => { it.owned = 0; it.price = it.basePrice ?? it.price; });
      (window.boostsData || []).forEach(b => { b.active = false; b.available = false; b.permanent = false; });
      // Rebirth reset? keep rebirths persistent, but if you want to reset them uncomment next lines:
      // window.BountyGame.rebirths = 0; window.BountyGame.rebirthPrice = 1000000; window.BountyGame.rebirthBonusClick = 0; window.BountyGame.rebirthBonusCPS = 0;
      sauvegarderJeu();
      if (typeof window.updateStore === 'function') window.updateStore();
      if (typeof window.afficherBoosts === 'function') window.afficherBoosts();
      updateCounterUI();
    });
  }

  // --------- REBIRTH SYSTEM (left of image) ---------
  function applyRebirthBonus(){
    // you can tune these numbers
    window.BountyGame.rebirthBonusClick = (window.BountyGame.rebirths || 0) * 1;   // +1 click per rebirth
    window.BountyGame.rebirthBonusCPS = (window.BountyGame.rebirths || 0) * 0.2;  // +0.2 CPS per rebirth
  }
  applyRebirthBonus();

  // Create UI container only once
  function ensureRebirthUI(){
    if (document.getElementById('rebirthContainer')) return document.getElementById('rebirthContainer');

    const container = document.createElement('div');
    container.id = 'rebirthContainer';
    // minimal inline styles — you can move to CSS file
    container.style.position = 'absolute';
    container.style.left = '20px';
    container.style.top = '50%';
    container.style.transform = 'translateY(-50%)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.zIndex = 10;
    document.body.appendChild(container);

    const btn = document.createElement('button');
    btn.id = 'rebirthButton';
    btn.className = 'btn reset';
    btn.style.width = '140px';
    container.appendChild(btn);

    const info = document.createElement('div');
    info.id = 'rebirthInfo';
    info.style.color = '#fff';
    info.style.fontWeight = '700';
    info.textContent = 'Rebirths : 0';
    container.appendChild(info);

    return container;
  }

  const rebirthUI = ensureRebirthUI();
  const rebirthBtn = document.getElementById('rebirthButton');
  const rebirthInfo = document.getElementById('rebirthInfo');

  function updateRebirthUI(){
    if (!rebirthBtn || !rebirthInfo) return;
    rebirthInfo.textContent = `Rebirths : ${window.BountyGame.rebirths || 0}`;
    rebirthBtn.textContent = `Rebirth (${(window.BountyGame.rebirthPrice || 0).toLocaleString()})`;
    rebirthBtn.disabled = window.BountyGame.count < (window.BountyGame.rebirthPrice || 0);
  }

  if (rebirthBtn) {
    rebirthBtn.addEventListener('click', () => {
      const price = window.BountyGame.rebirthPrice || 1000000;
      if (window.BountyGame.count < price) {
        alert(`Il faut ${price.toLocaleString()} croquettes pour rebirth.`);
        return;
      }
      if (!confirm(`Faire un Rebirth pour ${price.toLocaleString()} croquettes ? Votre progression sera réinitialisée, mais vous gagnerez un bonus permanent.`)) return;

      // perform rebirth
      window.BountyGame.rebirths = (window.BountyGame.rebirths || 0) + 1;
      window.BountyGame.count = 0;
      window.BountyGame.clickValue = 1;
      window.BountyGame.addClickBonus = 0;
      window.BountyGame.addCageBonus = 0;
      window.BountyGame.cps = 0;

      (window.storeItemsData || []).forEach(it => { it.owned = 0; it.price = it.basePrice ?? it.price; });
      (window.boostsData || []).forEach(b => { b.active = false; b.available = false; /* keep permanent as is */ });

      applyRebirthBonus();

      // increase price by +2,000,000
      window.BountyGame.rebirthPrice = (window.BountyGame.rebirthPrice || 0) + 2_000_000;

      // update
      updateCounterUI();
      if (typeof window.updateStore === 'function') window.updateStore();
      if (typeof window.afficherBoosts === 'function') window.afficherBoosts();
      sauvegarderJeu();
      updateRebirthUI();
    });
  }

  // --------- STARTUP (load then UI refresh) ---------
  document.addEventListener('DOMContentLoaded', () => {
    // give other scripts a chance to initialize (boutique/boost)
    setTimeout(() => {
      chargerJeu();
      if (typeof window.updateStore === 'function') window.updateStore();
      if (typeof window.afficherBoosts === 'function') window.afficherBoosts();
      applyRebirthBonus();
      updateCounterUI();
      updateRebirthUI();
      changerImage();
    }, 60);
  });

  // --------- PERIODIC SAVE ---------
  setInterval(sauvegarderJeu, 60000);

  // expose helpers (compat)
  window.updateRebirthUI = updateRebirthUI;
  window.applyRebirthBonus = applyRebirthBonus;
})();
