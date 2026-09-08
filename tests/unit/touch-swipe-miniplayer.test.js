const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Disable touch swipe to mini-player', () => {
	let playerContent;
	let functionsContent;
	let playerMenuContent;
	let messagesJson;

	function loadTouchSwipeGuard(storageValue = true) {
		const assignmentStart = playerContent.indexOf('ImprovedTube.playerDisableTouchSwipeToMiniplayer = function');
		const bodyStart = playerContent.indexOf('{', assignmentStart);
		let depth = 0;
		let assignmentEnd = -1;

		for (let i = bodyStart; i < playerContent.length; i++) {
			if (playerContent[i] === '{') {
				depth++;
			} else if (playerContent[i] === '}') {
				depth--;
				if (depth === 0) {
					assignmentEnd = i + 2;
					break;
				}
			}
		}

		const documentListeners = {};
		const sandbox = {
			ImprovedTube: {
				storage: {
					player_disable_touch_swipe_to_miniplayer: storageValue
				}
			},
			document: {
				addEventListener: jest.fn((type, listener, options) => {
					documentListeners[type] = { listener, options };
				}),
				removeEventListener: jest.fn((type) => {
					delete documentListeners[type];
				})
			},
			Math,
			Boolean
		};

		vm.runInNewContext(playerContent.slice(assignmentStart, assignmentEnd), sandbox);

		return { sandbox, documentListeners };
	}

	function fakeNode(matchName) {
		return {
			matches: (selector) => selector.split(',').map(item => item.trim()).includes(matchName),
			closest: (selector) => selector.split(',').map(item => item.trim()).includes(matchName) ? true : null
		};
	}

	beforeAll(() => {
		playerContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js'),
			'utf8'
		);
		functionsContent = fs.readFileSync(
			path.join(__dirname, '../../js&css/web-accessible/functions.js'),
			'utf8'
		);
		playerMenuContent = fs.readFileSync(
			path.join(__dirname, '../../menu/skeleton-parts/player.js'),
			'utf8'
		);
		messagesJson = JSON.parse(fs.readFileSync(
			path.join(__dirname, '../../_locales/en/messages.json'),
			'utf8'
		));
	});

	test('defines playerDisableTouchSwipeToMiniplayer on ImprovedTube', () => {
		expect(playerContent).toContain('ImprovedTube.playerDisableTouchSwipeToMiniplayer = function');
	});

	test('blocks touch and pointer drag gestures before YouTube handles them', () => {
		expect(playerContent).toContain("document.addEventListener('touchmove'");
		expect(playerContent).toContain("document.addEventListener('pointermove'");
		expect(playerContent).toContain('passive: false');
		expect(playerContent).toContain('event.preventDefault()');
		expect(playerContent).toContain('event.stopImmediatePropagation()');
	});

	test('touch guard prevents a downward player-surface drag', () => {
		const { sandbox, documentListeners } = loadTouchSwipeGuard(true);
		const surface = fakeNode('.html5-video-container');
		const moveEvent = {
			touches: [{ identifier: 1, clientX: 101, clientY: 112 }],
			cancelable: true,
			preventDefault: jest.fn(),
			stopImmediatePropagation: jest.fn(),
			stopPropagation: jest.fn()
		};

		sandbox.ImprovedTube.playerDisableTouchSwipeToMiniplayer();
		documentListeners.touchstart.listener({
			touches: [{ identifier: 1, clientX: 100, clientY: 100 }],
			composedPath: () => [surface],
			target: surface
		});
		documentListeners.touchmove.listener(moveEvent);

		expect(moveEvent.preventDefault).toHaveBeenCalledTimes(1);
		expect(moveEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
		expect(moveEvent.stopPropagation).toHaveBeenCalledTimes(1);
	});

	test('touch guard ignores player controls', () => {
		const { sandbox, documentListeners } = loadTouchSwipeGuard(true);
		const button = fakeNode('button');
		const moveEvent = {
			touches: [{ identifier: 1, clientX: 100, clientY: 130 }],
			cancelable: true,
			preventDefault: jest.fn(),
			stopImmediatePropagation: jest.fn(),
			stopPropagation: jest.fn()
		};

		sandbox.ImprovedTube.playerDisableTouchSwipeToMiniplayer();
		documentListeners.touchstart.listener({
			touches: [{ identifier: 1, clientX: 100, clientY: 100 }],
			composedPath: () => [button],
			target: button
		});
		documentListeners.touchmove.listener(moveEvent);

		expect(moveEvent.preventDefault).not.toHaveBeenCalled();
		expect(moveEvent.stopImmediatePropagation).not.toHaveBeenCalled();
		expect(moveEvent.stopPropagation).not.toHaveBeenCalled();
	});

	test('init wires the player touch swipe guard', () => {
		expect(functionsContent).toContain('ImprovedTube.playerDisableTouchSwipeToMiniplayer()');
	});

	test('player menu exposes the setting and English locale', () => {
		expect(playerMenuContent).toContain('player_disable_touch_swipe_to_miniplayer');
		expect(playerMenuContent).toContain('disableTouchSwipeToMiniplayer');
		expect(messagesJson.disableTouchSwipeToMiniplayer.message).toBe('Disable touch swipe to mini-player');
	});
});
