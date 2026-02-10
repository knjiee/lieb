const memories = [
  { image: "images/image1.jpg", caption: "hacker vs nahack" },
  { image: "images/image2.jpg", caption: "congrats, di naman manalo" },
  { image: "images/image3.jpg", caption: "serious mode" },
  { image: "images/image4.jpg", caption: "kunwari di nagalit after nyan" },
  { image: "images/image5.jpg", caption: "bday" },
  { image: "images/image6.jpg", caption: "otw para makopya" },
  { image: "images/image7.jpg", caption: "tawang rinig sa mmg" },
  { image: "images/image8.jpg", caption: "ay dito pala yun" },
  { image: "images/image9.jpg", caption: "ai" },
  { image: "images/image10.jpg", caption: "laki mo" },
  { image: "images/image11.jpg", caption: "congrats" },
  { image: "images/image12.jpg", caption: "congrats ulit" },
  { image: "images/image13.jpg", caption: "congrats ulit but sideways" },
  { image: "images/image14.jpg", caption: "san to?" },
  { image: "images/image15.jpg", caption: "ah sa kapitolyo" },
  { image: "images/image16.jpg", caption: "kapitolyo nga, thank you po" },
  { image: "images/image17.jpg", caption: "ligo" },
  { image: "images/image18.jpg", caption: "pasaan kayo?" },
  { image: "images/image19.jpg", caption: "ah science, k bye." },
];

const finalLoveSlide = {
  image: "",
  caption: "wag ka na magalt",
  isFinalMessage: true,
};

const allSlides = [...memories, finalLoveSlide];

const landingScreen = document.getElementById("landingScreen");
const startButton = document.getElementById("startButton");
const app = document.getElementById("app");

const slideCard = document.getElementById("slideCard");
const slideImageWrap = document.getElementById("slideImageWrap");
const slideImage = document.getElementById("slideImage");
const slideCaption = document.getElementById("slideCaption");
const dotsContainer = document.getElementById("dotsContainer");

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const autoPlayButton = document.getElementById("autoPlayButton");

const bgMusic = document.getElementById("bgMusic");
const musicToggleButton = document.getElementById("musicToggleButton");
const volumeControl = document.getElementById("volumeControl");
const musicStatus = document.getElementById("musicStatus");
const heartsLayer = document.getElementById("heartsLayer");

let currentSlideIndex = 0;
let autoPlayEnabled = true;
let autoPlayTimerId = null;
const autoPlayDelayMs = 5000;
let touchStartX = 0;
let touchEndX = 0;
let isSlideLoading = false;
let renderToken = 0;

function createDots() {
  dotsContainer.innerHTML = "";
  allSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderSlide(index) {
  const slide = allSlides[index];
  if (!slide) return;
  const token = ++renderToken;
  isSlideLoading = true;

  slideCard.classList.add("is-transitioning");
  await wait(210);
  if (token !== renderToken) return;

  if (slide.isFinalMessage) {
    slideImage.style.display = "none";
    slideCaption.innerHTML = escapeHtml(slide.caption).replace(/\n/g, "<br />");
    slideImageWrap.style.background =
      "linear-gradient(145deg, rgba(179,0,0,0.15), rgba(255,20,147,0.12), rgba(0,0,0,0.45))";
    updateDots(index);
    slideCard.classList.remove("is-transitioning");
    isSlideLoading = false;
    return;
  }

  try {
    await preloadImage(slide.image);
  } catch (error) {
    // Keep slideshow moving even if one image fails.
  }

  if (token !== renderToken) return;

  slideImage.style.display = "block";
  slideImage.src = slide.image;
  slideImage.alt = `Memory ${index + 1}: ${slide.caption}`;
  slideCaption.textContent = `"${slide.caption}"`;
  slideImageWrap.style.background = "#111";
  updateDots(index);
  slideCard.classList.remove("is-transitioning");
  isSlideLoading = false;
}

function updateDots(activeIndex) {
  const dots = dotsContainer.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === activeIndex);
  });
}

function goToSlide(index) {
  if (isSlideLoading) return;
  const maxIndex = allSlides.length - 1;
  currentSlideIndex = Math.max(0, Math.min(index, maxIndex));
  renderSlide(currentSlideIndex);
}

function goToNextSlide() {
  if (isSlideLoading) return;
  currentSlideIndex = (currentSlideIndex + 1) % allSlides.length;
  renderSlide(currentSlideIndex);
}

