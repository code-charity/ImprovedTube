// Regression test for Issue #3364: Play on TV should also hide Safari's AirPlay button

const fs = require('fs');
const path = require('path');

describe('Player Remote Button (#3364)', () => {
	let playerCssContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/player/player.css');
		playerCssContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should hide remote and AirPlay buttons with the Play on TV setting', () => {
		const controlsRule = playerCssContent.match(/html\[it-player-play-button=true\][\s\S]*?\{\s*display: none !important;\s*\}/);

		expect(controlsRule).not.toBeNull();
		expect(controlsRule[0]).toContain('html[it-player-remote-button=true] .ytp-remote-button');
		expect(controlsRule[0]).toContain('html[it-player-remote-button=true] .ytp-airplay-button');
	});
});
