/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
extension.features.youtubeHomePage('init');

document.documentElement.setAttribute('it-pathname', location.pathname);

window.addEventListener('yt-navigate-finish', function () {
	document.documentElement.setAttribute('it-pathname', location.pathname);

	extension.features.trackWatchedVideos();
	extension.features.thumbnailsQuality();
	extension.features.stickyNavigation();
	extension.features.hideSponsoredVideosOnHome?.();
});

extension.messages.create();
extension.messages.listener();

extension.events.on('init', function (resolve) {
	extension.storage.listener();
	extension.storage.load(function () {
		resolve();
	});
}, {
	async: true
});

function bodyReady() {
	if (extension.ready && extension.domReady) {
		extension.features.addScrollToTop();
		extension.features.font();
		extension.features.changeThumbnailsPerRow?.();
		extension.features.clickableLinksInVideoDescriptions();
	}
}

extension.events.on('init', function () {
	extension.features.bluelight();
	extension.features.dim();
	extension.features.youtubeHomePage();
	extension.features.collapseOfSubscriptionSections();
	extension.features.confirmationBeforeClosing();
	extension.features.defaultContentCountry();
	extension.features.popupWindowButtons();
	extension.features.disableThumbnailPlayback();
	extension.features.markWatchedVideos();
	extension.features.relatedVideos();
	extension.features.stickyNavigation();
	extension.features.liveChat();
	extension.features.comments();
	extension.features.openNewTab();
	extension.features.removeListParamOnNewTab();
	extension.features.removeMemberOnly();
	extension.features.channelMarker();

	// extension.features.hideSponsoredVideosOnHome?.();	
	bodyReady();
});

chrome.runtime.sendMessage({
	action: 'tab-connected'
}, function (response) {
	if (response) {
		extension.tabId = response.tabId;
	}
});

extension.inject([
	'/js&css/web-accessible/core.js',
	'/js&css/web-accessible/functions.js',
	'/js&css/web-accessible/www.youtube.com/appearance.js',
	'/js&css/web-accessible/www.youtube.com/themes.js',
	'/js&css/web-accessible/www.youtube.com/player.js',
	'/js&css/web-accessible/www.youtube.com/playlist.js',
	'/js&css/web-accessible/www.youtube.com/playlist-complete-playlist.js',
	'/js&css/web-accessible/www.youtube.com/channel.js',
	'/js&css/web-accessible/www.youtube.com/shortcuts.js',
	'/js&css/web-accessible/www.youtube.com/blocklist.js',
	'/js&css/web-accessible/www.youtube.com/settings.js',
	'/js&css/web-accessible/www.youtube.com/last-watched-overlay.js',  // Neue Zeile hinzufügen
	'/js&css/web-accessible/www.youtube.com/return-youtube-dislike.js',
	'/js&css/web-accessible/www.youtube.com/return-youtube-dislike.css',
	'/js&css/web-accessible/init.js'
], function () {
	extension.ready = true;

	extension.events.trigger('init');
});

document.addEventListener('DOMContentLoaded', function () {
	extension.domReady = true;

	bodyReady();
});

chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
	if (request.action === 'focus') {
		extension.messages.send({
			focus: true
		});
	} else if (request.action === 'blur') {
		extension.messages.send({
			blur: true
		});
	} else if (request.action === 'pause') {
		extension.messages.send({
			pause: true
		});
	} else if (request.action === 'set-volume') {
		extension.messages.send({
			setVolume: request.value
		});
	} else if (request.action === 'set-playback-speed') {
		extension.messages.send({
			setPlaybackSpeed: request.value
		});
	} else if (request.action === 'mixer') {
		extension.messages.send({
			mixer: true
		}, sendResponse, 'mixer');

		return true;
	} else if (request.action === 'delete-youtube-cookies') {
		extension.messages.send({
			deleteCookies: true
		});
	} else if (request.action === "another-video-started-playing") {
		extension.features.onlyOnePlayerInstancePlaying();
	}
});

