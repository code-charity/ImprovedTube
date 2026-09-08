/*------------------------------------------------------------------------------
FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/
ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
	const player = this.elements.player,		video = this.elements.video,		paused = video?.paused;
 const t = this.video_url.match(this.regex.video_time)?.[1];
	if (t) {
		if (/[#&]stop=|#t=/.test(this.video_url)) return;
		const r = document.referrer || ""; if (r && !r.includes("youtube.com")) return;
		const h = history || ""; if (h && (h.length === 1 || !h.state?.endpoint?.watchEndpoint)) return;
	}
	if (player && video && this.storage.forced_play_video_from_the_beginning && location.pathname == '/watch') {
		// Skip the seek when the video is effectively already at 0. When
		// YouTube's own playback starts at 0 (fresh video, never watched), a
		// seekTo(0) after page load produces an audible "double play" of the
		// opening moments. Only seek when YouTube has resumed from a saved
		// timestamp (currentTime > 0), which is the case this setting exists
		// to override.
		if (video.currentTime > 1.1) {  // video.currentTime = 0; #262
			player.seekTo(0);
			// restore previous paused state after the seek
			if (paused) { player.pauseVideo(); }
		}
	}
};
/*------------------------------------------------------------------------------
AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	const player = this.elements.player,
		video = this.elements.video,
		isVisibleTab = document.visibilityState === 'visible' && document.hasFocus();

	if (this.storage.player_autopause_when_switching_tabs && player && video) {
		if (this.focus && isVisibleTab && this.played_before_blur && video.paused) {
			player.playVideo();
		} else {
			this.played_before_blur = !video.paused;
			if (!video.paused) {
				player.pauseVideo();
			}
		}
	}
};
/*------------------------------------------------------------------------------
PICTURE IN PICTURE (PIP)
------------------------------------------------------------------------------*/
ImprovedTube.enterPip = function (disable) {
	const video = this.elements.video;

	if (!disable
		&& video
		&& document.pictureInPictureEnabled
		&& typeof video.requestPictureInPicture == 'function') {

		video.requestPictureInPicture().then(() => {
			if (video.paused) {
				// manually send Play message to "Auto-pause while I'm not in the tab", paused PiP wont do it automatically.
				document.dispatchEvent(new CustomEvent('it-play'));
			}
			return true;
		}).catch((err) => console.error('playerAutoPip: Failed to enter Picture-in-Picture mode', err));
	} else if (document.pictureInPictureElement && typeof document.exitPictureInPicture == 'function') {
		document.exitPictureInPicture();
		return false;
	}
};
/*------------------------------------------------------------------------------
AUTO PIP WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutoPip = function () {
	const video = this.elements.video;

	if (this.storage.player_autoPip && this.storage.player_autoPip_outside && this.focus) {
		this.enterPip(true);
	} else if (this.storage.player_autoPip && !this.focus && !video?.paused) {
		this.enterPip();
	}
};
/*------------------------------------------------------------------------------
DISABLE TOUCH SWIPE TO MINI-PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.playerDisableTouchSwipeToMiniplayer = function () {
	var key = 'player_disable_touch_swipe_to_miniplayer',
		options = {capture: true, passive: false},
		blocker = this._touchSwipeToMiniplayerBlocker;

	if (!blocker) {
		blocker = this._touchSwipeToMiniplayerBlocker = {
			touchId: null,
			pointerId: null,
			startX: 0,
			startY: 0,
			blocking: false,
			enabled: false,
			isPlayerSurfaceEvent: function (event) {
				var path = typeof event.composedPath === 'function' ? event.composedPath() : [],
					controlsSelector = 'button, a, input, textarea, select, [role="button"], .ytp-chrome-bottom, .ytp-progress-bar-container, .ytp-settings-menu, .ytp-popup, .ytp-tooltip, .ytp-caption-window-container',
					surfaceSelector = 'video.html5-main-video, .html5-main-video, .html5-video-container, .ytp-cued-thumbnail-overlay';

				for (var i = 0, l = path.length; i < l; i++) {
					if (!path[i] || typeof path[i].matches !== 'function') {
						continue;
					}

					if (path[i].matches(controlsSelector)) {
						return false;
					}

					if (path[i].matches(surfaceSelector)) {
						return true;
					}
				}

				if (event.target && typeof event.target.closest === 'function') {
					return !event.target.closest(controlsSelector) && Boolean(event.target.closest(surfaceSelector));
				}

				return false;
			},
			start: function (x, y, id, isPointer) {
				this.startX = x;
				this.startY = y;
				this.blocking = false;
				if (isPointer) {
					this.pointerId = id;
				} else {
					this.touchId = id;
				}
			},
			end: function () {
				this.touchId = null;
				this.pointerId = null;
				this.blocking = false;
			},
			shouldBlock: function (x, y) {
				var deltaX = Math.abs(x - this.startX),
					deltaY = y - this.startY;

				return deltaY >= 8 && deltaY > deltaX * 1.2;
			},
			stopGesture: function (event) {
				if (event.cancelable) {
					event.preventDefault();
				}

				event.stopImmediatePropagation();
				event.stopPropagation();
			}
		};

		blocker.touchStart = function (event) {
			if (event.touches.length !== 1 || !blocker.isPlayerSurfaceEvent(event)) {
				blocker.end();
				return;
			}

			blocker.start(event.touches[0].clientX, event.touches[0].clientY, event.touches[0].identifier, false);
		};

		blocker.touchMove = function (event) {
			var touch = null;

			for (var i = 0, l = event.touches.length; i < l; i++) {
				if (event.touches[i].identifier === blocker.touchId) {
					touch = event.touches[i];
					break;
				}
			}

			if (!touch) {
				return;
			}

			if (blocker.blocking || blocker.shouldBlock(touch.clientX, touch.clientY)) {
				blocker.blocking = true;
				blocker.stopGesture(event);
			}
		};

		blocker.touchEnd = function (event) {
			var ended = event.touches.length === 0;

			for (var i = 0, l = event.changedTouches.length; i < l; i++) {
				ended = ended || event.changedTouches[i].identifier === blocker.touchId;
			}

			if (blocker.blocking) {
				blocker.stopGesture(event);
			}

			if (ended) {
				blocker.end();
			}
		};

		blocker.pointerDown = function (event) {
			if (event.pointerType !== 'touch' || !blocker.isPlayerSurfaceEvent(event)) {
				blocker.end();
				return;
			}

			blocker.start(event.clientX, event.clientY, event.pointerId, true);
		};

		blocker.pointerMove = function (event) {
			if (event.pointerId !== blocker.pointerId) {
				return;
			}

			if (blocker.blocking || blocker.shouldBlock(event.clientX, event.clientY)) {
				blocker.blocking = true;
				blocker.stopGesture(event);
			}
		};

		blocker.pointerEnd = function (event) {
			if (event.pointerId !== blocker.pointerId) {
				return;
			}

			if (blocker.blocking) {
				blocker.stopGesture(event);
			}

			blocker.end();
		};
	}

	if (this.storage[key] === true && blocker.enabled === false) {
		document.addEventListener('touchstart', blocker.touchStart, options);
		document.addEventListener('touchmove', blocker.touchMove, options);
		document.addEventListener('touchend', blocker.touchEnd, options);
		document.addEventListener('touchcancel', blocker.touchEnd, options);
		document.addEventListener('pointerdown', blocker.pointerDown, options);
		document.addEventListener('pointermove', blocker.pointerMove, options);
		document.addEventListener('pointerup', blocker.pointerEnd, options);
		document.addEventListener('pointercancel', blocker.pointerEnd, options);
		blocker.enabled = true;
	} else if (this.storage[key] !== true && blocker.enabled === true) {
		document.removeEventListener('touchstart', blocker.touchStart, options);
		document.removeEventListener('touchmove', blocker.touchMove, options);
		document.removeEventListener('touchend', blocker.touchEnd, options);
		document.removeEventListener('touchcancel', blocker.touchEnd, options);
		document.removeEventListener('pointerdown', blocker.pointerDown, options);
		document.removeEventListener('pointermove', blocker.pointerMove, options);
		document.removeEventListener('pointerup', blocker.pointerEnd, options);
		document.removeEventListener('pointercancel', blocker.pointerEnd, options);
		blocker.enabled = false;
		blocker.end();
	}
};
/*------------------------------------------------------------------------------
PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playbackSpeed = function (newSpeed) {
	const [player, video] = (document.documentElement.dataset.pageType === 'shorts')
		? [this.elements.shorts_player, this.elements.shorts_player?.querySelector('video')]
		: [this.elements.player, this.elements.video],
		speed = video?.playbackRate ? Number(video.playbackRate.toFixed(2)) : (player?.getPlaybackRate ? Number(player.getPlaybackRate().toFixed(2)) : null);

	if (!speed) {
		console.error('PlaybackSpeed: Cant establish playbackRate/getPlaybackRate');
		return false;
	}

	// called with no option or demanded speed already set, only provide readback
	if (!newSpeed || speed == newSpeed) return speed;

	if (video?.playbackRate) {
		video.playbackRate = newSpeed;
		newSpeed = Number(video.playbackRate.toFixed(2));
	} else if (player?.setPlaybackRate && player.getPlaybackRate) {
		player.setPlaybackRate(newSpeed);
		newSpeed = Number(player.getPlaybackRate().toFixed(2));
	} else newSpeed = false;

	return newSpeed;
};
/*------------------------------------------------------------------------------
PERMANENT PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playerPlaybackSpeed = function () { if (this.storage.player_forced_playback_speed === true) {
	var player = this.elements.player; if (!player) return;
	var video = this.elements.video || player.querySelector('video');
	option = this.storage.player_playback_speed;
	if (this.isset(option) === false) { option = 1; }
	else if ( option !== 1 ) {
		const speed = video?.playbackRate ? Number(video.playbackRate.toFixed(2)) : (player?.getPlaybackRate ? Number(player.getPlaybackRate().toFixed(2)) : null);
		 if (speed !== option && speed !== 1 && speed !== Number((Math.floor(option / 0.05) * 0.05).toFixed(2)))
		   { console.log("skipping permanent speed, since speed was manually set differently for this video to:" + video.playbackRate + ", was it?"); return; }
	}
	if (!(player.getVideoData() && player.getVideoData().isLive))
	{ player.setPlaybackRate(Number(option)); if (!video) { video = { playbackRate: 1 }; };	video.playbackRate = Number(option); // #1729 q2 // hi! @raszpl
		if ( (this.storage.player_force_speed_on_music !== true || this.storage.player_dont_speed_education === true)
		 	&& option !== 1) {
			ImprovedTube.speedException = function () {
				if (this.storage.player_dont_speed_education === true && DATA.genre === 'Education')
				{player.setPlaybackRate(Number(1));	video.playbackRate = Number(1); return;}
				if (this.storage.player_force_speed_on_music === true)
				{ //player.setPlaybackRate(Number(option));	video.playbackRate = Number(option);
	 return;}
				if (DATA.keywords && !keywords) { keywords = DATA.keywords.join(', ') || ''; }
				if (keywords === 'video, sharing, camera phone, video phone, free, upload') { keywords = ''; }
				var musicIdentifiers = /(official|music|lyrics?)[ -]video|(cover|studio|radio|album|alternate)[- ]version|soundtrack|unplugged|\bmedley\b|\blo-fi\b|\blofi\b|a(lla)? cappella|feat\.|(piano|guitar|jazz|ukulele|violin|reggae)[- ](version|cover)|karaok|backing[- ]track|instrumental|(sing|play)[- ]?along|卡拉OK|卡拉OK|الكاريوكي|караоке|カラオケ|노래방|bootleg|mashup|Radio edit|Guest (vocals|musician)|(title|opening|closing|bonus|hidden)[ -]track|live acoustic|interlude|featuring|recorded (at|live)/i;
				var musicIdentifiersTitleOnly = /lyrics|theme song|\bremix|\bAMV ?[^a-z0-9]|[^a-z0-9] ?AMV\b|\bfull song\b|\bsong:|\bsong[\!$]|^song\b|( - .*\bSong\b|\bSong\b.* - )|cover ?[^a-z0-9]|[^a-z0-9] ?cover|\bconcert\b/i;
				var musicIdentifiersTitle = new RegExp(musicIdentifiersTitleOnly.source + '|' + musicIdentifiers.source, "i");
				var musicRegexMatch = musicIdentifiersTitle.test(DATA.title);
				if (!musicRegexMatch) {
					var musicIdentifiersTagsOnly = /, (lyrics|remix|song|music|AMV|theme song|full song),|\(Musical Genre\)|, jazz|, reggae/i;
					var musicIdentifiersTags = new RegExp(musicIdentifiersTagsOnly.source + '|' + musicIdentifiers.source, "i");
				  keywordsAmount = 1 + ((keywords || '').match(/,/) || []).length;
					if ( ((keywords || '').match(musicIdentifiersTags) || []).length / keywordsAmount > 0.08) {
						musicRegexMatch = true}}
				notMusicRegexMatch = /\bdo[ck]u|interv[iyj]|back[- ]?stage|インタビュー|entrevista|面试|面試|회견|wawancara|مقابلة|интервью|entretien|기록한 것|记录|記錄|ドキュメンタリ|وثائقي|документальный/i.test(DATA.title + " " + keywords);
				// (Tags/keywords shouldnt lie & very few songs titles might have these words)
				if (DATA.duration) {
					function parseDuration (duration) {	const [_, h = 0, m = 0, s = 0] = duration.match(/PT(?:(\d+)?H)?(?:(\d+)?M)?(\d+)?S?/).map(part => parseInt(part) || 0);
						return h * 3600 + m * 60 + s; }
					DATA.lengthSeconds = parseDuration(DATA.duration); 	}
				function testSongDuration (s, ytMusic) {
					if (135 <= s && s <= 260) {return 'veryCommon';}
					if (105 <= s && s <= 420) {return 'common';}
					if (420 <= s && s <= 720) {return 'long';}
					if (45 <= s && s <= 105) {return 'short';}
					if (ytMusic && ytMusic > 1 && (85 <= s / ytMusic && (s / ytMusic <= 375 || ytMusic == 10))) {return 'multiple';}
				//does Youtube ever show more than 10 songs below the description?
				}
				var songDurationType = testSongDuration(DATA.lengthSeconds);
				console.log("genre: " + DATA.genre + "//title: " + DATA.title + "//keywords: " + keywords + "//music word match: " + musicRegexMatch + "// not music word match:" + notMusicRegexMatch + "//duration: " + DATA.lengthSeconds + "//song duration type: " + songDurationType);
				// check if the video is PROBABLY MUSIC:
				if ( 		( DATA.genre === 'Music' && (!notMusicRegexMatch || songDurationType === 'veryCommon'))
			|| ( musicRegexMatch && !notMusicRegexMatch && (typeof songDurationType !== 'undefined'
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범|mixtape|concert|playlist|\b(live|cd|vinyl|lp|ep|compilation|collection|symphony|suite|medley)\b/i.test(DATA.title + " " + keywords)
							&& 1000 <= DATA.lengthSeconds )) ) // && 1150 <= DATA.lengthSeconds <= 5000
			||	( DATA.genre === 'Music' && musicRegexMatch && (typeof songDurationType !== 'undefined'
						|| (/album|Álbum|专辑|專輯|एलबम|البوم|アルバム|альбом|앨범|mixtape|concert|playlist|\b(live|cd|vinyl|lp|ep|compilation|collection|symphony|suite|medley)\b/i.test(DATA.title + " " + keywords)
							&& 1000 <= DATA.lengthSeconds )) ) // && DATA.lengthSeconds <= 5000
			|| (amountOfSongs && testSongDuration(DATA.lengthSeconds, amountOfSongs ) !== 'undefined')
		 //	||  location.href.indexOf('music.') !== -1  // (=currently we are only running on www.youtube.com anyways)
				)	{ player.setPlaybackRate(1); video.playbackRate = 1; console.log ("...,thus must be music?"); }
				else { 	// Now this video might rarely be music
					// - however we can make extra-sure after waiting for the video descripion to load... (#1539)
					if (location.href.indexOf('/watch?') !== -1) {
						let tries = 0;
						const intervalMs = 210;
						const maxTries = 10;
						const waitForDescription = setInterval(() => {
							const subtitle = document.querySelector('#title + #subtitle:last-of-type');
							// console.log("[SPEED] checking for music keywords in the description... try " + tries + "// subtitle: " + subtitle?.innerHTML);
							const descriptionSongCount = Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0]);
							if (subtitle && 1 <= descriptionSongCount && typeof testSongDuration(DATA.lengthSeconds, descriptionSongCount) !== 'undefined')
							{player.setPlaybackRate(1); video.playbackRate = 1; console.log("...but YouTube shows music below the description!"); clearInterval(waitForDescription); return; }
							if (++tries >= maxTries) {
								// console.log("[SPEED] max tries reached, stopping description check...");
								clearInterval(waitForDescription);
							}
						}, intervalMs);
					}
				}
			}
			//DATA  (TO-DO: make the Data available to more/all features? #1452  #1763  (Then can replace ImprovedTube.elements.category === 'music', VideoID is also used elsewhere)
			DATA = {};
			defaultKeywords = "video,sharing,camera,phone,video phone,free,upload";
			keywords = false; amountOfSongs = false;

			ImprovedTube.fetchDOMData = function () {
				try { DATA = JSON.parse(document.querySelector('#microformat script')?.textContent) ?? false; DATA.title = DATA.name;}
			 catch { DATA.genre = false; DATA.keywords = false; DATA.lengthSeconds = false;
					try {
						DATA.title = document.getElementsByTagName('meta')?.title?.content || false;
						DATA.genre = document.querySelector('meta[itemprop=genre]')?.content || false;
						DATA.duration = document.querySelector('meta[itemprop=duration]')?.content || false;
			 } catch {}}

let tries = 0; const maxTries = 11; let intervalMs = 200;
const waitForVideoTitle = setInterval(() => { const title = ImprovedTube.videoTitle?.();  tries++;

if (title && title !== 'YouTube') {
    clearInterval(waitForVideoTitle);
			 DATA.videoID = ImprovedTube.videoId() || false;     // console.log("SPEED: TITLE:" + ImprovedTube.videoTitle() + DATA.title);
			 if ( DATA.title && (DATA.title === ImprovedTube.videoTitle() || DATA.title.replace(/\s{2,}/g, ' ') === ImprovedTube.videoTitle()) )
				{ keywords = document.querySelector('meta[name="keywords"]')?.content || ''; ImprovedTube.speedException(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);
					console.log("loading the html source:" + `https://www.youtube.com/watch?v=${DATA.videoID}`);
					const htmlContent = await response.text();
					const metaRegex = /<meta[^>]+(?:name|itemprop)=["'](keywords|genre|duration|title)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
					let match; while ((match = metaRegex.exec(htmlContent)) !== null) { // console.log(match);
						const [, property, value] = match;
						if (property === 'keywords') { keywords = value;} else {DATA[property] = value;}
					}
					amountOfSongs = (htmlContent.slice(-80000).match(/},"subtitle":{"simpleText":"(\d*)\s/) || [])[1] || false;
					if (keywords) { ImprovedTube.speedException(); }
				} catch (error) { console.error('Error: fetching from https://Youtube.com/watch?v=${DATA.videoID}', error); keywords = ''; }
				})();
				}
}

if (tries >= maxTries) {  clearInterval(waitForVideoTitle); } intervalMs *= 1.11; }, intervalMs);
window.addEventListener('load', () => {  setTimeout(() => { clearInterval(waitForVideoTitle) }, 5000);});
			};
			ImprovedTube.fetchDOMData();
/*
			if ( (history && history.length === 1) || !history?.state?.endpoint?.watchEndpoint) { ImprovedTube.fetchDOMData(); }
			else {
				//Invidious instances. Should be updated automatically!...
				const invidiousInstances = ['invidious.fdn.fr', 'inv.tux.pizza', 'invidious.flokinet.to', 'invidious.protokolla.fi', 'invidious.private.coffee', 'yt.artemislena.eu', 'invidious.materialio.us', 'iv.datura.network'];
				function getRandomInvidiousInstance () { return invidiousInstances[Math.floor(Math.random() * invidiousInstances.length)];}

				(async function () {	 let retries = 4;	let invidiousFetched = false;
					async function fetchInvidiousData () {
						try {const response = await fetch(`https://${getRandomInvidiousInstance()}/api/v1/videos/${DATA.videoID}?fields=genre,title,lengthSeconds,keywords`);
			 DATA = await response.json();
			 if (DATA.genre && DATA.title && DATA.keywords && DATA.lengthSeconds) { if (DATA.keywords.toString() === defaultKeywords ) {DATA.keywords = ''}
				 ImprovedTube.speedException(); invidiousFetched = true;	}
						} catch (error) { console.error('Error: Invidious API: ', error); }
					}
					while (retries > 0 && !invidiousFetched) { await fetchInvidiousData();
						if (!invidiousFetched) { await new Promise(resolve => setTimeout(resolve, retries === 4 ? 1500 : 876)); retries--; }	}
					if (!invidiousFetched) { if (document.readyState === 'loading') {document.addEventListener('DOMContentLoaded', ImprovedTube.fetchDOMData())}
					else { ImprovedTube.fetchDOMData();} }
				})();
			}
*/
		}	// else { }
	}
}
}
/*------------------------------------------------------------------------------
SUBTITLES
------------------------------------------------------------------------------*/
ImprovedTube.playerSubtitles = function (attempt = 0) {
	const player = this.elements.player;

	if (player) {
		if (player.isSubtitlesOn && player.toggleSubtitles && player.toggleSubtitlesOn) {
			switch (this.storage.player_subtitles) {
				case true:
				case 'enabled':
					player.toggleSubtitlesOn();
					break

				case 'disabled':
					if (player.isSubtitlesOn()) { player.toggleSubtitles(); }
					break
			}
		} else if (attempt < 10) {
			setTimeout(() => {
				ImprovedTube.playerSubtitles(attempt + 1);
			}, 200 + 30 * attempt);
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES LANGUAGE
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesLanguage = function () {
	const option = this.storage.subtitles_language,
		player = this.elements.player;
	let subtitlesState;

	if (option && player && player.getOption && player.setOption && player.isSubtitlesOn && player.toggleSubtitles) {
		const matchedTrack = player.getOption('captions', 'tracklist', {includeAsr: true})?.find(track => track.languageCode.includes(option) && (!track.vss_id.includes("a.") || this.storage.auto_generate));

		if (matchedTrack) {
			subtitlesState = player.isSubtitlesOn();
			player.setOption('captions', 'track', matchedTrack);
			// setOption forces Subtitles ON, restore state from before calling it.
			if (!subtitlesState) { player.toggleSubtitles(); }
		}
	}
};
/*------------------------------------------------------------------------------
SUBTITLES FONT FAMILY
SUBTITLES FONT COLOR
SUBTITLES FONT SIZE
SUBTITLES BACKGROUND COLOR
SUBTITLES BACKGROUND OPACITY
SUBTITLES WINDOW COLOR
SUBTITLES WINDOW OPACITY
SUBTITLES CHARACTER EDGE STYLE
SUBTITLES FONT OPACITY
default = {
	"fontFamily": 4,
	"color": "#fff",
	"fontSizeIncrement": 0,
	"background": "#080808",
	"backgroundOpacity": 0.75,
	"windowColor": "#080808",
	"windowOpacity": 0,
	"charEdgeStyle": 0,
	"textOpacity": 1,
},
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesUserSettings = function () {
	const ourSettings = {
			fontFamily: this.storage.subtitles_font_family,
			color: this.storage.subtitles_font_color,
			fontSizeIncrement: this.storage.subtitles_font_size,
			background: this.storage.subtitles_background_color,
			backgroundOpacity: this.storage.subtitles_background_opacity,
			windowColor: this.storage.subtitles_window_color,
			windowOpacity: this.storage.subtitles_window_opacity,
			charEdgeStyle: this.storage.subtitles_character_edge_style,
			textOpacity: this.storage.subtitles_font_opacity
		},
		userSettings = Object.keys(ourSettings).filter(e => ourSettings[e]),
		player = this.elements.player;

	if (userSettings.length && player && player.getSubtitlesUserSettings && player.updateSubtitlesUserSettings) {
		let ytSettings = player.getSubtitlesUserSettings(),
			setting;

		if (!ytSettings) return; //null SubtitlesUserSettings seem to mean subtitles not available

		for (const value of userSettings) {
			setting = null;
			switch (value) {
				case 'fontFamily':
				case 'fontSizeIncrement':
				case 'charEdgeStyle':
					setting = Number(ourSettings[value]);
					break;

				case 'color':
				case 'background':
				case 'windowColor':
					setting = ourSettings[value];
					break;

				case 'backgroundOpacity':
				case 'windowOpacity':
				case 'textOpacity':
					setting = Number(ourSettings[value]) / 100;
					break;
			}

			if (Object.keys(ytSettings).includes(value)) {
				ytSettings[value] = setting;
			} else {
				console.error('subtitlesUserSettings failed at: ', value, setting);
			}
		}
		player.updateSubtitlesUserSettings(ytSettings);
	}
};
/*------------------------------------------------------------------------------
SUBTITLES DISABLE SUBTILES FOR LYRICS
------------------------------------------------------------------------------*/
ImprovedTube.subtitlesDisableLyrics = function () {
	if (this.storage.subtitles_disable_lyrics) {
		const player = this.elements.player;

		if (player && player.isSubtitlesOn && player.isSubtitlesOn() && player.toggleSubtitles) {
			// Music detection only uses 3 identifiers for Lyrics: lyrics, sing-along, karaoke.
			// Easier to simply use those here. Can replace with music detection later.
			const terms = ["sing along", "sing-along", "karaoke", "lyric", "卡拉OK", "卡拉OK", "الكاريوكي", "караоке", "カラオケ", "노래방"];
			if (terms.some(term => this.videoTitle().toLowerCase().includes(term))) {
				player.toggleSubtitles();
			}
		}
	}
};
/*------------------------------------------------------------------------------
UP NEXT AUTOPLAY
------------------------------------------------------------------------------*/
ImprovedTube.upNextAutoplay = function () {
	var option = this.storage.up_next_autoplay;

	if (this.isset(option)) {
		var toggle = document.querySelector('.ytp-autonav-toggle-button');

		if (toggle) {
			if (option !== (toggle.getAttribute('aria-checked') === 'true')) {
				toggle.click();
			}
		}
	}
};
/*------------------------------------------------------------------------------
ADS
------------------------------------------------------------------------------*/
ImprovedTube.playerAds = function (parent) {

	let button = parent.querySelector('.ytp-ad-skip-button-modern.ytp-button,[class*="ytp-ad-skip-button"].ytp-button') || parent;
	// TODO: Replace this with centralized video element pointer
	let video = document.querySelector('.video-stream.html5-main-video') || false;
	function skipAd () {
		if (video && Number.isFinite(video.duration)) video.currentTime = video.duration;
		if (button) button.click();
	}
	if (this.storage.ads === 'block_all') {
		skipAd();
	} else if (this.storage.ads === 'subscribed_channels') {
		if (!parent.querySelector('#meta paper-button[subscribed]')) {
			skipAd();
		}
	} else if (this.storage.ads === 'block_music') {
		if (ImprovedTube.elements.category === 'music') {
			skipAd();
		}
	} else if (this.storage.ads === 'small_creators') {
		let userDefiniedLimit = this.storage.smallCreatorsCount * parseInt(this.storage.smallCreatorsUnit);
		let subscribersNumber = ImprovedTube.subscriberCount;
		if (subscribersNumber > userDefiniedLimit) {
			skipAd();
		}
	}
};
/*------------------------------------------------------------------------------
AUTO FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.playerAutofullscreen = function () {
	if (this.storage.player_autofullscreen !== true) {
		return;
	}
	if (document.documentElement.dataset.pageType !== 'video') {
		return;
	}

	var player = this.elements.player;
	if (!player || typeof player.toggleFullscreen !== 'function') {
		return;
	}

	// Once per video URL after a successful enter (avoids re-toggling on pause/play).
	if (this._autofullscreenFor === location.href) {
		return;
	}

	var alreadyFullscreen = !!(
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullScreenElement ||
		player.classList.contains('ytp-fullscreen') ||
		(typeof player.isFullscreen === 'function' && player.isFullscreen())
	);

	if (alreadyFullscreen) {
		this._autofullscreenFor = location.href;
		return;
	}

	try {
		player.toggleFullscreen();
	} catch (error) {
		return;
	}

	// Firefox often rejects fullscreen without a user gesture (navigate-time call).
	// Only lock this video if fullscreen actually engaged; otherwise allow retry on play.
	setTimeout(function () {
		var playerNow = ImprovedTube.elements.player;
		var ok = !!(
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			(playerNow && playerNow.classList.contains('ytp-fullscreen'))
		);
		if (ok) {
			ImprovedTube._autofullscreenFor = location.href;
		}
	}, 250);
};
/*------------------------------------------------------------------------------
QUALITY
------------------------------------------------------------------------------*/
ImprovedTube.playerQuality = function (quality = this.storage.player_quality) {
  var playlistQ = this.storage.player_quality_playlist;
  var isPlaylist = !!(
    new URLSearchParams(location.search).has('list') ||
    document.querySelector('ytd-playlist-panel-renderer')
  );
  if (isPlaylist && playlistQ && playlistQ !== 'disabled') {
    quality = playlistQ;
  }

  let player = this.elements.player;
	if (quality && quality !== 'disabled'
		&& player && player.getAvailableQualityLevels
		&& (!player.dataset.defaultQuality || player.dataset.defaultQuality != quality)) {
		let available_quality_levels = player.getAvailableQualityLevels();
		try {
			const hasTrue1080pOrHigher = available_quality_levels.some(q =>
				['hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'].includes(q)
			);
			if (
				!hasTrue1080pOrHigher &&
				['hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'].includes(quality)
			) {
				console.log('[ImprovedTube] Preventing AI-upscaled "Super Resolution" — capping to 720p.');
				quality = 'hd720';
			}
		} catch (e) {
			console.warn('[ImprovedTube] Error checking available quality levels', e);
		}
		function closest (num, arr) {
			let curr = arr[0];
			let diff = Math.abs(num - curr);
			for (let val = 1; val < arr.length; val++) {
				let newdiff = Math.abs(num - arr[val]);
				if (newdiff < diff) {
					diff = newdiff;
					curr = arr[val];
				}
			}
			return curr;
		};

		if (!available_quality_levels.includes(quality)) {
			let label = ['tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'hd2880', 'highres'];
			let resolution = ['144', '240', '360', '480', '720', '1080', '1440', '2160', '2880', '4320'];
			let availableresolutions = available_quality_levels.map(q => resolution[label.indexOf(q)]);
			quality = label[resolution.indexOf(closest(resolution[label.indexOf(quality)], availableresolutions))];
		}
		player.setPlaybackQualityRange(quality);
		player.setPlaybackQuality(quality);
		player.dataset.defaultQuality = quality;
	}
};
/*------------------------------------------------------------------------------
QUALITY WITHOUT FOCUS
------------------------------------------------------------------------------*/
ImprovedTube.playerQualityWithoutFocus = function () {
	let player = this.elements.player,
		qualityWithoutFocus = this.storage.player_quality_without_focus;
	if (qualityWithoutFocus && qualityWithoutFocus !== 'auto' && player && player.getPlaybackQuality) {
		if (this.focus) {
			if (ImprovedTube.qualityBeforeBlur) {
				ImprovedTube.playerQuality(ImprovedTube.qualityBeforeBlur);
				ImprovedTube.qualityBeforeBlur = undefined;
			}
		} else {
			if (!ImprovedTube.elements.video.paused) {
				if (!ImprovedTube.qualityBeforeBlur) {
					ImprovedTube.qualityBeforeBlur = player.getPlaybackQuality();
				}
				ImprovedTube.playerQuality(qualityWithoutFocus);
			}
		}
	}
};
/*------------------------------------------------------------------------------
QUALITY FULL SCREEN
------------------------------------------------------------------------------*/
ImprovedTube.playerQualityFullScreen = function () {
   var isFs = !!(
     document.fullscreenElement ||
     document.webkitFullscreenElement ||
     document.mozFullScreenElement ||
     document.msFullscreenElement ||
     document.webkitIsFullScreen ||
     document.mozFullScreen
   );

   var fsq = ImprovedTube.storage.full_screen_quality;
	 var playlistQ = ImprovedTube.storage.player_quality_playlist;
	 var isPlaylist = !!(
    new URLSearchParams(location.search).has('list') ||
    document.querySelector('ytd-playlist-panel-renderer') ||
    document.querySelector('#playlist')
		);
	 var target = isFs ? fsq : (isPlaylist && playlistQ && playlistQ !== 'disabled') ? playlistQ : ImprovedTube.storage.player_quality;

   var map = {
     '144p':'tiny','240p':'small','360p':'medium','480p':'large',
     '720p':'hd720','1080p':'hd1080','1440p':'hd1440','2160p':'hd2160','4320p':'highres',
     'tiny':'tiny','small':'small','medium':'medium','large':'large',
     'hd720':'hd720','hd1080':'hd1080','hd1440':'hd1440','hd2160':'hd2160','highres':'highres'
   };
   var desired = map[target] || target;

   function applyQuality(){
    var isPlaylist = !!(
        new URLSearchParams(location.search).has('list') ||
        document.querySelector('ytd-playlist-panel-renderer')
    );
    var finalTarget = isFs ? fsq
        : (isPlaylist && playlistQ && playlistQ !== 'disabled') ? playlistQ
        : ImprovedTube.storage.player_quality;
    var desired = map[finalTarget] || finalTarget;

    var player = ImprovedTube.elements && ImprovedTube.elements.player;
    if (!player) return;
    if (typeof ImprovedTube.playerQuality === 'function') {
        ImprovedTube.playerQuality(desired);
        return;
    }
    try { if (typeof player.setPlaybackQualityRange === 'function') player.setPlaybackQualityRange(desired, desired); } catch(e) {console.log(e)}
    try { if (typeof player.setPlaybackQuality === 'function') player.setPlaybackQuality(desired); } catch(e) {console.log(e)}
}

  setTimeout(applyQuality, 300);
	setTimeout(applyQuality, 800);
	setTimeout(applyQuality, 1500);
	setTimeout(applyQuality, 3000);
   }


/*------------------------------------------------------------------------------
BATTERY FEATURES;   PLAYER QUALITY BASED ON POWER STATUS
------------------------------------------------------------------------------*/
ImprovedTube.batteryFeatures = async function () {
	if (ImprovedTube.storage.qualityWhenRunningOnBattery
		  || ImprovedTube.storage.pauseWhileIUnplugTheCharger
		  || ImprovedTube.storage.whenBatteryIslowDecreaseQuality) {
		  const updateQuality = async (battery, charging) => {
			  if (battery) {
				if (!battery.charging) {
					if (ImprovedTube.storage.pauseWhileIUnplugTheCharger && charging) {
						ImprovedTube.elements.player.pauseVideo();
						ImprovedTube.paused = true;
					}
					if (ImprovedTube.storage.qualityWhenRunningOnBattery) {
						ImprovedTube.playerQuality(ImprovedTube.storage.qualityWhenRunningOnBattery);
					}
					if (ImprovedTube.storage.whenBatteryIslowDecreaseQuality) {
						let quality;
						if (battery.level > 0.11 || battery.dischargingTime > 900) {
							quality = "large";
						} else if (battery.level > 0.08 || battery.dischargingTime > 600) {
							quality = "medium";
						} else if (battery.level > 0.04 || battery.dischargingTime > 360) {
							quality = "small";
						} else {
							quality = "tiny";
						}
						ImprovedTube.playerQuality(quality);
					}
				} else if (charging && ImprovedTube.paused && ImprovedTube.storage.pauseWhileIUnplugTheCharger) {
					ImprovedTube.elements.player.playVideo();
					delete ImprovedTube.paused;
				}
			}
		};
		const battery = await navigator.getBattery();
		battery.addEventListener("levelchange", () => updateQuality(battery));
		battery.addEventListener("chargingchange", () => updateQuality(battery, true));
		await updateQuality(battery);
	}
};
/*------------------------------------------------------------------------------
FORCED VOLUME
------------------------------------------------------------------------------*/
ImprovedTube.playerVolume = function () {
	if (this.storage.player_forced_volume === true) {
		var volume = this.storage.player_volume;

		if (!this.isset(volume)) {
			volume = 100;
		} else {
			volume = Number(volume);
		}
		// Fix: Explicitly handle mute state
		if (volume === 0) {
			if (!this.elements.player.isMuted()) {
				this.elements.player.mute();
			}
		} else {
			if (this.elements.player.isMuted()) {
				this.elements.player.unMute();
			}
		}

		if (!this.audioContextGain && volume <= 100) {
			if (this.audioContext) {
				this.audioContext.close();
			}

			this.elements.player.setVolume(volume);
		} else {
			if (!this.audioContext) {
				this.audioContext = new AudioContext();

				this.audioContextSource = this.audioContext.createMediaElementSource(document.querySelector('video'));
				this.audioContextGain = this.audioContext.createGain();

				this.audioContextGain.gain.value = 1;
				this.audioContextSource.connect(this.audioContextGain);
				this.audioContextGain.connect(this.audioContext.destination)
			}
			if (this.elements.player.getVolume() !== 100) { this.elements.player.setVolume(100);}
			this.audioContextGain.gain.value = volume / 100;
		}
	}
};
/*------------------------------------------------------------------------------
LOUDNESS NORMALIZATION
------------------------------------------------------------------------------*/
ImprovedTube.onvolumechange = function () {
	if (document.querySelector('.ytp-volume-panel') && ImprovedTube.storage.player_loudness_normalization === false) {
		var volume = Number(document.querySelector('.ytp-volume-panel').getAttribute('aria-valuenow'));

		this.volume = volume / 100;
	}
};

ImprovedTube.playerLoudnessNormalization = function () {
	var video = this.elements.video;

	if (video) {
		video.removeEventListener('volumechange', this.onvolumechange);
		video.addEventListener('volumechange', this.onvolumechange);
	}

	if (this.storage.player_loudness_normalization === false) {
		try {
			var local_storage = localStorage['yt-player-volume'];

			if (this.isset(Number(this.storage.player_volume)) && this.storage.player_forced_volume === true) {
				return;
			} else if (local_storage) {
				local_storage = JSON.parse(JSON.parse(local_storage).data);

				local_storage = Number(local_storage.volume);

				video.volume = local_storage / 100;
			} else {
				video.volume = 100;
			}
		} catch (err) {}
	}
};

/*------------------------------------------------------------------------------
SCREENSHOT
------------------------------------------------------------------------------*/
ImprovedTube.screenshot = function () {
	const video = ImprovedTube.elements.video,
		cvs = document.createElement('canvas'),
		ctx = cvs.getContext('2d');
	let subText = '';

	cvs.width = video.videoWidth;
	cvs.height = video.videoHeight;

	ctx.drawImage(video, 0, 0, cvs.width, cvs.height);

	if (ImprovedTube.storage.embed_subtitle != false) {
		let captionElements = document.querySelectorAll('.captions-text .ytp-caption-segment');
		captionElements.forEach(function (caption) {subText += caption.textContent.trim() + ' ';});

		ImprovedTube.renderSubtitle(ctx, captionElements);
	}

	cvs.toBlob(function (blob) {
		if (ImprovedTube.storage.player_screenshot_save_as == 'clipboard') {
			window.focus();
			navigator.clipboard.write([
				new ClipboardItem({
					'image/png': blob
				})
			])
				.then(function () { console.log("ImprovedTube: Screeeeeeenshot tada!"); })
				.catch(function (error) {
					console.log('ImprovedTube screenshot: ', error);
					alert('ImprovedTube Screenshot to Clipboard error. Details in Debug Console.');
				});
		} else {
			let a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			const channelNameEl = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
			const channelName = channelNameEl ? channelNameEl.textContent.trim() : '';
			a.download = (ImprovedTube.videoId() || location.href.match) + ' ' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + (channelName ? ' ' + channelName : '') + ' ' + ImprovedTube.videoTitle() + (subText ? ' - ' + subText.trim() : '') + '.png';
			a.click();
			console.log("ImprovedTube: Screeeeeeenshot tada!");
		}
	});
};

ImprovedTube.copyTranscript = function (svg, button) {
	try {
		svg.style.opacity = '1';
		button.dataset.tooltip = 'FetchingTranscript';

		var existingTranscriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
		if (existingTranscriptSegments.length > 0) {
			var transcriptText = '';
			existingTranscriptSegments.forEach(function (segment) {
				var textElement = segment.querySelector('.segment-text');
				if (textElement) {
					transcriptText += textElement.textContent.trim() + ' ';
				}
			});

			transcriptText = transcriptText.trim();
			if (transcriptText) {
				navigator.clipboard.writeText(transcriptText);
				button.dataset.tooltip = 'Copied!';
				setTimeout(function () {
					button.dataset.tooltip = 'CopyTranscript';
					svg.style.opacity = '.5';
				}, 1000);
				return;
			}
		}
		var transcriptButtonSelector = 'button[aria-label*="scrip"], button[aria-label*="skrip"], button[aria-label*="скрипт"], button[aria-label*="스크립"], button[aria-label*="スクリ"],'
										+ 'button[aria-label*="guion"], button[aria-label*="naskah"], button[aria-label*="脚本"], button[aria-label*="文字"], button[aria-label*="نص"], button[aria-label*="نقل"],'
										+ 'button[aria-label*="प्रतिलि"], button[aria-label*="प्रत"], button[aria-label*="লিপি"], button[aria-label*="bản ghi"], button[aria-label*="steno"],'
										+ 'button[aria-label*="γραφ"], button[aria-label*="přep"], button[aria-label*="átir"], button[aria-label*="avsk"]';
		var transcriptButton = document.querySelector(transcriptButtonSelector) || document.querySelector('ytd-video-description-transcript-section-renderer button');

		if (!transcriptButton) {
			var moreActionsButton = document.querySelector('#description ytd-text-inline-expander #expand, #description tp-yt-paper-button#expand');
			if (moreActionsButton && !moreActionsButton.hasAttribute('hidden')) {
				moreActionsButton.click();
				setTimeout(function () {
					transcriptButton = document.querySelector(transcriptButtonSelector) || 	document.querySelector('ytd-video-description-transcript-section-renderer button');
					if (transcriptButton) {
						transcriptButton.click();
						ImprovedTube.waitForTranscriptAndCopy(svg, button);
					} else {
						throw new Error('Transcript button not found');
					}
				}, 500);
				return;
			} else {
				throw new Error('Transcript not available for this video');
			}
		}

		transcriptButton.click();
		ImprovedTube.waitForTranscriptAndCopy(svg, button);

	} catch (error) {
		console.error('ImprovedTube: Failed to copy transcript:', error);
		button.dataset.tooltip = 'TranscriptError';
		setTimeout(function () {
			button.dataset.tooltip = 'CopyTranscript';
			svg.style.opacity = '.5';
		}, 2000);
	}
};

ImprovedTube.waitForTranscriptAndCopy = function (svg, button) {
	var attempts = 0;
	var maxAttempts = 20;

	var checkInterval = setInterval(function () {
		attempts++;

		var transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');

		if (transcriptSegments.length > 0) {
			clearInterval(checkInterval);

			var transcriptText = '';

			transcriptSegments.forEach(function (segment) {
				var textElement = segment.querySelector('.segment-text');
				if (textElement) {
					transcriptText += textElement.textContent.trim() + ' ';
				}
			});

			transcriptText = transcriptText.trim();

			if (transcriptText) {
				navigator.clipboard.writeText(transcriptText);
				button.dataset.tooltip = 'Copied!';
				setTimeout(function () {
					button.dataset.tooltip = 'CopyTranscript';
					svg.style.opacity = '.5';
					// Close transcript panel
					var closeButton = document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="lose"]') ||
						document.querySelector('ytd-engagement-panel-title-header-renderer button[aria-label*="акрыть"]');
					if (closeButton) {
						closeButton.click();
					}
				}, 1000);
			} else {
				throw new Error('Transcript is empty');
			}
		} else if (attempts >= maxAttempts) {
			clearInterval(checkInterval);
			console.error('ImprovedTube: Timeout waiting for transcript');
			button.dataset.tooltip = 'TranscriptError';
			setTimeout(function () {
				button.dataset.tooltip = 'CopyTranscript';
				svg.style.opacity = '.5';
			}, 2000);
		}
	}, 250);
};

ImprovedTube.renderSubtitle = function (ctx, captionElements) {
	if (ctx && captionElements) {
		captionElements.forEach(function (captionElement, index) {
			var captionText = captionElement.textContent.trim();
			var captionStyles = window.getComputedStyle(captionElement);

			ctx.fillStyle = captionStyles.color;
			ctx.font = captionStyles.font;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'bottom';
			var txtWidth = ctx.measureText(captionText).width;
			var txtHeight = parseFloat(captionStyles.fontSize);

			var xOfset = (ctx.canvas.width - txtWidth) / 2;

			var padding = 5; // Adjust the padding as needed
			var yofset = ctx.canvas.height - (captionElements.length - index) * (txtHeight + 2 * padding);

			ctx.fillStyle = captionStyles.backgroundColor;
			ctx.fillRect(xOfset - padding, yofset - txtHeight - padding, txtWidth + 2 * padding, txtHeight + 2 * padding);
			ctx.fillStyle = captionStyles.color;
			ctx.fillText(captionText, xOfset + txtWidth / 2, yofset);
		});
	}
};

ImprovedTube.playerScreenshotButton = function () {
	if (this.storage.player_screenshot_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-screenshot-button',
			child: svg,
			opacity: 0.64,
			onclick: this.screenshot,
			title: 'Screenshot'
		});
	}
};

/*------------------------------------------------------------------------------
VIDEO FILTERS BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerVideoFiltersButton = function () {
	if (this.storage.player_video_filters_button !== false) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z');

		svg.appendChild(path);

		const isActive = this.storage.video_filters_activate !== false && 
			(this.storage.video_filters_preset !== 'normal' || 
			 (Number(this.storage.video_filter_brightness) !== 100 && this.isset(this.storage.video_filter_brightness)) ||
			 (Number(this.storage.video_filter_contrast) !== 100 && this.isset(this.storage.video_filter_contrast)) ||
			 (Number(this.storage.video_filter_saturation) !== 100 && this.isset(this.storage.video_filter_saturation)) ||
			 (Number(this.storage.video_filter_hue) !== 0 && this.isset(this.storage.video_filter_hue)) ||
			 (Number(this.storage.video_filter_sharpness) > 0 && this.isset(this.storage.video_filter_sharpness)) ||
			 (Number(this.storage.video_filter_gamma) !== 1 && this.isset(this.storage.video_filter_gamma)));

		this.createPlayerButton({
			id: 'it-video-filters-button',
			child: svg,
			opacity: isActive ? 1 : 0.55,
			onclick: function (e) {
				if (e.shiftKey) {
					const presets = ['normal', 'vivid', 'cinema', 'warm', 'cool'];
					let current = ImprovedTube.storage.video_filters_preset || 'normal';
					let nextIdx = (presets.indexOf(current) + 1) % presets.length;
					let nextPreset = presets[nextIdx];
					ImprovedTube.storage.video_filters_preset = nextPreset;
					ImprovedTube.storage.video_filters_activate = true;
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_preset', value: nextPreset });
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_activate', value: true });
					ImprovedTube.videoFilters();
					ImprovedTube.showStatus('Filter: ' + nextPreset.toUpperCase());
				} else {
					ImprovedTube.storage.video_filters_activate = ImprovedTube.storage.video_filters_activate === false ? true : false;
					ImprovedTube.messages.send({ action: 'set', key: 'video_filters_activate', value: ImprovedTube.storage.video_filters_activate });
					ImprovedTube.videoFilters();
					ImprovedTube.showStatus('Filters: ' + (ImprovedTube.storage.video_filters_activate ? 'ON' : 'OFF'));
				}
			},
			title: 'Video Filters (Click: Toggle, Shift+Click: Cycle Presets)'
		});
	}
};
/*------------------------------------------------------------------------------
REPEAT
-------------------------------------------------------------------------------*/
ImprovedTube.playerRepeat = function () {
	setTimeout(function () {
		if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
			ImprovedTube.elements.video.setAttribute('loop', '');
		}
	   //ImprovedTube.elements.buttons['it-repeat-styles'].style.opacity = '1';   //old class from version 3.x? that both repeat buttons could have
		 	}, 200);
}
/*------------------------------------------------------------------------------
REPEAT BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerRepeatButton = function () {
	if (this.storage.player_repeat_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z');
		svg.appendChild(path);
		var transparentOrOn = 0.5; if (this.storage.player_always_repeat === true ) { transparentOrOn = 1; }
		this.createPlayerButton({
			id: 'it-repeat-button',
			child: svg,
			opacity: transparentOrOn,
			onclick: function () {
				var video = ImprovedTube.elements.video;
				function matchLoopState (opacity) {
					var thisButton = document.querySelector('#it-repeat-button');
					thisButton.style.opacity = opacity;
					if (ImprovedTube.storage.below_player_loop !== false) {
						var otherButton = document.querySelector('#it-below-player-loop');
						otherButton.children[0].style.opacity = opacity;
					}
				}		if (video.hasAttribute('loop')) {
					video.removeAttribute('loop');
					matchLoopState('.5')
				} else if (!/ad-showing/.test(ImprovedTube.elements.player.className)) {
					video.setAttribute('loop', '');
					matchLoopState('1')
				}
			},
			title: 'Repeat',
		});
	}
};
/*------------------------------------------------------------------------------
ROTATE
------------------------------------------------------------------------------*/
ImprovedTube.playerRotateButton = function () {
	if (this.storage.player_rotate_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M15.55 5.55L11 1v3.07a8 8 0 0 0 0 15.86v-2.02a6 6 0 0 1 0-11.82V10l4.55-4.45zM19.93 11a7.9 7.9 0 0 0-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02zM13 17.9v2.02a7.92 7.92 0 0 0 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03zm3.89-2.42l1.42 1.41A7.9 7.9 0 0 0 19.93 13h-2.02a5.9 5.9 0 0 1-1.02 2.48z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-rotate-button',
			child: svg,
			opacity: 0.85,
			onclick: function (e) {
				var player = ImprovedTube.elements.player,
					video = ImprovedTube.elements.video,
					rotate = Number(document.body.dataset.itRotate) || 0,
					transform = '';
				if(!e.ctrlKey){
					rotate += 90;
				} else {
					rotate -= 90;
				}

				if (rotate === 360) {
					rotate = 0;
				} else if (rotate < 0){
					rotate = 270;
				}

				document.body.dataset.itRotate = rotate;

				transform += 'rotate(' + rotate + 'deg)';

				if (rotate == 90 || rotate == 270) {
					var is_vertical_video = video.videoHeight > video.videoWidth;
										if (
										//		( this.storage.player_cinema_mode_button === true ||  this.storage.player_auto_hide_cinema_mode_when_paused === true ||  this.storage.player_auto_cinema_mode === true 	)
											//  && document.querySelector('#overlay_cinema')
											document.querySelector("ytd-watch-flexy[theater]") && document.querySelector('ytd-app:not([player-fullscreen_]) ytd-watch-flexy:not([fullscreen])')
											) { transform += ' scale(' + (is_vertical_video ? video.clientWidth : video.clientHeight) / (is_vertical_video ? video.clientHeight : video.clientWidth) + ')';
													} else {
											transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
										}
				}

				if (!ImprovedTube.elements.buttons['it-rotate-styles']) {
					var style = document.createElement('style');

					ImprovedTube.elements.buttons['it-rotate-styles'] = style;

					document.body.appendChild(style);
				}

				ImprovedTube.elements.buttons['it-rotate-styles'].textContent = 'video{transform:' + transform + '}';
			},
			title: 'Rotate'
		});
	}
};

