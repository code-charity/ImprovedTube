/*--------------------------------------------------------------
>>> INITIALIZATION
--------------------------------------------------------------*/
if (document.body) { ImprovedTube.childHandler(document.body); }

ImprovedTube.observer = new MutationObserver(function (mutationList) {

	for (var i = 0, l = mutationList.length; i < l; i++) {
		var mutation = mutationList[i];

		if (mutation.type === 'childList') {
			for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
				ImprovedTube.childHandler(mutation.addedNodes[j]);
			}
		}
		if (mutation.target && mutation.target.id === 'owner-sub-count') {
			// Extract and store the subscriber count
			ImprovedTube.extractSubscriberCount();
		}

	}

	/*
	//console.log("--- p FOR PARENT, c FOR CHILD, r FOR REMOVED :");
	let i = 0; for (const mutated of mutationList) {

		if (mutated.type === 'childList') {
			// if (/^(SCRIPT|DOM-IF|DOM-REPEAT|svg|SPAN|yt-icon-shape)$/.test(mutated.target.nodeName)) {i++; continue; }
			// ImprovedTube.ytElementsHandler(mutated.target);
			// console.log("p"+i+":"+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
				let j = 0; for (const node of mutated.addedNodes) {
				ImprovedTube.childHandler(node);
//console.log("p"+i+"c"+j+":"+node.id+",class:"+node.className+","+node+"("+node.nodeName+")");
				j++;}
				let r = 0; for (const node of mutated.removedNodes){ //might fix our other playlist buttons equally?
				if(node.nodeName === 'BUTTON' && node.id === 'it-popup-playlist-button') ImprovedTube.playlistPopup();
//console.log("p"+i+"removed"+r+":"+node.id+",class:"+node.className+","+node+"("+node.nodeName+")"+"(from:"+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
				r++;}
						if(mutated.target.id === 'owner-sub-count')
						{if (ImprovedTube.storage.ads === 'small_creators')
						{ImprovedTube.extractSubscriberCount(mutated.target);}}
		}
//	if (mutated.type === 'characterData') { if (/#COMMENT/.test(mutated.target.nodeName)) {i++; continue; };	ImprovedTube.ytElementsHandler(mutated.target);
//console.log("changed characterData:"+mutated.target.nodeValue+"("+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+")");
//	 } if (mutated.type === 'attributes')  {if (/^(caption-window-|ytp-progress-bar$|ytp-[a-z]*-progress$)/.test(mutated.target.nodeName)) return; ImprovedTube.ytElementsHandler(mutated.target);
//console.log("mutated attribute:"+mutated.attributeName+"("+mutated.target.id+",class:"+mutated.target.className+","+mutated.target+"("+mutated.target.nodeName+"))");
		}
	i++;}
	*/

}).observe(document.documentElement, {
	//	attributes: true,
	//	attributeOldValue: true,
	//	characterData: true,
	//	characterDataOldValue: true,
	childList: true,
	subtree: true
});

