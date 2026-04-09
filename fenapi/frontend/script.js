/**
 * Circolo FENAPI Torino — Main Script
 * Gestisce: navigazione, scroll animations, counter, mobile menu
 */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────────────────
  const headerMain    = document.getElementById('headerMain');
  const navToggle     = document.getElementById('navToggle');
  const navWrapper    = document.getElementById('navWrapper');
  const scrollTopBtn  = document.getElementById('scrollTop');
  const navLinks      = document.querySelectorAll('.nav-main a');
  const counters      = document.querySelectorAll('.counter-animated');
  const fadeElements  = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger-children');

  // ── Sticky Header ──────────────────────────────────────────────────
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Toggle "scrolled" class on header
    if (scrollY > 50) {
      headerMain.classList.add('scrolled');
    } else {
      headerMain.classList.remove('scrolled');
    }

    // Show/hide scroll-to-top button
    if (scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── Scroll to Top ──────────────────────────────────────────────────
  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Mobile Menu Toggle ─────────────────────────────────────────────
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navWrapper.classList.toggle('open');
  });

  // Close mobile menu when a nav link is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navWrapper.classList.remove('open');
    });
  });

  // ── Active Nav Highlighting on Scroll ──────────────────────────────
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ── Smooth Scroll for Anchor Links ─────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Intersection Observer — Fade-in Animations ─────────────────────
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(function (el) {
    fadeObserver.observe(el);
  });

  // ── Counter Animation ──────────────────────────────────────────────
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      // Se il fallback HTML mostra gia' il valore target, salta l'animazione
      // (evita il flash "33+" -> "0+" -> "33+" quando l'IntersectionObserver fire)
      if (counter.textContent.trim() === target + '+') {
        return;
      }
      const duration = 2000; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        counter.textContent = current + '+';

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target + '+';
        }
      }

      requestAnimationFrame(updateCounter);
    });

    countersAnimated = true;
  }

  // Trigger counters when hero-stats comes into view
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterObserver.observe(heroStats);
  }

  // ── Initial calls ──────────────────────────────────────────────────
  handleScroll();
  updateActiveNav();

})();
