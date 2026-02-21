/*------------------------------------------------------------------------------
4.10.0 SETTINGS
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
4.10.1 IMPROVEDTUBE ICON
------------------------------------------------------------------------------*/

ImprovedTube.improvedtubeYoutubeIcon = function () {
	var data = localStorage.getItem('improvedtube-button-position'),
		x = 0,
		y = 0,
		option = this.storage.improvedtube_youtube_icon,
		button = this.elements.improvedtube_button;

	if (data) {
		data = JSON.parse(data);

		x = Math.min(Math.max(data.x, 0), document.body.offsetWidth - 48);
		y = Math.min(Math.max(data.y, 0), window.innerHeight - 48);
	}

	if (!button) {
		var label = document.createElement('span');

		button = document.createElement('button');

		button.className = 'it-button';

		button.addEventListener('mousedown', function (event) {
			if (ImprovedTube.storage.improvedtube_youtube_icon === 'draggable') {
				var x2 = event.layerX,
					y2 = event.layerY;

				function mousemove (event) {
					if (button.className.indexOf('dragging') === -1) {
						button.classList.add('it-button--dragging');
					}

					x = Math.min(Math.max(event.clientX - x2, 0), document.body.offsetWidth - 48);
					y = Math.min(Math.max(event.clientY - y2, 0), window.innerHeight - 48);

					button.style.left = x + 'px';
					button.style.top = y + 'px';
				}

				function mouseup () {
					localStorage.setItem('improvedtube-button-position', JSON.stringify({x, y}));

					window.removeEventListener('mousemove', mousemove);
					window.removeEventListener('mouseup', mouseup);
				}

				function click () {
					button.classList.remove('it-button--dragging');

					window.removeEventListener('click', click);
				}

				window.addEventListener('mousemove', mousemove);
				window.addEventListener('mouseup', mouseup);
				window.addEventListener('click', click);

				event.preventDefault();
			}
		});

		button.addEventListener('click', function () {
			if (this.classList.contains('it-button--dragging') === false) {
				var rect = this.getBoundingClientRect(),
					left = rect.x,
					top = rect.y,
					scrim = document.createElement('div'),
					iframe = document.createElement('iframe');

				scrim.className = 'it-button__scrim';
				scrim.addEventListener('click', function () {
					scrim.remove();
					iframe.remove();
				});

				iframe.className = 'it-button__iframe';

				if (document.body.offsetWidth - left < 320) {
					left = document.body.offsetWidth - 320;
				}

				if (window.innerHeight - top < Math.min(586, window.innerHeight) + 8) {
					top = window.innerHeight - Math.min(586, window.innerHeight) - 8;
				}

				iframe.style.left = left + 'px';
				iframe.style.top = top + 'px';

				document.body.appendChild(scrim);
				document.body.appendChild(iframe);

				ImprovedTube.messages.send({requestOptionsUrl: true});
			}
		});

		label.textContent = 'ImprovedTube';

		button.appendChild(label);

		this.elements.improvedtube_button = button;
	}

	button.className = 'it-button';
	button.style.left = '';
	button.style.top = '';

	if (option === 'header_left') {
		if (this.storage.header_position === 'normal' && this.elements.masthead.start) {
			this.elements.masthead.start.appendChild(button);
		} else if (this.elements.app_drawer.start) {
			this.elements.app_drawer.start.appendChild(button);
		}
	} else if (option === 'header_right') {
		if (this.elements.masthead.end) {
			this.elements.masthead.end.appendChild(button);
		}
	} else if (option === 'below_player') {
		if (this.elements.video_title) {
			button.classList.add('it-button--below-player');

			this.elements.video_title.appendChild(button);
		}
	} else if (option === 'sidebar') {
		if (this.elements.sidebar_section) {
			this.elements.sidebar_section.appendChild(button);
		}
	} else if (option === 'draggable') {
		if (document.body) {
			button.style.left = x + 'px';
			button.style.top = y + 'px';

			button.classList.add('it-button--draggable');

			document.body.appendChild(button);
		}
	} else if (button) {
		button.remove();
	}
};

/*-----------------------------------------------------------------------------
4.10.3 DELETE YOUTUBE COOKIES
-----------------------------------------------------------------------------*/

ImprovedTube.deleteYoutubeCookies = function () {
	var cookies = document.cookie.split(';');

	for (var i = 0, l = cookies.length; i < l; i++) {
		var cookie = cookies[i],
			eqPos = cookie.indexOf('='),
			name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

		document.cookie = name + '=; domain=.youtube.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}

	setTimeout(function () {location.reload();}, 100);
};

/*-----------------------------------------------------------------------------
4.10.4 YOUTUBE LANGUAGE
-----------------------------------------------------------------------------*/

ImprovedTube.youtubeLanguage = function () {
	let value = this.storage.youtube_language;

	if (value) {
		if (value == 'disabled') {
			// do nothing
		} else if (value == 'default') {
			// Delete 'hl' PREF cookie, let YT pick default Browser language
			this.setPrefCookieValueByName('hl', null);
		} else {
			this.setPrefCookieValueByName('hl', value);
		}
	}
};


/*-----------------------------------------------------------------------------
4.10.5 ADVANCED VIDEO BUFFERING
-----------------------------------------------------------------------------*/

ImprovedTube.advancedVideoBuffering = function () {
    // You could add any change/display logic here if required,
    // but the player logic will use ImprovedTube.storage.get('advanced_video_buffering')
    // for the effective toggle.
    // This stub is needed for extension settings consistency.
	var enabled = this.storage.advanced_video_buffering;

    // All logic to apply buffering/preload goes in player.js.
    // Optionally: reload/update the player if the setting was changed.
    if (changed) {
        // You can reload the player or re-apply settings if needed:
        ImprovedTube.applyPlayerSettings && ImprovedTube.applyPlayerSettings();
}
};
