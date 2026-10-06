/**
 * Chhatrapati Shivaji Maharaj Tribute Site
 * Seal Intro — One-time intro overlay animation
 */

(function () {
  'use strict';

  const overlay = document.getElementById('seal-intro-overlay');
  if (!overlay) return;

  // Check if user has already seen the intro animation during this session
  if (sessionStorage.getItem('seal-intro-seen')) {
    overlay.style.display = 'none';
    overlay.remove();
    return;
  }

  // Set session flag so they don't see it again on refresh/navigation
  sessionStorage.setItem('seal-intro-seen', 'true');

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply appropriate animation class
  if (prefersReducedMotion) {
    overlay.classList.add('intro-reduced');
  } else {
    overlay.classList.add('intro-active');
  }

  // Dismiss intro on click
  overlay.addEventListener('click', dismissIntro);

  // Auto-dismiss after animation completes
  // Intro active: scale+fade-in (600ms) + stay (1200ms) + fade-out (600ms) = 2400ms total
  // Reduced: fade-in (300ms) + stay (1000ms) + fade-out (300ms) = 1600ms total
  const autoDismissDelay = prefersReducedMotion ? 1300 : 2000;

  const dismissTimeout = setTimeout(dismissIntro, autoDismissDelay);

  function dismissIntro() {
    clearTimeout(dismissTimeout);
    overlay.classList.add('dismissed');
    
    // Remove overlay from DOM after fade-out transition completes
    const transitionDuration = prefersReducedMotion ? 300 : 600;
    setTimeout(() => {
      overlay.remove();
    }, transitionDuration);
  }
})();
