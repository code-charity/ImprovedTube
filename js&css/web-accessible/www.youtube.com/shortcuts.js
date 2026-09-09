/*------------------------------------------------------------------------------
4.7.0 SHORTCUTS

WARNING: Browser Debugger Breakpoint downstream from keydown() event will eat corresponding keyup()
 thus breaking our tracking of ImprovedTube.input.pressed.keys (stuck key) until said Breakpoint
 is disabled and key pressed again OR switching tabs/windows to trigger 'improvedtube-blur'.
 Make sure to have that in mind when debugging.
------------------------------------------------------------------------------*/
ImprovedTube.shortcutsInit = function () {
	// those four are _references_ to source Objects, not copies
	const listening = ImprovedTube.input.listening,
		listeners = ImprovedTube.input.listeners;

	// reset 'listening' shortcuts
	for (var key in listening) delete listening[key];
	// extract shortcuts from User Settings and initialize 'listening'
	for (const [name, keys] of Object.entries(this.storage).filter(v => v[0].startsWith('shortcut_'))) {
		if (!keys) continue;
		// camelCase(name)
		const camelName = name.replace(/_(.)/g, (m, l) => l.toUpperCase());
		let potentialShortcut = {};
		for (const button of ['alt', 'ctrl', 'shift', 'wheel', 'keys', 'toggle']) {
			switch (button) {
				case 'alt':
				case 'ctrl':
				case 'shift':
				case 'toggle':
					potentialShortcut[button] = keys[button] || false;
					break

				case 'wheel':
					potentialShortcut[button] = keys[button] || 0;
					break

				case 'keys':
					// set of unique scancodes
					potentialShortcut[button] = keys[button] ? new Set(Object.keys(keys[button]).map(s=>Number(s))) : new Set();
					break
			}
		}
		if (potentialShortcut['keys'].size || potentialShortcut['wheel']) listening[camelName] = potentialShortcut;
	}
	// initialize 'listeners' only if there are actual shortcuts active
	if (Object.keys(listening).length) {
		for (const [name, handler] of Object.entries(this.shortcutsListeners)) {
			// only one listener per handle
			if (!listeners[name]) {
				listeners[name] = true;
				window.addEventListener(name, handler, {passive: false, capture: true});
			}
		}

		// Issue #3986: a missed keyup — focus moving to the player/an ad iframe,
		// an SPA navigation, or a tab switch, all common while the connection is
		// unstable — leaves a key stuck in input.pressed.keys. Because
		// shortcutsHandler() requires an EXACT key-set size match, a single stuck
		// key silently disables EVERY shortcut. The only existing recovery is the
		// 'improvedtube-blur' event, dispatched from the extension side (core.js)
		// over the messaging path / MV3 background worker — which the same network
		// instability can suspend, so shortcuts stay dead until a manual reload.
		// Bind the same reset to native, in-page events so recovery is immediate
		// and never depends on the background worker. Clearing an already-empty
		// set is a harmless no-op, so we bind once and leave it.
		if (!this.input.recoveryListenersBound) {
			this.input.recoveryListenersBound = true;
			const resetPressedKeys = this.shortcutsListeners['improvedtube-blur'];
			window.addEventListener('blur', resetPressedKeys);
			document.addEventListener('visibilitychange', function () {
				if (document.hidden) resetPressedKeys();
			});
			document.addEventListener('yt-navigate-start', resetPressedKeys);
		}
	} else {
		// no shortcuts means we dont need 'listeners', uninstall all
		for (const [name, handler] of Object.entries(this.shortcutsListeners)) {
			if (listeners[name]) {
				delete listeners[name];
				window.removeEventListener(name, handler, {passive: false, capture: true});
			}
		}
	}
};

