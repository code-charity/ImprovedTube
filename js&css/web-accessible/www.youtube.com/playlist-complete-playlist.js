/*------------------------------------------------------------------------------
4.5.7 PLAYLIST COMPLETE FUNCTIONALITY
------------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------
Playlist management: delete videos and reset progress based on watch status
- Quick delete buttons: Add delete icon buttons next to each video
- Bulk delete controls: Add slider control to bulk delete videos by watch percentage
----------------------------------------------------------------------------*/

/**
 * Parse percentage value from CSS style string
 * @param {string} style - CSS style string containing percentage
 * @returns {number} - Percentage value between 0-100
 */
function parsePercentFromStyle(style) {
    if (!style) return 0;
    const m = String(style).match(/([0-9]+(?:\.[0-9]+)?)%/);
    return m ? Math.min(100, Math.max(0, parseFloat(m[1]))) : 0;
}

/**
 * Extract video ID from playlist video renderer element
 * @param {Element} renderer - Playlist video renderer element
 * @returns {string|null} - Video ID or null if not found
 */
function getVideoIdFromRenderer(renderer) {
    try {
        // YouTube custom element often exposes internal data with .data
        if (renderer && renderer.data) {
            return renderer.data.videoId || renderer.data.setVideoId || null;
        }
    } catch (e) { }
    // Fallback: parse from anchor
    const a = renderer.querySelector('a#thumbnail[href], a.ytd-thumbnail[href]');
    if (a) {
        try { const m = a.href.match(ImprovedTube.regex.video_id); if (m) return m[1]; } catch (e) { }
    }
    return null;
}

/**
 * Extract set video ID from playlist video renderer element
 * @param {Element} renderer - Playlist video renderer element
 * @returns {string|null} - Set video ID or null if not found
 */
function getSetVideoIdFromRenderer(renderer) {
    try {
        if (renderer && renderer.data && renderer.data.setVideoId) return renderer.data.setVideoId;
    } catch (e) { }
    return null;
}

/**
 * Get watched percentage from video renderer overlays
 * @param {Element} renderer - Playlist video renderer element
 * @returns {number} - Watched percentage (0-100)
 */
function getWatchedPercentFromRenderer(renderer) {
    // Prefer explicit resume overlay progress
    const progress = renderer.querySelector('ytd-thumbnail-overlay-resume-playback-renderer #progress');
    if (progress && progress.style && progress.style.width) {
        const p = parsePercentFromStyle(progress.style.width);
        if (!Number.isNaN(p)) return p;
    }
    // Fully watched overlay exists on some items
    if (renderer.querySelector('ytd-thumbnail-overlay-watched-status-renderer')) return 100;
    return 0;
}

/**
 * Remove video from playlist using YouTube's internal event system
 * @param {string} videoId - Video ID to remove
 * @param {string} setVideoId - Set video ID (optional)
 * @returns {boolean} - Success status
 */
function removeFromPlaylist(videoId, setVideoId) {
    try {
        const app = document.querySelector('ytd-app');
        if (!app) return false;
        const idForSet = setVideoId || videoId;
        app.dispatchEvent(new CustomEvent('yt-action', {
            detail: {
                actionName: 'yt-playlist-remove-videos-action',
                args: [
                    { playlistRemoveVideosAction: { setVideoIds: [idForSet] } }
                ],
                returnValue: [],
            },
            bubbles: true,
            cancelable: true,
            composed: true,
        }));
        return true;
    } catch (e) { return false; }
}

/**
 * Generate SHA-1 hex hash for authentication
 * @param {string} str - String to hash
 * @returns {Promise<string>} - Hex hash string
 */
async function sha1Hex(str) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-1', enc.encode(str));
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Remove videos from playlist using YouTube's modify API
 * @param {string} playlistId - Playlist ID
 * @param {string[]} videoIds - Array of video IDs to remove
 * @returns {Promise<boolean>} - Success status
 */
