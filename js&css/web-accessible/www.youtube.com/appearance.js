/*------------------------------------------------------------------------------
  APPEARANCE
------------------------------------------------------------------------------*/
ImprovedTube.YouTubeExperiments = function () {
	if ((this.storage.undo_the_new_sidebar === "true" || this.storage.description === "sidebar")
		&& document.documentElement.dataset.pageType === 'video') {
	if (window.yt?.config_?.EXPERIMENT_FLAGS) {
		const newSidebarFlags = [
			'kevlar_watch_grid',
			'small_avatars_for_comments',
			'small_avatars_for_comments_ep',
			'web_watch_rounded_player_large'
		];
	        if (this.storage.undo_the_new_sidebar === "true") {
		if (window.yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid !== false) {
			try {
                	newSidebarFlags.forEach(F => {
                  	  Object.defineProperty(window.yt.config_.EXPERIMENT_FLAGS, F, { get: () => false });
			});
			} catch (error) { console.error("can't undo description on the side", error); }
		}} else if (this.storage.description === "sidebar" && window.yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid !== true) {
			try {
                	newSidebarFlags.forEach(F => {
                   	Object.defineProperty(window.yt.config_.EXPERIMENT_FLAGS, F, { get: () => true });
			});
			} catch (error) { console.error("tried to move description to the sidebar", error); }
		}
	} else { console.log ("yt.config_.EXPERIMENT_FLAGS is not yet defined") }
	}
}
/*try {
		yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid = false;
		yt.config_.EXPERIMENT_FLAGS.small_avatars_for_comments = false;
		yt.config_.EXPERIMENT_FLAGS.small_avatars_for_comments_ep = false;
		yt.config_.EXPERIMENT_FLAGS.web_watch_rounded_player_large = false;
	} catch (error) { console.error("can't undo description on the side", error); }

	try {
		yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid = true;
		yt.config_.EXPERIMENT_FLAGS.small_avatars_for_comments = true;
		yt.config_.EXPERIMENT_FLAGS.small_avatars_for_comments_ep = true;
	} catch (error) { console.error("tried to move description to the sidebar", error); }
*/
/*------------------------------------------------------------------------------
  PLAYER
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
 PLAYER SIZE
------------------------------------------------------------------------------*/
ImprovedTube.playerSize = function () {
	if (this.storage.player_size === "custom") {
		var width = Number(this.storage.custom_player_size_width) || 1280,
			height = Number(this.storage.custom_player_size_height) || 720,
			style = this.elements.player_size_style || document.createElement("style");

		style.textContent = ':root {';
		style.textContent += "--it-player-width:" + width + "px;";
		style.textContent += "--it-player-height:" + height + "px;";
		style.textContent += "}";

		document.body.appendChild(style);
		if (document.documentElement.dataset.pageType === 'video') { window.dispatchEvent(new Event('resize')); }
	}
};
/*------------------------------------------------------------------------------
 FORCED THEATER MODE
------------------------------------------------------------------------------*/
ImprovedTube.forcedTheaterMode = function (attempt) {
	if (ImprovedTube.storage.forced_theater_mode === true && ImprovedTube.elements.ytd_watch && ImprovedTube.elements.player) {
		var button = ImprovedTube.elements.player.querySelector("button.ytp-size-button");
		var theater = ImprovedTube.elements.ytd_watch.theater === true || ImprovedTube.elements.ytd_watch.hasAttribute('theater');

		if (button && theater === false) {
			document.cookie = "wide=1;domain=.youtube.com;path=/";
			//     ImprovedTube.elements.ytd_watch.theater = true;
			setTimeout(function () {
				button.click();
			}, 100);
		} else if (theater === false && (attempt || 0) < 10) {
			setTimeout(function () {
				ImprovedTube.forcedTheaterMode((attempt || 0) + 1);
			}, 250);
		}
	}
};

/*------------------------------------------------------------------------------
 HD THUMBNAIL (Smart Hardware & Network Probe)
------------------------------------------------------------------------------*/
ImprovedTube.playerHdThumbnail = function (thumbnailElement) {
    if (this.storage.player_hd_thumbnail === true) {
        var thumbnail = thumbnailElement || ImprovedTube.elements.player_thumbnail;

        if (!thumbnail || !thumbnail.style) return;

        var currentBg = thumbnail.style.backgroundImage;
        if (currentBg && currentBg.indexOf("/hqdefault.jpg") !== -1) {

            var rect = thumbnail.getBoundingClientRect();
            var physicalWidth = (rect.width || thumbnail.clientWidth || 0) * (window.devicePixelRatio || 1);

            if (physicalWidth === 0) {
                return;
            }

            if (physicalWidth > 400) {

                var maxResUrl = currentBg.replace("/hqdefault.jpg", "/maxresdefault.jpg");
                var extractedUrl = maxResUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

                var probe = new Image();
                probe.onload = function () {
                    thumbnail.style.backgroundImage = maxResUrl;
                };
                probe.onerror = function () {
                };
                probe.src = extractedUrl;
            }
        }
    }
};
/*------------------------------------------------------------------------------
 ALWAYS SHOW PROGRESS BAR
------------------------------------------------------------------------------*/
ImprovedTube.showProgressBar = function () {
	const player = ImprovedTube.elements.player;

	if (player && player.className.indexOf("ytp-autohide") !== -1) {
		const played = (player.getCurrentTime() * 100) / player.getDuration(),
			loaded = player.getVideoBytesLoaded() * 100,
			play_bars = player.querySelectorAll(".ytp-play-progress"),
			load_bars = player.querySelectorAll(".ytp-load-progress");
		let width = 0,
			progress_play = 0,
			progress_load = 0;

		for (let i = 0, l = play_bars.length; i < l; i++) {
			width += play_bars[i].offsetWidth;
		}
		const width_percent = width / 100;

		for (let i = 0, l = play_bars.length; i < l; i++) {
			let a = play_bars[i].offsetWidth / width_percent,
				b = 0,
				c = 0;

			if (played - progress_play >= a) {
				b = 100;
			} else if (played > progress_play && played < a + progress_play) {
				b = (100 * ((played - progress_play) * width_percent)) / play_bars[i].offsetWidth;
			}

			play_bars[i].style.transform = "scaleX(" + b / 100 + ")";

			if (loaded - progress_load >= a) {
				c = 100;
			} else if (loaded > progress_load && loaded < a + progress_load) {
				c = (100 * ((loaded - progress_load) * width_percent)) / play_bars[i].offsetWidth;
			}

			load_bars[i].style.transform = "scaleX(" + c / 100 + ")";

			progress_play += a;
			progress_load += a;
		}
	}
};
/*------------------------------------------------------------------------------
 VIDEO REMAINING DURATION
------------------------------------------------------------------------------*/
ImprovedTube.formatSecond = function (rTime) {
	var time = new Date(null);
	if (this.storage.duration_with_speed === true) {
		var playbackRate = this.elements.video.playbackRate;
		time.setSeconds(rTime / playbackRate);
	} else {
		time.setSeconds(rTime);
	}

	if (rTime / 3600 < 1) {
		return time.toISOString().substr(14, 5);
	} else {
		return time.toISOString().substr(11, 8);
	}
};

