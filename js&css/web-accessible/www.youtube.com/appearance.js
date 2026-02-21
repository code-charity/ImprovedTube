/*------------------------------------------------------------------------------
  APPEARANCE
------------------------------------------------------------------------------*/

ImprovedTube.YouTubeExperiments = function () {
	if (
		(this.storage.undo_the_new_sidebar === "true" ||
			this.storage.description === "sidebar") &&
		document.documentElement.dataset.pageType === "video"
	) {
		if (window.yt?.config_?.EXPERIMENT_FLAGS) {
			const newSidebarFlags = [
				"kevlar_watch_grid",
				"small_avatars_for_comments",
				"small_avatars_for_comments_ep",
				"web_watch_rounded_player_large"
			];

			if (this.storage.undo_the_new_sidebar === "true") {
				if (window.yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid !== false) {
					try {
						newSidebarFlags.forEach(flag => {
							Object.defineProperty(
								window.yt.config_.EXPERIMENT_FLAGS,
								flag,
								{ get: () => false }
							);
						});
					} catch (error) {
						console.error("can't undo description on the side", error);
					}
				}
			} else if (
				this.storage.description === "sidebar" &&
				window.yt.config_.EXPERIMENT_FLAGS.kevlar_watch_grid !== true
			) {
				try {
					newSidebarFlags.forEach(flag => {
						Object.defineProperty(
							window.yt.config_.EXPERIMENT_FLAGS,
							flag,
							{ get: () => true }
						);
					});
				} catch (error) {
					console.error("tried to move description to the sidebar", error);
				}
			}
		} else {
			console.log("yt.config_.EXPERIMENT_FLAGS is not yet defined");
		}
	}
};

/*------------------------------------------------------------------------------
  PLAYER SIZE
------------------------------------------------------------------------------*/

ImprovedTube.playerSize = function () {
	if (this.storage.player_size === "custom") {
		const width = Number(this.storage.custom_player_size_width) || 1280;
		const height = Number(this.storage.custom_player_size_height) || 720;

		const style =
			this.elements.player_size_style || document.createElement("style");

		style.textContent = `
			:root {
				--it-player-width: ${width}px;
				--it-player-height: ${height}px;
			}
		`;

		document.body.appendChild(style);

		if (document.documentElement.dataset.pageType === "video") {
			window.dispatchEvent(new Event("resize"));
		}
	}
};

/*------------------------------------------------------------------------------
  FORCED THEATER MODE
------------------------------------------------------------------------------*/

ImprovedTube.forcedTheaterMode = function () {
	if (
		ImprovedTube.storage.forced_theater_mode === true &&
		ImprovedTube.elements.ytd_watch &&
		ImprovedTube.elements.player
	) {
		const button =
			ImprovedTube.elements.player.querySelector("button.ytp-size-button");

		if (button && ImprovedTube.elements.ytd_watch.theater === false) {
			document.cookie = "wide=1;domain=.youtube.com";
			setTimeout(() => button.click(), 100);
		}
	}
};

/*------------------------------------------------------------------------------
  HD THUMBNAIL
------------------------------------------------------------------------------*/

ImprovedTube.playerHdThumbnail = function () {
	if (this.storage.player_hd_thumbnail === true) {
		const thumbnail = ImprovedTube.elements.player_thumbnail;

		if (
			thumbnail?.style.backgroundImage?.includes("/hqdefault.jpg")
		) {
			thumbnail.style.backgroundImage =
				thumbnail.style.backgroundImage.replace(
					"/hqdefault.jpg",
					"/maxresdefault.jpg"
				);
		}
	}
};

/*------------------------------------------------------------------------------
  COMMENTS SIDEBAR SIMPLE
------------------------------------------------------------------------------*/

ImprovedTube.commentsSidebarSimple = function () {
	if (ImprovedTube.storage.comments_sidebar_simple !== true) return;

	if (window.matchMedia("(min-width: 1599px)").matches) {
		document
			.querySelector("#primary")
			?.insertAdjacentElement(
				"afterend",
				document.querySelector("#comments")
			);
	}

	if (window.matchMedia("(max-width: 1598px)").matches) {
		document
			.querySelector("#related")
			?.insertAdjacentElement(
				"beforebegin",
				document.querySelector("#comments")
			);

		setTimeout(() => {
			document
				.querySelector("#primary-inner")
				?.appendChild(document.querySelector("#related"));
		});
	}
};