document.addEventListener('it-message-from-youtube', function () {
	var provider = document.querySelector('#it-messages-from-youtube');

	if (provider) {
		var message = provider.textContent;

		document.dispatchEvent(new CustomEvent('it-message-from-youtube--readed'));

		try {
			message = JSON.parse(message);
		} catch (error) {
			console.log(error);
		}

		//console.log(message);

		if (message.requestOptionsUrl === true) {
			extension.messages.send({
				responseOptionsUrl: chrome.runtime.getURL('menu/index.html')
			});
		} else if (message.onlyOnePlayer === true) {
			chrome.runtime.sendMessage({
				name: 'only-one-player'
			});
		} else if (message.action === 'fixPopup') {
			chrome.runtime.sendMessage({
				action: 'fixPopup',
				width: message.width,
				height: message.height,
				title: message.title,
			});
		} else if (message.action === 'analyzer') {
			if (extension.storage.data.analyzer_activation === true) {
				var data = message.name,
					date = new Date().toDateString(),
					hours = new Date().getHours() + ':00';

				if (!extension.storage.data.analyzer) {
					extension.storage.data.analyzer = {};
				}

				if (!extension.storage.data.analyzer[date]) {
					extension.storage.data.analyzer[date] = {};
				}

				if (!extension.storage.data.analyzer[date][hours]) {
					extension.storage.data.analyzer[date][hours] = {};
				}

				if (!extension.storage.data.analyzer[date][hours][data]) {
					extension.storage.data.analyzer[date][hours][data] = 0;
				}

				extension.storage.data.analyzer[date][hours][data]++;

				chrome.storage.local.set({
					analyzer: extension.storage.data.analyzer
				});
			}
		} else if (message.action === 'blocklist') {
			if (!extension.storage.data.blocklist || typeof extension.storage.data.blocklist !== 'object') {
				extension.storage.data.blocklist = { videos: {}, channels: {} };
			}

			switch (message.type) {
				case 'channel':
					if (!extension.storage.data.blocklist.channels || typeof extension.storage.data.blocklist.channels !== 'object') {
						extension.storage.data.blocklist.channels = {};
					}
					if (message.added) {
						extension.storage.data.blocklist.channels[message.id] = {
							title: message.title,
							preview: message.preview,
							when: message.when
						}
					} else {
						delete extension.storage.data.blocklist.channels[message.id];
					}
					break

				case 'video':
					if (!extension.storage.data.blocklist.videos || typeof extension.storage.data.blocklist.videos !== 'object') {
						extension.storage.data.blocklist.videos = {};
					}
					if (message.added) {
						extension.storage.data.blocklist.videos[message.id] = {
							title: message.title,
							when: message.when
						}
					} else {
						delete extension.storage.data.blocklist.videos[message.id];
					}
					break
			}

			chrome.storage.local.set({
				blocklist: extension.storage.data.blocklist
			});
		} else if (message.action === 'watched') {
			if (!extension.storage.data.watched || typeof extension.storage.data.watched !== 'object') {
				extension.storage.data.watched = {};
			}

			if (message.type === 'add') {
				extension.storage.data.watched[message.id] = {
					title: message.title
				};
			}

			if (message.type === 'remove') {
				delete extension.storage.data.watched[message.id];
			}

			chrome.storage.local.set({
				watched: extension.storage.data.watched
			});
		} else if (message.action === 'set') {
			if (message.value) {
				chrome.storage.local.set({ [message.key]: message.value });
			} else {
				chrome.storage.local.remove([message.key]);
			}
		}
	}
});

document.addEventListener('it-play', function () {
	// var videos = document.querySelectorAll('video');
	try {
		chrome.runtime.sendMessage({ action: 'play' })
	} catch (error) { console.log(error); setTimeout(function () { try { chrome.runtime.sendMessage({ action: 'play' }, function (response) { console.log(response) }); } catch { } }, 321) }
});
