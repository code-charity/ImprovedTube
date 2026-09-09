/*--------------------------------------------------------------
>>> GENERAL:
----------------------------------------------------------------
# YouTube home page
# Fold subscriptions' sections (collapsed accordion)
# Don't let a second video auto-start at once
# Add "Scroll to top"
# Confirmation before closing
# Default content country
# Add "Popup window" buttons
# Add "Watch Later" buttons
# Font
# Mark watched videos
# Track watched videos
# Thumbnails quality
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# YOUTUBE HOME PAGE
--------------------------------------------------------------*/

extension.features.youtubeHomePage = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.target) {
			var target = event.target;

			while (target.parentNode) {
				if (target.nodeName === 'A' && target.id === 'logo') {
					var option = extension.storage.get('youtube_home_page');

					if (option !== 'search') {
						event.preventDefault();
						event.stopPropagation();

						window.open(option, '_self');

						return false;
					}
				} else {
					target = target.parentNode;
				}
			}
		}
	} else if (anything === 'init') {
		extension.events.on('init', function (resolve) {
			if (/(www|m)\.youtube\.com\/?(\?|\#|$)/.test(location.href)) {
				chrome.storage.local.get('youtube_home_page', function (items) {
					var option = items.youtube_home_page;

					if (
						option === '/feed/trending' ||
						option === '/feed/subscriptions' ||
						option === '/feed/history' ||
						option === '/playlist?list=WL' ||
						option === '/playlist?list=LL' ||
						option === '/feed/library'
					) {
						location.replace(option);
					} else {
						resolve();
					}
				});
			} else {
				resolve();
			}
		}, {
			async: true,
			prepend: true
		});
	} else {
		var option = extension.storage.get('youtube_home_page');

		window.removeEventListener('click', this.youtubeHomePage);

		if (
			option === '/feed/trending' ||
			option === '/feed/subscriptions' ||
			option === '/feed/history' ||
			option === '/playlist?list=WL' ||
			option === '/playlist?list=LL' ||
			option === '/feed/library'
		) {
			window.addEventListener('click', this.youtubeHomePage, true);
		}
	}
};

/*--------------------------------------------------------------
# COLLAPSE OF SUBSCRIPTION SECTIONS
--------------------------------------------------------------*/

/**
 * Finds entries belonging to subscriptions in the sidebar.
 * @returns {Element[] | Error}
 */
function subscriptionEntries() {
	for (const section of document.querySelectorAll("ytd-guide-section-renderer")) {
		const headerLink = section.querySelector('a[href="/feed/channels"]');
		if (headerLink) { // Exists only in the subscriptions section
			const entries = Array.from(
				section.querySelectorAll("ytd-guide-entry-renderer")
			).filter(entry => entry.id !== "header-entry");
			return entries
		}
	};
	return new Error("Subscriptions section not found")
}

extension.features.collapseOfSubscriptionSections = function (event) {
	if (typeof event === "boolean") {
		subs = subscriptionEntries()
		if (subs instanceof Error) {
			console.error(subs.message)
			return
		}
		for (const sub of subs) {
			sub.style.display = event ? "none" : "block";
		}
		return
	}

	if (event instanceof Event) {
		var section,
			content;

		if (event.target) {
			var target = event.target;

			while (target.parentNode) {
				if (target.nodeName === 'YTD-ITEM-SECTION-RENDERER') {
					section = target;
				} else if (target.className && target.className.indexOf && target.className.indexOf('grid-subheader') !== -1) {
					content = target.nextElementSibling;
				}

				target = target.parentNode;
			}
		}

		if (section && content) {
			event.preventDefault();
			event.stopPropagation();

			if (section.className.indexOf('it-section-collapsed') === -1) {
				content.style.height = content.offsetHeight + 'px';
				content.style.transition = 'height 200ms';
			}

			setTimeout(function () {
				section.classList.toggle('it-section-collapsed');
			});

			return false;
		}
	} else {
		window.removeEventListener('click', this.collapseOfSubscriptionSections);

		if (
			extension.storage.get('collapse_of_subscription_sections') === true &&
			location.href.indexOf('feed/subscriptions') !== -1
		) {
			window.addEventListener('click', this.collapseOfSubscriptionSections, true);
		}
	}
};

/*--------------------------------------------------------------
# ONLY ONE PLAYER INSTANCE PLAYING
--------------------------------------------------------------*/

extension.features.onlyOnePlayerInstancePlaying = function () {
	if (extension.storage.get('only_one_player_instance_playing') === true) {
		var videos = document.querySelectorAll('video');

		for (var i = 0, l = videos.length; i < l; i++) {
			videos[i].pause();
		}
	}
};
/*--------------------------------------------------------------
# ADD "SCROLL TO TOP"
--------------------------------------------------------------*/
extension.features.addScrollToTop = function (event) {
	if (event instanceof Event) {
		if (window.scrollY > window.innerHeight / 2) {
			document.documentElement.setAttribute('it-scroll-to-top', 'true');
		} else {
			document.documentElement.removeAttribute('it-scroll-to-top');
		}
	} else {
		if (extension.storage.get('add_scroll_to_top') === true) {
			this.addScrollToTop.button = document.createElement('div');
			this.addScrollToTop.button.id = 'it-scroll-to-top';
			this.addScrollToTop.button.className = 'satus-div';
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('viewBox', '0 0 24 24');
			var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', 'M13 19V7.8l4.9 5c.4.3 1 .3 1.4 0 .4-.5.4-1.1 0-1.5l-6.6-6.6a1 1 0 0 0-1.4 0l-6.6 6.6a1 1 0 1 0 1.4 1.4L11 7.8V19c0 .6.5 1 1 1s1-.5 1-1z');
			svg.appendChild(path);
			this.addScrollToTop.button.appendChild(svg);
			window.addEventListener('scroll', function () { document.body.appendChild(extension.features.addScrollToTop.button); });
			this.addScrollToTop.button.addEventListener('click', function () {
				window.scrollTo(0, 0);
				document.getElementById('it-scroll-to-top')?.remove();
			});
		}
		if (extension.storage.get('add_scroll_to_top') === true) {
			window.addEventListener('scroll', extension.features.addScrollToTop);
		} else if (this.addScrollToTop.button) {
			window.removeEventListener('scroll', extension.features.addScrollToTop);
			this.addScrollToTop.button.remove();
		}
	}
};
/*--------------------------------------------------------------
# CONFIRMATION BEFORE CLOSING
--------------------------------------------------------------*/