if (ImprovedTube.storage.channel_default_tab && ImprovedTube.storage.channel_default_tab !== '/') {
	new MutationObserver(function (mutationList) {
		for (var i = 0, l = mutationList.length; i < l; i++) {
			var mutation = mutationList[i];

			if (mutation.type === 'attributes') {
				ImprovedTube.channelDefaultTab(mutation.target);
			}
		}
	}).observe(document.documentElement, {
		attributeFilter: ['href'],
		attributes: true,
		childList: true,
		subtree: true
	});
}
/*--------------------------------------------------------------
# CATEGORY REFRESH BUTTON
--------------------------------------------------------------*/
ImprovedTube.categoryRefreshButton = function () {
	if (this.storage.category_refresh_button !== true) {
		return;
	}

	function addRefreshButton() {
		if (document.querySelector('.it-category-refresh-btn')) {
			return;
		}

		const button = document.createElement('button');
		button.className = 'it-category-refresh-btn';
		button.title = 'Restore categories';
		button.setAttribute('aria-label', 'Restore categories');
		button.style.cssText = 'background: transparent; border: none; padding: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--yt-spec-icon-inactive); position: relative;';

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '24');
		svg.setAttribute('height', '24');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.style.display = 'block';

		const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path1.setAttribute('d', 'M1 4v6h6');

		const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path2.setAttribute('d', 'M23 20v-6h-6');

		const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path3.setAttribute('d', 'M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15');

		svg.appendChild(path1);
		svg.appendChild(path2);
		svg.appendChild(path3);
		button.appendChild(svg);

		button.addEventListener('mouseenter', function() {
			this.style.background = 'var(--yt-spec-badge-chip-background)';
			this.style.borderRadius = '50%';
		});
		button.addEventListener('mouseleave', function() {
			this.style.background = 'transparent';
		});

		button.addEventListener('click', function() {
			let chipContainer = document.querySelector('ytd-feed-filter-chip-bar-renderer');

			if (chipContainer) {
				chipContainer.style.display = '';
				chipContainer.style.visibility = 'visible';
				chipContainer.style.opacity = '1';
				chipContainer.hidden = false;

				let parent = chipContainer.parentElement;
				while (parent && parent !== document.body) {
					parent.style.display = '';
					parent.style.visibility = 'visible';
					parent = parent.parentElement;
				}

				const allChips = chipContainer.querySelectorAll('yt-chip-cloud-chip-renderer button');
				if (allChips.length > 1) {
					allChips[1].click();
					setTimeout(function() {
						allChips[0].click();
					}, 200);
				}
			} else {
				window.location.reload();
			}
		});

		const mastheadButtons = document.querySelector('ytd-masthead #end #buttons');
		if (mastheadButtons) {
			mastheadButtons.insertBefore(button, mastheadButtons.firstChild);
		}
	}

	addRefreshButton();

	const mastheadObserver = new MutationObserver(function() {
		if (!document.querySelector('.it-category-refresh-btn')) {
			const mastheadButtons = document.querySelector('ytd-masthead #end #buttons');
			if (mastheadButtons && mastheadButtons.children.length > 0) {
				addRefreshButton();
			}
		}
	});

	const masthead = document.querySelector('ytd-masthead');
	if (masthead) {
		mastheadObserver.observe(masthead, { childList: true, subtree: true });
	}
};

ImprovedTube.init = function () {
	window.addEventListener('yt-page-data-updated', function () {
		ImprovedTube.pageType();
		if (location.search.match(ImprovedTube.regex.playlist_id)) {
			ImprovedTube.playlistRepeat();
			ImprovedTube.playlistShuffle();
			ImprovedTube.playlistReverse();
			ImprovedTube.playlistPopup();
			ImprovedTube.playlistCopyVideoIdButton();
			ImprovedTube.playlistCompleteInit();
			ImprovedTube.playlistLargePlaylistHandler();
		}
		try { if (ImprovedTube.lastWatchedOverlay) ImprovedTube.lastWatchedOverlay(); } catch (e) { console.error('[LWO] page-data-updated error', e); }
	});
	this.pageType();
	this.playerOnPlay();
	this.playerSDR();
	this.shortcutsInit();
	this.onkeydown();
	this.onmousedown();
	this.youtubeLanguage();
	this.myColors();
	this.YouTubeExperiments();
	this.channelCompactTheme();
	this.categoryRefreshButton();

	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}
	if (ImprovedTube.elements.shorts_player) {
		if (ImprovedTube.storage.prevent_shorts_autoloop) {
			ImprovedTube.stop_shorts_autoloop();
		}
		ImprovedTube.shortsAutoScroll();
	}
	if (window.matchMedia) {
		document.documentElement.dataset.systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	if (ImprovedTube.storage.full_screen_quality) {
		if (!ImprovedTube._fsqBound) {
			document.addEventListener('fullscreenchange', () => ImprovedTube.playerQualityFullScreen(), { passive: true });
			ImprovedTube._fsqBound = true;
		}
		ImprovedTube.playerQualityFullScreen();
	}

};



