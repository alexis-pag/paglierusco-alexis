(() => {
  window.storeItemsData = [
   
const items = [];

let basePrice = 15;       // prix initial
let baseAuto = 0;         // production auto initiale
let baseClick = 1;        // bonus clic initial

for (let i = 1; i <= 100; i++) {
    // nom généré automatiquement selon le palier
    let name = "";
    if (i <= 10) name = `Petit item ${i}`;
    else if (i <= 20) name = `Moyen item ${i}`;
    else if (i <= 40) name = `Grand item ${i}`;
    else if (i <= 60) name = `Usine ${i}`;
    else if (i <= 80) name = `Station ${i}`;
    else if (i <= 95) name = `Complexe ${i}`;
    else name = `Divinité lapin ${i}`;

    // scaling exponentiel
    const price = Math.floor(basePrice * Math.pow(1.15, i));
    const auto = Math.floor(baseAuto + Math.pow(1.5, i / 5));
    const bonusClick = i <= 5 ? i : 0; // premiers items donnent bonus clic
    const icon = `script/image/item${i}.png`;

    items.push({
        name,
        price,
        auto,
        bonusClick,
        owned: 0,
        icon
    });
}

console.log(items);




  window.storeItemsData.forEach(it => { if (it.basePrice === undefined) it.basePrice = it.price; });

  const storeDiv = document.getElementById('storeItems');

  function renderItem(item, idx) {
    const root = document.createElement('div');
    root.className = 'item';

    const left = document.createElement('div'); left.className = 'left';
    const img = document.createElement('img'); img.className = 'icon'; img.src = item.icon;
    const txt = document.createElement('div');
    txt.innerHTML = `<strong>${item.name}</strong><div style="font-size:12px;color:rgba(255,255,255,0.7)">Prix: ${item.price}</div>`;
    left.appendChild(img); left.appendChild(txt);

    const right = document.createElement('div');
    const btn = document.createElement('button'); btn.className = 'btn buy'; btn.textContent = 'Acheter';
    btn.disabled = !(window.BountyGame && window.BountyGame.count >= item.price);
    btn.addEventListener('click', (e) => { e.stopPropagation(); acheterItem(idx); });

    const tooltip = document.createElement('span'); tooltip.className = 'tooltip';
    if (item.bonusClick) tooltip.textContent = `+${item.bonusClick} par clic !`;
    else if (item.auto) tooltip.textContent = `+${item.auto} auto-croquettes !`;
    btn.appendChild(tooltip);

    right.appendChild(btn);
    const badge = document.createElement('div'); badge.className = 'count-badge'; badge.textContent = item.owned;

    root.appendChild(left); root.appendChild(right); root.appendChild(badge);
    return root;
  }

  function updateStore() {
    storeDiv.innerHTML = '';
    window.storeItemsData.forEach((item, idx) => {
      const node = renderItem(item, idx);
      storeDiv.appendChild(node);
    });
  }

  function acheterItem(idx) {
    const item = window.storeItemsData[idx];
    if (!item) return;
    if (window.BountyGame.count >= item.price) {
      window.BountyGame.count -= item.price;
      if (item.bonusClick) window.BountyGame.multiplier += item.bonusClick;
      item.owned += 1;
      item.price = Math.ceil(item.price * 1.4 / 5) * 5; // arrondi à 5 ou 10

      const node = storeDiv.children[idx];
      const flash = document.createElement('div'); flash.className = 'boost-appear';
      flash.style.position = 'absolute'; flash.style.inset = '0';
      node.appendChild(flash); setTimeout(() => flash.remove(), 420);

      if (window.updateCounterUI) window.updateCounterUI();
      if (window.sauvegarderJeu) window.sauvegarderJeu();
      updateStore();
    } else {
      const old = document.body.style.filter;
      document.body.style.filter = 'brightness(.85)';
      setTimeout(() => document.body.style.filter = old, 220);
    }
  }

  window.updateStore = updateStore;
  window.acheterItem = acheterItem;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => updateStore(), 40);
  });
})();