extension.features.confirmationBeforeClosing = function () {
	window.onbeforeunload = function () {
		if (extension.storage.get('confirmation_before_closing') === true) {
			return 'You have attempted to leave this page. Are you sure?';
		}
	};
};

/*--------------------------------------------------------------
# DEFAULT CONTENT COUNTRY
--------------------------------------------------------------*/

extension.features.defaultContentCountry = function (changed) {
	var value = extension.storage.get('default_content_country');

	if (value) {
		if (value !== 'default') {
			var date = new Date();

			date.setTime(date.getTime() + 3.154e+10);

			document.cookie = 's_gl=' + value + '; path=/; domain=.youtube.com; expires=' + date.toGMTString();
		} else {
			document.cookie = 's_gl=0; path=/; domain=.youtube.com; expires=Thu, 01 Jan 1970 00:00:01 GMT';
		}
	}

	if (changed) {
		location.reload();
	}
};

/*--------------------------------------------------------------
# ADD "POPUP WINDOW" BUTTONS
--------------------------------------------------------------*/
extension.features.popupWindowButtons = function (event) {
	if (event instanceof Event) {
		if (event.type === 'mouseover') {
			if (event.target) {
				var target = event.target,
					detected = false;
				while (detected === false && target.parentNode) {
					if (target.className && typeof target.className === 'string' && ((
						target.id === 'thumbnail' && target.className.indexOf('ytd-thumbnail') !== -1 || target.className.indexOf('thumb-link') !== -1)
						|| (target.className.indexOf('video-preview') !== -1 || target.className.indexOf('ytp-inline-preview-scrim') !== -1 || target.className.indexOf('ytp-inline-preview-ui') !== -1)
					)) {
						if (!target.itPopupWindowButton) {
							target.itPopupWindowButton = document.createElement('button');
							target.itPopupWindowButton.className = 'it-popup-window';

							var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
							svg.setAttribute('viewBox', '0 0 24 24');
							var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							path.setAttribute('d', 'M19 7h-8v6h8V7zm2-4H3C2 3 1 4 1 5v14c0 1 1 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H3V5h18v14z');
							svg.appendChild(path);
							target.itPopupWindowButton.appendChild(svg);
							target.appendChild(target.itPopupWindowButton);

							target.itPopupWindowButton.addEventListener('click', function (event) {
								event.preventDefault();
								event.stopPropagation();
								var videoLink = extension.features.popupWindowButtons.findVideoLink(this.parentElement);
								if (!videoLink) return;
								try { this.dataset.id = videoLink.href.match(/(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/)[1] } catch (error) { console.log(error); return; };
								ytPlayer = document.querySelector("#movie_player");
								if (ytPlayer) { width = ytPlayer.offsetWidth * 0.65; height = ytPlayer.offsetHeight * 0.65 } else { width = innerWidth * 0.4; height = innerHeight * 0.4; }
								if (!ytPlayer) {
									let shorts = /short/.test(videoLink.href);
									let vertical = width / height < 1;
									if (!vertical && shorts) { width = height * 0.6 }
									if (vertical && !shorts) { height = width * 0.6 }
								}

								window.open('https://www.youtube.com/embed/' + this.dataset.id + '?autoplay=' + (extension.storage.get('player_autoplay_disable') ? '0' : '1'), '_blank', `directories=no,toolbar=no,location=no,menubar=no,status=no,titlebar=no,scrollbars=no,resizable=no,width=${width / 3},height=${height / 3}`);
								chrome.runtime.sendMessage({
									action: 'fixPopup',
									width: width,
									height: height,
									title: (videoLink.closest('ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer')?.querySelector('#video-title')?.textContent || videoLink.getAttribute('title') || document.title) + " - Youtube"
								})
							});
						}
						detected = true;
					}
					target = target.parentNode;
				}
			}
		}
	} else {
		if (extension.storage.get('popup_window_buttons') === true) {
			window.addEventListener('mouseover', this.popupWindowButtons, true);
		} else {
			window.removeEventListener('mouseover', this.popupWindowButtons, true);
		}
	}
};

extension.features.popupWindowButtons.findVideoLink = function (element) {
	if (!element) return null;

	if (element.href && /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/.test(element.href)) {
		return element;
	}

	return element.closest('a[href*="/watch"], a[href*="/shorts/"]')
		|| element.querySelector('a#thumbnail[href], a[href*="/watch"], a[href*="/shorts/"]')
		|| element.closest('ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer')?.querySelector('a#thumbnail[href], a[href*="/watch"], a[href*="/shorts/"]')
		|| null;
};
/*--------------------------------------------------------------
# ADD "WATCH LATER" BUTTONS
--------------------------------------------------------------*/
extension.features.watchLaterButtons = function (event) {
	function getVideoId(url) {
		if (!url) {
			return null;
		}

		var watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/),
			shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);

