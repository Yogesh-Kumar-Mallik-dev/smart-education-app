// =======================
// Multi-Image Carousel with Dots
// =======================
let currentIndex = 0;

function updateCarousel() {
  const track = document.querySelector(".carousel-track");
  const slides = document.querySelectorAll(".gallery-item");
  const dots = document.querySelectorAll(".carousel-dots button");
  const visibleSlides = getVisibleSlides();

  if (slides.length === 0 || !track) return;

  const slideWidth = slides[0].offsetWidth + 16; // include margin
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

  // Update active dot
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

function nextSlide() {
  const slides = document.querySelectorAll(".gallery-item");
  const visibleSlides = getVisibleSlides();
  const totalSlides = slides.length;

  if (currentIndex < totalSlides - visibleSlides) {
    currentIndex++;
  } else {
    currentIndex = 0; // loop
  }
  updateCarousel();
}

function prevSlide() {
  if (currentIndex > 0) {
    currentIndex--;
  } else {
    const slides = document.querySelectorAll(".gallery-item");
    const visibleSlides = getVisibleSlides();
    currentIndex = slides.length - visibleSlides; // loop to end
  }
  updateCarousel();
}

function getVisibleSlides() {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
}

// =======================
// Setup Carousel + Dots
// =======================
document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = document.querySelector("#next-slide");
  const prevBtn = document.querySelector("#prev-slide");
  const dotsContainer = document.querySelector("#carousel-dots");
  const slides = document.querySelectorAll(".gallery-item");

  // Create dots dynamically
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.addEventListener("click", () => {
      currentIndex = i;
      updateCarousel();
    });
    dotsContainer.appendChild(dot);
  });

  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);

  window.addEventListener("resize", updateCarousel);
  updateCarousel();

  // Auto-scroll
  setInterval(() => {
    nextSlide();
  }, 5000);

  // Start counters
  startCounters();
});

// =======================
// Achievement Counters
// =======================
function startCounters() {
  const counters = document.querySelectorAll(".counter");
  counters.forEach(counter => {
    const target = +counter.getAttribute("data-target");
    let count = 0;
    const speed = target / 100;

    const updateCount = () => {
      if (count < target) {
        count += speed;
        counter.innerText = Math.floor(count);
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });
}