/*------------------------------------------------------------------------------
VOLUME BOOST BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerVolumeBoostButton = function () {
	if (this.storage.player_volume_boost_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');

		svg.appendChild(path);

		var button = this.createPlayerButton({
			id: 'it-volume-boost-button',
			child: svg,
			opacity: 0.5,
			onclick: function () {
				// ponytail: Web Audio API gain node. Ceiling: clipping at very high gain (>4x). Upgrade: add compressor node.
				var video = ImprovedTube.elements.video;
				if (!video) return;

				if (!ImprovedTube.volumeBoostContext) {
					var AudioContext = window.AudioContext || window.webkitAudioContext;
					ImprovedTube.volumeBoostContext = new AudioContext();
					ImprovedTube.volumeBoostSource = ImprovedTube.volumeBoostContext.createMediaElementSource(video);
					ImprovedTube.volumeBoostGain = ImprovedTube.volumeBoostContext.createGain();
					ImprovedTube.volumeBoostSource.connect(ImprovedTube.volumeBoostGain);
					ImprovedTube.volumeBoostGain.connect(ImprovedTube.volumeBoostContext.destination);
				}

				var gain = ImprovedTube.volumeBoostGain.gain;
				var current = gain.value;

				// Cycle: 1x → 2x → 3x → 1x
				var next = current >= 3 ? 1 : current + 1;
				gain.value = next;

				var btn = ImprovedTube.elements.buttons['it-volume-boost-button'];
				if (btn) {
					btn.style.opacity = next > 1 ? '1' : '0.5';
					btn.dataset.title = 'Volume Boost (' + next + 'x)';
				}
			},
			title: 'Volume Boost (1x)'
		});
	}
};

/*------------------------------------------------------------------------------
PLAYBACK SPEED BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerPlaybackSpeedButton = function () {
	if (this.storage.player_playback_speed_button === true) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z');

		svg.appendChild(path);

		var button = this.createPlayerButton({
			id: 'it-playback-speed-button',
			child: svg,
			opacity: 0.7,
			onclick: function (e) {
				// Left click: set to custom speed from settings
				if (e.button === 0) {
					var customSpeed = ImprovedTube.storage.player_playback_speed || 1.25;
					ImprovedTube.playbackSpeed(customSpeed);
					ImprovedTube.showStatus(customSpeed + 'x');
				}
			},
			title: 'Playback Speed (Scroll: adjust, Left: custom, Right: 1.0x)'
		});

		// Add right-click handler
		button.addEventListener('contextmenu', function (e) {
			e.preventDefault();
			e.stopPropagation();
			ImprovedTube.playbackSpeed(1.0);
			ImprovedTube.showStatus('1.0x');
		});

		// Add wheel handler
		button.addEventListener('wheel', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var step = Number(ImprovedTube.storage.shortcuts_playback_speed_step) || 0.1;
			var currentSpeed = ImprovedTube.playbackSpeed();
			var newSpeed;

			if (e.deltaY < 0) {
				// Scroll up: increase speed
				newSpeed = Math.min(currentSpeed + step, 16);
			} else {
				// Scroll down: decrease speed
				newSpeed = Math.max(currentSpeed - step, 0.0625);
			}

			ImprovedTube.playbackSpeed(newSpeed);
			ImprovedTube.showStatus(newSpeed.toFixed(2) + 'x');
		});
	}
};

ImprovedTube.playerPlaybackSpeedButtonB = function () {
  if (this.storage.player_playback_speed_button_b === true) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    svg.setAttribute("viewBox", "0 0 36 36");
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Simple speedometer icon
    path.setAttribute(
      "d",
      "M25.9,13.1A8.2,8.2,0,0,0,18,10a8.2,8.2,0,0,0-7.9,3.1L8,12.2V22h9.8l-1-2H10v-2h3.3l1.1-2.2a6.1,6.1,0,0,1,11.2,0L26.7,18H30v2H21.8l-1-2h4.1A8.2,8.2,0,0,0,25.9,13.1Z"
    );
    path.setAttribute("fill", "#fff");

    // Text element to show current speed
    text.setAttribute("x", "18");
    text.setAttribute("y", "23");
    text.setAttribute("font-size", "8px");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("class", "it-speed-text");
    text.textContent = (this.elements.video?.playbackRate || 1.0).toFixed(2);

    svg.appendChild(path);
    svg.appendChild(text);

    const button = this.createPlayerButton({
      id: "it-playback-speed-button",
      child: svg,
      opacity: 0.85,
      title: "Playback Speed Control",
    });

    const updateSpeedText = () => {
      const currentSpeed = (this.elements.video?.playbackRate || 1.0).toFixed(
        2
      );
      if (button) {
        const textElement = button.querySelector(".it-speed-text");
        if (textElement) textElement.textContent = currentSpeed;
      }
    };

    // --- Event Listeners ---
    button.onclick = () => {
      const customSpeed = this.storage.player_custom_playback_speed || 1.25;
      this.playbackSpeed(customSpeed);
    };

    button.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.playbackSpeed(1.0);
      return false;
    };

    button.onwheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentSpeed = this.playbackSpeed();
      const direction = e.deltaY < 0 ? 1 : -1;
      let newSpeed = Math.round((currentSpeed + direction * 0.05) * 100) / 100;

      if (newSpeed > 4) newSpeed = 4;
      if (newSpeed < 0.1) newSpeed = 0.1;

      this.playbackSpeed(newSpeed);
    };

    this.elements.video.addEventListener("ratechange", updateSpeedText);
    updateSpeedText(); // Set initial value
  }
};


/*------------------------------------------------------------------------------
FIT-TO-WIN BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerFitToWinButton = function () {
	if (this.storage.player_fit_to_win_button === true && (/watch\?/.test(location.href))) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		svg.setAttribute('width', '24');
		svg.setAttribute('height', '24');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('id', 'ftw-icon');
		path.setAttribute('d', 'M21 3 9 15 M12 3H3v18h18v-9 M16 3h5v5 M14 15H9v-5');
		svg.appendChild(path);
		this.createPlayerButton({
			id: 'it-fit-to-win-player-button',
			child: svg,
			opacity: 0.85,
			position: "right",
			onclick: ImprovedTube.toggleFitToWindow,
			title: 'Fit To Window'
		});
	}
};

ImprovedTube.toggleFitToWindow = function() {
	let previousSize = ImprovedTube.storage.player_size === "fit_to_window" ? "do_not_change" : (ImprovedTube.storage.player_size ?? "do_not_change");
	let isFTW = document.querySelector("html").getAttribute("it-player-size") === "fit_to_window"
	if (isFTW) {
		document.querySelector("html").setAttribute("it-player-size", previousSize);
	} else {
		document.querySelector("html").setAttribute("it-player-size", "fit_to_window");
	}
	window.dispatchEvent(new Event("resize"));
};

/*------------------------------------------------------------------------------
CINEMA MODE BUTTON
------------------------------------------------------------------------------*/
var xpath = function (xpathToExecute) {
	var result = [];
	var nodesSnapshot = document.evaluate(xpathToExecute, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	for ( var i=0; i < nodesSnapshot.snapshotLength; i++ ) {
	  result.push( nodesSnapshot.snapshotItem(i) );
	}
	return result;
}

function createOverlay () {
	var overlay = document.createElement('div');
	overlay.id = 'overlay_cinema';
	overlay.style.position = 'fixed';
	overlay.style.top = '0';
	overlay.style.left = '0';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
	overlay.style.zIndex = '9999';
	overlay.style.display = 'block';
	document.getElementById('full-bleed-container').appendChild(overlay);
}

ImprovedTube.playerCinemaModeButton = function () {
	if (this.storage.player_cinema_mode_button && (/watch\?/.test(location.href))) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		// TODO: change path such that cinema mode has its own unique icon
		path.setAttributeNS(null, 'd', 'm 2.1852 2.2 h 3.7188 h 5.2974 h 5.184 h 3.5478 c 0.6012 0 1.1484 0.2737 1.5444 0.7113 c 0.396 0.4396 0.6408 1.047 0.6408 1.7143 v 1.4246 v 11.4386 v 1.4166 c 0 0.6673 -0.2466 1.2747 -0.6408 1.7143 c -0.396 0.4396 -0.9432 0.7113 -1.5444 0.7113 h -3.456 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -5.0004 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -5.1138 c -0.0288 0.006 -0.0594 0.008 -0.0918 0.008 c -0.0306 0 -0.0612 -0.002 -0.0918 -0.008 h -3.627 c -0.6012 0 -1.1484 -0.2737 -1.5444 -0.7113 s -0.6408 -1.047 -0.6408 -1.7143 v -1.4166 v -11.4386 v -1.4246 c 0 -0.6673 0.2466 -1.2747 0.6408 -1.7143 c 0.396 -0.4376 0.9432 -0.7113 1.5444 -0.7113 l 0 0 z m 7.749 6.2418 l 3.6954 2.8611 c 0.0576 0.04 0.1098 0.0959 0.1512 0.1618 c 0.1656 0.2657 0.1044 0.6274 -0.1332 0.8112 l -3.681 2.8252 c -0.09 0.0819 -0.207 0.1319 -0.333 0.1319 c -0.2916 0 -0.5274 -0.2617 -0.5274 -0.5854 v -5.7283 h 0.0018 c 0 -0.1159 0.0306 -0.2318 0.0936 -0.3337 c 0.1674 -0.2637 0.495 -0.3277 0.7326 -0.1439 l 0 0 z m 6.9768 9.6324 v 2.0879 h 3.0204 c 0.3114 0 0.594 -0.1419 0.7992 -0.3696 c 0.2052 -0.2278 0.333 -0.5415 0.333 -0.8871 v -0.8312 h -4.1526 l 0 0 z m -1.053 2.0879 v -2.0879 h -4.1292 v 2.0879 h 4.1292 l 0 0 z m -5.1822 0 v -2.0879 h -4.2444 v 2.0879 h 4.2444 l 0 0 z m -5.2992 0 v -2.0879 h -4.3236 v 0.8312 c 0 0.3457 0.1278 0.6593 0.333 0.8871 c 0.2052 0.2278 0.4878 0.3696 0.7992 0.3696 h 3.1914 l 0 0 z m -4.3236 -3.2567 h 4.851 h 5.2974 h 5.184 h 4.68 v -10.2697 h -4.68 h -5.184 h -5.2974 h -4.851 v 10.2697 l 0 0 z m 14.805 -11.4386 v -2.0979 h -4.1292 v 2.0959 h 4.1292 l 0 0.002 z m 1.053 -2.0979 v 2.0959 h 4.1526 v -0.8392 c 0 -0.3457 -0.1278 -0.6593 -0.333 -0.8871 c -0.2052 -0.2278 -0.4878 -0.3696 -0.7992 -0.3696 h -3.0204 l 0 0 z m -6.2352 2.0979 v -2.0979 h -4.2444 v 2.0959 h 4.2444 l 0 0.002 z m -5.2992 0 v -2.0979 h -3.1914 c -0.3114 0 -0.594 0.1419 -0.7992 0.3696 c -0.2052 0.2278 -0.333 0.5415 -0.333 0.8871 v 0.8392 h 4.3236 l 0 0.002 z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-cinema-mode-button',
			child: svg,
			opacity: 0.64,
			onclick: function () {
				var playerContainer = document.getElementById('player-full-bleed-container');
				var playerContainerDefault =
					document.getElementById("player-container");
				var zIndex = 1;

				if (
					(playerContainer && playerContainer.style.zIndex == 10000) ||
					(playerContainerDefault &&
						playerContainerDefault.style.zIndex == 10000)
					) {
					zIndex = 1;
				} else {
					zIndex = 10000;
				}

				var ytdPlayer = document.getElementById('ytd-player');

				if (playerContainer) {
					playerContainer.style.zIndex = zIndex;
					playerContainer.style.position = zIndex === 10000 ? 'relative' : '';
				}
				if (playerContainerDefault) {
					playerContainerDefault.style.zIndex = zIndex;
					playerContainerDefault.style.position = zIndex === 10000 ? 'relative' : '';
				}
				if (ytdPlayer) {
					ytdPlayer.style.zIndex = zIndex;
					ytdPlayer.style.position = zIndex === 10000 ? 'relative' : '';
				}

				var overlay = document.getElementById('overlay_cinema');
				if (!overlay) {
					createOverlay();
				} else {
					overlay.style.display = overlay.style.display === 'none' || overlay.style.display === '' ? 'block' : 'none';
				}
			},
			title: 'Cinema Mode'
		});
	}
}

