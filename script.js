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
let currentSlide = 0;

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const difference = eventDate - now;

  if (difference <= 0) {
    countdownEls.days.textContent = "000";
    countdownEls.hours.textContent = "00";
    countdownEls.minutes.textContent = "00";
    countdownEls.seconds.textContent = "00";
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  countdownEls.days.textContent = String(days).padStart(3, "0");
  countdownEls.hours.textContent = pad(hours);
  countdownEls.minutes.textContent = pad(minutes);
  countdownEls.seconds.textContent = pad(seconds);
}

function createPetals(total = 18) {
  if (!petalContainer) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const colors = [
    "rgba(242, 201, 76, 0.75)",
    "rgba(182, 58, 70, 0.65)",
    "rgba(15, 15, 16, 0.35)",
  ];

  for (let index = 0; index < total; index += 1) {
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

    const scale = 0.75 + Math.random() * 0.8;
    petal.style.transform = `scale(${scale})`;
    fragment.appendChild(petal);
  }

  petalContainer.appendChild(fragment);
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

  if (activePhoto instanceof HTMLImageElement && activeFrame instanceof HTMLElement) {
    if (activePhoto.naturalWidth > 0 && activePhoto.naturalHeight > 0) {
      activeFrame.style.setProperty(
        "--frame-ratio",
        `${activePhoto.naturalWidth} / ${activePhoto.naturalHeight}`
      );
    }
  }

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

    const updateRatio = () => {
      if (photo.naturalWidth > 0 && photo.naturalHeight > 0) {
        frame.style.setProperty("--frame-ratio", `${photo.naturalWidth} / ${photo.naturalHeight}`);
      }
    };

    const markLoaded = () => {
      frame.classList.add("loaded");
      updateRatio();
    };
    const markMissing = () => frame.classList.remove("loaded");

    photo.addEventListener("load", markLoaded);
    photo.addEventListener("error", markMissing);

    if (photo.complete && photo.naturalWidth > 0) {
      markLoaded();
    }
  });
}

function startCarouselAutoplay() {
  if (!slides.length) {
    return;
  }

  window.setInterval(() => {
    setSlide(currentSlide + 1);
  }, 4800);
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

enterInvitation?.addEventListener("click", () => {
  document.body.classList.add("invitation-open");
  document.body.classList.remove("no-scroll");

  if (bgMusic instanceof HTMLAudioElement) {
    bgMusic.volume = 0.35;
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  }
});

prevSlide?.addEventListener("click", () => setSlide(currentSlide - 1));
nextSlide?.addEventListener("click", () => setSlide(currentSlide + 1));

document.body.classList.add("no-scroll");
createPetals();
createDots();
initGalleryPhotos();
revealOnScroll();
updateCountdown();
startCarouselAutoplay();
window.setInterval(updateCountdown, 1000);