async function removeVideosPersistentlyModify(playlistId, videoIds) {
    if (!playlistId || !videoIds || videoIds.length === 0) return false;
    try {
        const cfg = (window.ytcfg && (window.ytcfg.data_ || (window.ytcfg.get && window.ytcfg.get()))) || {};
        const key = cfg.INNERTUBE_API_KEY || (window.ytcfg && window.ytcfg.get && window.ytcfg.get('INNERTUBE_API_KEY')) || '';
        const clientName = String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || '1');
        const clientVersion = cfg.INNERTUBE_CONTEXT_CLIENT_VERSION || '';
        const hl = cfg.HL || document.documentElement.lang || 'en';
        const gl = cfg.GL || 'US';
        const visitorData = cfg.VISITOR_DATA || '';
        const context = cfg.INNERTUBE_CONTEXT || {
            client: {
                clientName: 'WEB',
                clientVersion,
                hl,
                gl,
                visitorData,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                originalUrl: location.href,
                mainAppWebInfo: { graftUrl: location.pathname + location.search }
            },
            request: { internalExperimentFlags: [], sessionIndex: cfg.SESSION_INDEX ?? 0 }
        };
        const isWatchLater = playlistId === 'WL';
        const actionName = isWatchLater ? 'ACTION_REMOVE_VIDEO_FROM_WATCH_LATER' : 'ACTION_REMOVE_VIDEO_FROM_PLAYLIST';
        const actions = videoIds.map(id => ({ action: actionName, playlistId, removedVideoId: id }));
        const url = `${location.origin}/youtubei/v1/playlist/modify?key=${encodeURIComponent(key)}`;

        // Build SAPISIDHASH Authorization header
        const sapisid = (window.ImprovedTube?.getCookieValueByName && window.ImprovedTube.getCookieValueByName('SAPISID')) || (document.cookie.match(/(?:^|;\s*)SAPISID=([^;]+)/)?.[1] || '');
        const origin = location.origin;
        const timestamp = Math.floor(Date.now() / 1000);
        let authHeader = '';
        if (sapisid) {
            const toSign = `${timestamp} ${sapisid} ${origin}`;
            const hash = await sha1Hex(toSign);
            authHeader = `SAPISIDHASH ${timestamp}_${hash}`;
        }

        const headers = {
            'content-type': 'application/json',
            'X-YouTube-Client-Name': clientName,
            'X-YouTube-Client-Version': clientVersion,
            'X-YouTube-Device': cfg.DEVICE || '',
            'X-YouTube-Identity-Token': cfg.ID_TOKEN || '',
            'X-Goog-AuthUser': String(cfg.SESSION_INDEX ?? '0'),
            'X-Origin': origin,
            'Origin': origin,
            'Referer': location.href
        };
        if (cfg.PAGE_CL) headers['X-YouTube-Page-CL'] = String(cfg.PAGE_CL);
        if (cfg.PAGE_BUILD_LABEL) headers['X-YouTube-Page-Label'] = cfg.PAGE_BUILD_LABEL;
        if (visitorData) headers['X-Goog-Visitor-Id'] = visitorData;
        if (authHeader) headers['Authorization'] = authHeader;
        const pageId = cfg.PAGE_ID || cfg.DELEGATED_SESSION_ID;
        if (pageId) headers['X-Goog-PageId'] = pageId;
        headers['X-YouTube-Bootstrap-Logged-In'] = 'true';

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify({ context, actions })
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            console.warn('[ImprovedTube] Playlist modify failed', res.status, txt);
            return false;
        }
        // A bare HTTP 200 does not mean the video was removed: when the request
        // format drifts, YouTube answers 200 without applying the edit. Require a
        // positive confirmation so the caller can fall back to the native menu.
        const response = await res.json().catch(() => null);
        return !!response && !response.error && (
            response.status === 'STATUS_SUCCEEDED' ||
            !!response.frameworkUpdates
        );
    } catch (e) {
        console.warn('[ImprovedTube] Innertube removal failed', e);
        return false;
    }
}

