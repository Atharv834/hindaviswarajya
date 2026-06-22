/**
 * Chhatrapati Shivaji Maharaj Tribute Site
 * Main JavaScript — Header, Navigation, Interactions
 */

(function () {
  'use strict';

  /* ========================================
     HEADER SCROLL BEHAVIOR
     transparent → solid charcoal at 80px
  ======================================== */
  const header = document.querySelector('.site-header');
  const SCROLL_THRESHOLD = 80;

  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // initial check


  /* ========================================
     HAMBURGER MENU TOGGLE
  ======================================== */
  const hamburger = document.querySelector('.hamburger');
  const navOverlay = document.querySelector('.header-nav');

  if (hamburger && navOverlay) {
    hamburger.addEventListener('click', function () {
      const isOpen = document.body.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Close menu when a nav link is clicked
    navOverlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Open menu');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.focus();
      }
    });
  }


  /* ========================================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  /* ========================================
     LANGUAGE TOGGLE (EN / MR)
     Toggles .lang-mr class on <html> element and persists
  ======================================== */
  const langBtns = document.querySelectorAll('.lang-toggle button');
  let savedLang = 'en';
  try {
    savedLang = localStorage.getItem('maratha-lang') || 'en';
  } catch (e) {
    console.warn('Local storage blocked.');
  }

  function setLanguage(lang) {
    if (lang === 'mr') {
      document.documentElement.classList.add('lang-mr');
    } else {
      document.documentElement.classList.remove('lang-mr');
    }
    
    langBtns.forEach(function (b) {
      if (b.dataset.lang === lang) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    
    try {
      localStorage.setItem('maratha-lang', lang);
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Initialize on load
  if (langBtns.length > 0) {
    setLanguage(savedLang);
    langBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(this.dataset.lang);
      });
    });
  }


  /* ========================================
     SEAL PRESS INTERACTION (Coronation)
     Click/tap → scale 0.95 → back to 1.0
     with a saffron glow pulse
  ======================================== */
  const interactiveSeal = document.querySelector('.seal-interactive');
  if (interactiveSeal) {
    interactiveSeal.addEventListener('click', function () {
      this.classList.remove('seal-pressed');
      // Force reflow to restart animation
      void this.offsetWidth;
      this.classList.add('seal-pressed');
    });

    interactiveSeal.addEventListener('animationend', function () {
      this.classList.remove('seal-pressed');
    });
  }


  /* ========================================
     FORT MAP ↔ CARD CROSS-HIGHLIGHTING
     Hovering a map pin highlights its card
     and vice versa
  ======================================== */
  const mapPins = document.querySelectorAll('.map-pin[data-fort-id]');
  const fortCards = document.querySelectorAll('.fort-card[data-fort-id]');

  function highlightFort(fortId) {
    mapPins.forEach(function (pin) {
      pin.classList.toggle('active', pin.dataset.fortId === fortId);
    });
    fortCards.forEach(function (card) {
      card.classList.toggle('highlighted', card.dataset.fortId === fortId);
    });
  }

  function clearHighlight() {
    mapPins.forEach(function (pin) { pin.classList.remove('active'); });
    fortCards.forEach(function (card) { card.classList.remove('highlighted'); });
  }

  mapPins.forEach(function (pin) {
    pin.addEventListener('mouseenter', function () { highlightFort(this.dataset.fortId); });
    pin.addEventListener('mouseleave', clearHighlight);
    pin.addEventListener('focus', function () { highlightFort(this.dataset.fortId); });
    pin.addEventListener('blur', clearHighlight);
  });

  fortCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { highlightFort(this.dataset.fortId); });
    card.addEventListener('mouseleave', clearHighlight);
  });


  /* ========================================
     TIMELINE SCRUBBER
     Syncs range input with milestone cards
  ======================================== */
  const scrubber = document.querySelector('.timeline-scrubber input[type="range"]');
  const yearLabel = document.querySelector('.timeline-year-display');
  const milestoneCards = document.querySelectorAll('.milestone-card');

  if (scrubber) {
    const milestones = [
      { year: 1630, id: 'milestone-1630' },
      { year: 1646, id: 'milestone-1646' },
      { year: 1659, id: 'milestone-1659' },
      { year: 1665, id: 'milestone-1665' },
      { year: 1674, id: 'milestone-1674' },
      { year: 1680, id: 'milestone-1680' }
    ];

    scrubber.addEventListener('input', function () {
      const currentYear = parseInt(this.value, 10);
      if (yearLabel) yearLabel.textContent = currentYear;

      // Update track fill
      const percent = ((currentYear - 1630) / (1680 - 1630)) * 100;
      this.style.setProperty('--fill-percent', percent + '%');

      // Find closest milestone
      let closest = milestones[0];
      for (let i = 0; i < milestones.length; i++) {
        if (milestones[i].year <= currentYear) {
          closest = milestones[i];
        }
      }

      // Show matching card, hide others
      milestoneCards.forEach(function (card) {
        card.classList.toggle('active', card.id === closest.id);
      });
    });
  }


  /* ========================================
     SCROLL-TO-BEGIN CUE
     Hide once user scrolls past hero
  ======================================== */
  const scrollCue = document.querySelector('.hero-scroll-cue');
  if (scrollCue) {
    let hidden = false;
    window.addEventListener('scroll', function () {
      if (!hidden && window.scrollY > 200) {
        scrollCue.style.opacity = '0';
        scrollCue.style.pointerEvents = 'none';
        hidden = true;
      }
    }, { passive: true });
  }


  /* ========================================
     EXPLORE HIS JOURNEY CTA
     Scrolls to the prologue section
  ======================================== */
  const exploreCta = document.querySelector('.hero-cta');
  if (exploreCta) {
    exploreCta.addEventListener('click', function (e) {
      const target = document.querySelector('#prologue') || document.querySelector('#birth');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

})();
