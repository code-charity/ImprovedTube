/*--------------------------------------------------------------
>>> SHURTCUTS
--------------------------------------------------------------*/
extension.skeleton.main.layers.section.shortcuts = {
	component: 'button',
	variant: 'shortcuts',
	category: true,
	on: {
		click: {
			playerSection: {
				component: 'section',
				variant: 'card',
				title: 'player',

				shortcut_quality: {
					component: 'button',
					text: 'quality',
					on: {
						click: {
							component: 'section',
							variant: 'card',

							shortcut_quality_auto: {
								component: 'shortcut',
								text: 'auto'
							},
							shortcut_quality_144p: {
								component: 'shortcut',
								text: '144p'
							},
							shortcut_quality_240p: {
								component: 'shortcut',
								text: '240p'
							},
							shortcut_quality_360p: {
								component: 'shortcut',
								text: '360p'
							},
							shortcut_quality_480p: {
								component: 'shortcut',
								text: '480p'
							},
							shortcut_quality_720p: {
								component: 'shortcut',
								text: '720p'
							},
							shortcut_quality_1080p: {
								component: 'shortcut',
								text: '1080p'
							},
							shortcut_quality_1440p: {
								component: 'shortcut',
								text: '1440p'
							},
							shortcut_quality_2160p: {
								component: 'shortcut',
								text: '2160p'
							},
							shortcut_quality_2880p: {
								component: 'shortcut',
								text: '2880p'
							},
							shortcut_quality_4320p: {
								component: 'shortcut',
								text: '4320p'
							}
						}
					}
				},
				volume: {
					component: 'button',
					text: 'volume',
					on: {
						click: {
							section_1: {
								component: 'section',
								variant: 'card',

								shortcuts_volume_step: {
									component: 'slider',
									text: 'step',
									min: 1,
									max: 25,
									step: 1,
									value: 5
								}
							},

							section_2: {
								component: 'section',
								variant: 'card',

								shortcut_increase_volume: {
									component: 'shortcut',
									text: 'increaseVolume',
									value: {
										keys: {
											38: {
												key: 'ArrowUp'
											}
										}
									}
								},
								shortcut_decrease_volume: {
									component: 'shortcut',
									text: 'decreaseVolume',
									value: {
										keys: {
											40: {
												key: 'ArrowDown'
											}
										}
									}
								}
							}
						}
					}
				},
				playback_speed: {
					component: 'button',
					text: 'playbackSpeed',
					on: {
						click: {
							section_step: {
								component: 'section',
								variant: 'card',

								shortcuts_playback_speed_step: {
									component: 'slider',
									text: 'step',
									min: .05,
									max: 2,
									step: .05,
									value: .05
								}
							},

							section: {
								component: 'section',
								variant: 'card',

								shortcut_increase_playback_speed: {
									component: 'shortcut',
									text: 'increasePlaybackSpeed',
									value: {
										shift: true,
										keys: {
											190: {
												key: '>'
											}
										}
									}
								},
								shortcut_decrease_playback_speed: {
									component: 'shortcut',
									text: 'decreasePlaybackSpeed',
									value: {
										shift: true,
										keys: {
											188: {
												key: '<'
											}
										}
									}
								},
								shortcut_reset_playback_speed: {
									component: 'shortcut',
									text: 'reset'
								},
								shortcut_playback_message: {
									component: 'text',
									text: 'You may have to manually reset each keybind individually', 
									style: {
										marginTop: '10px',  
										color: '#888',
										textAlign: 'center'
									}
								}
							}
						}
					}
				},
				shortcut_playback_speed: {
					component: 'button',
					text: 'playbackSpeedHotkey',
					on: {
						click: {
							component: 'section',
							variant: 'card',

							shortcut_playback_speed_0_25: {
								component: 'shortcut',
								text: '0.25x'
							},
							shortcut_playback_speed_0_5: {
								component: 'shortcut',
								text: '0.5x'
							},
							shortcut_playback_speed_0_75: {
								component: 'shortcut',
								text: '0.75x'
							},
							shortcut_playback_speed_1: {
								component: 'shortcut',
								text: '1x'
							},
							shortcut_playback_speed_1_25: {
								component: 'shortcut',
								text: '1.25x'
							},
							shortcut_playback_speed_1_5: {
								component: 'shortcut',
								text: '1.5x'
							},
							shortcut_playback_speed_1_75: {
								component: 'shortcut',
								text: '1.75x'
							},
							shortcut_playback_speed_2: {
								component: 'shortcut',
								text: '2x'
							}
						}
					}
				},
				shortcut_smart_speed: {
					component: 'shortcut',
					text: 'smartSpeed'
				},
				shortcut_play_pause: {
					component: 'shortcut',
					text: 'playPause',
					value: {
						keys: {
							32: {
								code: 'space'
							}
						}
					}
				},
				shortcut_stop: {
					component: 'shortcut',
					text: 'stop'
				},
				shortcut_seek_backward: {
					component: 'shortcut',
					text: 'seekBackward10Seconds',
					value: {
						keys: {
							74: {
								key: 'j'
							}
						}
					}
				},
				shortcut_seek_forward: {
					component: 'shortcut',
					text: 'seekForward10Seconds',
					value: {
						keys: {
							76: {
								key: 'l'
							}
						}
					}
				},
				shortcut_jump_to_key_scene: {
					component: 'shortcut',
					text: 'keyScene'
				},
				shortcut_seek_next_chapter: {
					component: 'shortcut',
					text: 'seekNextChapter'
				},
				shortcut_seek_previous_chapter: {
					component: 'shortcut',
					text: 'seekPreviousChapter'
				},
				shortcut_next_video: {
					component: 'shortcut',
					text: 'nextVideo',
					value: {
						shift: true,
						keys: {
							78: {
								key: 'n'
							}
						}
					}
				},
				shortcut_prev_video: {
					component: 'shortcut',
					text: 'previousVideo',
					value: {
						shift: true,
						keys: {
							80: {
								key: 'p'
							}
						}
					}
				},
				shortcut_activate_fullscreen: {
					component: 'shortcut',
					text: 'activateFullscreen',
					value: {
						keys: {
							70: {
								key: 'f'
							}
						}
					}
				},
				shortcut_activate_fit_to_window: {
					component: 'shortcut',
					text: 'activateFitToWindow'
				},
				shortcut_activate_captions: {
					component: 'shortcut',
					text: 'activateCaptions',
					value: {
						keys: {
							67: {
								key: 'c'
							}
						}
					}
				},
				shortcut_toggle_cards: {
					component: 'shortcut',
					text: 'toggleCards'
				},
				shortcut_popup_player: {
					component: 'shortcut',
					text: 'popupPlayer'
				},
				shortcut_screenshot: {
					component: 'shortcut',
					text: 'screenshot'
				},
				shortcut_toggle_loop: {
					component: 'shortcut',
					text: 'loop'
				},
				shortcut_picture_in_picture: {
					component: 'shortcut',
					text: 'pictureInPicture'
				},
				shortcut_auto_picture_in_picture: {
					component: 'shortcut',
					text: 'autoPictureInPicture'
				},
				shortcut_stats_for_nerds: {
					component: 'shortcut',
					text: 'statsForNerds'
				},
				shortcut_toggle_controls: {
					component: 'shortcut',
					text: 'toggleControls'
				},
				shortcut_toggle_autoplay: {
					component: 'shortcut',
					text: 'toggleAutoplay'
				},
				shortcut_custom_mini_player: {
					component: 'shortcut',
					text: 'customMiniPlayer',
					value: {
						keys: {
							73: {
								key: 'i'
							}
						}
					}
				},
				shortcut_toggle_ambient_lighting: {
					component: 'shortcut',
					text: 'ambientLighting'
				},
				shortcut_rotate_video: {
					component: 'shortcut',
					text: 'rotate'
				},
				shortcut_cinema_mode: {
					component: 'shortcut',
					text: 'cinemaMode'
				}
			},
			section: {
				component: 'section',
				variant: 'card',
				title: 'YouTube',

				shortcut_go_to_search_box: {
					component: 'shortcut',
					text: 'goToSearchBox',
					value: {
						keys: {
							191: {
								key: '/'
							}
						}
					}
				},
				shortcut_chapters: {
					component: 'shortcut',
					text: 'shortcut_chapters'
				},
				shortcut_transcript: {
					component: 'shortcut',
					text: 'shortcut_transcript'
				},
				shortcut_like: {
					component: 'shortcut',
					text: 'like'
				},
				shortcut_dislike: {
					component: 'shortcut',
					text: 'dislike'
				},
				shortcut_report: {
					component: 'shortcut',
					text: 'report'
				},
				shortcut_subscribe: {
					component: 'shortcut',
					text: 'subscribe'
				},
				shortcut_dark_theme: {
					component: 'shortcut',
					text: 'darkTheme'
				},
				shortcut_refresh_categories: {
					component: 'shortcut',
					text: 'refreshCategories'
				}
			}
		}
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
					'd': 'M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'shortcuts'
	}
};
