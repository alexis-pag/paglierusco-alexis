// === Particules ===
const particlesContainer = document.querySelector('.particles');
for(let i=0;i<25;i++){
  const p=document.createElement('div');
  p.classList.add('particle');
  p.style.left=Math.random()*100+'%';
  p.style.animationDelay=(Math.random()*10)+'s';
  p.style.opacity=Math.random();
  p.style.width=p.style.height=Math.random()*8+'px';
  particlesContainer.appendChild(p);
}

// === Variables de jeu ===
const images=['image/bounty.jpg','image/bounty2.jpg','image/bounty3.jpg','image/bounty4.jpg','image/bounty5.jpg','image/bounty6.jpg','image/bounty7.jpg','image/bounty8.jpg','image/bountygraille.jpg'];
const imgEl = document.getElementById('image');
const sound = document.getElementById('clickSound');
const counterEl = document.getElementById('counter');
const cpsEl = document.getElementById('cps');

let lastIndex=-1, count=0, multiplier=1, lastClickTime=0, cps=0;

function pickRandomIndex(){let idx; do{idx=Math.floor(Math.random()*images.length);}while(idx===lastIndex); return idx;}
function changerImage(){const idx=pickRandomIndex(); imgEl.src=images[idx]; lastIndex=idx;}
function jouerSon(){sound.currentTime=0; sound.volume=1.0; sound.play().catch(()=>{});}
function afficherPlusUn(event){
  const plusOne=document.createElement('div'); plusOne.className='plus-one';
  let bonus=multiplier;
  const rect=imgEl.getBoundingClientRect();
  const x=event.clientX-rect.left; const y=event.clientY-rect.top;
  plusOne.textContent=`+${Math.floor(bonus)}`;
  plusOne.style.left=`${x-10}px`; plusOne.style.top=`${y-20}px`;
  imgEl.parentElement.appendChild(plusOne); setTimeout(()=>plusOne.remove(),1000);
}

function clicBounty(event){
  const now=Date.now(); if(now-lastClickTime<300) return; lastClickTime=now;
  let bonus=multiplier;
  if(window.boostsData?.[0]?.active) bonus*=1.5;
  if(window.boostsData?.[2]?.active){ if(Math.random()<0.5) bonus=0; else bonus*=2; }
  count+=bonus; updateCounter(); changerImage(); jouerSon(); afficherPlusUn(event); updateStore(); sauvegarderJeu();
}

function updateCounter(){
  counterEl.textContent=`Croquettes : ${Math.floor(count)} (x${multiplier})`;
  cps = calculCPS();
  cpsEl.textContent=`CPS : ${Math.floor(cps)}`;
}

function calculCPS(){
  let total=0;
  window.storeItemsData.forEach(item=>{
    if(item.auto>0 && item.owned>0){
      let gain=item.auto*item.owned;
      if(window.boostsData?.[1]?.active) gain*=2;
      if(window.boostsData?.[4]?.active) gain*=1.05;
      total+=gain;
    }
  });
  return total;
}

function resetJeu(){
  count=0; multiplier=1; lastClickTime=0; cps=0;
  window.storeItemsData.forEach(item=>{item.owned=0; item.price=item.basePrice;});
  window.boostsData.forEach(b=>b.active=false);
  localStorage.removeItem('bountySave'); 
  updateCounter(); updateStore(); afficherBoosts();
}

// Intervalle CPS automatique
setInterval(()=>{
  window.storeItemsData.forEach(item=>{
    if(item.auto>0 && item.owned){
      let gain=item.auto*item.owned;
      if(window.boostsData?.[1]?.active) gain*=2;
      if(window.boostsData?.[4]?.active) gain*=1.05;
      count+=gain;
    }
  });
  updateCounter();
  updateStore();
},1000);

setInterval(sauvegarderJeu,60000);

// Initialisation
changerImage();
chargerJeu();
updateCounter();
