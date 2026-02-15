// shortsDoubleTap.js

(() => {
    console.log("🚀 Shorts Double-Tap Feature Loaded");

    const DELAY = 250;
    let clickTimer = null;
    let lastClickTime = 0;

    // The Main Listener
    const onShortsClick = (e) => {
        // 1. Context Checks
        if (!location.href.includes('/shorts/')) return;
        
        const target = e.target;
        // Ensure click is on the video player container, not controls/overlay
        const isVideoClick = target.tagName === 'VIDEO' || 
                             target.classList.contains('html5-video-container') ||
                             target.closest('.html5-video-player');

        if (target.closest('button') || target.closest('a') || target.closest('#actions')) return;
        if (!isVideoClick) return;

        // 2. Intercept Event
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        // 3. Timing Logic
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime;
        lastClickTime = currentTime;

        if (timeDiff < DELAY) {
            // Double Click
            clearTimeout(clickTimer);
            triggerLike();
        } else {
            // Single Click
            clickTimer = setTimeout(() => {
                togglePlayPause();
            }, DELAY);
        }
    };

    // Helper: Find and click the like button
    function triggerLike() {
        const activeShort = document.querySelector('ytd-reel-video-renderer[is-active]');
        if (!activeShort) return;

        const allButtons = activeShort.querySelectorAll('button');
        let likeBtn = null;

        for (let btn of allButtons) {
            const label = (btn.getAttribute('aria-label') || "").toLowerCase();
            if (label.startsWith('like this video')) {
                likeBtn = btn;
                break;
            }
        }

        if (likeBtn) {
            const isLiked = likeBtn.getAttribute('aria-pressed') === 'true';
            if (!isLiked) {
                likeBtn.click();
            }
        }
    }

    // Helper: Toggle Play/Pause
    function togglePlayPause() {
        const activeShort = document.querySelector('ytd-reel-video-renderer[is-active]');
        if (!activeShort) return;
        
        const video = activeShort.querySelector('video');
        if (video) {
            video.paused ? video.play() : video.pause();
        }
    }

    // Attach listener with Capture Phase
    window.addEventListener('click', onShortsClick, true);

})();