function goToPreviousSlide() {
  if (isSlideLoading) return;
  currentSlideIndex = (currentSlideIndex - 1 + allSlides.length) % allSlides.length;
  renderSlide(currentSlideIndex);
}

function startAutoPlay() {
  stopAutoPlay();
  if (!autoPlayEnabled) return;
  autoPlayTimerId = window.setInterval(goToNextSlide, autoPlayDelayMs);
}

function stopAutoPlay() {
  if (autoPlayTimerId) {
    window.clearInterval(autoPlayTimerId);
    autoPlayTimerId = null;
  }
}

function restartAutoPlay() {
  if (autoPlayEnabled) {
    startAutoPlay();
  }
}

function toggleAutoPlay() {
  autoPlayEnabled = !autoPlayEnabled;
  autoPlayButton.textContent = autoPlayEnabled ? "Auto: On" : "Auto: Off";
  if (autoPlayEnabled) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
}

function setupKeyboardNavigation() {
  document.addEventListener("keydown", (event) => {
    if (app.classList.contains("hidden")) return;
    if (event.key === "ArrowRight") {
      goToNextSlide();
      restartAutoPlay();
    } else if (event.key === "ArrowLeft") {
      goToPreviousSlide();
      restartAutoPlay();
    }
  });
}

function setupSwipeNavigation() {
  slideCard.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  slideCard.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].screenX;
      const swipeDistance = touchStartX - touchEndX;
      const threshold = 50;

      if (swipeDistance > threshold) {
        goToNextSlide();
        restartAutoPlay();
      } else if (swipeDistance < -threshold) {
        goToPreviousSlide();
        restartAutoPlay();
      }
    },
    { passive: true }
  );
}

function setupParallaxEffect() {
  document.addEventListener("mousemove", (event) => {
    if (app.classList.contains("hidden")) return;
    const xRatio = event.clientX / window.innerWidth - 0.5;
    const yRatio = event.clientY / window.innerHeight - 0.5;
    const moveX = xRatio * 6;
    const moveY = yRatio * 6;
    slideImage.style.transform = `scale(1.06) translate(${moveX}px, ${moveY}px)`;
  });

  document.addEventListener("mouseleave", () => {
    slideImage.style.transform = "scale(1.04)";
  });
}

function setupMusicControls() {
  volumeControl.addEventListener("input", () => {
    bgMusic.volume = Number(volumeControl.value);
  });

  musicToggleButton.addEventListener("click", async () => {
    if (bgMusic.paused) {
      try {
        await bgMusic.play();
        musicToggleButton.textContent = "Pause Music";
        musicStatus.textContent = "Music is playing softly in the background.";
      } catch (error) {
        musicStatus.textContent = "Add your song at music/romantic.mp3 to play music.";
      }
    } else {
      bgMusic.pause();
      musicToggleButton.textContent = "Play Music";
      musicStatus.textContent = "Music paused.";
    }
  });
}

async function startExperience() {
  landingScreen.classList.add("hidden");
  app.classList.remove("hidden");
  createDots();
  renderSlide(currentSlideIndex);
  startAutoPlay();

  bgMusic.volume = Number(volumeControl.value);
  try {
    await bgMusic.play();
    musicStatus.textContent = "Music is playing softly in the background.";
    musicToggleButton.textContent = "Pause Music";
  } catch (error) {
    musicStatus.textContent = "Add your song at music/romantic.mp3 to play music.";
    musicToggleButton.textContent = "Play Music";
  }
}

function createFloatingHeart() {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "❤" : "💖";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${8 + Math.random() * 8}s`;
  heart.style.opacity = `${0.45 + Math.random() * 0.55}`;
  heartsLayer.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, 17000);
}

function startHeartAnimation() {
  window.setInterval(createFloatingHeart, 700);
}

startButton.addEventListener("click", startExperience);
prevButton.addEventListener("click", () => {
  goToPreviousSlide();
  restartAutoPlay();
});
nextButton.addEventListener("click", () => {
  goToNextSlide();
  restartAutoPlay();
});
autoPlayButton.addEventListener("click", toggleAutoPlay);

setupKeyboardNavigation();
setupSwipeNavigation();
setupParallaxEffect();
setupMusicControls();
startHeartAnimation();