		return watchMatch ? watchMatch[1] : shortsMatch ? shortsMatch[1] : null;
	}

	function findThumbnail(target) {
		while (target && target.parentNode) {
			if (
				target.nodeName === 'A' &&
				target.href &&
				(
					target.id === 'thumbnail' ||
					(target.className && typeof target.className === 'string' && (target.className.indexOf('thumb-link') !== -1 || target.className.indexOf('ytLockupViewModelContentImage') !== -1))
				)
			) {
				return target;
			}

			target = target.parentNode;
		}
	}

	function findNativeWatchLaterButton(thumbnail) {
		var container = thumbnail.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-playlist-video-renderer, yt-lockup-view-model') || thumbnail,
			button = container.querySelector('button[aria-label*="Watch later" i], button[title*="Watch later" i]');

		if (button) {
			return button;
		}

		var fallbackButton = thumbnail.querySelector('ytd-thumbnail-overlay-toggle-button-renderer button');

		if (fallbackButton) {
			var label = (fallbackButton.getAttribute('aria-label') || '').toLowerCase(),
				title = (fallbackButton.getAttribute('title') || '').toLowerCase();

			if (
				label.indexOf('watch later') !== -1 ||
				title.indexOf('watch later') !== -1 ||
				(label.indexOf('queue') === -1 && title.indexOf('queue') === -1)
			) {
				return fallbackButton;
			}
		}
	}

	function getYtConfigValue(key) {
		var pattern = new RegExp('"' + key + '":"([^"]+)"'),
			scripts = document.scripts;

		for (var i = 0, l = scripts.length; i < l; i++) {
			var match = scripts[i].textContent.match(pattern);

			if (match) {
				return match[1];
			}
		}
	}

	function getYtConfigObject(key) {
		var pattern = new RegExp('"' + key + '":(\\{.*?\\}),"' + key.replace(/_CONTEXT$/, '') + '_'),
			scripts = document.scripts;

		for (var i = 0, l = scripts.length; i < l; i++) {
			var match = scripts[i].textContent.match(pattern);

			if (match) {
				try {
					return JSON.parse(match[1]);
				} catch (error) {
					console.warn('[ImprovedTube] Unable to parse YouTube config object:', key, error);
				}
			}
		}
	}

	function addWithInnertube(videoId, button) {
		var apiKey = getYtConfigValue('INNERTUBE_API_KEY'),
			context = getYtConfigObject('INNERTUBE_CONTEXT'),
			clientVersion = getYtConfigValue('INNERTUBE_CLIENT_VERSION');

		if (!context && clientVersion) {
			context = {
				client: {
					clientName: 'WEB',
					clientVersion: clientVersion
				}
			};
		}

		if (!apiKey || !context) {
			console.warn('[ImprovedTube] Unable to resolve Innertube API key/context for Watch Later button');
			button.dataset.state = 'unavailable';
			return;
		}

		button.dataset.state = 'loading';

		fetch('/youtubei/v1/browse/edit_playlist?key=' + apiKey, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				context: context,
				playlistId: 'WL',
				actions: [{
					action: 'ACTION_ADD_VIDEO',
					addedVideoId: videoId
				}]
			})
		}).then(function (response) {
			if (!response.ok) {
				console.warn('[ImprovedTube] Innertube Watch Later request failed with status:', response.status);
			}
			button.dataset.state = response.ok ? 'added' : 'unavailable';
		}).catch(function () {
			button.dataset.state = 'unavailable';
		});
	}

	function addWatchLaterButton(thumbnail) {
		var videoId = thumbnail ? getVideoId(thumbnail.href) : null,
			container = thumbnail ? thumbnail.parentElement : null;

		if (thumbnail && thumbnail.itWatchLaterButton && (!container || !container.contains(thumbnail.itWatchLaterButton))) {
			thumbnail.itWatchLaterButton = null;
		}

		if (thumbnail && videoId && container && !thumbnail.itWatchLaterButton) {
			var button = document.createElement('button'),
				svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
				path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

			button.type = 'button';
			button.className = 'it-watch-later-button';
			button.dataset.id = videoId;
			button.title = 'Watch later';
			button.setAttribute('aria-label', 'Add to Watch Later');

			svg.setAttribute('viewBox', '0 0 24 24');
			path.setAttribute('d', 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18.2A8.2 8.2 0 1 1 20.2 12 8.2 8.2 0 0 1 12 20.2Zm.7-13.2h-1.8v5.8l5 3 .9-1.5-4.1-2.4Z');
			svg.appendChild(path);
			button.appendChild(svg);
			// Append to the thumbnail's parent container (the renderer) rather than
			// the thumbnail anchor itself: YouTube marks the anchor with
			// aria-hidden="true", so injecting a focusable button as a direct child
			// triggers "Blocked aria-hidden on an element because its descendant
			// retained focus" in the console. Visual placement is unaffected because
			// the button is positioned absolutely relative to a higher ancestor.
			container.appendChild(button);
			thumbnail.itWatchLaterButton = button;

			button.addEventListener('click', function (clickEvent) {
				var nativeButton = findNativeWatchLaterButton(container),
					id = this.dataset.id;

				clickEvent.preventDefault();
				clickEvent.stopPropagation();
				clickEvent.stopImmediatePropagation();

				if (nativeButton && nativeButton !== this) {
					var initialAriaPressed = nativeButton.getAttribute('aria-pressed'),
						initialAriaLabel = nativeButton.getAttribute('aria-label'),
						buttonRef = this,
						attempts = 0;

					nativeButton.click();

					(function checkToggle() {
						var currentAriaPressed = nativeButton.getAttribute('aria-pressed'),
							currentAriaLabel = nativeButton.getAttribute('aria-label');

						if (currentAriaPressed !== initialAriaPressed || currentAriaLabel !== initialAriaLabel) {
							buttonRef.dataset.state = 'added';
						} else if (attempts < 10) {
							attempts++;
							setTimeout(checkToggle, 100);
						} else {
							addWithInnertube(id, buttonRef);
						}
					})();
				} else {
					addWithInnertube(id, this);
				}
			});
		}
	}

	function addWatchLaterButtons(root) {
		var thumbnails = (root || document).querySelectorAll ? (root || document).querySelectorAll('a#thumbnail, a.thumb-link, a.ytLockupViewModelContentImage') : [];

		for (var i = 0, l = thumbnails.length; i < l; i++) {
			addWatchLaterButton(thumbnails[i]);
		}
	}

	function removeWatchLaterButtons() {
		var buttons = document.querySelectorAll('.it-watch-later-button');

		for (var i = 0, l = buttons.length; i < l; i++) {
			if (buttons[i].parentElement) {
				buttons[i].parentElement.itWatchLaterButton = null;
			}

			buttons[i].remove();
		}
	}

	if (event instanceof Event) {
		if (event.type === 'mouseover' && event.target) {
			addWatchLaterButton(findThumbnail(event.target));
		}
	} else {
		var option = extension.storage.get('watch_later_buttons');

		window.removeEventListener('mouseover', this.watchLaterButtons, true);

		if (this.watchLaterButtons.observer) {
			this.watchLaterButtons.observer.disconnect();
			this.watchLaterButtons.observer = null;
		}

		if (!option || option === 'disabled') {
			removeWatchLaterButtons();
		} else if (option === 'hover' || option === 'always') {
			window.addEventListener('mouseover', this.watchLaterButtons, true);

			if (option === 'always') {
				if (document.body) {
					addWatchLaterButtons(document);
					this.watchLaterButtons.observer = new MutationObserver(function (mutationList) {
						for (var i = 0, l = mutationList.length; i < l; i++) {
							for (var j = 0, m = mutationList[i].addedNodes.length; j < m; j++) {
								addWatchLaterButtons(mutationList[i].addedNodes[j]);
							}
						}
					});
					this.watchLaterButtons.observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				} else {
					setTimeout(function () {
						extension.features.watchLaterButtons();
					}, 100);
				}
			}
		}
	}
};
/*--------------------------------------------------------------
# FONT
--------------------------------------------------------------*/

