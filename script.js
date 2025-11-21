(() => {
  // === Starfield setup ===
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  const skyWrapper = document.querySelector('.sky-wrapper');
  const starHitbox = document.querySelector('.birthday-star-hitbox');

  let width = 0;
  let height = 0;
  let panX = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startPan = 0;
  let hasMoved = false;
  let dragIntent = 'undetermined';
  let isHoveringBirthStar = false;
  const stars = [];
  const constellationLines = [];

  // Special birth star configuration (click opens external link)
  // Update the link if you need to change the external destination later.
  const birthStar = {
    name: 'December 7, 2008 — Birthday Star',
    link: 'https://mybirthdaystar.pages.dev',
    xMultiplier: 1.5, // places the star near the center of the second panel (panel-starfield)
    yRatio: 0.38, // relative vertical position; recalculated on resize
    hitbox: { leftPercent: 70, topPercent: 38 },
  };

  // Playlist data (edit title, artist, releaseDate, and audioSrc paths here)
  const songs = [
    {
      title: "I'll Be Lovin' U Long Time",
      artist: 'Mariah Carey',
      year: 2008,
      releaseDate: '2008-07-01',
      audioSrc: 'assets/ill_be_lovin_u_long_time.mp3',
    },
    {
      title: 'Love Lockdown',
      artist: 'Kanye West',
      year: 2008,
      releaseDate: '2008-09-18',
      audioSrc: 'assets/love_lockdown.mp3',
    },
    {
      title: 'One Of The Boys',
      artist: 'Katy Perry',
      year: 2008,
      releaseDate: '2008-06-17',
      audioSrc: 'assets/one_of_the_boys.mp3',
    },
    {
      title: 'Viva La Vida',
      artist: 'Coldplay',
      year: 2008,
      releaseDate: '2008-05-25',
      audioSrc: 'assets/viva_la_vida.mp3',
    },
    {
      title: 'Electric Feel',
      artist: 'MGMT',
      year: 2008,
      releaseDate: '2008-06-23',
      audioSrc: 'assets/electric_feel.mp3',
    },
    {
      title: 'You Found Me',
      artist: 'The Fray',
      year: 2008,
      releaseDate: '2008-11-21',
      audioSrc: 'assets/you_found_me.mp3',
    },
    {
      title: 'Only You',
      artist: 'Joshua Radin',
      year: 2008,
      releaseDate: '2008-01-01',
      audioSrc: 'assets/only_you.mp3',
    },
    {
      title: 'Untouched',
      artist: 'The Veronicas',
      year: 2008,
      releaseDate: '2008-12-06',
      audioSrc: 'assets/untouched.mp3',
    },
  ];



  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  function renderPlaylist() {
    const list = document.getElementById('song-list');
    list.innerHTML = '';

    songs.forEach((song) => {
      const card = document.createElement('article');
      card.className = 'song-card';

      const icon = document.createElement('div');
      icon.className = 'song-icon';
      icon.textContent = '✧';

      const meta = document.createElement('div');
      meta.className = 'song-meta';

      const titleEl = document.createElement('h3');
      titleEl.className = 'song-title';
      titleEl.textContent = song.title;

      const artistEl = document.createElement('p');
      artistEl.className = 'song-artist';
      artistEl.textContent = song.artist;

      const dateEl = document.createElement('p');
      dateEl.className = 'song-year';
      dateEl.textContent = `${song.year} · ${formatDate(song.releaseDate)}`;

      meta.appendChild(titleEl);
      meta.appendChild(artistEl);
      meta.appendChild(dateEl);

      const audioWrapper = document.createElement('div');
      audioWrapper.className = 'audio-player';
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = song.audioSrc;
      audioWrapper.appendChild(audio);

      card.appendChild(icon);
      card.appendChild(meta);
      card.appendChild(audioWrapper);
      list.appendChild(card);
    });
      const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = song.audioSrc;

  // keep track of it
  audioPlayers.push(audio);
// --- Audio behavior: one at a time + autoplay next ---
audioPlayers.forEach((audio, index) => {
  // When one starts playing, stop all others
  audio.addEventListener('play', () => {
    audioPlayers.forEach(other => {
      if (other !== audio) {
        other.pause();
        other.currentTime = 0;
      }
    });
    currentAudio = audio;
  });

  // When a track ends, start the next one automatically
  audio.addEventListener('ended', () => {
    const next = audioPlayers[index + 1];
    if (next) {
      next.play();
      next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      currentAudio = null;
    }
  });
});

  }

  function positionBirthdayHitbox() {
    if (!starHitbox) return;
    starHitbox.style.left = `${birthStar.hitbox.leftPercent}%`;
    starHitbox.style.top = `${birthStar.hitbox.topPercent}%`;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    // Reposition the birth star based on viewport size and keep it in the right-hand panel zone.
    birthStar.x = width * birthStar.xMultiplier;
    birthStar.y = height * birthStar.yRatio;

    if (skyWrapper) {
      panX = skyWrapper.scrollLeft;
    }
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function generateStars() {
    const baseCount = width < 520 ? 170 : 250;
    stars.length = 0;
    constellationLines.length = 0;

    const panoramaWidth = width * 3;
    for (let i = 0; i < baseCount; i += 1) {
      const x = Math.random() * panoramaWidth;
      const y = Math.random() * height;
      stars.push({ x, y, r: Math.random() * 1.2 + 0.4, opacity: randomBetween(0.35, 0.9) });
    }

    for (let i = 0; i < stars.length; i += 12) {
      const lineSet = [];
      for (let j = 0; j < 4; j += 1) {
        const starIndex = i + j;
        if (stars[starIndex]) {
          lineSet.push(stars[starIndex]);
        }
      }
      if (lineSet.length > 2) {
        constellationLines.push(lineSet);
      }
    }

    birthStar.x = Math.min(Math.max(width * birthStar.xMultiplier, 80), panoramaWidth - 80);
    birthStar.y = Math.min(Math.max(birthStar.y, 80), height - 80);
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    const panoramaWidth = width * 3;
    const offsets = [-panoramaWidth, 0, panoramaWidth];

    offsets.forEach((offset) => {
      ctx.save();
      ctx.translate(-panX + offset, 0);

      ctx.strokeStyle = 'rgba(200, 220, 255, 0.16)';
      ctx.lineWidth = 0.6;
      constellationLines.forEach((set) => {
        ctx.beginPath();
        ctx.moveTo(set[0].x, set[0].y);
        for (let i = 1; i < set.length; i += 1) {
          ctx.lineTo(set[i].x, set[i].y);
        }
        ctx.stroke();
      });

      stars.forEach((star) => {
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4);
        gradient.addColorStop(0, 'rgba(223, 231, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(223, 231, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(223, 231, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Birth star glow and halo (slightly stronger when hovered)
      const hoverScale = isHoveringBirthStar ? 1.1 : 1;
      const g = ctx.createRadialGradient(
        birthStar.x,
        birthStar.y,
        0,
        birthStar.x,
        birthStar.y,
        28 * hoverScale,
      );
      g.addColorStop(0, 'rgba(143, 212, 255, 0.45)');
      g.addColorStop(1, 'rgba(143, 212, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 24 * hoverScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(143, 212, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 15 * hoverScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(223, 240, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 3.8 * hoverScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    requestAnimationFrame(drawStars);
  }

  function getPanoramaWidth() {
    return width * 3;
  }

  // Pointer handling for desktop + mobile: we only lock into a horizontal drag once
  // horizontal movement wins over vertical, so quick vertical swipes still scroll the page.
  function handlePointerDown(event) {
    isDragging = true;
    hasMoved = false;
    dragIntent = 'undetermined';
    startX = event.clientX;
    startY = event.clientY;
    startPan = skyWrapper ? skyWrapper.scrollLeft : panX;
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (dragIntent === 'undetermined') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX > 8 && absX > absY + 2) {
        dragIntent = 'horizontal';
      } else if (absY > 10 && absY > absX) {
        dragIntent = 'vertical';
        isDragging = false;
        return;
      }
    }

    if (dragIntent !== 'horizontal') return;

    if (Math.abs(dx) > 4) hasMoved = true;
    const nextPan = startPan - dx;
    if (skyWrapper) {
      skyWrapper.scrollLeft = nextPan;
      panX = skyWrapper.scrollLeft;
    } else {
      const panoramaWidth = getPanoramaWidth();
      panX = (nextPan) % panoramaWidth;
    }
    event.preventDefault();
  }

  function handlePointerUp() {
    isDragging = false;
    dragIntent = 'undetermined';
  }

  function handlePointerLeave() {
    isDragging = false;
    dragIntent = 'undetermined';
  }

  function registerEvents() {
    if (skyWrapper) {
      // Let horizontal drags on the wrapper move between panels while preserving vertical scrolls.
      skyWrapper.addEventListener('pointerdown', handlePointerDown, { passive: true });
      skyWrapper.addEventListener('pointermove', handlePointerMove, { passive: false });
      skyWrapper.addEventListener('pointerup', handlePointerUp, { passive: true });
      skyWrapper.addEventListener('pointercancel', handlePointerUp, { passive: true });
      skyWrapper.addEventListener('pointerleave', handlePointerLeave, { passive: true });

      // Keep the canvas parallax aligned with the horizontal scroll position.
      skyWrapper.addEventListener('scroll', () => {
        panX = skyWrapper.scrollLeft;
      });
    }

    if (starHitbox) {
      // Click opens the external birthday star link in a new tab.
      starHitbox.addEventListener('click', () => {
        window.open(birthStar.link, '_blank');
      });

      starHitbox.addEventListener('mouseenter', () => {
        isHoveringBirthStar = true;
        starHitbox.classList.add('is-hovered');
      });

      starHitbox.addEventListener('mouseleave', () => {
        isHoveringBirthStar = false;
        starHitbox.classList.remove('is-hovered');
      });

      starHitbox.addEventListener('touchstart', () => {
        isHoveringBirthStar = true;
        starHitbox.classList.add('is-hovered');
      }, { passive: true });

      starHitbox.addEventListener('touchend', () => {
        isHoveringBirthStar = false;
        starHitbox.classList.remove('is-hovered');
      }, { passive: true });
    }

    window.addEventListener('resize', () => {
      resize();
      generateStars();
      positionBirthdayHitbox();
    });
  }
// ----- Global audio behavior: one at a time + autoplay next -----
document.addEventListener(
  'play',
  (event) => {
    if (event.target.tagName.toLowerCase() !== 'audio') return;

    const current = event.target;
    const audios = document.querySelectorAll('audio');

    audios.forEach((audio) => {
      if (audio !== current) {
        audio.pause();
        audio.currentTime = 0; // reset others so they always start from the beginning
      }
    });
  },
  true // capture so it catches <audio> events even inside shadow/containers
);

document.addEventListener(
  'ended',
  (event) => {
    if (event.target.tagName.toLowerCase() !== 'audio') return;

    const audios = Array.from(document.querySelectorAll('audio'));
    const index = audios.indexOf(event.target);

    if (index !== -1 && index + 1 < audios.length) {
      // play next track automatically
      audios[index + 1].play();
      // optionally, scroll it into view:
      audios[index + 1].closest('.song-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  },
  true
);

  // Initialize
  resize();
  generateStars();
  renderPlaylist();
  positionBirthdayHitbox();
  drawStars();
  registerEvents();
})();