ImprovedTube.playerRemainingDuration = function () {
	const liveBadge = document.querySelector('button.ytp-live-badge.ytp-button.ytp-live-badge-is-livehead');
	if (liveBadge) return;

	const durationEl = document.querySelector('.ytp-time-duration');
	if (!durationEl) return;

	const player = ImprovedTube.elements.player;
	if (!player) return;

	const currentTime = player.getCurrentTime();
	const duration = player.getDuration();

	if (!isFinite(duration) || !isFinite(currentTime) || duration <= 0) return;

	const remainingSeconds = Math.max(0, duration - currentTime);
	const rTime = ImprovedTube.formatSecond(Math.floor(remainingSeconds));

	if (!rTime || rTime.includes('NaN')) return;

	var remainingEl = document.querySelector('.ytp-time-remaining-duration');
	if (!remainingEl) {
		remainingEl = document.createElement('span');
		remainingEl.className = 'ytp-time-remaining-duration';
		durationEl.insertAdjacentElement('afterend', remainingEl);
	}
	remainingEl.textContent = '  (-' + rTime + ')';
};


/*------------------------------------------------------------------------------
 Comments Sidebar Simple
------------------------------------------------------------------------------*/
ImprovedTube.commentsSidebarSimple = function () { if (ImprovedTube.storage.comments_sidebar_simple === true) {
	if (window.matchMedia("(min-width: 1599px)").matches) {
		document.querySelector("#primary").insertAdjacentElement('afterend', document.querySelector("#comments"));}
	if (window.matchMedia("(max-width: 1598px)").matches) {
		document.querySelector("#related").insertAdjacentElement('beforebegin', document.querySelector("#comments"));
		setTimeout(function () {
			document.querySelector("#primary-inner").appendChild(document.querySelector("#related"));}
		);}
}
}
/*------------------------------------------------------------------------------
 Comments Sidebar
------------------------------------------------------------------------------*/
ImprovedTube.commentsSidebar = function () { if (ImprovedTube.storage.comments_sidebar === true) {
	const state = ImprovedTube.commentsSidebarState || (ImprovedTube.commentsSidebarState = {
		hasApplied: 0,
		initialized: false
	});
	if (/watch\?/.test(location.href)) {
		sidebar();
		styleScrollbars();
		setGrid();
		applyObserver();
		observeLayoutChanges();
		if (!state.initialized) {
			window.addEventListener("resize", sidebar);
			// Listen for fullscreen changes to properly recalculate player size
			document.addEventListener("fullscreenchange", function() {
				// Delay to let YouTube update its attributes first
				setTimeout(sidebar, 100);
			});
			state.initialized = true;
		}
	}

	function sidebar () {
		resizePlayer();
		if (window.matchMedia("(min-width: 1952px)").matches) {

			if (!state.hasApplied || !isLayoutApplied(true)) {
				initialSetup()
				setTimeout(() => {moveNode(document.getElementById("columns"), document.getElementById("related"))})
			}
			else if (state.hasApplied == 2) { //from medium to big size
				setTimeout(() => {moveNode(document.getElementById("columns"), document.getElementById("related"))})
			}
			state.hasApplied = 1
		}
		else if (window.matchMedia("(min-width: 1000px)").matches) {
			if (!state.hasApplied || !isLayoutApplied(false)) {
				initialSetup();
			}
			else if (state.hasApplied == 1) { //from big to medium
				moveNode(document.getElementById("primary-inner"), document.getElementById("related"));
			}
			state.hasApplied = 2
		}
		else { /// <1000
			if (state.hasApplied == 1) {
				moveNode(document.getElementById("primary-inner"), document.getElementById("related"));
				let comments = document.querySelector("#comments");
				let below = document.getElementById("below");
				moveNode(below, comments);
			}
			else if (state.hasApplied == 2) {
				let comments = document.querySelector("#comments");
				let below = document.getElementById("below");
				moveNode(below, comments);
			}
			state.hasApplied = 0;
		}
	}
	function setGrid () {
		let checkParentInterval = setInterval(() => {
			container = document.querySelector("#related ytd-compact-video-renderer.style-scope")?.parentElement;
			if (container) {
				clearInterval(checkParentInterval);
				container.style.display = "flex";
				container.style.flexWrap = "wrap";
				container.style.flexDirection = "row";
			}
		}, 250);
	}
	function initialSetup () {
		if (!document.getElementById("secondary-inner") || !document.getElementById("primary-inner") || !document.querySelector("#comments")) {
			scheduleSidebar();
			return;
		}
		setTimeout(() => {
			let secondaryInner = document.getElementById("secondary-inner");
			let primaryInner = document.getElementById("primary-inner");
			let comments = document.querySelector("#comments");
			if (!secondaryInner || !primaryInner || !comments) {
				scheduleSidebar();
				return;
			}
			moveNode(primaryInner, document.getElementById("panels"));
			moveNode(primaryInner, document.getElementById("related"))
			moveNode(secondaryInner, document.getElementById("chat-template"));
			moveNode(secondaryInner, comments);
		})
	}
	function moveNode (parent, child) {
		if (parent && child && child.parentElement !== parent) {
			parent.appendChild(child);
		}
	}
	function isLayoutApplied (wideLayout) {
		const secondaryInner = document.getElementById("secondary-inner");
		const comments = document.querySelector("#comments");
		const related = document.getElementById("related");
		const relatedParent = wideLayout ? document.getElementById("columns") : document.getElementById("primary-inner");

		return comments && comments.parentElement === secondaryInner && related && related.parentElement === relatedParent;
	}
	function scheduleSidebar () {
		clearTimeout(state.sidebarRetryTimer);
		state.sidebarRetryTimer = setTimeout(sidebar, 250);
	}
	function isCinemaModeActive () {
		const overlay = document.getElementById('overlay_cinema');
		return !!(overlay && overlay.style.display !== 'none');
	}
	function resizePlayer () {
		const player = document.querySelector("#player.style-scope.ytd-watch-flexy");
		const video = document.querySelector("#player .ytp-chrome-bottom") || document.querySelector("#container .ytp-chrome-bottom");
		const watchFlexy = document.querySelector("ytd-watch-flexy");
		const primary = document.getElementById("primary");

		// Don't set inline widths in fullscreen, theater, or cinema mode - let CSS handle it
		if (watchFlexy && (watchFlexy.hasAttribute("fullscreen") || watchFlexy.hasAttribute("theater") || isCinemaModeActive())) {
			// Clear any previously set inline widths to let CSS rules apply
			if (primary) primary.style.width = "";
			if (player) player.style.width = "";
			return;
		}

		const width = video ? video.offsetWidth + 24 : 24;
		if (width != 24 && primary && player) {
			primary.style.width = `${width}px`;
			player.style.width = `${width}px`;
		}
	}
	function styleScrollbars () {
		if (!navigator.userAgent.toLowerCase().includes("mac")) {
			let color, colorHover
			const isDarkMode = getComputedStyle(document.querySelector('ytd-app') || document.documentElement).getPropertyValue('--yt-spec-base-background') == "#0f0f0f";
			if (isDarkMode) [color, colorHover] = ["#616161", "#909090"];
			else [color, colorHover] = ["#aaaaaa", "#717171"];
			const style = document.getElementById("it-comments-sidebar-scrollbars") || document.createElement("style");
			style.id = "it-comments-sidebar-scrollbars";
			style.textContent = "";
			if (ImprovedTube.storage.comments_sidebar_scrollbars === true) {
				const cssRule = `
            #primary, #secondary {
                overflow: auto !important;
            }

            ::-webkit-scrollbar
            {
                width: 16px;
                height: 7px;
            }

            ::-webkit-scrollbar-thumb{
                background-color: ${color};
                border-radius: 10px;
                border: 4px solid transparent;
                background-clip: padding-box;
            }

            ::-webkit-scrollbar-thumb:hover{
                background-color: ${colorHover};
            }`;
				style.appendChild(document.createTextNode(cssRule));
			}
			else {	const cssRule = `
            #primary, #secondary {
                overflow: auto !important;
            }
            ::-webkit-scrollbar
            {
                width: 0px;
                height: 0px;
            }`;
			style.appendChild(document.createTextNode(cssRule));
			}
			if (!style.parentNode) {
				document.head.appendChild(style);
			}
		}
	}
	function applyObserver () {
		const video = document.querySelector("#player .ytp-chrome-bottom") || document.querySelector("#container .ytp-chrome-bottom");
		if (!video || typeof ResizeObserver === "undefined" || state.observedVideo === video) {
			return;
		}
		if (state.resizeObserver) {
			state.resizeObserver.disconnect();
		}
		const debouncedResizePlayer = debounce(resizePlayer, 200);
		state.resizeObserver = new ResizeObserver(debouncedResizePlayer);
		state.resizeObserver.observe(video);
		state.observedVideo = video;
	}
	function observeLayoutChanges () {
		const root = document.getElementById("columns") || document.body || document.documentElement;
		if (!root || typeof MutationObserver === "undefined" || state.observedLayoutRoot === root) {
			return;
		}
		if (state.layoutObserver) {
			state.layoutObserver.disconnect();
		}
		state.layoutObserver = new MutationObserver(function () {
			// Skip if the sidebar layout is already applied correctly
			const wideLayout = window.matchMedia("(min-width: 1952px)").matches;
			const mediumLayout = window.matchMedia("(min-width: 1000px)").matches;
			if ((wideLayout && state.hasApplied === 1 && isLayoutApplied(true)) ||
				(!wideLayout && mediumLayout && state.hasApplied === 2 && isLayoutApplied(false)) ||
				(!mediumLayout && state.hasApplied === 0)) {
				return;
			}
			clearTimeout(state.layoutTimer);
			state.layoutTimer = setTimeout(sidebar, 300);
		});
		state.layoutObserver.observe(root, {
			childList: true,
			subtree: true
		});
		state.observedLayoutRoot = root;
	}
	function debounce (callback, delay) {
		let timerId;
		return function (...args) {
			clearTimeout(timerId);
			timerId = setTimeout(() => {
				callback.apply(this, args);
			}, delay);
		};
	}
}
/*------------------------------------------------------------------------------
 HIDE TOP PROGRESS BAR
------------------------------------------------------------------------------*/
ImprovedTube.hideTopProgressBar = function () {
    var progressBar = document.querySelector(".top-progress-bar");
    if (progressBar) {
        progressBar.style.display = "none";
    }
};
}
/*------------------------------------------------------------------------------
 SIDEBAR
------------------------------------------------------------------------------*/
/*----------------------------------------------------------------
 TRANSCRIPT
--------------------------------------------------------------*/
ImprovedTube.transcript = function (el) { if (ImprovedTube.storage.transcript === true) {
	const available = el.querySelector('[target-id*=transcript][visibility*=HIDDEN]') || el.querySelector('[target-id*=transcript]')?.clientHeight;
	if (available) {
		if (!ImprovedTube.originalFocus) {ImprovedTube.originalFocus = HTMLElement.prototype.focus;}  // Backing up default method. Youtube doesn't use alternatives Element.prototype.scrollIntoView  window.scrollTo  window.scrollBy)
		ImprovedTube.forbidFocus =  function (ms) {
			HTMLElement.prototype.focus = function() {console.log("Preventing YouTube's scripted scrolling for a moment."); }
			if(document.hidden) ms = 3*ms;
			setTimeout(function() { HTMLElement.prototype.focus = ImprovedTube.originalFocus; }, ms); 	// Restoring JS's "focus()"
		}
		ImprovedTube.forbidFocus(2100);
		const descriptionTranscript = el.querySelector('ytd-video-description-transcript-section-renderer button[aria-label]');
		descriptionTranscript ? descriptionTranscript.click() : el.querySelector('[target-id*=transcript]')?.removeAttribute('visibility');
		if ( yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid === true ) { available.setAttribute('z-index', '98765') }
	}
}};
/*----------------------------------------------------------------
 CHAPTERS
--------------------------------------------------------------*/
ImprovedTube.chapters = function (el) { if (ImprovedTube.storage.chapters === true) {
	const available = el.querySelector('[target-id*=chapters][visibility*=HIDDEN]') || el.querySelector('[target-id*=chapters]')?.clientHeight;
	if (available) {
		if (!ImprovedTube.originalFocus) { ImprovedTube.originalFocus = HTMLElement.prototype.focus;}  // Backing up default method. Youtube doesn't use alternatives Element.prototype.scrollIntoView  window.scrollTo  window.scrollBy)
		ImprovedTube.forbidFocus =  function (ms) {
			HTMLElement.prototype.focus = function() {console.log("Preventing YouTube's scripted scrolling for a moment."); }
			if(document.hidden) ms = 3*ms;
			setTimeout(function() { HTMLElement.prototype.focus = ImprovedTube.originalFocus; }, ms); 	// Restoring JS's "focus()"
		}
		ImprovedTube.forbidFocus(2100);
		const modernChapters = el.querySelector('[modern-chapters] #navigation-button button[aria-label]');
		modernChapters ? modernChapters.click() : el.querySelector('[target-id*=chapters]')?.removeAttribute('visibility');
		if ( yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid === true ) { available.setAttribute('z-index', '98765') }
	}
}};
/*------------------------------------------------------------------------------
 LIVECHAT
------------------------------------------------------------------------------*/
ImprovedTube.livechat = function () {
	if (this.storage.livechat === "collapsed") {
		if (typeof isCollapsed === 'undefined') { var isCollapsed = false; }
		if (ImprovedTube.elements.livechat && !isCollapsed) {
			ImprovedTube.elements.livechat.button.click();
			isCollapsed = true
		}
	} /* else{
        if(isCollapsed){
            ImprovedTube.elements.livechat.button.click();
            isCollapsed = false
        }
    } */
};
/*------------------------------------------------------------------------------
  DETAILS
------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------
  EXTRA BUTTONS BELOW THE PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer = function () {
	if (window.self !== window.top) {	return false; 	}
	if (document.documentElement.dataset.pageType === 'video') {

		var section = document.querySelector('#subscribe-button');
	 /*  if (this.storage.description == "classic"
		||  this.storage.description == "classic_expanded" || this.storage.description == "classic_hidden"  )
	   {var section = document.querySelector('#flex.ytd-video-primary-info-renderer');}
   */
		if (section) {
			if (this.storage.below_player_loop !== false && !document.querySelector('#it-below-player-loop')) {
				var button = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		                var transparentOrOn = .5; if (this.storage.player_always_repeat === true ) { transparentOrOn = 1; }
				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-loop';
				button.dataset.tooltip = 'Loop';
				svg.style.opacity = transparentOrOn;
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');

				button.onclick = function () {
					var video = ImprovedTube.elements.video,
						svg = this.children[0];

					function matchLoopState (opacity) {
		    svg.style.opacity = opacity;
						if (ImprovedTube.storage.player_repeat_button === true) {
                   	 var otherButton = document.querySelector('#it-repeat-button');
                    	 otherButton.style.opacity = opacity;
          	        }
	            }
					if (video.hasAttribute('loop')) {
						video.removeAttribute('loop');
						matchLoopState('.5')
					} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
						video.setAttribute('loop', '');
						matchLoopState('1')
					}
				};

				svg.appendChild(path); 	button.appendChild(svg);
				section.insertAdjacentElement('afterend', button)
			}
			if (this.storage.below_player_pip === true && !document.querySelector('#it-below-player-pip')) {
				var button = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-pip';
				button.dataset.tooltip = 'PiP';
				svg.style.opacity = '.64';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

				button.onclick = function () {
					ImprovedTube.enterPip();
				};

				svg.appendChild(path);	button.appendChild(svg);
				section.insertAdjacentElement('afterend', button)
			}

			if (this.storage.below_player_screenshot !== false && !document.querySelector('#it-below-player-screenshot')) {
				var button = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-screenshot';
				button.dataset.tooltip = 'Screenshot';
				svg.style.opacity = '.55';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');

				button.onclick = ImprovedTube.screenshot;

				svg.appendChild(path);	button.appendChild(svg);
				section.insertAdjacentElement('afterend', button)
			}

			if (this.storage.below_player_keyscene !== false && !document.querySelector('#it-below-player-keyscene')) {
				var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				g = document.createElementNS('http://www.w3.org/2000/svg', 'g'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-keyscene';
				button.style.marginRight = '-0.2px';
				button.dataset.tooltip = 'Key Scene';
				svg.style.opacity = '.55';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				g.setAttributeNS(null, 'transform', 'translate(5, 0)');
				path.setAttributeNS(null, 'd', 'M13 2 L3 14 H10 L8 22 L20 10 H13 L15 2 Z');

				button.onclick = ImprovedTube.jumpToKeyScene;

				g.appendChild(path);
				svg.appendChild(path);
				button.appendChild(svg);
				if (this.storage.below_player_screenshot !== false) {
					const screenshotButton = document.querySelector('[data-tooltip="Screenshot"]');
					screenshotButton?.parentElement?.insertBefore(button, screenshotButton);
				} else { section.insertAdjacentElement('afterend', button) }
			}

			let copyVideoUrlButton = this.storage.copy_video_url === true;

			if (this.storage.copy_video_id === true && !document.querySelector('#it-below-player-copy-video-id')) {
				var button = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-copy-video-id';
				button.dataset.tooltip = 'CopyVideoId';
				svg.style.opacity = '.5';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z');
				button.onclick = function () {
					svg.style.opacity = '1';
					const videoURL = ImprovedTube.elements.player?.getVideoUrl();
					if (copyVideoUrlButton) {
						navigator.clipboard.writeText(videoURL);
					} else {
						const videoId = videoURL.match(ImprovedTube.regex.video_id)?.[1];
						navigator.clipboard.writeText(videoId);
					}
					button.dataset.tooltip = 'Copied!';
					setTimeout(function() {
						button.dataset.tooltip = 'CopyVideoID';
						svg.style.opacity = '.5';
					}, 500);
				}

				svg.appendChild(path);	button.appendChild(svg);
				section.insertAdjacentElement('afterend', button)
			}

			if (this.storage.copy_transcript !== false && !document.querySelector('#it-below-player-copy-transcript')) {
				var button = document.createElement('button'),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
					path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				button.className = 'improvedtube-player-button';
				button.id = 'it-below-player-copy-transcript';
				button.dataset.tooltip = 'CopyTranscript';
				svg.style.opacity = '.5';
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				path.setAttributeNS(null, 'd', 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z');

				button.onclick = function () {
					ImprovedTube.copyTranscript(svg, button);
				};

				svg.appendChild(path);
				button.appendChild(svg);
				section.insertAdjacentElement('afterend', button);
			}
	  }
	}
};
/*------------------------------------------------------------------------------
 EXPAND DESCRIPTION
------------------------------------------------------------------------------*/
ImprovedTube.expandDescription = function (el) {
	if (this.storage.description === "expanded") {
		if (!ImprovedTube.originalFocus) { ImprovedTube.originalFocus = HTMLElement.prototype.focus;}  // Backing up default method. Youtube doesn't use alternatives Element.prototype.scrollIntoView  window.scrollTo  window.scrollBy)
		ImprovedTube.forbidFocus =  function (ms) {
			HTMLElement.prototype.focus = function() {console.log("Preventing YouTube's scripted scrolling for a moment."); }
			if(document.hidden) ms = 3*ms;
			setTimeout(function() { HTMLElement.prototype.focus = ImprovedTube.originalFocus; }, ms); 	// Restoring JS's "focus()"
		}
		if (el) {
			ImprovedTube.forbidFocus(2100); // setTimeout(function () {ImprovedTube.elements.player.focus();}, 2500);
			el.click();
		}
		else { // wait for the description
			var tries = 0; 	var intervalMs = 210; if (location.href.indexOf('/watch?') !== -1) {var maxTries = 10;} else {var maxTries = 0;} // ...except when it is an embedded player?
			var waitForDescription = setInterval(() => {
				if (++tries >= maxTries) {
					if (el) {
						ImprovedTube.forbidFocus(2600);  // setTimeout(function () {ImprovedTube.elements.player.focus();}, 1000);
						el.click();
						clearInterval(waitForDescription);
					}
					el = document.querySelector('#description-inline-expander')
					intervalMs *= 1.11;	}}, intervalMs);
		}
	}
}
/*------------------------------------------------------------------------------
 HIDE DETAIL BUTTON
------------------------------------------------------------------------------*/
// ImprovedTube.hideDetailButton = function (el) {
//     if (el.length === 4) {
//         el[3].setAttribute("id", "Save-button");
//         el[2].setAttribute("id", "Clip-button");
//         el[1].setAttribute("id", "Thanks-button");
//     }
//     else if (el.length === 3) {
//         el[2].setAttribute("id", "Save-button");
//         el[1].setAttribute("id", "Clip-button");
//     }
// };
/*--------------------------------------------------------------
 DAY OF WEEK
--------------------------------------------------------------*/
ImprovedTube.dayOfWeek = function () {
	if (this.storage.day_of_week === true) {
		var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		setTimeout(function () { //YouTube related video or internal link?:
			var videoDate; try { videoDate = JSON.parse(document.querySelector('#microformat script')?.textContent)?.uploadDate
				 } catch { try { videoDate = document.querySelector("[itemprop=datePublished]").content; } catch { } }
								//..no? must be new session?
			var tempDate = new Date(videoDate);
			var element = document.querySelector(".ytd-day-of-week");
			if (!element) {
				var label = document.createElement("span");
				label.textContent = days[tempDate.getDay()] + '  ';
				label.className = "ytd-day-of-week";
				//update please:
				try { document.querySelector("#info span:nth-child(2)")?.append(label);	}
					catch {	try {document.querySelector("#info #info-strings yt-formatted-string")?.append(label);
					} catch {}
				}
			} // else { element.textContent = days[tempDate.getDay()] + ", "; }
		}, 4321);
	}
};
/*------------------------------------------------------------------------------
 SHOW EXACT UPLOAD DATE
------------------------------------------------------------------------------*/
// ImprovedTube.exactUploadDate = function () {
// 	if(this.exact_date==true && this.elements.yt_channel_link) {
// 		// var xhr = new XMLHttpRequest(),
// 		// 	key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey,
// 		// 	id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");
// 		// xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, false);
// 		// xhr.send();
// 		// if (xhr.readyState === xhr.DONE && xhr.status === 200) {
// 		// 	var response = JSON.parse(xhr.responseText);
// 		// 	var date = response.items[0].snippet.publishedA;
// 		// 	var element = ImprovedTube.elements.exact_upload_date || document.createElement("div");
// 		// 	ImprovedTube.empty(element);
// 		// 	element.appendChild(document.createTextNode("• " + date.toLocaleDateString()));
// 		// 	element.className = "it-exact-upload-date";
// 		// 	ImprovedTube.elements.exact_upload_date = element;
// 		// 	document.querySelector("#info #info-text").appendChild(element);
// 		// }
// 		var xhr = new XMLHttpRequest(),
// 			key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey,