ImprovedTube.playerCinemaModeDisable = function () {
	if (this.storage.player_auto_hide_cinema_mode_when_paused) {
		var overlay = document.getElementById('overlay_cinema');
		if (overlay) {
			overlay.style.display = 'none'
			var playerContainer = document.getElementById('player-full-bleed-container');
			if (playerContainer) {
				playerContainer.style.zIndex = 1;
				playerContainer.style.position = '';
			}
			var playerContainerDefault = document.getElementById('player-container');
			if (playerContainerDefault) {
				playerContainerDefault.style.zIndex = 1;
				playerContainerDefault.style.position = '';
			}
			var ytdPlayer = document.getElementById('ytd-player');
			if (ytdPlayer) {
				ytdPlayer.style.zIndex = 1;
				ytdPlayer.style.position = '';
			}
			var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
			if (cinemaModeButton) cinemaModeButton.style.opacity = 0.64
		}
	}
}

ImprovedTube.playerCinemaModeEnable = function () {
	if (this.storage.player_auto_cinema_mode || this.storage.player_auto_hide_cinema_mode_when_paused) {

		if ((/watch\?/.test(location.href))) {
			var overlay = document.getElementById('overlay_cinema');

			if (this.storage.player_auto_cinema_mode === true && !overlay) {
				createOverlay();
				overlay = document.getElementById('overlay_cinema');
			}

			if (overlay) {
				overlay.style.display = 'block'
				var player = document.getElementById('player-full-bleed-container');
				if (player) {
					player.style.zIndex = 10000;
					player.style.position = 'relative';
				}
				var playerDefault = document.getElementById('player-container');
				if (playerDefault) {
					playerDefault.style.zIndex = 10000;
					playerDefault.style.position = 'relative';
				}
				var ytdPlayer = document.getElementById('ytd-player');
				if (ytdPlayer) {
					ytdPlayer.style.zIndex = 10000;
					ytdPlayer.style.position = 'relative';
				}

				var cinemaModeButton = xpath('//*[@id="it-cinema-mode-button"]')[0]
				if (cinemaModeButton) cinemaModeButton.style.opacity = 1
			}
		}
	}
}

