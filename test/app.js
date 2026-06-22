// --- CONFIGURATION ---
// You can modify folder paths, frame counts, naming patterns, scroll speeds, and breakpoints here.
const CONFIG = {
  desktop: {
    folder: 'images/',           // Folder containing desktop frame sequence
    prefix: 'ezgif-frame-',      // Frame filename prefix
    extension: '.jpg',           // File extension
    frameCount: 300,            // Number of frames in the sequence
    digits: 3,                   // Zero-padding digits (e.g., 3 digits -> 001)
    pxPerFrame: 10,              // Scroll distance (px) mapped to each frame (higher = slower playback)
    breakpoint: '(min-width: 768px)' // Desktop media query
  },
  mobile: {
    folder: 'images/',           // Folder containing mobile frame sequence (using same folder here)
    prefix: 'ezgif-frame-',      // Frame filename prefix
    extension: '.jpg',           // File extension
    frameCount: 300,            // Number of frames in the sequence
    digits: 3,                   // Zero-padding digits
    pxPerFrame: 6,               // Scroll distance (px) mapped to each frame on mobile (lower = faster playback)
    breakpoint: '(max-width: 767px)' // Mobile media query
  }
};

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

// --- DOM ELEMENTS ---
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger-menu');
const navMenu = document.getElementById('nav-menu');
const canvas = document.getElementById('video-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('canvas-loader');
const loaderStatus = document.getElementById('loader-status');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');

// --- GLOBAL STATE ---
let lastDrawnIndex = -1;
let currentFrameIndex = 0;

// --- UTILITY FUNCTIONS ---
function padZero(num, size) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

function getFrameUrl(config, index) {
  const frameStr = padZero(index, config.digits);
  return `${config.folder}${config.prefix}${frameStr}${config.extension}`;
}

// Draw a single image onto the canvas with Contain fit + Blurred Cover backdrop
function drawFrame(img) {
  if (!img || !img.complete) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;

  // Clear canvas entirely
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let mainWidth, mainHeight, mainX, mainY;

  // 1. Calculate dimensions for "contain" fit (main foreground image)
  if (imgRatio > canvasRatio) {
    mainWidth = canvasWidth;
    mainHeight = canvasWidth / imgRatio;
    mainX = 0;
    mainY = (canvasHeight - mainHeight) / 2;
  } else {
    mainHeight = canvasHeight;
    mainWidth = canvasHeight * imgRatio;
    mainX = (canvasWidth - mainWidth) / 2;
    mainY = 0;
  }

  // 2. If empty space exists, draw a blurred backdrop (cover fit)
  const hasEmptySpace = (mainWidth < canvasWidth - 1) || (mainHeight < canvasHeight - 1);
  if (hasEmptySpace) {
    let coverWidth, coverHeight, coverX, coverY;
    if (imgRatio > canvasRatio) {
      coverHeight = canvasHeight;
      coverWidth = canvasHeight * imgRatio;
      coverX = (canvasWidth - coverWidth) / 2;
      coverY = 0;
    } else {
      coverWidth = canvasWidth;
      coverHeight = canvasWidth / imgRatio;
      coverX = 0;
      coverY = (canvasHeight - coverHeight) / 2;
    }

    ctx.save();
    // Blur filter for premium aesthetics
    ctx.filter = 'blur(20px)';
    // Draw cover image with slight bleed margins to avoid edge transparency artifacts from blur
    ctx.drawImage(img, coverX - 40, coverY - 40, coverWidth + 80, coverHeight + 80);
    ctx.restore();

    // Semi-transparent dark overlay to blend the background and improve contrast
    ctx.fillStyle = 'rgba(8, 9, 12, 0.4)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // 3. Draw contained main foreground image
  ctx.drawImage(img, mainX, mainY, mainWidth, mainHeight);
}

// Progressive image loader with support for AbortController signals
function loadImage(url, signal) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }

    const img = new Image();
    img.src = url;

    const onAbort = () => {
      img.onload = null;
      img.onerror = null;
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort);
    }

    img.onload = () => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve(img);
    };

    img.onerror = (e) => {
      if (signal) signal.removeEventListener('abort', onAbort);
      reject(e);
    };
  });
}