// 			id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");
// 		xhr.addEventListener("load", function () {
// 			var response = JSON.parse(this.responseText);
// 				element = ImprovedTube.elements.exact_date || document.createElement("div");

// 			ImprovedTube.empty(element);

// 			if (response.error) {
// 				element.appendChild(document.createTextNode("• Error: " + response.error.code));
// 			} else {
// 				element.appendChild(document.createTextNode("• " + response.items[0].snippet.publishedAt));
// 			}

// 			element.className = "it-channel-exact-upload-date";

// 			ImprovedTube.elements.exact_date = element;

// 			document.querySelector("#info #info-text").appendChild(element);
// 		});

// 		xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, true);
// 		xhr.send();
// 		console.log("exact date toggle on")
// 	}
// 	console.log("exact date tesst")
// };
ImprovedTube.exactUploadDate = function () {
    if (this.storage.exact_date === true) {
        const xhr = new XMLHttpRequest();
        const key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey;
        const id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");

        xhr.addEventListener("load", function () {
            const response = JSON.parse(this.responseText);
            const element = ImprovedTube.elements.exact_date || document.createElement("div");

            ImprovedTube.empty(element);

            if (response.error) {
                element.appendChild(document.createTextNode(`• Error: ${response.error.code}`));
            } else {
                const publishedDate = new Date(response.items[0].snippet.publishedAt);
                element.appendChild(document.createTextNode(`• ${publishedDate.toLocaleDateString()}`));
            }

            element.className = "it-channel-exact-upload-date";
            ImprovedTube.elements.exact_date = element;
            document.querySelector("#info #info-text").appendChild(element);
        });

        xhr.open("GET", `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${key}`, true);
        xhr.send();
        // console.log("exact date toggle on");
    }
};
/*------------------------------------------------------------------------------
 HOW LONG AGO THE VIDEO WAS UPLOADED
------------------------------------------------------------------------------*/
ImprovedTube.howLongAgoTheVideoWasUploaded = function () {
	if (this.storage.how_long_ago_the_video_was_uploaded === true && this.elements.yt_channel_name) {
		var xhr = new XMLHttpRequest(),
			key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey,
			id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");

		function timeSince (date) {
			var seconds = Math.floor((new Date() - new Date(date)) / 1000),
				interval = Math.floor(seconds / 31536000);

			if (interval > 1) {
				return interval + " years ago";
			}
			interval = Math.floor(seconds / 2592000);
			if (interval > 1) {
				return interval + " months ago";
			}
			interval = Math.floor(seconds / 86400);
			if (interval > 1) {
				return interval + " days ago";
			}
			interval = Math.floor(seconds / 3600);
			if (interval > 1) {
				return interval + " hours ago";
			}
			interval = Math.floor(seconds / 60);
			if (interval > 1) {
				return interval + " minutes ago";
			}

			return Math.floor(seconds) + " seconds ago";
		}

		xhr.addEventListener("load", function () {
			var response = JSON.parse(this.responseText),
				element = ImprovedTube.elements.how_long_ago_the_video_was_uploaded || document.createElement("div");

			ImprovedTube.empty(element);

			if (response.error) {
				element.appendChild(document.createTextNode("• Error: " + response.error.code));
			} else {
				element.appendChild(document.createTextNode("• " + timeSince(response.items[0].snippet.publishedAt)));
			}

			element.className = "it-how-long-ago-the-video-was-uploaded";

			ImprovedTube.elements.how_long_ago_the_video_was_uploaded = element;

			document.querySelector("#info #info-text").appendChild(element);
		});

		xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, true);
		xhr.send();
	}
};
/*------------------------------------------------------------------------------
 SHOW CHANNEL VIDEOS COUNT
------------------------------------------------------------------------------*/
ImprovedTube.channelVideosCount = function () {
	if (this.storage.channel_videos_count === true && this.elements.yt_channel_link) {
		var key = this.storage["google-api-key"] || ImprovedTube.defaultApiKey;
		if (this.elements.yt_channel_link.href.indexOf("/channel/") == -1) {
			var xhr = new XMLHttpRequest(),
				id = this.getParam(location.href.slice(location.href.indexOf("?") + 1), "v");
			xhr.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=" + key, false);
			xhr.send();
			if (xhr.readyState === xhr.DONE && xhr.status === 200) {
				var response = JSON.parse(xhr.responseText);
				id = response.items[0].snippet.channelId;
			}
		} else {
			id = this.elements.yt_channel_link.href.slice(this.elements.yt_channel_link.href.indexOf("/channel/") + "/channel/".length);
			if (id.indexOf("/") !== -1) {
				id = id.match(/.+?(?=\/)/)[0];
			}
		}

		xhr = new XMLHttpRequest();

		xhr.addEventListener("load", function () {
			var response = JSON.parse(this.responseText),
				parent = document.querySelector("#meta ytd-channel-name + yt-formatted-string"),
				element = ImprovedTube.elements.channel_videos_count || document.createElement("div");

			ImprovedTube.empty(element);

			if (response.error) {
				element.appendChild(document.createTextNode("• Error: " + response.error.code));
			} else {
				element.appendChild(document.createTextNode("• " + response.items[0].statistics.videoCount + " videos"));
			}

			element.className = "it-channel-videos-count";

			ImprovedTube.elements.channel_videos_count = element;

			parent.appendChild(element);

			ImprovedTube.elements.channel_videos_count = element;
		});

		xhr.open("GET", "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" + id + "&key=" + key, true);
		xhr.send();
	}
};
if (ImprovedTube.storage.header_transparent2 === true) {
	/*------------------------------------------------------------------------------
    TURN TOP BAR TRANSPARENT WHEN SCROLLING
    ------------------------------------------------------------------------------*/
	window.addEventListener('scroll', function () {
		var masthead = document.querySelector('html[it-header-transparent=true] ytd-masthead');
		var endButtons = masthead.querySelector('#end');

		if (window.scrollY === 0) {
			endButtons.style.visibility = 'visible';
		} else {
			endButtons.style.visibility = 'hidden';
		}
	});

	function handleScroll () {
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		var buttonsContainer = document.getElementById('buttons');

		if (scrollTop > 100) {
			buttonsContainer.classList.add('hidden');
		} else {
			buttonsContainer.classList.remove('hidden');
		}
	}

	/*------------------------------------------------------------------------------
    CHECK IF USER IS SCROLLING
    ------------------------------------------------------------------------------*/
	window.addEventListener("scroll", handleScroll);

	function getScrollDirection () {
		var lastScrollTop = 0;
		return function () {
			var st = window.pageYOffset || document.documentElement.scrollTop;
			var scrollDirection = st > lastScrollTop ? 'down' : 'up';
			lastScrollTop = st <= 0 ? 0 : st;
			return scrollDirection;
		};
	}

	var scrollDirection = getScrollDirection();

	window.addEventListener('scroll', function () {
		var direction = scrollDirection();
		if (direction === 'down') {
			document.documentElement.setAttribute('data-scroll-direction', 'down');
		} else {
			document.documentElement.removeAttribute('data-scroll-direction');
		}
	});
}

