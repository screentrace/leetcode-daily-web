/**
 * Referral landing: reads code from /r/<CODE> (often via 404.html on GitHub Pages),
 * ?code=, or #fragment. Used by r/index.html and 404.html.
 */
(function (global) {
  'use strict';

  var APP_STORE = 'https://apps.apple.com/app/id6756704733';
  var PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.screentrace.leetcodedaily';

  var MAX_CODE_LEN = 128;

  function getReferralCode() {
    var path = location.pathname || '';
    var m = path.match(/^\/r\/([^/]+)\/?$/);
    if (m && m[1]) {
      var seg = m[1];
      if (seg.toLowerCase() === 'index.html') return null;
      try {
        return decodeURIComponent(seg).trim();
      } catch (e) {
        return seg.trim();
      }
    }
    var params = new URLSearchParams(location.search);
    var q = params.get('code');
    if (q && String(q).trim()) return String(q).trim();
    var h = (location.hash || '').replace(/^#/, '').replace(/^\/+/, '');
    if (h) {
      try {
        return decodeURIComponent(h).trim();
      } catch (e2) {
        return h.trim();
      }
    }
    return null;
  }

  function escapeHtml(text) {
    var d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  function truncateDisplay(code) {
    if (!code || code.length <= MAX_CODE_LEN) return code;
    return code.slice(0, MAX_CODE_LEN) + '…';
  }

  function storeButtonsHtml() {
    return (
      '<div class="store-buttons">' +
      '<a href="' + APP_STORE + '" class="store-btn" target="_blank" rel="noopener" aria-label="Download on the App Store">' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>' +
      '<span class="store-btn-text"><span class="store-btn-label">Download on the</span>App Store</span></a>' +
      '<a href="' + PLAY_STORE + '" class="store-btn" target="_blank" rel="noopener" aria-label="Get it on Google Play">' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg>' +
      '<span class="store-btn-text"><span class="store-btn-label">Get it on</span>Google Play</span></a>' +
      '</div>'
    );
  }

  function bindCopyButton(rawCode) {
    var btn = document.getElementById('referral-copy-btn');
    var label = document.getElementById('referral-copy-label');
    if (!btn || !label || !rawCode) return;

    function setCopied() {
      label.textContent = 'Copied!';
      setTimeout(function () {
        label.textContent = 'Copy code';
      }, 2000);
    }

    function copyFallback() {
      var ta = document.createElement('textarea');
      ta.value = rawCode;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
      setCopied();
    }

    btn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(rawCode).then(setCopied).catch(copyFallback);
      } else {
        copyFallback();
      }
    });
  }

  function render(container, rawCode) {
    var display = rawCode ? truncateDisplay(rawCode) : '';
    var codeBlock = rawCode
      ? '<div class="referral-code" id="referral-code-value" aria-live="polite">' + escapeHtml(display) + '</div>'
      : '<div class="referral-code referral-code--placeholder" id="referral-code-value">—</div>';

    var copyBtn = rawCode
      ? '<button type="button" class="referral-copy-btn btn-home" id="referral-copy-btn" aria-label="Copy referral code to clipboard">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
        '<span id="referral-copy-label">Copy code</span></button>'
      : '';

    var hint = rawCode
      ? '<p class="referral-hint">Download the app and enter this code when prompted.</p>'
      : '<p class="referral-hint">Have an invite link? Open it on this device to see your code, or enter a friend\'s code in the app after you install.</p>';

    container.innerHTML =
      '<div class="referral-inner">' +
      '<p class="referral-invite">You\'ve been invited to LeetCode Daily</p>' +
      codeBlock +
      copyBtn +
      hint +
      storeButtonsHtml() +
      '</div>';

    if (rawCode) bindCopyButton(rawCode);
  }

  function init(container) {
    if (!container) return;
    var code = getReferralCode();
    render(container, code);
    if (code) {
      document.title = "You're invited — LeetCode Daily";
    }
  }

  global.Referral = {
    getCode: getReferralCode,
    init: init
  };
})(typeof window !== 'undefined' ? window : this);
