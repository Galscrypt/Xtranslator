class TranslationUI {
  constructor() {
    this._injectStyles();
    this._setupGlobalToggle();
  }

  _injectStyles() {
    const style = document.createElement('style');
    style.id = 'padre-translator-styles';
    style.textContent = `
      [data-translated="pending"] {
        opacity: ${CONFIG.UI.TRANSLATION_PENDING_OPACITY};
        transition: opacity 0.2s ease;
      }
      [data-translated="true"] {
        position: relative;
        opacity: 1;
        transition: opacity 0.2s ease;
      }
      [data-translated="true"]::after {
        content: 'X';
        position: absolute;
        top: -6px;
        right: -8px;
        font-size: 7px;
        font-weight: 700;
        background: #0f1419;
        border: 1px solid #3a4553;
        color: white;
        padding: 1px 3px;
        border-radius: 3px;
        opacity: 0.95;
        pointer-events: none;
        line-height: 1.2;
        letter-spacing: 0.5px;
        z-index: 10;
      }
      [data-translated="original"] {
        position: relative;
      }
      [data-translated="original"]::after {
        content: 'EN';
        position: absolute;
        top: -6px;
        right: -8px;
        font-size: 7px;
        font-weight: 700;
        background: #6b7280;
        color: white;
        padding: 1px 3px;
        border-radius: 3px;
        opacity: 0.8;
        pointer-events: none;
        line-height: 1.2;
        letter-spacing: 0.5px;
        z-index: 10;
      }
      [data-translated="failed"] {
        opacity: 1;
      }
      [data-translated="true"]:hover,
      [data-translated="original"]:hover {
        cursor: pointer;
        text-decoration-line: underline;
        text-decoration-style: dotted;
        text-decoration-color: rgba(255, 255, 255, 0.9);
        text-underline-offset: 3px;
      }
      .axiom-tx-panel {
        padding: 6px 10px;
        margin: 4px 0 0 0;
        border-top: 1px solid rgba(124, 58, 237, 0.2);
        font: inherit;
        line-height: inherit;
        color: inherit;
        cursor: pointer;
        position: relative;
      }
      .axiom-tx-panel[data-translated="true"]::after {
        content: 'X';
        position: absolute;
        top: -6px;
        right: -4px;
        font-size: 7px;
        font-weight: 700;
        background: #0f1419;
        border: 1px solid #3a4553;
        color: white;
        padding: 1px 3px;
        border-radius: 3px;
        opacity: 0.95;
        pointer-events: none;
        line-height: 1.2;
        letter-spacing: 0.5px;
        z-index: 10;
      }
      .axiom-tx-panel:hover {
        text-decoration-line: underline;
        text-decoration-style: dotted;
        text-decoration-color: rgba(255, 255, 255, 0.9);
        text-underline-offset: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  _setupGlobalToggle() {
    const self = this;
    const getEventElement = (e) => {
      const t = e.target;
      if (t instanceof Element) return t;
      if (t && t.parentElement) return t.parentElement;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      for (const node of path) {
        if (node instanceof Element) return node;
      }
      return null;
    };

    const getPath = (e) => {
      if (typeof e.composedPath === 'function') {
        const p = e.composedPath();
        if (Array.isArray(p) && p.length > 0) return p;
      }
      const fallback = [];
      let n = getEventElement(e);
      while (n) {
        fallback.push(n);
        n = n.parentElement;
      }
      return fallback;
    };

    const findTranslatedTargetInPath = (path) => {
      for (const node of path) {
        if (!(node instanceof Element)) continue;
        const st = node.dataset?.translated;
        if (st === 'true' || st === 'original' || st === 'panel') return node;
        const hasHtmlPair = node.hasAttribute('data-original-html') && node.hasAttribute('data-translated-html');
        const hasTextPair = node.hasAttribute('data-original-text') && node.hasAttribute('data-translated-text');
        if (hasHtmlPair || hasTextPair) return node;
      }
      return null;
    };

    const findAnchorInPath = (path) => {
      for (const node of path) {
        if (!(node instanceof Element)) continue;
        if (node.tagName === 'A' && node.hasAttribute('href')) return node;
      }
      return null;
    };

    const getToggleTarget = (e) => {
      const path = getPath(e);
      const el = findTranslatedTargetInPath(path);
      if (!el) return null;

      const anchor = findAnchorInPath(path);
      if (anchor && el.contains(anchor)) {
        const anchorTextRaw = (anchor.textContent || '').trim();
        const anchorText = anchorTextRaw.toLowerCase();
        const isUrlLikeText =
          /^https?:\/\/\S+$/i.test(anchorText) ||
          /^(www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i.test(anchorText);
        const hasSpaces = /\s/.test(anchorTextRaw);
        const isLikelyWrapper = anchorTextRaw.length > 90 || hasSpaces;
        if (isUrlLikeText && !isLikelyWrapper) return null;
      }
      return el;
    };

    const performToggle = (el) => {
      const now = Date.now();
      if (el._txLastToggle && now - el._txLastToggle < 220) return;
      el._txLastToggle = now;

      if (el.dataset.translated === 'panel') {
        const panel = el.nextElementSibling;
        if (panel && panel.classList.contains('axiom-tx-panel')) {
          self._togglePanel(panel);
          return;
        }
      }

      if (el.classList.contains('axiom-tx-panel')) {
        self._togglePanel(el);
      } else {
        self._toggleText(el);
      }
    };

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      const el = getToggleTarget(e);
      if (!el) return;
      e.stopPropagation();
      e.preventDefault();
      performToggle(el);
    };

    const onClick = (e) => {
      const el = getToggleTarget(e);
      if (!el) return;
      e.stopPropagation();
      e.preventDefault();
      performToggle(el);
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('click', onClick, true);
    document.addEventListener('click', onClick, true);

    const suppress = (e) => {
      if (getToggleTarget(e)) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    window.addEventListener('pointerup', suppress, true);
    document.addEventListener('pointerup', suppress, true);
    window.addEventListener('mousedown', suppress, true);
    document.addEventListener('mousedown', suppress, true);
    window.addEventListener('mouseup', suppress, true);
    document.addEventListener('mouseup', suppress, true);
    window.addEventListener('click', suppress, true);
    document.addEventListener('click', suppress, true);
  }

  showTranslating(element) {
    element.dataset.translated = 'pending';
  }

  showTranslated(element) {
    element.dataset.translated = 'true';
  }

  showFailed(element) {
    element.dataset.translated = 'failed';
  }

  _togglePanel(panel) {
    panel.dataset.userToggled = '1';
    if (panel.dataset.translated === 'true') {
      panel.style.display = 'none';
      panel.dataset.translated = 'original';
    } else {
      panel.style.display = '';
      panel.dataset.translated = 'true';
    }
  }

  _toggleText(element) {
    let status = element.dataset.translated;
    if (status !== 'true' && status !== 'original') {
      const originalHtml = element.dataset.originalHtml;
      const translatedHtml = element.dataset.translatedHtml;
      const originalText = element.dataset.originalText;
      const translatedText = element.dataset.translatedText;

      if (originalHtml && translatedHtml) {
        const current = element.innerHTML;
        if (current === translatedHtml) status = 'true';
        else if (current === originalHtml) status = 'original';
      } else if (originalText && translatedText) {
        const current = element.textContent;
        if (current === translatedText) status = 'true';
        else if (current === originalText) status = 'original';
      }
    }
    if (status !== 'true' && status !== 'original') return;

    element.dataset.userToggled = '1';

    const isTranslated = status === 'true';
    const newState = isTranslated ? 'original' : 'true';

    const canUpdateClean = typeof cleanTweetText === 'function' && typeof getFullTextContent === 'function';

    const nodes = element._txNodes;
    const orig = element._txOriginal;
    const trans = element._txTranslated;

    if (nodes && orig && trans &&
        nodes.length === orig.length && nodes.length === trans.length) {
      if (nodes.every(n => n.isConnected)) {
        const targetTexts = isTranslated ? orig : trans;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].textContent = targetTexts[i];
        }
        element.dataset.translated = newState;
        element.dataset.translatedAt = String(Date.now());
        if (canUpdateClean) element.dataset.cleanedFullText = cleanTweetText(getFullTextContent(element));
        return;
      }
      delete element._txNodes;
      delete element._txOriginal;
      delete element._txTranslated;
    }

    const originalHtml = element.dataset.originalHtml;
    const translatedHtml = element.dataset.translatedHtml;

    if (originalHtml && translatedHtml) {
      element.innerHTML = isTranslated ? originalHtml : translatedHtml;
      element.dataset.translated = newState;
      element.dataset.translatedAt = String(Date.now());
      if (canUpdateClean) element.dataset.cleanedFullText = cleanTweetText(getFullTextContent(element));
      delete element._txNodes;
      delete element._txOriginal;
      delete element._txTranslated;
      return;
    }

    const originalText = element.dataset.originalText;
    const translatedText = element.dataset.translatedText;
    if (!originalText || !translatedText) return;

    element.textContent = isTranslated ? originalText : translatedText;
    element.dataset.translated = newState;
    element.dataset.translatedAt = String(Date.now());
    if (canUpdateClean) element.dataset.cleanedFullText = cleanTweetText(getFullTextContent(element));
  }
}