/**
 * Remove videos from playlist using YouTube's edit_playlist API
 * @param {string} playlistId - Playlist ID
 * @param {string[]} setVideoIds - Array of set video IDs to remove
 * @returns {Promise<boolean>} - Success status
 */
async function removeVideosPersistentlyEdit(playlistId, setVideoIds) {
    if (!playlistId || !setVideoIds || setVideoIds.length === 0) return false;
    try {
        const cfg = (window.ytcfg && (window.ytcfg.data_ || (window.ytcfg.get && window.ytcfg.get()))) || {};
        const clientVersion = cfg.INNERTUBE_CONTEXT_CLIENT_VERSION || '';
        const hl = cfg.HL || document.documentElement.lang || 'en';
        const gl = cfg.GL || 'US';
        const visitorData = cfg.VISITOR_DATA || '';
        const baseContext = cfg.INNERTUBE_CONTEXT || {
            client: {
                clientName: 'WEB',
                clientVersion,
                hl,
                gl,
                visitorData,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                originalUrl: location.href,
                mainAppWebInfo: { graftUrl: location.pathname + location.search }
            },
            request: { internalExperimentFlags: [], sessionIndex: cfg.SESSION_INDEX ?? 0 }
        };
        // Clone so we never mutate YouTube's live ytcfg context, and mirror the
        // current native delete request, which carries adSignalsInfo in the context.
        const context = { ...baseContext, adSignalsInfo: baseContext.adSignalsInfo || { params: [] } };
        const actions = setVideoIds.map(id => ({ action: 'ACTION_REMOVE_VIDEO', setVideoId: id }));
        // YouTube now sends params URL-escaped (the '==' padding becomes '%3D%3D').
        const body = { context, actions, playlistId, params: 'CAFAAQ%3D%3D' };
        const url = `${location.origin}/youtubei/v1/browse/edit_playlist?prettyPrint=false`;

        // Build SAPISIDHASH Authorization header
        const sapisid = (window.ImprovedTube?.getCookieValueByName && window.ImprovedTube.getCookieValueByName('SAPISID')) || (document.cookie.match(/(?:^|;\s*)SAPISID=([^;]+)/)?.[1] || '');
        const origin = location.origin;
        const timestamp = Math.floor(Date.now() / 1000);
        let authHeader = '';
        if (sapisid) {
            const toSign = `${timestamp} ${sapisid} ${origin}`;
            const hash = await sha1Hex(toSign);
            authHeader = `SAPISIDHASH ${timestamp}_${hash}`;
        }

        const headers = {
            'content-type': 'application/json',
            'X-YouTube-Client-Name': String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || '1'),
            'X-YouTube-Client-Version': clientVersion,
            'X-Goog-AuthUser': String(cfg.SESSION_INDEX ?? '0'),
            'X-Goog-Visitor-Id': visitorData || undefined,
            'X-Origin': origin,
            'Origin': origin,
            'Referer': location.href,
            ...(authHeader ? { 'Authorization': authHeader } : {})
        };
        const pageId2 = cfg.PAGE_ID || cfg.DELEGATED_SESSION_ID;
        if (pageId2) headers['X-Goog-PageId'] = pageId2;
        headers['X-YouTube-Bootstrap-Logged-In'] = 'true';

        const res = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            console.warn('[ImprovedTube] edit_playlist failed', res.status, txt);
            return false;
        }

        const response = await res.json().catch(() => null);

        // Only report success when YouTube confirms the edit. A bare HTTP 200 is
        // not enough: when the request format drifts, YouTube answers 200 without
        // removing anything, which previously made the row vanish and then reappear
        // on refresh. Returning false lets the caller fall back to the native menu.
        const succeeded = !!response && !response.error && (
            response.status === 'STATUS_SUCCEEDED' ||
            Array.isArray(response.playlistEditResults) ||
            !!response.frameworkUpdates ||
            !!response.newHeader
        );

        if (response?.newHeader?.playlistHeaderRenderer) {
            document.querySelector("ytd-playlist-header-renderer")?.dispatchEvent(
                new CustomEvent("yt-new-playlist-header", {
                    detail: response.newHeader.playlistHeaderRenderer
                })
            );
        }

        if (response?.frameworkUpdates?.entityBatchUpdate) {
            document.querySelector("ytd-app")?.dispatchEvent(
                new CustomEvent("yt-action", {
                    detail: {
                        actionName: "yt-entity-update-command",
                        args: [{ entityUpdateCommand: { entityBatchUpdate: response.frameworkUpdates.entityBatchUpdate } }],
                        returnValue: []
                    }
                })
            );
        }

        return succeeded;
    } catch (e) {
        console.warn('[ImprovedTube] edit_playlist error', e);
        return false;
    }
}

