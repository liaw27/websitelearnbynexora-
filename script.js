// Isi URL dan username dengan akun asli sebelum dipublikasikan.
const profileEmail = "";
const socialProfiles = [
  // Isi username dan URL profil asli. WhatsApp: gunakan tautan chat wa.me milikmu.
  { name: "Instagram", icon: "fa-brands fa-instagram", username: "lillya._o", url: "https://www.instagram.com/lillya._o?utm_source=qr" },
  { name: "TikTok", icon: "fa-brands fa-tiktok", username: "llia._o", url: "https://www.tiktok.com/@llia._o" },
  { name: "WhatsApp", icon: "fa-brands fa-whatsapp", username: "085817505563", url: "https://wa.me/6285817505563" },
  { name: "Facebook", icon: "fa-brands fa-facebook-f", username: "lillya.dian", url: "" },
  { name: "LinkedIn", icon: "fa-brands fa-linkedin-in", username: "aprilia dian", url: "https://www.linkedin.com/in/aprilia-dian-9270a5409?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
  { name: "GitHub", icon: "fa-brands fa-github", username: "liaw27", url: "https://github.com/liaw27" },
  { name: "Email", icon: "fa-regular fa-envelope", username: "apriliadiana2708@gmail.com", url: "mailto:apriliadiana2708@gmail.com" }
];
const emailProfile = socialProfiles.find((profile) => profile.name === "Email");
if (profileEmail.trim() && emailProfile) {
  emailProfile.username = profileEmail;
  emailProfile.url = `mailto:${profileEmail}`;
}

const header = document.querySelector("#site-header");
const navLinks = document.querySelector("#nav-links");
const menuToggle = document.querySelector(".menu-toggle");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3600);
}

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
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

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
    card.addEventListener("click", () => showToast(`Tambahkan username dan URL akun ${profile.name} di bagian socialProfiles pada script.js.`));
  }
  const identity = profile.username.trim() || "Tambahkan username";
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

const dialog = document.querySelector("#work-dialog");
const dialogImage = dialog.querySelector(".dialog-image");
document.querySelectorAll(".work-card").forEach((card) => {
  card.addEventListener("click", () => {
    dialogImage.src = card.dataset.image;
    dialogImage.alt = `Preview ${card.dataset.title} — ${card.dataset.category}`;
    dialog.querySelector(".dialog-category").textContent = card.dataset.category;
    dialog.querySelector(".dialog-title").textContent = card.dataset.title;
    dialog.querySelector(".dialog-description").textContent = card.dataset.description;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
function closeDialog() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}
dialog.querySelector(".dialog-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!profileEmail.trim()) {
    showToast("Pesan akan terkirim.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Pesan portfolio dari ${formData.get("name")}`);
  const body = encodeURIComponent(`Nama: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`);
  window.location.href = `mailto:${profileEmail}?subject=${subject}&body=${body}`;
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll(".nav-links a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
