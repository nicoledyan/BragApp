(function () {
  'use strict';
  var config = window.BRAG_ANALYTICS;
  if (!config?.token || !config?.host) return;
  // Local previews never load the SDK or send analytics.
  if (!['bragbag.app', 'www.bragbag.app'].includes(location.hostname)) return;

  var consentKey = 'brag_website_analytics';
  var client;
  var loading = false;
  var queue = [];
  var allowed = false;
  var panel;
  var events = ['$pageview', '$pageleave', 'app_store_clicked', 'template_copied', 'resource_downloaded'];
  var attribution = {};
  var query = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
    var value = query.get(key);
    if (value && /^[a-z0-9_-]{1,80}$/i.test(value)) attribution[key] = value;
  });
  var referrer = '';
  try { referrer = new URL(document.referrer).hostname; } catch (_) {}

  function readChoice() {
    try { return localStorage.getItem(consentKey); } catch (_) { return null; }
  }
  function remember(choice) {
    try { localStorage.setItem(consentKey, choice); } catch (_) {}
  }
  function baseProperties() {
    return Object.assign({ site: 'bragbag.app', page_path: location.pathname, referrer_host: referrer || 'direct' }, attribution);
  }
  function scrub(event) {
    if (!allowed || !event || !events.includes(event.event)) return null;
    var original = event.properties || {};
    var safe = Object.assign({}, baseProperties());
    // Keep SDK identity/session metadata, but never full URLs, query strings,
    // arbitrary DOM text, clipboard contents, or user-entered data.
    ['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$lib', '$lib_version', '$process_person_profile', '$is_identified', '$browser', '$browser_version', '$os', '$os_version', '$device_type', '$screen_width', '$screen_height', 'button_location', 'resource'].forEach(function (key) {
      if (original[key] !== undefined) safe[key] = original[key];
    });
    safe.$host = location.host;
    safe.$pathname = location.pathname;
    safe.$current_url = location.origin + location.pathname;
    safe.$referrer = referrer ? 'https://' + referrer + '/' : '';
    safe.$referring_domain = referrer || '$direct';
    event.properties = safe;
    return event;
  }
  window.bragTrack = function (name, properties) {
    if (!allowed || !events.includes(name)) return;
    if (client) client.capture(name, Object.assign(baseProperties(), properties));
    else if (loading) queue.push([name, properties]);
  };
  function start() {
    allowed = true;
    // Keep the original source through internal guide navigation in this tab.
    try {
      var saved = JSON.parse(sessionStorage.getItem('brag_website_source') || 'null');
      if (saved && !Object.keys(attribution).length && (!referrer || ['bragbag.app', 'www.bragbag.app'].includes(referrer))) {
        attribution = saved.campaign || {};
        referrer = saved.referrer || '';
      }
      sessionStorage.setItem('brag_website_source', JSON.stringify({ campaign: attribution, referrer: referrer }));
    } catch (_) {}
    if (client) {
      client.opt_in_capturing({ captureEventName: false });
      window.bragTrack('$pageview');
      return;
    }
    if (loading) return;
    loading = true;
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = config.host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    script.onerror = function () { loading = false; queue = []; };
    script.onload = function () {
      // A visitor can decline while the SDK is still loading.
      if (!allowed || !window.posthog?.init) { loading = false; queue = []; return; }
      window.posthog.init(config.token, {
        api_host: config.host,
        defaults: '2026-08-30',
        persistence: 'localStorage',
        opt_out_capturing_persistence_type: 'localStorage',
        person_profiles: 'identified_only',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
        capture_exceptions: false,
        capture_dead_clicks: false,
        capture_performance: false,
        disable_session_recording: true,
        enable_recording_console_log: false,
        advanced_disable_feature_flags: true,
        disable_surveys: true,
        before_send: scrub,
        loaded: function (posthog) {
          client = posthog;
          loading = false;
          client.register(baseProperties());
          client.opt_in_capturing({ captureEventName: false });
          window.bragTrack('$pageview');
          queue.splice(0).forEach(function (item) { window.bragTrack(item[0], item[1]); });
        }
      });
    };
    document.head.appendChild(script);
  }
  function choose(accept) {
    remember(accept ? 'accepted' : 'declined');
    allowed = accept;
    if (accept) start();
    else {
      queue = [];
      try { sessionStorage.removeItem('brag_website_source'); } catch (_) {}
      if (client) client.opt_out_capturing({ clear_persistence: true });
    }
    panel.hidden = true;
    settings.focus();
  }
  panel = document.createElement('section');
  panel.className = 'analytics-choice';
  panel.setAttribute('aria-label', 'Optional website analytics');
  panel.innerHTML = '<p>Help improve BRAG’s website?</p><p>Optional analytics measures visits and download-button clicks. No session recordings. <a href="/privacy/#website-analytics">Details</a></p><div><button type="button" data-analytics-accept>Allow analytics</button><button type="button" data-analytics-decline>No thanks</button></div>';
  panel.querySelector('[data-analytics-accept]').addEventListener('click', function () { choose(true); });
  panel.querySelector('[data-analytics-decline]').addEventListener('click', function () { choose(false); });
  panel.hidden = readChoice() !== null;
  document.body.appendChild(panel);
  var settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = 'Website analytics choices';
  settings.addEventListener('click', function () {
    panel.hidden = false;
    panel.querySelector('[data-analytics-accept]').focus();
  });
  (document.querySelector('footer') || document.body).appendChild(settings);
  if (readChoice() === 'accepted') start();

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link) return;
    var url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.hostname === 'apps.apple.com' && url.pathname.includes('/id6760629486')) {
      var section = link.closest('nav, section, footer');
      window.bragTrack('app_store_clicked', { button_location: link.dataset.location || section?.id || (link.closest('.guide-cta') ? 'guide_cta' : 'page') });
    } else if (link.hasAttribute('download') && url.origin === location.origin && url.pathname.startsWith('/downloads/')) {
      window.bragTrack('resource_downloaded', { resource: url.pathname.split('/').pop() });
    }
  });
})();
