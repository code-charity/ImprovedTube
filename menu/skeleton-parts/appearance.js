/*--------------------------------------------------------------
>>> APPEARANCE
----------------------------------------------------------------
# Header
# Player
# Details
# Comments
# Footer
# Sidebar
--------------------------------------------------------------*/
satus.storage.onchanged((key, value) => {
	if (key === "related_videos" && value === "Titles") {
		satus.storage.set('relatedVideosPrev', "Titles");
		console.log(satus.storage.get("relatedVideosPrev"));
	}
});
extension.skeleton.main.layers.section.appearance = {
	component: "button",
	variant: "appearance",
	category: true,
	on: {
		click: {
			component: "section",
			variant: "appearance"
		}
	},

	icon: {
		component: "span",

		svg: {
			component: "svg",
			attr: {
				viewBox: "0 0 24 24",
				fill: "transparent",
				stroke: "currentColor",
				"stroke-linecap": "round",
				"stroke-width": "1.75"
			},

			path: {
				component: "path",
				attr: {
					d: "M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"
				}
			}
		}
	},
	label: {
		component: "span",
		text: "appearance"
	}
};

/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.header = {
	component: "button",
	variant: "header",
	text: "header",
	on: {
		click: {
			component: "section",
			variant: "card",

			header_position: {
				component: "select",
				text: "position",
				options: [{
					text: "normal",
					value: "normal"
				}, {
					text: "hoverOnVideoPage",
					value: "hover_on_video_page"
				}, {
					text: "hiddenOnVideoPage",
					value: "hidden_on_video_page"
				}, {
					text: "static",
					value: "static"
				}, {
					text: "hidden",
					value: "hidden"
				}, {
					text: "hover",
					value: "hover"
				}],
				tags: "hide,hover,static,top"
			},
			header_hide_logo: {
				component: "switch",
				text: "hideLogo"
			},
			header_improve_logo: {
				component: "switch",
				text: "improveLogo",
				tags: "youtube"
			},
			header_hide_right_buttons: {
				component: "switch",
				text: "hideRightButtons",
				tags: "user"
			},
			header_transparent: {
				component: "switch",
				text: "transparentBackground"
			},
			header_transparent_alternative: {
				component: "switch",
				text: "transparentBackgroundAlternative"
			},
			header_hide_country_code: {
				component: "switch",
				text: "hideCountryCode",
				tags: "country,code"
			},
			hide_voice_search_button: {
				component: "switch",
				text: "hideVoiceSearchButton"
			}
		}
	}
};