document.addEventListener('yt-navigate-finish', function () {
	/* 			if (name === 'META') {			   //<META> infos are not updated when clicking related videos...
				if(node.getAttribute('name')) {
				//if(node.getAttribute('name') === 'title')		 {ImprovedTube.title = node.content;}		//duplicate
				//if(node.getAttribute('name') === 'description')	   {ImprovedTube.description = node.content;}  //duplicate
				//if(node.getAttribute('name') === 'themeColor')			{ImprovedTube.themeColor = node.content;}   //might help our darkmode/themes
//Do we need any of these here before the player starts?
				//if(node.getAttribute('name') === 'keywords')		  {ImprovedTube.keywords = node.content;}
				} else if (node.getAttribute('itemprop')) {
				//if(node.getAttribute('itemprop') === 'name')		  {ImprovedTube.title = node.content;}
				if(node.getAttribute('itemprop') === 'genre')		   {ImprovedTube.category  = node.content;}
				//if(node.getAttribute('itemprop') === 'channelId')	 {ImprovedTube.channelId = node.content;}
				//if(node.getAttribute('itemprop') === 'videoId')	   {ImprovedTube.videoId = node.content;}
//The following infos will enable awesome, smart features.  Some of which everyone should use.
				//if(node.getAttribute('itemprop') === 'description')   {ImprovedTube.description = node.content;}
				//if(node.getAttribute('itemprop') === 'duration')	  {ImprovedTube.duration = node.content;}
				//if(node.getAttribute('itemprop') === 'interactionCount'){ImprovedTube.views = node.content;}
				//if(node.getAttribute('itemprop') === 'isFamilyFriendly'){ImprovedTube.isFamilyFriendly = node.content;}
				//if(node.getAttribute('itemprop') === 'unlisted')	  {ImprovedTube.unlisted = node.content;}
				//if(node.getAttribute('itemprop') === 'regionsAllowed'){ImprovedTube.regionsAllowed = node.content;}
				//if(node.getAttribute('itemprop') === 'paid')		  {ImprovedTube.paid = node.content;}
				// if(node.getAttribute('itemprop') === 'datePublished' ){ImprovedTube.datePublished = node.content;}
						//to use in the "how long ago"-feature, not to fail without API key?  just like the "day-of-week"-feature above
				// if(node.getAttribute('itemprop') === 'uploadDate')   {ImprovedTube.uploadDate = node.content;}
*/
	ImprovedTube.pageType();
	ImprovedTube.YouTubeExperiments();
	ImprovedTube.commentsSidebar();
	ImprovedTube.categoryRefreshButton();
	try { if (ImprovedTube.lastWatchedOverlay) ImprovedTube.lastWatchedOverlay(); } catch (e) { console.error('[LWO] nav-finish error', e); }

	// Cleanup playlist handlers when navigating away from playlist pages
	if (!location.search.match(ImprovedTube.regex.playlist_id)) {
		if (typeof ImprovedTube.cleanupPlaylistHandlers === 'function') {
			ImprovedTube.cleanupPlaylistHandlers();
		}
	}

	// Return YouTube Dislike - call on video pages and Shorts
	if (document.documentElement.dataset.pageType === 'video' || window.location.pathname.startsWith('/shorts/')) {
		try {
			setTimeout(function () {
				ImprovedTube.returnYoutubeDislike();
				ImprovedTube.rydInitShortsObserver();
			}, 500);
		} catch (e) { console.error('[RYD] error', e); }
	}

	if (ImprovedTube.elements.player && ImprovedTube.elements.player.setPlaybackRate) {
		ImprovedTube.videoPageUpdate();
		ImprovedTube.initPlayer();
	}
	if (ImprovedTube.elements.shorts_player) {
		ImprovedTube.redirectShortsToWatch();
		if (ImprovedTube.storage.prevent_shorts_autoloop) {
			ImprovedTube.stop_shorts_autoloop();
		}
		ImprovedTube.shortsAutoScroll();
	}
	if (document.documentElement.dataset.pageType === 'home' && ImprovedTube.storage.youtube_home_page === 'search') {
		document.querySelector('body').style.setProperty('visibility', 'visible', 'important');
		ImprovedTube.shortcutGoToSearchBox();
		document.querySelector('#search').click();
	} else if (document.documentElement.dataset.pageType === 'channel') {
		ImprovedTube.channelPlayAllButton();
	}
});

window.addEventListener('load', function () {
	ImprovedTube.elements.masthead = {
		start: document.querySelector('ytd-masthead #start'),
		end: document.querySelector('ytd-masthead #end'),
		logo: document.querySelector('ytd-masthead a#logo')
	}

	ImprovedTube.elements.app_drawer = {
		start: document.querySelector('tp-yt-app-drawer #header'),
		logo: document.querySelector('tp-yt-app-drawer a#logo')
	}
	ImprovedTube.improvedtubeYoutubeIcon();
	if (document.documentElement.dataset.pageType === 'video') { ImprovedTube.expandDescription(); }
	if (document.documentElement.dataset.pageType === 'home' && ImprovedTube.storage.youtube_home_page === 'search') {
		document.querySelector('body').style.setProperty('visibility', 'visible', 'important');
		ImprovedTube.shortcutGoToSearchBox();
		document.querySelector('#search').click();
	}
	//document.querySelector('#content, #guide[opened]').remove() }
});

document.addEventListener("visibilitychange", () => {
	 if (typeof ImprovedTube.playerAutopauseWhenSwitchingTabs === "function") {
         ImprovedTube.playerAutopauseWhenSwitchingTabs();
  }
});