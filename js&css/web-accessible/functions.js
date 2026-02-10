/*--------------------------------------------------------------
>>> FUNCTIONS
--------------------------------------------------------------*/
ImprovedTube.childHandler = function (node) {
	//console.log(node.nodeName);
	if (node.nodeName === 'SCRIPT' || node.nodeName === 'iron-iconset-svg' || node.nodeName === 'svg' || (node.nodeName === 'SPAN' && !node.querySelector("a")) || node.nodeName === '#text' || node.nodeName === '#comment' || node.nodeName === 'yt-icon-shape' || node.nodeName === 'DOM-IF' || node.nodeName === 'DOM-REPEAT') {
		return
	}
	var children = node.children;
	this.ytElementsHandler(node);

	if (children) {
		for (var i = 0, l = children.length; i < l; i++) {
			ImprovedTube.childHandler(children[i]);
		}
	}
}

/*
const DOM_filter = /^(SCRIPT|DOM-IF|DOM-REPEAT|svg|SPAN|#text|#comment|yt-icon-shape|iron-iconset-svg)$/;
ImprovedTube.childHandler = function (node) { //console.log(node.nodeName);
	if (DOM_filter.test(node.nodeName)) { return; }
	var children = node.children;
	ImprovedTube.ytElementsHandler(node);
	if (children) {
		let i = 0;
		for (const child of children) {
			ImprovedTube.childHandler(children[i]);
			//console.log("node.nodeName:CHILD-"+i+":"+children[i].id+",class:"+children[i].className+","+children[i]+"("+children[i].nodeName+")");
			i++;
		}
	}
};  */