/*--------------------------------------------------------------
# PLAYER
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.player = {
	component: "button",
	variant: "player",
	text: "player",
	on: {
		click: {
			section_1: {
				component: "section",
				variant: "card",
				forced_theater_mode: {
					component: "switch",
					text: "forcedTheaterMode",
					tags: "wide",
				},
				player_size: {
					component: "select",
					variant: "player-size",
					text: "playerSize",
					options: [{
						text: "doNotChange",
						value: "do_not_change"
					}, {
						text: "fullWindow",
						value: "full_window"
					}, {
						text: "Max. width within the page",
						value: "max_width"
					}, {
						text: "fitToWindow",
						value: "fit_to_window"
					}, {
						text: "240p",
						value: "240p"
					}, {
						text: "360p",
						value: "360p"
					}, {
						text: "480p",
						value: "480p"
					}, {
						text: "576p",
						value: "576p"
					}, {
						text: "720p",
						value: "720p"
					}, {
						text: "1080p",
						value: "1080p"
					}, {
						text: "1440p",
						value: "1440p"
					}, {
						text: "2160p",
						value: "2160p"
					}, {
						text: "custom",
						value: "custom"
					}]
				},
				customPlayerSizeSection: {
					component: "section",
					variant: "custom-player-size",

					custom_player_size_width: {
						component: "text-field",
						placeholder: "1280",
						rows: 1,
						lineNumbers: false
					},
					x: {
						component: "span",
						text: "x"
					},
					custom_player_size_height: {
						component: "text-field",
						placeholder: "720",
						rows: 1,
						lineNumbers: false
					}
				},
				player_hide_annotations: {
					component: "switch",
					text: "hideAnnotations",
					tags: "hide,remove,elements"
				},
				player_hide_cards: {
					component: "switch",
					text: "hideCards",
					tags: "hide,remove,elements"
				},
				player_show_cards_on_mouse_hover: {
					component: "switch",
					text: "showCardsOnMouseHover",
					tags: "hide,remove,elements"
				},
				player_hide_endscreen: {
					component: "switch",
					text: "hideEndscreen"
				},
				hide_includes_paid_promotion: {
					component: 'switch',
					text: 'hideIncludesPaidPromotion',
					storage: 'hide_includes_paid_promotion',
				},
				remove_black_bars: {
					component: "switch",
					text: "removeBlackBars",
					tags: "bars",
				},
				player_hide_controls: {
					component: "select",
					text: "hidePlayerControlsBar",
					options: [{
						text: "off",
						value: "off",
						default: "true"
					}, {
						text: "whenPaused",
						value: "when_paused"
					}, {
						text: "always",
						value: "always"
					}]
				},
				player_hide_progress_preview: {
					component: 'switch',
					text: 'hideProgressBarPreview',
					storage: 'player_hide_progress_preview',
				},
				player_hide_controls_options: {
					component: "button",
					text: "hidePlayerControlsBarButtons",
					on: {
						click: {
							component: "section",
							variant: "card",

							player_play_button: {
								component: "switch",
								text: "playPause"
							},
							player_previous_button: {
								component: "switch",
								text: "previousVideo"
							},
							player_next_button: {
								component: "switch",
								text: "nextVideo"
							},
							player_volume_button: {
								component: "switch",
								text: "volume"
							},
							player_autoplay_button: {
								component: "switch",
								text: "autoplay"
							},
							player_settings_button: {
								component: "switch",
								text: "settings"
							},
							player_subtitles_button: {
								component: "switch",
								text: "subtitles"
							},
							player_subtitlesLine_button: {
								component: "switch",
								text: "subtitleLine"
							},
							player_miniplayer_button: {
								component: "switch",
								text: "nativeMiniPlayer"
							},
							player_view_button: {
								component: "switch",
								text: "viewMode"
							},
							player_screen_button: {
								component: "switch",
								text: "screen"
							},
							player_remote_button: {
								component: "switch",
								text: "remote"
							},
							player_chaptertitle_button: {
								component: "switch",
								text: "chapterTitle"
							}
						}
					}
				},
				hide_gradient_bottom: {
					component: "switch",
					text: "hideGradientBottom"
				},
				always_show_progress_bar: {
					component: "switch",
					text: "alwaysShowProgressBar"
				},
				player_color: {
					component: "select",
					text: "playerColor",
					options: [{
						text: "default",
						value: "default"
					}, {
						text: "red",
						value: "red"
					}, {
						text: "pink",
						value: "pink"
					}, {
						text: "purple",
						value: "purple"
					}, {
						text: "deepPurple",
						value: "deep_purple"
					}, {
						text: "indigo",
						value: "indigo"
					}, {
						text: "blue",
						value: "blue"
					}, {
						text: "lightBlue",
						value: "light_blue"
					}, {
						text: "cyan",
						value: "cyan"
					}, {
						text: "teal",
						value: "teal"
					}, {
						text: "green",
						value: "green"
					}, {
						text: "lightGreen",
						value: "light_green"
					}, {
						text: "lime",
						value: "lime"
					}, {
						text: "yellow",
						value: "yellow"
					}, {
						text: "amber",
						value: "amber"
					}, {
						text: "orange",
						value: "orange"
					}, {
						text: "deepOrange",
						value: "deep_orange"
					}, {
						text: "brown",
						value: "brown"
					}, {
						text: "blueGray",
						value: "blue_gray"
					}, {
						text: "white",
						value: "white"
					}],
					tags: "style"
				},
				player_transparent_background: {
					component: "switch",
					text: "transparentBackground"
				},
				player_hide_skip_overlay: {
					component: "switch",
					text: "hideSkipOverlay",
					value: false,
					tags: "remove,hide"
				},
				player_remaining_duration: {
					component: "switch",
					text: "showRemainingDuration",
					id: "show-remaining-duration",
					value: false
				},
				duration_with_speed: {
					component: "switch",
					text: "durationWithSpeed",
					value: false
				},
				player_hd_thumbnail: {
					component: "switch",
					text: "hdThumbnail",
					tags: "preview"
				},
				hide_scroll_for_details: {
					component: "switch",
					text: "hideScrollForDetails",
					tags: "remove,hide"
				},
				hide_top_loading_bar: {
					component: "switch",
					text: "hideTopLoadingBar",
					tags: "remove,hide"
				},
				hide_gradient_bottom: {
				component: "switch",
				text: "hideGradientBottom"
				},
				always_show_progress_bar: {
				component: "switch",
				text: "alwaysShowProgressBar"
				},
				player_color: {
				component: "select",
				text: "playerColor",
				options: [{
					text: "default",
					value: "default"
				}, {
					text: "red",
					value: "red"
				}, {
					text: "pink",
					value: "pink"
				}, {
					text: "purple",
					value: "purple"
				}, {
					text: "deepPurple",
					value: "deep_purple"
				}, {
					text: "indigo",
					value: "indigo"
				}, {
					text: "blue",
					value: "blue"
				}, {
					text: "lightBlue",
					value: "light_blue"
				}, {
					text: "cyan",
					value: "cyan"
				}, {
					text: "teal",
					value: "teal"
				}, {
					text: "green",
					value: "green"
				}, {
					text: "lightGreen",
					value: "light_green"
				}, {
					text: "lime",
					value: "lime"
				}, {
					text: "yellow",
					value: "yellow"
				}, {
					text: "amber",
					value: "amber"
				}, {
					text: "orange",
					value: "orange"
				}, {
					text: "deepOrange",
					value: "deep_orange"
				}, {
					text: "brown",
					value: "brown"
				}, {
					text: "blueGray",
					value: "blue_gray"
				}, {
					text: "white",
					value: "white"
				}],
				tags: "style"
			},
			player_transparent_background: {
				component: "switch",
				text: "transparentBackground"
			},
			player_hide_skip_overlay: {
				component: "switch",
				text: "hideSkipOverlay",
				value: false,
				tags: "remove,hide"
			},
			player_hide_pause_overlay: {
				component: "switch",
				text: "hidePauseOverlay",
				value: false,
				tags: "remove,hide,pause,bezel"
			},
			duration_with_speed: {
				component: "switch",
				text: "durationWithSpeed",
				value: false
			},
			player_hd_thumbnail: {
				component: "switch",
				text: "hdThumbnail",
				tags: "preview"
			},
			hide_scroll_for_details: {
				component: "switch",
				text: "hideScrollForDetails",
				tags: "remove,hide"
			},
			hide_top_loading_bar: {
				component: "switch",
				text: "hideTopLoadingBar",
				tags: "remove,hide"
			}
		},	
			section_2: {
				component: 'section',
				variant: 'card',
				title: 'Shorts',
				shorts_always_show_buttons: {
					component: 'section',
					variant: 'card',
					text: 'shortsAlwaysShowButtons',
					shorts_always_show_captions: {
						component: 'switch',
						text: 'shortsAlwaysShowCaptions'
					},
					shorts_always_show_fullscreen: {
						component: 'switch',
						text: 'shortsAlwaysShowFullscreen'
					}
				}
			}
		}
	}


};

/*--------------------------------------------------------------
# DETAILS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.details = {
	component: "button",
	variant: "details",
	text: "details",
	on: {
		click: {
			component: "section",
			variant: "card",
			hide_views_count: {
				component: "switch",
				text: "hideViewsCount",
				tags: "hide,remove"
			},
			hide_details: {
				component: "switch",
				text: "hideDetails",
				tags: "hide,remove"
			},
			day_of_week: {
				component: "switch",
				text: "displayDayOfTheWeak"
			},
			hide_date: {
				component: "switch",
				text: "hideDate",
				tags: "hide,remove"
			},
			disable_likes_animation: {
				component: "switch",
				text: "disableLikesAnimation",
				tags: "likes,animation,disable"
			},
			api: {
				component: 'section',
				variant: 'card',
				title: 'Currently_requiring_a_YouTube_API_key',

				how_long_ago_the_video_was_uploaded: {
					component: "switch",
					text: "howLongAgoTheVideoWasUploaded"
				},
				exact_date: {
					component: "switch",
					text: "showExactDate"
				},
				channel_videos_count: {
					component: "switch",
					text: "showChannelVideosCount"
				}
			}
		}
	}
};
extension.skeleton.main.layers.section.appearance.on.click.description = {
	component: "select",
	variant: "description",
	text: "description",
	options: [{
		text: "normal",
		value: "normal"
	}, {
		text: "expanded",
		value: "expanded"
	}, {
		text: "sidebar",
		value: "sidebar"
	}, {
		text: "hidden",
		value: "hidden"
	}/*, {
					text: "Classic",
					value: "classic"
				}, {
					text: "Classic expanded",
					value: "classic_expanded"
				}, {
					text: "Classic hidden",
					value: "classic_hidden"
				}*/],
	tags: "hide,remove"
};

