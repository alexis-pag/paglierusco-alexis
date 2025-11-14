let score = 0;
let cps = 0;

const scoreDisplay = document.getElementById("scoreDisplay");
const clickImage = document.getElementById("clickImage");

// CLICK
clickImage.addEventListener("click", (e) => {
    score++;
    scoreDisplay.textContent = score;
    spawnPlusOne(e.clientX, e.clientY);
});

// +1 animé
function spawnPlusOne(x, y) {
    const p = document.createElement("div");
    p.className = "plusOne";
    p.innerText = "+1";
    document.body.appendChild(p);

    p.style.left = x + "px";
    p.style.top = y + "px";

    setTimeout(() => p.remove(), 900);
}

// CPS ADDITION
setInterval(() => {
    score += cps;
    scoreDisplay.textContent = score;
}, 1000);

// RESET
document.getElementById("resetBtn").onclick = () => {
    score = 0;
    cps = 0;

    localStorage.removeItem("score");
    localStorage.removeItem("cps");

    scoreDisplay.textContent = 0;
};

// LOAD
(function load() {
    score = Number(localStorage.getItem("score")) || 0;
    cps = Number(localStorage.getItem("cps")) || 0;
    scoreDisplay.textContent = score;
})();
