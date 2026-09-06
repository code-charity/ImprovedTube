/*--------------------------------------------------------------
# FIX: PLAYLIST REVERSE RESETS ON NEXT VIDEO (issue #3818)
----------------------------------------------------------------
When playlist_reverse is enabled, re-apply the reverse order
each time YouTube navigates to the next video in the playlist.
--------------------------------------------------------------*/

(function () {
    if (!extension.storage.get('playlist_reverse')) return;

    var lastUrl = location.href;
    var lastPlaylistId = new URLSearchParams(location.search).get('list');

    function applyReverse() {
        var items = document.querySelector('ytd-playlist-panel-renderer #items');
        if (!items) return;

        var children = Array.from(items.children);
        if (children.length < 2) return;

        // Check if already reversed by comparing data
        children.reverse().forEach(function (child) {
            items.appendChild(child);
        });
    }

    // Watch for URL changes (YouTube is a SPA - no full page reloads)
    var observer = new MutationObserver(function () {
        var currentUrl = location.href;
        var currentPlaylistId = new URLSearchParams(location.search).get('list');

        if (currentUrl !== lastUrl && currentPlaylistId && currentPlaylistId === lastPlaylistId) {
            lastUrl = currentUrl;
            // Wait for playlist panel to render
            setTimeout(applyReverse, 800);
        } else if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            lastPlaylistId = currentPlaylistId;
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Also apply on initial load
    setTimeout(applyReverse, 1000);
})();
