(function () {
  'use strict';
  document.addEventListener('click', async function (event) {
    var button = event.target.closest('[data-copy-template]');
    if (!button) return;
    var source = document.getElementById(button.dataset.copyTemplate);
    var status = button.closest('.template-panel').querySelector('[role="status"]');
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      status.textContent = 'Copied. Paste it wherever you keep your wins.';
      window.bragTrack?.('template_copied', { resource: source.id });
    } catch (_) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Template selected. Use your device’s Copy command, or download the text file.';
    }
  });
})();
