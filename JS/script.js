/**
 * Tim Aguirre Portfolio — Main Script
 * Handles: project loading, scroll animations, sticky nav, mobile menu, smooth scroll, active nav tracking
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  const EXCLUDED_REPOS = ['TimsPortfolioSite', 'aguirretim.github.io'];

  /** Map repo names to human-readable display names */
  const FRIENDLY_NAMES = {
    CalculateThis: 'CalculateThis',
    DidYouKnowAndroidApp: 'Did You Know',
    ElectriHype: 'ElectriHype',
    TimHiLoApp: 'Tim Hi-Lo',
    TimsWGUSchedulertracker: 'WGU Scheduler Tracker',
    weatha: 'Weatha',
  };

  /** Language to Font Awesome icon HTML */
  const LANG_ICONS = {
    Kotlin: '<span class="project-card__icon-text">K</span>',
    Java: '<i class="fab fa-java"></i>',
    JavaScript: '<i class="fab fa-js"></i>',
    HTML: '<i class="fab fa-html5"></i>',
  };

  /** Language to badge CSS class(es) */
  const LANG_BADGE_CLASS = {
    Kotlin: 'badge badge--kotlin',
    Java: 'badge badge--java',
    JavaScript: 'badge badge--js',
    HTML: 'badge badge--html',
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Convert a PascalCase / camelCase repo name to a spaced readable string.
   * Uses the FRIENDLY_NAMES lookup first; falls back to regex splitting.
   */
  const toFriendlyName = (name) => {
    if (FRIENDLY_NAMES[name]) return FRIENDLY_NAMES[name];
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  /**
   * Return a fallback description when the repo has none.
   */
  const fallbackDescription = (language) => {
    switch (language) {
      case 'Kotlin':
        return 'An Android app built with Kotlin';
      case 'Java':
        return 'A Java application';
      case 'JavaScript':
        return 'A web application built with JavaScript';
      case 'HTML':
        return 'A website built with HTML & CSS';
      default:
        return 'A software project by Tim Aguirre';
    }
  };

  /**
   * Return the icon HTML for a given language.
   */
  const languageIcon = (language) =>
    LANG_ICONS[language] || '<i class="fa-solid fa-code"></i>';

  /**
   * Build extra badge HTML based on language and repo name.
   */
  const extraBadges = (language, name) => {
    const badges = [];
    if (
      (language === 'Kotlin' || language === 'Java') &&
      /android|app/i.test(name)
    ) {
      badges.push('<span class="badge">Android</span>');
    }
    if (language === 'JavaScript') {
      badges.push('<span class="badge badge--html">Web App</span>');
    }
    return badges.join('');
  };

  // ---------------------------------------------------------------------------
  // 1. Project Loader
  // ---------------------------------------------------------------------------

  const loadProjects = async () => {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    try {
      const res = await fetch('JsonData/repo.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const repos = await res.json();

      const filtered = repos
        .filter((r) => !EXCLUDED_REPOS.includes(r.name))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const fragment = document.createDocumentFragment();

      for (const repo of filtered) {
        const lang = repo.language;
        const friendly = toFriendlyName(repo.name);
        const desc = repo.description || fallbackDescription(lang);
        const badgeClass = LANG_BADGE_CLASS[lang] || 'badge';
        const badgeLabel = lang || 'Code';

        const card = document.createElement('div');
        card.className = 'project-card animate-in';
        card.innerHTML =
          '<div class="project-card__header">' +
            '<div class="project-card__icon">' +
              languageIcon(lang) +
            '</div>' +
            '<div class="project-card__links">' +
              '<a href="' + repo.html_url + '" class="project-card__link" target="_blank" rel="noopener" aria-label="View ' + repo.name + ' on GitHub">' +
                '<i class="fab fa-github"></i>' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<h3 class="project-card__title">' + friendly + '</h3>' +
          '<p class="project-card__desc">' + desc + '</p>' +
          '<div class="project-card__tech">' +
            '<span class="' + badgeClass + '">' + badgeLabel + '</span>' +
            extraBadges(lang, repo.name) +
          '</div>';

        fragment.appendChild(card);
      }

      grid.appendChild(fragment);

      // Observe newly-added cards for scroll animation
      initScrollAnimations();
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Scroll Animations (Intersection Observer)
  // ---------------------------------------------------------------------------

  const initScrollAnimations = () => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.animate-in').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document
      .querySelectorAll('.animate-in:not(.visible)')
      .forEach((el) => observer.observe(el));
  };

  // ---------------------------------------------------------------------------
  // 3. Sticky Nav Enhancement
  // ---------------------------------------------------------------------------

  const nav = document.getElementById('mainNav');

  const handleNavScroll = () => {
    if (!nav) return;
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---------------------------------------------------------------------------
  // 4. Mobile Hamburger Menu
  // ---------------------------------------------------------------------------

  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Smooth Scroll for Anchor Links
  // ---------------------------------------------------------------------------

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Close mobile menu if open
      if (hamburger && navLinks) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Active Nav Link on Scroll
  // ---------------------------------------------------------------------------

  const sections = document.querySelectorAll(
    '#hero, #skills, #projects, #about-preview'
  );
  const navLinkItems = document.querySelectorAll('.nav__link');

  if (sections.length && navLinkItems.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          // All homepage sections (including about-preview teaser) map to the "Work" link (href="/")
          // The about-preview is homepage content, not the About page itself
          const matchHref =
            id === 'hero' || id === 'skills' || id === 'projects' || id === 'about-preview'
              ? '/'
              : null;

          if (!matchHref) return;

          navLinkItems.forEach((link) => {
            if (link.getAttribute('href') === matchHref) {
              link.classList.add('nav__link--active');
            } else {
              link.classList.remove('nav__link--active');
            }
          });
        });
      },
      { threshold: 0.3, rootMargin: '-70px 0px 0px 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // ---------------------------------------------------------------------------
  // 7. YouTube Click-to-Load Player
  // ---------------------------------------------------------------------------

  /**
   * loadVideo — used by video-card onclick handlers in the video grid.
   * Replaces the clicked card's content with an embedded YouTube iframe.
   */
  window.loadVideo = (el, videoId) => {
    const iframe = document.createElement('iframe');
    iframe.className = 'video-card__iframe';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = el.querySelector('.video-card__title')
      ? el.querySelector('.video-card__title').textContent
      : 'YouTube Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    el.innerHTML = '';
    el.appendChild(iframe);
    el.style.cursor = 'default';
    el.onclick = null;
  };

  const initYouTubePlayer = () => {
    const thumbnail = document.getElementById('ytThumbnail');
    if (!thumbnail) return;

    const loadPlayer = () => {
      const videoId = thumbnail.dataset.videoid;
      if (!videoId) return;

      const iframe = document.createElement('iframe');
      iframe.className = 'youtube-feature__iframe';
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = 'ThunderTasteSpring Demo';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.loading = 'lazy';

      thumbnail.replaceWith(iframe);
    };

    thumbnail.addEventListener('click', loadPlayer);
    thumbnail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        loadPlayer();
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  // Observe static .animate-in elements (skills section headings, etc.)
  initScrollAnimations();

  // Load projects async (will re-init scroll animations for dynamic cards)
  loadProjects();

  // YouTube click-to-load
  initYouTubePlayer();
});
