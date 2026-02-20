/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
# Global variable
# Messages
	# Create element
	# Listener
	# Send
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var ImprovedTube = {
	messages: {
		queue: []
	},
	storage: {},
	elements: {
		buttons: {},
		masthead: {},
		app_drawer: {},
		playlist: {},
		livechat: {},
		related: {},
		comments: {},
		collapse_of_subscription_sections: [],
		mark_watched_videos: [],
		blocklist_buttons: [],
		observerList: []
	},
	regex: {
		channel: /\/(@|c\/@?|channel\/|user\/)(?<name>[^/]+)/,
		channel_home_page: /\/@|((channel|user|c)\/)[^/]+(\/featured)?\/?$/,
		channel_home_page_postfix: /\/(featured)?\/?$/,
		thumbnail_quality: /(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)+/,
		video_id: /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/,
		video_time: /[?&](?:t|start)=([^&]+)|#t=(\w+)/,
		playlist_id: /[?&]list=([^&]+)/,
		channel_link: /https:\/\/www.youtube.com\/@|((channel|user|c)\/)/
	},
	button_icons: {
		blocklist: {
			svg: [['viewBox', '0 0 24 24']],
			path: [['d', 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18A8 8 0 015.69 7.1L16.9 18.31A7.9 7.9 0 0112 20zm6.31-3.1L7.1 5.69A8 8 0 0118.31 16.9z']]
		},
		playAll: {
			svg: [['viewBox', '0 0 24 24']],
			path: [['d', 'M6,4l12,8L6,20V4z']]
		}
	},
	video_src: false,
	initialVideoUpdateDone: false,
	latestVideoDuration: 0,
	video_url: '',
	focus: false,
	played_before_blur: false,
	played_time: 0,
	user_interacted: false,
	input: {
		listening: {},
		listeners: {},
		pressed: {
			keys: new Set(),
			wheel: 0,
			alt: false,
			ctrl: false,
			shift: false
		},
		cancelled: new Set(),
		ignoreElements: ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'],
		modifierKeys: ['AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight'],
	},
	mini_player__mode: false,
	mini_player__move: false,
	mini_player__cursor: '',
	mini_player__x: 0,
	mini_player__y: 0,
	mini_player__max_x: 0,
	mini_player__max_y: 0,
	mini_player__original_width: 0,
	mini_player__original_height: 0,
	mini_player__width: 200,
	mini_player__height: 160,
	miniPlayer_mouseDown_x: 0,
	miniPlayer_mouseDown_y: 0,
	mini_player__player_offset_x: 0,
	mini_player__player_offset_y: 0,
	miniPlayer_resize_offset: 16,
	playlistReversed: false,
	status_timer: false,
	defaultApiKey: 'AIzaSyCXRRCFwKAXOiF1JkUBmibzxJF1cPuKNwA'
};

/*--------------------------------------------------------------
CODEC || 30FPS
----------------------------------------------------------------
	Do not move, needs to be on top of first injected content
	file to patch HTMLMediaElement before YT player uses it.
--------------------------------------------------------------*/
if (localStorage['it-codec'] || localStorage['it-player30fps']) {
	function overwrite(self, callback, mime) {
		if (localStorage['it-codec']) {
			var re = new RegExp(localStorage['it-codec']);
			// /webm|vp8|vp9|av01/
			if (re.test(mime)) return '';
		}
		if (localStorage['it-player30fps']) {
			var match = /framerate=(\d+)/.exec(mime);
			if (match && match[1] > 30) return '';
		}
		return callback.call(self, mime);
	};

	if (window.MediaSource) {
		var isTypeSupported = window.MediaSource.isTypeSupported;
		window.MediaSource.isTypeSupported = function (mime) {
			return overwrite(this, isTypeSupported, mime);
		}
	}
	var canPlayType = HTMLMediaElement.prototype.canPlayType;
	HTMLMediaElement.prototype.canPlayType = function (mime) {
		return overwrite(this, canPlayType, mime);
	}
};

/*--------------------------------------------------------------
# MESSAGES
----------------------------------------------------------------
	Designed for messaging between contexts of extension and
	website.
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CREATE ELEMENT
--------------------------------------------------------------*/

ImprovedTube.messages.create = function () {
	this.element = document.createElement('div');

	this.element.id = 'it-messages-from-youtube';

	this.element.style.display = 'none';

	document.documentElement.appendChild(this.element);
};

ImprovedTube.messages.create();

/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

ImprovedTube.messages.listener = function () {
	document.addEventListener('it-message-from-youtube--readed', function () {
		ImprovedTube.messages.queue.pop();

		if (ImprovedTube.messages.queue.length > 0) {
			ImprovedTube.messages.element.textContent = message;

			document.dispatchEvent(new CustomEvent('it-message-from-youtube'));
		}
	});
};

ImprovedTube.messages.listener();

document.addEventListener('it-message-from-extension', function () {
	var provider = document.querySelector('#it-messages-from-extension');

	if (provider) {
		var message = provider.textContent;

		document.dispatchEvent(new CustomEvent('it-message-from-extension--readed'));

		try {
			message = JSON.parse(message);
		} catch (error) {
			console.log(error);
		}

		if (message.action === 'storage-loaded') {
			ImprovedTube.storage = message.storage;

			if (ImprovedTube.storage.block_vp9 || ImprovedTube.storage.block_av1 || ImprovedTube.storage.block_h264) {
				let atlas = { block_vp9: 'vp9|vp09', block_h264: 'avc1', block_av1: 'av01' },
					codec = Object.keys(atlas).reduce(function (all, key) {
						return ImprovedTube.storage[key] ? ((all ? all + '|' : '') + atlas[key]) : all
					}, '');
				if (localStorage['it-codec'] != codec) {
					localStorage['it-codec'] = codec;
				}
			} else if (localStorage['it-codec']) {
				localStorage.removeItem('it-codec');
			}
			if (ImprovedTube.storage.player_60fps === false) {
				if (!localStorage['it-player30fps']) {
					localStorage['it-player30fps'] = true;
				}
			} else if (localStorage['it-player30fps']) {
				localStorage.removeItem('it-player30fps');
			}

			ImprovedTube.init();
			ImprovedTube.blocklistInit();

			/*--------------------------------------------------------------
			# Immediate reaction to any change of our extension storage (settings)
					While most of our features are chosen permanently (set and forget) and need to run with YouTube,
				 we only started this section for feedback and reducing new user's misunderstandings.
						(For our simple CSS-only features this isn't necessary, since a loop is doing it and there could be a shared loop for many JS feature too)
				Yet doing this, it could also be used for big extra visual feedback pointing at or highlighing the immediate change on youtube. 
					(to make it most intutive to the many new or visual users, bringing changes with simple css-transations or animation. Like an interactive tutorial.) 
			--------------------------------------------------------------*/
		} else if (message.action === 'storage-changed') {
			let camelized_key = message.camelizedKey;

			ImprovedTube.storage[message.key] = message.value;
			if (['block_vp9', 'block_h264', 'block_av1'].includes(message.key)) {
				let atlas = { block_vp9: 'vp9|vp09', block_h264: 'avc1', block_av1: 'av01' }
				localStorage['it-codec'] = Object.keys(atlas).reduce(function (all, key) {
					return ImprovedTube.storage[key] ? ((all ? all + '|' : '') + atlas[key]) : all
				}, '');
				if (!localStorage['it-codec']) {
					localStorage.removeItem('it-codec');
				}
			}
			if (message.key === "player_60fps") {
				if (ImprovedTube.storage.player_60fps === false) {
					localStorage['it-player30fps'] = true;
				} else {
					localStorage.removeItem('it-player30fps');
				}
			}
			switch (camelized_key) {
				case 'blocklist':
				case 'blocklistActivate':
					ImprovedTube.blocklistInit();
					break

				case 'playerPlaybackSpeed':
				case 'playerForcedPlaybackSpeed':
					if (ImprovedTube.storage.player_forced_playback_speed === true && isFinite(Number(ImprovedTube.storage.player_playback_speed))) {
						ImprovedTube.playbackSpeed(Number(ImprovedTube.storage.player_playback_speed)); //new
						ImprovedTube.elements.player.setPlaybackRate(Number(ImprovedTube.storage.player_playback_speed));
						// ImprovedTube.elements.player.querySelector('video').playbackRate = Number(ImprovedTube.storage.player_playback_speed.toFixed(2));
					} else if (ImprovedTube.storage.player_forced_playback_speed === false) {
						ImprovedTube.elements.player.setPlaybackRate(1);
						ImprovedTube.elements.player.querySelector('video').playbackRate = 1;
					}
					break

				case 'theme':
				case 'themePrimaryColor':
				case 'themeSecondaryColor':
				case 'themeTextColor':
					clearTimeout(ImprovedTube.themeUpdateTimer);
					ImprovedTube.themeUpdateTimer = setTimeout(function () {
						ImprovedTube.myColors();
						ImprovedTube.setTheme();
					}, 200);
					break

				case 'description':
					if (ImprovedTube.storage.description === "expanded") {
						try { document.querySelector("#more").click() || document.querySelector("#expand").click(); } catch { }
					} else if (ImprovedTube.storage.description === "normal") {
						try { document.querySelector("#less").click() || document.querySelector("#collapse").click(); } catch { }
					}
					break

				case 'transcript':
					if (ImprovedTube.storage.transcript === true) {
						document.querySelector('*[target-id*=transcript]')?.removeAttribute('visibility');
					} else if (ImprovedTube.storage.transcript === false) {
						document.querySelector('*[target-id*=transcript] #visibility-button button')?.click();
					}
					break

				case 'chapters':
					if (ImprovedTube.storage.chapters === true) {
						document.querySelector('*[target-id*=chapters]')?.removeAttribute('visibility');
					} else if (ImprovedTube.storage.chapters === false) {
						document.querySelector('*[target-id*=chapters] #visibility-button button')?.click();
					}
					break

				case 'commentsSidebarSimple':
					if (ImprovedTube.storage.comments_sidebar_simple === false) {
						document.querySelector("#below").appendChild(document.querySelector("#comments"));
						document.querySelector("#secondary").appendChild(document.querySelector("#related"));
					} else {
						ImprovedTube.commentsSidebarSimple();
					}
					break

				case 'forcedTheaterMode':
					if (ImprovedTube.storage.forced_theater_mode === false && ImprovedTube.elements.ytd_watch && ImprovedTube.elements.player) {
						const button = ImprovedTube.elements.player.querySelector("button.ytp-size-button");
						if (button && ImprovedTube.elements.ytd_watch.theater === true) {
							ImprovedTube.elements.ytd_watch.theater = false;
							setTimeout(function () { button.click(); }, 100);
						}
					}
					break

				case 'playerScreenshotButton':
					if (ImprovedTube.storage.player_screenshot_button === false) {
						if (ImprovedTube.elements.buttons['it-screenshot-button']) {
							ImprovedTube.elements.buttons['it-screenshot-button']?.remove();
							ImprovedTube.elements.buttons['it-screenshot-styles']?.remove();
						}
					}
					break

				case 'playerCinemaModeButton':
					if (ImprovedTube.storage.player_cinema_mode_button === false) {
						if (ImprovedTube.elements.buttons['it-cinema-mode-button']) {
							ImprovedTube.elements.buttons['it-cinema-mode-button']?.remove();
							ImprovedTube.elements.buttons['it-cinema-mode-styles']?.remove();
						}
					}

				case 'playerRepeatButton':
					if (ImprovedTube.storage.player_repeat_button === false) {
						if (ImprovedTube.elements.buttons['it-repeat-button']) {
							ImprovedTube.elements.buttons['it-repeat-button']?.remove();
							ImprovedTube.elements.buttons['it-repeat-styles']?.remove();
						}
					}
					break

				case 'playerPopupButton':
					if (ImprovedTube.storage.player_popup_button === false) {
						ImprovedTube.elements.buttons['it-popup-player-button']?.remove();
					}
					break

				case 'playerRotateButton':
					if (ImprovedTube.storage.player_rotate_button === false) {
						ImprovedTube.elements.buttons['it-rotate-button']?.remove();
						ImprovedTube.elements.buttons['it-rotate-styles']?.remove();
					}
					break

				case 'playerFitToWinButton':
					if (ImprovedTube.storage.player_fit_to_win_button === false) {
						ImprovedTube.elements.buttons['it-fit-to-win-player-button']?.remove();
						document.querySelector("html")?.setAttribute("it-player-size", ImprovedTube.storage.player_size ?? "do_not_change");
					}
					break

				case 'playerRewindAndForwardButtons':
					if (ImprovedTube.storage.player_rewind_and_forward_buttons === false) {
						ImprovedTube.elements.buttons['it-forward-player-button']?.remove();
						ImprovedTube.elements.buttons['it-rewind-player-button']?.remove();
					}
					break

				case 'playerIncreaseDecreaseSpeedButtons':
					if (ImprovedTube.storage.player_increase_decrease_speed_buttons === false) {
						ImprovedTube.elements.buttons['it-increase-speed-button']?.remove();
						ImprovedTube.elements.buttons['it-decrease-speed-button']?.remove();
					}
					break


				case 'shortcutActivateFitToWindow':
					if (ImprovedTube.storage.shortcut_activate_fit_to_window && ImprovedTube.storage.player_fit_to_win_button === false) {
						// Activate the player_fit_to_win_button if the user has set a shortcut
						ImprovedTube.messages.send({ action: 'set', key: 'player_fit_to_win_button', value: true });
					}
					break

				case 'playerHamburgerButton':
					if (ImprovedTube.storage.player_hamburger_button == false) {
						document.querySelector('.custom-hamburger-menu')?.remove();
						let rightControls = document.querySelector('.html5-video-player')?.querySelector('.ytp-right-controls');
						if (rightControls) {
							rightControls.style.setProperty('padding-right', ''); // Restoring the original padding:
							rightControls.style.setProperty('display', 'flex');
						}
					}
					break

				case 'playerPlaybackSpeedButton':
					if (ImprovedTube.storage.player_playback_speed_button === false) {
						document.querySelector('#it-playback-speed-button')?.remove();
					} else if (ImprovedTube.storage.player_playback_speed_button === true) {
						ImprovedTube.playerPlaybackSpeedButton();
					}
					break

				case 'belowPlayerPip':
					if (ImprovedTube.storage.below_player_pip === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="PiP"]')?.remove();
					} else if (ImprovedTube.storage.below_player_pip === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'belowPlayerScreenshot':
					if (ImprovedTube.storage.below_player_screenshot === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="Screenshot"]')?.remove();
					} else if (ImprovedTube.storage.below_player_screenshot === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'belowPlayerLoop':
					if (ImprovedTube.storage.below_player_loop === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="Loop"]')?.remove();
					} else if (ImprovedTube.storage.below_player_loop === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'belowPlayerKeyScene':
					if (ImprovedTube.storage.below_player_keyscene === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="NextKeyScene"]')?.remove();
					} else if (ImprovedTube.storage.below_player_keyscene === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'copyVideoId':
					if (ImprovedTube.storage.copy_video_id === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="CopyVideoId"]')?.remove();
					} else if (ImprovedTube.storage.copy_video_id === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'copyTranscript':
					if (ImprovedTube.storage.copy_transcript === false) {
						document.querySelector('.improvedtube-player-button[data-tooltip="CopyTranscript"]')?.remove();
					} else if (ImprovedTube.storage.copy_transcript === true) {
						document.querySelectorAll('.improvedtube-player-button').forEach(e => e.remove());
						ImprovedTube.improvedtubeYoutubeButtonsUnderPlayer();
					}
					break

				case 'dayOfWeek':
					if (ImprovedTube.storage.day_of_week === false) {
						document.querySelector(".ytd-day-of-week")?.remove();
					} else if (ImprovedTube.storage.day_of_week === true) {
						ImprovedTube.dayOfWeek();
					}
					break

				case 'playerRemainingDuration':
					if (ImprovedTube.storage.player_remaining_duration === false) {
						document.querySelector(".ytp-time-remaining-duration")?.remove();
						document.querySelector('.ytp-time-contents')?.removeAttribute('style');
						document.querySelector('.ytp-time-contents')?.style.setProperty('display', 'block', 'important');
					} else if (ImprovedTube.storage.player_remaining_duration === true) {
						ImprovedTube.playerRemainingDuration();
					}
					break

				case 'subtitlesFontFamily':
				case 'subtitlesFontColor':
				case 'subtitlesFontSize':
				case 'subtitlesBackgroundColor':
				case 'subtitlesWindowColor':
				case 'subtitlesWindowOpacity':
				case 'subtitlesCharacterEdgeStyle':
				case 'subtitlesFontOpacity':
				case 'subtitlesBackgroundOpacity':
					ImprovedTube.subtitlesUserSettings();
					break

				case 'playerHideProgressPreview':
					ImprovedTube.playerHideProgressPreview();
					break

				case 'playerHideControls':
					ImprovedTube.playerControls();
					break
				case 'playerlistUpNextAutoplay':
					if (this.storage.playlist_up_next_autoplay !== false) {
						if (playlistData.currentIndex != playlistData.localCurrentIndex) { playlistData.currentIndex = playlistData.localCurrentIndex; }
					}
					break
				case 'playlistCopyVideoId':
					if (ImprovedTube.storage.playlist_copy_video_id === false) {
						document.querySelectorAll('.it-playlist-copy-video-id').forEach(e => e.remove());
					} else if (ImprovedTube.storage.playlist_copy_video_id === true) {
						ImprovedTube.playlistCopyVideoIdButton();
					}
					break
				case 'playlistQuickDeleteShortcut':
					if (typeof ImprovedTube.playlistQuickDeleteShortcut === 'function') {
						ImprovedTube.playlistQuickDeleteShortcut();
					}
					break
				case 'playlistBulkDeleteByProgress':
					if (typeof ImprovedTube.playlistBulkDeleteByProgress === 'function') {
						ImprovedTube.playlistBulkDeleteByProgress();
					}
					break
				case 'disableAutoDubbing':
					if (ImprovedTube.storage.disable_auto_dubbing === true) {
						ImprovedTube.disableAutoDubbing();
					}
					break
				case 'livechat':
					if (this.storage.livechat === 'hidden') {
						document.documentElement.setAttribute('it-livechat', 'hidden');
					} else if (this.storage.livechat === 'collapsed') {
						document.documentElement.setAttribute('it-livechat', 'collapsed');
					} else {
						document.documentElement.removeAttribute('it-livechat');
					}
					break
				case 'livechat_below_theater':
					if (this.storage.livechat_below_theater === true) {
						ImprovedTube.livechatBelowTheater();
						ImprovedTube.livechatTheaterModeObserver();
					} else {
						// Clean up observer and restore chat position
						if (ImprovedTube.livechatTheaterObserver) {
							ImprovedTube.livechatTheaterObserver.disconnect();
							ImprovedTube.livechatTheaterObserver = null;
						}
						// Restore live chat to original position
						const liveChatFrame = document.querySelector("ytd-live-chat-frame#chat");
						const secondaryInner = document.getElementById("secondary-inner");
						if (liveChatFrame && secondaryInner && liveChatFrame.parentNode !== secondaryInner) {
							if (liveChatFrame.parentNode) {
								liveChatFrame.parentNode.removeChild(liveChatFrame);
							}
							secondaryInner.appendChild(liveChatFrame);
							// Reset styling
							liveChatFrame.style.width = "";
							liveChatFrame.style.maxWidth = "";
							liveChatFrame.style.marginTop = "";
							liveChatFrame.style.marginBottom = "";
						}
					}
					break
				case  'smartSpeed':           
                    if (ImprovedTube.storage.smart_speed === true) { if(ImprovedTube.heatmap) {ImprovedTube.heatmap.init(); };
                    } else if (ImprovedTube.storage.smart_speed === false) { if(ImprovedTube.heatmap) { ImprovedTube.heatmap.isEnabled = false; document.querySelector("video").playbackRate = 1.0; } 
                    }
					break        
				case 'returnYoutubeDislike':
					if (ImprovedTube.storage.return_youtube_dislike === true) {
						ImprovedTube.returnYoutubeDislike();
					} else {
						const dislikeCount = document.querySelector('.it-ryd-dislike-count');
						if (dislikeCount) {
							dislikeCount.remove();
						}
					}
					break
			}

			// dont trigger shortcuts on config change, reinitialize handler instead
			if (message.key.startsWith('shortcut_')) camelized_key = 'shortcuts';
			if (ImprovedTube[camelized_key]) {
				try { ImprovedTube[camelized_key]() } catch { };
			}
		} else if (message.focus === true && ImprovedTube.elements.player) {
			ImprovedTube.focus = true;

			ImprovedTube.pageOnFocus();
		} else if (message.blur === true && ImprovedTube.elements.player) {
			ImprovedTube.focus = false;

			ImprovedTube.pageOnFocus();

			document.dispatchEvent(new CustomEvent('improvedtube-blur'));
		} else if (message.pause === true) {
			if (ImprovedTube.elements.player) {
				ImprovedTube.played_before_blur = ImprovedTube.elements.player.getPlayerState() === 1;
				ImprovedTube.elements.player.pauseVideo();
			}
		} else if (message.setVolume) {
			ImprovedTube.elements.player?.setVolume(message.setVolume);
		} else if (message.setPlaybackSpeed) {
			ImprovedTube.playbackSpeed(message.setPlaybackSpeed);
		} else if (message.deleteCookies === true) {
			ImprovedTube.deleteYoutubeCookies();
		} else if (message.responseOptionsUrl) {
			const iframe = document.querySelector('.it-button__iframe');

			if (iframe) {
				iframe.src = message.responseOptionsUrl;
			}
		} /* else if (message.hasOwnProperty('mixer')) {
			if (ImprovedTube.elements.player) {
				  document.documentElement.setAttribute('it-response', JSON.stringify({
					mixer: true,
					url: location.href.match(/(\?|\&)v=[^&]+/)[0].substr(3),
					volume: ImprovedTube.elements.player.getVolume(),
					playbackRate: ImprovedTube.elements.player.getPlaybackRate(),
					title: document.title
				}));
			}
		} */
	}
});

/*--------------------------------------------------------------
# SEND
--------------------------------------------------------------*/

ImprovedTube.messages.send = function (message) {
	if (typeof message === 'object') {
		message = JSON.stringify(message);
	}

	this.queue.push(message);

	if (this.queue.length === 1) {
		this.element.textContent = message;

		document.dispatchEvent(new CustomEvent('it-message-from-youtube'));
	}
};
