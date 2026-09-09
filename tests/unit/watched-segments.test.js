// Test for Issue #4261: Display watched sections of the video on the seek bar

const fs = require('fs');
const path = require('path');

const playerPath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/player.js');
const playerContent = fs.readFileSync(playerPath, 'utf8');

// Extracts the `ImprovedTube.watchedSegments = { ... }` literal so its logic can
// be exercised without loading the whole player script.
function extractObjectLiteral (source, declaration) {
	const start = source.indexOf(declaration);

	if (start === -1) {
		throw new Error('Declaration not found: ' + declaration);
	}

	let index = source.indexOf('{', start),
		depth = 0,
		quote = '';

	for (let i = index; i < source.length; i++) {
		const character = source[i];

		if (quote) {
			if (character === '\\') {
				i++;
			} else if (character === quote) {
				quote = '';
			}
			continue;
		}

		if (character === '\'' || character === '"' || character === '`') {
			quote = character;
		} else if (character === '/' && source[i + 1] === '*') {
			i = source.indexOf('*/', i) + 1;
		} else if (character === '/' && source[i + 1] === '/') {
			i = source.indexOf('\n', i);
		} else if (character === '{') {
			depth++;
		} else if (character === '}') {
			depth--;

			if (depth === 0) {
				return source.slice(index, i + 1);
			}
		}
	}

	throw new Error('Unbalanced braces in: ' + declaration);
}

function fakeElement (rect) {
	return {
		className: '',
		style: {},
		children: [],
		parent: null,
		rect: rect || { left: 0, right: 0, width: 0 },
		getBoundingClientRect () { return this.rect; },
		querySelector (selector) {
			return this.children.find(function (child) {
				return selector.endsWith('.' + child.className);
			}) || null;
		},
		insertBefore (child) { child.parent = this; this.children.unshift(child); return child; },
		appendChild (child) { child.parent = this; this.children.push(child); return child; },
		remove () {
			const index = this.parent ? this.parent.children.indexOf(this) : -1;

			if (index !== -1) { this.parent.children.splice(index, 1); }
		},
		get firstChild () { return this.children[0] || null; },
		get lastChild () { return this.children[this.children.length - 1] || null; }
	};
}

const features = [];

afterEach(() => {
	while (features.length) {
		clearTimeout(features.pop().save_timer);
	}
});

function createFeature () {
	const sent = [];
	const ImprovedTube = {
		elements: { buttons: {}, player: null, video: null },
		messages: { send: function (message) { sent.push(message); } },
		regex: { video_id: /(?:[?&]v=|embed\/|shorts\/)([^&?]{11})/ },
		storage: { player_watched_segments: true }
	};

	global.location = { href: 'https://www.youtube.com/watch?v=abcdefghijk' };
	global.window = { addEventListener: function () {} };
	global.document = {
		addEventListener: function () {},
		createElement: function () { return fakeElement(); },
		querySelectorAll: function () { return []; },
		querySelector: function () { return null; },
		documentElement: { dataset: { pageType: 'video' } },
		head: fakeElement()
	};

	const literal = extractObjectLiteral(playerContent, 'ImprovedTube.watchedSegments =');
	const feature = new Function('ImprovedTube', 'return ' + literal + ';')(ImprovedTube);

	features.push(feature);

	return { feature, ImprovedTube, sent };
}