/**
 * Save watch history to local storage
 */
function saveLocalWatchHistory() {
    try {
        const key = 'it_watch_history';
        const data = ImprovedTube.storage.watch_history || {};
        if (typeof chrome !== 'undefined' && chrome.storage?.local?.set) {
            chrome.storage.local.set({ [key]: data });
        } else {
            localStorage.setItem(key, JSON.stringify(data));
        }
    } catch (e) { console.warn('[ImprovedTube] watch history save failed', e); }
}

/**
 * Reset watch progress for a specific video
 * @param {string} videoId - Video ID to reset
 * @param {Element} renderer - Video renderer element (optional)
 */
function resetWatchForVideo(videoId, renderer) {
    // Remove local overlay info and UI traces
    if (ImprovedTube.storage.watch_history && ImprovedTube.storage.watch_history[videoId]) {
        delete ImprovedTube.storage.watch_history[videoId];
        saveLocalWatchHistory();
    }
    try {
        // Remove progress and watched overlays on the item
        const target = renderer || document.querySelector(`ytd-playlist-video-renderer a[href*="v=${videoId}"]`)?.closest('ytd-playlist-video-renderer');
        if (target) {
            target.querySelector('ytd-thumbnail-overlay-resume-playback-renderer')?.remove();
            target.querySelector('ytd-thumbnail-overlay-watched-status-renderer')?.remove();
        }
    } catch (e) { }
    // Inform extension watched store (best-effort)
    try {
        ImprovedTube.messages.send({ action: 'watched', type: 'remove', id: videoId });
    } catch (e) { console.debug('[ImprovedTube] watch-reset message failed', e); }
}

/*------------------------------------------------------------------------------
4.5.7.1 QUICK DELETE BUTTONS
------------------------------------------------------------------------------*/

/**
 * Add quick delete icon button to playlist video renderer
 * @param {Element} renderer - Playlist video renderer element
 */
