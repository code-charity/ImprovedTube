// Test for Issue #3664: Theatre mode stays offset when live chat is hidden

const fs = require('fs');
const path = require('path');

describe('Hidden live chat + theatre offset (#3664)', () => {
	let sidebarCssContent;

	beforeAll(() => {
		const filePath = path.join(__dirname, '../../js&css/extension/www.youtube.com/appearance/sidebar/sidebar.css');
		sidebarCssContent = fs.readFileSync(filePath, 'utf8');
	});

	test('should still hide the live chat frame itself when livechat is hidden', () => {
		expect(sidebarCssContent).toContain("html[it-livechat='hidden'] ytd-live-chat-frame#chat");
	});

	test('should collapse the theatre full-bleed panel container that hosts the hidden chat', () => {
		expect(sidebarCssContent).toMatch(
			/html\[it-livechat='hidden'\] ytd-watch-flexy\[theater\] #panels-full-bleed-container/
		);
	});

	test('should keep an explicitly opened engagement panel visible in theatre mode', () => {
		// The rule must exclude an expanded engagement panel so hiding chat does
		// not also hide a transcript/chapters panel the user opened.
		expect(sidebarCssContent).toContain(
			":not(:has(ytd-engagement-panel-section-list-renderer[visibility='ENGAGEMENT_PANEL_VISIBILITY_EXPANDED']))"
		);
	});
});