ImprovedTube.ytElementsHandler = function (node) {
	const name = node.nodeName,
		id = node.id;

	if (name === 'A') {
		if (node.href) {
			this.channelDefaultTab(node);
		}
		if (this.storage.blocklist_activate) {
			// we are interested in thumbnails and video-previews, skip ones with 'button.it-add-to-blocklist' already
			if (((node.href && node.classList.contains('ytd-thumbnail')) || node.classList.contains('ytd-video-preview'))
				&& !node.querySelector("button.it-add-to-blocklist")) {
				this.blocklistNode(node);
			}
		}
	} else if (name === 'YTD-TOGGLE-BUTTON-RENDERER' || name === 'YTD-PLAYLIST-LOOP-BUTTON-RENDERER') {
		//can be precise   previously  node.parentComponent  & node.parentComponent.parentComponent
		if (node.closest("YTD-MENU-RENDERER")
			&& node.closest("YTD-PLAYLIST-PANEL-RENDERER")) {

			var index = Array.prototype.indexOf.call(node.parentNode.children, node);
			if (index === 0) {
				if (this.storage.playlist_reverse === true) {
					//can be precise:
					try { this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode; }
					catch {
						try { this.elements.playlist.actions = node.parentNode.parentNode.parentNode; }
						catch {
							try { this.elements.playlist.actions = node.parentNode.parentNode; }
							catch {
								try { this.elements.playlist.actions = node.parentNode; }
								catch { try { this.elements.playlist.actions = node; } catch { } }
							}
						}
					}
				}
				this.playlistReverse();
			} else if (index === 1) {
				this.elements.playlist.shuffle_button = node;

				this.playlistShuffle();

				if (this.storage.playlist_reverse === true) {
					//can be precise:
					try { this.elements.playlist.actions = node.parentNode.parentNode.parentNode.parentNode; }
					catch {
						try { this.elements.playlist.actions = node.parentNode.parentNode.parentNode; }
						catch {
							try { this.elements.playlist.actions = node.parentNode.parentNode; }
							catch {
								try { this.elements.playlist.actions = node.parentNode; }
								catch { try { this.elements.playlist.actions = node; } catch { } }
							}
						}
					}
				}
				this.playlistReverse();
			}
		}
	} else if (name === 'YTD-GUIDE-SECTION-RENDERER') {
		if (!this.elements.sidebar_section) {
			this.elements.sidebar_section = node;

			this.improvedtubeYoutubeIcon();
		}
	} else if (name === 'YTD-VIDEO-PRIMARY-INFO-RENDERER') {
		this.elements.video_title = node.querySelector('.title.ytd-video-primary-info-renderer');

		this.improvedtubeYoutubeIcon();
		this.improvedtubeYoutubeButtonsUnderPlayer();

	} else if (name === 'YTD-VIDEO-SECONDARY-INFO-RENDERER') {
		this.elements.yt_channel_name = node.querySelector('ytd-channel-name');
		this.elements.yt_channel_link = node.querySelector('ytd-channel-name a');

		if (document.documentElement.dataset.pageType === 'video') {
			this.howLongAgoTheVideoWasUploaded();
			this.channelVideosCount();
			this.exactUploadDate();
		}
		//} else if (name === 'YTD-MENU-RENDERER' && node.classList.contains('ytd-video-primary-info-renderer')) {
		// 	if (document.documentElement.dataset.pageType === 'video') {
		// 		this.hideDetailButton(node.querySelector('#flexible-item-buttons').children);
		// 	}
	}
	else if (name === 'YTD-PLAYLIST-HEADER-RENDERER' || (name === 'YTD-MENU-RENDERER' && node.classList.contains('ytd-playlist-panel-renderer')) || (name === 'YTD-PAGE-HEADER-RENDERER' && node.classList.contains('page-header-sidebar'))) {
		this.playlistPopup();

		// Initialize playlist complete functionality for both custom and default playlists
		this.playlistCompleteInit();

		// This is for the playlist page sidebar, the one that appears when you click on "show all playlist"  
		// For default playlist (such as watch later) we have a different header renderer than for custom playlists
		if (name === 'YTD-PAGE-HEADER-RENDERER' || (name === 'YTD-PAGE-HEADER-RENDERER' && node.classList.contains('page-header-sidebar'))) {
			this.elements.playlist_header_sidebar = node
			this.elements.playlist_header_sidebar_buttons_section = name === 'YTD-PAGE-HEADER-RENDERER' ? node.querySelector('.yt-page-header-view-model__page-header-headline-info') : node.querySelector('.play-menu')
		}
	} else if (name === 'YTD-PLAYLIST-VIDEO-RENDERER') {
		// Attach quick action buttons to playlist video items
		this.playlistEnsureQuickButtons(node);
	} else if (name === 'YTD-SUBSCRIBE-BUTTON-RENDERER'
		|| name === 'YT-SUBSCRIBE-BUTTON-VIEW-MODEL'
		|| (name === 'YTD-BUTTON-RENDERER' && node.classList.contains('ytd-c4-tabbed-header-renderer'))) {
		ImprovedTube.blocklistChannel(node);
		ImprovedTube.elements.subscribe_button = node;
	} else if (id === 'chat-messages') {
		this.elements.livechat.button = document.querySelector('[aria-label="Close"]');
		// console.log(document.querySelector('[aria-label="Close"]'))
		this.livechat();
	} else if (name === 'YTD-MASTHEAD') {
		if (!this.elements.masthead) {
			this.elements.masthead = {
				start: node.querySelector('#start'),
				end: node.querySelector('#end'),
				logo: node.querySelector('a#logo')
			};

			this.improvedtubeYoutubeIcon();
		}
	} else if (name === 'TP-YT-APP-DRAWER') {
		if (!this.elements.app_drawer) {
			this.elements.app_drawer = {
				start: node.querySelector('div#header'),
				logo: node.querySelector('a#logo')
			};

			this.improvedtubeYoutubeIcon();
		}
	} else if (name === 'YTD-PLAYER') {
		if (!this.elements.ytd_player) {
			ImprovedTube.elements.ytd_player = node;
		}
	} else if (id === 'shorts-player') {
		if (!this.elements.shorts_player) {
			ImprovedTube.elements.shorts_player = node;
		}
	} else if (id === 'movie_player') {
		if (!this.elements.player) {
			ImprovedTube.elements.player = node;
			// if (this.storage.player_autoplay === false)  {   ImprovedTube.elements.player.stopVideo();  }
			ImprovedTube.elements.video = node.querySelector('video');
			ImprovedTube.elements.player_left_controls = node.querySelector('.ytp-left-controls');
			ImprovedTube.elements.player_right_controls = node.querySelector('.ytp-right-controls');
			ImprovedTube.elements.player_thumbnail = node.querySelector('.ytp-cued-thumbnail-overlay-image');
			ImprovedTube.elements.player_subtitles_button = node.querySelector('.ytp-subtitles-button');
			ImprovedTube.playerSize();
			if (typeof this.storage.ads !== 'undefined' && this.storage.ads !== "all_videos") {
				new MutationObserver(function (mutationList) {
					for (var i = 0, l = mutationList.length; i < l; i++) {
						var mutation = mutationList[i];

						if (mutation.type === 'childList') {
							for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
								var node = mutation.addedNodes[j];

								if (node instanceof Element
									&& node.querySelector('ytp-ad-player-overlay, .ytp-ad-text, .ytp-ad-overlay-close-container, ytd-button-renderer#dismiss-button, *[id^="ad-text"], *[id^="skip-button"], .ytp-ad-skip-button.ytp-button, .ytp-ad-skip-button-modern.ytp-button') !== null) {
									ImprovedTube.playerAds(node);
								}
							}
						}
						if (mutation.type === 'attributes' && mutation.attributeName === 'id' && mutation.target.querySelector('*[id^="ad-text"], *[id^="skip-button"], .ytp-ad-skip-button-modern.ytp-button',)) {
							ImprovedTube.playerAds(node);
						}
					}
				}).observe(node, {
					childList: true, // attributes: true,
					subtree: true
				});
			}

			new MutationObserver(function (mutationList) {
				for (var i = 0, l = mutationList.length; i < l; i++) {
					var mutation = mutationList[i];

					if (mutation.type === 'attributes') {
						if (mutation.attributeName === 'style') {
							ImprovedTube.playerHdThumbnail();
						}
					}
				}
			}).observe(ImprovedTube.elements.player_thumbnail, {
				attributes: true,
				attributeFilter: ['style'],
				childList: false,
				subtree: false
			});
		}
	} else if (name === 'YTD-WATCH-FLEXY') {
		this.elements.ytd_watch = node;

		if (
			this.isset(this.storage.player_size) &&
			this.storage.player_size !== 'do_not_change'
		) {
			node.calculateCurrentPlayerSize_ = function () {
				if (!this.theater && ImprovedTube.elements.player) {
					if (this.updateStyles) {
						this.updateStyles({
							'--ytd-watch-flexy-width-ratio': 1,
							'--ytd-watch-flexy-height-ratio': 0.5625
						});

						this.updateStyles({
							'--ytd-watch-width-ratio': 1,
							'--ytd-watch-height-ratio': 0.5625
						});
					}

					return {
						width: ImprovedTube.elements.player.offsetWidth,
						height: Math.round(ImprovedTube.elements.player.offsetWidth / (16 / 9))
					};
				}

				return {
					width: NaN, // ??
					height: NaN
				};
			};

			node.calculateNormalPlayerSize_ = node.calculateCurrentPlayerSize_; // ??
		}
	} else if (document.documentElement.dataset.pageType === 'video') {
		if (id === 'description-inline-expander' || id === 'description-inner') {
			setTimeout(function () { ImprovedTube.expandDescription(node); }, 300);
		} else if (id === 'meta') {
			setTimeout(function () { ImprovedTube.expandDescription(node.querySelector('#more')); }, 200);
			// } else if (id === 'below') { setTimeout(function () {}, 0);
		} else if (id === 'panels') {
			setTimeout(function () { ImprovedTube.transcript(node); ImprovedTube.chapters(node); ImprovedTube.elements.panels = node; }, 200);
		} /* else if (name === 'TP-YT-PAPER-BUTTON') {
		if ( (id === 'expand-sizer' || id === 'expand') && node.parentNode.id === 'description-inline-expander') {
			setTimeout(function () {
				ImprovedTube.expandDescription(node); console.log("EXPAND DESCRIPTION, OLD WAY")
			}, 750);
		}} */
	} else if (id === 'panels') {
		ImprovedTube.elements.panels = node;
	}
};

