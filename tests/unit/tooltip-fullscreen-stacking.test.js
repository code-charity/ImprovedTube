// Behavioral tests for Issue #4294: tooltips hidden behind the video player.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FakeElement {
	constructor(tagName) {
		this.tagName = tagName;
		this.className = '';
		this.textContent = '';
		this.dataset = {};
		this.style = {};
		this.childNodes = [];
		this.parentNode = null;
		this.listeners = {};
	}

	addEventListener(type, listener) {
		(this.listeners[type] ||= []).push(listener);
	}

	removeEventListener(type, listener) {
		this.listeners[type] = (this.listeners[type] || []).filter(item => item !== listener);
	}

	emit(type) {
		for (const listener of [...(this.listeners[type] || [])]) {
			listener.call(this);
		}
	}

	getBoundingClientRect() {
		return {left: 40, top: 60, width: 80, height: 32};
	}

	appendChild(child) {
		child.parentNode = this;
		this.childNodes.push(child);
		return child;
	}

	remove() {
		if (this.parentNode) {
			this.parentNode.childNodes = this.parentNode.childNodes.filter(item => item !== this);
			this.parentNode = null;
		}
	}
}

function extractCreatePlayerButton() {
	const source = fs.readFileSync(
		path.join(__dirname, '../../js&css/web-accessible/functions.js'),
		'utf8'
	);
	const start = source.indexOf('ImprovedTube.createPlayerButton = function (options) {');
	const openingBrace = source.indexOf('{', start);
	let depth = 0;

	if (start < 0 || openingBrace < 0) {
		throw new Error('createPlayerButton was not found');
	}

	for (let index = openingBrace; index < source.length; index++) {
		if (source[index] === '{') depth++;
		if (source[index] === '}' && --depth === 0) {
			return source.slice(start, index + 2);
		}
	}

	throw new Error('createPlayerButton is not balanced');
}

function setup(fullscreenState) {
	const createdElements = [];
	const controls = Object.assign(new FakeElement('div'), {
		insertBefore(node) {
			this.appendChild(node);
			return node;
		}
	});
	const documentTarget = Object.assign(new FakeElement('#document'), {
		createElement: tagName => {
			const element = new FakeElement(tagName);

			createdElements.push(element);
			return element;
		},
		body: new FakeElement('body')
	});
	const context = {
		document: Object.assign(documentTarget, fullscreenState),
		window: {innerWidth: 1280},
		ImprovedTube: {elements: {player_left_controls: controls}}
	};

	vm.createContext(context);
	vm.runInContext(extractCreatePlayerButton(), context);

	const button = context.ImprovedTube.createPlayerButton({title: 'Loop'});

	button.emit('mouseover');

	const tooltip = createdElements.find(element => element.className === 'it-player-button--tooltip');

	expect(tooltip).toBeDefined();

	return {context, button, tooltip};
}

describe('Player button tooltip stacking in fullscreen (#4294)', () => {
	test('appends the tooltip inside the fullscreen element while fullscreen', () => {
		const fullscreenElement = new FakeElement('div');
		const {tooltip} = setup({fullscreenElement});

		expect(tooltip.parentNode).toBe(fullscreenElement);
	});

	test('falls back to webkit and moz fullscreen flags before document.body', () => {
		const webkitFullscreen = new FakeElement('div');
		const {context, tooltip} = setup({
			fullscreenElement: null,
			webkitFullscreenElement: webkitFullscreen
		});

		expect(tooltip.parentNode).toBe(webkitFullscreen);

		const mozFullscreen = new FakeElement('div');
		const second = setup({
			fullscreenElement: undefined,
			webkitFullscreenElement: undefined,
			mozFullScreenElement: mozFullscreen
		});

		expect(second.tooltip.parentNode).toBe(mozFullscreen);
		expect(context.document.body.childNodes).toHaveLength(0);
	});

	test('appends the tooltip to document.body outside fullscreen', () => {
		const {context, tooltip} = setup({fullscreenElement: null});

		expect(tooltip.parentNode).toBe(context.document.body);
	});

	test('mouseleave still removes a reparented tooltip from the fullscreen element', () => {
		const fullscreenElement = new FakeElement('div');
		const {button, tooltip} = setup({fullscreenElement});

		expect(tooltip.parentNode).toBe(fullscreenElement);

		button.emit('mouseleave');

		expect(tooltip.parentNode).toBeNull();
		expect(fullscreenElement.childNodes).not.toContain(tooltip);
	});
});