ImprovedTube.shortcutsHandler = function () {
	check: for (const [key, shortcut] of Object.entries(ImprovedTube.input.listening)) {
		if (ImprovedTube.input.pressed.keys.size != shortcut.keys.size
			|| ImprovedTube.input.pressed.wheel != shortcut.wheel
			|| ImprovedTube.input.pressed.alt != shortcut.alt
			|| ImprovedTube.input.pressed.ctrl != shortcut.ctrl
			|| ImprovedTube.input.pressed.shift != shortcut.shift) continue;

		for (const pressedKey of ImprovedTube.input.pressed.keys.values()) {
			if (!shortcut.keys.has(pressedKey)) continue check;
		}

		// cancel keydown/wheel event before we call target handler
		// this way crashing handler wont keep 'cancelled' keys stuck
		event.preventDefault();
		event.stopPropagation();
		// build 'cancelled' list so we also cancel keyup events
		for (const pressedKey of ImprovedTube.input.pressed.keys.values()) {
			ImprovedTube.input.cancelled.add(pressedKey);
		}

		if (key.startsWith('shortcutQuality')) {
			ImprovedTube['shortcutQuality'](key);
		} else if (key.startsWith('shortcutPlaybackSpeed')) {
			ImprovedTube['shortcutPlaybackSpeed'](key);
		} else if (typeof ImprovedTube[key] === 'function') {
			ImprovedTube[key]();
		}
	}
};