ImprovedTube.playlistEnsureQuickButtons = function (renderer) {
    if (!this.storage.playlist_quick_delete_shortcut) return;
    if (!renderer || renderer.dataset.itQuickActions === '1') return;

    const videoId = getVideoIdFromRenderer(renderer);
    if (!videoId) return;

    // Find the dropdown trigger button to insert before it
    const menu = renderer.querySelector('#menu');
    if (!menu) return;

    const dropdownTrigger = menu.querySelector('.dropdown-trigger, #button');
    if (!dropdownTrigger) return;

    // Create icon button for delete
    const btnDelete = document.createElement('button');
    btnDelete.title = 'Remove this video from playlist';
    btnDelete.className = 'style-scope yt-icon-button';
    btnDelete.style.height = 'auto';
    btnDelete.style.width = 'auto';

    // Create icon span
    const iconSpan = document.createElement('span');
    iconSpan.className = 'yt-icon-shape style-scope yt-icon ytSpecIconShapeHost';

    // Create icon container div
    const iconDiv = document.createElement('div');
    iconDiv.style.width = '100%';
    iconDiv.style.height = '100%';
    iconDiv.style.display = 'block';
    iconDiv.style.fill = 'currentcolor';

    // Create SVG with trash icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('enable-background', 'new 0 0 24 24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.pointerEvents = 'none';
    svg.style.display = 'inherit';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.mixBlendMode = 'difference';
    svg.style.filter = 'invert(1)';

    // Create path for trash icon
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z');

    // Assemble the icon
    svg.appendChild(path);
    iconDiv.appendChild(svg);
    iconSpan.appendChild(iconDiv);
    btnDelete.appendChild(iconSpan);

    // Add click handler for video removal
    btnDelete.addEventListener('click', async function (e) {
        e.preventDefault(); e.stopPropagation();
        const playlistId = new URLSearchParams(location.search).get('list');
        const setId = getSetVideoIdFromRenderer(renderer);

        // Try multiple removal methods for reliability
        let ok = await removeVideosPersistentlyEdit(playlistId, setId ? [setId] : []);
        if (!ok) ok = await removeVideosPersistentlyModify(playlistId, [videoId]);
        if (!ok) {
            ok = await clickMenuRemove(renderer);
            if (!ok) ok = removeFromPlaylist(videoId, setId);
        }

        if (ok) {
            try { renderer.remove(); } catch (err) { }
        }
    }, true);

    // Insert before the dropdown trigger button
    dropdownTrigger.parentNode.insertBefore(btnDelete, dropdownTrigger);
    renderer.dataset.itQuickActions = '1';
};

/**
 * Attach quick delete buttons to all playlist video renderers
 */
ImprovedTube.playlistAttachQuickButtons = function () {
    if (!this.storage.playlist_quick_delete_shortcut) return;
    const list = document.querySelectorAll('ytd-playlist-video-renderer');
    for (const renderer of list) {
        this.playlistEnsureQuickButtons(renderer);
    }
};

/*------------------------------------------------------------------------------
4.5.7.2 BULK DELETE CONTROLS
------------------------------------------------------------------------------*/

/**
 * Utility function for async delays
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Click the menu remove option for a video renderer
 * @param {Element} renderer - Video renderer element
 * @returns {Promise<boolean>} - Success status
 */
async function clickMenuRemove(renderer) {
    try {
        const menuButton = renderer.querySelector('#menu #button, #menu tp-yt-paper-icon-button, #menu ytd-button-renderer button');
        if (!menuButton) return false;
        menuButton.click();

        // Wait for popup items to render
        let tries = 0, item = null;
        while (tries++ < 20 && !item) {
            await sleep(100);
            const items = Array.from(document.querySelectorAll('ytd-menu-service-item-renderer'));
            item = items.find(el => {
                try {
                    const data = el.data || el.__data || {};
                    const json = JSON.stringify(data);
                    return /ACTION_REMOVE_VIDEO_FROM/.test(json);
                } catch (e) { return false; }
            }) || null;
        }
        if (!item) return false;
        item.click();
        await sleep(400);
        return true;
    } catch (e) { return false; }
}

/**
 * Load all playlist items by scrolling and clicking continuation buttons
 * @param {Function} statusCb - Callback function for status updates
 * @param {AbortSignal} [signal] - Optional signal to abort loading early
 */
async function loadAllPlaylistItems(statusCb, signal) {
    const list = document.querySelector('ytd-playlist-video-list-renderer #contents') ||
        document.querySelector('ytd-playlist-video-list-renderer');
    if (!list) return false;

    let lastCount = 0;
    let stable = 0;
    const maxStable = 3;
    const deadline = Date.now() + 90_000;

    for (let i = 0; i < 300; i++) {
        if (signal?.aborted) return false;
        if (Date.now() > deadline) return true;

        // Scroll to end to trigger loading
        try { list.scrollTop = list.scrollHeight; } catch (e) { }
        window.scrollTo(0, document.documentElement.scrollHeight);

        // Click continuation button if present
        const cont = list.querySelector('ytd-continuation-item-renderer');
        const btn = cont?.querySelector('button, tp-yt-paper-button, #button');
        if (btn && !btn.disabled) { try { btn.click(); } catch (e) { } }

        await sleep(700);
        const count = document.querySelectorAll('ytd-playlist-video-renderer').length;
        if (typeof statusCb === 'function') statusCb(count);

        if (count <= lastCount) { stable++; } else { stable = 0; lastCount = count; }
        if (stable >= maxStable && !list.querySelector('ytd-continuation-item-renderer')) break;
    }
    return false;
}

