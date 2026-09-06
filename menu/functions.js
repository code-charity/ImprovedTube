/*--------------------------------------------------------------
>>> FUNCTIONS:
----------------------------------------------------------------
# Attributes
# Export settings
# Import settings
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# ATTRIBUTES
--------------------------------------------------------------*/

extension.attributes = function () {
	var attributes = {
		theme: true,
		improvedtube_home: true,
		title_version: true,
		it_general: true,
		it_appearance: true,
		it_themes: true,
		it_player: true,
		it_playlist: true,
		it_channel: true,
		it_shortcuts: true,
		it_blocklist: true,
		it_analyzer: true,
		layer_animation_scale: false
	};

	for (var attribute in attributes) {
		var value = satus.storage.get(attribute);

		if (attribute === 'improvedtube_home') {
			attribute = 'home-style';
		}

		if (attribute === 'theme' && !value) {
			extension.skeleton.rendered.removeAttribute('theme');
		}

		if (satus.isset(value)) {
			extension.skeleton.rendered.setAttribute(attribute.replace('it_', '').replace(/_/g, '-'), value);
		}
	}
};

/*--------------------------------------------------------------
# EXPORT SETTINGS
--------------------------------------------------------------*/

extension.exportSettings = function () {
	if (location.href.indexOf('action=export-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToExportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							try {
								var now = new Date();
								var pad = function (value) {
									return (value < 10 ? '0' : '') + value;
								};
								var timestamp = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + '_' + pad(now.getHours()) + '-' + pad(now.getMinutes());
								var filename = 'improvedtube-settings-' + timestamp + '.json';
								var blob = new Blob([JSON.stringify(satus.storage.data)], {
									type: 'application/json;charset=utf-8'
								});
								var url = URL.createObjectURL(blob);

								// Detect Safari: Safari doesn't support chrome.downloads API
								var isSafari = /^((?!chrome|android|Firefox|Vivaldi|Edge|Brave|Opera|MSIE|OPR).)*safari/i.test(navigator.userAgent);
								var isChrome = typeof chrome !== 'undefined' && chrome.downloads;

								if (isSafari || !isChrome) {
									// Fallback for Safari: use anchor tag with download attribute
									var a = document.createElement('a');
									a.href = url;
									a.download = filename;
									document.body.appendChild(a);
									a.click();
									document.body.removeChild(a);
									setTimeout(function () {
										close();
									}, 1000);
								} else {
									// Use chrome.downloads API for Chrome/Edge/Firefox
									chrome.permissions.request({
										permissions: ['downloads']
									}, function (granted) {
										if (granted) {
											chrome.downloads.download({
												url: url,
												filename: filename,
												saveAs: true
											}, function () {
												setTimeout(function () {
													close();
												}, 1000);
											});
										}
									});
								}
							} catch (error) {
								console.error(error);
							}
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};

/*--------------------------------------------------------------
# IMPORT SETTINGS
--------------------------------------------------------------*/

// Keep the import UI open until one batch write makes the in-memory and persisted settings agree.
extension.applyImportedSettings = function (data, callback) {
	chrome.storage.local.set(data, function () {
		if (chrome.runtime.lastError) {
			if (callback) callback(chrome.runtime.lastError);

			return;
		}

		Object.assign(satus.storage.data, data);
		satus.events.trigger('storage-import');

		if (callback) callback();
	});
};

extension.importSettings = function () {
	if (location.href.indexOf('action=import-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToImportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							var input = document.createElement('input');

							input.type = 'file';

							input.addEventListener('change', function () {
								var file_reader = new FileReader();

								file_reader.onload = function () {
									var data = JSON.parse(this.result);

									extension.applyImportedSettings(data, function (error) {
										if (error) {
											console.error(error);

											return;
										}

										chrome.runtime.sendMessage({
											action: 'import-settings'
										});
										close();
									});
								};

								file_reader.readAsText(this.files[0]);
							});

							input.click();
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};

/*--------------------------------------------------------------
# sync SETTINGS
--------------------------------------------------------------*/

extension.pushSettings = function () {
	satus.render({
		component: 'modal',
		variant: 'confirm',
		content: 'areYouSureYouWantToSyncTheData',
		buttons: {
			cancel: {
				component: 'button',
				text: 'cancel',
				on: {
					click: function () {
						this.modalProvider.close();
					}
				}
			},
			ok: {
				component: 'button',
				text: 'ok',
				on: {
					click: function () {
						try {
							chrome.storage.sync.clear();
							var blob = JSON.stringify(satus.storage.data);
							chrome.storage.sync.set({settings: blob});
						} catch (error) {
							console.error(error);
						}
						this.modalProvider.close();
					}
				}
			}
		}
	}, extension.skeleton.rendered);
}

extension.pullSettings = function () {

	satus.render({
		component: 'modal',
		variant: 'confirm',
		content: 'areYouSureYouWantToImportTheData',
		buttons: {
			cancel: {
				component: 'button',
				text: 'cancel',
				on: {
					click: function () {
						this.modalProvider.close();
					}
				}
			},
			ok: {
				component: 'button',
				text: 'ok',
				on: {
					click: function () {
						var modal_provider = this.modalProvider;

						chrome.storage.sync.get('settings', function (r) {
							var data = JSON.parse(r['settings']);

							extension.applyImportedSettings(data, function (error) {
								if (error) {
									console.error(error);

									return;
								}

								modal_provider.close();
							});
						});
					}
				}
			}
		}
	}, extension.skeleton.rendered);
}