/*------------------------------------------------------------------------------
REVERT THEATER MODE BUTTON SIZES
------------------------------------------------------------------------------*/
// sets variable condition based on player switch
ImprovedTube.playerRevertTheaterButtonSize = function () {
	if (ImprovedTube.storage.player_revert_theater_button_sizes === true) {
		document.documentElement.setAttribute('it-revert-theater-button-size', 'true');
	} else {
		document.documentElement.removeAttribute('it-revert-theater-button-size');
	}
}

// initializer
ImprovedTube.playerRevertTheaterButtonSize();

// call function on page load and on navigation
(function() {
    var run = function() { ImprovedTube.playerRevertTheaterButtonSize && ImprovedTube.playerRevertTheaterButtonSize(); };
    document.addEventListener('yt-page-data-updated', run);
    document.addEventListener('yt-navigate-finish', run);
    window.addEventListener('load', run);
    setTimeout(run, 2000); // fallback for late loads
})();

/*------------------------------------------------------------------------------
DISABLE LIKES ANIMATION
------------------------------------------------------------------------------*/
if (ImprovedTube.storage.disable_likes_animation === true) {
ImprovedTube.disableLikesAnimation = function () {
        // Find all like counters with animation
        var likeAnimated = document.querySelectorAll('yt-animated-rolling-number');
        likeAnimated.forEach(function (el) {
            // Replace with static number
            var staticValue = el.getAttribute('value') || el.textContent;
            if (staticValue) {
                var span = document.createElement('span');
                span.textContent = staticValue;
                span.style.verticalAlign = 'baseline';
                span.style.fontVariantNumeric = 'tabular-nums'; // align digits
                el.replaceWith(span);
            }
        });
    }
// Call this on page load and on navigation
(function() {
    var run = function() { ImprovedTube.disableLikesAnimation && ImprovedTube.disableLikesAnimation(); };
    document.addEventListener('yt-page-data-updated', run);
    document.addEventListener('yt-navigate-finish', run);
    window.addEventListener('load', run);
    setTimeout(run, 2000); // fallback for late loads
})();
};

