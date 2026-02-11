console.log("YT Sub Highlight running");

// Load saved channels
const savedChannels = new Set(
  JSON.parse(localStorage.getItem("yt-marked-channels") || "[]")
);

function saveChannels() {
  localStorage.setItem(
    "yt-marked-channels",
    JSON.stringify([...savedChannels])
  );
}

function enhanceChannel(link) {
  if (link.dataset.enhanced) return;
  link.dataset.enhanced = "true";

  const channelUrl = link.href;

  const star = document.createElement("span");
  star.textContent = savedChannels.has(channelUrl) ? " ⭐" : " ☆";
  star.style.cursor = "pointer";
  star.style.marginLeft = "6px";
  star.style.fontSize = "14px";
  star.title = "Click to mark this channel";

  // ✅ FIX: stop navigation when clicking star
  star.addEventListener("click", (event) => {
    event.preventDefault();    // stops link navigation
    event.stopPropagation();   // stops event bubbling

    if (savedChannels.has(channelUrl)) {
      savedChannels.delete(channelUrl);
      star.textContent = " ☆";
    } else {
      savedChannels.add(channelUrl);
      star.textContent = " ⭐";
    }

    saveChannels();
  });

  link.appendChild(star);
}

function scanChannels() {
  document
    .querySelectorAll('a[href^="/@"]')
    .forEach(enhanceChannel);
}

// Initial run
scanChannels();

// Handle infinite scroll
new MutationObserver(scanChannels).observe(document.body, {
  childList: true,
  subtree: true
});
