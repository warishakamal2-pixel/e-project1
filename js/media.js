const HOME_MEDIA = {
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
}