ImprovedTube.pageType = function () {
	if (/\/watch\?|\/live\//.test(location.href)) {
		document.documentElement.dataset.pageType = 'video';
	} else if (/\/embed\//.test(location.href)) {
		// Embedded YouTube players (e.g., on third-party sites like Discogs) - treat as video for features like seekbar
		document.documentElement.dataset.pageType = 'embed';
	} else if (location.pathname === '/') {
		document.documentElement.dataset.pageType = 'home';

		// Safeguard to prevent infinite reloads
		if (ImprovedTube.initializedHomePage) {
			console.warn('ImprovedTube: Home page already initialized. Skipping redundant operations.');
			return;
		}
		ImprovedTube.initializedHomePage = true;
	} else if (/\/subscriptions\?/.test(location.href)) {
		document.documentElement.dataset.pageType = 'subscriptions';
	} else if (/\/@|(\/(channel|user|c)\/)[^/]+/.test(location.href)) {
		// Match all channel pages including subpages like /videos, /shorts, etc.
		document.documentElement.dataset.pageType = 'channel';
	} else if (/\/shorts\//.test(location.href)) {
		document.documentElement.dataset.pageType = 'shorts';
	} else {
		document.documentElement.dataset.pageType = 'other';
	}
};

ImprovedTube.pageOnFocus = function () {
	ImprovedTube.playerAutopauseWhenSwitchingTabs();
	ImprovedTube.playerAutoPip();
	ImprovedTube.playerQualityWithoutFocus();
};
ImprovedTube.stop_shorts_autoloop = function () {
	if (document.documentElement.dataset.pageType === 'shorts') {
		const video = ImprovedTube.elements.shorts_player.querySelector('video')
		video.removeAttribute('loop');
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === 'attributes' && mutation.attributeName === 'loop') {
					video.removeAttribute('loop');
				}
			});
		});
		observer.observe(video, { attributes: true });
	}
}
ImprovedTube.videoPageUpdate = function () {
	if (document.documentElement.dataset.pageType === 'video') {
		var video_id = this.getParam(new URL(location.href).search.substr(1), 'v');

		if (this.storage.track_watched_videos === true && video_id) {
			ImprovedTube.messages.send({
				action: 'watched',
				type: 'add',
				id: video_id,
				title: document.title
			});
		}

		this.initialVideoUpdateDone = true;

		ImprovedTube.howLongAgoTheVideoWasUploaded();
		ImprovedTube.dayOfWeek();
		ImprovedTube.exactUploadDate();
		ImprovedTube.channelVideosCount();
		ImprovedTube.upNextAutoplay();
		ImprovedTube.playerAutofullscreen();
		ImprovedTube.playerSize();
		if (this.storage.player_always_repeat === true) { ImprovedTube.playerRepeat(); };
		ImprovedTube.playerPlaybackSpeedButton();
		ImprovedTube.playerScreenshotButton();
		ImprovedTube.addYouTubeReturnButton();
		ImprovedTube.playerRepeatButton();
		ImprovedTube.playerRotateButton();
		ImprovedTube.playerPopupButton();
		ImprovedTube.playerFitToWinButton();
		ImprovedTube.playerRewindAndForwardButtons();
		ImprovedTube.playerIncreaseDecreaseSpeedButtons();
		ImprovedTube.playerCinemaModeButton();
		ImprovedTube.playerHamburgerButton();
		ImprovedTube.playerControls();
		
		// Initialize large playlist handler for playlist videos
		if (this.getParam(location.href, 'list')) {
			ImprovedTube.playlistLargePlaylistHandler();
		} else {
			// Cleanup when not on a playlist
			if (typeof ImprovedTube.cleanupPlaylistHandlers === 'function') {
				ImprovedTube.cleanupPlaylistHandlers();
			}
		}
	}
};

