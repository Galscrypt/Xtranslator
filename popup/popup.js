document.addEventListener('DOMContentLoaded', async () => {
  const CUSTOM_GLOSSARY_STORAGE_KEY = 'custom_glossary_v1';
  const CUSTOM_GLOSSARY_DRAFT_KEY = 'custom_glossary_draft_v1';
  const FEATURE_FLAGS_STORAGE_KEY = 'feature_flags_override_v1';
  const toggle = document.getElementById('toggleEnabled');
  const resetUnknownBtn = document.getElementById('resetUnknownBtn');
  const resetProviderPerfBtn = document.getElementById('resetProviderPerfBtn');
  const resetGlossaryBtn = document.getElementById('resetGlossaryBtn');
  const resetFlagsBtn = document.getElementById('resetFlagsBtn');
  const glossaryJson = document.getElementById('glossaryJson');
  const loadGlossaryBtn = document.getElementById('loadGlossaryBtn');
  const applyGlossaryBtn = document.getElementById('applyGlossaryBtn');
  const actionStatus = document.getElementById('actionStatus');

  const versionEl = document.getElementById('extVersion');
  if (versionEl) {
    const ver = chrome.runtime.getManifest?.()?.version;
    if (ver) versionEl.textContent = 'v' + ver;
  }

  let liveDataLoaded = false;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && isSupportedTab(tab.url)) {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' });
      if (response) {
        toggle.checked = response.enabled;
        liveDataLoaded = true;
      }
    }
  } catch (err) { /* tab query */ }

  if (!liveDataLoaded) {
    const state = await chrome.storage.local.get(['enabled']);
    toggle.checked = state.enabled !== false;
  }

  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.local.set({ enabled });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_TRANSLATION',
          enabled
        });
      }
    } catch (err) { /* toggle send */ }
  });

  function setActionStatus(text, isError = false) {
    if (!actionStatus) return;
    actionStatus.textContent = text || '';
    actionStatus.style.color = isError ? '#fca5a5' : '#818193';
  }

  function emptyGlossaryTemplate() {
    return {
      PRESERVE_TERMS: [],
      EXPAND_ABBREVIATIONS: {},
      CRYPTO_SLANG_MAP: {},
      POST_TRANSLATION_FIXES: {}
    };
  }

  function setGlossaryEditorValue(glossaryObj) {
    if (!glossaryJson) return;
    const safe = glossaryObj && typeof glossaryObj === 'object' ? glossaryObj : emptyGlossaryTemplate();
    glossaryJson.value = JSON.stringify(safe, null, 2);
  }

  async function saveGlossaryDraft() {
    if (!glossaryJson) return;
    await chrome.storage.local.set({ [CUSTOM_GLOSSARY_DRAFT_KEY]: glossaryJson.value || '' });
  }

  async function loadGlossaryDraft() {
    const data = await chrome.storage.local.get(CUSTOM_GLOSSARY_DRAFT_KEY);
    return typeof data?.[CUSTOM_GLOSSARY_DRAFT_KEY] === 'string' ? data[CUSTOM_GLOSSARY_DRAFT_KEY] : '';
  }

  async function loadGlossaryFromStorage() {
    const data = await chrome.storage.local.get(CUSTOM_GLOSSARY_STORAGE_KEY);
    const glossary = data?.[CUSTOM_GLOSSARY_STORAGE_KEY];
    setGlossaryEditorValue(glossary || emptyGlossaryTemplate());
  }

  setGlossaryEditorValue(emptyGlossaryTemplate());
  try {
    await loadGlossaryFromStorage();
    const draft = await loadGlossaryDraft();
    if (draft && glossaryJson) {
      glossaryJson.value = draft;
    }
  } catch (err) {
    /* ignore storage load errors */
  }

  if (glossaryJson) {
    let draftTimer = null;
    glossaryJson.addEventListener('input', () => {
      if (draftTimer) clearTimeout(draftTimer);
      draftTimer = setTimeout(() => {
        saveGlossaryDraft().catch(() => {});
      }, 250);
    });
  }

  async function sendToActiveTab(message) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !isSupportedTab(tab.url)) {
      throw new Error('Open Axiom or Padre tab first');
    }
    try {
      return await chrome.tabs.sendMessage(tab.id, message);
    } catch (err) {
      const msg = (err && err.message) ? err.message : String(err || '');
      if (msg.includes('Receiving end does not exist')) {
        throw new Error('Reload the site tab, then try again');
      }
      throw err;
    }
  }

  async function runTabAction(progressText, successText, message, onSuccess) {
    setActionStatus(progressText);
    try {
      const resp = await sendToActiveTab(message);
      if (resp?.error) {
        setActionStatus(resp.error, true);
        return;
      }
      if (typeof onSuccess === 'function') onSuccess(resp);
      setActionStatus(successText);
    } catch (err) {
      setActionStatus(err.message || 'Action failed', true);
    }
  }

  if (resetUnknownBtn) {
    resetUnknownBtn.addEventListener('click', async () => {
      await runTabAction('Resetting slang log...', 'Slang log reset', { type: 'RESET_UNKNOWN_TERMS' });
    });
  }

  if (resetProviderPerfBtn) {
    resetProviderPerfBtn.addEventListener('click', async () => {
      await runTabAction('Resetting API rank...', 'API rank reset', { type: 'RESET_PROVIDER_PERF' });
    });
  }

  if (resetGlossaryBtn) {
    resetGlossaryBtn.addEventListener('click', async () => {
      setActionStatus('Resetting custom glossary...');
      try {
        await chrome.storage.local.remove([CUSTOM_GLOSSARY_STORAGE_KEY, CUSTOM_GLOSSARY_DRAFT_KEY]);
      } catch (err) {
        setActionStatus(err.message || 'Reset failed', true);
        return;
      }

      try {
        const resp = await sendToActiveTab({ type: 'RESET_CUSTOM_GLOSSARY' });
        if (resp?.error) {
          setActionStatus(resp.error, true);
          return;
        }
        setGlossaryEditorValue(emptyGlossaryTemplate());
        await saveGlossaryDraft();
        setActionStatus('Custom glossary reset');
      } catch (err) {
        setGlossaryEditorValue(emptyGlossaryTemplate());
        await saveGlossaryDraft();
        setActionStatus('Custom glossary reset (saved)');
      }
    });
  }

  if (loadGlossaryBtn) {
    loadGlossaryBtn.addEventListener('click', async () => {
      setActionStatus('Loading glossary...');
      try {
        await loadGlossaryFromStorage();
        await saveGlossaryDraft();
        setActionStatus('Glossary loaded');
      } catch (err) {
        setActionStatus(err.message || 'Load failed', true);
      }
    });
  }

  if (applyGlossaryBtn) {
    applyGlossaryBtn.addEventListener('click', async () => {
      if (!glossaryJson) return;
      let parsed;
      try {
        parsed = JSON.parse(glossaryJson.value || '{}');
      } catch (err) {
        setActionStatus('Invalid JSON', true);
        return;
      }

      const glossaryPayload = (parsed && typeof parsed === 'object' && parsed.glossary && typeof parsed.glossary === 'object')
        ? parsed.glossary
        : parsed;

      setActionStatus('Applying glossary...');
      try {
        // Persist glossary even if supported site tab is not currently open.
        await chrome.storage.local.set({ [CUSTOM_GLOSSARY_STORAGE_KEY]: glossaryPayload });
      } catch (err) {
        setActionStatus(err.message || 'Save failed', true);
        return;
      }

      try {
        const resp = await sendToActiveTab({ type: 'SET_CUSTOM_GLOSSARY', glossary: glossaryPayload });
        if (resp?.error) {
          setGlossaryEditorValue(glossaryPayload);
          await saveGlossaryDraft();
          setActionStatus(resp.error, true);
          return;
        }
        setGlossaryEditorValue(resp?.glossary || glossaryPayload);
        await saveGlossaryDraft();
        setActionStatus('Glossary applied');
      } catch (err) {
        setGlossaryEditorValue(glossaryPayload);
        await saveGlossaryDraft();
        setActionStatus('Glossary saved. Open Axiom/Padre tab to apply');
      }
    });
  }

  if (resetFlagsBtn) {
    resetFlagsBtn.addEventListener('click', async () => {
      setActionStatus('Resetting feature flags...');
      try {
        await chrome.storage.local.remove(FEATURE_FLAGS_STORAGE_KEY);
      } catch (err) {
        setActionStatus(err.message || 'Reset failed', true);
        return;
      }

      try {
        const resp = await sendToActiveTab({ type: 'RESET_FEATURE_FLAGS' });
        if (resp?.error) {
          setActionStatus(resp.error, true);
          return;
        }
        setActionStatus('Feature flags reset');
      } catch (err) {
        setActionStatus('Feature flags reset (saved)');
      }
    });
  }

  function isSupportedTab(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname === 'axiom.trade' || hostname.endsWith('.axiom.trade')
          || hostname === 'trade.padre.gg' || hostname.endsWith('.padre.gg');
    } catch { return false; }
  }
});