extension.features.font = function (changed) {
	var option = extension.storage.get('font');

	if (option && option !== 'Default') {
		var link = this.font.link || document.createElement('link'),
			style = this.font.style || document.createElement('style');

		link.rel = 'stylesheet';
		link.href = '//fonts.googleapis.com/css2?family=' + option;

		style.textContent = '*{font-family:"' + option.replace(/\+/g, ' ') + '" !important}';

		document.head.appendChild(link);
		document.head.appendChild(style);

		this.font.link = link;
		this.font.style = style;
	} else if (changed) {
		var link = this.font.link,
			style = this.font.style;

		if (link) {
			link.remove();
		}

		if (style) {
			style.remove();
		}
	}
};

/*--------------------------------------------------------------
# MARK WATCHED VIDEOS
--------------------------------------------------------------*/

extension.features.markWatchedVideos = function (anything) {
	if (anything instanceof Event) {
		var event = anything;

		if (event.type === 'mouseover') {
			if (event.target) {
				var target = event.target,
					detected = false;

				while (detected === false && target.parentNode) {
					if (
						target.className && target.className.indexOf &&
						(
							target.id === 'thumbnail' && target.className.indexOf('ytd-thumbnail') !== -1 ||
							target.className.indexOf('thumb-link') !== -1
						)
					) {
						if (!target.itMarkWatchedVideosButton) {
							target.itMarkWatchedVideosButton = document.createElement('button');
							target.itMarkWatchedVideosButton.className = 'it-mark-watched-videos';
							target.itMarkWatchedVideosButton.dataset.id = extension.functions.getUrlParameter(target.href, 'v');
							var id = target.itMarkWatchedVideosButton.dataset.id;
							var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24');
							var pathData = 'M12 15.15q1.525 0 2.588-1.063 1.062-1.062 1.062-2.587 0-1.525-1.062-2.588Q13.525 7.85 12 7.85q-1.525 0-2.587 1.062Q8.35 9.975 8.35 11.5q0 1.525 1.063 2.587Q10.475 15.15 12 15.15Zm0-.95q-1.125 0-1.912-.788Q9.3 12.625 9.3 11.5t.788-1.913Q10.875 8.8 12 8.8t1.913.787q.787.788.787 1.913t-.787 1.912q-.788.788-1.913.788Zm0 3.8q-3.1 0-5.688-1.613Q3.725 14.775 2.325 12q-.05-.1-.075-.225-.025-.125-.025-.275 0-.15.025-.275.025-.125.075-.225 1.4-2.775 3.987-4.388Q8.9 5 12 5q3.1 0 5.688 1.612Q20.275 8.225 21.675 11q.05.1.075.225.025.125.025.275 0 .15-.025.275-.025.125-.075.225-1.4 2.775-3.987 4.387Q15.1 18 12 18Z';
							var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							path.setAttribute('d', pathData + 'm0-6.5Zm0 5.5q2.825 0 5.188-1.488Q19.55 14.025 20.8 11.5q-1.25-2.525-3.612-4.013Q14.825 6 12 6 9.175 6 6.812 7.487 4.45 8.975 3.2 11.5q1.25 2.525 3.612 4.012Q9.175 17 12 17Z');
							svg.appendChild(path);
							var svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg2.setAttribute('viewBox', '0 0 24 24');
							var extraPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							extraPath.setAttribute('d', pathData);
							svg2.appendChild(extraPath);
							target.itMarkWatchedVideosButton.appendChild(svg);
							target.itMarkWatchedVideosButton.appendChild(svg2);
							if (extension.storage.get('watched') && extension.storage.get('watched')[id]) {
								target.itMarkWatchedVideosButton.setAttribute('watched', '')
							};
							target.appendChild(target.itMarkWatchedVideosButton);
							target.itMarkWatchedVideosButton.addEventListener('click', function (event) {
								var id = this.dataset.id,
									value = this.toggleAttribute('watched');

								event.preventDefault();
								event.stopPropagation();

								if (!extension.storage.watched) {
									extension.storage.watched = {};
								}

								if (value) {
									extension.storage.get('watched')[id] = {
										title: ''
									};
								} else {
									delete extension.storage.get('watched')[id];
								}

								chrome.storage.local.set({
									watched: extension.storage.get('watched')
								});
							});

						} else {
							var button = target.itMarkWatchedVideosButton;

							if (extension.storage.get('watched') && extension.storage.get('watched')[button.dataset.id]) {
								button.setAttribute('watched', '');
							} else {
								button.removeAttribute('watched');
							}
						}

						detected = true;
					}

					target = target.parentNode;
				}
			}
		}
	} else if (anything === true) {
		var buttons = document.querySelectorAll('.it-mark-watched-videos');

		for (var i = 0, l = buttons.length; i < l; i++) {
			var button = buttons[i];

			button.remove();
		}
	} else {
		window.removeEventListener('mouseover', this.markWatchedVideos, true);

		if (extension.storage.get('mark_watched_videos') === true) {
			window.addEventListener('mouseover', this.markWatchedVideos, true);
		}
	}
};

/*--------------------------------------------------------------
# TRACK WATCHED VIDEOS
--------------------------------------------------------------*/

extension.features.trackWatchedVideos = function () {
	if (extension.storage.get('track_watched_videos') === true && document.documentElement.getAttribute('it-pathname').indexOf('/watch') === 0) {
		var id = extension.functions.getUrlParameter(location.href, 'v');

		if (!extension.storage.watched) {
			extension.storage.watched = {};
		}

		extension.storage.get('watched')[id] = {
			title: document.title
		};

		chrome.storage.local.set({
			watched: extension.storage.get('watched')
		});
	}
};

/*--------------------------------------------------------------
# THUMBNAILS QUALITY
--------------------------------------------------------------*/
extension.features.thumbnailsQuality = function (anything) {

    var option = extension.storage.get('thumbnails_quality');
    var qualityRegex = /(default\.jpg|mqdefault\.jpg|hqdefault\.jpg|hq720\.jpg|sddefault\.jpg|maxresdefault\.jpg)/;