ImprovedTube.playerOnPlay = function () {
	HTMLMediaElement.prototype.play = (function (original) {t
		return function () {
			// Avoid attaching full player handlers to inline/thumbnail preview players
			// (YouTube uses different preview elements such as `ytd-video-preview`).
			if (!this.closest('#inline-preview-player, ytd-video-preview, .ytd-video-preview, .ytp-inline-preview')) {
				this.removeEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);
				this.addEventListener('loadedmetadata', ImprovedTube.playerOnLoadedMetadata);

				this.removeEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);
				this.addEventListener('timeupdate', ImprovedTube.playerOnTimeUpdate);

				this.removeEventListener('pause', ImprovedTube.playerOnPause, true);
				this.addEventListener('pause', ImprovedTube.playerOnPause, true);
				this.onpause = () => {
					console.log('this.onpause');
				};

				this.removeEventListener('ended', ImprovedTube.playerOnEnded, true);
				this.addEventListener('ended', ImprovedTube.playerOnEnded, true);
				ImprovedTube.autoplayDisable(this);
				ImprovedTube.playerLoudnessNormalization();
				ImprovedTube.playerCinemaModeEnable();
			}
			return original.apply(this, arguments);
		}
	})(HTMLMediaElement.prototype.play);
};

ImprovedTube.initPlayer = function () {
	if (ImprovedTube.elements.player && ImprovedTube.video_url !== location.href) {
		ImprovedTube.video_url = location.href;
		ImprovedTube.user_interacted = false;
		ImprovedTube.played_before_blur = false;

		delete ImprovedTube.elements.player.dataset.defaultQuality;

		ImprovedTube.forcedPlayVideoFromTheBeginning();
		ImprovedTube.playerPlaybackSpeed();
		ImprovedTube.playerSubtitles();
		ImprovedTube.subtitlesLanguage();
		ImprovedTube.subtitlesUserSettings();
		ImprovedTube.subtitlesDisableLyrics();
		ImprovedTube.playerQuality();
		ImprovedTube.batteryFeatures();
		ImprovedTube.playerVolume();
		if (this.storage.player_always_repeat === true) { ImprovedTube.playerRepeat(); }

		ImprovedTube.playerPlaybackSpeedButton();
		ImprovedTube.playerScreenshotButton();
		ImprovedTube.playerRepeatButton();
		ImprovedTube.playerRotateButton();
		ImprovedTube.playerPopupButton();
		ImprovedTube.playerFitToWinButton();
		ImprovedTube.playerRewindAndForwardButtons();
		ImprovedTube.playerIncreaseDecreaseSpeedButtons();
		ImprovedTube.playerPlaybackSpeedButton();
		ImprovedTube.playerHamburgerButton();
		ImprovedTube.playerControls();
		ImprovedTube.playerHideProgressPreview();
		ImprovedTube.expandDescription();
		setTimeout(function () { ImprovedTube.forcedTheaterMode(); }, 150);
		if (location.href.indexOf('/embed/') === -1) { ImprovedTube.miniPlayer(); }
		if (ImprovedTube.storage.disable_auto_dubbing === true) { ImprovedTube.disableAutoDubbing(); }
	}
};

