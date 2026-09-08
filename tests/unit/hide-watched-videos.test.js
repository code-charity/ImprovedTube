const fs = require('fs');
const path = require('path');

describe('Hide watched videos (#4128)', () => {
	let initContent;
	let generalContent;
	let generalCssContent;
	let menuContent;

	beforeAll(() => {
		initContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/init.js'), 'utf8');
		generalContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'), 'utf8');
		generalCssContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'), 'utf8');
		menuContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/general.js'), 'utf8');
	});

	test('initializes the hide watched videos feature', () => {
		expect(initContent).toContain('extension.features.hideWatchedVideos();');
	});

	test('hides watched thumbnail renderers by threshold', () => {
		expect(generalContent).toContain('extension.features.hideWatchedVideos = function');
		expect(generalContent).toContain('ytd-thumbnail-overlay-watched-status-renderer');
		expect(generalContent).toContain('ytd-thumbnail-overlay-resume-playback-renderer #progress');
		expect(generalContent).toContain('hide_watched_videos_threshold');
		expect(generalContent).toContain('it-hide-watched-video');
		expect(generalCssContent).toContain('[it-hide-watched-video]');
		expect(generalCssContent).toContain('display: none !important');
	});

	test('exposes a settings threshold control and enables tracking explicitly', () => {
		expect(menuContent).toContain('hide_watched_videos_threshold');
		expect(menuContent).toContain("component: 'slider'");
		expect(menuContent).toContain("text: 'hideWatchedVideosThreshold'");
		expect(menuContent).toContain("satus.storage.set('track_watched_videos', true)");
	});
});