    // Extracts the unique 11-character YouTube Video ID from an image URL
    function getVideoId(url) {
        if (!url) return null;
        // Matches standard /vi/ and modern /vi_webp/ paths
        var match = url.match(/\/vi(?:_webp)?\/([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    }

    function handler(thumbnail) {
        if (!thumbnail.dataset.defaultSrc && qualityRegex.test(thumbnail.src)) {

            var originalSrc = thumbnail.src;
            thumbnail.dataset.defaultSrc = originalSrc;

            // Strip query parameters (?sqp=...) which often block maxresdefault upgrades
            var cleanSrc = originalSrc.split('?')[0];
            var newSrc = cleanSrc.replace(qualityRegex, option + '.jpg');

            var tempImg = new Image();

            tempImg.onload = function () {
                // Ensure DOM element hasn't been recycled while downloading
                if (thumbnail.dataset.defaultSrc === originalSrc && this.naturalHeight > 90) {
                    thumbnail.src = newSrc;
                }
                tempImg.onload = null;
                tempImg.onerror = null;
            };

            tempImg.onerror = function () {
                tempImg.onload = null;
                tempImg.onerror = null;
            };

            tempImg.src = newSrc;
        }
    }

    if (['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'].includes(option)) {
        let thumbnails = document.querySelectorAll('img');

        for (let i = 0; i < thumbnails.length; i++) {
            handler(thumbnails[i]);
        }

        if (this.thumbnailsQuality.observer) {
            this.thumbnailsQuality.observer.disconnect();
            this.thumbnailsQuality.observer = null;
        }

        this.thumbnailsQuality.observer = new MutationObserver(function (mutationList) {
            for (let i = 0; i < mutationList.length; i++) {
                let mutation = mutationList[i];

                // Handle brand new DOM injections (Infinite Scroll)
                if (mutation.type === 'childList') {
                    for (let j = 0; j < mutation.addedNodes.length; j++) {
                        let node = mutation.addedNodes[j];
                        if (node.nodeName === 'IMG') {
                            handler(node);
                        } else if (node.querySelectorAll) {
                            let nestedImgs = node.querySelectorAll('img');
                            for (let k = 0; k < nestedImgs.length; k++) {
                                handler(nestedImgs[k]);
                            }
                        }
                    }
                }

                // Handle recycled DOM nodes (src attribute swap)
                if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                    if (mutation.target.tagName !== 'IMG') continue;

                    let target = mutation.target;

                    // Identity Check (Has YouTube repurposed this <img> for a new video?)
                    if (target.dataset.defaultSrc) {
                        let storedId = getVideoId(target.dataset.defaultSrc);
                        let currentId = getVideoId(target.src);

                        // If the IDs differ (or aren't standard videos), clear the poisoned state
                        if (storedId !== currentId) {
                            target.removeAttribute('data-default-src');
                        }
                    }

                    handler(target);
                }
            }
        });

        this.thumbnailsQuality.observer.observe(document.documentElement, {
            attributeFilter: ['src'],
            attributes: true,
            childList: true,
            subtree: true
        });

    } else if (anything === true) {
        let thumbnails = document.querySelectorAll('img[data-default-src]');

        for (let i = 0; i < thumbnails.length; i++) {
            let thumbnail = thumbnails[i];
            thumbnail.src = thumbnail.dataset.defaultSrc;
            thumbnail.removeAttribute('data-default-src');
        }

        if (this.thumbnailsQuality.observer) {
            this.thumbnailsQuality.observer.disconnect();
            this.thumbnailsQuality.observer = null;
        }
    }
};

/*--------------------------------------------------------------
# DISABLE VIDEO PLAYBACK ON HOVER
--------------------------------------------------------------*/
extension.features.disableThumbnailPlayback = function (event) {
	if (event instanceof Event) {
		if (event.composedPath().some(elem => (elem.matches != null && elem.matches(
			'#content.ytd-rich-item-renderer, #contents.ytd-item-section-renderer, #dismissible.ytd-compact-video-renderer'
		)))) {
			event.stopImmediatePropagation();
		}
	} else {
		if (extension.storage.get('disable_thumbnail_playback') === true) {
			window.addEventListener('mouseenter', this.disableThumbnailPlayback, true);
		} else {
			window.removeEventListener('mouseenter', this.disableThumbnailPlayback, true);
		}
	}
};

/*--------------------------------------------------------------
# MUTE THUMBNAIL PREVIEWS
--------------------------------------------------------------*/
extension.features.muteThumbnailPreviews = function () {
if (extension.storage.get('mute_thumbnail_previews') === true) {
	var PREVIEW_SELECTORS = '#inline-preview-player, ytd-video-preview, .ytd-video-preview, .ytp-inline-preview';

	function isPreviewVideo(video) {
		return video && video.closest && video.closest(PREVIEW_SELECTORS);
	}

	function forceMute(video) {
		if (!video.muted) {
			video.muted = true;
		}
		// Attach a listener to re-mute if YouTube tries to unmute
		if (!video._itMuteEnforced) {
			video._itMuteEnforced = true;
			video.addEventListener('volumechange', function () {
				if (!this.muted && isPreviewVideo(this)) {
					this.muted = true;
				}
			});
			// Also re-mute on play in case audio is restored
			video.addEventListener('play', function () {
				if (!this.muted && isPreviewVideo(this)) {
					this.muted = true;
				}
			});
		}
	}

	function mutePreviewVideos(root) {
		if (!root || !root.querySelectorAll) return;
		var videos = root.querySelectorAll('video');
		for (var i = 0; i < videos.length; i++) {
			if (isPreviewVideo(videos[i])) {
				forceMute(videos[i]);
			}
		}
	}


		// Mute any currently existing preview videos
		mutePreviewVideos(document);

		// Observe for new preview videos and attribute changes
		if (!this.muteThumbnailPreviews.observer) {
			this.muteThumbnailPreviews.observer = new MutationObserver(function (mutationList) {
				for (var i = 0, l = mutationList.length; i < l; i++) {
					var mutation = mutationList[i];

					// Handle new nodes being added (new hover previews)
					for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
						var node = mutation.addedNodes[j];
						if (node.nodeType === 1) {
							if (node.nodeName === 'VIDEO' && isPreviewVideo(node)) {
								forceMute(node);
							}
							mutePreviewVideos(node);
						}
					}

					// Handle attribute changes (e.g. src change = new video loaded in same element)
					if (mutation.type === 'attributes' && mutation.target.nodeName === 'VIDEO') {
						if (isPreviewVideo(mutation.target)) {
							forceMute(mutation.target);
						}
					}
				}
			});

			this.muteThumbnailPreviews.observer.observe(document.documentElement, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: ['src']
			});
		}
	} else {
		if (this.muteThumbnailPreviews.observer) {
			this.muteThumbnailPreviews.observer.disconnect();
			this.muteThumbnailPreviews.observer = null;
		}
	}
};

