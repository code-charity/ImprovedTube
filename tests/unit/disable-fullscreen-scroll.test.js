// Test for Issue #4129: disable scrolling in fake fullscreen

const fs = require('fs');
const path = require('path');

describe('Disable fullscreen scrolling (#4129)', () => {
	let appearanceContent;
	let playerCssContent;
	let messages;

	beforeAll(() => {
		appearanceContent = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/appearance.js'), 'utf8');
		playerCssContent = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/player/player.css'), 'utf8');
		messages = JSON.parse(fs.readFileSync(path.join(__dirname, '../../_locales/en/messages.json'), 'utf8'));
	});

	test('keeps the existing appearance toggle wired up', () => {
		expect(appearanceContent).toContain('hide_scroll_for_details');
		expect(appearanceContent).toContain('text: "hideScrollForDetails"');
	});

	test('locks page scrolling while fake fullscreen is active', () => {
		expect(playerCssContent).toContain("html[it-hide-scroll-for-details='true'] ytd-app[scrolling_]");
		expect(playerCssContent).toContain("html[it-hide-scroll-for-details='true'] ytd-watch-flexy[fullscreen]");
		expect(playerCssContent).toContain("html[it-hide-scroll-for-details='true'] ytd-watch-flexy[fullscreen] #columns");
		expect(playerCssContent).toContain('overflow: hidden !important;');
	});

	test('still hides the fullscreen education button', () => {
		expect(playerCssContent).toContain('button.ytp-fullerscreen-edu-button');
	});

	test('updates the toggle label to describe fullscreen scrolling', () => {
		expect(messages.hideScrollForDetails).toBeDefined();
		expect(messages.hideScrollForDetails.message).toBe('Disable scrolling in fullscreen');
	});
});
