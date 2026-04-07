const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const predictedClass = document.getElementById("predictedClass");
const pneumoniaBar = document.getElementById("pneumoniaBar");
const pneumoniaText = document.getElementById("pneumoniaText");
const riskBadge = document.getElementById("riskBadge");
const riskGuidance = document.getElementById("riskGuidance");
const threshold = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const simulateBtn = document.getElementById("simulateBtn");
const dropzone = document.getElementById("dropzone");
const activityFeed = document.getElementById("activityFeed");
const radarNeedle = document.getElementById("radarNeedle");
const starfield = document.getElementById("starfield");
const cursorGlow = document.getElementById("cursorGlow");
const sessionClock = document.getElementById("sessionClock");
const simulateBtnTop = document.getElementById("simulateBtnTop");
const reveals = document.querySelectorAll(".reveal");
const magneticButtons = document.querySelectorAll(".magnetic");

let uploadedFile = null;
const sessionStart = Date.now();

function addFeed(message) {
  const item = document.createElement("li");
  item.innerHTML = `<span class="dot"></span>${message}`;
  activityFeed.prepend(item);
  while (activityFeed.children.length > 8) {
    activityFeed.removeChild(activityFeed.lastChild);
  }
}

function updateRadar(probability) {
  const angle = -90 + probability * 180;
  radarNeedle.style.transform = `rotate(${angle.toFixed(1)}deg)`;
}

function formatSessionTime(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getRiskBand(probability) {
  if (probability > 0.97) {
    return {
      band: "CRITICAL",
      cls: "critical",
      guidance: "Immediate radiologist review recommended.",
    };
  }
  if (probability > 0.9) {
    return {
      band: "HIGH",
      cls: "high",
      guidance: "Urgent review required.",
    };
  }
  if (probability > 0.6) {
    return {
      band: "MODERATE",
      cls: "moderate",
      guidance: "Follow-up imaging advised.",
    };
  }
  return {
    band: "LOW",
    cls: "low",
    guidance: "Routine monitoring suggested.",
  };
}

function updatePrediction(probability) {
  const t = Number(threshold.value);
  const predicted = probability >= t ? "PNEUMONIA" : "NORMAL";
  const risk = getRiskBand(probability);
  predictedClass.textContent = predicted;
  pneumoniaBar.style.width = `${(probability * 100).toFixed(1)}%`;
  pneumoniaText.textContent = `${(probability * 100).toFixed(2)}%`;
  riskBadge.textContent = risk.band;
  riskBadge.className = `badge ${risk.cls}`;
  riskGuidance.textContent = risk.guidance;
  updateRadar(probability);
  addFeed(`Inference complete: ${predicted} (${(probability * 100).toFixed(2)}%)`);
}

function loadImage(file) {
  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.src = event.target.result;
    previewImage.classList.remove("hidden");
    addFeed(`Image loaded: ${file.name}`);
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  loadImage(file);
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.style.borderColor = "#22d3ee";
});

dropzone.addEventListener("dragleave", () => {
  dropzone.style.borderColor = "rgba(147, 197, 253, 0.55)";
});

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.style.borderColor = "rgba(147, 197, 253, 0.55)";
  const file = event.dataTransfer.files[0];
  if (!file) return;
  if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) return;
  loadImage(file);
});

threshold.addEventListener("input", () => {
  thresholdValue.textContent = Number(threshold.value).toFixed(2);
  addFeed(`Threshold updated to ${Number(threshold.value).toFixed(2)}`);
});

simulateBtn.addEventListener("click", () => {
  if (!uploadedFile) {
    riskGuidance.textContent = "Upload an X-ray image first.";
    addFeed("Inference blocked: no image uploaded.");
    return;
  }
  const probability = 0.62 + Math.random() * 0.37;
  updatePrediction(probability);
});
simulateBtnTop.addEventListener("click", () => simulateBtn.click());

function initStarfield() {
  const ctx = starfield.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.4 + 0.2,
    v: Math.random() * 0.45 + 0.05,
  }));

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    starfield.width = width;
    starfield.height = height;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(148,163,184,0.8)";
      ctx.fill();
      s.y += s.v;
      if (s.y > height + 4) {
        s.y = -4;
        s.x = Math.random() * width;
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
}

initStarfield();
addFeed("Visual system initialized.");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  },
  { threshold: 0.12 }
);
reveals.forEach((el) => observer.observe(el));

document.addEventListener("pointermove", (e) => {
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

magneticButtons.forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.2}px)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0, 0)";
  });
});

setInterval(() => {
  sessionClock.textContent = formatSessionTime(Date.now() - sessionStart);
}, 1000);