/*--------------------------------------------------------------
# OPEN VIDEOS IN A NEW TAB
--------------------------------------------------------------*/

extension.features.openNewTab = function () {
	if (extension.storage.get("open_new_tab") === true) {
		window.onload = function () {
			const searchButton = document.querySelector("button#search-icon-legacy");
			const inputField = document.querySelector("input#search");

			searchButton.addEventListener("mousedown", (event) => {
				performSearchNewTab(inputField.value);
			});
			inputField.addEventListener("keydown", function (event) {
				if (event.key === "Enter") {
					performSearchNewTab(inputField.value);
				}
			});

			let searchedAlready = false;
			inputField.addEventListener("focus", function () {
				searchedAlready = false;
				const observer = new MutationObserver(applySuggestionListeners);
				const container = document.querySelector("div[style*='position: fixed'] ul[role='listbox']");
				if (container) observer.observe(container, { attributes: true, childList: true, subtree: true });
			});

			inputField.addEventListener("input", () => searchedAlready = false);

			function applySuggestionListeners() {
				const suggestionContainers = document.querySelectorAll("div[class^='sbqs'], div[class^='sbpqs']");
				suggestionContainers.forEach((suggestionsContainer) => {
					suggestionsContainer.addEventListener("mousedown", (event) => {
						const suggestionListItem = event.target.closest("li[role='presentation']");
						if (suggestionListItem && !searchedAlready) {
							const query = suggestionListItem.querySelector("b").textContent
							performSearchNewTab(inputField.value + query);
							searchedAlready = true;
						}
					});
				});
			}

			function performSearchNewTab(query) {
				inputField.value = "";
				inputField.focus();
				const newTabURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
				window.open(newTabURL, '_blank');
			}
		}
	}
}

/*--------------------------------------------------------------
# REMOVE &list=... WHEN OPENING VIDEOS IN NEW TAB
--------------------------------------------------------------*/
extension.features.removeListParamOnNewTab = function () {
	// 옵션이 켜져있지 않으면 종료
	if (extension.storage.get("remove_list_param_from_links") !== true) {
		return;
	}
	// 이전에 등록된 핸들러가 있다면 제거
	if (this._removeListParamHandler) {
		document.removeEventListener('click', this._removeListParamHandler, true);
	}
	// 새로운 핸들러 정의
	this._removeListParamHandler = function (event) {
		if (event.ctrlKey || event.metaKey || event.button === 1) {
			let anchor = event.target;
			while (anchor && anchor.tagName !== 'A') {
				anchor = anchor.parentElement;
			}
			if (
				anchor &&
				anchor.href &&
				anchor.href.includes('watch?v=') &&
				anchor.href.includes('&list=')
			) {
				event.preventDefault();
				const cleaned = anchor.href.replace(/&list=[^&]+/, '');
				window.open(cleaned, '_blank');
			}
		}
	};

	// 핸들러 등록
	document.addEventListener('click', this._removeListParamHandler, true);
};

extension.features.removeListParamOnNewTab();

/*--------------------------------------------------------------
# CLICKABLE LINKS IN VIDEO DESCRIPTIONS
--------------------------------------------------------------*/
extension.features.clickableLinksInVideoDescriptions = function () {
	if (extension.storage.get("clickable_links_in_description") !== true) {
		return;
	}

	document.addEventListener("contextmenu", (e) => {
		// Check if the clicked element is a yt-formatted-string with the class we're targeting
		const clickedElement = e.target.closest(".style-scope.ytd-video-renderer");

		if (clickedElement) {
			// Grab the plain text inside the yt-formatted-string (looking for links or URLs)
			const textContent = clickedElement.innerText;

			// Extract URL using a simple regex (you can customize it to be more accurate)
			const urlRegex = /\bhttps?:\/\/[^\s]+/g;
			const match = textContent.match(urlRegex);

			if (match) {
				// Copy the found URL to the clipboard
				navigator.clipboard.writeText(match[0]).catch((err) => {
					console.error("Failed to copy: ", err);
				});

				// Prevent the default right-click menu from showing
				e.preventDefault();
			}
			// If no URL found, the normal right-click behavior will happen
		}
	});
}

/*--------------------------------------------------------------
# CHANGE THE NUMBER OF THUMBNAILS PER ROW
--------------------------------------------------------------*/
extension.features.changeThumbnailsPerRow = async function () {
	var value = await extension.storage.get('change_thumbnails_per_row');

	if (!value || value === 'null' || value === 'default')
		return;

	const applyGridLayout = () => {
		//Check if we are on the subscriptions page
		if (location.href.indexOf('feed/subscriptions') !== -1) {
			document.querySelectorAll('[style]').forEach(el => {
				if (el.style.getPropertyValue('--ytd-rich-grid-items-per-row')) {
					el.style.setProperty('--ytd-rich-grid-items-per-row', value);
					el.style.setProperty('--ytd-rich-grid-item-min-width', '220px');
					el.style.setProperty('--ytd-rich-grid-item-max-width', '1fr');
				}
			});
		} else {
			const grid = document.querySelector('ytd-rich-grid-renderer');
			if (grid) {
				// Apply custom values
				grid.style.setProperty('--ytd-rich-grid-items-per-row', value);
				grid.style.setProperty('--ytd-rich-grid-item-min-width', '220px');
				grid.style.setProperty('--ytd-rich-grid-item-max-width', '1fr');
			}
			const shelf = document.querySelector('ytd-rich-shelf-renderer');
			if (shelf) {
				// Apply custom values
				shelf.style.setProperty('--ytd-rich-grid-items-per-row', value);
			}
		}
	};

	// Apply initially
	applyGridLayout();

	// Reapply when YouTube replaces content
	const observer = new MutationObserver(applyGridLayout);
	observer.observe(document.body, { childList: true, subtree: true });
};

/*--------------------------------------------------------------
# HIDE SPONSORED VIDEOS ON HOME PAGE
--------------------------------------------------------------*/

