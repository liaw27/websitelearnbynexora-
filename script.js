// Isi URL dan username dengan akun asli sebelum dipublikasikan.
const profileEmail = "";
const socialProfiles = [
  // Isi username dan URL profil asli. WhatsApp: gunakan tautan chat wa.me milikmu.
  { name: "Instagram", icon: "fa-brands fa-instagram", username: "lillya._o", url: "https://www.instagram.com/lillya._o?utm_source=qr" },
  { name: "TikTok", icon: "fa-brands fa-tiktok", username: "llia._o", url: "https://www.tiktok.com/@llia._o" },
  { name: "WhatsApp", icon: "fa-brands fa-whatsapp", username: "085817505563", url: "https://wa.me/6285817505563" },
  { name: "LinkedIn", icon: "fa-brands fa-linkedin-in", username: "aprilia dian", url: "https://www.linkedin.com/in/aprilia-dian-9270a5409?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
  { name: "GitHub", icon: "fa-brands fa-github", username: "liaw27", url: "https://github.com/liaw27" },
  { name: "Surel", icon: "fa-regular fa-envelope", username: "apriliadiana2708@gmail.com", url: "mailto:apriliadiana2708@gmail.com" }
];
const emailProfile = socialProfiles.find((profile) => profile.name === "Surel");
if (profileEmail.trim() && emailProfile) {
  emailProfile.username = profileEmail;
  emailProfile.url = `mailto:${profileEmail}`;
}

const header = document.querySelector("#site-header");
const navLinks = document.querySelector("#nav-links");
const menuToggle = document.querySelector(".menu-toggle");
const soundToggle = document.querySelector("#sound-toggle");
const toast = document.querySelector("#toast");
const loadingScreen = document.querySelector("#loading-screen");
const heroArt = document.querySelector(".hero-art");
const customCursor = document.querySelector("#custom-cursor");
const customCursorRing = document.querySelector("#custom-cursor-ring");
const cursorTrail = document.querySelector("#cursor-trail");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let toastTimer;
let loadingTimer;

function finishLoading() {
  if (loadingScreen.classList.contains("is-hidden")) return;
  loadingScreen.classList.add("is-hidden");
  window.clearTimeout(loadingTimer);
}

if (prefersReducedMotion.matches) {
  finishLoading();
} else {
  loadingTimer = window.setTimeout(finishLoading, 1250);
  window.addEventListener("load", () => window.setTimeout(finishLoading, 280), { once: true });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3600);
}

const soundPreferenceKey = "aprilia-portfolio-sound";
const soundProfiles = {
  hover: { from: 730, to: 540, duration: .055, volume: .012, wave: "sine" },
  icon: { from: 900, to: 680, duration: .06, volume: .013, wave: "sine" },
  click: { from: 520, to: 390, duration: .07, volume: .025, wave: "triangle" },
  nav: { from: 360, to: 560, duration: .105, volume: .024, wave: "sine" },
  menuOpen: { from: 300, to: 510, duration: .12, volume: .026, wave: "sine" },
  menuClose: { from: 540, to: 270, duration: .11, volume: .022, wave: "sine" },
  cta: { from: 430, to: 760, duration: .12, volume: .03, wave: "triangle" },
  soundOn: { from: 440, to: 820, duration: .16, volume: .028, wave: "sine" },
  soundOff: { from: 620, to: 280, duration: .13, volume: .022, wave: "sine" }
};
let soundContext = null;
let soundMasterGain = null;
let soundEnabled = false;
let activeSoundVoices = 0;
let pendingSound = null;
let lastHoverSoundAt = 0;
try {
  soundEnabled = localStorage.getItem(soundPreferenceKey) === "on";
} catch (error) {
  console.warn("Preferensi suara tidak dapat dibaca.", error);
}

function updateSoundControl() {
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Matikan suara interaksi" : "Nyalakan suara interaksi");
  soundToggle.title = soundEnabled ? "SUARA AKTIF" : "SUARA NONAKTIF";
  soundToggle.classList.toggle("sound-active", soundEnabled);
  soundToggle.innerHTML = `<i class="fa-solid ${soundEnabled ? "fa-volume-high" : "fa-volume-xmark"}" aria-hidden="true"></i>`;
}

function saveSoundPreference() {
  try {
    localStorage.setItem(soundPreferenceKey, soundEnabled ? "on" : "off");
  } catch (error) {
    console.warn("Preferensi suara tidak dapat disimpan.", error);
  }
}

function createAudioContext() {
  if (soundContext) return true;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return false;
  try {
    soundContext = new AudioContextConstructor();
    soundMasterGain = soundContext.createGain();
    soundMasterGain.gain.value = .65;
    soundMasterGain.connect(soundContext.destination);
    return true;
  } catch (error) {
    soundContext = null;
    soundMasterGain = null;
    console.error("Efek suara tidak dapat disiapkan.", error);
    return false;
  }
}

