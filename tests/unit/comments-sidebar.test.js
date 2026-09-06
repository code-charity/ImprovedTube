class FakeElement {
	constructor(tagName, id = '', className = '') {
		this.tagName = tagName.toUpperCase();
		this.nodeName = this.tagName;
		this.id = id;
		this.className = className;
		this.children = [];
		this.parentElement = null;
		this.parentNode = null;
		this.style = {};
		this.attributes = {};
		this.textContent = '';
		this.offsetWidth = 800;
	}

	appendChild(child) {
		if (!child) return child;
		if (child.parentElement) {
			child.parentElement.children = child.parentElement.children.filter((node) => node !== child);
		}
		this.children.push(child);
		child.parentElement = this;
		child.parentNode = this;
		return child;
	}

	hasAttribute(name) {
		return Object.prototype.hasOwnProperty.call(this.attributes, name);
	}

	setAttribute(name, value) {
		this.attributes[name] = String(value);
	}

	removeAttribute(name) {
		delete this.attributes[name];
	}
}

function descendants(node) {
	return node.children.flatMap((child) => [child, ...descendants(child)]);
}

function createDocument(includeComments = true) {
	const elements = {};

	function el(tagName, id = '', className = '') {
		const node = new FakeElement(tagName, id, className);
		if (id) elements[id] = node;
		return node;
	}

	const documentElement = el('html');
	const head = el('head');
	const body = el('body');
	const app = el('ytd-app');
	const watch = el('ytd-watch-flexy');
	const columns = el('div', 'columns');
	const primary = el('div', 'primary');
	const player = el('div', 'player', 'style-scope ytd-watch-flexy');
	const chrome = el('div', '', 'ytp-chrome-bottom');
	const primaryInner = el('div', 'primary-inner');
	const below = el('div', 'below');
	const panels = el('div', 'panels');
	const related = el('div', 'related');
	const relatedContent = el('div');
	const compactVideo = el('ytd-compact-video-renderer', '', 'style-scope');
	const secondary = el('div', 'secondary');
	const secondaryInner = el('div', 'secondary-inner');
	const chatTemplate = el('div', 'chat-template');

	documentElement.appendChild(head);
	documentElement.appendChild(body);
	body.appendChild(app);
	app.appendChild(watch);
	watch.appendChild(columns);
	columns.appendChild(primary);
	columns.appendChild(secondary);
	primary.appendChild(player);
	player.appendChild(chrome);
	primary.appendChild(primaryInner);
	primaryInner.appendChild(below);
	primaryInner.appendChild(panels);
	primaryInner.appendChild(related);
	related.appendChild(relatedContent);
	relatedContent.appendChild(compactVideo);
	secondary.appendChild(secondaryInner);
	secondaryInner.appendChild(chatTemplate);

	if (includeComments) {
		below.appendChild(el('div', 'comments'));
	}

	function findById(id) {
		return elements[id] || null;
	}

	function querySelector(selector) {
		if (selector === '#comments') return findById('comments');
		if (selector === '#player .ytp-chrome-bottom') return chrome;
		if (selector === '#container .ytp-chrome-bottom') return null;
		if (selector === '#player.style-scope.ytd-watch-flexy') return player;
		if (selector === 'ytd-watch-flexy') return watch;
		if (selector === 'ytd-app') return app;
		if (selector === '#related ytd-compact-video-renderer.style-scope') return compactVideo;
		if (selector.startsWith('#')) return findById(selector.slice(1));
		return descendants(documentElement).find((node) => node.tagName.toLowerCase() === selector) || null;
	}

	return {
		documentElement,
		head,
		body,
		createElement: (tagName) => el(tagName),
		createTextNode: (text) => {
			const node = el('#text');
			node.textContent = text;
			return node;
		},
		getElementById: findById,
		querySelector,
		addEventListener: jest.fn(),
		_createElementWithId: el
	};
}

function installBrowserStubs(includeComments = true) {
	const observers = [];
	const document = createDocument(includeComments);

	global.document = document;
	global.location = { href: 'https://www.youtube.com/watch?v=abcdefghijk' };
	global.navigator = { userAgent: 'Macintosh' };
	global.window = {
		addEventListener: jest.fn(),
		matchMedia: jest.fn((query) => ({
			matches: query.includes('1000px') && !query.includes('1952px'),
			addListener: jest.fn(),
			removeListener: jest.fn()
		}))
	};
	global.ResizeObserver = jest.fn().mockImplementation(() => ({
		observe: jest.fn(),
		disconnect: jest.fn()
	}));
	global.MutationObserver = jest.fn().mockImplementation((callback) => {
		const observer = {
			observe: jest.fn(() => observers.push(callback)),
			disconnect: jest.fn()
		};
		return observer;
	});

	return {
		document,
		triggerMutation: () => observers.forEach((callback) => callback([{ type: 'childList' }]))
	};
}

function loadAppearance() {
	jest.resetModules();
	global.ImprovedTube = {
		storage: {
			comments_sidebar: true,
			comments_sidebar_scrollbars: false
		},
		elements: {}
	};
	require('../../js&css/web-accessible/www.youtube.com/appearance.js');
}

describe('comments sidebar', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		delete global.document;
		delete global.location;
		delete global.navigator;
		delete global.window;
		delete global.ResizeObserver;
		delete global.MutationObserver;
		delete global.ImprovedTube;
	});

	test('moves comments back to the sidebar when YouTube restores the default layout', () => {
		const { document, triggerMutation } = installBrowserStubs(true);
		loadAppearance();

		ImprovedTube.commentsSidebar();
		jest.advanceTimersByTime(300);

		const comments = document.getElementById('comments');
		expect(comments.parentElement.id).toBe('secondary-inner');

		document.getElementById('below').appendChild(comments);
		triggerMutation();
		jest.advanceTimersByTime(350);

		expect(comments.parentElement.id).toBe('secondary-inner');
	});

	test('waits for late-loading comments instead of failing during initial setup', () => {
		const { document } = installBrowserStubs(false);
		loadAppearance();

		expect(() => ImprovedTube.commentsSidebar()).not.toThrow();

		const comments = document._createElementWithId('div', 'comments');
		document.getElementById('below').appendChild(comments);
		jest.advanceTimersByTime(300);

		expect(comments.parentElement.id).toBe('secondary-inner');
	});

	test('does not constrain player width while cinema mode is active', () => {
		const { document } = installBrowserStubs(true);
		loadAppearance();

		const overlay = document._createElementWithId('div', 'overlay_cinema');
		overlay.style.display = 'block';
		document.body.appendChild(overlay);
		document.documentElement.setAttribute('it-cinema-mode', 'true');

		ImprovedTube.commentsSidebar();
		jest.advanceTimersByTime(300);

		const primary = document.getElementById('primary');
		const player = document.querySelector('#player.style-scope.ytd-watch-flexy');
		expect(primary.style.width).toBe('');
		expect(player.style.width).toBe('');
	});
});