// extension.features.hideSponsoredVideosOnHome = function () {
// 	if (!extension.storage.get('hide_sponsored_videos_home')) return;
// 	console.log('[ImprovedTube] Hiding sponsored videos on Home');
// 	const hideSponsored = () => {
// 		document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer').forEach((el) => {
// 			const text = el.innerText || '';
// 			if (/sponsored/i.test(text)) {
// 				el.style.display = 'none';
// 			}
// 		});
// 	};
// 	hideSponsored(); // Initial run
// 	const observer = new MutationObserver(hideSponsored);
// 	const pageManager = document.querySelector('ytd-page-manager') || document.body;
// 	if (pageManager) {
// 		observer.observe(pageManager, {
// 			childList: true,
// 			subtree: true
// 		});
// 	}
// };

/*--------------------------------------------------------------
# REMOVE MEMBER ONLY VIDEOS FROM HOME PAGE
--------------------------------------------------------------*/
extension.features.removeMemberOnly = function () {
	if (extension.storage.get('remove_member_only')) {
		const style = document.createElement('style');
		style.id = 'remove-member-only-style';
		style.textContent = `
			badge-shape.yt-badge-shape--membership {
				display: none !important;
			}
			ytd-grid-video-renderer:has(badge-shape.yt-badge-shape--membership),
			ytd-rich-item-renderer:has(badge-shape.yt-badge-shape--membership),
			yt-lockup-view-model:has(badge-shape.yt-badge-shape--membership) {
				display: none !important;
			}
		`;
		document.head.appendChild(style);
	}

};

/*--------------------------------------------------------------
# HIDE 'WATCH LATER' VIDEOS
--------------------------------------------------------------*/
extension.features.hideWatchLater = function () {
	// Check if settings are ready
	const setting = extension.storage.get('hide_watch_later');

	if (setting === undefined) {
		setTimeout(extension.features.hideWatchLater, 100);
		return;
	}

	if (setting !== true) {
		return;
	}

	let watchLaterIds = new Set();
	let isFetching = false;

	function fetchWatchLaterList() {
		if (isFetching || watchLaterIds.size > 0) return;
		isFetching = true;

		fetch('https://www.youtube.com/playlist?list=WL')
			.then(res => res.text())
			.then(text => {
				const matches = text.match(/"videoId":"(.*?)"/g);
				if (matches) {
					const cleanIds = matches.map(item => item.split('"')[3]);
					watchLaterIds = new Set(cleanIds);
					hideVideos();
				}
			})
			.catch(err => console.error('[ImprovedTube] Fetch Error:', err))
			.finally(() => isFetching = false);
	}

	function hideVideos() {
		if (watchLaterIds.size === 0) return;
		const videos = document.querySelectorAll('ytd-rich-item-renderer, yt-lockup-view-model');
		videos.forEach(video => {
			const link = video.querySelector('a#thumbnail, a');
			if (link && link.href && link.href.includes('v=')) {
				const videoId = link.href.split('v=')[1].split('&')[0];
				if (watchLaterIds.has(videoId)) {
					video.style.display = 'none';
				}
			}
		});
	}

	// Standard "Body Check" to make sure page exists
	function init() {
		if (!document.body) {
			setTimeout(init, 100);
			return;
		}
		fetchWatchLaterList();
		const observer = new MutationObserver(() => {
			if (watchLaterIds.size > 0) hideVideos();
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	init();
};

// Start the check
extension.features.hideWatchLater();

/*--------------------------------------------------------------
# AUTO VIDEO RECOVERY
--------------------------------------------------------------*/

extension.features.autoVideoRecovery = function () {
    var feature = extension.features.autoVideoRecovery,
        previousState = feature.state,
        STALL_GRACE_MS = 8000,
        NO_PROGRESS_MS = 10000,
        RELOAD_DELAY_MS = 2000,
        RELOAD_AFTER_ATTEMPTS = 3,
        MAX_RETRY_DELAY_MS = 30000;

    function clearTimer(state, name) {
        if (state[name]) {
            clearTimeout(state[name]);
            state[name] = null;
        }
    }

    function detachVideo(state) {
        if (!state.video || !state.handlers) return;

        for (var eventName in state.handlers) {
            state.video.removeEventListener(eventName, state.handlers[eventName]);
        }

        state.video = null;
        state.handlers = null;
    }

    function cleanup(state) {
        if (!state) return;

        state.active = false;
        clearTimer(state, 'monitorTimer');
        clearTimer(state, 'attachTimer');
        clearTimer(state, 'reloadTimer');

        if (state.observer) state.observer.disconnect();
        if (state.onlineHandler) window.removeEventListener('online', state.onlineHandler);
        if (state.reloadCleanup) state.reloadCleanup();

        detachVideo(state);
    }

    cleanup(previousState);
    feature.state = null;

    if (extension.storage.get('auto_video_recovery') !== true) {
        return;
    }

    var state = {
        active: true,
        attempts: 0,
        attachTimer: null,
        hasPlaybackProgress: false,
        handlers: null,
        hadMediaError: false,
        lastErrorAt: 0,
        lastProgressAt: 0,
        lastTime: null,
        monitorTimer: null,
        nextAttemptAt: 0,
        observer: null,
        onlineHandler: null,
        reloadCleanup: null,
        reloadTimer: null,
        reloading: false,
        shouldResume: false,
        stalledAt: 0,
        video: null
    };

    feature.state = state;

    function getVideo() {
        return document.querySelector('#movie_player video.html5-main-video, #movie_player video') ||
            document.querySelector('video.html5-main-video') || document.querySelector('video');
    }

    function stopMonitoring() {
        clearTimer(state, 'monitorTimer');
    }

    function noteProgress() {
        state.hasPlaybackProgress = true;
        state.hadMediaError = false;
        state.stalledAt = 0;
        state.lastErrorAt = 0;
        state.attempts = 0;
        state.nextAttemptAt = 0;
        state.lastProgressAt = Date.now();
        stopMonitoring();
    }

    function scheduleMonitor(delay) {
        if (!state.active || state.monitorTimer) return;

        state.monitorTimer = setTimeout(function () {
            state.monitorTimer = null;
            attemptRecovery();
        }, delay);
    }

    function markStalled(video) {
        // `waiting` is normal while YouTube starts a video. Only recover a stream
        // that has actually made progress and then stopped advancing.
        if (!state.active || video !== state.video || video.ended || video.paused || !state.hasPlaybackProgress) return;

        state.shouldResume = true;
        if (!state.stalledAt) state.stalledAt = Date.now();
        scheduleMonitor(STALL_GRACE_MS);
    }

    function restorePlaybackAfterReload(video, resumeAt) {
        var completed = false;

        function scheduleResumeRetry() {
            if (!state.active || video !== state.video || !state.shouldResume) return;

            state.stalledAt = state.stalledAt || Date.now();
            scheduleMonitor(Math.max(1000, state.nextAttemptAt - Date.now()));
        }

        function finish() {
            if (completed) return;
            completed = true;
            clearTimer(state, 'reloadTimer');
            video.removeEventListener('canplay', finish);
            state.reloadCleanup = null;
            state.reloading = false;

            if (!state.active || video !== state.video || !state.shouldResume) return;

            if (Number.isFinite(resumeAt) && resumeAt > 0 && (!Number.isFinite(video.duration) || resumeAt < video.duration)) {
                try { video.currentTime = resumeAt; } catch (_) { }
            }

            var playResult;
            try {
                playResult = video.play();
            } catch (_) {
                scheduleResumeRetry();
                return;
            }

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    // `load()` can abort a pending play request. This is expected
                    // during recovery, so retry quietly instead of logging an error.
                    scheduleResumeRetry();
                });
            }
        }

        state.reloadCleanup = function () {
            video.removeEventListener('canplay', finish);
        };
        video.addEventListener('canplay', finish);
        state.reloadTimer = setTimeout(finish, 5000);

        try {
            video.load();
        } catch (_) {
            finish();
            scheduleResumeRetry();
        }
    }

