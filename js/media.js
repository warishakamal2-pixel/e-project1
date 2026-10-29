const HOME_MEDIA = {
  video: 'assets/videos/mountain-climb.mp4',
  poster: {
    local: 'assets/images/climbing/home-climbing-poster.jpg',
    alt: 'Climber scaling a steep rock face'
  }
};

const PAGE_PHOTOS = {
  about: {
    local: 'assets/images/climbing/page-about.jpg',
    alt: 'Climber ascending a snowy mountain'
  },
  contact: {
    local: 'assets/images/climbing/page-contact.jpg',
    alt: 'Climber scaling a rugged cliff face'
  },
  booking: {
    local: 'assets/images/climbing/page-booking.jpg',
    alt: 'Climber preparing gear beside a snowy mountain'
  },
  safety: {
    local: 'assets/images/climbing/page-safety.jpg',
    alt: 'Climber ascending a snowy ridge'
  },
  faq: {
    local: 'assets/images/climbing/page-faq.jpg',
    alt: 'Climber ascending a steep rock face'
  }
};

const imgSrc = m => (m ? (m.local || m.url || '') : '');

function pagePhoto() {
  const photo = PAGE_PHOTOS[document.body.dataset.page];
  const heading = document.querySelector('main h1');
  if (!photo || !heading) return;

  const figure = document.createElement('figure');
  figure.className = 'page-photo';
  figure.innerHTML = `<img src="${esc(photo.local)}" alt="${esc(photo.alt)}" loading="lazy" decoding="async">`;
  heading.insertAdjacentElement('afterend', figure);
}

function heroMedia() {
  const hero = document.querySelector('.hero');
  if (!hero || hero.dataset.done) return;
  hero.dataset.done = 'true';

  const poster = HOME_MEDIA.poster;
  const probe = new Image();
  probe.onload = () => {
    hero.style.backgroundImage = `linear-gradient(#33241912 40%,#332419df),url("${probe.src}")`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
    hero.classList.add('hasimg');
  };
  probe.onerror = () => {
    hero.style.backgroundImage = `linear-gradient(#33241912 40%,#332419df),url("${poster.local}")`;
  };
  probe.src = poster.local;

  // Autoplay stays on the home hero and respects reduced-motion settings.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const video = document.createElement('video');
  video.className = 'bgv';
  video.src = HOME_MEDIA.video;
  video.autoplay = video.muted = video.loop = video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.poster = poster.local;
  video.addEventListener('error', () => {
    hero.classList.add('video-fallback');
    video.remove();
    console.warn('Homepage video could not load; the poster image remains visible.', video.error);
  }, { once: true });
  hero.prepend(video);

  // Some mobile browsers block autoplay; keep the poster visible in that case.
  const playback = video.play();
  if (playback && typeof playback.catch === 'function') {
    playback.catch(error => {
      hero.classList.add('video-fallback');
      console.info('Homepage video autoplay was blocked; showing the poster image instead.', error);
    });
  }
}
