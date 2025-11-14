/* shop.js
   - defines storeItemsData and exposes updateStore / acheterItem / charger/sauvegarder helpers
*/
(() => {
  window.storeItemsData = [
    {name:"Gamelle de croquette", price:10, mult:1, auto:0, owned:0, icon:'image/gamelle.png'},
    {name:"Cage à croquette",       price:25, mult:0, auto:0, owned:0, icon:'image/cage.png'},
    {name:"Paquet de croquette",    price:50, mult:0, auto:1, owned:0, icon:'image/paquet.png'},
    {name:"Magasin de croquettes",  price:200, mult:0, auto:5, owned:0, icon:'image/magasin.png'},
    {name:"Supermarcher",           price:500, mult:0, auto:10, owned:0, icon:'image/supermarche.png'},
    {name:"Hypermarcher",           price:1000, mult:0, auto:20, owned:0, icon:'image/hypermarcher.png'},
    {name:"Entrepot",               price:5000, mult:0, auto:50, owned:0, icon:'image/entrepot.png'},
    {name:"Usine",                  price:10000, mult:0, auto:100, owned:0, icon:'image/usine.png'},
    {name:"Temple",                 price:50000, mult:0, auto:300, owned:0, icon:'image/temple.png'},
    {name:"Dimension",              price:50000, mult:0, auto:500, owned:0, icon:'image/dimension.png'},
    {name:"Univers",                price:100000, mult:0, auto:1000, owned:0, icon:'image/univers.png'},
    {name:"Galaxy",                 price:500000, mult:0, auto:5000, owned:0, icon:'image/galaxy.png'}
  ];

  // keep basePrice to restore on reset/load
  window.storeItemsData.forEach(it => { if(it.basePrice === undefined) it.basePrice = it.price; });

  const storeDiv = document.getElementById('storeItems');

  function renderItem(item, idx){
    const root = document.createElement('div');
    root.className = 'item';

    const left = document.createElement('div'); left.className = 'building-info';
    const img = document.createElement('img'); img.className = 'building-icon'; img.src = item.icon;
    const txt = document.createElement('div'); txt.innerHTML = `<strong>${item.name}</strong><div style="font-size:12px;color:#345;">Prix: ${Math.floor(item.price)}</div>`;
    left.appendChild(img); left.appendChild(txt);

    const right = document.createElement('div');
    const btn = document.createElement('button'); btn.className = 'buy-btn'; btn.textContent = 'Acheter';
    btn.disabled = !(window.BountyGame && (window.BountyGame.count >= item.price));
    btn.addEventListener('click', ()=> acheterItem(idx));
    right.appendChild(btn);

    const countP = document.createElement('div'); countP.className = 'building-count'; countP.textContent = item.owned;
    root.appendChild(left); root.appendChild(right); root.appendChild(countP);

    // tooltip on name
    root.title = `Auto: ${item.auto} CPS • Mult: ${item.mult} par clic`;

    return root;
  }

  function updateStore(){
    storeDiv.innerHTML = '';
    window.storeItemsData.forEach((item, idx)=>{
      const node = renderItem(item, idx);
      storeDiv.appendChild(node);
    });
  }

  function acheterItem(idx){
    const item = window.storeItemsData[idx];
    if(!item) return;
    if(window.BountyGame.count >= item.price){
      window.BountyGame.count -= item.price;
      if(item.mult > 0) window.BountyGame.multiplier += item.mult;
      item.owned += 1;
      item.price = Math.round(item.price * 1.15);
      // flash
      const itemDiv = storeDiv.children[idx];
      const flash = document.createElement('div'); flash.className = 'flash';
      flash.style.left = (itemDiv.offsetWidth/2 - 15) + 'px';
      flash.style.top  = (itemDiv.offsetHeight/2 - 15) + 'px';
      itemDiv.appendChild(flash);
      setTimeout(()=>flash.remove(), 420);

      // update UI & save
      updateStore();
      if(window.updateCounterUI) window.updateCounterUI();
      if(window.sauvegarderJeu) window.sauvegarderJeu();
    }
  }

  // expose
  window.updateStore = updateStore;
  window.acheterItem = acheterItem;

  // init
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(()=> updateStore(), 60);
  });
})();
