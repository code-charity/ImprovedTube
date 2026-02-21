/*--------------------------------------------------------------
>>> GENERAL
--------------------------------------------------------------*/

extension.skeleton.main.layers.section.general = {
	component: 'button',
	variant: 'general',
	category: true,
	on: {
		click: {
			section_1: {
				component: 'section',
				variant: 'card',
				improvedtube_youtube_icon: {
					text: 'improvedtubeIconOnYoutube',
					component: 'select',
					options: [{
						text: 'disabled',
						value: 'disabled'
					}, {
						text: 'draggable',
						value: 'draggable'
					}, {
						text: 'youtubeHeaderLeft',
						value: 'header_left'
					}, {
						text: 'youtubeHeaderRight',
						value: 'header_right'
					}, {
						text: 'sidebar',
						value: 'sidebar'
					}, {
						text: 'belowPlayer',
						value: 'below_player'
					}]
				},

				/*			improvedTubeSidePanel: {
					component: 'switch',
					text: 'improvedTubeSidePanel'
					},
		*/		default_content_country: {
					component: 'select',
					text: 'defaultContentCountry',
					options: [{ text: "default", value: "default" }, { text: "Afghanistan", value: "AF" }, { text: "Albania", value: "AL" }, { text: "Algeria", value: "DZ" }, { text: "AmericanSamoa", value: "AS" }, { text: "Andorra", value: "AD" }, { text: "Angola", value: "AO" }, { text: "Anguilla", value: "AI" }, { text: "Antarctica", value: "AQ" }, { text: "AntiguaandBarbuda", value: "AG" }, { text: "Argentina", value: "AR" }, { text: "Armenia", value: "AM" }, { text: "Aruba", value: "AW" }, { text: "Australia", value: "AU" }, { text: "Austria", value: "AT" }, { text: "Azerbaijan", value: "AZ" }, { text: "Bahrain", value: "BH" }, { text: "BailiwickofGuernsey", value: "GG" }, { text: "Bangladesh", value: "BD" }, { text: "Barbados", value: "BB" }, { text: "Belarus", value: "BY" }, { text: "Belgium", value: "BE" }, { text: "Belize", value: "BZ" }, { text: "Benin", value: "BJ" }, { text: "Bermuda", value: "BM" }, { text: "Bhutan", value: "BT" }, { text: "Bolivia", value: "BO" }, { text: "Bonaire", value: "BQ" }, { text: "BosniaandHerzegovina", value: "BA" }, { text: "Botswana", value: "BW" }, { text: "BouvetIsland", value: "BV" }, { text: "Brazil", value: "BR" }, { text: "BritishIndianOceanTerritory", value: "IO" }, { text: "BritishVirginIslands", value: "VG" }, { text: "Brunei", value: "BN" }, { text: "Bulgaria", value: "BG" }, { text: "BurkinaFaso", value: "BF" }, { text: "Burundi", value: "BI" }, { text: "Cambodia", value: "KH" }, { text: "Cameroon", value: "CM" }, { text: "Canada", value: "CA" }, { text: "CapeVerde", value: "CV" }, { text: "CaymanIslands", value: "KY" }, { text: "CentralAfricanRepublic", value: "CF" }, { text: "Chad", value: "TD" }, { text: "Chile", value: "CL" }, { text: "China", value: "CN" }, { text: "ChristmasIsland", value: "CX" }, { text: "Cocos(Keeling)Islands", value: "CC" }, { text: "CollectivityofSaintMartin", value: "MF" }, { text: "Colombia", value: "CO" }, { text: "Comoros", value: "KM" }, { text: "CookIslands", value: "CK" }, { text: "CostaRica", value: "CR" }, { text: "Croatia", value: "HR" }, { text: "Cuba", value: "CU" }, { text: "Curaçao", value: "CW" }, { text: "Cyprus", value: "CY" }, { text: "CzechRepublic", value: "CZ" }, { text: "DemocraticRepublicoftheCongo", value: "CD" }, { text: "Denmark", value: "DK" }, { text: "Djibouti", value: "DJ" }, { text: "Dominica", value: "DM" }, { text: "DominicanRepublic", value: "DO" }, { text: "EastTimor", value: "TL" }, { text: "Ecuador", value: "EC" }, { text: "Egypt", value: "EG" }, { text: "ElSalvador", value: "SV" }, { text: "EquatorialGuinea", value: "GQ" }, { text: "Eritrea", value: "ER" }, { text: "Estonia", value: "EE" }, { text: "Eswatini", value: "SZ" }, { text: "Ethiopia", value: "ET" }, { text: "FalklandIslands", value: "FK" }, { text: "FaroeIslands", value: "FO" }, { text: "FederatedStatesofMicronesia", value: "FM" }, { text: "Fiji", value: "FJ" }, { text: "Finland", value: "FI" }, { text: "France", value: "FR" }, { text: "FrenchGuiana", value: "GF" }, { text: "FrenchPolynesia", value: "PF" }, { text: "FrenchSouthernandAntarcticLands", value: "TF" }, { text: "Gabon", value: "GA" }, { text: "Georgia(country)", value: "GE" }, { text: "Germany", value: "DE" }, { text: "Ghana", value: "GH" }, { text: "Gibraltar", value: "GI" }, { text: "Greece", value: "GR" }, { text: "Greenland", value: "GL" }, { text: "Grenada", value: "GD" }, { text: "Guadeloupe", value: "GP" }, { text: "Guam", value: "GU" }, { text: "Guatemala", value: "GT" }, { text: "Guinea", value: "GN" }, { text: "Guinea-Bissau", value: "GW" }, { text: "Guyana", value: "GY" }, { text: "Haiti", value: "HT" }, { text: "HeardIslandandMcDonaldIslands", value: "HM" }, { text: "HolySee", value: "VA" }, { text: "Honduras", value: "HN" }, { text: "HongKong", value: "HK" }, { text: "Hungary", value: "HU" }, { text: "Iceland", value: "IS" }, { text: "India", value: "IN" }, { text: "Indonesia", value: "ID" }, { text: "Iran", value: "IR" }, { text: "Iraq", value: "IQ" }, { text: "IsleofMan", value: "IM" }, { text: "Israel", value: "IL" }, { text: "Italy", value: "IT" }, { text: "IvoryCoast", value: "CI" }, { text: "Jamaica", value: "JM" }, { text: "Japan", value: "JP" }, { text: "Jersey", value: "JE" }, { text: "Jordan", value: "JO" }, { text: "Kazakhstan", value: "KZ" }, { text: "Kenya", value: "KE" }, { text: "Kiribati", value: "KI" }, { text: "Kuwait", value: "KW" }, { text: "Kyrgyzstan", value: "KG" }, { text: "Laos", value: "LA" }, { text: "Latvia", value: "LV" }, { text: "Lebanon", value: "LB" }, { text: "Lesotho", value: "LS" }, { text: "Liberia", value: "LR" }, { text: "Libya", value: "LY" }, { text: "Liechtenstein", value: "LI" }, { text: "Lithuania", value: "LT" }, { text: "Luxembourg", value: "LU" }, { text: "Macau", value: "MO" }, { text: "Madagascar", value: "MG" }, { text: "Malawi", value: "MW" }, { text: "Malaysia", value: "MY" }, { text: "Maldives", value: "MV" }, { text: "Mali", value: "ML" }, { text: "Malta", value: "MT" }, { text: "MarshallIslands", value: "MH" }, { text: "Martinique", value: "MQ" }, { text: "Mauritania", value: "MR" }, { text: "Mauritius", value: "MU" }, { text: "Mayotte", value: "YT" }, { text: "Mexico", value: "MX" }, { text: "Moldova", value: "MD" }, { text: "Monaco", value: "MC" }, { text: "Mongolia", value: "MN" }, { text: "Montenegro", value: "ME" }, { text: "Montserrat", value: "MS" }, { text: "Morocco", value: "MA" }, { text: "Mozambique", value: "MZ" }, { text: "Myanmar", value: "MM" }, { text: "Namibia", value: "NA" }, { text: "Nauru", value: "NR" }, { text: "Nepal", value: "NP" }, { text: "Netherlands", value: "NL" }, { text: "NewCaledonia", value: "NC" }, { text: "NewZealand", value: "NZ" }, { text: "Nicaragua", value: "NI" }, { text: "Niger", value: "NE" }, { text: "Nigeria", value: "NG" }, { text: "Niue", value: "NU" }, { text: "NorfolkIsland", value: "NF" }, { text: "NorthKorea", value: "KP" }, { text: "NorthMacedonia", value: "MK" }, { text: "NorthernMarianaIslands", value: "MP" }, { text: "Norway", value: "NO" }, { text: "Oman", value: "OM" }, { text: "Pakistan", value: "PK" }, { text: "Palau", value: "PW" }, { text: "Panama", value: "PA" }, { text: "PapuaNewGuinea", value: "PG" }, { text: "Paraguay", value: "PY" }, { text: "Peru", value: "PE" }, { text: "Philippines", value: "PH" }, { text: "PitcairnIslands", value: "PN" }, { text: "Poland", value: "PL" }, { text: "Portugal", value: "PT" }, { text: "PuertoRico", value: "PR" }, { text: "Qatar", value: "QA" }, { text: "RepublicofIreland", value: "IE" }, { text: "RepublicoftheCongo", value: "CG" }, { text: "Romania", value: "RO" }, { text: "Russia", value: "RU" }, { text: "Rwanda", value: "RW" }, { text: "Réunion", value: "RE" }, { text: "SaintBarthélemy", value: "BL" }, { text: "SaintHelena", value: "SH" }, { text: "SaintKittsandNevis", value: "KN" }, { text: "SaintLucia", value: "LC" }, { text: "SaintPierreandMiquelon", value: "PM" }, { text: "SaintVincentandtheGrenadines", value: "VC" }, { text: "Samoa", value: "WS" }, { text: "SanMarino", value: "SM" }, { text: "SaudiArabia", value: "SA" }, { text: "Senegal", value: "SN" }, { text: "Serbia", value: "RS" }, { text: "Seychelles", value: "SC" }, { text: "SierraLeone", value: "SL" }, { text: "Singapore", value: "SG" }, { text: "SintMaarten", value: "SX" }, { text: "Slovakia", value: "SK" }, { text: "Slovenia", value: "SI" }, { text: "SolomonIslands", value: "SB" }, { text: "Somalia", value: "SO" }, { text: "SouthAfrica", value: "ZA" }, { text: "SouthGeorgiaandtheSouthSandwichIslands", value: "GS" }, { text: "SouthKorea", value: "KR" }, { text: "SouthSudan", value: "SS" }, { text: "Spain", value: "ES" }, { text: "SriLanka", value: "LK" }, { text: "StateofPalestine", value: "PS" }, { text: "Sudan", value: "SD" }, { text: "Suriname", value: "SR" }, { text: "Svalbard", value: "SJ" }, { text: "Sweden", value: "SE" }, { text: "Switzerland", value: "CH" }, { text: "Syria", value: "SY" }, { text: "SãoToméandPríncipe", value: "ST" }, { text: "Taiwan", value: "TW" }, { text: "Tajikistan", value: "TJ" }, { text: "Tanzania", value: "TZ" }, { text: "Thailand", value: "TH" }, { text: "TheBahamas", value: "BS" }, { text: "TheGambia", value: "GM" }, { text: "Togo", value: "TG" }, { text: "Tokelau", value: "TK" }, { text: "Tonga", value: "TO" }, { text: "TrinidadandTobago", value: "TT" }, { text: "Tunisia", value: "TN" }, { text: "Turkey", value: "TR" }, { text: "Turkmenistan", value: "TM" }, { text: "TurksandCaicosIslands", value: "TC" }, { text: "Tuvalu", value: "TV" }, { text: "Uganda", value: "UG" }, { text: "Ukraine", value: "UA" }, { text: "UnitedArabEmirates", value: "AE" }, { text: "UnitedKingdom", value: "GB" }, { text: "UnitedStatesVirginIslands", value: "VI" }, { text: "UnitedStates", value: "UM" }, { text: "UnitedStates", value: "US" }, { text: "Uruguay", value: "UY" }, { text: "Uzbekistan", value: "UZ" }, { text: "Vanuatu", value: "VU" }, { text: "Venezuela", value: "VE" }, { text: "Vietnam", value: "VN" }, { text: "WallisandFutuna", value: "WF" }, { text: "WesternSahara", value: "EH" }, { text: "Yemen", value: "YE" }, { text: "Zambia", value: "ZM" }, { text: "Zimbabwe", value: "ZW" }, { text: "ÅlandIslands", value: "AX" }]
				},
				cursorLighting: {
					component: 'switch',
					text: 'cursorLighting',
				},
				search: {
					component: 'section',
					variant: 'card',
					title: 'Youtube_Search',
					remove_related_search_results: {
						component: 'switch',
						text: 'removeRelatedSearchResults'
					},
					open_new_tab: {
						component: "switch",
						text: "openNewTab",
					},
					remove_shorts_reel_search_results: {
						component: 'switch',
						text: 'removeShortsReelSearchResults'
					}
				},
				redirect_shorts_to_watch: {
					component: 'switch',
					text: 'ShortsForceTheStandardPlayer',
				},
				remove_home_page_shorts: {
					component: 'switch',
					text: 'hideHomePageShorts',
					id: 'remove-home-page-shorts'
				},
				remove_subscriptions_shorts: {
					component: 'switch',
					text: 'atSubscriptions',
					id: 'remove-subscriptions-shorts'
				},
				remove_trending_shorts: {
					component: 'switch',
					text: 'atTrending'
				},
				remove_history_shorts: {
					component: 'switch',
					text: 'atHistory'
				},
				remove_playables: {
					component: 'switch',
					text: 'removePlayables',
					id: 'remove-playables'
				},
				hide_ai_summary: {
					component: 'switch',
					text: 'hideAISummary',
					id: 'hide-ai-summary'
				},
				youtube_home_page: {
					component: 'select',
					text: 'youtubeHomePage',
					options: [{
						text: 'home',
						value: '/'
					}, {
						text: 'trending',
						value: '/feed/trending'
					}, {
						text: 'subscriptions',
						value: '/feed/subscriptions'
					}, {
						text: 'history',
						value: '/feed/history'
					}, {
						text: 'watchLater',
						value: '/playlist?list=WL'
					}, {
						text: 'search',
						value: 'search'
					}, {
						text: 'liked',
						value: '/playlist?list=LL'
					}, {
						text: 'library',
						value: '/feed/library'
					}, {
						text: 'withoutVideos',
						value: 'hidecontent'
					}],
					tags: 'trending,subscriptions,history,watch,search,undistracted,zen'
				},
				left: {
					component: 'section',
					variant: 'card',
					title: 'Left_Side_Menu',
					sticky_navigation: {
						component: "switch",
						text: 'stickyNavigation',
						tags: 'navigation,auto-hide,sidebar'
					},
					collapse_of_subscription_sections: {
						component: 'switch',
						text: 'collapseOfSubscriptionSections'
					}
				},
				ads: {
					text: 'ads',
					component: 'select',
					options: [{
						text: 'onAllVideos',
						value: 'all_videos',
						default: 'true'
					}, {
						text: 'blockAll',
						value: 'block_all'
					}, {
						text: 'onSmallCreators',
						value: 'small_creators'
					}, {
						text: 'onSubscribedChannels',
						value: 'subscribed_channels'
					}, {
						text: 'blockMusic',
						value: 'block_music'
					}],
					storage: 'ads',

					on: {
						change: function (event) {
							const selectedValue = event.target.value;

							// Perform actions based on the selected value
							const numberOfSubscribersInput = this.parentNode.querySelector('.count-component');
							if (selectedValue === 'small_creators') {
								numberOfSubscribersInput.style.display = 'flex';
							} else {
								numberOfSubscribersInput.style.display = 'none';
							}
						}
					}
				},
				count: {
					component: 'countComponent',
					class: "count-component",
				},
				hide_banner_ads: {
					component: 'switch',
					text: 'hideBannerAds'
				},
				hide_merch_shelf: {
					component: 'switch',
					text: 'hideMerchShelf'
				},
				hide_suggested_action: {
					component: 'switch',
					text: 'hideSuggestedAction'
				},
				hide_sponsored_videos_home: {
					component: 'switch',
					text: 'hideSponsoredVideosOnHome'
				}
			},
			embed: {
				component: 'section',
				variant: 'card',
				title: 'Embedded_YouTube',

				embeddedHidePauseOverlay: {
					component: 'switch',
					text: 'Hide_Pause_Overlay',
				},
				embeddedHideYoutubeLogo: {
					component: 'switch',
					text: 'Hide_YouTube_Logo'
				},
				embeddedHideShare: {
					component: 'switch',
					text: 'embedded_Hide_Share'
				}
			},
			section_3: {
				component: 'section',
				variant: 'card',
				title: 'thumbnails',
				hide_animated_thumbnails: {
					component: 'switch',
					text: 'hideAnimatedThumbnails',
					tags: 'preview'
				},
				disable_thumbnail_playback: {
					component: 'switch',
					text: 'disableThumbnailPlayback',
				},
				popup_window_buttons: {
					component: 'switch',
					text: 'popupWindowButtons',
				},
				hide_thumbnail_overlay: {
					component: 'switch',
					text: 'hideThumbnailOverlay',
					tags: 'preview'
				},
				hide_thumbnail_icon: {
					component: "switch",
					text: "hideThumbnailIcon",
					tags: "preview",
				},
				hide_thumbnail_dots: {
					component: 'switch',
					text: 'hideThumbnailDots',
					tags: 'preview'
				},
				thumbnails_quality: {
					component: 'select',
					text: 'thumbnailsQuality',
					options: [{
						text: 'default',
						value: 'null'
					}, {
						text: 'low',
						value: 'default'
					}, {
						text: 'medium',
						value: 'mqdefault'
					}, {
						text: 'high',
						value: 'hqdefault'
					}, {
						text: 'sd',
						value: 'sddefault'
					}, {
						text: 'hd',
						value: 'maxresdefault'
					}],
					tags: 'preview quality'
				},
				change_thumbnails_per_row: {
					component: 'select',
					text: 'changeThumbnailsPerRow',
					options: [{
						text: 'default',
						value: 'default'
					}, {
						text: '4',
						value: '4'
					}, {
						text: '3',
						value: '3'
					}, {
						text: '5',
						value: '5'
					}, {
						text: '6',
						value: '6'
					}, {
						text: '7',
						value: '7'
					}, {
						text: '8',
						value: '8'
					}, {
						text: '9',
						value: '9'
					}, {
						text: '10',
						value: '10'
					}, {
						text: '11 (experimental)',
						value: '11'
					}, {
						text: '12 (experimental)',
						value: '12'
					}, {
						text: '2',
						value: '2'
					}, {
						text: '1',
						value: '1'
					}],
					tags: 'change thumbnails per row'
				},
				thumbnail_size: {
					component: "select",
					text: "thumbnailSize",
					options: [
						{ text: "Default", value: "default" },
						{ text: "Small", value: "small" },
						{ text: "x-small", value: "x-small" }
					]
				},
				show_last_watched_overlay: {
					component: 'switch',
					text: 'showLastWatchedOverlay',
					value: true, // default aktiv
					tags: 'history overlay'
				},
				last_watched_overlay_position: {
					component: 'select',
					text: 'lastWatchedOverlayPosition',
					storage: 'last_watched_overlay_position',
					options: [
						{ value: 'bottom-right', text: 'bottomRight' },
						{ value: 'bottom-left', text: 'bottomLeft' },
						{ value: 'top-right', text: 'topRight' },
						{ value: 'top-left', text: 'topLeft' }
					],
					value: 'bottom-right'
				},
				last_watched_format: {
					component: 'select',
					text: 'lastWatchedFormat',
					storage: 'last_watched_format',
					options: [
						{ value: 'relative', text: 'relative' },
						{ value: 'exact', text: 'exact' }
					],
					value: 'relative'
				}
			}, section_2: {
				component: 'section',
				variant: 'card',
				title: 'watchedVideos',

				mark_watched_videos: {
					component: 'switch',
					text: 'markWatchedVideos',
					on: {
						click: function () {
							setTimeout(() => {
								if (satus.storage.get('mark_watched_videos')) {
									if (!satus.storage.get('track_watched_videos')) {
										this.nextSibling.click();
									}
								}
							}, 250);
						}
					}
				},
				track_watched_videos: {
					component: 'switch',
					text: 'trackWatchedVideos'
				},
				hide_watched_videos: {
					component: 'switch',
					text: 'hideWatchedVideos'
				},
				hide_watch_later: {
					component: 'switch',
					text: 'Hide Watch Later Videos'
				},
				delete_watched_videos: {
					component: 'button',
					text: 'deleteWatchedVideos',
					style: {
						justifyContent: 'space-between'
					},
					on: {
						click: {
							component: 'modal',
							variant: 'confirm',
							content: 'thisWillRemoveAllWatchedVideos',
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
								reset: {
									component: 'button',
									text: 'accept',
									on: {
										click: function () {
											var modal = this.parentNode.parentNode.parentNode;

											satus.storage.remove('watched');

											modal.skeleton.parentSkeleton.counter.rendered.textContent = '0';

											modal.close();
										}
									}
								}
							}
						}
					},

					counter: {
						component: 'span',
						style: {
							opacity: .64
						},
						on: {
							render: function () {
								var watched = satus.storage.get('watched');

								if (watched) {
									this.textContent = Object.keys(watched).length;
								} else {
									this.textContent = '0';
								}
							}
						}
					}
				}
			},
			section_4: {
				component: 'section',
				variant: 'card',
				title: 'more',
				confirmation_before_closing: {
					component: 'switch',
					text: 'confirmationBeforeClosing',
					tags: 'random prevent close exit'
				},
				font: {
					component: 'select',
					text: 'font',
					options: [{
						text: 'default',
						value: 'Default'
					}, {
						text: 'Comfortaa',
						value: 'Comfortaa'
					}, {
						text: 'Lato',
						value: 'Lato'
					}, {
						text: 'Marriweather',
						value: 'Marriweather'
					}, {
						text: 'Montserrat',
						value: 'Montserrat'
					}, {
						text: 'Noto Sans',
						value: 'Noto+Sans'
					}, {
						text: 'Open Sans',
						value: 'Open+Sans'
					}, {
						text: 'Oswald',
						value: 'Oswald'
					}, {
						text: 'Poppins',
						value: 'Poppins'
					}, {
						text: 'PT Sans',
						value: 'PT+Sans'
					}, {
						text: 'Raleway',
						value: 'Raleway'
					}, {
						text: 'Roboto Condensed',
						value: 'Roboto+Condensed'
					}, {
						text: 'Roboto Mono',
						value: 'Roboto+Mono'
					}, {
						text: 'Roboto Slab',
						value: 'Roboto+Slab'
					}, {
						text: 'Source Sans Pro',
						value: 'Source+Sans+Pro'
					}]
				},
				scroll_bar: {
					component: 'select',
					text: 'scrollBar',
					options: [{
						text: 'default',
						value: 'default'
					}, {
						text: 'hidden',
						value: 'hidden'
					}]
				},
				add_scroll_to_top: {
					component: 'switch',
					text: 'addScrollToTop',
					tags: 'up'
				},
				remove_member_only: {
					component: 'switch',
					text: 'removeMemberOnly',
				},
				remove_context_buttons: {
					component: 'switch',
					text: 'removeContextButtons',
				},
				remove_list_param_from_links: {
					component: 'switch',
					text: 'removePlaylistParam'
				},
				clickable_links_in_description: {
					component: 'switch',
					text: 'clickableLinksInDescription'
				},
				category_refresh_button: {
					component: 'switch',
					text: 'categoryRefreshButton'
				},
				auto_bypass_content_warning: {
					component: 'switch',
					text: 'autoBypassContentWarning',
					on: {
						render: function () {
							const component = this;
							chrome.storage.sync.get('auto_bypass_content_warning', function (data) {
								let value = data.auto_bypass_content_warning;
								if (value === undefined) value = true; // Default true

								component.dataset.value = String(value);
								component.storage.value = value;
							});
						},
						click: function () {
							setTimeout(() => {
								chrome.storage.sync.set({ auto_bypass_content_warning: this.storage.value });
							});
						}
					}
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
				'fill': 'none',
				'stroke': 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.75'
			},

			path: {
				component: 'path',
				attr: {
					'd': 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7'
				}
			}
		}
	},
	label: {
		component: 'span',
		text: 'general'
	}
};
