// Simple starfield with horizontal drag/swipe parallax
const canvas = document.getElementById('sky-canvas');
const ctx = canvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;
let panX = 0;
let isDragging = false;
let startX = 0;
let startPan = 0;

const stars = [];
const constellationLines = [];

// Placeholder birthdate star. Replace the values below with the actual star details.
const birthStar = {
  name: '[Star Name]',
  constellation: '[Constellation]',
  distance: '[Distance]',
  spectralClass: '[Spectral Class]',
  magnitude: '[Magnitude]',
  temperature: '[Temperature]',
  description: '[Write a gentle, personal note about what this star means.]',
  // Adjust position to place the star where you like in the panorama (values are pixels)
  x: 600,
  y: height * 0.35,
};

const modal = document.getElementById('star-modal');
const closeButton = document.querySelector('.close-button');
const nameEl = document.getElementById('star-name');
const constellationEl = document.getElementById('star-constellation');
const distanceEl = document.getElementById('star-distance');
const classEl = document.getElementById('star-class');
const magnitudeEl = document.getElementById('star-magnitude');
const temperatureEl = document.getElementById('star-temperature');
const descriptionEl = document.getElementById('star-description');

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateStars() {
  const baseCount = width < 520 ? 170 : 250;
  stars.length = 0;
  constellationLines.length = 0;

  // Build a panorama wider than the viewport for smoother panning.
  const panoramaWidth = width * 3;
  for (let i = 0; i < baseCount; i++) {
    const x = Math.random() * panoramaWidth;
    const y = Math.random() * height;
    stars.push({ x, y, r: Math.random() * 1.2 + 0.4, opacity: randomBetween(0.35, 0.9) });
  }

  // Create a few soft constellations by connecting nearby stars.
  for (let i = 0; i < stars.length; i += 12) {
    const lineSet = [];
    for (let j = 0; j < 4; j++) {
      const starIndex = i + j;
      if (stars[starIndex]) {
        lineSet.push(stars[starIndex]);
      }
    }
    if (lineSet.length > 2) {
      constellationLines.push(lineSet);
    }
  }

  // Ensure the birth star lives within the panorama bounds.
  birthStar.x = Math.min(Math.max(birthStar.x, 80), panoramaWidth - 80);
  birthStar.y = Math.min(Math.max(birthStar.y, 80), height - 80);
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);
  const panoramaWidth = width * 3;

  // Create seamless wrap so panning loops softly.
  const offsets = [-panoramaWidth, 0, panoramaWidth];

  offsets.forEach((offset) => {
    ctx.save();
    ctx.translate(-panX + offset, 0);

    // Draw constellation lines.
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.16)';
    ctx.lineWidth = 0.6;
    constellationLines.forEach((set) => {
      ctx.beginPath();
      ctx.moveTo(set[0].x, set[0].y);
      for (let i = 1; i < set.length; i++) {
        ctx.lineTo(set[i].x, set[i].y);
      }
      ctx.stroke();
    });

    // Draw general stars.
    stars.forEach((star) => {
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4);
      gradient.addColorStop(0, `rgba(223, 231, 255, ${star.opacity})`);
      gradient.addColorStop(1, 'rgba(223, 231, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(223, 231, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw birth star highlight.
    const g = ctx.createRadialGradient(birthStar.x, birthStar.y, 0, birthStar.x, birthStar.y, 26);
    g.addColorStop(0, 'rgba(143, 212, 255, 0.45)');
    g.addColorStop(1, 'rgba(143, 212, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(birthStar.x, birthStar.y, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(143, 212, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(birthStar.x, birthStar.y, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(223, 240, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(birthStar.x, birthStar.y, 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  requestAnimationFrame(drawStars);
}

function openModal() {
  nameEl.textContent = birthStar.name;
  constellationEl.textContent = `Constellation: ${birthStar.constellation}`;
  distanceEl.textContent = birthStar.distance;
  classEl.textContent = birthStar.spectralClass;
  magnitudeEl.textContent = birthStar.magnitude;
  temperatureEl.textContent = birthStar.temperature;
  descriptionEl.textContent = birthStar.description;

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function handlePointerDown(event) {
  isDragging = true;
  startX = event.clientX || event.touches?.[0]?.clientX || 0;
  startPan = panX;
}

function handlePointerMove(event) {
  if (!isDragging) return;
  const currentX = event.clientX || event.touches?.[0]?.clientX || 0;
  const delta = currentX - startX;
  const panoramaWidth = width * 3;
  panX = (startPan - delta) % panoramaWidth;
}

function handlePointerUp(event) {
  if (!isDragging) return;
  isDragging = false;

  const tapX = event.clientX || event.changedTouches?.[0]?.clientX || 0;
  const tapY = event.clientY || event.changedTouches?.[0]?.clientY || 0;
  const panoramaWidth = width * 3;

  // Determine the real position the user tapped in the panoramic space.
  const normalizedPan = ((panX % panoramaWidth) + panoramaWidth) % panoramaWidth;
  const realX = tapX + normalizedPan;
  const realY = tapY;

  const dx = realX - birthStar.x;
  const dy = realY - birthStar.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 22) {
    openModal();
  }
}

function registerEvents() {
  ['mousedown', 'touchstart'].forEach((evt) => {
    canvas.addEventListener(evt, handlePointerDown, { passive: true });
  });
  ['mousemove', 'touchmove'].forEach((evt) => {
    canvas.addEventListener(evt, handlePointerMove, { passive: true });
  });
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((evt) => {
    canvas.addEventListener(evt, handlePointerUp, { passive: true });
  });

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('resize', () => {
    resize();
    generateStars();
  });
}

resize();
generateStars();
drawStars();
registerEvents();