/*------------------------------------------------------------------------------
VIDEO FILTERS (BRIGHTNESS, CONTRAST, SATURATION, HUE, SHARPNESS, GAMMA)
------------------------------------------------------------------------------*/
ImprovedTube.videoFilters = function () {
	const isEnabled = this.storage.video_filters_activate !== false && (
		this.storage.video_filters_activate === true ||
		(this.storage.video_filters_preset && this.storage.video_filters_preset !== 'normal') ||
		(this.isset(this.storage.video_filter_brightness) && Number(this.storage.video_filter_brightness) !== 100) ||
		(this.isset(this.storage.video_filter_contrast) && Number(this.storage.video_filter_contrast) !== 100) ||
		(this.isset(this.storage.video_filter_saturation) && Number(this.storage.video_filter_saturation) !== 100) ||
		(this.isset(this.storage.video_filter_hue) && Number(this.storage.video_filter_hue) !== 0) ||
		(this.isset(this.storage.video_filter_sharpness) && Number(this.storage.video_filter_sharpness) > 0) ||
		(this.isset(this.storage.video_filter_gamma) && Number(this.storage.video_filter_gamma) !== 1)
	);

	if (!isEnabled  // move to /js&css/web-accessible/core.js    && !document.getElementById('it-video-filters-style')
				) {
		return;
	}

	const activate = this.storage.video_filters_activate !== false;
	const preset = this.storage.video_filters_preset || 'custom';

	let b = Number(this.storage.video_filter_brightness); if (!isFinite(b)) b = 100;
	let c = Number(this.storage.video_filter_contrast); if (!isFinite(c)) c = 100;
	let s = Number(this.storage.video_filter_saturation); if (!isFinite(s)) s = 100;
	let h = Number(this.storage.video_filter_hue); if (!isFinite(h)) h = 0;
	let sh = Number(this.storage.video_filter_sharpness); if (!isFinite(sh)) sh = 0;
	let g = Number(this.storage.video_filter_gamma); if (!isFinite(g)) g = 1;

	if (preset === 'vivid') {
		b = 105; c = 115; s = 140; h = 0; sh = 1; g = 1;
	} else if (preset === 'cinema') {
		b = 95; c = 120; s = 85; h = 0; sh = 0.5; g = 1.1;
	} else if (preset === 'warm') {
		b = 100; c = 105; s = 115; h = -10; sh = 0; g = 1;
	} else if (preset === 'cool') {
		b = 102; c = 105; s = 105; h = 10; sh = 0; g = 1;
	} else if (preset === 'normal') {
		b = 100; c = 100; s = 100; h = 0; sh = 0; g = 1;
	}

	let styleEl = document.getElementById('it-video-filters-style');
	let svgEl = document.getElementById('it-video-filters-svg');

	if (!activate || (b === 100 && c === 100 && s === 100 && h === 0 && sh === 0 && g === 1)) {
		if (styleEl) styleEl.remove();
		if (svgEl) svgEl.remove();
		const btn = document.querySelector('#it-video-filters-button');
		if (btn) {
			btn.style.opacity = '0.55';
			btn.classList.remove('it-video-filters-active');
		}
		return;
	}

	if (!svgEl) {
		svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svgEl.id = 'it-video-filters-svg';
		svgEl.style.cssText = 'position: absolute; width: 0; height: 0; pointer-events: none;';
		document.documentElement.appendChild(svgEl);
	}

	let svgFilterUrl = '';

	if (sh > 0 || g !== 1) {
		svgFilterUrl = ' url(#it-video-filter)';
		const center = (1 + 4 * sh).toFixed(2);
		const neg = (-sh).toFixed(2);
		const kernel = `0 ${neg} 0 ${neg} ${center} ${neg} 0 ${neg} 0`;
		const exp = g > 0 ? (1 / g).toFixed(3) : 1;

		svgEl.innerHTML = `
			<filter id="it-video-filter">
				${sh > 0 ? `<feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="${kernel}" result="sharp"/>` : ''}
				${g !== 1 ? `
					<feComponentTransfer ${sh > 0 ? 'in="sharp"' : ''}>
						<feFuncR type="gamma" exponent="${exp}"/>
						<feFuncG type="gamma" exponent="${exp}"/>
						<feFuncB type="gamma" exponent="${exp}"/>
					</feComponentTransfer>
				` : ''}
			</filter>
		`;
	} else {
		svgEl.innerHTML = '';
	}

	if (!styleEl) {
		styleEl = document.createElement('style');
		styleEl.id = 'it-video-filters-style';
		document.documentElement.appendChild(styleEl);
	}

	const filterCss = `brightness(${b}%) contrast(${c}%) saturate(${s}%) hue-rotate(${h}deg)${svgFilterUrl}`;
	styleEl.textContent = `.html5-video-player video { filter: ${filterCss} !important; }`;

	const btn = document.querySelector('#it-video-filters-button');
	if (btn) {
		btn.style.opacity = '1';
		btn.classList.add('it-video-filters-active');
	}
};

