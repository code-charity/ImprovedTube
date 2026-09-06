const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Video owner channel link refresh (#1485)', () => {
	let channelName;
	let link;

	beforeEach(() => {
		link = {
			href: 'https://www.youtube.com/@previous/videos'
		};
		channelName = {
			nodeName: 'YTD-CHANNEL-NAME',
			querySelector: jest.fn(() => link),
			__data: {
				data: {
					runs: [{
						navigationEndpoint: {
							commandMetadata: {
								webCommandMetadata: {
									url: '/@current'
								}
							},
							browseEndpoint: {
								canonicalBaseUrl: '/@current'
							}
						}
					}]
				}
			}
		};
		global.document = {
			documentElement: {
				dataset: {
					pageType: 'video'
				}
			},
			querySelector: jest.fn(() => channelName)
		};
		global.location = {
			href: 'https://www.youtube.com/watch?v=current-id',
			origin: 'https://www.youtube.com'
		};
		global.ImprovedTube = {
			elements: {},
			storage: {},
			regex: {
				channel_link: /https:\/\/www.youtube.com\/@|((channel|user|c)\/)/,
				channel_home_page: /\/@|((channel|user|c)\/)[^/]+(\/featured)?\/?$/,
				channel_home_page_postfix: /\/(featured)?\/?$/
			},
			channelDefaultTab: jest.fn(),
			getParam: jest.fn((query, name) => name === 'v' ? 'video-id' : false),
			howLongAgoTheVideoWasUploaded: jest.fn(),
			dayOfWeek: jest.fn(),
			exactUploadDate: jest.fn(),
			channelVideosCount: jest.fn(),
			upNextAutoplay: jest.fn(),
			playerAutofullscreen: jest.fn(),
			playerSize: jest.fn(),
			playerPlaybackSpeedButton: jest.fn(),
			playerScreenshotButton: jest.fn(),
			addYouTubeReturnButton: jest.fn(),
			playerRepeatButton: jest.fn(),
			playerRotateButton: jest.fn(),
			playerPopupButton: jest.fn(),
			playerFitToWinButton: jest.fn(),
			playerRewindAndForwardButtons: jest.fn(),
			playerIncreaseDecreaseSpeedButtons: jest.fn(),
			playerCinemaModeButton: jest.fn(),
			playerHamburgerButton: jest.fn(),
			playerControls: jest.fn(),
			playlistLargePlaylistHandler: jest.fn(),
			cleanupPlaylistHandlers: jest.fn(),
			messages: {
				send: jest.fn()
			}
		};

		const functionsPath = path.join(__dirname, '../../js&css/web-accessible/functions.js');
		const functionsContent = fs.readFileSync(functionsPath, 'utf8');
		const start = functionsContent.indexOf('ImprovedTube.videoPageUpdate = function ()');
		const end = functionsContent.indexOf('ImprovedTube.playerOnPlay = function ()');

		vm.runInNewContext(functionsContent.slice(start, end), {
			ImprovedTube: global.ImprovedTube,
			document: global.document,
			location: global.location,
			URL: URL
		});
	});

	afterEach(() => {
		delete global.ImprovedTube;
		delete global.document;
		delete global.location;
	});

	test('uses the current renderer endpoint when YouTube reuses the owner link node', () => {
		ImprovedTube.videoPageUpdate();

		expect(ImprovedTube.elements.yt_channel_name).toBe(channelName);
		expect(ImprovedTube.elements.yt_channel_link.href).toBe('https://www.youtube.com/@current');
		expect(ImprovedTube.channelDefaultTab).toHaveBeenCalledWith(ImprovedTube.elements.yt_channel_link);
	});

	test('reads channel links from title renderer runs', () => {
		channelName.__data = {
			data: {
				title: {
					runs: [{
						navigationEndpoint: {
							browseEndpoint: {
								canonicalBaseUrl: '/channel/UCcurrent'
							}
						}
					}]
				}
			}
		};

		ImprovedTube.videoPageUpdate();

		expect(ImprovedTube.elements.yt_channel_link.href).toBe('https://www.youtube.com/channel/UCcurrent');
	});
});
