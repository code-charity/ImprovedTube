const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Settings import persistence', () => {
	let context;
	let importedFile;
	let input;
	let modal;
	let storageCallback;

	beforeEach(() => {
		jest.useFakeTimers();
		importedFile = JSON.stringify({theme: 'dark', player_volume: 80});
		input = {
			files: [{}],
			addEventListener: jest.fn((event, listener) => {
				if (event === 'change') input.changeListener = listener;
			}),
			click: jest.fn()
		};

		context = {
			Blob,
			URL,
			console,
			close: jest.fn(),
			location: {href: 'moz-extension://test/menu/index.html?action=import-settings'},
			document: {createElement: jest.fn(() => input)},
			FileReader: class {
				readAsText() {
					this.result = importedFile;
					this.onload();
				}
			},
			setTimeout,
			clearTimeout,
			extension: {skeleton: {rendered: {}}},
			satus: {
				events: {trigger: jest.fn()},
				storage: {
					data: {},
					set(key, value) {
						this.data[key] = value;
						context.chrome.storage.local.set({[key]: value}, () => {});
					}
				},
				render: jest.fn((skeleton) => {
					modal = skeleton;
				})
			},
			chrome: {
				runtime: {sendMessage: jest.fn()},
				storage: {
					local: {
						set: jest.fn((settings, callback) => {
							storageCallback = callback;
						})
					},
					sync: {
						get: jest.fn((key, callback) => {
							callback({settings: importedFile});
						})
					}
				}
			}
		};
		vm.runInNewContext(
			fs.readFileSync(path.join(__dirname, '../../menu/functions.js'), 'utf8'),
			context
		);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('waits for the imported settings to persist before notifying and closing', () => {
		context.extension.importSettings();
		modal.buttons.ok.on.click();
		input.changeListener.call(input);

		expect(context.chrome.storage.local.set).toHaveBeenCalledTimes(1);
		expect(context.chrome.storage.local.set.mock.calls[0][0]).toEqual({
			theme: 'dark',
			player_volume: 80
		});
		jest.runAllTimers();
		expect(context.chrome.runtime.sendMessage).not.toHaveBeenCalled();
		expect(context.close).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({});

		storageCallback();

		expect(context.satus.storage.data).toEqual({theme: 'dark', player_volume: 80});
		expect(context.chrome.runtime.sendMessage).toHaveBeenCalledWith({
			action: 'import-settings'
		});
		expect(context.close).toHaveBeenCalledTimes(1);
	});

	test('keeps browser-account restore open until the local write completes', () => {
		const modalProvider = {close: jest.fn()};

		context.extension.pullSettings();
		modal.buttons.ok.on.click.call({modalProvider});

		expect(modalProvider.close).not.toHaveBeenCalled();
		expect(context.satus.storage.data).toEqual({});

		storageCallback();

		expect(context.satus.storage.data).toEqual({theme: 'dark', player_volume: 80});
		expect(modalProvider.close).toHaveBeenCalledTimes(1);
	});
});