// --- CORE SEQUENCE SETUP ---
function setupSequence(config) {
  // Create unique cancellation controller for this sequence configuration
  const controller = new AbortController();
  const signal = controller.signal;

  let localImages = new Array(config.frameCount);
  let isFirstFrameLoaded = false;
  let isSequencePreloaded = false;

  // Reset Loader UI & progress bar
  loader.style.opacity = '1';
  loader.style.display = 'block';
  loaderStatus.innerText = 'Preloading sequence...';
  progressBarContainer.style.opacity = '1';
  progressBar.style.width = '0%';

  // Resize canvas function (coordinates device pixel ratio)
  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Instantly redraw current frame on resize to prevent flicker/blank state
    if (localImages[currentFrameIndex]) {
      drawFrame(localImages[currentFrameIndex]);
    }
  };

  // Debounced window resize handler to update dimensions and refresh ScrollTrigger positioning
  let resizeTimeout;
  const onResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      ScrollTrigger.refresh();
    }, 150);
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // Set initial canvas size
  resizeCanvas();

  // Accessibility Check: Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scrollTriggerInstance = null;

  // Initialize ScrollTrigger scrubbing and pinning
  const initScrollTrigger = () => {
    if (prefersReducedMotion) {
      console.log('prefers-reduced-motion: true. Bypassing scroll pinning and scrub.');
      return;
    }

    const scrollDistance = config.frameCount * config.pxPerFrame;
    const wrapper = document.getElementById('scroll-video-section');
    
    // Set dynamic section height for scrolling range
    wrapper.style.height = `${scrollDistance + window.innerHeight}px`;

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: '#scroll-video-section',
      start: 'top top',
      end: `+=${scrollDistance}`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        if (signal.aborted) return;

        // Calculate current frame index based on scroll progress (0 to 1)
        const index = Math.min(
          config.frameCount - 1,
          Math.max(0, Math.floor(self.progress * config.frameCount))
        );

        currentFrameIndex = index;

        // Draw only when the index changes to optimize rendering performance
        if (currentFrameIndex !== lastDrawnIndex && localImages[currentFrameIndex]) {
          drawFrame(localImages[currentFrameIndex]);
          lastDrawnIndex = currentFrameIndex;
        }
      }
    });
  };

  // Progressive background loading process
  const preloadProgressively = async () => {
    // 1. Load 1st frame immediately to populate the viewport right away
    try {
      const firstUrl = getFrameUrl(config, 1);
      const img = await loadImage(firstUrl, signal);
      localImages[0] = img;
      isFirstFrameLoaded = true;

      // Draw first frame immediately
      if (currentFrameIndex === 0) {
        drawFrame(img);
        lastDrawnIndex = 0;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load first frame', err);
      }
    }

    // 2. Stream remaining frames in background batches after main paint
    const itemsToLoad = [];
    for (let i = 2; i <= config.frameCount; i++) {
      itemsToLoad.push({ index: i - 1, url: getFrameUrl(config, i) });
    }

    const batchSize = 6; // Balance network load (max connections per domain is ~6)
    let loadedCount = 1;

    const loadNextBatch = async (startIndex) => {
      if (signal.aborted) return;

      const batch = itemsToLoad.slice(startIndex, startIndex + batchSize);
      if (batch.length === 0) {
        isSequencePreloaded = true;
        hideLoader();
        return;
      }

      const promises = batch.map(async (item) => {
        try {
          const img = await loadImage(item.url, signal);
          localImages[item.index] = img;
          loadedCount++;

          // Draw immediately if user has scrolled to this frame before it finished loading
          if (currentFrameIndex === item.index) {
            drawFrame(img);
            lastDrawnIndex = item.index;
          }

          // Update progress metrics
          const pct = Math.round((loadedCount / config.frameCount) * 100);
          loaderStatus.innerText = `Preloading sequence: ${pct}%`;
          progressBar.style.width = `${pct}%`;
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn(`Failed to load frame ${item.index + 1}:`, err);
            loadedCount++; // Increment count to prevent progress freezing
          }
        }
      });

      await Promise.allSettled(promises);

      // Trigger next batch asynchronously with a tiny delay to preserve UI responsiveness
      if (!signal.aborted) {
        setTimeout(() => loadNextBatch(startIndex + batchSize), 40);
      }
    };

    // Delay start of background stream slightly to let DOM compile and display initial elements
    setTimeout(() => {
      loadNextBatch(0);
    }, 150);
  };

  const hideLoader = () => {
    loader.style.opacity = '0';
    progressBarContainer.style.opacity = '0';
    setTimeout(() => {
      if (loader.style.opacity === '0') {
        loader.style.display = 'none';
      }
    }, 400);
  };

  // Run the loader & trigger configurations
  preloadProgressively();
  initScrollTrigger();

  // If user prefers reduced motion, load a representative middle frame to show static visual
  if (prefersReducedMotion) {
    const repIndex = Math.floor(config.frameCount / 2);
    const repUrl = getFrameUrl(config, repIndex + 1);
    loadImage(repUrl, signal).then(img => {
      localImages[repIndex] = img;
      drawFrame(img);
      lastDrawnIndex = repIndex;
      hideLoader();
    }).catch(err => {
      if (err.name !== 'AbortError') console.error('Failed to load static poster frame', err);
    });
  }

  // Return teardown function for ScrollTrigger.matchMedia cleanup
  return () => {
    // 1. Cancel background image loads
    controller.abort();

    // 2. Remove resize and orientation event listeners
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);

    // 3. Kill the ScrollTrigger instance (reverts pinning modifications)
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill(true);
    }

    // 4. Reset states & arrays
    localImages = [];
    lastDrawnIndex = -1;

    // Reset height wrapper if set
    const wrapper = document.getElementById('scroll-video-section');
    if (wrapper) wrapper.style.height = '';

    console.log('Scroll sequence cleanly torn down.');
  };
}

// --- INITIALIZE APPLICATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Setup Navbar Scroll Event
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Setup Mobile Hamburger Menu
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Initialize ScrollTrigger matchMedia
  ScrollTrigger.matchMedia({
    [CONFIG.desktop.breakpoint]: () => {
      const teardown = setupSequence(CONFIG.desktop);
      return () => teardown();
    },
    [CONFIG.mobile.breakpoint]: () => {
      const teardown = setupSequence(CONFIG.mobile);
      return () => teardown();
    }
  });
});