function disableSound(error) {
  console.error("Efek suara tidak dapat diaktifkan.", error);
  soundEnabled = false;
  saveSoundPreference();
  updateSoundControl();
  showToast("Suara interaksi tidak dapat diaktifkan di peramban ini.");
}

function playSound(type) {
  const profile = soundProfiles[type];
  if (!profile || !soundEnabled || document.hidden) return;
  if (!createAudioContext()) {
    showToast("Peramban ini belum mendukung efek suara.");
    return;
  }
  if (soundContext.state !== "running") {
    pendingSound = type;
    return;
  }
  if (activeSoundVoices >= 2) return;
  const isHover = type === "hover" || type === "icon";
  const nowMs = performance.now();
  if (isHover && nowMs - lastHoverSoundAt < 100) return;
  if (isHover) lastHoverSoundAt = nowMs;

  const oscillator = soundContext.createOscillator();
  const envelope = soundContext.createGain();
  const now = soundContext.currentTime;
  oscillator.type = profile.wave;
  oscillator.frequency.setValueAtTime(profile.from, now);
  oscillator.frequency.exponentialRampToValueAtTime(profile.to, now + profile.duration);
  envelope.gain.setValueAtTime(.0001, now);
  envelope.gain.exponentialRampToValueAtTime(profile.volume, now + .012);
  envelope.gain.exponentialRampToValueAtTime(.0001, now + profile.duration);
  oscillator.connect(envelope);
  envelope.connect(soundMasterGain);
  activeSoundVoices += 1;
  oscillator.addEventListener("ended", () => {
    activeSoundVoices = Math.max(0, activeSoundVoices - 1);
    oscillator.disconnect();
    envelope.disconnect();
  }, { once: true });
  oscillator.start(now);
  oscillator.stop(now + profile.duration);
}

function unlockSavedSound() {
  if (!soundEnabled || document.hidden || !createAudioContext() || soundContext.state === "running") return;
  soundContext.resume().then(() => {
    const nextSound = pendingSound;
    pendingSound = null;
    if (soundEnabled && nextSound) playSound(nextSound);
  }).catch(disableSound);
}

updateSoundControl();
window.addEventListener("pointerdown", unlockSavedSound, { capture: true, passive: true });
window.addEventListener("keydown", unlockSavedSound, { capture: true });
soundToggle.addEventListener("click", () => {
  if (soundEnabled) {
    playSound("soundOff");
    soundEnabled = false;
    saveSoundPreference();
    updateSoundControl();
    return;
  }
  if (!createAudioContext()) {
    showToast("Peramban ini belum mendukung efek suara.");
    return;
  }
  soundEnabled = true;
  saveSoundPreference();
  updateSoundControl();
  const ready = soundContext.state === "running" ? Promise.resolve() : soundContext.resume();
  ready.then(() => {
    if (soundEnabled) playSound("soundOn");
  }).catch(disableSound);
});

document.addEventListener("pointerover", (event) => {
  if (event.pointerType === "touch" || !(event.target instanceof Element)) return;
  const target = event.target.closest(".hero-name-word, .social-card, .skill-card, a, button");
  if (!target || target.contains(event.relatedTarget) || target === soundToggle) return;
  if (target.matches(".social-card, .skill-card")) playSound("icon");
  else playSound("hover");
}, { passive: true });

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest(".hero-name-word, a, button");
  if (!target || target === soundToggle) return;
  if (target === menuToggle) {
    playSound(menuToggle.getAttribute("aria-expanded") === "true" ? "menuOpen" : "menuClose");
  } else if (target.matches(".nav-links a")) {
    playSound("nav");
  } else if (target.matches(".social-card")) {
    playSound("icon");
  } else if (target.matches(".button, .text-link")) {
    playSound("cta");
  } else {
    playSound("click");
  }
});