/*------------------------------------------------------------------------------
HAMBURGER MENU
------------------------------------------------------------------------------*/
ImprovedTube.playerHamburgerButton = function () {
	if (this.storage.player_hamburger_button === true) {
		const videoPlayer = document.querySelector('.html5-video-player');

		if (!videoPlayer) {
			return;
		}

		const controlsContainer = videoPlayer.querySelector('.ytp-right-controls');

		if (!controlsContainer) {
			return;
		}

		let hamburgerMenu = document.querySelector('.custom-hamburger-menu');
		if (!hamburgerMenu) {
			hamburgerMenu = document.createElement('div');
			hamburgerMenu.className = 'custom-hamburger-menu';
			hamburgerMenu.style.position = 'absolute';
			hamburgerMenu.style.right = '0';
			hamburgerMenu.style.marginTop = '8px';
			hamburgerMenu.style.cursor = 'pointer';
			hamburgerMenu.style.zIndex = 9999;

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
			svg.setAttribute('style', 'width: 32px; height: 32px;');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttributeNS(null, 'd', 'M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z');
			path.setAttributeNS(null, 'fill', 'white');

			svg.appendChild(path);
			hamburgerMenu.appendChild(svg);

			controlsContainer.style.paddingRight = '40px';
			controlsContainer.parentNode.appendChild(hamburgerMenu);

			controlsContainer.style.display = 'none';
			hamburgerMenu.style.opacity = '0.65';

			hamburgerMenu.addEventListener('click', function () {
				const isHidden = controlsContainer.style.display === 'none';
				controlsContainer.style.display = isHidden ? 'flex' : 'none';
				hamburgerMenu.style.opacity = isHidden ? '0.85' : '0.65';
			});
		}
	}
};
/*------------------------------------------------------------------------------
POPUP PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.playerPopupButton = function () {
	if (this.storage.player_popup_button === true && location.href.indexOf('youtube.com/embed') === -1 ) {
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
		path.setAttributeNS(null, 'd', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');

		svg.appendChild(path);

		this.createPlayerButton({
			id: 'it-popup-player-button',
			child: svg,
			opacity: 0.8,
			onclick: function () {
				"use strict";
				const ytPlayer = ImprovedTube.elements.player;
				ytPlayer.pauseVideo();
				const videoID = location.search.match(ImprovedTube.regex.video_id)[1],
					listMatch = location.search.match(ImprovedTube.regex.playlist_id),
					popup = window.open(
						`${location.protocol}//www.youtube.com/embed/${videoID}?start=${parseInt(ytPlayer.getCurrentTime())}&autoplay=${ImprovedTube.storage.player_autoplay_disable ? '0' : '1'}${listMatch?`&list=${listMatch[1]}`:''}`,
						'_blank',
						`directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${ytPlayer.offsetWidth / 3},height=${ytPlayer.offsetHeight / 3}`
					);
				if (popup && listMatch) {
					//! If the video is not in the playlist or not within the first 200 entries, then it automatically selects the first video in the list.
					popup.addEventListener('load', function () {
						"use strict";
						//~ check if the video ID in the link of the video title matches the original video ID in the URL and if not remove the playlist from the URL (reloads the page).
						const videoLink = this.document.querySelector('div#player div.ytp-title-text>a[href]');
						if (videoLink && videoLink.href.match(ImprovedTube.regex.video_id)[1] !== videoID) this.location.search = this.location.search.replace(/(\?)list=[^&]+&|&list=[^&]+/, '$1');
					}, {passive: true, once: true});
				}
				//~ change focused tab to URL-less popup
				ImprovedTube.messages.send({
					action: 'fixPopup',
					width: ytPlayer.offsetWidth * 0.75,
					height: ytPlayer.offsetHeight * 0.75,
					title: document.title
				});
			},
			title: 'Popup'
		});
	}
};
/*------------------------------------------------------------------------------
Force SDR
------------------------------------------------------------------------------*/
ImprovedTube.playerSDR = function () {
	if (this.storage.player_SDR === true) {
		Object.defineProperty(window.screen, 'pixelDepth', {
			enumerable: true,
			configurable: true,
			value: 24
		});
	}
};
/*------------------------------------------------------------------------------
Hide controls
------------------------------------------------------------------------------*/
ImprovedTube.playerControls = function () {
	const player = this.elements.player,
		hide = this.storage.player_hide_controls;

	if (player && player.hideControls && player.showControls) {

		if (hide === 'when_paused' && this.elements.video.paused) {
			player.hideControls();

			player.onmouseenter = player.showControls;
			player.onmouseleave = player.hideControls;
			player.onmousemove = (function () {
				let thread,
					onmousestop = function () {
						if (document.querySelector(".ytp-progress-bar:hover")) {
							thread = setTimeout(onmousestop, 1000);
						} else {
							player.hideControls();
						}
					};

				return function () {
					player.showControls();
					clearTimeout(thread);
					thread = setTimeout(onmousestop, 1000);
				};
			})();
			return;
		} else if (hide === 'always') {
			player.hideControls();
		} else {
			player.showControls();
		}
		player.onmouseenter = null;
		player.onmouseleave = null;
		player.onmousemove = null;
	}
};
/*#  HIDE VIDEO TITLE IN FULLSCREEN	*/ // Easier with CSS only (see player.css)
//ImprovedTube.hideVideoTitleFullScreen = function (){ if (ImprovedTube.storage.hide_video_title_fullScreen === true) {
//document.addEventListener('fullscreenchange', function (){ document.querySelector(".ytp-title-text > a")?.style.setProperty('display', 'none');   }) }};

/*------------------------------------------------------------------------------
CUSTOM MINI-PLAYER
------------------------------------------------------------------------------*/
ImprovedTube.mini_player__setSize = function (width, height, keep_ar, keep_area) {
	if (keep_ar) {
		const aspect_ratio = ImprovedTube.elements.video.style.width.replace('px', '') / ImprovedTube.elements.video.style.height.replace('px', '');
		if (keep_area) {
			height = Math.sqrt((width * height) / aspect_ratio);
			width = height * aspect_ratio;
		} else {
			height = width / aspect_ratio;
		}
	}

	ImprovedTube.elements.player.style.width = width + 'px';
	ImprovedTube.elements.player.style.height = height + 'px';
};

ImprovedTube.miniPlayer_scroll = function () {
	if (window.scrollY >= 256 && ImprovedTube.mini_player__mode === false && ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === false) {
		ImprovedTube.mini_player__mode = true;

		ImprovedTube.mini_player__original_width = ImprovedTube.elements.player.offsetWidth;
		ImprovedTube.mini_player__original_height = ImprovedTube.elements.player.offsetHeight;

		ImprovedTube.elements.player.classList.add('it-mini-player');

		ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
		ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + ImprovedTube.mini_player__y + 'px)';

		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height, true, true);

		// Re-apply disableAutoDubbing when entering mini player mode
		// (YouTube may reset audio track when switching to mini player)
		if (ImprovedTube.storage.disable_auto_dubbing === true) {
			ImprovedTube.disableAutoDubbing();
		}

		window.addEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
		window.addEventListener('resize', ImprovedTube.miniPlayer_scroll);
	} else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
		ImprovedTube.mini_player__mode = false;
		ImprovedTube.elements.player.classList.remove('it-mini-player');
		ImprovedTube.mini_player__move = false;
		ImprovedTube.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
		ImprovedTube.elements.player.style.width = '';
		ImprovedTube.elements.player.style.height = '';

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.dispatchEvent(new Event('resize'));

		// Re-apply disableAutoDubbing when exiting mini player mode
		// (YouTube may reset audio track when switching back to normal player)
		if (ImprovedTube.storage.disable_auto_dubbing === true) {
			ImprovedTube.disableAutoDubbing();
		}

		window.removeEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
		window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
		window.removeEventListener('click', ImprovedTube.miniPlayer_click);
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
	}
};

ImprovedTube.miniPlayer_mouseDown = function (event) {
	if (event.button !== 0) {
		return false;
	}

	if (ImprovedTube.miniPlayer_resize() === true) {
		return false;
	}

	var is_player = false,
		path = event.composedPath();

	for (var i = 0, l = path.length; i < l; i++) {
		if ((path[i].classList && path[i].classList.contains('it-mini-player')) === true) {
			is_player = true;
		}
	}

	if (is_player === false) {
		return false;
	}

	event.preventDefault();

	var bcr = ImprovedTube.elements.player.getBoundingClientRect();

	ImprovedTube.miniPlayer_mouseDown_x = event.clientX;
	ImprovedTube.miniPlayer_mouseDown_y = event.clientY;
	ImprovedTube.mini_player__width = bcr.width;
	ImprovedTube.mini_player__height = bcr.height;

	ImprovedTube.mini_player__player_offset_x = event.clientX - bcr.x;
	ImprovedTube.mini_player__player_offset_y = event.clientY - bcr.y;

	ImprovedTube.mini_player__max_x = document.body.offsetWidth - ImprovedTube.mini_player__width;
	ImprovedTube.mini_player__max_y = window.innerHeight - ImprovedTube.mini_player__height;

	window.addEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
	window.addEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);
};

ImprovedTube.miniPlayer_mouseUp = function () {
	var strg = JSON.parse(localStorage.getItem('improvedtube-mini-player')) || {};

	strg.x = ImprovedTube.mini_player__x;
	strg.y = ImprovedTube.mini_player__y;

	localStorage.setItem('improvedtube-mini-player', JSON.stringify(strg));

	window.removeEventListener('mouseup', ImprovedTube.miniPlayer_mouseUp);
	window.removeEventListener('mousemove', ImprovedTube.miniPlayer_mouseMove);

	ImprovedTube.mini_player__move = false;

	setTimeout(function () {
		window.removeEventListener('click', ImprovedTube.miniPlayer_click, true);
	});
};

ImprovedTube.miniPlayer_click = function (event) {
	event.stopPropagation();
	event.preventDefault();
};

ImprovedTube.miniPlayer_mouseMove = function (event) {
	if (
		event.clientX < ImprovedTube.miniPlayer_mouseDown_x - 5 ||
		event.clientY < ImprovedTube.miniPlayer_mouseDown_y - 5 ||
		event.clientX > ImprovedTube.miniPlayer_mouseDown_x + 5 ||
		event.clientY > ImprovedTube.miniPlayer_mouseDown_y + 5
	) {
		var x = event.clientX - ImprovedTube.mini_player__player_offset_x,
			y = event.clientY - ImprovedTube.mini_player__player_offset_y;

		if (ImprovedTube.mini_player__move === false) {
			ImprovedTube.mini_player__move = true;

			window.addEventListener('click', ImprovedTube.miniPlayer_click, true);
		}

		if (x < 0) {
			x = 0;
		}

		if (y < 0) {
			y = 0;
		}

		if (x > ImprovedTube.mini_player__max_x) {
			x = ImprovedTube.mini_player__max_x;
		}

		if (y > ImprovedTube.mini_player__max_y) {
			y = ImprovedTube.mini_player__max_y;
		}

		ImprovedTube.mini_player__x = x;
		ImprovedTube.mini_player__y = y;

		ImprovedTube.elements.player.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
	}
};

ImprovedTube.miniPlayer_cursorUpdate = function (event) {
	var x = event.clientX,
		y = event.clientY,
		c = ImprovedTube.mini_player__cursor;

	if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'ne-resize';
	} else if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'se-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'sw-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'nw-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.miniPlayer_resize_offset
	) {
		c = 'n-resize';
	} else if (
		x >= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - ImprovedTube.miniPlayer_resize_offset &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'e-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.mini_player__width &&
		y >= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - ImprovedTube.miniPlayer_resize_offset &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 's-resize';
	} else if (
		x >= ImprovedTube.mini_player__x &&
		x <= ImprovedTube.mini_player__x + ImprovedTube.miniPlayer_resize_offset &&
		y >= ImprovedTube.mini_player__y &&
		y <= ImprovedTube.mini_player__y + ImprovedTube.mini_player__height
	) {
		c = 'w-resize';
	} else {
		c = '';
	}

	if (ImprovedTube.mini_player__cursor !== c) {
		ImprovedTube.mini_player__cursor = c;

		document.documentElement.setAttribute('it-mini-player-cursor', ImprovedTube.mini_player__cursor);
	}
};

ImprovedTube.miniPlayer_resize = function () {
	if (ImprovedTube.mini_player__cursor !== '') {
		window.removeEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
		window.addEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);

		return true;
	}
};

ImprovedTube.miniPlayer_resizeMouseMove = function (event) {
	if (ImprovedTube.mini_player__cursor === 'n-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY);
	} else if (ImprovedTube.mini_player__cursor === 'e-resize') {
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__height);
	} else if (ImprovedTube.mini_player__cursor === 's-resize') {
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, event.clientY - ImprovedTube.mini_player__y);
	} else if (ImprovedTube.mini_player__cursor === 'w-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__height);
	} else if (ImprovedTube.mini_player__cursor === 'ne-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY, true);
	} else if (ImprovedTube.mini_player__cursor === 'se-resize') {
		ImprovedTube.mini_player__setSize(event.clientX - ImprovedTube.mini_player__x, event.clientY - ImprovedTube.mini_player__y, true);
	} else if (ImprovedTube.mini_player__cursor === 'sw-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + ImprovedTube.mini_player__y + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, event.clientY - ImprovedTube.mini_player__y, true);
	} else if (ImprovedTube.mini_player__cursor === 'nw-resize') {
		ImprovedTube.elements.player.style.transform = 'translate(' + event.clientX + 'px, ' + event.clientY + 'px)';
		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__x + ImprovedTube.mini_player__width - event.clientX, ImprovedTube.mini_player__y + ImprovedTube.mini_player__height - event.clientY, true);
	}
};

ImprovedTube.miniPlayer_resizeMouseUp = function () {
	var bcr = ImprovedTube.elements.player.getBoundingClientRect();

	ImprovedTube.mini_player__x = bcr.left;
	ImprovedTube.mini_player__y = bcr.top;
	ImprovedTube.mini_player__width = bcr.width;
	ImprovedTube.mini_player__height = bcr.height;

	window.dispatchEvent(new Event('resize'));

	var strg = JSON.parse(localStorage.getItem('improvedtube-mini-player')) || {};

	strg.width = ImprovedTube.mini_player__width;
	strg.height = ImprovedTube.mini_player__height;

	localStorage.setItem('improvedtube-mini-player', JSON.stringify(strg));

	window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
	window.removeEventListener('mouseup', ImprovedTube.miniPlayer_resizeMouseUp);
	window.removeEventListener('mousemove', ImprovedTube.miniPlayer_resizeMouseMove);
};

ImprovedTube.miniPlayer = function () {
	if (this.storage.mini_player === true) {
		var data = localStorage.getItem('improvedtube-mini-player');

		try {
			if (this.isset(data)) {
				data = JSON.parse(data);
			} else {
				data = {};
			}
		} catch (error) {
			data = {};
		}

		data.x = data.x || 300;
		data.y = data.y || 35;
		data.width = data.width || 300;
		data.height = data.height || 225;

		this.mini_player__x = data.x;
		this.mini_player__y = data.y;
		this.mini_player__width = data.width;
		this.mini_player__height = data.height;

		window.removeEventListener('scroll', this.miniPlayer_scroll);
		window.addEventListener('scroll', this.miniPlayer_scroll);
	} else {
		this.mini_player__mode = false;
		this.elements.player.classList.remove('it-mini-player');
		this.mini_player__move = false;

		this.elements.player.style.width = '';
		this.elements.player.style.height = '';
		this.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';

		this.elements.player.classList.remove('it-mini-player');

		this.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.dispatchEvent(new Event('resize'));

		window.removeEventListener('mousedown', this.miniPlayer_mouseDown);
		window.removeEventListener('mousemove', this.miniPlayer_mouseMove);
		window.removeEventListener('mouseup', this.miniPlayer_mouseUp);
		window.removeEventListener('click', this.miniPlayer_click);
		window.removeEventListener('scroll', this.miniPlayer_scroll);
		window.removeEventListener('mousemove', this.miniPlayer_cursorUpdate);
	}
};