/**
 * Collect video candidates for removal based on watch threshold
 * @param {number} threshold - Watch percentage threshold (0-100)
 * @returns {Array} - Array of candidate objects
 */
function collectCandidates(threshold) {
    const nodes = Array.from(document.querySelectorAll('ytd-playlist-video-renderer'));
    const candidates = [];
    for (const node of nodes) {
        const id = getVideoIdFromRenderer(node);
        const setId = getSetVideoIdFromRenderer(node);
        if (!id && !setId) continue;
        const percent = getWatchedPercentFromRenderer(node);
        if (percent >= threshold) {
            candidates.push({ id, setId, node, percent });
        }
    }
    return candidates;
}

/**
 * Execute bulk removal of videos based on watch threshold
 * @param {number} threshold - Watch percentage threshold (0-100)
 * @param {AbortSignal} [signal] - Optional signal to abort early
 * @returns {Promise<number>} - Number of videos removed
 */
async function runRemoval(threshold, signal) {
    const items = collectCandidates(threshold);
    if (items.length === 0) return 0;

    const playlistId = new URLSearchParams(location.search).get('list');
    const confirmedNodes = new Set();

    // Try edit_playlist with setVideoIds in chunks to avoid oversized requests
    const BATCH_SIZE = 50;
    let ok = false;
    const setIds = items.map(i => i.setId).filter(Boolean);
    const bySetId = new Map(items.filter(i => i.setId).map(i => [i.setId, i]));
    if (setIds.length) {
        ok = true;
        for (let i = 0; i < setIds.length; i += BATCH_SIZE) {
            if (signal?.aborted) break;
            const chunk = setIds.slice(i, i + BATCH_SIZE);
            const r = await removeVideosPersistentlyEdit(playlistId, chunk);
            if (!r) { ok = false; break; }
            for (const sid of chunk) {
                const item = bySetId.get(sid);
                if (item) confirmedNodes.add(item.node);
            }
        }
    }

    // Fallback to modify with removedVideoId (batch)
    if (!ok && !signal?.aborted) {
        ok = await removeVideosPersistentlyModify(playlistId, items.map(i => i.id).filter(Boolean));
        if (ok) items.forEach(({ node }) => confirmedNodes.add(node));
    }

    if (!ok && !signal?.aborted) {
        // Fallback to UI-driven removal (more reliable, slower)
        for (const { node, id, setId } of items) {
            if (signal?.aborted) break;
            const did = await clickMenuRemove(node);
            if (!did) removeFromPlaylist(id, setId);
            confirmedNodes.add(node);
        }
    }

    // Remove only confirmed items from the DOM
    for (const node of confirmedNodes) { try { node.remove(); } catch (e) { } }

    return confirmedNodes.size;
}

/**
 * Create bulk delete controls in playlist header
 */
