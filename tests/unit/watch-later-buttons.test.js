const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Watch Later thumbnail buttons', () => {
	let generalJs;
	let generalCss;
	let generalSkeleton;

	beforeAll(() => {
		generalJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.js'), 'utf8');
		generalCss = fs.readFileSync(path.join(__dirname, '../../js&css/extension/www.youtube.com/general/general.css'), 'utf8');
		generalSkeleton = fs.readFileSync(path.join(__dirname, '../../menu/skeleton-parts/general.js'), 'utf8');
	});

	test('registers the feature with init', () => {
		const initJs = fs.readFileSync(path.join(__dirname, '../../js&css/extension/init.js'), 'utf8');

		expect(initJs).toContain('extension.features.watchLaterButtons();');
		expect(generalJs).toContain('extension.features.watchLaterButtons');
	});

	test('adds a hover and always menu option', () => {
		expect(generalSkeleton).toContain('watch_later_buttons');
		expect(generalSkeleton).toContain("value: 'hover'");
		expect(generalSkeleton).toContain("value: 'always'");
	});

	test('uses the native Watch Later control before the Innertube fallback', () => {
		expect(generalJs).toContain('findNativeWatchLaterButton');
		expect(generalJs).toContain('nativeButton.click();');
		expect(generalJs).toContain('ACTION_ADD_VIDEO');
		expect(generalJs).toContain("playlistId: 'WL'");
	});

	test('styles hover and always visibility states', () => {
		expect(generalCss).toContain(".it-watch-later-button");
		expect(generalCss).toContain("html[it-watch-later-buttons='hover']");
		expect(generalCss).toContain("html[it-watch-later-buttons='always']");
	});

	describe('addWatchLaterButton (#4305) — appends to parent, not aria-hidden anchor', () => {
		// addWatchLaterButton is nested inside the watchLaterButtons closure, so we
		// extract it (and its in-closure dependencies getVideoId +
		// findNativeWatchLaterButton) from the source string and eval them in a
		// jsdom-backed context where `document` resolves to the real DOM.
		function extractFn(source, name) {
			const re = new RegExp('function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{');
			const match = source.match(re);
			if (!match) return '';
			let i = match.index + match[0].length;
			let depth = 1;
			const start = i;
			while (i < source.length && depth > 0) {
				if (source[i] === '{') depth++;
				else if (source[i] === '}') depth--;
				i++;
			}
			return source.substring(match.index, i);
		}

		function buildAddWatchLaterButton(source, document) {
			const getVideoIdSrc = extractFn(source, 'getVideoId');
			const findNativeSrc = extractFn(source, 'findNativeWatchLaterButton');
			const addWatchLaterButtonSrc = extractFn(source, 'addWatchLaterButton');
			const ctx =
				getVideoIdSrc + '\n' +
				findNativeSrc + '\n' +
				addWatchLaterButtonSrc + '\n' +
				'return addWatchLaterButton;';
			return new Function('document', ctx)(document);
		}

		test('appends the button to the parent container, not the aria-hidden anchor', () => {
			const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
			const { document } = dom.window;
			const addWatchLaterButton = buildAddWatchLaterButton(generalJs, document);

			const renderer = document.createElement('ytd-rich-item-renderer');
			const thumbnail = document.createElement('a');
			thumbnail.className = 'ytLockupViewModelContentImage';
			thumbnail.href = '/watch?v=dQw4w9WgXcQ';
			thumbnail.setAttribute('aria-hidden', 'true');
			renderer.appendChild(thumbnail);
			document.body.appendChild(renderer);

			expect(thumbnail.parentElement).toBe(renderer);
			expect(thumbnail.hasAttribute('aria-hidden')).toBe(true);

			addWatchLaterButton(thumbnail);

			// The button must NOT be a direct child of the aria-hidden anchor.
			// Before the fix, this was true and triggered the
			// "Blocked aria-hidden on an element because its descendant
			// retained focus" console warning when the button was clicked.
			expect(thumbnail.children.length).toBe(0);
			expect(thumbnail.querySelector(':scope > button')).toBeNull();

			// The button MUST be a direct child of the parent container
			// (the renderer). This is what the fix introduces.
			expect(renderer.children.length).toBe(2);
			expect(renderer.querySelector(':scope > button')).not.toBeNull();
			expect(renderer.querySelector('button').className).toBe('it-watch-later-button');
		});

		test('does not duplicate the button on repeat calls', () => {
			const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
			const { document } = dom.window;
			const addWatchLaterButton = buildAddWatchLaterButton(generalJs, document);

			const renderer = document.createElement('div');
			const thumbnail = document.createElement('a');
			thumbnail.href = '/watch?v=dQw4w9WgXcQ';
			thumbnail.setAttribute('aria-hidden', 'true');
			renderer.appendChild(thumbnail);
			document.body.appendChild(renderer);

			addWatchLaterButton(thumbnail);
			addWatchLaterButton(thumbnail);

			expect(renderer.querySelectorAll('button.it-watch-later-button').length).toBe(1);
		});

		test('skips a thumbnail without a video id', () => {
			const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
			const { document } = dom.window;
			const addWatchLaterButton = buildAddWatchLaterButton(generalJs, document);

			const renderer = document.createElement('div');
			const thumbnail = document.createElement('a');
			thumbnail.href = '/playlist?list=PL1234567890';
			thumbnail.setAttribute('aria-hidden', 'true');
			renderer.appendChild(thumbnail);
			document.body.appendChild(renderer);

			addWatchLaterButton(thumbnail);

			expect(renderer.querySelectorAll('button').length).toBe(0);
			expect(thumbnail.querySelectorAll('button').length).toBe(0);
		});
	});
});