var timeUpdateInterval = null;
var noTimeUpdate = null;

ImprovedTube.playerOnTimeUpdate = function () {
	if (!timeUpdateInterval) {
		timeUpdateInterval = setInterval(function () {
			if (ImprovedTube.video_src !== this.src) {
				ImprovedTube.video_src = this.src;

				if (ImprovedTube.initialVideoUpdateDone !== true) {
					ImprovedTube.playerQuality();
					ImprovedTube.playerVolume();
					ImprovedTube.playerPlaybackSpeed();
				}
			} else if (ImprovedTube.latestVideoDuration !== this.duration) {
				ImprovedTube.latestVideoDuration = this.duration;

				ImprovedTube.playerQuality();
				ImprovedTube.playerVolume();
				ImprovedTube.playerPlaybackSpeed();
			}

			if (ImprovedTube.storage.always_show_progress_bar === true) { ImprovedTube.showProgressBar(); }
			if (ImprovedTube.storage.player_remaining_duration === true && document.documentElement.dataset.pageType === 'video') { ImprovedTube.playerRemainingDuration(); }
			ImprovedTube.played_time += .5;
			//Counting time of the player playing for the analyzer feature. (not equal to video time if playback speed isnt 1.00)
			//We can also allow to measure session times too and HID times.   
		}, 500);
	}
	clearInterval(noTimeUpdate);
	noTimeUpdate = setTimeout(function () {
		clearInterval(timeUpdateInterval);
		timeUpdateInterval = null;
	}, 987);
};