ImprovedTube.shortcutsListeners = {
	keydown: function (event) {
		ImprovedTube.user_interacted = true;
		// no shortcuts over 'ignoreElements'
		if ((document.activeElement && ImprovedTube.input.ignoreElements.includes(document.activeElement.tagName)) || event.target.isContentEditable) return;

		if (!ImprovedTube.input.modifierKeys.includes(event.code)) {
			ImprovedTube.input.pressed.keys.add(event.keyCode);
		}
		ImprovedTube.input.pressed.wheel = 0;
		ImprovedTube.input.pressed.alt = event.altKey;
		ImprovedTube.input.pressed.ctrl = event.ctrlKey;
		ImprovedTube.input.pressed.shift = event.shiftKey;

		ImprovedTube.shortcutsHandler();
	},
	keyup: function (event) {
		ImprovedTube.input.pressed.keys.delete(event.keyCode);
		ImprovedTube.input.pressed.wheel = 0;
		ImprovedTube.input.pressed.alt = event.altKey;
		ImprovedTube.input.pressed.ctrl = event.ctrlKey;
		ImprovedTube.input.pressed.shift = event.shiftKey;

		// cancel keyup events corresponding to keys that triggered one of our shortcuts
		if (ImprovedTube.input.cancelled.has(event.keyCode)) {
			event.preventDefault();
			event.stopPropagation();
			ImprovedTube.input.cancelled.delete(event.keyCode);
		}
	},
	wheel: function (event) {
	const player = ImprovedTube.elements.player;
	if (!player) return;

	const path = event.composedPath?.() || [];

	if (
		!player.matches(':hover') &&
		!path.includes(player) &&
		!path.includes(ImprovedTube.elements.video)
	) return;

	ImprovedTube.input.pressed.wheel = event.deltaY > 0 ? 1 : -1;
	ImprovedTube.input.pressed.alt = event.altKey;
	ImprovedTube.input.pressed.ctrl = event.ctrlKey;
	ImprovedTube.input.pressed.shift = event.shiftKey;

	ImprovedTube.shortcutsHandler();
},
	'improvedtube-blur': function () {
		ImprovedTube.input.pressed.keys.clear();
		ImprovedTube.input.pressed.wheel = 0
		ImprovedTube.input.pressed.alt = false;
		ImprovedTube.input.pressed.ctrl = false;
		ImprovedTube.input.pressed.shift = false;
	}
};
/*--- jump To Key Scene ----*/
ImprovedTube.shortcutJumpToKeyScene = ImprovedTube.jumpToKeyScene;
/*------------------------------------------------------------------------------
Ambient lighting
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleAmbientLighting = function () {
	document.documentElement.toggleAttribute('it-ambient-lighting');
};
/*------------------------------------------------------------------------------
4.7.1 QUALITY
------------------------------------------------------------------------------*/
ImprovedTube.shortcutQuality = function (key) {
	const label = ['auto', 'tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'],
		resolution = ['auto', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p', '2880p', '4320p'];

	ImprovedTube.playerQuality(label[resolution.indexOf(key.replace('shortcutQuality', ''))]);
};
/*------------------------------------------------------------------------------
4.7.1B PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutPlaybackSpeed = function (key) {
	const match = key.match(/^shortcutPlaybackSpeed(\d+)$/);
	if (!match) return;

	let num = match[1];

	let speed;
	if (num.startsWith("0")) {
		speed = parseFloat("0." + num.slice(1));
	} else if (num.length === 1) {
		speed = parseFloat(num);
	} else if (num.length === 2) {
		speed = parseFloat(num[0] + "." + num[1]);
	} else {
		speed = parseFloat(num.slice(0, -2) + "." + num.slice(-2));
	}

	//console.log(speed);

	if (speed === undefined || isNaN(speed)) return;

	ImprovedTube.playbackSpeed(speed);
	ImprovedTube.showStatus(speed);
};
/*------------------------------------------------------------------------------
4.7.2 PICTURE IN PICTURE (PIP)
------------------------------------------------------------------------------*/
ImprovedTube.shortcutPictureInPicture = this.enterPip;
/*------------------------------------------------------------------------------
4.7.3 TOGGLE CONTROLS
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleControls = function () {
	const player = this.elements.player;
	let option = this.storage.player_hide_controls;

	if (player && player.hideControls && player.showControls) {
		if (option === 'when_paused') {
			if (this.elements.video.paused) {
				option = 'off';
			} else {
				option = 'always';
			}
		} else if (option === 'always') {
			option = 'off';
		} else {
			option = 'always';
		}

		this.storage.player_hide_controls = option;
		ImprovedTube.playerControls()
	}
};
/*------------------------------------------------------------------------------
4.7.4 PLAY / PAUSE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutPlayPause = function () {
	const video = this.elements.video;
	if (video) {
		if (video.paused) {
			video.play();
		} else {
			video.pause();
		}
	}
};
/*------------------------------------------------------------------------------
4.7.5 STOP
------------------------------------------------------------------------------*/
ImprovedTube.shortcutStop = function () {
	this.elements.player?.stopVideo();
};
/*------------------------------------------------------------------------------
4.7.6 TOGGLE AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleAutoplay = function () {
	this.storage.player_autoplay_disable = !this.storage.player_autoplay_disable;
};
/*------------------------------------------------------------------------------
4.7.7 NEXT VIDEO
------------------------------------------------------------------------------*/
ImprovedTube.shortcutNextVideo = function () {
	var player = this.elements.player;
	if (!player) return;

	// In playlist context, use the player's built-in next button which
	// correctly navigates within the playlist. player.nextVideo() may
	// navigate outside the playlist on recent YouTube versions.
	if (ImprovedTube.getParam(location.href, 'list')) {
		var nextBtn = player.querySelector('.ytp-next-button');
		if (nextBtn) {
			nextBtn.click();
			return;
		}
	}
	player.nextVideo();
};
/*------------------------------------------------------------------------------
4.7.8 PREVIOUS VIDEO
------------------------------------------------------------------------------*/
ImprovedTube.shortcutPrevVideo = function () {
	var player = this.elements.player;
	if (!player) return;

	// In playlist context, use the player's built-in prev button which
	// correctly navigates within the playlist.
	if (ImprovedTube.getParam(location.href, 'list')) {
		var prevBtn = player.querySelector('.ytp-prev-button');
		if (prevBtn) {
			prevBtn.click();
			return;
		}
	}
	player.previousVideo();
};
/*------------------------------------------------------------------------------
4.7.9 SEEK BACKWARD
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSeekBackward = function () {
	this.elements.player?.seekBy(-10);
};
/*------------------------------------------------------------------------------
4.7.10 SEEK FORWARD
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSeekForward = function () {
	this.elements.player?.seekBy(10);
};
/*------------------------------------------------------------------------------
4.7.11 SEEK NEXT CHAPTER
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSeekNextChapter = function () {
	if (this.elements.player) {
		var player = this.elements.player,
			chapters_container = player.querySelector('.ytp-chapters-container'),
			progress_bar = player.querySelector('.ytp-progress-bar');

		if (chapters_container && chapters_container.children && progress_bar) {
			var chapters = chapters_container.children,
				duration = player.getDuration(),
				current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

			for (var i = 0, l = chapters.length; i < l; i++) {
				var left = chapters[i].offsetLeft;

				if (current_width < left) {
					player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

					return false;
				}
			}
		}
	}
};
/*------------------------------------------------------------------------------
4.7.12 SEEK PREVIOUS CHAPTER
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSeekPreviousChapter = function () {
	if (this.elements.player) {
		var player = this.elements.player,
			chapters_container = player.querySelector('.ytp-chapters-container'),
			progress_bar = player.querySelector('.ytp-progress-bar');

		if (chapters_container && chapters_container.children && progress_bar) {
			var chapters = chapters_container.children,
				duration = player.getDuration(),
				current_width = player.getCurrentTime() / (duration / 100) * (progress_bar.offsetWidth / 100);

			for (var i = chapters.length - 1; i > 0; i--) {
				if (current_width > chapters[i].offsetLeft) {
					var left = 0;

					if (i > 0) {
						left = chapters[i - 1].offsetLeft;
					}

					player.seekTo(left / (progress_bar.offsetWidth / 100) * (duration / 100));

					return false;
				}
			}
		}
	}
};
/*------------------------------------------------------------------------------
4.7.13 INCREASE VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutIncreaseVolume = function (decrease) {
	const player = (document.documentElement.dataset.pageType === 'shorts') ? this.elements.shorts_player : this.elements.player,
		value = Number(this.storage.shortcuts_volume_step) || 5,
		direction = decrease ? 'Decrease' : 'Increase';

	if (!player || !player.setVolume || !player.getVolume) {
		console.error('shortcut' + direction + 'Volume: No valid Player element');
		return;
	}

	// universal, goes both ways if you know what I mean
	if (decrease) {
		player.setVolume(player.getVolume() - value);
	} else {
		player.setVolume(player.getVolume() + value);
	}

	localStorage['yt-player-volume'] = JSON.stringify({
		data: JSON.stringify({
			volume: player.getVolume(),
			muted: player.isMuted(),
			expiration: Date.now(),
			creation: Date.now()
		})
	});

	sessionStorage['yt-player-volume'] = localStorage['yt-player-volume'];

	this.showStatus(player.getVolume());
};
/*------------------------------------------------------------------------------
4.7.14 DECREASE VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDecreaseVolume = function () {
	ImprovedTube.shortcutIncreaseVolume(true);
};
/*------------------------------------------------------------------------------
4.7.15 SCREENSHOT
------------------------------------------------------------------------------*/
ImprovedTube.shortcutScreenshot = ImprovedTube.screenshot;
/*------------------------------------------------------------------------------
4.7.16 INCREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutIncreasePlaybackSpeed = function (decrease) {
	const value = Number(this.storage.shortcuts_playback_speed_step) || .05,
		speed = this.playbackSpeed(),
		direction = decrease ? 'Decrease' : 'Increase';
	let newSpeed;

	if (!speed) {
		console.error('shortcut' + direction + 'PlaybackSpeed: Cant establish playbackRate/getPlaybackRate');
		return;
	}
	if (decrease) {
		// Slow down near 0   // Chrome's minimum is 0.0625. Otherwise this could seamlessly turn into single frame steps.
		newSpeed = (speed - value < 0.1) ? Math.max(Number(speed*0.7).toFixed(2),0.0625) : (speed - value);
	} else {
		// Aligning at 1.0 instead of passing by 1:
		if ( (speed < 1 && speed > 1-ImprovedTube.storage.shortcuts_playback_speed_step) || (speed > 1 && speed < 1+ImprovedTube.storage.shortcuts_playback_speed_step) ) {newSpeed = 1;
		// Firefox doesnt limit speed to 16x, we can allow more in Firefox.
		} else { newSpeed = (speed + value > 16) ? 16 : (speed + value); }
	}
	newSpeed = this.playbackSpeed(newSpeed);
	if (!newSpeed) {
		console.error('shortcut' + direction + 'PlaybackSpeed: Cant read back playbackRate/getPlaybackRate');
		return;
	}
	ImprovedTube.showStatus(newSpeed);
};
/*------------------------------------------------------------------------------
4.7.17 DECREASE PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDecreasePlaybackSpeed = function () {
	ImprovedTube.shortcutIncreasePlaybackSpeed(true);
};
/*------------------------------------------------------------------------------
4.7.18 RESET PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.shortcutResetPlaybackSpeed = function () {
	ImprovedTube.showStatus(this.playbackSpeed(1));
};
/*------------------------------------------------------------------------------
4.7.19 GO TO SEARCH BOX
------------------------------------------------------------------------------*/
ImprovedTube.shortcutGoToSearchBox = function () {
	document.querySelector('input[name="search_query"]')?.click();
	document.querySelector('input#search')?.click();
	if (ImprovedTube.originalFocus) { HTMLElement.prototype.focus = originalFocus }
	document.querySelector('input[name="search_query"]')?.focus();
	document.querySelector('input#search')?.focus();
};
/*------------------------------------------------------------------------------
4.7.20 ACTIVATE FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.shortcutActivateFullscreen = function () {
	this.elements.player?.toggleFullscreen();
};
/*------------------------------------------------------------------------------
4.7.21 ACTIVATE CAPTIONS
------------------------------------------------------------------------------*/
ImprovedTube.shortcutActivateCaptions = function () {
	const player = this.elements.player;

	if (player && player.toggleSubtitlesOn) {
		player.toggleSubtitlesOn();
	}
};
/*------Chapters------*/
ImprovedTube.shortcutChapters = function () {
	const fullscreenElement =
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.querySelector('.html5-video-player.ytp-fullscreen');

	if (fullscreenElement) {
		const fullscreenChapters = fullscreenElement.querySelector(
			'.ytp-chapter-title'
		);

		if (fullscreenChapters) {
			fullscreenChapters.click();
			return;
		}
	}

	const chaptersPanel = document.querySelector('[target-id*=chapters]');

	if (!chaptersPanel) {
		return;
	}

	const modernChapters = document.querySelector(
		'[modern-chapters] #navigation-button button[aria-label]'
	);

	const visibilityButton = document.querySelector(
		'[target-id*=chapters][visibility*=EXPANDED] #visibility-button button[aria-label]'
	);

	const available =
		document.querySelector('[target-id*=chapters][visibility*=HIDDEN]') ||
		chaptersPanel.clientHeight;

	if (available) {
		if (modernChapters) {
			modernChapters.click();
		} else {
			chaptersPanel.removeAttribute('visibility');
		}
	} else if (visibilityButton) {
		visibilityButton.click();
	} else {
		chaptersPanel
			.querySelector('#visibility-button button')
			?.click();
	}
};
/*------Transcript------*/
ImprovedTube.shortcutTranscript = function () {
	const available = document.querySelector('[target-id*=transcript][visibility*=HIDDEN]') || document.querySelector('[target-id*=transcript]').clientHeight;
	if (available) {
		const descriptionTranscript = document.querySelector('ytd-video-description-transcript-section-renderer button[aria-label]');
		descriptionTranscript ? descriptionTranscript.click() : document.querySelector('[target-id*=transcript]')?.removeAttribute('visibility');
	} else {
		const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer button[aria-label]');
		transcriptButton ? transcriptButton.click() : document.querySelector('[target-id*=transcript] #visibility-button button')?.click();
	}
	if (!descriptionTranscript && transcriptButton) {
		console.error('shortcutTranscript: Cant fint proper Enble button, falling back to unreliable bruteforce method');
	}
};
/*------------------------------------------------------------------------------
4.7.22 LIKE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutLike = function () {
	document.querySelector('like-button-view-model button')?.click();
};
/*------------------------------------------------------------------------------
4.7.23 DISLIKE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDislike = function () {
	document.querySelector('dislike-button-view-model button')?.click();
};
/*------Report------*/
ImprovedTube.shortcutReport = function () {
	try {document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0);
		document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click(); document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0)}
	catch {console.log("'...' failed"); setTimeout(function () {try {document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click(); document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0)}
	catch {console.log("'...' failed2")}}, 100) }

	setTimeout(function () {try {document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 0); document.querySelector('tp-yt-iron-dropdown svg path[d^="M13.18,4l0.24,1.2L13.58,6h0.82H19v7h-5.18l-0"]').closest("tp-yt-paper-item").click();}
	catch {console.log("report failed"); setTimeout(function ()	{try {document.querySelector('tp-yt-iron-dropdown svg path[d^="M13.18,4l0.24,1.2L13.58,6h0.82H19v7h-5.18l-0"]').closest("tp-yt-paper-item").click();}
	catch {console.log("report failed2"); document.querySelector('svg path[d^="M7.5,12c0,0.83-0.67,1.5-1.5"]').closest("button").click();}}, 800);
	}
	}, 200);

	setTimeout(function () {try {document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 1)} catch {console.log("dropdown visible failed");
		setTimeout(function () {try {document.querySelectorAll("tp-yt-iron-dropdown").forEach(el => el.style.opacity = 1)} catch {console.log("dropdown visible failed2");}}, 1700)}}, 700)
}
/*------------------------------------------------------------------------------
4.7.24 SUBSCRIBE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSubscribe = function () {
	this.elements.subscribe_button?.click();
};
/*------------------------------------------------------------------------------
4.7.25 DARK THEME
------------------------------------------------------------------------------*/
ImprovedTube.shortcutDarkTheme = function () {
	if (document.documentElement.hasAttribute('dark')) {
		// message will propagate all the way to setTheme() so we dont need to do anything more here
		ImprovedTube.messages.send({action: 'set', key: 'theme', value: 'light'});
	} else {
		ImprovedTube.messages.send({action: 'set', key: 'theme', value: 'dark'});
	}
};
/*------------------------------------------------------------------------------
4.7.26 CUSTOM MINI PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.shortcutCustomMiniPlayer = function () {
	this.storage.mini_player = !this.storage.mini_player;

	this.miniPlayer();
};
/*------------------------------------------------------------------------------
Loop
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleLoop = function () {
	const video = this.elements.video,
		player = this.elements.player;
	function matchLoopState (opacity) {
		document.querySelector('#it-repeat-button')?.children[0]?.style.setProperty("opacity", opacity);
		document.querySelector('#it-below-player-loop')?.children[0]?.style.setProperty("opacity", opacity);
	};

	if (!(video && player)) return;
	if (video.hasAttribute('loop')) {
		video.removeAttribute('loop');
		matchLoopState('.5');
	} else if (!/ad-showing/.test(player.className)) {
		video.setAttribute('loop', '');
		matchLoopState('1');
	}
};
/*------------------------------------------------------------------------------
4.7.27 STATS FOR NERDS
------------------------------------------------------------------------------*/
ImprovedTube.shortcutStatsForNerds = function () {
	const player = this.elements.player;

	if (!player || !player.isVideoInfoVisible || !player.hideVideoInfo || !player.showVideoInfo) {
		console.error('shortcutStatsForNerds: Need valid Player element');
		return;
	}

	if (player.isVideoInfoVisible()) {
		player.hideVideoInfo();
	} else {
		player.showVideoInfo();
	}
};
/*------------------------------------------------------------------------------
4.7.28 TOGGLE CARDS
------------------------------------------------------------------------------*/
ImprovedTube.shortcutToggleCards = function () {
	function toggleVideoOverlays () {
		document.documentElement.toggleAttribute('it-player-hide-cards');
		document.documentElement.toggleAttribute('it-player-hide-endcards');
		document.documentElement.toggleAttribute('it-hide-video-title-fullScreen');
	}

	toggleVideoOverlays();
	window.removeEventListener('hashchange', toggleVideoOverlays);
	window.addEventListener('hashchange', toggleVideoOverlays);
};
/*------------------------------------------------------------------------------
4.7.29 POPUP PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.shortcutPopupPlayer = function () {
	const player = this.elements.player;

	if (player && document.documentElement.dataset.pageType === 'video') {
		player.pauseVideo();

		window.open('//www.youtube.com/embed/' + location.href.match(ImprovedTube.regex.video_id)?.[1] + '?start=' + parseInt(player.getCurrentTime()) + '&autoplay=' + (ImprovedTube.storage.player_autoplay_disable ? '0' : '1'), '_blank', 'directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=' + player.offsetWidth + ',height=' + player.offsetHeight);
	}
};
/*------------------------------------------------------------------------------
4.7.30 ROTATE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutRotateVideo = function () {
	const player = this.elements.player,
		video = this.elements.video;
	let rotate = Number(document.body.dataset.itRotate) || 0,
		transform = '';

	if (!player || !video) {
		console.error('shortcutRotateVideo: need player and video elements');
		return;
	}

	rotate += 90;

	if (rotate === 360) {
		rotate = 0;
		video.style.removeProperty("transform");
		delete document.body.dataset.itRotate;
		return;
	}

	document.body.dataset.itRotate = rotate;

	transform += 'rotate(' + rotate + 'deg)';

	if (rotate == 90 || rotate == 270) {
		var is_vertical_video = video.videoHeight > video.videoWidth;
												if (
											document.querySelector("ytd-watch-flexy[theater]") && document.querySelector('ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen])')
											) { transform += ' scale(' + (is_vertical_video ? video.clientWidth : video.clientHeight) / (is_vertical_video ? video.clientHeight : video.clientWidth) + ')';
													} else {
											transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
										}
	}
	video.style.setProperty("transform", transform);
};
ImprovedTube.shortcutActivateFitToWindow = function() {
	ImprovedTube.toggleFitToWindow();
};
/*------------------------------------------------------------------------------
4.7.31 CINEMA MODE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutCinemaMode = function () {
	var playerContainer = document.getElementById('player-full-bleed-container');
	var playerContainerDefault = document.getElementById('player-container');
	var ytdPlayer = document.getElementById('ytd-player');

	function toggle(container) {
		if (!container) return;
		if (container.style.zIndex == 10000) {
			container.style.zIndex = 1;
			container.style.position = '';
		} else {
			container.style.zIndex = 10000;
			container.style.position = 'relative';
		}
	}

	toggle(playerContainer);
	toggle(playerContainerDefault);
	toggle(ytdPlayer);

	var overlay = document.getElementById('overlay_cinema');
	if (!overlay) {
		createOverlay();
	} else {
		overlay.style.display = overlay.style.display === 'none' || overlay.style.display === '' ? 'block' : 'none';
	}
}
/*------------------------------------------------------------------------------
4.7.32 REFRESH CATEGORIES
------------------------------------------------------------------------------*/
ImprovedTube.shortcutRefreshCategories = function () {
	let chipContainer = document.querySelector('ytd-feed-filter-chip-bar-renderer');

	if (chipContainer) {
		chipContainer.style.display = '';
		chipContainer.style.visibility = 'visible';
		chipContainer.style.opacity = '1';
		chipContainer.hidden = false;

		let parent = chipContainer.parentElement;
		while (parent && parent !== document.body) {
			parent.style.display = '';
			parent.style.visibility = 'visible';
			parent = parent.parentElement;
		}

		const allChips = chipContainer.querySelectorAll('yt-chip-cloud-chip-renderer button');
		if (allChips.length > 1) {
			allChips[1].click();
			setTimeout(function() {
				allChips[0].click();
			}, 200);
		}
	} else {
		window.location.reload();
	}
};

/*------------------------------------------------------------------------------
4.7.33 SMART SPEED TOGGLE
------------------------------------------------------------------------------*/
ImprovedTube.shortcutSmartSpeed = function () {
	if (ImprovedTube.storage.smart_speed === false) { if(ImprovedTube.heatmap) {ImprovedTube.heatmap.init(); };
    } else if (ImprovedTube.storage.smart_speed === true) { if(ImprovedTube.heatmap) { ImprovedTube.heatmap.isEnabled = false; document.querySelector("video").playbackRate = 1.0; }
    }
	this.storage.smart_speed = !this.storage.smart_speed;
};