/*------------------------------------------------------------------------------
CUSTOM PAUSE FUNCTIONS
------------------------------------------------------------------------------*/
ImprovedTube.pauseWhileTypingOnYoutube = function () {
	if (ImprovedTube.storage.pause_while_typing_on_youtube === true) {
		var timeoutId; // Declare a variable to hold the timeout ID

		// Add event listener to the whole document
		document.addEventListener('keydown', function (e) {
		// Check on the storage for pause_while_typing_on_youtube_storage is false

			// If player is NOT in the viewport, return
			if (!isPlayerInViewport()) {
				return;
			}

			var player = ImprovedTube.elements.player;

			if (player) {
				if (
					(/^[a-z0-9]$/i.test(e.key) || e.key === "Backspace") &&
				!(e.ctrlKey && (e.key === "c" || e.key === "x" || e.key === "a")) &&
				( document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "DIV"
				 ||	((document.activeElement && ImprovedTube.input.ignoreElements.includes(document.activeElement.tagName)) || event.target.isContentEditable)
				)) {
				// Pause the video
				// Check if player is paused
					if (!player.paused) {
						player.pauseVideo();
					}

					// Clear any existing timeout
					if (timeoutId) {
						clearTimeout(timeoutId);
					}

					// Set a new timeout to play the video after 1 second
					timeoutId = setTimeout(function () {
						player.playVideo();
					}, 2000); // 2000 milliseconds = 2 seconds
				}
			}
		});

		function isPlayerInViewport () {
			var player = ImprovedTube.elements.player;
			if (player) {
				var rect = player.getBoundingClientRect();
				var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
				var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

				// Check if the player is in the viewport
				return (
					rect.top != 0 &&
				rect.left != 0 &&
				rect.bottom <= windowHeight &&
				rect.right <= windowWidth
				);
			}
			return false;
		}

	}
};

/*------------------------------------------------------------------------------
HIDE PROGRESS BAR PREVIEW
------------------------------------------------------------------------------*/
ImprovedTube.playerHideProgressPreview = function () {
	if (this.storage.player_hide_progress_preview === true) {
		document.documentElement.setAttribute('it-hide-progress-preview', 'true');
	} else {
		document.documentElement.removeAttribute('it-hide-progress-preview');
	}
};


/*------------------------------------------------------------------------------
Rewind and Forward Buttons
------------------------------------------------------------------------------*/
ImprovedTube.playerRewindAndForwardButtons = function(){
	if(this.storage.player_rewind_and_forward_buttons===true){
	 const svgNamespace = "http://www.w3.org/2000/svg";
	 const svgBackward = document.createElementNS(svgNamespace, "svg");
	 const path1 = document.createElementNS(svgNamespace, "path");
	 const path2 = document.createElementNS(svgNamespace, "path");
	 svgBackward.setAttribute("t", "1742599438764");
	 svgBackward.setAttribute("class", "icon");
	 svgBackward.setAttribute("viewBox", "0 0 1024 1024");
	 svgBackward.setAttribute("version", "1.1");
	 svgBackward.setAttribute("xmlns", svgNamespace);
	 svgBackward.setAttribute("p-id", "1636");
	 svgBackward.setAttribute("width", "50%");
	 svgBackward.setAttribute("height", "50%");
	 svgBackward.style.display = "block";
	 svgBackward.style.margin = "0 auto";
	 path1.setAttribute("d", "M508.50205 146.714035c221.770057 0.399766 401.364825 180.194417 401.364825 402.064415 0 222.069881-179.994534 402.064415-402.064416 402.064416-222.069881 0-402.064415-179.994534-402.064415-402.064416-0.099941-80.852625 24.185829-159.806363 69.759126-226.467304 11.393324-16.690221 7.095842-39.376928-9.594379-50.770252-16.690221-11.393324-39.376928-7.095842-50.770251 9.594378-53.468671 78.254148-82.55163 170.899863-82.55163 267.74312 0 262.446223 212.675386 475.121608 475.121608 475.121608 262.446223 0 475.121608-212.675386 475.121608-475.121608 0-262.146399-212.375561-474.821784-474.521959-475.121609V22.386883c0-8.095257-4.497365-15.490923-11.593207-19.288698-7.095842-3.797775-15.790748-3.398009-22.486825 1.099356L316.514542 109.335936c-6.096428 4.097599-9.794261 10.893617-9.794261 18.289284 0 7.295725 3.697833 14.191685 9.794261 18.289283l157.807535 105.238337c6.696077 4.497365 15.390982 4.897131 22.486824 1.099356 7.095842-3.797775 11.593207-11.293383 11.593207-19.288698v-86.249463h0.099942zM497.008784 700.989264");
	 path1.setAttribute("fill", "#ffffff");
	 path2.setAttribute("d", "M638.026157 359.889127v59.964865H439.442514l-11.693148 114.133125h1.699004c12.792504-12.792504 27.383955-22.087058 44.274058-27.983603 15.091158-5.796604 31.981261-8.694905 50.670311-8.694906 38.977162 0 71.058364 12.792504 95.444075 38.477455 24.485653 25.585009 37.278157 61.164162 37.278158 105.937927 0 43.074761-16.290455 78.054265-48.871365 105.338278-30.282256 24.485653-65.761468 36.678509-107.137224 36.678509-37.877806 0-70.458716-10.493851-97.243022-30.881905-30.282256-22.686707-46.572711-53.568612-49.471013-91.946126h66.960765c2.898302 22.686707 11.693149 39.57681 26.784306 50.670311 12.792504 9.294554 30.881905 14.59145 53.568613 14.59145 24.485653 0 45.373414-7.595549 62.263517-22.686707 16.290455-15.091158 25.085302-35.479211 25.085302-61.164162 0-27.983603-7.595549-50.070662-21.587351-65.761467-13.991802-16.290455-34.979504-23.886004-61.763811-23.886005-18.089401 0-33.780207 2.898302-46.572711 9.294554-14.59145 6.995901-25.585009 17.489752-33.780207 31.981261h-63.462815l22.686707-234.062854h253.451494z");
	 path2.setAttribute("fill", "#ffffff");
	 svgBackward.appendChild(path1);
	 svgBackward.appendChild(path2);
	 const svgForward = document.createElementNS(svgNamespace, "svg");
	 const path3 = document.createElementNS(svgNamespace, "path");
	 const path4 = document.createElementNS(svgNamespace, "path");
	 svgForward.setAttribute("t", "1742599438764");
	 svgForward.setAttribute("class", "icon");
	 svgForward.setAttribute("viewBox", "0 0 1024 1024");
	 svgForward.setAttribute("version", "1.1");
	 svgForward.setAttribute("xmlns", svgNamespace);
	 svgForward.setAttribute("p-id", "1636");
	 svgForward.setAttribute("width", "50%");
	 svgForward.setAttribute("height", "50%");
	 svgForward.style.display = "block";
	 svgForward.style.margin = "0 auto";
	 path3.setAttribute("d", "M507.101913 146.742679V232.90902c0 8.096837 4.498243 15.493948 11.595471 19.292464 7.097228 3.798516 15.793831 3.398672 22.491214-1.099571l157.838345-105.258883c6.097618-4.098399 9.796173-10.895744 9.796173-18.292854 0-7.29715-3.698555-14.194455-9.796173-18.292855L541.288559 4.19836c-6.697384-4.498243-15.393987-4.898087-22.491214-1.09957-7.097228 3.798516-11.595471 11.195627-11.595471 19.292463v51.180008C245.004295 73.971105 32.587271 286.588052 32.587271 548.785631c0 262.497462 212.716907 475.214369 475.214369 475.214369 262.497462 0 475.214369-212.716907 475.214369-475.214369 0-96.862163-29.088637-189.426005-82.567747-267.795393-11.395549-16.693479-34.186646-20.9918-50.780164-9.596251-16.693479 11.395549-20.9918 34.186646-9.596251 50.780164 45.582194 66.673955 69.972667 145.743069 69.772745 226.511519 0 222.113237-180.029676 402.142913-402.142913 402.142913-222.113237 0-402.142913-180.029676-402.142913-402.142913 0.099961-221.713393 179.829754-401.643108 401.543147-401.942991z m11.595471 554.383444");
	 path3.setAttribute("fill", "#ffffff");
	 path4.setAttribute("d", "M638.050761 359.959391v59.976572H439.428348l-11.695431 114.155408h1.699336c12.795002-12.795002 27.389301-22.091371 44.282702-27.989067 15.094104-5.797735 31.987505-8.696603 50.680203-8.696603 38.984772 0 71.072237 12.795002 95.46271 38.484967 24.490433 25.590004 37.285435 61.176103 37.285435 105.95861 0 43.083171-16.293635 78.069504-48.880905 105.358844-30.288169 24.490433-65.774307 36.68567-107.158142 36.685669-37.885201 0-70.472472-10.4959-97.262007-30.887934-30.288169-22.691136-46.581804-53.579071-49.480671-91.964076h66.973838c2.898868 22.691136 11.695431 39.584537 26.789535 50.680203 12.795002 9.296369 30.887934 14.594299 53.579071 14.594299 24.490433 0 45.382273-7.597032 62.275673-22.691137 16.293635-15.094104 25.090199-35.486138 25.0902-61.176103 0-27.989067-7.597032-50.080437-21.591566-65.774307-13.994533-16.293635-34.986333-23.890668-61.775869-23.890667-18.092932 0-33.786802 2.898868-46.581804 9.296368-14.594299 6.997267-25.590004 17.493167-33.786802 31.987505h-63.475205l22.691136-234.108551h253.500976z");
	 path4.setAttribute("fill", "#ffffff");
	 svgForward.appendChild(path3);
	 svgForward.appendChild(path4);


	 this.createPlayerButton({
	  id: 'it-forward-player-button',
	  opacity: 0.85,
	  position: "right",
	  child: svgForward,

	  onclick: function () {
	   ImprovedTube.elements.player.seekTo(ImprovedTube.elements.player.getCurrentTime() + 5);
	  },
	  title: 'forward 5 seconds',
	 }).classList.remove('it-player-button');
	 this.createPlayerButton({
	  id: 'it-rewind-player-button',
	  opacity: 0.85,
	  position: "right",
	  child: svgBackward,

	  onclick: function () {
	   ImprovedTube.elements.player.seekTo(ImprovedTube.elements.player.getCurrentTime() - 5);
	  },
	  title: 'rewind 5 seconds',
	 }).classList.remove('it-player-button');
	}
   }

/*------------------------------------------------------------------------------
Increase and Decrease Playback Speed Buttons
------------------------------------------------------------------------------*/
ImprovedTube.playerIncreaseDecreaseSpeedButtons = function () {
    if (this.storage.player_increase_decrease_speed_buttons === true) {
        const svgNamespace = "http://www.w3.org/2000/svg";

        const svgDecrease = document.createElementNS(svgNamespace, "svg");
        const path1 = document.createElementNS(svgNamespace, "path");
        svgDecrease.setAttribute("class", "icon");
        svgDecrease.setAttribute("viewBox", "0 0 1024 1024");
        svgDecrease.setAttribute("version", "1.1");
        svgDecrease.setAttribute("xmlns", svgNamespace);
        svgDecrease.setAttribute("width", "90%");
        svgDecrease.setAttribute("height", "90%");
        svgDecrease.style.display = "block";
        svgDecrease.style.margin = "0 auto";
        path1.setAttribute("d", `M188.5,270.3c-24.4,28.1-23.2,71.7,2.6,98.6c14.4,15.1,33.7,22.6,52.9,22.6c18.8,0,37.5-7.2,51.8-21.5
                c6.5-6.5,11.6-14,15.1-21.9l0,0l94.5-183.2c2.5-5.2-2.9-10.6-8.1-8.1l-183.2,94.5l0,0C204.6,255.5,195.9,261.9,188.5,270.3z
                M221.9,296.1c6.1-6.1,14.1-9.2,22.1-9.2s16,3.1,22.2,9.2c12.2,12.2,12.2,32.1,0,44.3c-6.1,6.1-14.1,9.2-22.2,9.2
                c-8,0-16-3.1-22.1-9.2C209.6,328.1,209.6,308.3,221.9,296.1z M440.2,341.4c0-34.6-9.1-68.6-26.4-98.3c-6.7-11.6-2.8-26.4,8.8-33.1
                c11.6-6.7,26.4-2.8,33.1,8.8c21.5,37.1,32.9,79.5,32.9,122.6c0,13.4-10.8,24.2-24.2,24.2C451.1,365.6,440.2,354.8,440.2,341.4z
                M0,341.4C0,206.7,109.6,97.1,244.3,97.1c31.3,0,61.8,5.8,90.6,17.4c12.4,5,18.4,19,13.5,31.4c-5,12.4-19,18.4-31.4,13.5
                c-23.1-9.2-47.6-13.9-72.7-13.9c-108,0-195.9,87.9-195.9,195.9c0,13.4-10.8,24.2-24.2,24.2C10.8,365.6,0,354.8,0,341.4z`);
        path1.setAttribute("fill", "#ffffff");

        path1.setAttribute("transform", "translate(520, 0)");

        svgDecrease.appendChild(path1);

        const svg1x = document.createElementNS(svgNamespace, "svg");
        svg1x.setAttribute("t", "1742599438764");
        svg1x.setAttribute("class", "icon");

        svg1x.setAttribute("viewBox", "0 0 1024 1024");
        svg1x.setAttribute("version", "1.1");
        svg1x.setAttribute("xmlns", svgNamespace);
        svg1x.setAttribute("p-id", "1636");

        const text1 = document.createElementNS(svgNamespace, "text");
        text1.setAttribute("x", "512");
        text1.setAttribute("y", "512");

        text1.setAttribute("fill", "#ffffff");
        text1.setAttribute("font-size", "550");

        text1.setAttribute("font-weight", "bold");
        text1.setAttribute("font-family", "Arial, sans-serif");
        text1.setAttribute("text-anchor", "middle");
        text1.setAttribute("dominant-baseline", "central");
        text1.textContent = "1x";
        svg1x.appendChild(text1);

        const svgIncrease = document.createElementNS(svgNamespace, "svg");
        const path2 = document.createElementNS(svgNamespace, "path");
        svgIncrease.setAttribute("class", "icon");
        svgIncrease.setAttribute("viewBox", "0 0 1024 1024");
        svgIncrease.setAttribute("version", "1.1");
        svgIncrease.setAttribute("xmlns", svgNamespace);
        svgIncrease.setAttribute("width", "90%");
        svgIncrease.setAttribute("height", "90%");
        svgIncrease.style.display = "block";
        svgIncrease.style.margin = "0 auto";

        svgDecrease.style.transform = "scaleX(-1)";

        path2.setAttribute("d", `M188.5,270.3c-24.4,28.1-23.2,71.7,2.6,98.6c14.4,15.1,33.7,22.6,52.9,22.6c18.8,0,37.5-7.2,51.8-21.5
                c6.5-6.5,11.6-14,15.1-21.9l0,0l94.5-183.2c2.5-5.2-2.9-10.6-8.1-8.1l-183.2,94.5l0,0C204.6,255.5,195.9,261.9,188.5,270.3z
                M221.9,296.1c6.1-6.1,14.1-9.2,22.1-9.2s16,3.1,22.2,9.2c12.2,12.2,12.2,32.1,0,44.3c-6.1,6.1-14.1,9.2-22.2,9.2
                c-8,0-16-3.1-22.1-9.2C209.6,328.1,209.6,308.3,221.9,296.1z M440.2,341.4c0-34.6-9.1-68.6-26.4-98.3c-6.7-11.6-2.8-26.4,8.8-33.1
                c11.6-6.7,26.4-2.8,33.1,8.8c21.5,37.1,32.9,79.5,32.9,122.6c0,13.4-10.8,24.2-24.2,24.2C451.1,365.6,440.2,354.8,440.2,341.4z
                M0,341.4C0,206.7,109.6,97.1,244.3,97.1c31.3,0,61.8,5.8,90.6,17.4c12.4,5,18.4,19,13.5,31.4c-5,12.4-19,18.4-31.4,13.5
                c-23.1-9.2-47.6-13.9-72.7-13.9c-108,0-195.9,87.9-195.9,195.9c0,13.4-10.8,24.2-24.2,24.2C10.8,365.6,0,354.8,0,341.4z`);
        path2.setAttribute("fill", "#ffffff");

        svgIncrease.appendChild(path2);
        path2.setAttribute("transform", "translate(-20, 0)");

        this.createPlayerButton({
            id: 'it-increase-speed-button',
            opacity: 0.85,
            position: "right",
            child: svgIncrease,
            onclick: function () {
                const step = ImprovedTube.storage.player_custom_playback_speed_step || 0.25;
                const currentSpeed = ImprovedTube.playbackSpeed();
                let newSpeed = Math.min(currentSpeed + step, 16);
                const appliedSpeed = ImprovedTube.playbackSpeed(newSpeed);
                ImprovedTube.showStatus(appliedSpeed + 'x');
            },
            title: `increase speed by ${ImprovedTube.storage.player_custom_playback_speed_step || 0.25}x`,
        }).classList.remove('it-player-button');

        this.createPlayerButton({
            id: 'it-1x-speed-button',
            opacity: 0.85,
            position: "right",
            child: svg1x,
            onclick: function () {
                ImprovedTube.playbackSpeed(1);
                ImprovedTube.showStatus('1x');
            },
            title: 'set speed to 1x',
        }).classList.remove('it-player-button');

        this.createPlayerButton({
            id: 'it-decrease-speed-button',
            opacity: 0.85,
            position: "right",
            child: svgDecrease,
            onclick: function () {
				const step = ImprovedTube.storage.player_custom_playback_speed_step || 0.25;
                const currentSpeed = ImprovedTube.playbackSpeed();
                let newSpeed = Math.max(currentSpeed - step, step);
                const appliedSpeed = ImprovedTube.playbackSpeed(newSpeed);
                ImprovedTube.showStatus(appliedSpeed + 'x');
            },
            title: `decrease speed by ${ImprovedTube.storage.player_custom_playback_speed_step || 0.25}x`,
        }).classList.remove('it-player-button');
    }
}

/*------------------------------------------------------------------------------
# DISABLE AUTO DUBBING
------------------------------------------------------------------------------*/
ImprovedTube.getAudioTrackInfo = function (track) {
	return track?.getLanguageInfo?.() || {};
};

ImprovedTube.normalizeAudioTrackText = function (value) {
	return String(value || '').trim().toLocaleLowerCase();
};

ImprovedTube.audioTrackIsAutoDubbed = function (track) {
	const info = this.getAudioTrackInfo(track);
	const metadata = [track, info, track?.audioTrack, track?.audioTrackData, info?.audioTrack];
	const autoFlags = [
		'isAutoDubbed',
		'isAutoDubbing',
		'isAutomaticallyDubbed',
		'autoDubbed',
		'autoDubbing',
		'isAutoGenerated',
		'isMachineGenerated',
		'isSynthetic'
	];

	for (const source of metadata) {
		if (!source || typeof source !== 'object') continue;
		if (autoFlags.some(flag => source[flag] === true)) return true;
	}

	const descriptor = metadata.flatMap(function (source) {
		if (!source || typeof source !== 'object') return [];
		return [source.id, source.name, source.languageCode, source.languageName, source.kind];
	}).join(' ').toLocaleLowerCase();

	if (/auto[\s_-]*dub|automatic[\s_-]*dub|machine[\s_-]*dub|synthetic[\s_-]*dub|generated[\s_-]*dub/.test(descriptor)) {
		return true;
	}

	const autoLabels = this.autoDubbedTrackLabels;
	const name = this.normalizeAudioTrackText(info.name || track?.languageName);
	if (autoLabels && autoLabels.url === location.href && name) {
		const labelMatchesTrack = label => label === name || label.startsWith(name + ' ') || label.includes(name + ' auto');
		const appearsInAutoSection = Array.from(autoLabels.values).some(labelMatchesTrack);
		const appearsInManualSection = Array.from(autoLabels.manualValues || []).some(labelMatchesTrack);

		// A human dub and an automatic dub can have exactly the same visible
		// language label. Menu text alone cannot identify which track object is
		// automatic in that case, so preserve the human track unless the metadata
		// checks above provided unambiguous auto-dub evidence.
		return appearsInAutoSection && !appearsInManualSection;
	}

	return false;
};

ImprovedTube.audioTrackMatchesLanguage = function (track, language) {
	const selected = this.normalizeAudioTrackText(language);
	if (!selected) return false;

	const info = this.getAudioTrackInfo(track);
	const codes = [info.id, info.languageCode, track?.id, track?.languageCode]
		.map(this.normalizeAudioTrackText)
		.filter(Boolean);
	const names = [info.name, info.languageName, track?.name, track?.languageName]
		.map(this.normalizeAudioTrackText)
		.filter(Boolean);

	return codes.some(code => code === selected || code.startsWith(selected + '.') || code.startsWith(selected + '-') || code.startsWith(selected + '_')) ||
		names.some(name => name === selected || name.includes(selected));
};

ImprovedTube.findOriginalAudioTrack = function (audioTracks) {
	if (!audioTracks?.length) return null;

	const originalWords = ['original', 'originale', 'originalny', 'originalaudio', 'origineel', 'orijinal', 'оригинал', 'оригинальная'];
	const isNamedOriginal = track => {
		const name = this.normalizeAudioTrackText(this.getAudioTrackInfo(track).name);
		return originalWords.some(word => name.includes(word));
	};
	const hasAsrCaption = track => Array.isArray(track?.captionTracks) && track.captionTracks.some(caption => caption.kind === 'asr');
	const isDefault = track => this.getAudioTrackInfo(track).isDefault === true || track?.isDefault === true;

	return audioTracks.find(track => track?.isOriginal === true || this.getAudioTrackInfo(track).isOriginal === true) ||
		audioTracks.find(isNamedOriginal) || audioTracks.find(hasAsrCaption) || audioTracks.find(isDefault) || audioTracks[0];
};

