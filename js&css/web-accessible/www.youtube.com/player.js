/*------------------------------------------------------------------------------
AUTOPLAY DISABLE
------------------------------------------------------------------------------*/
ImprovedTube.autoplayDisable = function (videoElement) {
	if (this.storage.player_autoplay_disable
		|| this.storage.playlist_autoplay === false
		|| this.storage.channel_trailer_autoplay === false) {
		const player = this.elements.player || videoElement.closest('.html5-video-player') || videoElement.closest('#movie_player'); // #movie_player: outdated since 2024?

		if (this.video_url !== location.href) {	this.user_interacted = false; }

		//if (there is a player) and (no user clicks) and (no ads playing) 
		// and( ((auto play is off and it is not in a playlist)
		//   	 or (playlist auto play is off and in a playlist))
		//   	 or (we are in a channel and the channel trailer autoplay is off)  )

		if (player && !this.user_interacted // (=user didnt click or type)
			&& !player.classList.contains('ad-showing') // (=no ads playing, needs an update?)
			&& ((location.href.includes('/watch?') // #1703 // (=video page)
				// player_autoplay_disable & not playlist
				&& (this.storage.player_autoplay_disable && !location.href.includes('list='))
				// !playlist_autoplay & playlist
				|| (this.storage.playlist_autoplay === false && location.href.includes('list=')))
				// channel homepage & !channel_trailer_autoplay
				|| (this.storage.channel_trailer_autoplay === false && this.regex.channel.test(location.href)
				   && !/\/(videos|shorts|playlists|community|channels|about|posts|streams|releases)$/.test(location.href) )
			   )) {

			setTimeout(function () {
				try { player.pauseVideo(); } catch (error) { console.log("autoplayDisable: Pausing"); videoElement.pause(); }
			});
		} else {
			document.dispatchEvent(new CustomEvent('it-play'));
		}
	} else {
		document.dispatchEvent(new CustomEvent('it-play'));
	}
};
/*------------------------------------------------------------------------------
FORCED PLAY VIDEO FROM THE BEGINNING
------------------------------------------------------------------------------*/
ImprovedTube.forcedPlayVideoFromTheBeginning = function () {
	const player = this.elements.player,
		video = this.elements.video,
		paused = video?.paused;

	if (player && video && this.storage.forced_play_video_from_the_beginning && location.pathname == '/watch') {
		player.seekTo(0);
		// restore previous paused state
		if (paused) { player.pauseVideo(); }
	}
};
/*------------------------------------------------------------------------------
AUTOPAUSE WHEN SWITCHING TABS
------------------------------------------------------------------------------*/
ImprovedTube.playerAutopauseWhenSwitchingTabs = function () {
	const player = this.elements.player;

	if (this.storage.player_autopause_when_switching_tabs && player) {
		if (this.focus && this.played_before_blur && this.elements.video.paused) {
			player.playVideo();
		} else {
			this.played_before_blur = !this.elements.video.paused;
			if (!this.elements.video.paused) {
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
PLAYBACK SPEED
------------------------------------------------------------------------------*/
ImprovedTube.playbackSpeed = function (newSpeed) {
	const video = this.elements.video,
		player = this.elements.player,
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
					var tries = 0; 	var intervalMs = 210; if (location.href.indexOf('/watch?') !== -1) {var maxTries = 10;} else {var maxTries = 0;}
					// ...except when it is an embedded player?
					var waitForDescription = setInterval(() => {
						if (++tries >= maxTries) {
							subtitle = document.querySelector('#title + #subtitle:last-of-type')
							if ( subtitle && 1 <= Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0])	// indicates buyable/registered music (amount of songs)
						 && typeof testSongDuration(DATA.lengthSeconds, Number((subtitle?.innerHTML?.match(/^\d+/) || [])[0]) ) !== 'undefined' ) // resonable duration
							{player.setPlaybackRate(1); video.playbackRate = 1; console.log("...but YouTube shows music below the description!"); clearInterval(waitForDescription); }
							intervalMs *= 1.11;	}}, intervalMs);
					window.addEventListener('load', () => { setTimeout(() => { clearInterval(waitForDescription); }, 1234); });
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
			 if ( DATA.title === ImprovedTube.videoTitle() || DATA.title.replace(/\s{2,}/g, ' ') === ImprovedTube.videoTitle() )
				{ keywords = document.querySelector('meta[name="keywords"]')?.content || ''; ImprovedTube.speedException(); }
				else { keywords = ''; (async function () { try { const response = await fetch(`https://www.youtube.com/watch?v=${DATA.videoID}`);
					console.log("loading the html source:" + `https://www.youtube.com/watch?v=${DATA.videoID}`);
					const htmlContent = await response.text();
					const metaRegex = /<meta[^>]+(name|itemprop)=["'](keywords|genre|duration)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
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
ImprovedTube.playerSubtitles = function () {
	const player = this.elements.player;

	if (player && player.isSubtitlesOn && player.toggleSubtitles && player.toggleSubtitlesOn) {
		switch (this.storage.player_subtitles) {
			case true:
			case 'enabled':
				player.toggleSubtitlesOn();
				break

			case 'disabled':
				if (player.isSubtitlesOn()) { player.toggleSubtitles(); }
				break
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
	if (
		this.storage.player_autofullscreen === true &&
		document.documentElement.dataset.pageType === 'video' &&
		!document.fullscreenElement
	) {
		this.elements.player.toggleFullscreen();
	}
};
/*------------------------------------------------------------------------------
QUALITY
------------------------------------------------------------------------------*/
ImprovedTube.playerQuality = function (quality = this.storage.player_quality) {
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

   var fsq=ImprovedTube.storage.full_screen_quality;
   var target = isFs ? fsq : ImprovedTube.storage.player_quality;



   var map = {
     '144p':'tiny','240p':'small','360p':'medium','480p':'large',
     '720p':'hd720','1080p':'hd1080','1440p':'hd1440','2160p':'hd2160','4320p':'highres',
     'tiny':'tiny','small':'small','medium':'medium','large':'large',
     'hd720':'hd720','hd1080':'hd1080','hd1440':'hd1440','hd2160':'hd2160','highres':'highres'
   };
   var desired = map[target] || target;

   function applyQuality(){
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
ImprovedTube.playerPlaybackSpeedButton = function () {
  if (this.storage.player_playback_speed_button === true) {
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
      this.playbackSpeed(1.0);
      return false;
    };

    button.onwheel = (e) => {
      e.preventDefault();
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
			a.download = (ImprovedTube.videoId() || location.href.match) + ' ' + new Date(ImprovedTube.elements.player.getCurrentTime() * 1000).toISOString().substr(11, 8).replace(/:/g, '-') + ' ' + ImprovedTube.videoTitle() + (subText ? ' - ' + subText.trim() : '') + '.png';
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

					transform += ' scale(' + (is_vertical_video ? player.clientWidth : player.clientHeight) / (is_vertical_video ? player.clientHeight : player.clientWidth) + ')';
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
			ImprovedTube.playbackSpeed(1.0);
			ImprovedTube.showStatus('1.0x');
		});

		// Add wheel handler
		button.addEventListener('wheel', function (e) {
			e.preventDefault();
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

/*------------------------------------------------------------------------------
FIT-TO-WIN BUTTON
------------------------------------------------------------------------------*/
ImprovedTube.playerFitToWinButton = function () {
	if (this.storage.player_fit_to_win_button === true && (/watch\?/.test(location.href))) {
	let tempContainer = document.createElement("div");
	let svg;
	if (typeof trustedTypes !== 'undefined' && typeof trustedTypes.createPolicy === 'function') {
		// Create a Trusted Type policy
		const policy = trustedTypes.createPolicy('default', {
			createHTML: (string) => string,
		});

		// Use the policy to set innerHTML
		tempContainer.innerHTML = policy.createHTML(`
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="ftw-icon">
		<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>`);

		// Ensure the SVG element is correctly parsed
        	svg = tempContainer.querySelector('svg');
	} else {tempContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="ftw-icon">
 		<path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>`;
		svg = tempContainer.firstChild;}
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

				if (playerContainer) playerContainer.style.zIndex = zIndex;
				if (playerContainerDefault)
					playerContainerDefault.style.zIndex = zIndex;

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
			if (playerContainer) playerContainer.style.zIndex = 1;
			var playerContainerDefault = document.getElementById('player-container');
			if (playerContainerDefault) playerContainerDefault.style.zIndex = 1;
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
				if (player) player.style.zIndex = 10000;
				var playerDefault = document.getElementById('player-container');
				if (playerDefault) playerDefault.style.zIndex = 10000;

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
		ImprovedTube.elements.player.style.opacity = '1';

		ImprovedTube.mini_player__x = Math.max(0, Math.min(ImprovedTube.mini_player__x, document.body.offsetWidth - ImprovedTube.mini_player__width));
		ImprovedTube.mini_player__y = Math.max(0, Math.min(ImprovedTube.mini_player__y, window.innerHeight - ImprovedTube.mini_player__height));

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		ImprovedTube.elements.player.style.transform = 'translate(' + ImprovedTube.mini_player__x + 'px, ' + ImprovedTube.mini_player__y + 'px)';

		ImprovedTube.mini_player__setSize(ImprovedTube.mini_player__width, ImprovedTube.mini_player__height, true, true);

		window.addEventListener('mousedown', ImprovedTube.miniPlayer_mouseDown);
		window.addEventListener('mousemove', ImprovedTube.miniPlayer_cursorUpdate);
		window.addEventListener('resize', ImprovedTube.miniPlayer_scroll);
	} else if (window.scrollY < 256 && ImprovedTube.mini_player__mode === true || ImprovedTube.elements.player.classList.contains('ytp-player-minimized') === true) {
		ImprovedTube.mini_player__mode = false;
		ImprovedTube.elements.player.classList.remove('it-mini-player');
		ImprovedTube.elements.player.style.opacity = '';
		ImprovedTube.mini_player__move = false;
		ImprovedTube.elements.player.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
		ImprovedTube.elements.player.style.width = '';
		ImprovedTube.elements.player.style.height = '';

		ImprovedTube.mini_player__cursor = '';
		document.documentElement.removeAttribute('it-mini-player-cursor');

		window.dispatchEvent(new Event('resize'));

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
ImprovedTube.disableAutoDubbing = function () {
	const player = this.elements.player;
	const tracks = player.getAvailableAudioTracks();
	const originalTrack = findOriginalAudioTrack(tracks);
	
	if (originalTrack) {
		player.setAudioTrack(originalTrack);
	}

	function findOriginalAudioTrack(audioTracks) {
		// Score tracks based on likely original source
		for (const track of audioTracks) {
			if (hasOriginalKeyword(track)) {
				return track;
			}
		}

		for (const track of audioTracks) {
			if (hasASR(track)) {
				return track;
			}
		}

		function hasASR(track) {
			return Array.isArray(track.captionTracks) && 
				track.captionTracks.some(ct => ct.kind === 'asr');
		}

		function hasOriginalKeyword(track) {
			var name = track?.HB?.name?.toLowerCase() || '';
			const localizedOriginalWords = ['original', 'originale', 'originalny', 'originalaudio', 'origineel', 'orijinal']; // Add more if needed
			if (name === '') {
				// Try to get the localized name from other variable
				name = track?.Af.name?.toLowerCase() || '';
			}
			
			return localizedOriginalWords.some(word => name.includes(word));
		}

		// As a fallback: default or first item
		const fallback = audioTracks.find(t => t?.HB?.isDefault) || audioTracks[0];
		console.log(fallback);
		return fallback;
	}
}
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
SMART SPEED & SKIP (HEATMAP ENGINE)
------------------------------------------------------------------------------*/
ImprovedTube.heatmap = {
    data: null,
    segments: [],
    isEnabled: false,
    lastCheck: 0,

    init: function () {
        this.isEnabled = ImprovedTube.storage.smart_speed === true;
        if (!this.isEnabled) return;

        this.data = null;
        this.segments = [];
        this.getData();
        
        const video = document.querySelector('video');
        if (video && !video.dataset.itSmartSpeedAttached) {
            video.dataset.itSmartSpeedAttached = 'true';
            video.addEventListener('timeupdate', () => this.update(video));
            video.addEventListener('loadeddata', () => this.init());
        }
    },

    getData: function () {
    //    console.log('[ImprovedTube] Hunting for Heatmap...');

        // LEVEL 1: Active Player
        try {
            const playerResponse = document.getElementById('movie_player')?.getPlayerResponse();
            if (this.checkAndProcess(playerResponse, 'Active Player')) return;
        } catch (e) {}

        // LEVEL 2: Global Variables
        try {
            if (this.checkAndProcess(window.ytInitialData, 'window.ytInitialData')) return;
            if (this.checkAndProcess(window.ytInitialPlayerResponse, 'window.ytInitialPlayerResponse')) return;
        } catch (e) {}

        // LEVEL 3: Background Fetch
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
            console.log('[ImprovedTube] Level 1 and 2 failed. Fetching source...');
            fetch('https://www.youtube.com/watch?v=' + videoId)
                .then(res => res.text())
                .then(text => {
                    // Extract and parse JSONs
                    const matchData = text.match(/var ytInitialData = ({.*?});/s);
                    const matchResp = text.match(/var ytInitialPlayerResponse = ({.*?});/s);

                    if (matchData && this.checkAndProcess(JSON.parse(matchData[1]), 'Fetched ytInitialData')) return;
                    if (matchResp && this.checkAndProcess(JSON.parse(matchResp[1]), 'Fetched ytInitialPlayerResponse')) return;

                    console.log('[ImprovedTube] Heatmap data not found in source.');
                })
                .catch(err => console.error('[ImprovedTube] Fetch error:', err));
        }
    },

    // Recursively searches JSON for the heatmap
    findMarkers: function(obj) {
        if (!obj || typeof obj !== 'object') return null;
        
        // Pattern 1: Standard MarkersList
        if (obj.markerType === 'MARKER_TYPE_HEATMAP' && Array.isArray(obj.markers)) {
            return obj.markers;
        }
        
        // Pattern 2: MarkersMap (common in ytInitialData)
        if (obj.key === 'MARKER_TYPE_HEATMAP' && obj.value && Array.isArray(obj.value.markers)) {
            return obj.value.markers;
        }

        // Recursive Search
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
        // Use the recursive finder instead of hardcoded paths
        const markers = this.findMarkers(rootObject);
        
        if (markers && markers.length > 0) {
            console.log('[ImprovedTube] Found Heatmap via: ' + sourceName);
            this.processSegments(markers);
            return true;
        }
        return false;
    },

    processSegments: function (rawMarkers) {
        if (!rawMarkers || rawMarkers.length === 0) return;

        this.segments = [];
        let currentAction = 'PLAY';
        let currentSpeed = 1.0;
        let startPct = 0;

        rawMarkers.forEach((marker, index) => {
            const score = marker.intensityScoreNormalized;
            if (typeof score !== 'number') return;

            let newAction = 'PLAY';
            let newSpeed = 1.0;

            // 1. SKIP LOGIC (Intro only: First 15%)
            if (index < 15 && score < 0.15) {
                newAction = 'SKIP';
            } 
            // 2. DYNAMIC SPEED LOGIC
            else {
                if (score <= 0.05) newSpeed = 2.0;       // Extremely Boring
                else if (score <= 0.12) newSpeed = 1.75; // Very Boring
                else if (score <= 0.18) newSpeed = 1.5;  // Boring
                else if (score <= 0.25) newSpeed = 1.25; // Slightly Boring
                else newSpeed = 1.0;                     // Normal
            }

            // Create a new segment if the plan changes
            if (newAction !== currentAction || newSpeed !== currentSpeed) {
                this.segments.push({ 
                    start: startPct, 
                    end: index, 
                    action: currentAction, 
                    speed: currentSpeed 
                });
                currentAction = newAction;
                currentSpeed = newSpeed;
                startPct = index;
            }
        });
        // Push final segment
        this.segments.push({ start: startPct, end: 100, action: currentAction, speed: currentSpeed });
        console.log('[ImprovedTube] Dynamic Segments ready:', this.segments.length);
    },

    update: function (video) {
        if (!this.segments.length || video.paused) return;

        const now = Date.now();
        if (now - this.lastCheck < 500) return; 
        this.lastCheck = now;

        const duration = video.duration;
        const currentPct = (video.currentTime / duration) * 100;
        
        const activeSegment = this.segments.find(s => currentPct >= s.start && currentPct < s.end);

        if (activeSegment) {
            if (activeSegment.action === 'SKIP') {
                const skipTo = (activeSegment.end / 100) * duration;
                if (skipTo - video.currentTime > 5) { 
                    console.log('[ImprovedTube] Auto-Skipping...');
                    video.currentTime = skipTo;
                }
            } else {
                // Apply Dynamic Speed with a small tolerance check to prevent log spam
                // We check if current speed matches target speed (within 0.1 margin)
                if (Math.abs(video.playbackRate - activeSegment.speed) > 0.1) {
                    video.playbackRate = activeSegment.speed;
                }
            }
        }
    }
};

/*------------------------------------------------------------------------------
AUTO-START SMART SPEED
------------------------------------------------------------------------------*/
setTimeout(function() {
    if (ImprovedTube.storage.smart_speed === true) {
        console.log('[ImprovedTube] Auto-Starting Smart Speed...');
        ImprovedTube.heatmap.init();
    }
}, 2000);
window.addEventListener('yt-navigate-finish', function() {
    if (ImprovedTube.storage.smart_speed === true) {
        setTimeout(() => ImprovedTube.heatmap.init(), 1000);
    }
});