extension.skeleton.main.layers.section.appearance.on.click.hide_detail_button = {
	component: "button",
	text: "buttons",
	variant: "detailButton",
	on: {
		click: {
			component: 'section',
			variant: 'card',
			extraButtons: {
				component: 'section',
				variant: 'card',
				title: 'ExtraButtons',

				below_player_screenshot: {
					component: 'switch',
					text: 'screenshot',
					value: true
				},
				below_player_pip: {
					component: 'switch',
					text: 'pictureInPicture',
					value: true
				},
				below_player_loop: {
					component: 'switch',
					text: 'loop',
					value: true
				},
				below_player_keyscene: {
					component: 'switch',
					text: 'keyScene',
					value: true
				}
			},
			youtubeDetailButtons: {
				component: "select",
				text: "youTubeButtons",
				options: [{
					text: "normal",
					value: "normal"
				}, {
					text: 'removeNames',
					value: "remove_labels"
				}, {
					text: 'halfTransparent',
					value: "half_transparent"
				}, {
					text: 'Remove',
					value: "remove"
				}, {
					text: 'TransparentBackground',
					value: "transparent_background"
				}, {
					text: "hide_labels",
					value: "hide_labels"
				}, {
					text: 'removeIcons',
					value: "remove_icons"
				}],
				tags: "hide,remove"
			},
			detailButtons: {
				component: 'section',
				variant: 'card',
				purchase: {
					component: "select",
					text: "purchase",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "removeName",
						value: "remove_label"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove,purchase-button"
				},
				join: {
					component: "select",
					text: "join",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "removeName",
						value: "remove_label"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove,join-button"
				},
				subscribe: {
					component: "select",
					text: "subscribe",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "removeName",
						value: "remove_label"
					}, {
						text: "grey",
						value: "grey"
					}, {
						text: "transparentColor",
						value: "transparent"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove,subscribe-button"
				},
				likes: {
					component: "select",
					text: "like",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "iconsOnly",
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_dislike_button: {
					component: "select",
					text: "dislike",
					options: [{
						text: 'normal',
						value: "normal"
					}, {
						text: 'iconsOnly',
						value: "icons_only"
					}, {
						text: 'hidden',
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				red_dislike_button: {
					component: 'switch',
					text: "redDislikeButton"
				},
				hide_share_button: {
					component: "select",
					text: "share",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "iconsOnly",
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_ask_button: {
					component: "select",
					text: "ask",
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "iconsOnly",
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_download_button: {
					component: "select",
					text: 'download',
					options: [{
						text: "normal",
						value: "normal"
					}, {
						text: "iconsOnly",
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_thanks_button: {
					component: "select",
					text: 'thanks',
					options: [{
						text: 'normal',
						value: "normal"
					}, {
						text: 'iconsOnly',
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_clip_button: {
					component: "select",
					text: 'clip',
					options: [{
						text: 'normal',
						value: "normal"
					}, {
						text: 'iconsOnly',
						value: "icons_only"
					}, {
						text: "hidden",
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_save_button: {
					component: "select",
					text: 'save',
					options: [{
						text: 'normal',
						value: "normal"
					}, {
						text: 'iconsOnly',
						value: "icons_only"
					}, {
						text: 'hidden',
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_report_button: {
					component: "select",
					text: 'report',
					options: [{
						text: 'normal',
						value: "normal"
					}, {
						text: 'iconsOnly',
						value: "icons_only"
					}, {
						text: 'hidden',
						value: "hidden"
					}],
					tags: "hide,remove"
				},
				hide_more_button: {
					component: "switch",
					text: 'hideMore',
					tags: "hide,remove"
				}
			}
		}
	}
}

/*--------------------------------------------------------------
# COMMENTS
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.comments = {
	component: "button",
	variant: "comments",
	text: "comments",
	on: {
		click: {
			component: "section",
			variant: "card",

			comments_show: {
				component: "select",
				text: "comments",
				storage: 'comments',

				options: [{
					text: "normal",
					value: "normal"
				}, {
					text: "collapsed",
					value: "collapsed"
				}, {
					text: "hidden",
					value: "hidden"
				}]
			},
			comments_sidebar: {
				component: "switch",
				text: "sidebar",
				id: 'comments-sidebar'
			},
			comments_sidebar_scrollbars: {
				component: "switch",
				text: 'with_scrollbars'
			},
			comments_sidebar_simple: {
				component: "switch",
				text: 'Sidebar_simple_alternative',
				id: 'comments-sidebar-simple'
			},
			columns: {
				component: "switch",
				text: "columns",
				value: true
			},
			squared_user_images: {
				component: 'switch',
				text: 'squaredUserImages',
				tags: 'avatar'
			},
			hide_author_avatars: {
				component: "switch",
				text: 'hide_author_avatars'
			},
			hide_comments_count: {
				component: "switch",
				text: "hideCommentsCount",
				tags: "hide,remove"
			}
		}
	}
};

/*--------------------------------------------------------------
# POPUP AD
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.popup_ad = {
	component: "switch",
	variant: "popupAd",
	text: "popupAd",
	tags: "bottom"
};

/*--------------------------------------------------------------
# SIDEBAR
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.appearance.on.click.sidebar = {
	component: "button",
	variant: "sidebar",
	text: "sidebar",
	on: {
		click: {
			component: "section",
			variant: "card",
			undo_the_new_sidebar: {
				component: "switch",
				text: "undoTheNewSidebar"
			},
			related_videos: {
				component: "select",
				text: "relatedVideos",
				options: [{
					text: "normal",
					value: "normal"
				}, {
					text: "hidden",
					value: "hidden"
				}, {
					text: "Focus",
					value: "Focus"
				}, {
					text: "Titles",
					value: "Titles"
				}, {
					text: "collapsed",
					value: "collapsed"
				}, {
					text: 'Hide_the_tabs_only',
					value: "hidetabs"
				}],
				tags: "right",
				on: {
					click: function () {
						setTimeout(() => {
							if (satus.storage.get('related_videos') === "Titles"
								&& satus.storage.get("relatedVideosPrev") === "Titles") {
								if (!satus.storage.get('thumbnails_right')) {
									this.nextSibling.nextSibling.click();
									satus.storage.set('relatedVideosPrev', "notTitles")
								}
							}
						}, 650)

					}
				}
			},
			sidebar_left: {
				component: "switch",
				text: "moveSidebarLeft"
			},
			thumbnails_right: {
				component: "switch",
				text: "moveThumbnailsRight"
			},
			thumbnails_hide: {
				component: "switch",
				text: "hideThumbnails"
			},
			transcript: {
				component: 'switch',
				text: 'Transcript',
				value: false,
				id: 'transcript',
				on: {
					click: function () {
						setTimeout(() => {
							if (satus.storage.get('transcript')) {
								if (satus.storage.get('no_page_margin')) {
									this.nextSibling.nextSibling.click();
								}
							}
						}, 250);
					}
				}
			},
			compact_spacing: {
				component: "switch",
				text: 'compact_spacing',
				storage: 'compactSpacing'
			},
			no_page_margin: {
				component: 'switch',
				text: 'To_the_side_No_page_margin',

				value: false,
				on: {
					click: function () {
						setTimeout(() => {
							if (satus.storage.get('no_page_margin')) {
								if (satus.storage.get('transcript')) {
									this.previousSibling.previousSibling.click();
								}
							}
						}, 250);
					}
				}
			},
			chapters: {
				component: 'switch',
				text: 'chapters'
			},
			hide_shorts_remixing: {
				component: "switch",
				text: 'Hide_Shorts_remixing_this_video'
			},
			livechat: {
				component: "select",
				text: 'liveChat',

				options: [{
					text: 'normal',
					value: "normal"
				}, {
					text: 'collapsed',
					value: "collapsed"
				}, {
					text: "hidden",
					value: 'hidden'
				}],
			},		
			livechat_below_theater: {
				component: "switch",
				text: 'livechatBelowTheater'
			},
			hide_playlist: {
				component: "switch",
				text: 'hidePlaylist'
			},
			hide_sidebar: {
				component: "switch",
				text: 'Hide_sidebar'
			}
		}
	}
};