ImprovedTube.getPreferredAudioLanguage = function () {
	const selected = this.storage.player_default_dubbed_language;
	if (selected && selected !== 'disabled') return selected;

	return this.storage.preferred_dubbing_language || '';
};

ImprovedTube.audioTracksAreEqual = function (firstTrack, secondTrack) {
	if (firstTrack === secondTrack) return true;

	const firstInfo = this.getAudioTrackInfo(firstTrack);
	const secondInfo = this.getAudioTrackInfo(secondTrack);
	const firstId = firstInfo.id || firstTrack?.id;
	const secondId = secondInfo.id || secondTrack?.id;

	return Boolean(firstId && secondId && firstId === secondId);
};

ImprovedTube.selectPermittedAudioTrack = function (player, preferredLanguage) {
	const tracks = player?.getAvailableAudioTracks?.();
	if (!tracks?.length) return null;

	const blockAutoDubbing = this.storage.disable_auto_dubbing === true;
	const permittedTracks = blockAutoDubbing ? tracks.filter(track => !this.audioTrackIsAutoDubbed(track)) : tracks;
	const requestedLanguage = preferredLanguage || this.getPreferredAudioLanguage();
	let targetTrack = requestedLanguage ? permittedTracks.find(track => this.audioTrackMatchesLanguage(track, requestedLanguage)) : null;

	if (!targetTrack && blockAutoDubbing) {
		targetTrack = this.findOriginalAudioTrack(permittedTracks) || this.findOriginalAudioTrack(tracks);
	}

	const currentTrack = player.getAudioTrack?.();
	if (targetTrack && !this.audioTracksAreEqual(currentTrack, targetTrack)) {
		player.setAudioTrack(targetTrack);
	}
	return targetTrack || null;
};

ImprovedTube.disableAutoDubbing = function () {
	// These lifecycle helpers belong only to this feature. Define them lazily so
	// they do not exist when auto-dubbing protection has never been enabled.
	ImprovedTube.stopAutoDubbingGuard = function () {
		const guard = this.autoDubbingGuard;
		if (!guard) return;

		clearInterval(guard.interval);
		guard.video?.removeEventListener('loadedmetadata', guard.forceSelection);
		guard.video?.removeEventListener('playing', guard.enforce);
		this.autoDubbingGuard = null;
	};

	ImprovedTube.enforceAutoDubbingPolicy = function () {
		const player = this.elements.player;
		if (!player?.getAvailableAudioTracks) return;

		if (this.autoDubbingGuard?.player !== player) this.stopAutoDubbingGuard();

		if (!this.autoDubbingGuard) {
			const video = player.querySelector?.('video');
			const canReadCurrentTrack = typeof player.getAudioTrack === 'function';
			const guard = {
				player,
				video,
				enforce: function () {
					// The storage listener normally stops the guard synchronously. Keep
					// this check for a callback that was already queued before disabling.
					if (ImprovedTube.storage.disable_auto_dubbing !== true || !canReadCurrentTrack) return;

					const currentTrack = player.getAudioTrack();
					if (currentTrack && ImprovedTube.audioTrackIsAutoDubbed(currentTrack)) {
						ImprovedTube.selectPermittedAudioTrack(player);
					}
				},
				forceSelection: function () {
					setTimeout(function () {
						if (ImprovedTube.storage.disable_auto_dubbing === true) {
							ImprovedTube.selectPermittedAudioTrack(player);
						}
					}, 0);
				}
			};

			guard.interval = canReadCurrentTrack ? setInterval(guard.enforce, 1000) : null;
			video?.addEventListener('loadedmetadata', guard.forceSelection);
			video?.addEventListener('playing', guard.enforce);
			this.autoDubbingGuard = guard;
		}

		this.autoDubbingGuard.enforce();
	};

	this.selectPermittedAudioTrack(this.elements.player);
	this.enforceAutoDubbingPolicy();
};

/*------------------------------------------------------------------------------
# HIDE AUTO-DUBBED MENU ITEMS
------------------------------------------------------------------------------*/
ImprovedTube.observeAutoDubbedMenu = function () {
	const state = ImprovedTube.autoDubbedMenuObserver;
	if (ImprovedTube.storage.hide_auto_dubbed_options !== true) {
		state?.disconnect();
		ImprovedTube.autoDubbedMenuObserver = null;
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.hideAutoDubbedMenuItems();
		return;
	}

	if (state) {
		ImprovedTube.hideAutoDubbedMenuItems();
		return;
	}

	const playerContainer = document.querySelector('#movie_player');
	if (!playerContainer) return;

	ImprovedTube.autoDubbedMenuObserver = new MutationObserver(function (records) {
		// YouTube reuses submenu nodes. A panel marked as leaving becomes eligible
		// again only when YouTube explicitly attaches it in a later mutation batch;
		// moving the same subtree within one update is still part of the old panel.
		const removedNodes = new Set();
		records?.forEach(function (record) {
			Array.from(record.removedNodes || []).forEach(node => removedNodes.add(node));
		});
		records?.forEach(function (record) {
			Array.from(record.addedNodes || []).forEach(function (node) {
				if (node?.nodeType !== 1 || removedNodes.has(node)) return;

				if (node.matches?.('.ytp-panel-menu')) delete node.itAutoDubbedMenuLeaving;
				node.querySelectorAll?.('.ytp-panel-menu').forEach(function (panel) {
					delete panel.itAutoDubbedMenuLeaving;
				});
			});
		});

		// Layout probes are mounted under the player briefly. They are not a
		// YouTube menu update and must not schedule another probe recursively.
		const relevantUpdate = records?.some(function (record) {
			if (record.type === 'attributes') {
				const target = record.target;
				return target?.dataset?.itAutoDubbedHidden === 'true' ||
					target?.classList?.contains('ytp-panel') ||
					target?.classList?.contains('ytp-panel-menu') ||
					target?.classList?.contains('ytp-settings-menu');
			}

			const nodes = Array.from(record.addedNodes || []).concat(Array.from(record.removedNodes || []));
			return nodes.length === 0 || !nodes.every(ImprovedTube.isAutoDubbedMenuLayoutProbe);
		});
		if (!relevantUpdate) return;

		ImprovedTube.hideAutoDubbedMenuItems();
	});
	ImprovedTube.autoDubbedMenuObserver.observe(playerContainer, {
		attributeFilter: ['class', 'style'],
		attributes: true,
		childList: true,
		subtree: true
	});
	ImprovedTube.hideAutoDubbedMenuItems();
};

ImprovedTube.isAutoDubbedMenuHeader = function (item) {
	const label = this.normalizeAudioTrackText(item?.textContent);
	return /auto[\s-]*dub|automatic[\s-]*dubb|automatically[\s-]*dub|авто(?:матическ(?:ое|ая|ий)?\s*)?(?:дубляж|дублирован)|дублировани[ея]\s+автоматически|dublagem\s+automática|doblaje\s+automático|synchronisation\s+automatique|automatische\s+(?:synchronisation|vertonung)/.test(label);
};

ImprovedTube.rememberAutoDubbedMenuItems = function (items) {
	if (!this.autoDubbedTrackLabels || this.autoDubbedTrackLabels.url !== location.href) {
		this.autoDubbedTrackLabels = {url: location.href, values: new Set(), manualValues: new Set()};
	}

	let inAutoDubbedSection = false;
	items.forEach(item => {
		if (item.classList.contains('ytp-menuitem-section-header')) {
			inAutoDubbedSection = this.isAutoDubbedMenuHeader(item);
		} else {
			const label = this.normalizeAudioTrackText(item.textContent);
			if (!label) return;

			if (inAutoDubbedSection) {
				this.autoDubbedTrackLabels.values.add(label);
			} else {
				this.autoDubbedTrackLabels.manualValues.add(label);
			}
		}
	});
};

ImprovedTube.isAutoDubbedMenuLayoutProbe = function (node) {
	return node?.nodeType === 1 && (
		node.dataset?.itAutoDubbedMenuLayoutProbe === 'true' ||
		node.closest?.('[data-it-auto-dubbed-menu-layout-probe="true"]')
	);
};

ImprovedTube.releaseAutoDubbedMenuLayout = function (panel) {
	if (!panel) return;

	// YouTube adds the outgoing animation class about 20 ms after Back. Mark the
	// audio panel immediately so observer callbacks in that gap cannot make it
	// reclaim the popup and constrain the root panel's native measurement.
	panel.itAutoDubbedMenuLeaving = true;
	ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
	ImprovedTube.restoreAutoDubbedMenuLayout(panel, {force: true});
	if (ImprovedTube.autoDubbedMenuPanel === panel) ImprovedTube.autoDubbedMenuPanel = null;
};

ImprovedTube.restoreAutoDubbedMenuBeforeBack = function (event) {
	const backControl = event.target?.closest?.('.ytp-panel-back-button, .ytp-panel-title');
	const panel = ImprovedTube.autoDubbedMenuPanel;
	const menuPanel = panel?.closest?.('.ytp-panel');
	if (!backControl || !menuPanel || backControl.closest?.('.ytp-panel') !== menuPanel) return;

	// Run in the capture phase so YouTube measures the root menu only after the
	// compact audio-menu constraints have been removed.
	ImprovedTube.releaseAutoDubbedMenuLayout(panel);
};

ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus = function (event) {
	const focusedPanel = event.target?.closest?.('.ytp-panel');
	if (!focusedPanel) return;

	// The same audio panel object can be detached and reused on a later opening.
	// Focus is moved to it before YouTube measures it, so it is safe to release
	// the marker here even in variants that reparent rather than re-create nodes.
	const focusedMenu = focusedPanel.querySelector?.('.ytp-panel-menu');
	if (focusedMenu?.itAutoDubbedMenuLeaving === true) delete focusedMenu.itAutoDubbedMenuLeaving;

	const panel = ImprovedTube.autoDubbedMenuPanel;
	if (panel && panel.closest?.('.ytp-panel') !== focusedPanel) {
		ImprovedTube.releaseAutoDubbedMenuLayout(panel);
	}
};

ImprovedTube.restoreAutoDubbedMenuLayout = function (panel, options) {
	if (!panel) return;

	const force = options?.force === true;
	const menuPanel = panel.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');
	// YouTube detaches the old submenu at the end of its slide transition. Keep
	// the elements captured while it was connected, because closest() can no
	// longer reach the shared settings popup by the time the observer restores it.
	const elements = new Set(panel.itAutoDubbedMenuLayoutElements || []);
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(element => elements.add(element));
	elements.forEach(function (element) {
		const saved = element.dataset.itAutoDubbedMenuLayout;
		if (!saved) return;

		try {
			const styles = JSON.parse(saved);
			const applied = JSON.parse(element.dataset.itAutoDubbedMenuAppliedLayout || 'null');
			for (const property in styles) {
				const value = styles[property];
				const appliedValue = applied?.[property];
				// Late observer cleanup preserves dimensions YouTube has already set
				// for the root menu; capture cleanup runs before those values exist.
				if (!force && appliedValue && (
					element.style.getPropertyValue(property) !== appliedValue.value ||
					element.style.getPropertyPriority(property) !== appliedValue.priority
				)) continue;

				if (value.value) {
					element.style.setProperty(property, value.value, value.priority);
				} else {
					element.style.removeProperty(property);
				}
			}
		} catch (_) {
			for (const property of [
				'width', 'min-width', 'max-width',
				'height', 'min-height', 'max-height',
				'overflow', 'overflow-x', 'overflow-y'
			]) {
				element.style.removeProperty(property);
			}
		}

		delete element.dataset.itAutoDubbedMenuLayout;
		delete element.dataset.itAutoDubbedMenuAppliedLayout;
	});

	delete panel.itAutoDubbedMenuLayoutElements;
};

ImprovedTube.restoreAutoDubbedMenuLayoutProperties = function (element, properties) {
	const saved = element?.dataset?.itAutoDubbedMenuLayout;
	if (!saved) return;

	try {
		const styles = JSON.parse(saved);
		properties.forEach(function (property) {
			const value = styles[property];
			if (!value) return;

			const currentValue = element.style.getPropertyValue(property);
			const currentPriority = element.style.getPropertyPriority(property);
			if (currentValue === value.value && currentPriority === value.priority) return;

			if (value.value) {
				element.style.setProperty(property, value.value, value.priority);
			} else {
				element.style.removeProperty(property);
			}
		});
	} catch (_) { }
};

ImprovedTube.saveAutoDubbedMenuLayout = function (element) {
	if (!element || element.dataset.itAutoDubbedMenuLayout) return;

	const savedStyles = {};
	for (const property of [
		'width', 'min-width', 'max-width',
		'height', 'min-height', 'max-height',
		'overflow', 'overflow-x', 'overflow-y'
	]) {
		savedStyles[property] = {
			value: element.style.getPropertyValue(property),
			priority: element.style.getPropertyPriority(property)
		};
	}

	element.dataset.itAutoDubbedMenuLayout = JSON.stringify(savedStyles);
};

ImprovedTube.saveAutoDubbedMenuAppliedLayout = function (element) {
	if (!element) return;

	const appliedStyles = {};
	for (const property of [
		'width', 'min-width', 'max-width',
		'height', 'min-height', 'max-height',
		'overflow', 'overflow-x', 'overflow-y'
	]) {
		appliedStyles[property] = {
			value: element.style.getPropertyValue(property),
			priority: element.style.getPropertyPriority(property)
		};
	}

	element.dataset.itAutoDubbedMenuAppliedLayout = JSON.stringify(appliedStyles);
};

ImprovedTube.measureFilteredAudioMenuLayout = function (panel) {
	const player = panel?.closest?.('.html5-video-player, #movie_player');
	const menuPanel = panel?.closest?.('.ytp-panel');
	const popup = menuPanel?.closest?.('.ytp-popup') || menuPanel;
	if (!player || !popup?.cloneNode || !player.appendChild) return null;

	// A settings popup can contain more than one panel while YouTube animates
	// between menus. Mark the live audio panel so its exact clone can be found.
	panel.dataset.itAutoDubbedMenuSource = 'true';
	let probe;
	try {
		probe = popup.cloneNode(true);
	} catch (_) {
		return null;
	} finally {
		delete panel.dataset.itAutoDubbedMenuSource;
	}

	const probeMenu = probe.querySelector?.('[data-it-auto-dubbed-menu-source="true"]') ||
		(probe.matches?.('.ytp-panel-menu') ? probe : probe.querySelector?.('.ytp-panel-menu'));
	const probePanel = probeMenu?.closest?.('.ytp-panel') ||
		(probe.matches?.('.ytp-panel') ? probe : probe.querySelector?.('.ytp-panel'));
	if (!probePanel || !probeMenu) return null;
	if (probeMenu.dataset) delete probeMenu.dataset.itAutoDubbedMenuSource;

	probe.dataset.itAutoDubbedMenuLayoutProbe = 'true';
	probe.querySelectorAll?.('[data-it-auto-dubbed-hidden="true"]').forEach(function (item) {
		item.remove?.() || item.parentNode?.removeChild(item);
	});

	// This is a real copy of YouTube's panel, in the same player and with only
	// the hidden section removed. Its natural size is therefore the size YouTube
	// would calculate after the menu is closed and opened again.
	[probe, probePanel, probeMenu].forEach(function (element) {
		for (const property of [
			'width', 'min-width', 'max-width',
			'height', 'min-height', 'max-height',
			'left', 'right'
		]) {
			element.style.removeProperty(property);
		}
	});

	probe.style.setProperty('display', 'block', 'important');
	probe.style.setProperty('visibility', 'hidden', 'important');
	probe.style.setProperty('pointer-events', 'none', 'important');
	probe.style.setProperty('position', 'absolute', 'important');
	probe.style.setProperty('left', '-10000px', 'important');
	probe.style.setProperty('right', 'auto', 'important');
	probe.style.setProperty('bottom', 'auto', 'important');
	probe.style.setProperty('top', '0', 'important');
	probe.style.setProperty('transform', 'none', 'important');
	probe.style.setProperty('transition', 'none', 'important');
	probePanel.style.setProperty('display', 'block', 'important');
	probePanel.style.setProperty('transform', 'none', 'important');
	probePanel.style.setProperty('transition', 'none', 'important');
	probeMenu.style.setProperty('display', 'block', 'important');
	probeMenu.style.setProperty('transform', 'none', 'important');
	probeMenu.style.setProperty('transition', 'none', 'important');

	try {
		player.appendChild(probe);
		const probeRect = probe.getBoundingClientRect?.() || {};
		const panelRect = probePanel.getBoundingClientRect?.() || {};
		const width = probeRect.width || probe.offsetWidth || panelRect.width || probePanel.offsetWidth;
		const height = probeRect.height || probe.offsetHeight || probe.scrollHeight ||
			panelRect.height || probePanel.offsetHeight || probePanel.scrollHeight ||
			probeMenu.offsetHeight || probeMenu.scrollHeight;
		// .ytp-panel, not .ytp-panel-menu, is YouTube's actual overflow-y
		// container. Detect whether the remaining native panel really needs it.
		const menuClientHeight = probePanel.clientHeight || probePanel.offsetHeight || 0;
		const menuScrollHeight = probePanel.scrollHeight || menuClientHeight;

		return {
			height: Number.isFinite(height) && height > 0 ? Math.ceil(height) : 0,
			scrollable: menuClientHeight > 0 && menuScrollHeight > menuClientHeight + 1,
			width: Number.isFinite(width) && width > 0 ? Math.ceil(width) : 0
		};
	} catch (_) {
		return null;
	} finally {
		probe.remove?.() || probe.parentNode?.removeChild(probe);
	}
};

