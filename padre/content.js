(async function () {
  'use strict';

  const FEATURE_FLAGS_STORAGE_KEY = 'feature_flags_override_v1';
  const CUSTOM_GLOSSARY_STORAGE_KEY = 'custom_glossary_v1';
  const _defaultFeatureFlags = { ...(CONFIG.FEATURES || {}) };
  const _defaultGlossary = {
    PRESERVE_TERMS: [...(CONFIG.PRESERVE_TERMS || [])],
    EXPAND_ABBREVIATIONS: { ...(CONFIG.EXPAND_ABBREVIATIONS || {}) },
    CRYPTO_SLANG_MAP: { ...(CONFIG.CRYPTO_SLANG_MAP || {}) },
    POST_TRANSLATION_FIXES: { ...(CONFIG.POST_TRANSLATION_FIXES || {}) }
  };

  function _getKnownFeatureFlags() {
    return Object.keys(_defaultFeatureFlags);
  }

  function _applyFeatureOverrides(overrides) {
    if (!overrides || typeof overrides !== 'object') return;
    const keys = _getKnownFeatureFlags();
    for (const key of keys) {
      if (typeof overrides[key] === 'boolean') {
        CONFIG.FEATURES[key] = overrides[key];
      }
    }
  }

  function _currentFeatureFlagsSnapshot() {
    const flags = {};
    const keys = _getKnownFeatureFlags();
    for (const key of keys) {
      flags[key] = CONFIG.FEATURES?.[key] !== false;
    }
    return flags;
  }

  function _resetGlossaryToDefaults() {
    CONFIG.PRESERVE_TERMS = [..._defaultGlossary.PRESERVE_TERMS];
    CONFIG.EXPAND_ABBREVIATIONS = { ..._defaultGlossary.EXPAND_ABBREVIATIONS };
    CONFIG.CRYPTO_SLANG_MAP = { ..._defaultGlossary.CRYPTO_SLANG_MAP };
    CONFIG.POST_TRANSLATION_FIXES = { ..._defaultGlossary.POST_TRANSLATION_FIXES };
  }

  function _sanitizeStringMap(obj) {
    const out = {};
    if (!obj || typeof obj !== 'object') return out;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof k !== 'string' || typeof v !== 'string') continue;
      const kk = k.trim();
      const vv = v.trim();
      if (!kk || !vv) continue;
      out[kk] = vv;
    }
    return out;
  }

  function _normalizeGlossary(raw) {
    const g = raw && typeof raw === 'object' ? raw : {};
    const preserveRaw = Array.isArray(g.PRESERVE_TERMS) ? g.PRESERVE_TERMS : [];
    const preserveSeen = new Set();
    const preserve = [];
    for (const v of preserveRaw) {
      if (typeof v !== 'string') continue;
      const term = v.trim();
      if (!term) continue;
      const key = term.toLowerCase();
      if (preserveSeen.has(key)) continue;
      preserveSeen.add(key);
      preserve.push(term);
      if (preserve.length >= 500) break;
    }
    return {
      PRESERVE_TERMS: preserve,
      EXPAND_ABBREVIATIONS: _sanitizeStringMap(g.EXPAND_ABBREVIATIONS),
      CRYPTO_SLANG_MAP: _sanitizeStringMap(g.CRYPTO_SLANG_MAP),
      POST_TRANSLATION_FIXES: _sanitizeStringMap(g.POST_TRANSLATION_FIXES)
    };
  }

  function _applyCustomGlossary(rawGlossary) {
    const glossary = _normalizeGlossary(rawGlossary);
    _resetGlossaryToDefaults();

    if (glossary.PRESERVE_TERMS.length > 0) {
      const merged = [...CONFIG.PRESERVE_TERMS];
      const seen = new Set(merged.map(v => String(v).toLowerCase()));
      for (const term of glossary.PRESERVE_TERMS) {
        const key = term.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(term);
      }
      CONFIG.PRESERVE_TERMS = merged;
    }

    CONFIG.EXPAND_ABBREVIATIONS = {
      ...CONFIG.EXPAND_ABBREVIATIONS,
      ...glossary.EXPAND_ABBREVIATIONS
    };
    CONFIG.CRYPTO_SLANG_MAP = {
      ...CONFIG.CRYPTO_SLANG_MAP,
      ...glossary.CRYPTO_SLANG_MAP
    };
    CONFIG.POST_TRANSLATION_FIXES = {
      ...CONFIG.POST_TRANSLATION_FIXES,
      ...glossary.POST_TRANSLATION_FIXES
    };

    return glossary;
  }

  const hostname = window.location.hostname;
  const isPadre = hostname === 'trade.padre.gg' || hostname.endsWith('.padre.gg');
  if (!isPadre) return;

  const prefetchHosts = [
    'translate.googleapis.com',
    'mozhi.pussthecat.org',
    'mozhi.r4fo.com',
    'mozhi.adminforge.de',
    'mozhi.bloat.cat',
    'mozhi.ducks.party',
    'simplytranslate.org',
    'translate.plausibility.cloud',
    'api.mymemory.translated.net'
  ];
  for (const host of prefetchHosts) {
    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = '//' + host;
    document.head.appendChild(dns);
  }
  for (const host of prefetchHosts.slice(0, 8)) {
    const pc = document.createElement('link');
    pc.rel = 'preconnect';
    pc.href = 'https://' + host;
    pc.crossOrigin = 'anonymous';
    document.head.appendChild(pc);
  }

  let state;
  try {
    state = await chrome.storage.local.get(['enabled', 'stats', FEATURE_FLAGS_STORAGE_KEY, CUSTOM_GLOSSARY_STORAGE_KEY]);
  } catch (err) {
    state = {};
  }
  let isEnabled = state.enabled !== false;
  _applyFeatureOverrides(state[FEATURE_FLAGS_STORAGE_KEY]);
  _applyCustomGlossary(state[CUSTOM_GLOSSARY_STORAGE_KEY]);

  const cache = new LRUCache();
  const diagnostics = new Diagnostics();
  await cache.loadFromStorage().catch(() => {});
  diagnostics.load().catch(() => {});

  const translator = new TranslationService(cache, diagnostics);

  if (state.stats) {
    Object.assign(translator.stats, state.stats);
  }

  const ui = new TranslationUI();
  const observer = new TweetObserver(translator, cache, ui, diagnostics);

  if (isEnabled) {
    try {
      chrome.runtime.sendMessage({
        type: 'PROXY_FETCH',
        url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=hi'
      }, () => {});
    } catch (e) {}
    try {
      for (const host of CONFIG.APIS.MOZHI.instances) {
        fetch(host + '/api/translate?engine=' + CONFIG.APIS.MOZHI.engine + '&from=en&to=ru&text=hi', {
          method: 'GET', credentials: 'omit'
        }).catch(() => {});
      }
      fetch(CONFIG.APIS.SIMPLYTRANSLATE.url + '?engine=google&from=en&to=ru&text=hi', {
        method: 'GET', credentials: 'omit'
      }).catch(() => {});
      for (const host of CONFIG.APIS.LINGVA.instances) {
        fetch(host + '/api/v1/en/ru/hi', {
          method: 'GET', credentials: 'omit'
        }).catch(() => {});
      }
    } catch (e) {}

    observer.start();

    setInterval(() => {
      if (!isEnabled) return;
      try {
        chrome.runtime.sendMessage({
          type: 'PROXY_FETCH',
          url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=ok'
        }, () => {});
      } catch (e) {}
      const mozhiHosts = CONFIG.APIS.MOZHI.instances;
      const idx = Math.floor(Math.random() * mozhiHosts.length);
      fetch(mozhiHosts[idx] + '/api/translate?engine=' + CONFIG.APIS.MOZHI.engine + '&from=en&to=ru&text=ok', {
        method: 'GET', credentials: 'omit'
      }).catch(() => {});
    }, 60000);
  }

  if (!chrome.runtime?.id) return;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'TOGGLE_TRANSLATION':
        isEnabled = message.enabled;
        observer.setEnabled(isEnabled);
        if (isEnabled) {
          observer.start();
        } else {
          observer.stop();
        }
        sendResponse({ ok: true });
        break;

      case 'CLEAR_CACHE':
        cache.clear();
        translator.stats.cached = 0;
        sendResponse({ ok: true });
        break;

      case 'GET_STATUS':
        sendResponse({
          enabled: isEnabled,
          stats: { ...translator.stats },
          cacheSize: cache.size,
          apis: translator.getApiStatuses(),
          providerPerf: translator.getProviderPerformance(10),
          flags: translator.getFeatureFlags()
        });
        break;

      case 'SET_FEATURE_FLAGS': {
        _applyFeatureOverrides(message.flags || {});
        translator.refreshFeatureFlags();
        const flags = _currentFeatureFlagsSnapshot();
        chrome.storage.local.set({ [FEATURE_FLAGS_STORAGE_KEY]: flags })
          .then(() => sendResponse({ ok: true, flags }))
          .catch(err => sendResponse({ error: err.message }));
        break;
      }

      case 'RESET_FEATURE_FLAGS': {
        for (const key of _getKnownFeatureFlags()) {
          CONFIG.FEATURES[key] = _defaultFeatureFlags[key];
        }
        translator.refreshFeatureFlags();
        chrome.storage.local.remove(FEATURE_FLAGS_STORAGE_KEY)
          .then(() => sendResponse({ ok: true, flags: translator.getFeatureFlags() }))
          .catch(err => sendResponse({ error: err.message }));
        break;
      }

      case 'GET_CUSTOM_GLOSSARY': {
        chrome.storage.local.get(CUSTOM_GLOSSARY_STORAGE_KEY)
          .then(data => {
            const glossary = _normalizeGlossary(data[CUSTOM_GLOSSARY_STORAGE_KEY]);
            sendResponse({ glossary });
          })
          .catch(err => sendResponse({ error: err.message }));
        break;
      }

      case 'SET_CUSTOM_GLOSSARY': {
        const glossary = _normalizeGlossary(message.glossary || {});
        _applyCustomGlossary(glossary);
        translator.refreshFeatureFlags();
        chrome.storage.local.set({ [CUSTOM_GLOSSARY_STORAGE_KEY]: glossary })
          .then(() => sendResponse({ ok: true, glossary }))
          .catch(err => sendResponse({ error: err.message }));
        break;
      }

      case 'RESET_CUSTOM_GLOSSARY': {
        _resetGlossaryToDefaults();
        translator.refreshFeatureFlags();
        chrome.storage.local.remove(CUSTOM_GLOSSARY_STORAGE_KEY)
          .then(() => sendResponse({ ok: true, glossary: _normalizeGlossary({}) }))
          .catch(err => sendResponse({ error: err.message }));
        break;
      }

      case 'GET_DIAGNOSTICS':
        sendResponse(diagnostics.generateReport());
        break;

      case 'EXPORT_MEMORY':
        sendResponse({ text: diagnostics.generateMemoryUpdate() });
        break;

      case 'GET_UNKNOWN_TERMS':
        sendResponse(translator.getUnknownTermsReport(150));
        break;

      case 'RESET_UNKNOWN_TERMS':
        translator.resetUnknownTerms()
          .then(() => sendResponse({ ok: true }))
          .catch(err => sendResponse({ error: err.message }));
        break;

      case 'RESET_PROVIDER_PERF':
        translator.resetProviderPerformance()
          .then(() => sendResponse({ ok: true }))
          .catch(err => sendResponse({ error: err.message }));
        break;

      case 'RESET_DIAGNOSTICS':
        diagnostics.reset().then(() => sendResponse({ ok: true }));
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
        break;
    }
    return true;
  });

  let lastUrl = location.href;
  let navigationTimer = null;

  function handleNavigation() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    if (isEnabled) {
      observer.stop();

      if (navigationTimer) clearTimeout(navigationTimer);
      navigationTimer = setTimeout(() => {
        navigationTimer = null;
        if (isEnabled) observer.start();
      }, 150);
    }
  }

  const origPushState = history.pushState;
  const origReplaceState = history.replaceState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    handleNavigation();
  };
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    handleNavigation();
  };
  window.addEventListener('popstate', handleNavigation);

})();
