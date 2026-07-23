const enterInvitation = document.getElementById("enterInvitation");
const revealElements = document.querySelectorAll(".reveal");
const petalContainer = document.querySelector(".petals");
const bgMusic = document.getElementById("bgMusic");
const eventDate = new Date("2026-09-19T18:00:00-06:00").getTime();

const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const carouselTrack = document.getElementById("carouselTrack");
const slides = carouselTrack ? Array.from(carouselTrack.children) : [];
const dotsContainer = document.getElementById("carouselDots");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const passModal = document.getElementById("passModal");
const showPassButton = document.getElementById("showPassButton");
const closePassModal = document.getElementById("closePassModal");

const AUTOPLAY_INTERVAL_MS = 4800;
const COUNTDOWN_INTERVAL_MS = 1000;
const DEFAULT_PETAL_COUNT = 18;
const REVEAL_THRESHOLD = 0.16;

let currentSlide = 0;

const padNumber = (value, length = 2) => String(value).padStart(length, "0");

const countdownValues = (milliseconds) => {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const seconds = Math.floor((milliseconds / 1000) % 60);

  return { days, hours, minutes, seconds };
};

const updateCountdownText = ({ days, hours, minutes, seconds }) => {
  countdownEls.days.textContent = padNumber(days, 3);
  countdownEls.hours.textContent = padNumber(hours);
  countdownEls.minutes.textContent = padNumber(minutes);
  countdownEls.seconds.textContent = padNumber(seconds);
};

const setCountdownExpired = () => {
  countdownEls.days.textContent = "000";
  countdownEls.hours.textContent = "00";
  countdownEls.minutes.textContent = "00";
  countdownEls.seconds.textContent = "00";
};

function updateCountdown() {
  const remainingTime = eventDate - Date.now();

  if (remainingTime <= 0) {
    setCountdownExpired();
    return;
  }

  updateCountdownText(countdownValues(remainingTime));
}

function createPetal() {
  const colors = [
    "rgba(242, 201, 76, 0.75)",
    "rgba(182, 58, 70, 0.65)",
    "rgba(15, 15, 16, 0.35)",
  ];

  const petal = document.createElement("span");
  petal.className = "petal";
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${12 + Math.random() * 12}s`;
  petal.style.animationDelay = `${Math.random() * -15}s`;
  petal.style.setProperty("--drift", `${-60 + Math.random() * 120}px`);
  petal.style.opacity = `${0.18 + Math.random() * 0.5}`;

  const size = 6 + Math.random() * 14;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  petal.style.background = colors[Math.floor(Math.random() * colors.length)];
  petal.style.transform = `scale(${0.75 + Math.random() * 0.8})`;

  return petal;
}

function createPetals(total = DEFAULT_PETAL_COUNT) {
  if (!petalContainer) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < total; i += 1) {
    fragment.appendChild(createPetal());
  }

  petalContainer.appendChild(fragment);
}

function updateFrameRatio(photo, frame) {
  if (!(photo instanceof HTMLImageElement) || !(frame instanceof HTMLElement)) {
    return;
  }

  if (photo.naturalWidth > 0 && photo.naturalHeight > 0) {
    frame.style.setProperty("--frame-ratio", `${photo.naturalWidth} / ${photo.naturalHeight}`);
  }
}

function setSlide(index) {
  if (!slides.length) {
    return;
  }

  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === currentSlide);
  });

  const activeSlide = slides[currentSlide];
  const activePhoto = activeSlide?.querySelector(".gallery-photo");
  const activeFrame = activeSlide?.querySelector(".gallery-frame");

  updateFrameRatio(activePhoto, activeFrame);

  if (!dotsContainer) {
    return;
  }

  Array.from(dotsContainer.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentSlide);
    dot.setAttribute("aria-pressed", String(dotIndex === currentSlide));
  });
}

function createDots() {
  if (!dotsContainer || !slides.length) {
    return;
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir a foto ${index + 1}`);
    dot.addEventListener("click", () => setSlide(index));
    dotsContainer.appendChild(dot);
  });

  setSlide(0);
}

function initGalleryPhotos() {
  const galleryPhotos = document.querySelectorAll(".gallery-photo");

  galleryPhotos.forEach((photo) => {
    const frame = photo.closest(".gallery-frame");
    if (!frame) {
      return;
    }

    const markLoaded = () => {
      frame.classList.add("loaded");
      updateFrameRatio(photo, frame);
    };

    const markMissing = () => frame.classList.remove("loaded");

    photo.addEventListener("load", markLoaded);
    photo.addEventListener("error", markMissing);

    if (photo.complete) {
      if (photo.naturalWidth > 0) {
        markLoaded();
      } else {
        markMissing();
      }
    }
  });
}

function startCarouselAutoplay() {
  if (!slides.length) {
    return;
  }

  window.setInterval(() => {
    setSlide(currentSlide + 1);
  }, AUTOPLAY_INTERVAL_MS);
}

function togglePassModal(open) {
  if (!passModal) {
    return;
  }

  passModal.classList.toggle("active", open);
  passModal.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
}

function addPassModalEvents() {
  showPassButton?.addEventListener("click", () => togglePassModal(true));
  closePassModal?.addEventListener("click", () => togglePassModal(false));

  passModal?.addEventListener("click", (event) => {
    if (event.target === passModal) {
      togglePassModal(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && passModal?.classList.contains("active")) {
      togglePassModal(false);
    }
  });
}

function revealOnScroll() {
  if (!revealElements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: REVEAL_THRESHOLD }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function playBackgroundMusic() {
  if (!(bgMusic instanceof HTMLMediaElement)) {
    return;
  }

  bgMusic.volume = 0.35;
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
}

function openInvitation() {
  document.body.classList.add("invitation-open");
  document.body.classList.remove("no-scroll");
  playBackgroundMusic();
}

const SWIPE_THRESHOLD_PX = 45;
let swipeStartX = null;
let isSwiping = false;

function handleCarouselPointerDown(event) {
  if (!carouselTrack || event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  swipeStartX = event.clientX;
  isSwiping = true;
  carouselTrack.setPointerCapture(event.pointerId);
}

function handleCarouselPointerMove(event) {
  if (!isSwiping || swipeStartX === null) {
    return;
  }

  const distance = event.clientX - swipeStartX;
  if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
    if (distance > 0) {
      setSlide(currentSlide - 1);
    } else {
      setSlide(currentSlide + 1);
    }
    isSwiping = false;
    swipeStartX = null;
  }
}

function handleCarouselPointerUp() {
  isSwiping = false;
  swipeStartX = null;
}

function addCarouselSwipe() {
  if (!carouselTrack || !slides.length) {
    return;
  }

  carouselTrack.addEventListener("pointerdown", handleCarouselPointerDown, { passive: true });
  carouselTrack.addEventListener("pointermove", handleCarouselPointerMove, { passive: true });
  carouselTrack.addEventListener("pointerup", handleCarouselPointerUp);
  carouselTrack.addEventListener("pointercancel", handleCarouselPointerUp);
}

function initCarouselControls() {
  prevSlide?.addEventListener("click", () => setSlide(currentSlide - 1));
  nextSlide?.addEventListener("click", () => setSlide(currentSlide + 1));
}

function init() {
  document.body.classList.add("no-scroll");
  enterInvitation?.addEventListener("click", openInvitation);
  initCarouselControls();
  addCarouselSwipe();
  addPassModalEvents();
  createPetals();
  createDots();
  initGalleryPhotos();
  revealOnScroll();
  updateCountdown();
  startCarouselAutoplay();
  window.setInterval(updateCountdown, COUNTDOWN_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);