/*------------------------------------------------------------------------------
CC (SUBTITLES) INDICATOR ON CHANNEL VIDEOS PAGE
------------------------------------------------------------------------------*/
if (ImprovedTube.storage.cc_indicator === true) {
ImprovedTube.ccIndicator = function () {
	// Selectors for video renderer elements across different YouTube page layouts
	var VIDEO_RENDERERS = [
		'ytd-grid-video-renderer',
		'ytd-rich-item-renderer',
		'ytd-compact-video-renderer',
		'ytd-video-renderer',
		'ytd-playlist-video-renderer'
	].join(',');

	function isChannelVideosPage() {
		return /\/(channel|user|c|@)[^/]+\/(videos|search)/.test(location.pathname);
	}

	/**
	 * Check if a video renderer element has captions available by examining
	 * YouTube's internal data model (__dataHost.__data.data).
	 */
	function hasCaptions(rendererEl) {
		try {
			var data = rendererEl.__dataHost && rendererEl.__dataHost.__data
				? rendererEl.__dataHost.__data.data
				: (rendererEl.data || null);

			if (!data) return false;

			// Check for "CC" badge in badges array
			var badges = data.badges || data.ownerBadges || [];
			for (var i = 0; i < badges.length; i++) {
				var badge = badges[i];
				var metadata = badge.metadataBadgeRenderer || badge;
				var label = metadata.label || metadata.style || '';
				if (label === 'CC' || label === 'Captions' ||
					metadata.style === 'BADGE_STYLE_TYPE_CC') {
					return true;
				}
			}

			// Check for captionTrackingParams
			if (data.captionTrackingParams) return true;

			// Check detailedMetadataSnippets for captionEndpoint references
			if (data.detailedMetadataSnippets) {
				for (var j = 0; j < data.detailedMetadataSnippets.length; j++) {
					var snippets = data.detailedMetadataSnippets[j].snippetText;
					if (snippets && snippets.runs) {
						for (var k = 0; k < snippets.runs.length; k++) {
							var ep = snippets.runs[k].navigationEndpoint;
							if (ep && ep.captionEndpoint) return true;
						}
					}
				}
			}

			return false;
		} catch (e) {
			return false;
		}
	}

	function updateCcIndicator(rendererEl) {
		if (!rendererEl) return;
		var hasCc = hasCaptions(rendererEl);
		var existing = rendererEl.querySelector('.it-cc-indicator');

		if (hasCc && !existing) {
			var titleAnchor = rendererEl.querySelector('#video-title a, h3#video-title a');
			if (!titleAnchor) return;

			var indicator = document.createElement('span');
			indicator.className = 'it-cc-indicator';
			indicator.textContent = 'CC';
			indicator.title = 'Captions available';
			indicator.style.cssText = 'font-family:Roboto,Arial,sans-serif;font-size:10px;font-weight:500;color:var(--yt-spec-text-secondary);background:var(--yt-spec-badge-chip-background);border-radius:2px;padding:1px 4px;margin-left:4px;vertical-align:middle;display:inline-block;line-height:14px;cursor:default;';
			titleAnchor.parentNode.insertBefore(indicator, titleAnchor.nextSibling);
		} else if (!hasCc && existing) {
			existing.remove();
		}
	}

	function scanAllRenderers() {
		if (!isChannelVideosPage()) return;
		document.querySelectorAll(VIDEO_RENDERERS).forEach(updateCcIndicator);
	}

	scanAllRenderers();

	document.addEventListener('yt-navigate-finish', function () {
		setTimeout(scanAllRenderers, 300);
	});

	var ccObserver = new MutationObserver(function (mutations) {
		if (!isChannelVideosPage()) return;
		for (var i = 0; i < mutations.length; i++) {
			if (mutations[i].type !== 'childList') continue;
			for (var j = 0; j < mutations[i].addedNodes.length; j++) {
				var node = mutations[i].addedNodes[j];
				if (node.nodeType !== 1) continue;
				if (node.nodeName && VIDEO_RENDERERS.indexOf(node.nodeName.toLowerCase()) !== -1) {
					updateCcIndicator(node);
				}
				var children = node.querySelectorAll ? node.querySelectorAll(VIDEO_RENDERERS) : [];
				for (var k = 0; k < children.length; k++) {
					updateCcIndicator(children[k]);
				}
			}
		}
	});

	ccObserver.observe(document.body, { childList: true, subtree: true });
};

(function() {
	var run = function() { ImprovedTube.ccIndicator && ImprovedTube.ccIndicator(); };
	document.addEventListener('yt-navigate-finish', run);
	window.addEventListener('load', run);
	setTimeout(run, 1000);
})();
};
