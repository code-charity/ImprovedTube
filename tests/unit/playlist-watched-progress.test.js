// Test for: Bulk delete by watch progress only removes videos at 0% threshold
// Root cause: YouTube renamed <ytd-thumbnail-overlay-resume-playback-renderer>
// to <ytw-thumbnail-overlay-resume-playback-renderer> and dropped the #progress
// id, so getWatchedPercentFromRenderer() always fell through to 0 for any
// partially-watched video, meaning only threshold=0 ever matched anything.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Playlist bulk delete by watch progress (#progress rename fix)', () => {
	const filePath = path.join(__dirname, '../../js&css/web-accessible/www.youtube.com/playlist-complete-playlist.js');
	let sourceContent;
	let sandbox;

	beforeAll(() => {
		sourceContent = fs.readFileSync(filePath, 'utf8');

		// Minimal sandbox: enough globals for the file to define its functions
		// without throwing, without needing jsdom.
		let mockNodes = [];
		sandbox = {
			window: {},
			ImprovedTube: {
				storage: {},
				elements: { buttons: {} },
				regex: { video_id: /[?&]v=([^&#]+)/ },
				messages: { send: () => {} },
			},
			document: {
				querySelectorAll: (selector) => (selector === 'ytd-playlist-video-renderer' ? mockNodes : []),
				querySelector: () => null,
			},
			URLSearchParams,
			console,
			setTimeout,
			crypto: global.crypto,
			// exposed so tests can swap the fixture list per-case
			__setMockNodes: (nodes) => { mockNodes = nodes; },
		};
		vm.createContext(sandbox);
		vm.runInContext(sourceContent, sandbox, { filename: filePath });
	});

	// Builds a fake ytd-playlist-video-renderer with a controllable
	// resume-playback progress overlay, supporting either markup version.
	function makeRenderer({ videoId, widthPercent, fullyWatched = false, useYtw = true }) {
		const engine = useYtw ? 'ytw' : 'ytd';
		return {
			data: { videoId, setVideoId: `set-${videoId}` },
			querySelector(selector) {
				if (fullyWatched && selector.includes(`${engine}-thumbnail-overlay-watched-status-renderer`)) {
					return {};
				}
				if (widthPercent != null && selector.includes(`${engine}-thumbnail-overlay-resume-playback-renderer`)) {
					return { style: { width: `${widthPercent}%` } };
				}
				return null;
			},
		};
	}

	describe('regression: source contains the corrected selectors', () => {
		test('resume-playback selector covers both ytw and ytd, without an id-only lookup', () => {
			expect(sourceContent).toContain('ytw-thumbnail-overlay-resume-playback-renderer');
			expect(sourceContent).toContain('ytd-thumbnail-overlay-resume-playback-renderer');
			// old broken selector, only matched pre-rename markup:
			expect(sourceContent).not.toMatch(/querySelector\('ytw-thumbnail-overlay-resume-playback-renderer #progress'\)/);
		});

		test('watched-status selector covers both ytw and ytd', () => {
			expect(sourceContent).toContain('ytw-thumbnail-overlay-watched-status-renderer');
			expect(sourceContent).toContain('ytd-thumbnail-overlay-watched-status-renderer');
		});
	});

	describe('getWatchedPercentFromRenderer', () => {
		test('reads percentage from current (ytw) markup', () => {
			const renderer = makeRenderer({ videoId: 'a', widthPercent: 45, useYtw: true });
			expect(sandbox.getWatchedPercentFromRenderer(renderer)).toBe(45);
		});

		test('still reads percentage from legacy (ytd) markup', () => {
			const renderer = makeRenderer({ videoId: 'b', widthPercent: 45, useYtw: false });
			expect(sandbox.getWatchedPercentFromRenderer(renderer)).toBe(45);
		});

		test('returns 100 for fully-watched overlay regardless of markup version', () => {
			const ytw = makeRenderer({ videoId: 'c', fullyWatched: true, useYtw: true });
			const ytd = makeRenderer({ videoId: 'd', fullyWatched: true, useYtw: false });
			expect(sandbox.getWatchedPercentFromRenderer(ytw)).toBe(100);
			expect(sandbox.getWatchedPercentFromRenderer(ytd)).toBe(100);
		});

		test('returns 0 for a never-played video', () => {
			const renderer = makeRenderer({ videoId: 'e' });
			expect(sandbox.getWatchedPercentFromRenderer(renderer)).toBe(0);
		});
	});

	describe('collectCandidates at realistic thresholds', () => {
		// Mixed playlist: never played, barely started, ~half watched, fully watched.
		beforeEach(() => {
			sandbox.__setMockNodes([
				makeRenderer({ videoId: 'v0', widthPercent: 0 }),
				makeRenderer({ videoId: 'v3', widthPercent: 3 }),
				makeRenderer({ videoId: 'v8', widthPercent: 8 }),
				makeRenderer({ videoId: 'v45', widthPercent: 45 }),
				makeRenderer({ videoId: 'v100', fullyWatched: true }),
			]);
		});

		test('threshold 5% picks up v8, v45, v100 but not v0/v3 (this is the bug being fixed)', () => {
			const candidates = sandbox.collectCandidates(5).map((c) => c.id);
			expect(candidates).toEqual(expect.arrayContaining(['v8', 'v45', 'v100']));
			expect(candidates).not.toEqual(expect.arrayContaining(['v0', 'v3']));
		});

		test('threshold 10% picks up only v45 and v100', () => {
			const candidates = sandbox.collectCandidates(10).map((c) => c.id);
			expect(candidates.sort()).toEqual(['v100', 'v45']);
		});

		test('threshold 0% still matches everything (unchanged behavior)', () => {
			const candidates = sandbox.collectCandidates(0).map((c) => c.id);
			expect(candidates.sort()).toEqual(['v0', 'v100', 'v3', 'v45', 'v8']);
		});
	});
});