ImprovedTube.playerOnLoadedMetadata = function () {
	setTimeout(function () { ImprovedTube.playerSize(); }, 100);
	setTimeout(function () { if (ImprovedTube.elements.panels) { ImprovedTube.transcript(ImprovedTube.elements.panels); ImprovedTube.chapters(ImprovedTube.elements.panels); } }, 250);
};

ImprovedTube.playerOnPause = function (event) {
	ImprovedTube.playlistUpNextAutoplay(event);

	if (ImprovedTube.elements.yt_channel_name) {
		ImprovedTube.messages.send({
			action: 'analyzer',
			name: ImprovedTube.elements.yt_channel_name.__data.tooltipText,
			time: ImprovedTube.played_time
		});
	}
	ImprovedTube.played_time = 0;
	ImprovedTube.playerControls();
	ImprovedTube.playerCinemaModeDisable();

};

// if ( document.documentElement.dataset.pageType === 'video'
// && (ImprovedTube.storage.description === "expanded" || ImprovedTube.storage.transcript === true || ImprovedTube.storage.chapters === true )) { 
// ImprovedTube.forbidFocus =  function (ms)
/*--------------------------------------------------------------
# HIDE PROGRESS BAR PREVIEW
--------------------------------------------------------------*/

ImprovedTube.playerHideProgressPreview = function () {
	const shouldHide = this.storage.player_hide_progress_preview === true;

	if (shouldHide) {
		document.documentElement.setAttribute('it-hide-progress-preview', 'true');

		// Force refresh the player UI
		if (this.elements.player) {
			this.elements.player.dispatchEvent(new Event('mousemove'));
			// Also try to force hide any existing tooltips
			const tooltips = document.querySelectorAll('.ytp-tooltip, .ytp-preview, .ytp-tooltip-text-wrapper');
			tooltips.forEach(tooltip => {
				tooltip.style.display = 'none';
				tooltip.style.opacity = '0';
				tooltip.style.visibility = 'hidden';
			});
		}
	} else {
		document.documentElement.removeAttribute('it-hide-progress-preview');
	}
};

ImprovedTube.playerOnEnded = function (event) {
	ImprovedTube.playlistUpNextAutoplay(event);

	ImprovedTube.messages.send({
		action: 'analyzer',
		//adding "?" (not a fix)
		name: ImprovedTube.elements.yt_channel_name?.__data.tooltipText,
		time: ImprovedTube.played_time
	});

	ImprovedTube.played_time = 0;
};

// https://github.com/code-charity/youtube/pull/2431
ImprovedTube.onkeydown = function () {
	ImprovedTube.pauseWhileTypingOnYoutube()
	window.addEventListener('keydown', function () {
		ImprovedTube.user_interacted = true; // = event.key 
	}, true);
};

ImprovedTube.onmousedown = function () {
	window.addEventListener('mousedown', function () {
		ImprovedTube.user_interacted = true;  // = mousedown
	}, true);
};