    function reloadVideo(video, resumeAt) {
        if (!state.active || state.reloading || video !== state.video) return;

        state.reloading = true;
        restorePlaybackAfterReload(video, resumeAt);
    }

    function attemptRecovery() {
        var video = state.video,
            now = Date.now(),
            noProgress;

        if (!state.active || !video || video.ended || !state.shouldResume) return;

        if (!navigator.onLine) {
            scheduleMonitor(1000);
            return;
        }

        noProgress = state.hasPlaybackProgress && !video.paused && state.lastProgressAt && now - state.lastProgressAt >= NO_PROGRESS_MS;
        if (!state.stalledAt && !noProgress) return;

        if (now < state.nextAttemptAt) {
            scheduleMonitor(state.nextAttemptAt - now);
            return;
        }

        state.attempts++;
        state.nextAttemptAt = now + Math.min(MAX_RETRY_DELAY_MS, 1000 * Math.pow(2, Math.min(state.attempts, 5)));

        var position = video.currentTime,
            playResult;

        function retryOrReload() {
            if (!state.active || state.video !== video || !state.shouldResume) return;

            if (state.hadMediaError || state.attempts >= RELOAD_AFTER_ATTEMPTS) {
                reloadVideo(video, position);
            } else {
                scheduleMonitor(Math.max(1000, state.nextAttemptAt - Date.now()));
            }
        }

        try {
            playResult = video.play();
        } catch (_) {
            retryOrReload();
            return;
        }

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                retryOrReload();
            });
        }

        setTimeout(function () {
            var stillStalled = state.active && state.video === video && state.shouldResume && !video.ended &&
                !video.paused && (state.stalledAt || (state.lastProgressAt && Date.now() - state.lastProgressAt >= NO_PROGRESS_MS));

            // Reloading the media element is disruptive and can restart normal
            // startup buffering. Reserve it for a real media error or several
            // failed, confirmed recovery attempts.
            if (stillStalled && (state.hadMediaError || state.attempts >= RELOAD_AFTER_ATTEMPTS)) {
                reloadVideo(video, position);
            }
        }, RELOAD_DELAY_MS);

        scheduleMonitor(state.nextAttemptAt - now);
    }

    function attachVideo(video) {
        if (!state.active || !video || state.video === video) return;

        detachVideo(state);
        state.video = video;
        state.lastTime = video.currentTime;
        state.lastProgressAt = Date.now();
        state.hasPlaybackProgress = false;
        state.hadMediaError = false;
        state.shouldResume = !video.paused && !video.ended;

        state.handlers = {
            play: function () {
                state.shouldResume = true;
                state.lastProgressAt = Date.now();
            },
            loadedmetadata: function () {
                // YouTube usually reuses the same <video> node between videos.
                // Do not carry the previous video's playback state into startup.
                state.hasPlaybackProgress = false;
                state.hadMediaError = false;
                state.lastTime = video.currentTime;
                state.lastProgressAt = Date.now();
                state.stalledAt = 0;
                state.attempts = 0;
                stopMonitoring();
            },
            playing: noteProgress,
            timeupdate: function () {
                if (video.currentTime !== state.lastTime) {
                    state.lastTime = video.currentTime;
                    noteProgress();
                }
            },
            waiting: function () { markStalled(video); },
            stalled: function () { markStalled(video); },
            error: function () {
                if (state.shouldResume || !video.paused) {
                    state.shouldResume = true;
                    state.hadMediaError = true;
                    state.lastErrorAt = Date.now();
                    state.stalledAt = Date.now();
                    scheduleMonitor(STALL_GRACE_MS);
                }
            },
            pause: function () {
                // A media error can be followed immediately by a pause event.
                // Do not mistake that pause for the user's explicit pause.
                if (!state.reloading && (!state.lastErrorAt || Date.now() - state.lastErrorAt > 1000)) {
                    state.shouldResume = false;
                    state.stalledAt = 0;
                    state.attempts = 0;
                    stopMonitoring();
                }
            },
            ended: function () {
                state.shouldResume = false;
                state.stalledAt = 0;
                stopMonitoring();
            }
        };

        for (var eventName in state.handlers) {
            video.addEventListener(eventName, state.handlers[eventName]);
        }
    }

    function queueVideoAttachment() {
        if (!state.active || state.attachTimer) return;

        state.attachTimer = setTimeout(function () {
            state.attachTimer = null;
            attachVideo(getVideo());
        }, 50);
    }

    attachVideo(getVideo());

    state.onlineHandler = function () {
        if (!state.active || !state.shouldResume) return;

        state.nextAttemptAt = 0;
        scheduleMonitor(250);
    };
    window.addEventListener('online', state.onlineHandler);

    state.observer = new MutationObserver(queueVideoAttachment);
    state.observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
};
