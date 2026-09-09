/*--------------------------------------------------------------
>>> PLAYER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.player = {
	component: 'button',
	variant: 'player',
	category: true,
	on: {
		click: {}
	},

	icon: {
		component: 'span',

		svg: {
			component: 'svg',
			attr: {
				'viewBox': '0 0 24 24',
				'fill': 'transparent',
				'stroke': 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M5 3l14 9-14 9V3z'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'player'
	}
};

/*--------------------------------------------------------------
# SECTION
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.player.on.click = {
	section_1: {
		component: 'section',
		variant: 'card',
		autopause_when_switching_tabs: {
			component: 'switch',
			text: 'autopauseWhenSwitchingTabs',
			storage: 'player_autopause_when_switching_tabs',
			id: 'autopause_when_switching_tabs',
			on: {
				click: function () {
					if (this.dataset.value === 'true' && satus.storage.get('only_one_player_instance_playing')) {
						document.getElementById('only_one_player_instance_playing').flip(false);
					}
					if (this.dataset.value === 'true' && satus.storage.get('player_autoPip')) {
						document.getElementById('player_autoPip').flip(false);
					}
				}
			}
		},
		only_one_player_instance_playing: {
			component: 'switch',
			text: 'onlyOnePlayerInstancePlaying',
			id: 'only_one_player_instance_playing',
			on: {
				click: function () {
					if (this.dataset.value === 'true' && satus.storage.get('player_autopause_when_switching_tabs')) {
						document.getElementById('autopause_when_switching_tabs').flip(false);
					}
				}
			}
		},
		pause_while_typing_on_youtube: {
			component: 'switch',
			text: 'pauseWhileIAmTypingOnYouTube',
			storage: 'pause_while_typing_on_youtube',
			id: 'pause_while_typing_on_youtube',
		},
		player_auto_continue_watching: {
			component: 'switch',
			text: 'autoContinueWatching',
			storage: 'player_auto_continue_watching',
			id: 'player_auto_continue_watching',
			value: true
		},
		prevent_shorts_autoloop:{
			component: 'switch',
			text: 'preventShortVideoAutoloop',
			storage: 'prevent_shorts_autoloop',
		},
		shorts_auto_scroll: {
			component: 'switch',
			text: 'autoPlayNextShort',
			storage: 'shorts_auto_scroll'
		},
		autoplay_disable: {
			component: 'switch',
			text: 'autoplayDisable',
			storage: 'player_autoplay_disable'
		},
		up_next_autoplay: {
			component: 'switch',
			text: 'upNextAutoplay',
			value: true
		},
		ambient_lighting: {
			component: 'switch',
			text: 'ambientLighting',
			value: true
		},
		video_filters: {
			component: 'button',
			text: 'videoFilters',
			on: {
				click: {
					component: 'section',
					variant: 'card',
					video_filters_activate: {
						component: 'switch',
						text: 'activate',
						storage: 'video_filters_activate',
						value: false
					},
					video_filters_preset: {
						component: 'select',
						text: 'preset',
						storage: 'video_filters_preset',
						options: [{
							text: 'normal',
							value: 'normal'
						}, {
							text: 'vivid',
							value: 'vivid'
						}, {
							text: 'cinema',
							value: 'cinema'
						}, {
							text: 'warm',
							value: 'warm'
						}, {
							text: 'cool',
							value: 'cool'
						}, {
							text: 'custom',
							value: 'custom'
						}]
					},
					video_filter_brightness: {
						component: 'slider',
						variant: 'row',
						text: 'brightness',
						storage: 'video_filter_brightness',
						min: 50,
						max: 200,
						step: 5,
						value: 100
					},
					video_filter_contrast: {
						component: 'slider',
						variant: 'row',
						text: 'contrast',
						storage: 'video_filter_contrast',
						min: 50,
						max: 200,
						step: 5,
						value: 100
					},
					video_filter_saturation: {
						component: 'slider',
						variant: 'row',
						text: 'saturation',
						storage: 'video_filter_saturation',
						min: 0,
						max: 300,
						step: 10,
						value: 100
					},
					video_filter_hue: {
						component: 'slider',
						variant: 'row',
						text: 'hue',
						storage: 'video_filter_hue',
						min: -180,
						max: 180,
						step: 5,
						value: 0
					},
					video_filter_sharpness: {
						component: 'slider',
						variant: 'row',
						text: 'sharpness',
						storage: 'video_filter_sharpness',
						min: 0,
						max: 5,
						step: 0.5,
						value: 0
					},
					video_filter_gamma: {
						component: 'slider',
						variant: 'row',
						text: 'gamma',
						storage: 'video_filter_gamma',
						min: 0.5,
						max: 2.5,
						step: 0.1,
						value: 1
					}
				}
			}
		},
		player_autoPip: {
			component: 'switch',
			text: 'Auto_PiP_picture_in_picture',
			id: 'player_autoPip',
			custom: true,
			on: {
				click: function () {
					if (!document.pictureInPictureEnabled) return;
					if (this.dataset.value === 'false') {
						let where = this;
						satus.render({
							component: 'modal',
							variant: 'confirm',
							content: 'PipRequiresUserInteraction',
							ok: function () {
								// manually turn switch ON
								where.flip(true);
								if (satus.storage.get('player_autopause_when_switching_tabs')) {
									document.getElementById('only_one_player_instance_playing').flip(true);
									document.getElementById('autopause_when_switching_tabs').flip(false);
								}
							},
							cancel: function () {
								// nothing happens when we cancel
							}
						}, extension.skeleton.rendered);
					} else {
						// manually turn switch OFF
						this.flip(false);
					}
				}
			}
		},
		player_autoPip_outside: {
			component: 'switch',
			text: 'playerAutoPipOutside',
			id: 'player_autoPip_outside',
			value: true,
			on: {
				render: function () {
					if (!document.pictureInPictureEnabled) {
						document.getElementById('player_autoPip').remove();
						document.getElementById('player_autoPip_outside').remove();
					}
				}
			}
		},
		player_forced_volume: {
			component: 'switch',
			text: 'forcedVolume',
			id: 'forced-volume'
		},
		player_volume: {
			component: 'slider',
			text: 'volume',
			step: 1,
			max: 405,
			value: 100
		},
		player_loudness_normalization: {
			component: 'switch',
			text: 'loudnessNormalization',
			value: true
		},
		player_forced_playback_speed: {
			component: 'switch',
			text: 'forcedPlaybackSpeed',
			id: 'forced-playback-speed'
		},
		player_force_speed_on_music: {
			component: 'switch',
			text: 'forcedPlaybackSpeedMusic'
		},
		player_dont_speed_education: {
			component: 'switch',
			text: 'player_dont_speed_education',
		},
		player_playback_speed: {
			component: 'slider',
			text: 'playbackSpeed',
			textarea: true,
			value: 1,
			min: .01,
			max: 3.17,
			step: .01
		},
		smart_speed: {
			component: 'button',
			text: 'smartSpeedEngine',
			on: {
				click: {
					component: 'section',
					variant: 'card',
					smart_speed_card: {
						component: 'section',
						variant: 'card',
						smart_speed: {
							component: 'switch',
							text: 'smartSpeedEnable',
							value: false
						},
						smart_speed_indicator: {
							component: 'switch',
							text: 'smartSpeedIndicator',
							value: true
						},
						smart_speed_min: {
							component: 'slider',
							text: 'smartSpeedMin',
							value: 1.0, min: 0.5, max: 2.0, step: 0.1
						},
						smart_speed_max: {
							component: 'slider',
							text: 'smartSpeedMax',
							value: 2.0, min: 1.0, max: 4.0, step: 0.1
						},
						smart_speed_sensitivity: {
							component: 'slider',
							text: 'smartSpeedSensitivity',
							value: 0.5, min: 0.01, max: 1.0, step: 0.01
						}
					},
					smart_speed_profiles_card: {
						component: 'button',
						text: 'smartSpeedProfiles',
						on: {
							click: {
								component: 'section',
								variant: 'card',
								smart_speed_profile_list: {
									component: 'section',
									on: {
										render: function () {
											let container = this;

											function updateView() {
												container.innerHTML = '';
												let skeleton = {};
												let ts = Date.now(); // Unique ID to prevent caching bugs

												// THE FIX: Check if strictly undefined (first time setup), NOT if it's empty
												let storedProfiles = satus.storage.get('smart_speed_profiles');
												let profiles;

												if (storedProfiles === undefined) {
													// 100% strict defaults as requested
													profiles = {
														"Music": { max: 2.0, min: 1.0, sens: 0.5, whitelist: true },
														"Education": { max: 2.0, min: 1.0, sens: 0.5, whitelist: false }
													};
													satus.storage.set('smart_speed_profiles', profiles);
												} else {
													// It's not the first run, respect the user's list (even if it's completely empty!)
													profiles = typeof storedProfiles === 'object' && storedProfiles !== null ? storedProfiles : {};
												}

												let tempCategory = 'none';

												// 1. ADD NEW RULES SECTION
												skeleton['add_controls_' + ts] = {
													component: 'section',
													variant: 'card',

													add_category_dropdown: {
														component: 'select',
														text: '1. Select YouTube Category',
														options: [
															{value: 'none', text: 'Select Category...'},
															{value: 'Entertainment', text: 'Entertainment'},
															{value: 'Music', text: 'Music'},
															{value: 'Gaming', text: 'Gaming'},
															{value: 'People & Blogs', text: 'People & Blogs'},
															{value: 'Comedy', text: 'Comedy'},
															{value: 'Howto & Style', text: 'Howto & Style'},
															{value: 'Film & Animation', text: 'Film & Animation'},
															{value: 'Education', text: 'Education'},
															{value: 'Science & Technology', text: 'Science & Technology'},
															{value: 'Sports', text: 'Sports'},
															{value: 'News & Politics', text: 'News & Politics'},
															{value: 'Autos & Vehicles', text: 'Autos & Vehicles'},
															{value: 'Travel & Events', text: 'Travel & Events'},
															{value: 'Pets & Animals', text: 'Pets & Animals'},
															{value: 'Nonprofits & Activism', text: 'Nonprofits & Activism'}
														],
														on: {
															change: function() { tempCategory = this.value; }
														}
													},
													add_category_btn: {
														component: 'button',
														text: '➕ Add Selected Category',
														on: {
															click: function() {
																if (tempCategory !== 'none') {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles') || {});
																	let newObj = {};
																	// 100% strict defaults as requested
																	newObj[tempCategory] = { max: 2.0, min: 1.0, sens: 0.5, whitelist: false };

																	satus.storage.set('smart_speed_profiles', Object.assign(newObj, freshState));
																	updateView();
																}
															}
														}
													},

													add_channel_btn: {
														component: 'button',
														text: '➕ Enter & Add Channel Name',
														on: {
															click: function() {
																let name = prompt("Enter Channel Handle (e.g., @MrBeast) or Name:");
																if (name) {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles') || {});
																	let newObj = {};
																	// 100% strict defaults as requested
																	newObj[name] = { max: 2.0, min: 1.0, sens: 0.5, whitelist: false };

																	satus.storage.set('smart_speed_profiles', Object.assign(newObj, freshState));
																	updateView();
																}
															}
														}
													}
												};

												// 2. ACTIVE RULES LIST
												for (let key in profiles) {
													let safeKey = key.replace(/[^a-zA-Z0-9]/g, '');
													skeleton['rule_' + safeKey + '_' + ts] = {
														component: 'section',
														variant: 'card',
														title: key,
														whitelist_toggle: {
															component: 'switch',
															text: 'Whitelist (Disable Speedup)',
															value: profiles[key].whitelist || false,
															on: {
																change: function() {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles'));
																	freshState[key].whitelist = this.dataset.value === 'true';
																	satus.storage.set('smart_speed_profiles', freshState);
																}
															}
														},
														max_slider: {
															component: 'slider', text: 'Max Speed', value: profiles[key].max, min: 1.0, max: 4.0, step: 0.1,
															on: {
																change: function() {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles'));
																	freshState[key].max = Number(this.value);
																	satus.storage.set('smart_speed_profiles', freshState);
																}
															}
														},
														min_slider: {
															component: 'slider', text: 'Min Speed', value: profiles[key].min, min: 0.5, max: 2.0, step: 0.1,
															on: {
																change: function() {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles'));
																	freshState[key].min = Number(this.value);
																	satus.storage.set('smart_speed_profiles', freshState);
																}
															}
														},
														sens_slider: {
															component: 'slider', text: 'Sensitivity', value: profiles[key].sens || 0.5, min: 0.01, max: 1.0, step: 0.01,
															on: {
																change: function() {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles'));
																	freshState[key].sens = Number(this.value);
																	satus.storage.set('smart_speed_profiles', freshState);
																}
															}
														},
														delete_btn: {
															component: 'button', text: '🗑️ Delete Profile',
															on: {
																click: function() {
																	let freshState = Object.assign({}, satus.storage.get('smart_speed_profiles'));
																	delete freshState[key];
																	satus.storage.set('smart_speed_profiles', freshState);
																	updateView();
																}
															}
														}
													};
												}

												satus.render(skeleton, container);
											}

											updateView();
										}
									}
								}
							}
						}
					}
				}
			}
		},
		autofullscreen: {
			component: 'switch',
			text: 'autoFullscreen',
			storage: 'player_autofullscreen'
		},
		return_youtube_dislike: {
			component: 'switch',
			text: 'returnYoutubeDislike',
			tags: 'dislike dislikes thumbs down rating ryd',
			id: 'return_youtube_dislike',
			custom: true,
			on: {
				click: function () {
					const switchEl = this;
					if (this.dataset.value === 'false') {
						chrome.permissions.request({
							origins: ['https://returnyoutubedislikeapi.com/*']
						}, function (granted) {
							if (granted) {
								switchEl.flip(true);
							} else {
								console.log('[ImprovedTube] RYD: Permission denied by user');
							}
						});
					} else {
						switchEl.flip(false);
					}
				}
			}
		},
		subtitles: {
			component: 'button',
			text: 'subtitles',
			on: {
				click: {
					component: 'section',
					variant: 'card',

					player_subtitles: {
						component: 'select',
						text: 'subtitles',
						options: [{
							value: 'auto',
							text: 'auto'
						}, {
							value: 'enabled',
							text: 'enabled'
						}, {
							value: 'disabled',
							text: 'disabled'
						}]
					},
					subtitles_language: {
						component: 'select',
						text: 'language',
						id: 'language_closed_caption',
						options: [{
							value: 'default',
							text: 'default_CC'
						}, {
							value: 'af',
							text: 'Afrikaans'
						}, {
							value: 'sq',
							text: 'Albanian'
						}, {
							value: 'am',
							text: 'Amharic'
						}, {
							value: 'ar',
							text: 'Arabic'
						}, {
							value: 'hy',
							text: 'Armenian'
						}, {
							value: 'az',
							text: 'Azerbaijani'
						}, {
							value: 'bn',
							text: 'Bangla'
						}, {
							value: 'eu',
							text: 'Basque'
						}, {
							value: 'be',
							text: 'Belarusian'
						}, {
							value: 'bs',
							text: 'Bosnian'
						}, {
							value: 'bg',
							text: 'Bulgarian'
						}, {
							value: 'my',
							text: 'Burmese'
						}, {
							value: 'ca',
							text: 'Catalan'
						}, {
							value: 'ceb',
							text: 'Cebuano'
						}, {
							value: 'zh-Hans',
							text: 'Chinese (Simplified)'
						}, {
							value: 'zh-Hant',
							text: 'Chinese (Traditional)'
						}, {
							value: 'co',
							text: 'Corsican'
						}, {
							value: 'hr',
							text: 'Croatian'
						}, {
							value: 'cs',
							text: 'Czech'
						}, {
							value: 'da',
							text: 'Danish'
						}, {
							value: 'nl',
							text: 'Dutch'
						}, {
							value: 'en',
							text: 'English'
						}, {
							value: 'eo',
							text: 'Esperanto'
						}, {
							value: 'et',
							text: 'Estonian'
						}, {
							value: 'fil',
							text: 'Filipino'
						}, {
							value: 'fi',
							text: 'Finnish'
						}, {
							value: 'fr',
							text: 'French'
						}, {
							value: 'gl',
							text: 'Galician'
						}, {
							value: 'ka',
							text: 'Georgian'
						}, {
							value: 'de',
							text: 'German'
						}, {
							value: 'el',
							text: 'Greek'
						}, {
							value: 'gu',
							text: 'Gujarati'
						}, {
							value: 'ht',
							text: 'Haitian Creole'
						}, {
							value: 'ha',
							text: 'Hausa'
						}, {
							value: 'haw',
							text: 'Hawaiian'
						}, {
							value: 'iw',
							text: 'Hebrew'
						}, {
							value: 'hi',
							text: 'Hindi'
						}, {
							value: 'hmn',
							text: 'Hmong'
						}, {
							value: 'hu',
							text: 'Hungarian'
						}, {
							value: 'is',
							text: 'Icelandic'
						}, {
							value: 'ig',
							text: 'Igbo'
						}, {
							value: 'id',
							text: 'Indonesian'
						}, {
							value: 'ga',
							text: 'Irish'
						}, {
							value: 'it',
							text: 'Italian'
						}, {
							value: 'ja',
							text: 'Japanese'
						}, {
							value: 'jv',
							text: 'Javanese'
						}, {
							value: 'kn',
							text: 'Kannada'
						}, {
							value: 'kk',
							text: 'Kazakh'
						}, {
							value: 'km',
							text: 'Khmer'
						}, {
							value: 'rw',
							text: 'Kinyarwanda'
						}, {
							value: 'ko',
							text: 'Korean'
						}, {
							value: 'ku',
							text: 'Kurdish'
						}, {
							value: 'ky',
							text: 'Kyrgyz'
						}, {
							value: 'lo',
							text: 'Lao'
						}, {
							value: 'la',
							text: 'Latin'
						}, {
							value: 'lv',
							text: 'Latvian'
						}, {
							value: 'lt',
							text: 'Lithuanian'
						}, {
							value: 'lb',
							text: 'Luxembourgish'
						}, {
							value: 'mk',
							text: 'Macedonian'
						}, {
							value: 'mg',
							text: 'Malagasy'
						}, {
							value: 'ms',
							text: 'Malay'
						}, {
							value: 'ml',
							text: 'Malayalam'
						}, {
							value: 'mt',
							text: 'Maltese'
						}, {
							value: 'mi',
							text: 'Maori'
						}, {
							value: 'mr',
							text: 'Marathi'
						}, {
							value: 'mn',
							text: 'Mongolian'
						}, {
							value: 'ne',
							text: 'Nepali'
						}, {
							value: 'no',
							text: 'Norwegian'
						}, {
							value: 'ny',
							text: 'Nyanja'
						}, {
							value: 'or',
							text: 'Odia'
						}, {
							value: 'ps',
							text: 'Pashto'
						}, {
							value: 'fa',
							text: 'Persian'
						}, {
							value: 'pl',
							text: 'Polish'
						}, {
							value: 'pt',
							text: 'Portuguese'
						}, {
							value: 'pa',
							text: 'Punjabi'
						}, {
							value: 'ro',
							text: 'Romanian'
						}, {
							value: 'ru',
							text: 'Russian'
						}, {
							value: 'sm',
							text: 'Samoan'
						}, {
							value: 'gd',
							text: 'Scottish Gaelic'
						}, {
							value: 'sr',
							text: 'Serbian'
						}, {
							value: 'sn',
							text: 'Shona'
						}, {
							value: 'sd',
							text: 'Sindhi'
						}, {
							value: 'si',
							text: 'Sinhala'
						}, {
							value: 'sk',
							text: 'Slovak'
						}, {
							value: 'sl',
							text: 'Slovenian'
						}, {
							value: 'so',
							text: 'Somali'
						}, {
							value: 'st',
							text: 'Southern Sotho'
						}, {
							value: 'es',
							text: 'Spanish'
						}, {
							value: 'su',
							text: 'Sundanese'
						}, {
							value: 'sw',
							text: 'Swahili'
						}, {
							value: 'sv',
							text: 'Swedish'
						}, {
							value: 'tg',
							text: 'Tajik'
						}, {
							value: 'ta',
							text: 'Tamil'
						}, {
							value: 'tt',
							text: 'Tatar'
						}, {
							value: 'te',
							text: 'Telugu'
						}, {
							value: 'th',
							text: 'Thai'
						}, {
							value: 'tr',
							text: 'Turkish'
						}, {
							value: 'tk',
							text: 'Turkmen'
						}, {
							value: 'uk',
							text: 'Ukrainian'
						}, {
							value: 'ur',
							text: 'Urdu'
						}, {
							value: 'ug',
							text: 'Uyghur'
						}, {
							value: 'uz',
							text: 'Uzbek'
						}, {
							value: 'vi',
							text: 'Vietnamese'
						}, {
							value: 'cy',
							text: 'Welsh'
						}, {
							value: 'fy',
							text: 'Western Frisian'
						}, {
							value: 'xh',
							text: 'Xhosa'
						}, {
							value: 'yi',
							text: 'Yiddish'
						}, {
							value: 'yo',
							text: 'Yoruba'
						}, {
							value: 'zu',
							text: 'Zulu'
						}]
					},
					auto_generate: {
						component: 'switch',
						text: 'Allow_auto_generate'
					},
					subtitles_font_family: {
						component: 'select',
						text: 'fontFamily',
						options: [{
							text: 'Proportional Sans-Serif',
							value: 4
						}, {
							text: 'Monospaced Serif',
							value: 1
						}, {
							text: 'Proportional Serif',
							value: 2
						}, {
							text: 'Monospaced Sans-Serif',
							value: 3
						}, {
							text: 'Casual',
							value: 5
						}, {
							text: 'Cursive',
							value: 6
						}, {
							text: 'Small Capitals',
							value: 7
						}]
					},
					subtitles_font_color: {
						component: 'select',
						text: 'fontColor',
						options: [{
							text: 'white',
							value: '#fff'
						}, {
							text: 'yellow',
							value: '#ff0'
						}, {
							text: 'green',
							value: '#0f0'
						}, {
							value: 'cyan',
							text: 'cyan',
							value: '#0ff'
						}, {
							text: 'blue',
							value: '#00f'
						}, {
							text: 'magenta',
							value: '#f0f'
						}, {
							text: 'red',
							value: '#f00'
						}, {
							text: 'black',
							value: '#000'
						}]
					},
					subtitles_font_size: {
						component: 'select',
						text: 'fontSize',
						options: [{
							text: '100%',
							value: 0
						}, {
							text: '75%',
							value: -1
						}, {
							text: '50%',
							value: -2
						}, {
							text: '150%',
							value: 1
						}, {
							text: '200%',
							value: 2
						}, {
							text: '300%',
							value: 3
						}, {
							text: '400%',
							value: 4
						}]
					},
					subtitles_background_color: {
						component: 'select',
						text: 'backgroundColor',
						options: [{
							text: 'white',
							value: '#fff'
						}, {
							text: 'yellow',
							value: '#ff0'
						}, {
							text: 'green',
							value: '#0f0'
						}, {
							value: 'cyan',
							text: 'cyan',
							value: '#0ff'
						}, {
							text: 'blue',
							value: '#00f'
						}, {
							text: 'magenta',
							value: '#f0f'
						}, {
							text: 'red',
							value: '#f00'
						}, {
							text: 'black',
							value: '#000'
						}]
					},
					subtitles_background_opacity: {
						component: 'slider',
						text: 'backgroundOpacity',
						value: 75,
						min: 0,
						max: 100,
						step: 1
					},
					subtitles_window_color: {
						component: 'select',
						text: 'windowColor',
						options: function () {
							return extension.skeleton.main.layers.section.player.on.click.section_1.subtitles.on.click.subtitles_background_color.options;
						}
					},
					subtitles_window_opacity: {
						component: 'slider',
						text: 'windowOpacity',
						value: 0,
						min: 0,
						max: 100,
						step: 1
					},
					subtitles_character_edge_style: {
						component: 'select',
						text: 'characterEdgeStyle',
						options: [{
							text: 'none',
							value: 0
						}, {
							text: 'dropShadow',
							value: 4
						}, {
							text: 'raised',
							value: 1
						}, {
							text: 'depressed',
							value: 2
						}, {
							text: 'outline',
							value: 3
						}]
					},
					subtitles_font_opacity: {
						component: 'slider',
						text: 'fontOpacity',
						value: 100,
						min: 0,
						max: 100,
						step: 1
					},
					subtitles_disable_lyrics: {
						component: 'switch',
						text: 'RemoveSubtitlesForLyrics'
					}
				}
			}
		},
		disable_auto_dubbing: {
			component: 'switch',
			text: 'disableAutoDubbing'
		},
		hide_auto_dubbed_options: {
    component: 'switch',
    text: 'hideAutoDubbedOptions'
		},
		preferred_dubbing_language: {
			component: 'input',
			text: 'preferredDubbingLanguage',
			placeholder: 'e.g. en, fr, de, ja'
    },
		player_default_dubbed_language: {
			component: 'select',
			text: 'defaultDubbedLanguage',
			options: [{
				value: 'disabled',
				text: 'disabled'
			}, {
				value: 'af',
				text: 'Afrikaans'
			}, {
				value: 'sq',
				text: 'Albanian'
			}, {
				value: 'am',
				text: 'Amharic'
			}, {
				value: 'ar',
				text: 'Arabic'
			}, {
				value: 'hy',
				text: 'Armenian'
			}, {
				value: 'az',
				text: 'Azerbaijani'
			}, {
				value: 'bn',
				text: 'Bangla'
			}, {
				value: 'eu',
				text: 'Basque'
			}, {
				value: 'be',
				text: 'Belarusian'
			}, {
				value: 'bs',
				text: 'Bosnian'
			}, {
				value: 'bg',
				text: 'Bulgarian'
			}, {
				value: 'my',
				text: 'Burmese'
			}, {
				value: 'ca',
				text: 'Catalan'
			}, {
				value: 'zh-Hans',
				text: 'Chinese (Simplified)'
			}, {
				value: 'zh-Hant',
				text: 'Chinese (Traditional)'
			}, {
				value: 'hr',
				text: 'Croatian'
			}, {
				value: 'cs',
				text: 'Czech'
			}, {
				value: 'da',
				text: 'Danish'
			}, {
				value: 'nl',
				text: 'Dutch'
			}, {
				value: 'en',
				text: 'English'
			}, {
				value: 'et',
				text: 'Estonian'
			}, {
				value: 'fil',
				text: 'Filipino'
			}, {
				value: 'fi',
				text: 'Finnish'
			}, {
				value: 'fr',
				text: 'French'
			}, {
				value: 'gl',
				text: 'Galician'
			}, {
				value: 'ka',
				text: 'Georgian'
			}, {
				value: 'de',
				text: 'German'
			}, {
				value: 'el',
				text: 'Greek'
			}, {
				value: 'gu',
				text: 'Gujarati'
			}, {
				value: 'iw',
				text: 'Hebrew'
			}, {
				value: 'hi',
				text: 'Hindi'
			}, {
				value: 'hu',
				text: 'Hungarian'
			}, {
				value: 'is',
				text: 'Icelandic'
			}, {
				value: 'id',
				text: 'Indonesian'
			}, {
				value: 'ga',
				text: 'Irish'
			}, {
				value: 'it',
				text: 'Italian'
			}, {
				value: 'ja',
				text: 'Japanese'
			}, {
				value: 'kn',
				text: 'Kannada'
			}, {
				value: 'kk',
				text: 'Kazakh'
			}, {
				value: 'km',
				text: 'Khmer'
			}, {
				value: 'ko',
				text: 'Korean'
			}, {
				value: 'ky',
				text: 'Kyrgyz'
			}, {
				value: 'lo',
				text: 'Lao'
			}, {
				value: 'lv',
				text: 'Latvian'
			}, {
				value: 'lt',
				text: 'Lithuanian'
			}, {
				value: 'mk',
				text: 'Macedonian'
			}, {
				value: 'ms',
				text: 'Malay'
			}, {
				value: 'ml',
				text: 'Malayalam'
			}, {
				value: 'mt',
				text: 'Maltese'
			}, {
				value: 'mr',
				text: 'Marathi'
			}, {
				value: 'mn',
				text: 'Mongolian'
			}, {
				value: 'ne',
				text: 'Nepali'
			}, {
				value: 'no',
				text: 'Norwegian'
			}, {
				value: 'fa',
				text: 'Persian'
			}, {
				value: 'pl',
				text: 'Polish'
			}, {
				value: 'pt',
				text: 'Portuguese'
			}, {
				value: 'pa',
				text: 'Punjabi'
			}, {
				value: 'ro',
				text: 'Romanian'
			}, {
				value: 'ru',
				text: 'Russian'
			}, {
				value: 'sr',
				text: 'Serbian'
			}, {
				value: 'si',
				text: 'Sinhala'
			}, {
				value: 'sk',
				text: 'Slovak'
			}, {
				value: 'sl',
				text: 'Slovenian'
			}, {
				value: 'so',
				text: 'Somali'
			}, {
				value: 'es',
				text: 'Spanish'
			}, {
				value: 'sw',
				text: 'Swahili'
			}, {
				value: 'sv',
				text: 'Swedish'
			}, {
				value: 'tg',
				text: 'Tajik'
			}, {
				value: 'ta',
				text: 'Tamil'
			}, {
				value: 'tt',
				text: 'Tatar'
			}, {
				value: 'te',
				text: 'Telugu'
			}, {
				value: 'th',
				text: 'Thai'
			}, {
				value: 'tr',
				text: 'Turkish'
			}, {
				value: 'tk',
				text: 'Turkmen'
			}, {
				value: 'uk',
				text: 'Ukrainian'
			}, {
				value: 'ur',
				text: 'Urdu'
			}, {
				value: 'ug',
				text: 'Uyghur'
			}, {
				value: 'uz',
				text: 'Uzbek'
			}, {
				value: 'vi',
				text: 'Vietnamese'
			}, {
				value: 'cy',
				text: 'Welsh'
			}, {
				value: 'xh',
				text: 'Xhosa'
			}, {
				value: 'yi',
				text: 'Yiddish'
			}, {
				value: 'yo',
				text: 'Yoruba'
			}, {
				value: 'zu',
				text: 'Zulu'
			}]
		},
		player_quality: {
			component: 'select',
			text: 'quality',
			id: 'player_quality',
			options: [{
				text: 'disabled',
				value: 'disabled'
			}, {
				text: 'auto',
				value: 'auto'
			}, {
				text: '144p',
				value: 'tiny'
			}, {
				text: '240p',
				value: 'small'
			}, {
				text: '360p',
				value: 'medium'
			}, {
				text: '480p',
				value: 'large'
			}, {
				text: '720p',
				value: 'hd720'
			}, {
				text: '1080p',
				value: 'hd1080'
			}, {
				text: '1440p',
				value: 'hd1440'
			}, {
				text: '2160p (4K UHD)',
				value: 'hd2160'
			}, {
				text: '2880p',
				value: 'hd2880'
			}, {
				text: '4320p',
				value: 'highres'
			}],
			on: {
				render: function () {
					// relies on options.text above auto always starting with a number for parseInt to work
					const options = this.childNodes[2].options,
						index = this.childNodes[2].selectedIndex;
					cutoff = 1080;
					if (satus.storage.get('player_h264')) {
						if (parseInt(options[index].text) > cutoff) {
							this.childNodes[1].style = 'color: red!important; font-weight: bold;';
							this.childNodes[1].textContent = '1080p';
						} else {
							this.childNodes[1].removeAttribute('style');
							this.childNodes[1].textContent = options[index].text;
						}
						for (const [i, node] of Array.from(options).entries()) {
							if (parseInt(node.text) > cutoff) {
								this.childNodes[2].childNodes[i].style = 'color: red!important; font-weight: bold;';
							}
						}
					} else if (satus.storage.get('block_vp9') && satus.storage.get('block_h264')) {
						this.childNodes[1].style = 'color: red!important; font-weight: bold;';
						this.childNodes[1].textContent = 'Video disabled';
					} else {
						this.childNodes[1].removeAttribute('style');
						this.childNodes[1].textContent = options[index].text;
						for (const node of options) {
							node.removeAttribute('style');
						}
					}
				}
			}
		},
		player_quality_without_focus: {
			component: 'select',
			text: 'qualityWithoutFocus',
			id: 'player_quality_without_focus',
			options: function () {
				return extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.options;
			},
			on: {
				render: function () {
					extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.on.render.call(this);
				}
			}
		},
		full_screen_quality: {
		  component: 'select',
			text: 'fullScreenQuality',
			id: 'full_screen_quality',
			options: function () {
				return extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.options;
			},
			on: {
				render: function () {
					extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.on.render.call(this)
				}
			}
		},
		player_quality_playlist: {
      component: 'select',
      text: 'playlistQuality',
      id: 'player_quality_playlist',
      options: function () {
      	return extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.options;
      },
      on: {
        render: function () {
					extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.on.render.call(this)
        }
      }
		},
		/*
	qualityWhenRunningOnBattery: {
			component: 'select',
			text: 'qualityWhenRunningOnBattery',
			options: function () {
				return extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.options;
			},
			on: {
				render: function () {
						extension.skeleton.main.layers.section.player.on.click.section_1.player_quality.on.render.call(this);
				}
			}
		},
		whenBatteryIslowDecreaseQuality: {
			component: 'switch',
			text: 'whenBatteryIslowDecreaseQuality'
		},
		pauseWhileIUnplugTheCharger: {
			component: 'switch',
			text: 'pauseWhileIUnplugTheCharger'
		},
*/
		mini_player: {
			component: 'switch',
			text: 'customMiniPlayer'
		},
		forced_play_video_from_the_beginning: {
			component: 'switch',
			text: 'forcedPlayVideoFromTheBeginning'
		},
		player_crop_chapter_titles: {
			component: 'switch',
			text: 'cropChapterTitles',
			value: true
		},
		player_codecs: {
			component: 'button',
			text: 'codecs',
			style: {
				justifyContent: 'space-between'
			},
			on: {
				click: {
					section: {
						component: 'section',
						variant: 'card',
						block_av1: {
							component: 'switch',
							text: 'blockAv1',
							on: {
								click: function () {
									this.parentElement.skeleton.sanitize();
								}
							}
						},
						block_vp9: {
							component: 'switch',
							text: 'blockVp9',
							value: false,
							custom: true,
							on: {
								click: function () {
									if (this.dataset.value === 'false') {
										if (satus.storage.get('block_h264')) {
											let where = this;
											satus.render({
												component: 'modal',
												variant: 'confirm',
												content: 'block_Codec_Alert_VP9',
												ok: function () {
													where.flip(true);
													where.parentElement.skeleton.sanitize();
												},
												cancel: function () {
												}
											}, extension.skeleton.rendered);
										} else {
											this.flip(true);
											this.parentElement.skeleton.sanitize();
										}
									} else {
										this.flip(false);
										this.parentElement.skeleton.sanitize();
									}
								}
							}
						},
						block_h264: {
							component: 'switch',
							text: 'blockH264',
							value: false,
							custom: true,
							on: {
								click: function () {
									if (this.dataset.value === 'false') {
										if (satus.storage.get('block_vp9')) {
											let where = this;
											satus.render({
												component: 'modal',
												variant: 'confirm',
												content: 'block_Codec_Alert_h264',
												ok: function () {
													where.flip(true);
													where.parentElement.skeleton.sanitize();
												},
												cancel: function () {
												}
											}, extension.skeleton.rendered);
										} else {
											this.flip(true);
											this.parentElement.skeleton.sanitize();
										}
									} else {
										this.flip(false);
										this.parentElement.skeleton.sanitize();
									}
								}
							}
						},
						sanitize: function () {
							if (satus.storage.get('player_h264')) {
								if ((!satus.storage.get('block_vp9') || !satus.storage.get('block_av1') && satus.storage.get('block_h264')) ||
									(satus.storage.get('block_vp9') && satus.storage.get('block_av1') && satus.storage.get('block_h264'))) {
									satus.storage.set('player_h264', false);
								}
							} else if (satus.storage.get('block_vp9') && satus.storage.get('block_av1') && !satus.storage.get('block_h264')) {
								satus.storage.set('player_h264', true);
							}
						}
					}
				}
			},
			list: {
				component: 'span',
				id: 'player_codecs',
				style: {
					opacity: .64
				},
				on: {
					render: function () {
						var codecs = (satus.storage.get('block_h264') ? '' : 'h.264 ') + (satus.storage.get('block_vp9') ? '' : 'vp9 ') + (satus.storage.get('block_av1') ? '' : 'av1');

						if (codecs.includes('h.264') || codecs.includes('vp9')) {
							this.style = '';
							this.textContent = codecs;
						} else if (codecs) {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = codecs;
						} else {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = 'none';
						}
					}
				}
			}
		},
		h264: {
			component: 'switch',
			text: 'codecH264',
			storage: 'player_h264',
			value: false,
			custom: true,
			on: {
				click: function () {
					let skeleton = this.parentNode.skeleton;
					// refresh player_codecs/optimize_codec_for_hardware_acceleration elements when we change codecs
					let refresh = function () {
						document.getElementById('player_quality').dispatchEvent(new CustomEvent('render'));
						document.getElementById('player_codecs').dispatchEvent(new CustomEvent('render'));
						document.getElementById('optimize_codec_for_hardware_acceleration').dispatchEvent(new CustomEvent('render'));
						document.getElementById('player_quality_without_focus').dispatchEvent(new CustomEvent('render'));
						document.getElementById('full_screen_quality')?.dispatchEvent(new CustomEvent('render'));
						document.getElementById('player_quality_playlist')?.dispatchEvent(new CustomEvent('render'))
						//document.getElementById('quality_when_low_battery').dispatchEvent(new CustomEvent('render'));
					}
					if (this.dataset.value === 'false') {
						let where = this;
						satus.render({
							component: 'modal',
							variant: 'confirm',
							content: 'youtubeLimitsVideoQualityTo1080pForH264Codec',
							ok: function () {
								// manually turn switch ON
								where.flip(true);
								satus.storage.set('block_vp9', true);
								satus.storage.set('block_av1', true);
								satus.storage.set('block_h264', false);
								refresh();
							},
							cancel: function () {
								// nothing happens when we cancel
							}
						}, extension.skeleton.rendered);
					} else {
						// manually turn switch OFF
						this.flip(false);
						// reset all codecs to unlocked state
						satus.storage.set('block_vp9', false);
						satus.storage.set('block_av1', false);
						satus.storage.set('block_h264', false);
						refresh();
					}
				}
			}
		},
		optimize_codec_for_hardware_acceleration: {
			component: 'button',
			text: 'optimizeCodecForHardwareAcceleration',
			style: {
				justifyContent: 'space-between'
			},
			on: {
				click: function () {
					//put some code here
				}
			},
			list: {
				component: 'span',
				id: 'optimize_codec_for_hardware_acceleration',
				style: {
					opacity: .64
				},
				on: {
					render: function () {
						// put some code here looking up GPU  capabilities and comparing to currrent codec selection
						var codecs = (satus.storage.get('block_h264') ? '' : 'h.264 ') + (satus.storage.get('block_vp9') ? '' : 'vp9 ') + (satus.storage.get('block_av1') ? '' : 'av1');

						if (1) { // todo
							this.style = '';
							this.textContent = satus.locale.get('Feature_not_yet_available');
						} else if (2) { // todo
							this.style = '';
							this.textContent = satus.locale.get('GPUnotindatabase');
						} else if (codecs) {
							this.style = 'color: green!important; font-weight: bold;';
							this.textContent = satus.locale.get('Optimal');
						} else {
							this.style = 'color: red!important; font-weight: bold;';
							this.textContent = satus.locale.get('Not_optimal');
						}
					}
				}
			}
		},
		player_60fps: {
			component: 'switch',
			text: 'allow60fps',
			value: true
		},
		sdr: {
			component: 'switch',
			text: 'forceSDR',
			storage: 'player_SDR'
		},
		player_hide_progress_preview: {
			component: 'switch',
			text: 'hideProgressBarPreview',
			storage: 'player_hide_progress_preview'
		},
	},
	section_2: {
		component: 'section',
		variant: 'card',
		title: 'buttons',
		player_popup_button: {
			component: 'switch',
			text: 'popupPlayer'
		},
		player_repeat_button: {
			component: 'switch',
			text: 'repeat',
			id: 'player_repeat_button'
		},
		player_always_repeat: {
			component: 'switch',
			text: 'alwaysActive',
			on: {
				click: function () {
					if (this.dataset.value === 'true') {
						document.getElementById('player_repeat_button').flip(true);
					}
				}
			}
		},
		player_screenshot_button: {
			component: 'switch',
			text: 'screenshot',
			id: 'player_screenshot_button'
		},
		player_video_filters_button: {
			component: 'switch',
			text: 'videoFiltersButton',
			id: 'player_video_filters_button',
			storage: 'player_video_filters_button',
			value: true
		},
		embed_subtitle: {
			component: 'switch',
			text: 'Subtitle_Capture_including_the_current_words',
			value: true
		},
		player_screenshot_save_as: {
			component: 'select',
			text: 'saveAs',
			options: function () {
				let options = [{
					text: 'file',
					value: 'file'
				}];
				if (typeof ClipboardItem == 'function') {
					options.push({
						text: 'clipboard',
						value: 'clipboard'
					});
				}
				return options;
			}
		},

		player_playback_speed_button: {
			component: 'switch',
			text: 'playbackSpeedButton',
			storage: 'player_playback_speed_button',
			id: 'player_playback_speed_button'
		},
		
		player_playback_speed_button_b: {
			component: 'switch',
			text: 'playbackSpeedButton',
			storage: 'player_playback_speed_button_b',
			id: 'player_playback_speed_button_b',
		},
		player_playback_speed_button_b_slider: {
			id: 'player_custom_playback_speed',
			storage: 'player_custom_playback_speed',
			component: 'slider',
			text: 'preferredSpeed',
			min: 0.25,
			max: 4,
			step: 0.05,
			value: 1.25
		},
		
		player_cinema_mode_button: {
			component: 'switch',
			text: 'player_cinema_mode_button',
			id: 'player_cinema_mode_button'
		},
		player_auto_cinema_mode: {
			component: 'switch',
			text: 'player_auto_cinema_mode',
			id: 'player_auto_cinema_mode',
			on: {
				click: function () {
					if (this.dataset.value === 'true') {
						document.getElementById('player_cinema_mode_button').flip(true);
					}
				}
			}
		},
		player_auto_hide_cinema_mode_when_paused: {
			component: 'switch',
			text: 'player_auto_hide_cinema_mode_when_paused',
			on: {
				click: function () {
					if (this.dataset.value === 'true') {
						document.getElementById('player_cinema_mode_button').flip(true);
					}
				}
			}
		},
		player_rotate_button: {
			component: 'switch',
			text: 'rotate'
		},
		player_volume_boost_button: {
			component: 'switch',
			text: 'volumeBoost'
		},
		player_hamburger_button: {
			component: 'switch',
			text: 'Hamburger_Menu'
		},
		theater_mode_icon_revert_button: {
			component: 'switch',
			text: 'revertTheaterModeButtonSizes',
			storage: 'player_revert_theater_button_sizes',
			value: false
		},
		extraButtons: {
			component: 'section',
			variant: 'card',
			title: 'extraButtonsBelowThePlayer',
			below_player_keyscene: {
				component: 'switch',
				text: 'keyScene',
				value: true
			},
			copy_transcript: {
				component: 'switch',
				text: 'copyTranscript',
				value: true
			},
			below_player_screenshot: {
				component: 'switch',
				text: 'screenshot',
				value: true
			},
			below_player_pip: {
				component: 'switch',
				text: 'pictureInPicture',
				value: false
			},
			below_player_loop: {
				component: 'switch',
				text: 'loop',
				value: true
			},
			copy_video_id: {
				component: 'switch',
				text: 'copyVideoId',
				id: "copy-video-id",
				value: false
			},
			copy_video_url: {
				component: 'switch',
				text: 'copyVideoUrl',
				value: false
			}
		},
		extraRightControlButtons: {
			component: 'section',
			variant: 'card',
			title: 'extraRightControlButtons',
			player_fit_to_win_button: {
				component: 'switch',
				text: 'player_fit_to_win_button'
			},
			player_rewind_and_forward_buttons: {
				component: 'switch',
				text: 'player_rewind_and_forward_buttons'
			},
			player_increase_decrease_speed_buttons: {
				component: 'switch',
				text: 'playerIncreaseDecreaseSpeedButtons',
				id: 'player-increase-decrease-speed-buttons'
			},
			player_custom_playback_speed_step: {
				storage: 'player_custom_playback_speed_step',
				component: 'slider',
				text: 'playerPlaybackSpeedStep',
				textarea: true,
				min: 0.05,
				max: 1,
				step: 0.05,
				value: 0.25
			},
		},
		fullscreen_return_button: {
			component: 'switch',
			text: 'fullscreenReturn',
		},
		player_hide_controls_options: {
			component: "button",
			text: "hidePlayerControlsBarButtons",
			on: {
				click: 'main.layers.section.appearance.on.click.player.on.click.section_1.player_hide_controls_options.on.click'
			}
		}
	}
};