ImprovedTube.applyFilteredAudioMenuLayout = function (panel) {
	const menuPanel = panel?.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');
	// Clear YouTube's old offset while .ytp-panel is still scrollable. Once
	// overflow becomes `clip`, scrollTop can no longer be changed reliably.
	this.resetFilteredAudioMenuScroll(panel);
	const layout = this.measureFilteredAudioMenuLayout(panel);
	if (!menuPanel || !layout || (!layout.width && !layout.height)) return;

	const layoutElements = new Set(panel.itAutoDubbedMenuLayoutElements || []);
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(element => layoutElements.add(element));
	panel.itAutoDubbedMenuLayoutElements = Array.from(layoutElements);
	menuPanel.addEventListener?.('click', ImprovedTube.restoreAutoDubbedMenuBeforeBack, true);
	settingsMenu?.addEventListener?.('focusin', ImprovedTube.restoreAutoDubbedMenuBeforePanelFocus, true);

	// The inner table can retain the height and overflow of the unfiltered audio
	// list even after its rows are hidden. That stale box is what leaves the
	// first opening blank/scrolled; let the filtered rows define it naturally.
	ImprovedTube.saveAutoDubbedMenuLayout(panel);
	for (const [property, value] of [
		['height', 'auto'],
		['min-height', '0px'],
		['max-height', 'none'],
		['overflow', 'visible'],
		['overflow-x', 'visible'],
		['overflow-y', 'visible']
	]) {
		if (panel.style.getPropertyValue(property) !== value || panel.style.getPropertyPriority(property) !== 'important') {
			panel.style.setProperty(property, value, 'important');
		}
	}

	// YouTube writes the calculated dimensions to both elements. Updating only
	// .ytp-panel leaves the visible .ytp-settings-menu at its pre-filter size.
	[menuPanel, settingsMenu].filter(Boolean).forEach(function (element) {
		ImprovedTube.saveAutoDubbedMenuLayout(element);

		for (const property of ['width', 'min-width', 'max-width']) {
			const value = layout.width ? layout.width + 'px' : '';
			if (value && (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important')) {
				element.style.setProperty(property, value, 'important');
			}
		}
		for (const property of ['height', 'min-height', 'max-height']) {
			const value = layout.height ? layout.height + 'px' : '';
			if (value && (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== 'important')) {
				element.style.setProperty(property, value, 'important');
			}
		}
	});

	// Disable scrolling on the actual .ytp-panel when all remaining manual
	// tracks fit. `clip` prevents both a scrollbar and YouTube's later
	// scrollIntoView() from restoring the offset of the hidden auto-dub track.
	if (layout.scrollable) {
		ImprovedTube.restoreAutoDubbedMenuLayoutProperties(menuPanel, ['overflow', 'overflow-x', 'overflow-y']);
	} else {
		for (const property of ['overflow', 'overflow-x', 'overflow-y']) {
			if (menuPanel.style.getPropertyValue(property) !== 'clip' || menuPanel.style.getPropertyPriority(property) !== 'important') {
				menuPanel.style.setProperty(property, 'clip', 'important');
			}
		}
	}

	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(ImprovedTube.saveAutoDubbedMenuAppliedLayout);
};

ImprovedTube.cancelAutoDubbedMenuLayoutRefresh = function () {
	const job = this.autoDubbedMenuLayoutJob;
	if (!job) return;

	const cancelFrame = window.cancelAnimationFrame?.bind(window) || clearTimeout;
	if (job.frame) cancelFrame(job.frame);
	job.timers.forEach(clearTimeout);
	this.autoDubbedMenuLayoutJob = null;
};

ImprovedTube.resetFilteredAudioMenuScroll = function (panel) {
	const menuPanel = panel?.closest?.('.ytp-panel');
	const settingsMenu = menuPanel?.closest?.('.ytp-settings-menu');

	// On the first opening YouTube scrolls to the selected auto-dubbed item
	// before that section is hidden. The shortened menu then keeps this obsolete
	// scroll offset and appears blank until it is closed and opened again.
	[panel, menuPanel, settingsMenu].filter(Boolean).forEach(function (element) {
		if (typeof element.scrollTop === 'number' && element.scrollTop !== 0) {
			element.scrollTop = 0;
		}
	});
};

ImprovedTube.refreshAutoDubbedMenuLayout = function (panel) {
	if (!panel) return;

	const scheduleFrame = window.requestAnimationFrame?.bind(window) || function (callback) {
		return setTimeout(callback, 0);
	};
	const recalculate = function () {
		if (ImprovedTube.autoDubbedMenuPanel !== panel ||
			ImprovedTube.storage.hide_auto_dubbed_options !== true || panel.isConnected === false ||
			!panel.querySelector?.('[data-it-auto-dubbed-hidden="true"]') ||
			ImprovedTube.getAutoDubbedAudioMenuPanel() !== panel) {
			ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
			ImprovedTube.restoreAutoDubbedMenuLayout(panel);
			if (ImprovedTube.autoDubbedMenuPanel === panel) ImprovedTube.autoDubbedMenuPanel = null;
			return;
		}

		// YouTube measures the first audio panel before our filter runs and can
		// rewrite its inline dimensions during the opening transition. Re-measure
		// a filtered clone and keep both live containers at that native size.
		ImprovedTube.resetFilteredAudioMenuScroll(panel);
		ImprovedTube.applyFilteredAudioMenuLayout(panel);
		void panel.offsetWidth;
	};

	this.cancelAutoDubbedMenuLayoutRefresh();
	const job = {frame: null, timers: []};
	this.autoDubbedMenuLayoutJob = job;
	job.frame = scheduleFrame(recalculate);
	job.timers = [0, 50, 150, 350, 750].map(function (delay) {
		return setTimeout(recalculate, delay);
	});
};

ImprovedTube.getAutoDubbedAudioMenuPanel = function () {
	const panels = document.querySelectorAll?.('.ytp-settings-menu .ytp-panel-menu') || [];
	let activePanel = null;
	let activeIntersection = 0;
	let activeIntersectionRatio = 0;

	// Rank every settings panel before checking its contents. During Back,
	// YouTube can keep the old audio panel in the DOM after the root panel is
	// already visible; that stale panel must not reclaim the shared popup.
	for (const panel of panels) {
		if (panel.itAutoDubbedMenuLeaving === true) continue;

		const layoutPanel = panel.closest?.('.ytp-panel') || panel;
		// These classes make an outgoing panel transparent and translate it away.
		// It must release the shared popup immediately, before YouTube detaches it.
		if (layoutPanel.classList?.contains('ytp-panel-animate-back') ||
			layoutPanel.classList?.contains('ytp-panel-animate-forward')) continue;

		const settingsMenu = layoutPanel.closest?.('.ytp-settings-menu') || panel.closest?.('.ytp-settings-menu');
		const rect = layoutPanel.getBoundingClientRect?.();
		const menuRect = settingsMenu?.getBoundingClientRect?.();
		if (!rect || !menuRect || rect.width <= 0 || rect.height <= 0 || menuRect.width <= 0 || menuRect.height <= 0) continue;

		// YouTube keeps both submenu panels rendered during and after its slide
		// transition. offsetParent therefore also matches the old, translated panel.
		// Only the panel occupying the visible settings popup may own its layout.
		const intersectionWidth = Math.max(0, Math.min(rect.right, menuRect.right) - Math.max(rect.left, menuRect.left));
		const intersectionHeight = Math.max(0, Math.min(rect.bottom, menuRect.bottom) - Math.max(rect.top, menuRect.top));
		const intersection = intersectionWidth * intersectionHeight;
		const intersectionRatio = intersection / (rect.width * rect.height);
		if (intersectionRatio > activeIntersectionRatio ||
			(intersectionRatio === activeIntersectionRatio && intersection > activeIntersection)) {
			activeIntersection = intersection;
			activeIntersectionRatio = intersectionRatio;
			activePanel = panel;
		}
	}

	if (!activePanel) return null;

	const items = activePanel.querySelectorAll('.ytp-menuitem');
	const containsAutoDubbedSection = Array.from(items).some(function (item) {
		return item.classList.contains('ytp-menuitem-section-header') && ImprovedTube.isAutoDubbedMenuHeader(item);
	});

	return containsAutoDubbedSection ? activePanel : null;
};

ImprovedTube.hideAutoDubbedMenuItems = function () {
	const previousPanel = ImprovedTube.autoDubbedMenuPanel;
	const panel = ImprovedTube.getAutoDubbedAudioMenuPanel();
	if (!panel) {
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.restoreAutoDubbedMenuLayout(previousPanel);
		ImprovedTube.autoDubbedMenuPanel = null;
		return;
	}
	if (previousPanel && previousPanel !== panel) ImprovedTube.restoreAutoDubbedMenuLayout(previousPanel);
	ImprovedTube.autoDubbedMenuPanel = panel;

	const shouldHide = ImprovedTube.storage.hide_auto_dubbed_options === true;
	const items = panel.querySelectorAll('.ytp-menuitem');
	ImprovedTube.rememberAutoDubbedMenuItems(items);

	let inAutoDubbedSection = false;
	let hiddenItemCount = 0;
	items.forEach(function (item) {
		if (item.classList.contains('ytp-menuitem-section-header')) {
			inAutoDubbedSection = ImprovedTube.isAutoDubbedMenuHeader(item);
		}

		if (shouldHide && inAutoDubbedSection) {
			item.dataset.itAutoDubbedHidden = 'true';
			if (item.style.getPropertyValue('display') !== 'none' || item.style.getPropertyPriority('display') !== 'important') {
				item.style.setProperty('display', 'none', 'important');
			}
			hiddenItemCount++;
		} else if (item.dataset.itAutoDubbedHidden === 'true') {
			delete item.dataset.itAutoDubbedHidden;
			item.style.removeProperty('display');
		}
	});

	if (shouldHide && hiddenItemCount > 0) {
		// Do the complete filtered layout synchronously. MutationObserver callbacks
		// run before paint, so the oversized/scrolled intermediate state is never
		// presented to the user.
		ImprovedTube.resetFilteredAudioMenuScroll(panel);
		ImprovedTube.applyFilteredAudioMenuLayout(panel);
		ImprovedTube.refreshAutoDubbedMenuLayout(panel);
	} else {
		ImprovedTube.cancelAutoDubbedMenuLayoutRefresh();
		ImprovedTube.restoreAutoDubbedMenuLayout(panel);
		ImprovedTube.autoDubbedMenuPanel = null;
	}
};

/*------------------------------------------------------------------------------
# AUTO-SELECT PREFERRED DUBBING LANGUAGE
------------------------------------------------------------------------------*/
/**
 * Automatically selects the audio track whose language code matches the user's
 * preferred dubbing language (storage.preferred_dubbing_language).
 * Falls back silently if no matching track is found.
 */
ImprovedTube.preferredDubbingLanguage = function () {
	const preferred = (ImprovedTube.storage.preferred_dubbing_language || '').trim().toLowerCase();
	if (!preferred) return;

	this.selectPermittedAudioTrack(this.elements.player, preferred);
	if (this.storage.disable_auto_dubbing === true) this.enforceAutoDubbingPolicy?.();
};
/*------------------------------------------------------------------------------
# SELECT DEFAULT DUBBED LANGUAGE
------------------------------------------------------------------------------*/
ImprovedTube.selectDubbedLanguage = function () {
	const self = this;
	const selectedLang = this.storage.player_default_dubbed_language;
	if (!selectedLang || selectedLang === 'disabled') return;

	var tries = 0;
	var maxTries = 10;
	var interval = setInterval(function () {
		tries++;
		const player = self.elements.player;
		if (!player || !player.getAvailableAudioTracks) {
			if (tries >= maxTries) clearInterval(interval);
			return;
		}

		const tracks = player.getAvailableAudioTracks();
		if (!tracks || !tracks.length) {
			if (tries >= maxTries) clearInterval(interval);
			return;
		}

		const targetTrack = self.selectPermittedAudioTrack(player, selectedLang);
		if (targetTrack || tries >= maxTries) {
			clearInterval(interval);
		}
	}, 300);
};
/*------------------------------------------------------------------------------
# JUMP TO THE NEXT KEY SCENE
------------------------------------------------------------------------------*/
ImprovedTube.jumpToKeyScene = function () {
	ImprovedTube.mostReplayed = function () {
	const player = document.querySelector('video');

	const data = extractYtInitialData();
	if (!data)
		return console.warn("Failed to extract ytInitialData.");

	const markers = getMostReplayedMarkers(data);
	if (!markers.length)
		return console.warn("No 'Most Replayed' markers found.");

	const currentMillis = player.currentTime * 1000;
	const sortedMarkers = markers.slice().sort((a, b) => a.decorationTimeMillis - b.decorationTimeMillis);
	const nextMarker = sortedMarkers.find(m => m.decorationTimeMillis > currentMillis) || sortedMarkers[0]; // fallback to first if none ahead
	const targetSeconds = nextMarker.decorationTimeMillis / 1000;

	player.currentTime = targetSeconds;
	player.play();
	console.log(`Jumped to Most Replayed @ ${Math.floor(targetSeconds / 60)}:${Math.floor(targetSeconds % 60).toString().padStart(2, "0")}`);

	function extractYtInitialData() {
		const scriptTags = document.querySelectorAll('script');

		for (let i = 0; i < scriptTags.length; i++) {
			if (DATA.ytInitialData) { var ytIData = DATA.ytInitialData; }
			else {
			const scriptContent = scriptTags[i].textContent;
			var ytIData = scriptContent.match(/var ytInitialData = ({.*?});/s);
			}

			if (ytIData) {
				try {
					return JSON.parse(ytIData[1]);
				} catch (e) {
					console.warn("Failed to parse ytInitialData JSON", e);
					return null;
				}
			}
		}

		return null;
	}

	function getMostReplayedMarkers(parsedJson) {
		const decorations = parsedJson?.['frameworkUpdates']?.['entityBatchUpdate']?.['mutations']?.[0]
			?.['payload']?.['macroMarkersListEntity']?.['markersList']?.['markersDecoration']?.['timedMarkerDecorations'];
		return decorations;
	}
	}

		DATA = {};
			ImprovedTube.fetchDOMData2 = function () {
				try { DATA = JSON.parse(document.querySelector('#microformat script')?.textContent) ?? false; DATA.title = DATA.name;}
			 catch { DATA.genre = false; DATA.keywords = false; DATA.lengthSeconds = false;
					try {
						DATA.title = document.getElementsByTagName('meta')?.title?.content || false;
						DATA.genre = document.querySelector('meta[itemprop=genre]')?.content || false;
						DATA.duration = document.querySelector('meta[itemprop=duration]')?.content || false;
			 } catch {}}

let tries = 0; const maxTries = 3; let intervalMs = 25;
const waitForVideoTitle = setInterval(() => { const title = ImprovedTube.videoTitle?.();  tries++;
if (title && title !== 'YouTube') {
    clearInterval(waitForVideoTitle);
			 DATA.videoID = ImprovedTube.videoId() || false;
			 console.log("MOST REPLAYED: TITLE:" + ImprovedTube.videoTitle() + DATA.title);
			 if ( (DATA.title === ImprovedTube.videoTitle() || DATA.title.replace(/\s{2,}/g, ' ') === ImprovedTube.videoTitle())
				   && ((history && history.length === 1) || !history?.state?.endpoint?.watchEndpoint))
				   { ImprovedTube.mostReplayed(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);
					console.log("loading the html source:" + `https://www.youtube.com/watch?v=${DATA.videoID}`);
					const htmlContent = await response.text();
					DATA.ytInitialData = htmlContent.match(/var ytInitialData = ({.*?});/s);
					if (DATA.ytInitialData) { ImprovedTube.mostReplayed(); }
				} catch (error) {
const o = Object.assign(document.createElement('div'), { innerText: 'too few views' });
const keySceneButton = document.querySelector('button[data-tooltip="Key Scene"]');
		if (keySceneButton) {  keySceneButton.style.transition = 'opacity 0.4s';  keySceneButton.style.opacity = '0.3';
		setTimeout(() => {    keySceneButton.style.opacity = '0.8';    }, 5000);}
		console.error(`Error: fetching from https://Youtube.com/watch?v=${DATA.videoID}`, error);  }
				})();
				}
}

if (tries >= maxTries) {  clearInterval(waitForVideoTitle); } intervalMs *= 1.11; }, intervalMs);
window.addEventListener('load', () => {  setTimeout(() => { clearInterval(waitForVideoTitle) }, 5000);});
			};
			ImprovedTube.fetchDOMData2();




}

/*------------------------------------------------------------------------------
REDIRECT SHORTS TO WATCH URL
------------------------------------------------------------------------------*/
ImprovedTube.redirectShortsToWatch = function () {
    if (this.storage.redirect_shorts_to_watch !== true) {
        return;
    }
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/shorts/')) {
        const videoId = currentPath.substring('/shorts/'.length);
        if (videoId) {
            const newUrl = `${window.location.origin}/watch?v=${videoId}${window.location.search}`;
            if (window.location.href !== newUrl) {
                console.log(`ImprovedTube: Redirecting Shorts to Watch: ${window.location.href} -> ${newUrl}`);
                window.location.replace(newUrl);
            }
        }
    }
};

/*------------------------------------------------------------------------------
YOUTUBE RETURN BUTTON IN FULLSCREEN
------------------------------------------------------------------------------*/
ImprovedTube.addYouTubeReturnButton = function () {
    if (this.storage.fullscreen_return_button === true) {
        // Remove existing button if it exists
        const existingButton = document.querySelector('#it-youtube-return-button');
        if (existingButton) {
            existingButton.remove();
        }

        // Create the return button
        const returnButton = document.createElement('button');
        returnButton.id = 'it-youtube-return-button';
        returnButton.className = 'ytp-button it-youtube-return-btn';
        returnButton.title = 'Return to YouTube';
        returnButton.setAttribute('aria-label', 'Return to YouTube');

        // Create YouTube logo SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.style.fill = 'white';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z');

        svg.appendChild(path);
        returnButton.appendChild(svg);

        // Add click handler
        returnButton.addEventListener('click', function(e) {
			history.back();
            e.preventDefault();
            e.stopPropagation();
        });

        // Insert button into player controls
        const insertButton = () => {
            const player = document.querySelector('.html5-video-player');
            const titleContainer = document.querySelector('.ytp-title-text');

            if (player && titleContainer && player.classList.contains('ytp-fullscreen')) {
                // Position button in top-left corner of fullscreen player
                titleContainer.parentNode.insertBefore(returnButton, titleContainer);
            }
        };

        // Insert button when entering fullscreen
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const player = mutation.target;
                    if (player.classList.contains('ytp-fullscreen')) {
                        setTimeout(insertButton, 100); // Small delay to ensure DOM is ready
                    }
                }
            });
        });

        const player = document.querySelector('.html5-video-player');
        if (player) {
            observer.observe(player, { attributes: true, attributeFilter: ['class'] });
        }

        // Also check if already in fullscreen
        if (player && player.classList.contains('ytp-fullscreen')) {
            insertButton();
        }
    }
};

/*------------------------------------------------------------------------------
SHORTS AUTO SCROLL
------------------------------------------------------------------------------*/
ImprovedTube.shortsAutoScroll = function () {
    if (this.storage.shorts_auto_scroll) {
        if (!ImprovedTube.shortsAutoScrollInterval) {
            ImprovedTube.shortsAutoScrollInterval = setInterval(() => {
                if (!location.pathname.startsWith('/shorts/')) return;

                const activeRenderer = document.querySelector('ytd-reel-video-renderer[is-active]');
                const video = activeRenderer ? activeRenderer.querySelector('video') : null;

                if (video && !video.dataset.itShortsScrollAttached) {
                    video.dataset.itShortsScrollAttached = 'true';

                    const timeupdateHandler = function () {
                        if (!ImprovedTube.storage.shorts_auto_scroll) {
                            video.removeEventListener('timeupdate', timeupdateHandler);
                            delete video.dataset.itShortsScrollAttached;
                            return;
                        }
                        if (this.paused) return;

                        // Get fresh references to avoid stale DOM elements
                        const currentActiveRenderer = document.querySelector('ytd-reel-video-renderer[is-active]');
                        const isVideoStillActive = currentActiveRenderer && currentActiveRenderer.contains(this);

                        if (!isVideoStillActive) {
                            this.removeEventListener('timeupdate', timeupdateHandler);
                            delete this.dataset.itShortsScrollAttached;
                            return;
                        }

                        if (this.duration && this.currentTime >= this.duration - 0.25) {
                            try {
                                // Find next button with fresh reference
                                const nextButton = currentActiveRenderer.querySelector('#navigation-button-down button')
                                                || document.querySelector('#navigation-button-down button')
                                                || document.querySelector('button[aria-label="Next video"]');

                                if (nextButton) {
                                    this.pause();
                                    nextButton.click();
                                }
                            } catch (error) {
                                console.warn('[ImprovedTube] Shorts auto-scroll error:', error);
                                // Remove listener on error to prevent breaking
                                this.removeEventListener('timeupdate', timeupdateHandler);
                                delete this.dataset.itShortsScrollAttached;
                            }
                        }
                    };

                    video.addEventListener('timeupdate', timeupdateHandler);
                }
            }, 1000);
        }
    } else {
        if (ImprovedTube.shortsAutoScrollInterval) {
            clearInterval(ImprovedTube.shortsAutoScrollInterval);
            ImprovedTube.shortsAutoScrollInterval = null;
        }

        // Clean up all existing event listeners when disabled
        document.querySelectorAll('video[data-it-shorts-scroll-attached]').forEach(video => {
            delete video.dataset.itShortsScrollAttached;
        });
    }
};

