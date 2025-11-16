(() => {
  // Initialisation
  window.BountyGame = window.BountyGame || {};
  window.BountyGame.count = window.BountyGame.count || 0;
  window.BountyGame.clickValue = window.BountyGame.clickValue || 1;
  window.BountyGame.addClickBonus = window.BountyGame.addClickBonus || 0;
  window.BountyGame.addCageBonus = window.BountyGame.addCageBonus || 0;
  window.BountyGame.cps = window.BountyGame.cps || 0;
  window.BountyGame.rebirthCount = window.BountyGame.rebirthCount || 0;
  window.BountyGame.rebirthMultiplier = window.BountyGame.rebirthMultiplier || 1;

  const img = document.getElementById('image');
  const counterEl = document.getElementById('counter');
  const cpsEl = document.getElementById('cps');
  const resetButton = document.getElementById('resetButton');
  const storeItemsDiv = document.getElementById('storeItems');
  const clickSound = document.getElementById('clickSound');

  // Création du bouton Rebirth
  const rebirthContainer = document.createElement('div');
  rebirthContainer.style.position = 'absolute';
  rebirthContainer.style.left = '20px';
  rebirthContainer.style.top = '50%';
  rebirthContainer.style.transform = 'translateY(-50%)';
  rebirthContainer.style.display = 'flex';
  rebirthContainer.style.flexDirection = 'column';
  rebirthContainer.style.gap = '8px';
  document.body.appendChild(rebirthContainer);

  const rebirthButton = document.createElement('button');
  rebirthButton.className = 'btn reset';
  rebirthButton.textContent = 'Rebirth';
  rebirthButton.style.width = '120px';
  rebirthContainer.appendChild(rebirthButton);

  const rebirthLabel = document.createElement('div');
  rebirthLabel.style.color = '#fff';
  rebirthLabel.style.fontWeight = '700';
  rebirthLabel.textContent = `Rebirths : ${window.BountyGame.rebirthCount}`;
  rebirthContainer.appendChild(rebirthLabel);

  // Update UI
  function updateUI() {
    counterEl.textContent = `Croquettes : ${Math.floor(window.BountyGame.count)}`;
    cpsEl.textContent = `CPS : ${Math.floor(window.BountyGame.cps)}`;
    rebirthLabel.textContent = `Rebirths : ${window.BountyGame.rebirthCount}`;
  }

  // +1 visuel
  function spawnPlusOne(x, y, gain){
    const p = document.createElement("div");
    p.className = "plus-one";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.textContent = "+" + gain;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 900);
  }

  // Boutique
  function renderStore(){
    storeItemsDiv.innerHTML = "";
    (window.storeItemsData || []).forEach((item, idx)=>{
      const div = document.createElement("div");
      div.className = "item";

      const left = document.createElement("div");
      left.className = "left";
      const imgIcon = document.createElement("img");
      imgIcon.src = item.icon;
      imgIcon.className = "icon";
      const txt = document.createElement("div");
      txt.innerHTML = `<strong>${item.name}</strong><div style="font-size:12px;color:rgba(255,255,255,0.7)">Prix: ${Math.floor(item.price)}</div>`;
      left.appendChild(imgIcon); left.appendChild(txt);

      const right = document.createElement("div");
      const btn = document.createElement("button");
      btn.className = "btn buy";
      btn.textContent = "Acheter";
      btn.disabled = window.BountyGame.count < item.price;

      btn.addEventListener("click", ()=>{
        if(window.BountyGame.count >= item.price){
          window.BountyGame.count -= item.price;

          if(item.bonusClick){
            if(item.name === "Gamelle de croquette") window.BountyGame.addClickBonus += item.bonusClick;
            if(item.name === "Cage à croquette") window.BountyGame.addCageBonus += item.bonusClick;
          }

          item.owned++;
          item.price = Math.round(item.price * 1.4);

          updateUI();
          saveGame();
          renderStore();
        }
      });

      const tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      if(item.bonusClick) tooltip.textContent = `+${item.bonusClick} par clic !`;
      else if(item.auto) tooltip.textContent = `+${item.auto} auto-croquettes !`;
      btn.appendChild(tooltip);

      right.appendChild(btn);
      div.appendChild(left);
      div.appendChild(right);

      const badge = document.createElement("div");
      badge.className = "count-badge";
      badge.textContent = item.owned;
      div.appendChild(badge);

      storeItemsDiv.appendChild(div);
    });
  }

  // Click principal
  img.addEventListener("click", (e)=>{
    clickSound.currentTime = 0;
    clickSound.play();

    const gain = (window.BountyGame.clickValue + window.BountyGame.addClickBonus + window.BountyGame.addCageBonus) * window.BountyGame.rebirthMultiplier;
    window.BountyGame.count += gain;

    spawnPlusOne(e.clientX, e.clientY, gain);
    updateUI();
    renderStore();
    saveGame();
  });

  // CPS automatique
  setInterval(()=>{
    let totalCPS = 0;
    (window.storeItemsData || []).forEach(it=>{
      if(it.auto && it.owned) totalCPS += it.auto * it.owned;
    });
    totalCPS *= window.BountyGame.rebirthMultiplier;
    window.BountyGame.count += totalCPS;
    window.BountyGame.cps = totalCPS;
    updateUI();
    renderStore();
  }, 1000);

  // Rebirth
  rebirthButton.addEventListener('click', ()=>{
    if(!confirm("Faire un Rebirth ? Cela remet le compteur à zéro mais augmente le multiplicateur !")) return;
    window.BountyGame.count = 0;
    window.BountyGame.clickValue = 1;
    window.BountyGame.addClickBonus = 0;
    window.BountyGame.addCageBonus = 0;
    window.BountyGame.cps = 0;
    (window.storeItemsData || []).forEach(it=>{ it.owned = 0; it.price = it.basePrice ?? it.price; });

    // Incrément du Rebirth
    window.BountyGame.rebirthCount++;
    window.BountyGame.rebirthMultiplier = 1 + window.BountyGame.rebirthCount * 0.1; // chaque rebirth +10% gain

    saveGame();
    updateUI();
    renderStore();
  });

  // Sauvegarde / Load
  function saveGame(){
    const data = {
      count: window.BountyGame.count,
      clickValue: window.BountyGame.clickValue,
      addClickBonus: window.BountyGame.addClickBonus,
      addCageBonus: window.BountyGame.addCageBonus,
      cps: window.BountyGame.cps,
      rebirthCount: window.BountyGame.rebirthCount,
      rebirthMultiplier: window.BountyGame.rebirthMultiplier,
      storeItems: (window.storeItemsData || []).map(it=>({owned: it.owned, price: it.price}))
    };
    localStorage.setItem("bountySave", JSON.stringify(data));
  }

  function loadGame(){
    const raw = localStorage.getItem("bountySave");
    if(!raw) return;
    try{
      const data = JSON.parse(raw);
      window.BountyGame.count = data.count ?? window.BountyGame.count;
      window.BountyGame.clickValue = data.clickValue ?? window.BountyGame.clickValue;
      window.BountyGame.addClickBonus = data.addClickBonus ?? window.BountyGame.addClickBonus;
      window.BountyGame.addCageBonus = data.addCageBonus ?? window.BountyGame.addCageBonus;
      window.BountyGame.cps = data.cps ?? window.BountyGame.cps;
      window.BountyGame.rebirthCount = data.rebirthCount ?? window.BountyGame.rebirthCount;
      window.BountyGame.rebirthMultiplier = data.rebirthMultiplier ?? window.BountyGame.rebirthMultiplier;

      if(Array.isArray(data.storeItems) && Array.isArray(window.storeItemsData)){
        data.storeItems.forEach((s,i)=>{
          if(window.storeItemsData[i]){
            window.storeItemsData[i].owned = s.owned ?? window.storeItemsData[i].owned;
            window.storeItemsData[i].price = s.price ?? window.storeItemsData[i].price;
          }
        });
      }
    }catch(e){ console.warn("Load error", e); }
  }

  // Reset
  resetButton.addEventListener("click", ()=>{
    if(!confirm("Réinitialiser le jeu et supprimer la sauvegarde ?")) return;
    window.BountyGame.count = 0;
    window.BountyGame.clickValue = 1;
    window.BountyGame.addClickBonus = 0;
    window.BountyGame.addCageBonus = 0;
    window.BountyGame.cps = 0;
    window.BountyGame.rebirthCount = 0;
    window.BountyGame.rebirthMultiplier = 1;
    (window.storeItemsData || []).forEach(it=>{ it.owned = 0; it.price = it.basePrice ?? it.price; });
    saveGame();
    updateUI();
    renderStore();
  });

  // Shop déroulant
  document.addEventListener('DOMContentLoaded', ()=>{
    const shopPanel = document.querySelector('.shop');
    const shopHeader = shopPanel.querySelector('.panel-header');
    shopHeader.addEventListener('click', ()=>{
      shopPanel.classList.toggle('open');
    });

    loadGame();
    updateUI();
    renderStore();
  });

  // Sauvegarde périodique
  setInterval(saveGame, 60000);
})();