ImprovedTube.playlistCreateBulkControls = function () {
    let _loadController = null;
    if (!this.storage.playlist_bulk_delete_by_progress) return;
    if (document.getElementById('it-playlist-cleaner-controls')) return;

    // Find suitable mount point, prioritizing visible elements
    const vmRow = document.querySelector('yt-flexible-actions-view-model .ytFlexibleActionsViewModelActionRow');
    const mounts = [
        vmRow,
        // Classic header actions
        document.querySelector('ytd-playlist-header-renderer #top-row #actions'),
        document.querySelector('ytd-playlist-header-renderer #actions'),
        document.querySelector('ytd-playlist-header-renderer .immersive-header-content'),
        document.querySelector('ytd-playlist-header-renderer #header #actions'),
        document.querySelector('ytd-playlist-header-renderer #header ytd-playlist-byline-renderer'),
        // Sidebar fallbacks (older layouts) - only use visible sidebars
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer:not([hidden]) #actions'),
        document.querySelector('ytd-playlist-sidebar-primary-info-renderer:not([hidden])'),
        document.querySelector('ytd-playlist-byline-renderer')
    ];

    // Find the first visible mount point
    let parent = null;
    for (const mount of mounts) {
        if (mount) {
            const style = window.getComputedStyle(mount);
            const rect = mount.getBoundingClientRect();
            if (style.display !== 'none' && style.visibility !== 'hidden' &&
                !mount.hasAttribute('hidden') && rect.width > 0 && rect.height > 0) {
                parent = mount;
                break;
            }
        }
    }

    if (!parent) {
        setTimeout(() => this.playlistCreateBulkControls(), 500);
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'it-playlist-cleaner-controls';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    wrapper.style.marginTop = '8px';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.zIndex = '2';
    wrapper.style.position = 'relative';
    wrapper.style.color = 'white';

    // Special handling for modern flexible actions layout
    if (vmRow && parent === vmRow) {
        // Create a new action row for our controls
        const newActionRow = document.createElement('div');
        newActionRow.className = 'ytFlexibleActionsViewModelActionRow';
        newActionRow.style.marginTop = '8px';

        wrapper.className = 'ytFlexibleActionsViewModelAction ytFlexibleActionsViewModelActionRowAction';
        wrapper.style.marginTop = '0';

        // Create the control elements
        const label = document.createElement('span');
        label.textContent = 'Remove watched ≥';
        label.style.opacity = '0.85';

        const input = document.createElement('input');
        input.type = 'range';
        input.min = '0';
        input.max = '100';
        input.step = '5';
        input.value = String(100);
        input.style.width = '180px';

        const value = document.createElement('span');
        value.textContent = input.value + '%';
        value.style.minWidth = '40px';

        input.addEventListener('input', function () {
            value.textContent = this.value + '%';
        }, { passive: true });

        const button = document.createElement('button');
        button.textContent = 'Remove';
        button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m';
        button.style.cursor = 'pointer';

        const status = document.createElement('span');
        status.style.opacity = '0.7';
        status.style.marginLeft = '4px';

        button.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (_loadController) {
                _loadController.abort();
                return;
            }
            const threshold = Math.max(0, Math.min(100, parseInt(input.value, 10) || 0));
            const thisController = new AbortController();
            _loadController = thisController;
            const { signal } = thisController;
            button.textContent = 'Cancel';
            try {
                status.textContent = 'Loading…';
                const timedOut = await loadAllPlaylistItems(count => {
                    status.textContent = `Loaded ${count}…`;
                    ImprovedTube.playlistAttachQuickButtons();
                }, signal);
                if (signal.aborted) { status.textContent = 'Cancelled'; return; }
                if (timedOut) { status.textContent = 'Timed out — partial list'; return; }
                status.textContent = 'Removing…';
                const removed = await runRemoval(threshold, signal);
                status.textContent = removed ? `Removed ${removed}` : 'No matches';
            } catch (err) {
                status.textContent = 'Error';
                console.error('[ImprovedTube] Bulk removal error', err);
            } finally {
                if (_loadController === thisController) _loadController = null;
                button.textContent = 'Remove';
            }
        }, true);

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wrapper.appendChild(value);
        wrapper.appendChild(button);
        wrapper.appendChild(status);

        newActionRow.appendChild(wrapper);

        // Add our new row after the existing actions row
        const flexibleActionsContainer = vmRow.parentElement;
        if (flexibleActionsContainer) {
            flexibleActionsContainer.appendChild(newActionRow);
            this.playlistAttachQuickButtons();
            return;
        }
    }

    // Standard mounting for other layouts
    const label = document.createElement('span');
    label.textContent = 'Remove watched ≥';
    label.style.opacity = '0.85';

    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '5';
    input.value = String(100);
    input.style.width = '180px';

    const value = document.createElement('span');
    value.textContent = input.value + '%';
    value.style.minWidth = '40px';

    input.addEventListener('input', function () {
        value.textContent = this.value + '%';
    }, { passive: true });

    const button = document.createElement('button');
    button.textContent = 'Remove';
    button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--overlay yt-spec-button-shape-next--size-m';
    button.style.cursor = 'pointer';

    const status = document.createElement('span');
    status.style.opacity = '0.7';
    status.style.marginLeft = '4px';

    button.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (_loadController) {
            _loadController.abort();
            return;
        }
        const threshold = Math.max(0, Math.min(100, parseInt(input.value, 10) || 0));
        const thisController = new AbortController();
        _loadController = thisController;
        const { signal } = thisController;
        button.textContent = 'Cancel';
        try {
            status.textContent = 'Loading…';
            const timedOut = await loadAllPlaylistItems(count => {
                status.textContent = `Loaded ${count}…`;
                ImprovedTube.playlistAttachQuickButtons();
            }, signal);
            if (signal.aborted) { status.textContent = 'Cancelled'; return; }
            if (timedOut) { status.textContent = 'Timed out — partial list'; return; }
            status.textContent = 'Removing…';
            const removed = await runRemoval(threshold, signal);
            status.textContent = removed ? `Removed ${removed}` : 'No matches';
        } catch (err) {
            status.textContent = 'Error';
            console.error('[ImprovedTube] Bulk removal error', err);
        } finally {
            if (_loadController === thisController) _loadController = null;
            button.textContent = 'Remove';
        }
    }, true);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(value);
    wrapper.appendChild(button);
    wrapper.appendChild(status);

    // Insert near playlist metadata
    if (parent.id === 'actions' || (parent.closest && parent.closest('#actions'))) {
        wrapper.style.marginTop = '0';
    }
    parent.appendChild(wrapper);

    this.playlistAttachQuickButtons();
};