/*
ImprovedTube.onkeydown = function () {
	ImprovedTube.pauseWhileTypingOnYoutube()
	window.addEventListener('keydown', function () {
		if (!ImprovedTube.user_interacted) {
			setTimeout(function () {ImprovedTube.user_interacted = true}, 2500);
		}
		if (ImprovedTube.elements.player && ImprovedTube.elements.player.classList.contains('ad-showing') === false) {
			ImprovedTube.user_interacted = true;
		}
	}, true);
};

ImprovedTube.onmousedown = function () {
	window.addEventListener('mousedown', function (event) {
		if (!ImprovedTube.user_interacted) {
			setTimeout(function () {ImprovedTube.user_interacted = true}, 2500);
			if (ImprovedTube.elements.player && ImprovedTube.elements.player.classList.contains('ad-showing') === false) {
				var path = event.composedPath();
				for (var i = 0, l = path.length; i < l; i++) {
					if (path[i].className
					// && path[i].className.indexOf
											&& (/html5-(main-video|video-container)|ytp-play-button/.test(path[i].className))
					) {ImprovedTube.user_interacted = true;}
				}
			}
		}
	}, true);
};
*/

ImprovedTube.getParam = function (query, name) {
	var params = query.split('&'),
		param = false;

	for (var i = 0; i < params.length; i++) {
		params[i] = params[i].split('=');

		if (params[i][0] == name) {
			param = params[i][1];
		}
	}

	if (param) {
		return param;
	} else {
		return false;
	}
};

ImprovedTube.getParams = function (query) {
	var params = query.split('&'),
		result = {};

	for (var i = 0, l = params.length; i < l; i++) {
		params[i] = params[i].split('=');

		result[params[i][0]] = params[i][1];
	}

	return result;
};

ImprovedTube.getCookieValueByName = function (name) {
	var match = document.cookie.match(new RegExp('([; ]' + name + '|^' + name + ')([^\\s;]*)', 'g'));

	if (match) {
		var cookie = match[0];

		return cookie.replace(name + '=', '').replace(' ', '');
	} else return '';
};

ImprovedTube.getPrefCookieValueByName = function (name) {
	let prefs = this.getParams(this.getCookieValueByName('PREF'));
	return prefs[name];
};

// set PREF cookie name=value or delete name if value == null
ImprovedTube.setPrefCookieValueByName = function (name, value) {
	let originalPref = this.getCookieValueByName('PREF');
	let prefs = this.getParams(originalPref);
	let newPrefs = '';
	let ampersant = '';

	if (name == 'f6' && prefs[name] & 1) {
		// f6 holds other settings, possible values 80000 80001 400 401 1 none
		// make sure we remember 1 bit
		prefs[name] = value | 1;
	} else {
		prefs[name] = value;
	}

	for (let pref in prefs) {
		if (prefs[pref]) {
			newPrefs += ampersant + pref + '=' + prefs[pref];
			ampersant = '&';
		}
	}
	// only write cookie if its different from the old one
	if (originalPref != newPrefs) {
		this.setCookie('PREF', newPrefs);
	}
};

ImprovedTube.setCookie = function (name, value) {
	var date = new Date();

	date.setTime(date.getTime() + 3.154e+10);

	document.cookie = name + '=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
};

ImprovedTube.createIconButton = function (options) {
	const button = options.href ? document.createElement('a') : document.createElement('button'),
		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
		path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
		type = this.button_icons[options.type];

	for (const attr of type.svg) svg.setAttribute(attr[0], attr[1]);
	for (const attr of type.path) path.setAttribute(attr[0], attr[1]);

	svg.appendChild(path);
	button.appendChild(svg);

	if (options.className) button.className = options.className;
	if (options.id) button.id = options.id;
	if (options.text) button.appendChild(document.createTextNode(options.text));
	if (options.href) button.href = options.href;
	if (options.onclick) {
		if (!options.propagate) {
			//we fully own all click events landing on this button
			button.onclick = function (event) {
				event.preventDefault();
				event.stopPropagation();
				options.onclick.apply(this, arguments);
			}
		} else {
			button.onclick = options.onclick;
		}
	}
	return button;
};

