const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SHORTCUTS_SRC = path.join(
	__dirname,
	'../../js&css/web-accessible/www.youtube.com/shortcuts.js'
);

function loadShortcuts(documentMock) {
	const improvedTube = {};

	const sandbox = {
		ImprovedTube: improvedTube,
		document: documentMock,
		window: {},
		console,
		setTimeout,
		clearTimeout
	};

	vm.createContext(sandbox);

	vm.runInContext(
		fs.readFileSync(SHORTCUTS_SRC, 'utf8'),
		sandbox
	);

	return improvedTube;
}

describe('Issue #4283: chapters shortcut in fullscreen', () => {
	test('clicks the fullscreen chapters control when available', () => {
		const chaptersButton = {
			click: jest.fn()
		};

		const fullscreenElement = {
			querySelector: jest.fn((selector) => {
				if (selector === '.ytp-chapter-title') {
					return chaptersButton;
				}

				return null;
			})
		};

		const documentMock = {
			fullscreenElement,
			webkitFullscreenElement: null,

			querySelector: jest.fn(() => null)
		};

		const improvedTube = loadShortcuts(documentMock);

		improvedTube.shortcutChapters();

		expect(fullscreenElement.querySelector)
			.toHaveBeenCalledWith('.ytp-chapter-title');

		expect(chaptersButton.click)
			.toHaveBeenCalledTimes(1);
	});

	test('does not throw when chapters UI is unavailable', () => {
		const documentMock = {
			fullscreenElement: null,
			webkitFullscreenElement: null,

			querySelector: jest.fn(() => null)
		};

		const improvedTube = loadShortcuts(documentMock);

		expect(() => {
			improvedTube.shortcutChapters();
		}).not.toThrow();
	});
});