describe('Watched sections on the seek bar (#4261)', () => {
	describe('segment merging', () => {
		test('merges consecutive playback into a single segment', () => {
			const { feature } = createFeature();

			expect(feature.add(10, 10.5)).toBe(true);
			feature.add(10.5, 11);
			feature.add(11, 12.4);

			expect(feature.segments).toEqual([[10, 12.4]]);
		});

		test('keeps sections apart until the gap between them is closed', () => {
			const { feature } = createFeature();

			feature.add(0, 30);
			feature.add(120, 150);

			expect(feature.segments).toEqual([[0, 30], [120, 150]]);

			feature.add(30, 120);

			expect(feature.segments).toEqual([[0, 150]]);
		});

		test('inserts a later section behind an earlier one', () => {
			const { feature } = createFeature();

			feature.add(300, 360);
			feature.add(60, 90);

			expect(feature.segments).toEqual([[60, 90], [300, 360]]);
		});

		test('reports no change when a section is already covered', () => {
			const { feature } = createFeature();

			feature.add(0, 60);

			expect(feature.add(20, 30)).toBe(false);
			expect(feature.segments).toEqual([[0, 60]]);
		});
	});

	describe('stored data', () => {
		test('drops malformed entries and sorts what is left', () => {
			const { feature } = createFeature();

			expect(feature.sanitize([[30, 20], ['a', 5], [10, 20], null, [40], [-5, 5], [5, 8]]))
				.toEqual([[5, 8], [10, 20]]);
			expect(feature.sanitize(undefined)).toEqual([]);
		});

		test('saves the current video and keeps the most recent videos only', () => {
			const { feature, ImprovedTube, sent } = createFeature();

			feature.MAX_VIDEOS = 2;
			ImprovedTube.storage.watched_segments = {
				old: { u: 1, s: [[0, 5]] },
				recent: { u: 2, s: [[0, 5]] }
			};

			feature.video_id = 'abcdefghijk';
			feature.segments = [[0, 42]];
			feature.dirty = true;
			feature.save();

			expect(sent).toHaveLength(1);
			expect(sent[0].action).toBe('set');
			expect(sent[0].key).toBe('watched_segments');
			expect(Object.keys(sent[0].value).sort()).toEqual(['abcdefghijk', 'recent']);
			expect(sent[0].value.abcdefghijk.s).toEqual([[0, 42]]);
		});

		test('does not write when nothing changed', () => {
			const { feature, sent } = createFeature();

			feature.video_id = 'abcdefghijk';
			feature.segments = [[0, 42]];
			feature.dirty = false;
			feature.save();

			expect(sent).toHaveLength(0);
		});

		test('loads the sections of the video that is about to play', () => {
			const { feature, ImprovedTube } = createFeature();

			ImprovedTube.storage.watched_segments = {
				abcdefghijk: { u: 1, s: [[0, 30], [90, 120]] }
			};

			feature.load('abcdefghijk');

			expect(feature.segments).toEqual([[0, 30], [90, 120]]);
			expect(feature.last_time).toBeNull();
		});
	});

	describe('tracking', () => {
		function play (times, overrides) {
			const { feature, ImprovedTube } = createFeature();
			const video = Object.assign({
				currentTime: 0,
				duration: 600,
				paused: false,
				playbackRate: 1,
				seeking: false
			}, overrides);

			ImprovedTube.elements.video = video;
			ImprovedTube.elements.player = { className: 'html5-video-player' };
			feature.attached_video = video;
			feature.video_id = 'abcdefghijk';

			times.forEach(function (time) {
				video.currentTime = time;
				feature.track();
			});

			return { feature, video, ImprovedTube };
		}

		test('records the time that was actually played', () => {
			const { feature } = play([10, 10.25, 10.5, 10.75]);

			expect(feature.segments).toEqual([[10, 10.8]]);
		});

		test('does not fill in the part that was skipped over', () => {
			const { feature } = play([10, 10.5, 400, 400.5]);

			expect(feature.segments).toEqual([[10, 10.5], [400, 400.5]]);
		});

		test('records nothing while the player is paused', () => {
			const { feature } = play([10, 10.5], { paused: true });

			expect(feature.segments).toEqual([]);
		});

		test('records nothing while an ad is showing', () => {
			const { feature, ImprovedTube } = createFeature();
			const video = { currentTime: 0, duration: 600, paused: false, playbackRate: 1, seeking: false };

			ImprovedTube.elements.video = video;
			ImprovedTube.elements.player = { className: 'html5-video-player ad-showing' };
			feature.attached_video = video;
			feature.video_id = 'abcdefghijk';

			[10, 10.5].forEach(function (time) {
				video.currentTime = time;
				feature.track();
			});

			expect(feature.segments).toEqual([]);
		});

		test('records nothing for streams without a known duration', () => {
			const { feature } = play([10, 10.5], { duration: Infinity });

			expect(feature.segments).toEqual([]);
		});

		test('keeps recording when the player outlives the watch page', () => {
			const { feature } = play([10, 10.5]);

			global.location.href = 'https://www.youtube.com/';

			feature.attached_video.currentTime = 11;
			feature.track();

			expect(feature.video_id).toBe('abcdefghijk');
			expect(feature.segments).toEqual([[10, 11]]);
		});

		test('allows bigger steps on faster playback', () => {
			const { feature } = play([10, 16], { playbackRate: 2 });

			expect(feature.segments).toEqual([[10, 16]]);
		});
	});

	describe('rendering', () => {
		test('places sections relative to the chapter they fall into', () => {
			const { feature } = createFeature();

			feature.segments = [[300, 450]];

			// Second half of a 600 second video, drawn on the second of two chapters.
			const chapter = fakeElement({ left: 100, right: 200, width: 100 });

			feature.paint(chapter, { left: 0, right: 200, width: 200 }, 600);

			const layer = chapter.children[0];

			expect(layer.className).toBe('it-watched-segments');
			expect(layer.children).toHaveLength(1);
			expect(layer.children[0].className).toBe('it-watched-segment');
			expect(layer.children[0].style.left).toBe('0%');
			expect(layer.children[0].style.width).toBe('50%');
		});

		test('clips sections to the chapter and reuses the drawn elements', () => {
			const { feature } = createFeature();

			feature.segments = [[0, 450], [500, 550]];

			const chapter = fakeElement({ left: 100, right: 200, width: 100 });
			const bar = { left: 0, right: 200, width: 200 };

			feature.paint(chapter, bar, 600);

			const layer = chapter.children[0];

			expect(chapter.children).toHaveLength(1);
			expect(layer.children).toHaveLength(2);
			expect(layer.children[0].style.left).toBe('0%');
			expect(layer.children[0].style.width).toBe('50%');
			expect(parseFloat(layer.children[1].style.left)).toBeCloseTo(200 / 3, 6);

			feature.segments = [[300, 360]];
			feature.paint(chapter, bar, 600);

			expect(chapter.children).toHaveLength(1);
			expect(layer.children).toHaveLength(1);
			expect(layer.children[0].style.width).toBe('20%');
		});

		test('leaves the bar alone while an ad is showing', () => {
			const { feature, ImprovedTube } = createFeature();

			const chapter = fakeElement({ left: 0, right: 200, width: 200 });
			const bar = fakeElement({ left: 0, right: 200, width: 200 });

			chapter.className = 'ytp-progress-list';
			bar.children.push(chapter);

			ImprovedTube.elements.video = { duration: 600 };
			ImprovedTube.elements.player = {
				className: 'html5-video-player ad-showing',
				querySelector: function () { return bar; }
			};
			bar.querySelectorAll = function () { return [chapter]; };

			feature.segments = [[0, 300]];
			feature.render();

			expect(chapter.children).toHaveLength(0);

			ImprovedTube.elements.player.className = 'html5-video-player';

			feature.render();

			expect(chapter.children).toHaveLength(1);
			expect(chapter.children[0].children[0].style.width).toBe('50%');
		});

		test('draws nothing on a chapter that was never watched', () => {
			const { feature } = createFeature();

			feature.segments = [[0, 100]];

			const chapter = fakeElement({ left: 100, right: 200, width: 100 });

			feature.paint(chapter, { left: 0, right: 200, width: 200 }, 600);

			expect(chapter.children[0].children).toHaveLength(0);
		});
	});

	describe('start up', () => {
		function buildPlayer (ImprovedTube) {
			const chapter = fakeElement({ left: 0, right: 200, width: 200 });
			const bar = fakeElement({ left: 0, right: 200, width: 200 });

			chapter.className = 'ytp-progress-list';
			bar.children.push(chapter);
			bar.querySelectorAll = function () { return [chapter]; };

			ImprovedTube.elements.player = {
				className: 'html5-video-player',
				querySelector: function () { return bar; }
			};

			return chapter;
		}

		test('waits for a player that is not complete yet', () => {
			const { feature, ImprovedTube } = createFeature();

			ImprovedTube.storage.watched_segments = { abcdefghijk: { u: 1, s: [[0, 300]] } };

			const chapter = buildPlayer(ImprovedTube);

			feature.init();

			expect(feature.render_timer).not.toBeNull();
			expect(feature.attached_video).toBeNull();
			expect(chapter.children).toHaveLength(0);

			// The video element shows up on a later tick.
			ImprovedTube.elements.video = {
				duration: 600,
				addEventListener: function () {},
				removeEventListener: function () {}
			};

			feature.tick();

			expect(feature.attached_video).toBe(ImprovedTube.elements.video);
			expect(feature.video_id).toBe('abcdefghijk');
			expect(chapter.children[0].children[0].style.width).toBe('50%');

			clearInterval(feature.render_timer);
		});

		test('stops itself when the setting is switched off', () => {
			const { feature, ImprovedTube } = createFeature();

			buildPlayer(ImprovedTube);
			feature.init();

			expect(feature.render_timer).not.toBeNull();

			ImprovedTube.storage.player_watched_segments = false;
			feature.tick();

			expect(feature.render_timer).toBeNull();
			expect(ImprovedTube.elements.buttons['it-watched-segments-styles']).toBeUndefined();
		});

		test('does not start on pages that are not a video', () => {
			const { feature, ImprovedTube } = createFeature();

			global.document.documentElement.dataset.pageType = 'home';
			buildPlayer(ImprovedTube);
			feature.init();

			expect(feature.render_timer).toBeNull();
		});
	});

	describe('wiring', () => {
		test('the feature is initialised with the player', () => {
			const functionsContent = fs.readFileSync(
				path.join(__dirname, '../../js&css/web-accessible/functions.js'),
				'utf8'
			);

			expect(functionsContent).toContain('ImprovedTube.watchedSegments.init()');
		});

		test('switching the setting takes effect without a reload', () => {
			const coreContent = fs.readFileSync(
				path.join(__dirname, '../../js&css/web-accessible/core.js'),
				'utf8'
			);

			expect(coreContent).toContain("case 'playerWatchedSegments':");
			expect(coreContent).toContain('ImprovedTube.watchedSegments.init()');
		});

		test('the setting is exposed in the menu and translated', () => {
			const menuContent = fs.readFileSync(
				path.join(__dirname, '../../menu/skeleton-parts/appearance.js'),
				'utf8'
			);
			const messages = JSON.parse(fs.readFileSync(
				path.join(__dirname, '../../_locales/en/messages.json'),
				'utf8'
			));

			expect(menuContent).toContain('player_watched_segments');
			expect(menuContent).toContain('showWatchedSectionsOnSeekBar');
			expect(messages.showWatchedSectionsOnSeekBar).toBeDefined();
		});
	});
});