ImprovedTube.createPlayerButton = function (options) {
	var controls = options.position == "right" ? this.elements.player_right_controls : this.elements.player_left_controls;
	if (controls) {
		var button = document.createElement('button');

		button.className = 'ytp-button it-player-button';

		button.dataset.title = options.title;

		button.addEventListener('mouseover', function () {
			var tooltip = document.createElement('div'),
				rect = this.getBoundingClientRect();

			tooltip.className = 'it-player-button--tooltip';

			tooltip.style.left = rect.left + rect.width / 2 + 'px';
			tooltip.style.top = rect.top - 8 + 'px';

			tooltip.textContent = this.dataset.title;
			if (this.storage && (this.storage.player_cinema_mode_button || this.storage.player_auto_hide_cinema_mode_when_paused || this.storage.player_auto_cinema_mode)) {
				tooltip.style.zIndex = 10001;
			} // needed for cinema mode
			function mouseleave() {
				tooltip.remove();

				this.removeEventListener('mouseleave', mouseleave);
			}

			this.addEventListener('mouseleave', mouseleave);

			document.body.appendChild(tooltip);
		});

		if (options.id) {
			if (this.elements.buttons[options.id]) {
				this.elements.buttons[options.id].remove();
			}

			button.id = options.id;

			this.elements.buttons[options.id] = button;
		}

		if (options.child) {
			button.appendChild(options.child);
		}

		button.style.opacity = options.opacity || .5;

		if (options.onclick) {
			button.onclick = options.onclick;
		}

		controls.insertBefore(button, controls.childNodes[3]);
		return button;
	}
};

ImprovedTube.empty = function (element) { for (var i = element.childNodes.length - 1; i > -1; i--) { element.childNodes[i].remove(); } };
ImprovedTube.isset = function (variable) { return !(typeof variable === 'undefined' || variable === null || variable === 'null'); };
ImprovedTube.showStatus = function (value) {
	if (!this.elements.status) {
		this.elements.status = document.createElement('div');

		this.elements.status.id = 'it-status';
	}

	if (typeof value === 'number') {
		value = value.toFixed(2);
	}

	this.elements.status.textContent = value;

	if (ImprovedTube.status_timer) {
		clearTimeout(ImprovedTube.status_timer);
	}

	ImprovedTube.status_timer = setTimeout(function () { ImprovedTube.elements.status.remove(); }, 500);

	this.elements.player.appendChild(this.elements.status);
};

ImprovedTube.videoId = (url = document.URL) => url.match(ImprovedTube.regex.video_id)?.[1] || new URL(url).searchParams.get('v') || movie_player?.getVideoData?.().video_id || (console.log('No VIDEO ID URL MATCH match: Regex & url are:', ImprovedTube.regex.video_id, url), undefined);
ImprovedTube.videoTitle = function () { return document.title?.replace(/\s*-\s*YouTube$/, '') || movie_player.getVideoData().title || document.querySelector('#title > h1 > *')?.textContent };

// Function to extract and store the number of subscribers
ImprovedTube.extractSubscriberCount = function (subscriberCountNode) {
	if (!subscriberCountNode) { subscriberCountNode = document.getElementById('owner-sub-count'); }
	if (subscriberCountNode) {
		// Extract the subscriber count and store it for further use
		var subscriberCountText = subscriberCountNode.textContent.trim();
		var subscriberCount = parseFloat(subscriberCountText.replace(/[^0-9.]/g, ''));

		if (subscriberCountText.includes('K')) {
			subscriberCount *= 1000;
		} else if (subscriberCountText.includes('M')) {
			subscriberCount *= 1000000;
		}

		ImprovedTube.subscriberCount = subscriberCount;
	}
};