/*------------------------------------------------------------------------------
4.5.7.3 INITIALIZATION AND SETTINGS HANDLERS
------------------------------------------------------------------------------*/

/**
 * Initialize playlist complete functionality on playlist pages
 */
ImprovedTube.playlistCompleteInit = function () {
    if (!location.search.match(ImprovedTube.regex.playlist_id)) return;

    // Set defaults if settings don't exist
    if (typeof this.storage.playlist_quick_delete_shortcut === 'undefined') {
        this.storage.playlist_quick_delete_shortcut = false;
    }
    if (typeof this.storage.playlist_bulk_delete_by_progress === 'undefined') {
        this.storage.playlist_bulk_delete_by_progress = false;
    }

    this.playlistCreateBulkControls();
    this.playlistAttachQuickButtons();
};

/**
 * Handle real-time settings changes for quick delete buttons
 */
ImprovedTube.playlistQuickDeleteShortcut = function () {
    if (!location.search.match(ImprovedTube.regex.playlist_id)) return;

    // Remove existing buttons first
    document.querySelectorAll('ytd-playlist-video-renderer').forEach(renderer => {
        const existingButton = renderer.querySelector('button[title*="Remove this video from playlist"]');
        if (existingButton) {
            existingButton.remove();
        }
        delete renderer.dataset.itQuickActions;
    });

    // Re-attach with new settings
    this.playlistAttachQuickButtons();
};

/**
 * Handle real-time settings changes for bulk delete controls
 */
ImprovedTube.playlistBulkDeleteByProgress = function () {
    if (!location.search.match(ImprovedTube.regex.playlist_id)) return;

    // Remove existing controls
    const existingControls = document.getElementById('it-playlist-cleaner-controls');
    if (existingControls) {
        existingControls.remove();
    }

    // Re-create with new settings
    this.playlistCreateBulkControls();
};
