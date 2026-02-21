// Fixes GitHub issue #3591: Auto-bypass "I understand and wish to proceed" content warnings
(function () {
    let enabled = true; // Default to true

    // Load setting
    chrome.storage.sync.get('auto_bypass_content_warning', (data) => {
        if (data.auto_bypass_content_warning !== undefined) {
            enabled = data.auto_bypass_content_warning;
        }
        if (enabled) bypassContentWarning();
    });

    // Listen for changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.auto_bypass_content_warning) {
            enabled = changes.auto_bypass_content_warning.newValue;
            if (enabled) bypassContentWarning();
        }
    });

    // Only run on YouTube watch pages
    const isWatchPage = () => location.pathname === '/watch';

    // Add &rco=1 to URL if missing
    function bypassContentWarning() {
        if (!enabled) return;

        if (isWatchPage() && !location.search.includes('rco=1')) {
            const url = new URL(location.href);
            url.searchParams.set('rco', '1');
            history.replaceState(history.state, '', url.toString());
        }
    }

    // Handle YouTube (SPA) navigation
    window.addEventListener('yt-navigate-finish', bypassContentWarning);

    // Fallback: Observe DOM changes to detect URL updates
    new MutationObserver(() => {
        if (enabled && isWatchPage() && !location.search.includes('rco=1')) {
            bypassContentWarning();
        }
    }).observe(document, { subtree: true, childList: true });
})();