/*------------------------------------------------------------------------------
  COMMENTS SIDEBAR (FULL)
------------------------------------------------------------------------------*/

ImprovedTube.commentsSidebar = function () {
	if (ImprovedTube.storage.comments_sidebar !== true) return;

	const video =
		document.querySelector("#player .ytp-chrome-bottom") ||
		document.querySelector("#container .ytp-chrome-bottom");

	let hasApplied = 0;

	if (/watch\?/.test(location.href)) {
		sidebar();
		setGrid();
		applyObserver();

		window.addEventListener("resize", sidebar);
		document.addEventListener("fullscreenchange", () =>
			setTimeout(sidebar, 100)
		);
	}

	function sidebar() {
		if (!video) return;

		if (window.matchMedia("(min-width: 1952px)").matches) {
			if (!hasApplied || hasApplied === 2) {
				initialSetup();
				setTimeout(() => {
					document
						.getElementById("columns")
						?.appendChild(document.getElementById("related"));
				});
			}
			hasApplied = 1;
		} else if (window.matchMedia("(min-width: 1000px)").matches) {
			if (!hasApplied) initialSetup();
			if (hasApplied === 1) {
				document
					.getElementById("primary-inner")
					?.appendChild(document.getElementById("related"));
			}
			hasApplied = 2;
		} else {
			const comments = document.querySelector("#comments");
			const below = document.getElementById("below");
			if (comments && below) below.appendChild(comments);
			hasApplied = 0;
		}
	}

	function setGrid() {
		const interval = setInterval(() => {
			const container =
				document.querySelector(
					"#related ytd-compact-video-renderer"
				)?.parentElement;
			if (container) {
				clearInterval(interval);
				container.style.display = "flex";
				container.style.flexWrap = "wrap";
			}
		}, 250);
	}

	function initialSetup() {
		const primaryInner = document.getElementById("primary-inner");
		const secondaryInner = document.getElementById("secondary-inner");
		const comments = document.querySelector("#comments");

		setTimeout(() => {
			primaryInner?.appendChild(document.getElementById("panels"));
			primaryInner?.appendChild(document.getElementById("related"));
			secondaryInner?.appendChild(
				document.getElementById("chat-template")
			);
			secondaryInner?.appendChild(comments);
		});
	}

	function applyObserver() {
		if (!video) return;

		const resizeObserver = new ResizeObserver(
			debounce(() => {}, 200)
		);
		resizeObserver.observe(video);
	}

	function debounce(fn, delay) {
		let timer;
		return function (...args) {
			clearTimeout(timer);
			timer = setTimeout(() => fn.apply(this, args), delay);
		};
	}
};

/*------------------------------------------------------------------------------
  HIDE TOP PROGRESS BAR
------------------------------------------------------------------------------*/

ImprovedTube.hideTopProgressBar = function () {
	const progressBar = document.querySelector(".top-progress-bar");
	if (progressBar) progressBar.style.display = "none";
};

/*------------------------------------------------------------------------------
  DISABLE LIKES ANIMATION
------------------------------------------------------------------------------*/

if (ImprovedTube.storage.disable_likes_animation === true) {
	ImprovedTube.disableLikesAnimation = function () {
		document
			.querySelectorAll("yt-animated-rolling-number")
			.forEach(el => {
				const value = el.getAttribute("value") || el.textContent;
				if (!value) return;

				const span = document.createElement("span");
				span.textContent = value;
				span.style.fontVariantNumeric = "tabular-nums";
				el.replaceWith(span);
			});
	};

	const run = () =>
		ImprovedTube.disableLikesAnimation &&
		ImprovedTube.disableLikesAnimation();

	document.addEventListener("yt-page-data-updated", run);
	document.addEventListener("yt-navigate-finish", run);
	window.addEventListener("load", run);
	setTimeout(run, 2000);
}
