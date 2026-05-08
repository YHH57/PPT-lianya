(function () {
  'use strict';

  const SAFE_THEME_IDS = [
    'tokyo-night',
    'blueprint',
    'cyberpunk-neon',
    'corporate-clean',
    'aurora',
    'rose-pine',
    'engineering-whiteprint',
    'catppuccin-mocha'
  ];

  const TYPOGRAPHY_PACKS = [
    { id: 'balanced-sans', href: 'assets/randomizer/typography/balanced-sans.css', tags: ['balanced', 'dense', 'dark', 'light'] },
    { id: 'editorial-display', href: 'assets/randomizer/typography/editorial-display.css', tags: ['airy', 'dark', 'light'] },
    { id: 'mono-technical', href: 'assets/randomizer/typography/mono-technical.css', tags: ['dense', 'dark', 'technical'] }
  ];

  const MOTION_PACKS = [
    {
      id: 'calm-flow',
      href: 'assets/randomizer/motion/calm-flow.css',
      tags: ['calm', 'balanced'],
      entryPool: ['fade-up', 'fade-right', 'rise-in', 'blur-in', 'stagger-list'],
      emphasisPool: ['gradient-flow', 'shimmer-sweep', 'perspective-zoom']
    },
    {
      id: 'punchy-tech',
      href: 'assets/randomizer/motion/punchy-tech.css',
      tags: ['bold', 'technical'],
      entryPool: ['fade-left', 'drop-in', 'zoom-pop', 'card-flip-3d', 'stagger-list'],
      emphasisPool: ['neon-glow', 'spotlight', 'cube-rotate-3d']
    },
    {
      id: 'cinematic-glow',
      href: 'assets/randomizer/motion/cinematic-glow.css',
      tags: ['editorial', 'balanced'],
      entryPool: ['fade-up', 'blur-in', 'rise-in', 'page-turn-3d', 'stagger-list'],
      emphasisPool: ['gradient-flow', 'kenburns', 'ripple-reveal']
    }
  ];

  const DECOR_PACKS = [
    { id: 'mesh-glow', href: 'assets/randomizer/decor/mesh-glow.css', tags: ['dark', 'bold'] },
    { id: 'paper-grid', href: 'assets/randomizer/decor/paper-grid.css', tags: ['light', 'technical'] },
    { id: 'aurora-wash', href: 'assets/randomizer/decor/aurora-wash.css', tags: ['balanced', 'dark', 'light'] }
  ];

  const LAYOUT_PACKS = [
    { id: 'structured-balance', href: 'assets/randomizer/layout/structured-balance.css', tags: ['balanced'], variants: {
      hero: ['hero-balanced', 'hero-emphasis'],
      'card-grid': ['card-grid-balanced', 'card-grid-featured'],
      'process-flow': ['process-flow-stepped', 'process-flow-centered'],
      'metric-compare': ['metric-compare-inline', 'metric-compare-stacked']
    } },
    { id: 'editorial-sweep', href: 'assets/randomizer/layout/editorial-sweep.css', tags: ['airy'], variants: {
      hero: ['hero-wide', 'hero-metrics-first'],
      'card-grid': ['card-grid-columns', 'card-grid-bands'],
      'process-flow': ['process-flow-ribbon', 'process-flow-rail'],
      'metric-compare': ['metric-compare-spotlight', 'metric-compare-split']
    } },
    { id: 'technical-frame', href: 'assets/randomizer/layout/technical-frame.css', tags: ['dense', 'technical'], variants: {
      hero: ['hero-frame', 'hero-gridline'],
      'card-grid': ['card-grid-indexed', 'card-grid-stack'],
      'process-flow': ['process-flow-panels', 'process-flow-vertical'],
      'metric-compare': ['metric-compare-panels', 'metric-compare-matrix']
    } }
  ];

  const FAMILY_ELIGIBILITY = {
    hero: [1],
    'card-grid': [3, 4, 12, 15, 20],
    'process-flow': [5, 7, 14, 22],
    'metric-compare': [10, 17, 23]
  };

  const STYLE_MATRIX = {
    'tokyo-night': { typography: ['balanced-sans', 'mono-technical', 'editorial-display'], decor: ['mesh-glow', 'aurora-wash'], motion: ['calm-flow', 'punchy-tech', 'cinematic-glow'], layout: ['structured-balance', 'editorial-sweep', 'technical-frame'] },
    blueprint: { typography: ['mono-technical', 'balanced-sans'], decor: ['paper-grid', 'mesh-glow'], motion: ['calm-flow', 'punchy-tech'], layout: ['structured-balance', 'technical-frame'] },
    'cyberpunk-neon': { typography: ['mono-technical', 'balanced-sans'], decor: ['mesh-glow', 'aurora-wash'], motion: ['punchy-tech', 'cinematic-glow'], layout: ['technical-frame', 'structured-balance'] },
    'corporate-clean': { typography: ['balanced-sans', 'editorial-display'], decor: ['paper-grid', 'aurora-wash'], motion: ['calm-flow', 'cinematic-glow'], layout: ['structured-balance', 'editorial-sweep'] },
    aurora: { typography: ['balanced-sans', 'editorial-display'], decor: ['aurora-wash', 'mesh-glow'], motion: ['calm-flow', 'cinematic-glow'], layout: ['structured-balance', 'editorial-sweep'] },
    'rose-pine': { typography: ['editorial-display', 'balanced-sans'], decor: ['aurora-wash', 'mesh-glow'], motion: ['cinematic-glow', 'calm-flow'], layout: ['editorial-sweep', 'structured-balance'] },
    'engineering-whiteprint': { typography: ['mono-technical', 'balanced-sans'], decor: ['paper-grid', 'mesh-glow'], motion: ['calm-flow', 'punchy-tech'], layout: ['technical-frame', 'structured-balance'] },
    'catppuccin-mocha': { typography: ['balanced-sans', 'editorial-display'], decor: ['mesh-glow', 'aurora-wash'], motion: ['calm-flow', 'cinematic-glow'], layout: ['structured-balance', 'editorial-sweep'] }
  };

  function byId(list, id) {
    return list.find((item) => item.id === id) || null;
  }

  function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashSeed(input) {
    const source = String(input == null ? Date.now() : input);
    let h = 2166136261;
    for (let i = 0; i < source.length; i += 1) {
      h ^= source.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickFromIds(ids, rand, fallbackId) {
    if (!ids || !ids.length) return fallbackId;
    return ids[Math.floor(rand() * ids.length)] || fallbackId;
  }

  function chooseStyleState(seedInput) {
    const numericSeed = hashSeed(seedInput);
    const rand = mulberry32(numericSeed);
    const themeId = SAFE_THEME_IDS[Math.floor(rand() * SAFE_THEME_IDS.length)];
    const compat = STYLE_MATRIX[themeId] || STYLE_MATRIX['tokyo-night'];
    const typographyId = pickFromIds(compat.typography, rand, compat.typography[0]);
    const decorId = pickFromIds(compat.decor, rand, compat.decor[0]);
    const motionId = pickFromIds(compat.motion, rand, compat.motion[0]);
    const layoutId = pickFromIds(compat.layout, rand, compat.layout[0]);
    const layoutPack = byId(LAYOUT_PACKS, layoutId) || LAYOUT_PACKS[0];
    const layoutVariantByFamily = {};

    Object.keys(FAMILY_ELIGIBILITY).forEach((family) => {
      const variants = (layoutPack.variants && layoutPack.variants[family]) || [];
      layoutVariantByFamily[family] = variants.length
        ? variants[Math.floor(rand() * variants.length)]
        : 'default';
    });

    return {
      seed: String(seedInput == null ? numericSeed : seedInput),
      numericSeed,
      themeId,
      typographyId,
      motionId,
      decorId,
      layoutId,
      layoutVariantByFamily
    };
  }

  window.__deckRandomizerPacks = {
    safeThemeIds: SAFE_THEME_IDS.slice(),
    typography: TYPOGRAPHY_PACKS,
    motion: MOTION_PACKS,
    decor: DECOR_PACKS,
    layout: LAYOUT_PACKS,
    familyEligibility: FAMILY_ELIGIBILITY,
    byId,
    chooseStyleState
  };
})();
