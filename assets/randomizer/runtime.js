(function () {
  'use strict';

  const packs = window.__deckRandomizerPacks;
  if (!packs) return;

  const LINK_IDS = {
    typography: 'style-pack-typography',
    motion: 'style-pack-motion',
    decor: 'style-pack-decor',
    layout: 'style-pack-layout'
  };

  const LAYOUT_FAMILY_MAP = {
    1: 'hero',
    3: 'card-grid',
    4: 'card-grid',
    5: 'process-flow',
    7: 'process-flow',
    10: 'metric-compare',
    12: 'card-grid',
    14: 'process-flow',
    15: 'card-grid',
    17: 'metric-compare',
    20: 'card-grid',
    22: 'process-flow',
    23: 'metric-compare'
  };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function ensureStylesheet(id, href) {
    if (!href) return null;
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = href;
    return link;
  }

  function applyStylesheetState(styleState) {
    if (!styleState) return;
    const typography = packs.byId(packs.typography, styleState.typographyId);
    const motion = packs.byId(packs.motion, styleState.motionId);
    const decor = packs.byId(packs.decor, styleState.decorId);
    const layout = packs.byId(packs.layout, styleState.layoutId);
    ensureStylesheet(LINK_IDS.typography, typography && typography.href);
    ensureStylesheet(LINK_IDS.motion, motion && motion.href);
    ensureStylesheet(LINK_IDS.decor, decor && decor.href);
    ensureStylesheet(LINK_IDS.layout, layout && layout.href);
  }

  function applyLayoutAttributes(styleState) {
    const root = document.documentElement;
    root.setAttribute('data-style-seed', styleState.seed);
    root.setAttribute('data-typography-pack', styleState.typographyId);
    root.setAttribute('data-motion-pack', styleState.motionId);
    root.setAttribute('data-decor-pack', styleState.decorId);
    root.setAttribute('data-layout-pack', styleState.layoutId);

    const slides = document.querySelectorAll('.deck .slide');
    slides.forEach((slide, index) => {
      const family = LAYOUT_FAMILY_MAP[index + 1] || '';
      if (family) {
        slide.setAttribute('data-layout-family', family);
        slide.setAttribute('data-layout-variant', styleState.layoutVariantByFamily[family] || 'default');
      } else {
        slide.removeAttribute('data-layout-family');
        slide.removeAttribute('data-layout-variant');
      }
    });
  }

  function resolveSeedFromUrl() {
    const params = new URLSearchParams(window.location.search || '');
    return params.get('styleSeed');
  }

  function replayCurrentSlide() {
    const active = document.querySelector('.deck .slide.is-active') || document.querySelector('.deck .slide');
    if (!active) return;
    active.querySelectorAll('[data-anim]').forEach((el) => {
      const value = el.getAttribute('data-anim');
      if (!value) return;
      el.classList.remove('anim-' + value);
      void el.offsetWidth;
      el.classList.add('anim-' + value);
    });
    if (typeof window.__hpxReinit === 'function') {
      window.__hpxReinit(active);
    }
  }

  function applyMotionAssignments(styleState) {
    const motion = packs.byId(packs.motion, styleState.motionId);
    if (!motion) return;
    const entryPool = motion.entryPool || [];
    const emphasisPool = motion.emphasisPool || [];
    const slides = Array.from(document.querySelectorAll('.deck .slide'));

    slides.forEach((slide, slideIndex) => {
      const target = slide.querySelector('[data-anim-target]') || slide.querySelector('[data-anim]') || null;
      if (target && entryPool.length) {
        const anim = entryPool[slideIndex % entryPool.length];
        const previous = target.getAttribute('data-anim');
        if (previous) target.classList.remove('anim-' + previous);
        target.setAttribute('data-anim', anim);
        target.classList.add('anim-' + anim);
      }

      if (emphasisPool.length) {
        const hero = slide.querySelector('.gradient-text, .quote-line, .engine-word');
        if (hero) {
          hero.classList.remove(...emphasisPool.map((name) => 'anim-' + name));
          const anim = emphasisPool[(slideIndex * 2) % emphasisPool.length];
          hero.classList.add('anim-' + anim);
        }
      }
    });
  }

  function injectButtons() {
    document.querySelectorAll('.deck .slide').forEach((slide) => {
      if (slide.querySelector('.style-randomizer-button')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'style-randomizer-button';
      button.setAttribute('aria-label', '随机切换演示风格');
      button.innerHTML = '<span class="style-randomizer-glyph">+</span>';
      slide.appendChild(button);
    });
  }

  function normalizeState(styleState) {
    if (!styleState) return null;
    return {
      seed: String(styleState.seed),
      numericSeed: Number(styleState.numericSeed || packs.chooseStyleState(styleState.seed).numericSeed),
      themeId: styleState.themeId,
      typographyId: styleState.typographyId,
      motionId: styleState.motionId,
      decorId: styleState.decorId,
      layoutId: styleState.layoutId,
      layoutVariantByFamily: Object.assign({}, styleState.layoutVariantByFamily || {})
    };
  }

  function setStyleState(styleState, options) {
    const root = document.documentElement;
    const normalized = normalizeState(styleState);
    if (!normalized) return null;
    window.__deckStyleState = normalized;
    applyStylesheetState(normalized);
    applyLayoutAttributes(normalized);
    applyMotionAssignments(normalized);
    if (typeof window.__deckApplyTheme === 'function') {
      window.__deckApplyTheme(normalized.themeId);
    }
    if (!options || !options.skipReplay) replayCurrentSlide();
    root.dispatchEvent(new CustomEvent('deck:style-state-change', { detail: normalized }));
    return normalized;
  }

  function randomizeStyleState(seedOverride) {
    const seed = seedOverride == null ? String(Date.now()) : String(seedOverride);
    const next = packs.chooseStyleState(seed);
    return setStyleState(next);
  }

  ready(function () {
    injectButtons();
    const initialSeed = resolveSeedFromUrl();
    const initialState = packs.chooseStyleState(initialSeed || Date.now());
    setStyleState(initialState, { skipReplay: true });

    document.addEventListener('click', function (event) {
      const button = event.target.closest('.style-randomizer-button');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const state = randomizeStyleState(Date.now());
      if (typeof window.__deckBroadcastStyleState === 'function') {
        window.__deckBroadcastStyleState(state);
      }
    });
  });

  window.__deckSetStyleState = setStyleState;
  window.__deckRandomizeStyleState = randomizeStyleState;
})();
