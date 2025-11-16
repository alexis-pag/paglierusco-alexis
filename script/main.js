(() => {
  // Initialisation Rebirth
  window.BountyGame.rebirths = window.BountyGame.rebirths || 0;
  window.BountyGame.rebirthBonusClick = window.BountyGame.rebirthBonusClick || 0;
  window.BountyGame.rebirthBonusCPS = window.BountyGame.rebirthBonusCPS || 0;
  window.BountyGame.rebirthPrice = window.BountyGame.rebirthPrice || 1000000; // prix initial

  const rebirthBtn = document.createElement("button");
  rebirthBtn.id = "rebirthButton";
  rebirthBtn.className = "btn reset"; // utiliser le style des boutons existants
  document.querySelector(".clicker .panel-main").prepend(rebirthBtn);

  const rebirthCountEl = document.createElement("div");
  rebirthCountEl.id = "rebirthCount";
  rebirthCountEl.style.marginBottom = "8px";
  document.querySelector(".clicker .panel-main").prepend(rebirthCountEl);

  function updateRebirthUI() {
    rebirthCountEl.textContent = `Rebirths : ${window.BountyGame.rebirths}`;
    rebirthBtn.textContent = `Rebirth (${window.BountyGame.rebirthPrice.toLocaleString()} Croquettes)`;
    rebirthBtn.disabled = window.BountyGame.count < window.BountyGame.rebirthPrice;
  }

  function applyRebirthBonus() {
    // +1 click par rebirth
    window.BountyGame.rebirthBonusClick = window.BountyGame.rebirths * 1;
    // +0,2 CPS par rebirth
    window.BountyGame.rebirthBonusCPS = window.BountyGame.rebirths * 0.2;
  }

  rebirthBtn.addEventListener("click", () => {
    if(window.BountyGame.count >= window.BountyGame.rebirthPrice) {
      if(!confirm(`Voulez-vous faire un Rebirth pour ${window.BountyGame.rebirthPrice.toLocaleString()} croquettes ?`)) return;

      window.BountyGame.rebirths++;
      window.BountyGame.count = 0;
      window.BountyGame.clickValue = 1;
      window.BountyGame.addClickBonus = 0;
      window.BountyGame.addCageBonus = 0;
      window.BountyGame.cps = 0;

      // Reset boutique
      (window.storeItemsData || []).forEach(it => {
        it.owned = 0;
        it.price = it.basePrice ?? it.price;
      });

      // Appliquer bonus
      applyRebirthBonus();

      // Augmenter le prix de 2 000 000
      window.BountyGame.rebirthPrice += 2000000;

      updateUI();
      renderStore();
      if(window.sauvegarderJeu) window.sauvegarderJeu();
      updateRebirthUI();
    } else {
      alert(`Vous devez avoir au moins ${window.BountyGame.rebirthPrice.toLocaleString()} croquettes pour faire un Rebirth !`);
    }
  });

  // Modifier le gain au clic pour inclure le bonus Rebirth
  const originalClickHandler = img.onclick;
  img.onclick = (e) => {
    const gain = window.BountyGame.clickValue +
                 window.BountyGame.addClickBonus +
                 window.BountyGame.addCageBonus +
                 window.BountyGame.rebirthBonusClick;
    window.BountyGame.count += gain;
    spawnPlusOne(e.clientX, e.clientY, gain);
    updateUI();
    renderStore();
    saveGame();
  };

  // CPS automatique incluant bonus Rebirth
  setInterval(() => {
    let totalCPS = 0;
    (window.storeItemsData || []).forEach(it => {
      if(it.auto && it.owned) totalCPS += it.auto * it.owned;
    });
    totalCPS += window.BountyGame.rebirthBonusCPS; // bonus Rebirth CPS
    window.BountyGame.count += totalCPS;
    window.BountyGame.cps = totalCPS;
    updateUI();
    renderStore();
  }, 1000);

  // Charger depuis sauvegarde
  document.addEventListener("DOMContentLoaded", () => {
    const saveRaw = localStorage.getItem("bountySave");
    if(saveRaw) {
      try {
        const data = JSON.parse(saveRaw);
        window.BountyGame.rebirths = data.rebirths || window.BountyGame.rebirths;
        window.BountyGame.rebirthPrice = data.rebirthPrice || window.BountyGame.rebirthPrice;
        applyRebirthBonus();
      } catch(e){console.warn(e);}
    }
    updateRebirthUI();
  });

  // Sauvegarde Rebirth
  const originalSaveGame = window.sauvegarderJeu || (() => {});
  window.sauvegarderJeu = () => {
    originalSaveGame();
    const saveData = JSON.parse(localStorage.getItem("bountySave") || "{}");
    saveData.rebirths = window.BountyGame.rebirths;
    saveData.rebirthPrice = window.BountyGame.rebirthPrice;
    saveData.rebirthBonusClick = window.BountyGame.rebirthBonusClick;
    saveData.rebirthBonusCPS = window.BountyGame.rebirthBonusCPS;
    localStorage.setItem("bountySave", JSON.stringify(saveData));
  };
})();