document.addEventListener("pointerdown", (event) => {
  if (prefersReducedMotion.matches || event.button !== 0 || !(event.target instanceof Element)) return;
  const target = event.target.closest(".button, .text-link, .social-card, .back-top, .menu-toggle, .nav-sound-control");
  if (!target) return;
  const bounds = target.getBoundingClientRect();
  const size = Math.max(36, Math.min(Math.max(bounds.width, bounds.height) * 1.25, 180));
  const ripple = document.createElement("span");
  ripple.className = "interaction-ripple";
  ripple.setAttribute("aria-hidden", "true");
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - bounds.left}px`;
  ripple.style.top = `${event.clientY - bounds.top}px`;
  target.append(ripple);
  window.setTimeout(() => ripple.remove(), 650);
});

function closeMenu() {
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Buka menu navigasi");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Buka menu navigasi" : "Tutup menu navigasi");
  navLinks.classList.toggle("open", !isOpen);
});
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (finePointer && !prefersReducedMotion.matches) {
  document.documentElement.classList.add("has-custom-cursor");
  const trailDots = [];
  for (let index = 0; index < 4; index += 1) {
    const dot = document.createElement("span");
    dot.className = "cursor-trail-dot";
    dot.style.opacity = String(.34 - index * .06);
    cursorTrail.append(dot);
    trailDots.push({ element: dot, x: 0, y: 0 });
  }
  let pointerX = 0;
  let pointerY = 0;
  let ringX = 0;
  let ringY = 0;
  let cursorFrame = 0;
  let cursorStarted = false;

  function animateCursor() {
    ringX += (pointerX - ringX) * .22;
    ringY += (pointerY - ringY) * .22;
    customCursorRing.style.left = `${ringX}px`;
    customCursorRing.style.top = `${ringY}px`;
    let previousX = pointerX;
    let previousY = pointerY;
    let needsFrame = Math.hypot(pointerX - ringX, pointerY - ringY) > .3;
    trailDots.forEach((dot, index) => {
      const follow = .36 - index * .055;
      dot.x += (previousX - dot.x) * follow;
      dot.y += (previousY - dot.y) * follow;
      dot.element.style.left = `${dot.x}px`;
      dot.element.style.top = `${dot.y}px`;
      needsFrame = needsFrame || Math.hypot(previousX - dot.x, previousY - dot.y) > .5;
      previousX = dot.x;
      previousY = dot.y;
    });
    cursorFrame = needsFrame ? window.requestAnimationFrame(animateCursor) : 0;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    customCursor.style.left = `${pointerX}px`;
    customCursor.style.top = `${pointerY}px`;
    customCursor.classList.add("is-visible");
    customCursorRing.classList.add("is-visible");
    cursorTrail.classList.add("is-visible");
    const target = event.target instanceof Element ? event.target.closest("a, button") : null;
    customCursorRing.classList.toggle("is-active", Boolean(target));
    if (!cursorStarted) {
      cursorStarted = true;
      ringX = pointerX;
      ringY = pointerY;
      trailDots.forEach((dot) => {
        dot.x = pointerX;
        dot.y = pointerY;
      });
    }
    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(animateCursor);
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    customCursor.classList.remove("is-visible");
    customCursorRing.classList.remove("is-visible", "is-active");
    cursorTrail.classList.remove("is-visible");
  });
}

let scrollFrame = 0;
function updateScrollMotion() {
  scrollFrame = 0;
  header.classList.toggle("scrolled", window.scrollY > 24);
  if (prefersReducedMotion.matches) {
    heroArt.style.removeProperty("--parallax-y");
    return;
  }
  const parallaxOffset = Math.min(window.scrollY, 500) * .035;
  heroArt.style.setProperty("--parallax-y", `${parallaxOffset}px`);
}
window.addEventListener("scroll", () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollMotion);
}, { passive: true });
updateScrollMotion();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => {
  element.style.setProperty("--reveal-delay", `${Number(element.dataset.delay || 0)}ms`);
  revealObserver.observe(element);
});

const socialGrid = document.querySelector("#social-grid");
socialProfiles.forEach((profile) => {
  const configured = /^(https:\/\/|mailto:)/i.test(profile.url.trim());
  const card = document.createElement(configured ? "a" : "button");
  card.className = `social-card reveal${configured ? " is-configured" : ""}`;
  if (configured) {
    card.href = profile.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Buka ${profile.name} Aprilia Dian`);
  } else {
    card.type = "button";
    card.setAttribute("aria-label", `Atur tautan ${profile.name}`);
    card.addEventListener("click", () => showToast(`Tautan akun ${profile.name} belum diatur.`));
  }
  const identity = profile.username.trim() || "lillya._o";
  const icon = document.createElement("span");
  icon.className = "social-icon";
  icon.setAttribute("aria-hidden", "true");
  const iconGlyph = document.createElement("i");
  iconGlyph.className = profile.icon;
  icon.append(iconGlyph);
  const copy = document.createElement("span");
  copy.className = "social-copy";
  const title = document.createElement("strong");
  title.textContent = profile.name;
  const username = document.createElement("small");
  username.textContent = identity;
  copy.append(title, username);
  const arrow = document.createElement("span");
  arrow.className = "social-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  card.append(icon, copy, arrow);
  socialGrid.append(card);
  revealObserver.observe(card);
});

if (profileEmail.trim()) {
  document.querySelector("#contact-email-display").textContent = profileEmail;
}

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!profileEmail.trim()) {
    showToast("Pesan akan terkirim.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Pesan portofolio dari ${formData.get("name")}`);
  const body = encodeURIComponent(`Nama: ${formData.get("name")}\nSurel: ${formData.get("email")}\n\n${formData.get("message")}`);
  window.location.href = `mailto:${profileEmail}?subject=${subject}&body=${body}`;
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll(".nav-links a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