/*------------------------------------------------------------------------------
SMART SPEED ENGINE (HEATMAP)
------------------------------------------------------------------------------*/
ImprovedTube.heatmap = {
    data: null,
    segments: [],
    rawMarkersCache: [],
    sessionDisabled: false,
    targetDurationOverride: null,
    indicatorElement: null,
    loopInterval: null,
    uiInterval: null,
    isEnabled: false,

    init: function () {
        this.isEnabled = ImprovedTube.storage.smart_speed === true;
        console.log('[ImprovedTube] Smart Speed: Init called. Enabled:', this.isEnabled);
        if (!this.isEnabled) return;

        this.sessionDisabled = false;
        this.targetDurationOverride = null;
        this.data = null;
        this.segments = [];
        this.rawMarkersCache = [];

        this.injectUI();
        this.getData();

        // Keeps the Whitelist shield accurately updated even if channel changes
        if (this.uiInterval) clearInterval(this.uiInterval);
        this.uiInterval = setInterval(() => this.updateWhitelistUI(), 1000);

        const video = document.querySelector('video');
        if (video && !video.dataset.itSmartSpeedAttached) {
            video.dataset.itSmartSpeedAttached = 'true';
            video.addEventListener('loadeddata', () => {
                if (this.isEnabled) {
                    this.sessionDisabled = false;
                    this.targetDurationOverride = null;
                    if (this.indicatorElement) this.indicatorElement.style.opacity = '1';
                    this.getData();
                }
            });
        }
    },

    // SLEEK TOAST NOTIFICATION
    showToast: function(message) {
        const player = document.querySelector('.html5-video-player');
        if (!player) return;

        let toast = document.getElementById('it-smart-speed-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'it-smart-speed-toast';
            Object.assign(toast.style, {
                position: 'absolute', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 20px',
                borderRadius: '4px', zIndex: 9999, fontSize: '14px', fontWeight: 'bold',
                pointerEvents: 'none', opacity: '0', transition: 'opacity 0.3s ease-in-out',
                border: '1px solid rgba(255,255,255,0.1)'
            });
            player.appendChild(toast);
        }

        toast.innerText = message;
        toast.style.opacity = '1';

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            if (toast) toast.style.opacity = '0';
        }, 2500);
    },

    // UI INJECTIONS
    injectUI: function () {
        const player = document.querySelector('.html5-video-player');
        const controls = document.querySelector('.ytp-right-controls');
        if (!player || !controls) return;

        // 1. Indicator Toggle (Moved to native control bar)
        if (!document.getElementById('it-smart-speed-indicator')) {
            console.log('[ImprovedTube] Smart Speed: Injecting Speed Indicator into Control Bar');
            this.indicatorElement = document.createElement('button');
            this.indicatorElement.id = 'it-smart-speed-indicator';
            this.indicatorElement.className = 'ytp-button';

            // Styled as a native YouTube text button
            this.indicatorElement.style.cssText = 'width: auto; padding: 0 8px; font-weight: bold; font-size: 13px; color: white; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity 0.2s;';

            if (ImprovedTube.storage.smart_speed_indicator === false) {
                this.indicatorElement.style.display = 'none';
            }

            this.indicatorElement.innerText = "⚡ 1.0x";
            this.indicatorElement.title = "Toggle Smart Speed";

            this.indicatorElement.addEventListener('click', () => {
                this.sessionDisabled = !this.sessionDisabled;
                console.log('[ImprovedTube] Smart Speed: Toggled session disabled state:', this.sessionDisabled);
                let video = document.querySelector('video');

                if (this.sessionDisabled) {
                    this.indicatorElement.style.opacity = '0.5';
                    this.indicatorElement.innerText = "⚡ Off";
                    if (video) video.playbackRate = Number(ImprovedTube.storage.player_custom_playback_speed) || 1.0;
                    this.showToast('⏸️ Smart Speed paused for this session');
                } else {
                    this.indicatorElement.style.opacity = '1';
                    // If no heatmap data, the loop can't apply speed — do it here
                    if (this.segments.length === 0) {
                        this.applyNoHeatmapSpeed();
                    } else {
                        this.indicatorElement.innerText = "⚡ On";
                    }
                    this.showToast('▶️ Smart Speed resumed');
                }
            });
            controls.prepend(this.indicatorElement);
        }

        // 2. Whitelist Toggle Button (The Shield)
        if (!document.getElementById('it-smart-whitelist-btn')) {
            console.log('[ImprovedTube] Smart Speed: Injecting Whitelist Toggle');
            let wlBtn = document.createElement('button');
            wlBtn.id = 'it-smart-whitelist-btn';
            wlBtn.className = 'ytp-button';
            wlBtn.style.cssText = 'font-size: 16px; font-weight: bold; color: white; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;';
            wlBtn.innerText = '🛡️';

            wlBtn.onclick = () => {
                const channelNameElement = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
                const channelName = channelNameElement ? channelNameElement.textContent.trim() : "Unknown";

                if (channelName === "Unknown" || !channelName) {
                    this.showToast("Channel name not loaded yet. Try again.");
                    return;
                }

                let profiles = ImprovedTube.storage.smart_speed_profiles || {};
                if (!profiles[channelName]) {
                    profiles[channelName] = { max: 2.0, min: 1.0, sens: 0.5, whitelist: false };
                }

                profiles[channelName].whitelist = !profiles[channelName].whitelist;
                ImprovedTube.messages.send({ action: 'storage-set', key: 'smart_speed_profiles', value: profiles });

                if (profiles[channelName].whitelist) {
                    this.showToast(`🛡️ Whitelisted ${channelName} (Speedup Disabled)`);
                } else {
                    this.showToast(`▶️ Removed ${channelName} from Whitelist`);
                }

                console.log(`[ImprovedTube] Smart Speed: Toggled whitelist for ${channelName} to ${profiles[channelName].whitelist}`);

                this.updateWhitelistUI();
                if (this.rawMarkersCache && this.rawMarkersCache.length > 0) {
                    this.processSegments(this.rawMarkersCache);
                }
            };
            controls.prepend(wlBtn);
        }

        // 3. Key Scene (Next Peak) Button
        if (!document.getElementById('it-smart-peak-btn')) {
            console.log('[ImprovedTube] Smart Speed: Injecting Next Peak Button');
            let peakBtn = document.createElement('button');
            peakBtn.id = 'it-smart-peak-btn';
            peakBtn.className = 'ytp-button';
            peakBtn.style.cssText = 'font-size: 16px; font-weight: bold; color: white; display: inline-flex; align-items: center; justify-content: center;';
            peakBtn.innerText = '⏭️';
            peakBtn.title = "Jump to next high-engagement scene";
            peakBtn.onclick = () => this.jumpToNextPeak();
            controls.prepend(peakBtn);
        }

        // 4. Target Duration Button & Modal
        if (!document.getElementById('it-smart-duration-btn')) {
            console.log('[ImprovedTube] Smart Speed: Injecting Target Duration Button');
            let durBtn = document.createElement('button');
            durBtn.id = 'it-smart-duration-btn';
            durBtn.className = 'ytp-button';
            durBtn.style.cssText = 'font-size: 16px; font-weight: bold; color: white; display: inline-flex; align-items: center; justify-content: center;';
            durBtn.innerText = '⏱️';
            durBtn.title = "Set Target Duration for this video";

            let modal = document.createElement('div');
            modal.id = 'it-smart-duration-modal';
            Object.assign(modal.style, {
                position: 'absolute', bottom: '50px', right: '10px', background: 'rgba(20,20,20,0.95)',
                padding: '10px', borderRadius: '8px', display: 'none', flexDirection: 'column',
                gap: '8px', zIndex: 9999, border: '1px solid #444', minWidth: '180px'
            });

            let mTitle = document.createElement('div');
            mTitle.style.cssText = 'color: white; font-size: 12px; font-weight: bold;';
            mTitle.innerText = 'Target Duration';

            let mInput = document.createElement('input');
            mInput.type = 'number';
            mInput.id = 'it-smart-duration-input';
            mInput.placeholder = 'Minutes';
            mInput.style.cssText = 'width: 100%; padding: 4px; background: #333; color: white; border: none; border-radius: 4px;';

            let mApply = document.createElement('button');
            mApply.style.cssText = 'background: #3ea6ff; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;';
            mApply.innerText = 'Apply Math Algorithm';

            let mMsg = document.createElement('div');
            mMsg.id = 'it-smart-duration-msg';
            mMsg.style.cssText = 'color: #ff4e4e; font-size: 11px;';

            modal.appendChild(mTitle);
            modal.appendChild(mInput);
            modal.appendChild(mApply);
            modal.appendChild(mMsg);
            player.appendChild(modal);
            controls.prepend(durBtn);

            durBtn.onclick = () => modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';

            mApply.onclick = () => {
                let inputMinutes = Number(mInput.value);
                if (!inputMinutes) return;

                let targetSec = inputMinutes * 60;
                let baseMax = Number(ImprovedTube.storage.smart_speed_max) || 2.0;
                let duration = document.querySelector('video')?.duration || 0;
                let absoluteMinSec = duration / baseMax;

                if (targetSec < absoluteMinSec) {
                    mMsg.style.color = '#ff4e4e';
                    mMsg.innerText = `Impossible. Min mathematically possible is: ${Math.ceil(absoluteMinSec/60)}m ${Math.floor(absoluteMinSec%60)}s`;
                    console.log(`[ImprovedTube] Smart Speed: Target duration rejected. Target: ${targetSec}s, Absolute Min: ${absoluteMinSec}s`);
                } else {
                    mMsg.style.color = '#2ba640';
                    mMsg.innerText = "Algorithm Applied!";
                    this.targetDurationOverride = targetSec;
                    this.processSegments(this.rawMarkersCache);
                    console.log(`[ImprovedTube] Smart Speed: Target duration activated -> ${targetSec}s`);
                    this.showToast(`⏱️ Video squeezed to ${inputMinutes} minutes!`);
                    setTimeout(() => { modal.style.display = 'none'; }, 1500);
                }
            };
        }
    },

    // Updates the visual state of the Whitelist shield
    updateWhitelistUI: function() {
        const channelNameElement = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
        const channelName = channelNameElement ? channelNameElement.textContent.trim() : "Unknown";

        let profiles = ImprovedTube.storage.smart_speed_profiles || {};
        const genre = document.querySelector('meta[itemprop="genre"]')?.content || "Unknown";

        let isWhitelisted = (profiles[channelName] && profiles[channelName].whitelist) || (profiles[genre] && profiles[genre].whitelist);

        let btn = document.getElementById('it-smart-whitelist-btn');
        if (btn) {
            if (isWhitelisted) {
                btn.style.opacity = '1';
                btn.title = `Remove ${channelName} from Whitelist`;
                btn.style.textShadow = '0 0 8px #2ba640';
            } else {
                btn.style.opacity = '0.5';
                btn.title = `Add ${channelName} to Whitelist`;
                btn.style.textShadow = 'none';
            }
        }
    },

    // DATA HUNTING
    getData: function () {
        console.log('[ImprovedTube] Smart Speed: Hunting for Heatmap...');
        try {
            const playerResponse = document.getElementById('movie_player')?.getPlayerResponse();
            if (this.checkAndProcess(playerResponse, 'Active Player')) return;
        } catch (e) {}

        try {
            if (this.checkAndProcess(window.ytInitialData, 'window.ytInitialData')) return;
            if (this.checkAndProcess(window.ytInitialPlayerResponse, 'window.ytInitialPlayerResponse')) return;
        } catch (e) {}

        const videoId = new URLSearchParams(window.location.search).get('v') || window.location.pathname.split('/').pop();
        if (videoId && videoId.length === 11) {
            console.log('[ImprovedTube] Smart Speed: Level 1 and 2 failed. Fetching source...');
            fetch('https://www.youtube.com/watch?v=' + videoId)
                .then(res => res.text())
                .then(text => {
                    const matchData = text.match(/var ytInitialData = ({.*?});/s);
                    const matchResp = text.match(/var ytInitialPlayerResponse = ({.*?});/s);

                    if (matchData && this.checkAndProcess(JSON.parse(matchData[1]), 'Fetched ytInitialData')) return;
                    if (matchResp && this.checkAndProcess(JSON.parse(matchResp[1]), 'Fetched ytInitialPlayerResponse')) return;
                    console.log('[ImprovedTube] Smart Speed: Heatmap data not found in source either. Video lacks heatmap — defaulting to minimal speed.');
                    this.rawMarkersCache = [];
                    this.processSegments([]);
                }).catch(() => {
                    // Network error — still default to minimal speed
                    console.log('[ImprovedTube] Smart Speed: Failed to fetch source. Defaulting to minimal speed.');
                    this.rawMarkersCache = [];
                    this.processSegments([]);
                });
        }
    },

    findMarkers: function(obj) {
        if (!obj || typeof obj !== 'object') return null;
        if (obj.markerType === 'MARKER_TYPE_HEATMAP' && Array.isArray(obj.markers)) return obj.markers;
        if (obj.key === 'MARKER_TYPE_HEATMAP' && obj.value && Array.isArray(obj.value.markers)) return obj.value.markers;
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const found = this.findMarkers(obj[key]);
                if (found) return found;
            }
        }
        return null;
    },

    checkAndProcess: function (rootObject, sourceName) {
        if (!rootObject) return false;
        const markers = this.findMarkers(rootObject);
        if (markers && markers.length > 0) {
            console.log('[ImprovedTube] Smart Speed: 🎯 Found Heatmap via: ' + sourceName);
            this.rawMarkersCache = markers;
            this.processSegments(markers);
            return true;
        }
        return false;
    },

    // Applies the minimal speed fallback when no heatmap segments exist
    applyNoHeatmapSpeed: function() {
        const video = document.querySelector('video');
        let base = Number(ImprovedTube.storage.player_custom_playback_speed) || 1.0;
        let baseMin = Number(ImprovedTube.storage.smart_speed_min) || 1.0;
        let finalSpeed = base * baseMin;
        if (video) video.playbackRate = finalSpeed;
        if (this.indicatorElement) {
            this.indicatorElement.innerText = `⚡ ${baseMin.toFixed(2)}x`;
            this.indicatorElement.style.opacity = '1';
        }
    },

    // PROCESSING ENGINE
    processSegments: function (rawMarkers) {
        const video = document.querySelector('video');
        const duration = video ? video.duration : 0;

        if (!duration || isNaN(duration)) {
            setTimeout(() => this.processSegments(rawMarkers), 500);
            return;
        }

        let baseMin = Number(ImprovedTube.storage.smart_speed_min) || 1.0;
        let baseMax = Number(ImprovedTube.storage.smart_speed_max) || 2.0;
        let sensitivity = Number(ImprovedTube.storage.smart_speed_sensitivity) || 0.5;

        const genre = document.querySelector('meta[itemprop="genre"]')?.content || "Unknown";
        const channelNameElement = document.querySelector('.ytd-channel-name a') || document.querySelector('#upload-info .ytd-channel-name');
        const channelName = channelNameElement ? channelNameElement.textContent.trim() : "Unknown";
        let profiles = ImprovedTube.storage.smart_speed_profiles || {};

        let activeProfile = profiles[channelName] || profiles[genre];

        if (activeProfile && activeProfile.whitelist) {
            console.log(`[ImprovedTube] Smart Speed: WHITELIST ACTIVE for ${channelName || genre}. Engine idled.`);
            this.sessionDisabled = true;
            if (this.indicatorElement) {
                this.indicatorElement.style.opacity = '0.5';
                this.indicatorElement.innerText = "⚡ Whitelisted";
            }
            if (video) video.playbackRate = Number(ImprovedTube.storage.player_custom_playback_speed) || 1.0;
            return;
        } else if (activeProfile) {
            console.log(`[ImprovedTube] Smart Speed: Profile applied -> Min:${activeProfile.min} Max:${activeProfile.max}`);
            baseMax = activeProfile.max || baseMax;
            baseMin = activeProfile.min || baseMin;
            sensitivity = activeProfile.sens || sensitivity;
            this.sessionDisabled = false;
            if (this.indicatorElement) this.indicatorElement.style.opacity = '1';
        }

        // No heatmap data — default to minimal speed (whitelist already checked above)
        if (rawMarkers.length === 0) {
            console.log(`[ImprovedTube] Smart Speed: No heatmap data. Applying minimal speed: ${baseMin}x multiplier.`);
            this.applyNoHeatmapSpeed();
            this.segments = [];
            this.startLoop();
            return;
        }

        const chunkPct = 100 / rawMarkers.length;
        let processed = rawMarkers.map((marker, index) => {
            const score = typeof marker.intensityScoreNormalized === 'number' ? marker.intensityScoreNormalized : 0;
            const start = ((index * chunkPct) / 100) * duration;
            const end = (((index + 1) * chunkPct) / 100) * duration;
            return { start, end, duration: end - start, intensity: score };
        });

        // Target Duration Knapsack
        if (this.targetDurationOverride && baseMax > 1.0) {
            let reductionNeeded = duration - this.targetDurationOverride;
            if (reductionNeeded > 0) {
                let sorted = [...processed].sort((a, b) => a.intensity - b.intensity);
                for (let seg of sorted) {
                    if (reductionNeeded <= 0) {
                        seg.speed = baseMin;
                        continue;
                    }
                    let maxTimeSaved = seg.duration - (seg.duration / baseMax);
                    if (maxTimeSaved <= reductionNeeded) {
                        seg.speed = baseMax;
                        reductionNeeded -= maxTimeSaved;
                    } else {
                        let newSegDuration = seg.duration - reductionNeeded;
                        seg.speed = seg.duration / newSegDuration;
                        reductionNeeded = 0;
                    }
                }
            } else {
                processed.forEach(seg => seg.speed = baseMin);
            }
        } else {
            // Standard Mapping
            processed.forEach(seg => {
                let mappedSpeed = baseMin + (baseMax - baseMin) * (1 - (seg.intensity / sensitivity));
                seg.speed = Math.max(baseMin, Math.min(baseMax, mappedSpeed));
            });
        }

        this.segments = processed;
        console.log(`[ImprovedTube] Smart Speed: Engine Ready. Computed ${this.segments.length} logical chunks.`);
        this.startLoop();
    },

    // PLAYBACK LOOP
    startLoop: function() {
        if (this.loopInterval) clearInterval(this.loopInterval);
        this.loopInterval = setInterval(() => {
            if (!this.sessionDisabled) this.update();
        }, 100);
    },

    update: function () {
        const video = document.querySelector('video');
        if (!video || this.segments.length === 0 || video.paused) return;

        let base = Number(ImprovedTube.storage.player_custom_playback_speed) || 1.0;
        const currentSec = video.currentTime;

        let currentIndex = this.segments.findIndex(s => currentSec >= s.start && currentSec < s.end);
        if (currentIndex === -1) return;

        let activeSegment = this.segments[currentIndex];
        let targetSpeedMultiplier = activeSegment.speed;

        // Smoothing Buffer (LERP)
        let timeRemaining = activeSegment.end - currentSec;
        if (timeRemaining < 2.5 && currentIndex + 1 < this.segments.length) {
            let nextSpeedMultiplier = this.segments[currentIndex + 1].speed;
            let progress = 1 - (timeRemaining / 2.5);
            targetSpeedMultiplier = activeSegment.speed - ((activeSegment.speed - nextSpeedMultiplier) * progress);
        }

        let finalSpeed = base * targetSpeedMultiplier;

        if (Math.abs(video.playbackRate - finalSpeed) > 0.05) {
            video.playbackRate = finalSpeed;
        }

        if (this.indicatorElement) {
            this.indicatorElement.innerText = `⚡ ${targetSpeedMultiplier.toFixed(2)}x`;
        }
    },

    jumpToNextPeak: function() {
        const video = document.querySelector('video');
        if (!video || this.segments.length === 0) return;

        let minSpeed = Number(ImprovedTube.storage.smart_speed_min) || 1.0;
        let peakSegment = this.segments.find(s => s.start > video.currentTime && s.speed <= (minSpeed + 0.1));

        if (peakSegment) {
            console.log(`[ImprovedTube] Smart Speed: Skipping to peak at ${peakSegment.start}s`);
            video.currentTime = Math.max(0, peakSegment.start - 2.0);
            this.showToast(`⏭️ Skipped ahead to next peak`);
        } else {
            console.log('[ImprovedTube] Smart Speed: No upcoming peaks detected.');
            this.showToast(`❌ No upcoming peaks detected`);
        }
    }
};

/*------------------------------------------------------------------------------
AUTO-START HOOKS
------------------------------------------------------------------------------*/
setTimeout(function() {
    if (ImprovedTube.storage.smart_speed === true) ImprovedTube.heatmap.init();
}, 2000);

window.addEventListener('yt-navigate-finish', function() {
    if (ImprovedTube.storage.smart_speed === true) {
        setTimeout(() => ImprovedTube.heatmap.init(), 1000);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.code === 'KeyP' && ImprovedTube.storage.smart_speed) {
        ImprovedTube.heatmap.jumpToNextPeak();
    }
});

/*------------------------------------------------------------------------------
AUTO-ACCEPT "CONTINUE WATCHING?"
------------------------------------------------------------------------------*/
ImprovedTube.playerAutoContinueWatching = function () {
	const enabled = this.storage.player_auto_continue_watching !== false
		|| this.storage.Hide_Pause_Overlay === true;

	if (!enabled) {
		if (this._autoContinueWatchingObserver) {
			this._autoContinueWatchingObserver.disconnect();
			this._autoContinueWatchingObserver = null;
		}
		return;
	}

	const continueWatchingPattern = /continue watching|video paused|still watching|are you still watching/i;

	const acceptDialog = function () {
		document.querySelectorAll('tp-yt-paper-dialog[role="dialog"], ytd-modal-with-title-and-button-renderer').forEach(function (dialog) {
			const text = dialog.textContent || '';

			if (!continueWatchingPattern.test(text)) {
				return;
			}

			let button = dialog.querySelector('#confirm-button button, #confirm-button tp-yt-paper-button, ytd-button-renderer#confirm-button button, tp-yt-paper-button#button');

			if (!button) {
				dialog.querySelectorAll('button, tp-yt-paper-button, ytd-button-renderer button').forEach(function (candidate) {
					const label = (candidate.textContent || candidate.getAttribute('aria-label') || '').trim();

					if (!button && /^(yes|continue|ok)$/i.test(label)) {
						button = candidate;
					}
				});
			}

			if (button) {
				button.click();

				const player = ImprovedTube.elements.player;

				if (player && typeof player.playVideo === 'function' && player.getPlayerState() !== 1) {
					try {
						player.playVideo();
					} catch (error) { }
				}
			}
		});
	};

	acceptDialog();

	if (!this._autoContinueWatchingObserver) {
		this._autoContinueWatchingObserver = new MutationObserver(acceptDialog);
		this._autoContinueWatchingObserver.observe(document.documentElement, {
			childList: true,
			subtree: true
		});
	}
};
