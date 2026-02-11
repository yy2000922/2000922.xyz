const DEFAULTS = {
  shortcode: "musicPlayer",
  assetsShortcode: "musicPlayerAssets",
  cssPath: "/assets/css/music-player.css",
  jsPath: "/assets/js/music-player.js",
  listClass: "mp-list",
  playerClass: "mp-player",
  defaultOptions: {
    autoplay: false,
    loop: false,
    volume: 0.8,
    startIndex: 0,
    showList: true,
    collapsed: true,
  },
};

function safeJsonStringify(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function normalizeOptions(options, defaults) {
  if (!options || typeof options !== "object") {
    return { ...defaults };
  }
  return { ...defaults, ...options };
}

function isUrl(value) {
  return typeof value === "string" && /^(https?:)?\/\//.test(value);
}

function isPath(value) {
  return typeof value === "string" && value.startsWith("/");
}

function resolvePlaylist(playlist) {
  if (isUrl(playlist) || isPath(playlist)) {
    return { url: playlist, data: null };
  }
  return { url: null, data: playlist };
}

function musicPlayerPlugin(eleventyConfig, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };

  eleventyConfig.addShortcode(options.assetsShortcode, function musicPlayerAssets() {
    return `\n<link rel="stylesheet" href="${options.cssPath}">\n<script src="${options.jsPath}" defer></script>\n`;
  });

  eleventyConfig.addShortcode(options.shortcode, function musicPlayer(playlist, shortcodeOptions = {}) {
    const resolved = resolvePlaylist(playlist);
    const mergedOptions = normalizeOptions(shortcodeOptions, options.defaultOptions);
    const playerId = `mp-${Math.random().toString(36).slice(2, 10)}`;
    const collapsedClass = mergedOptions.collapsed ? " mp-collapsed" : "";
    const dataset = {
      "data-mp-id": playerId,
      "data-mp-autoplay": mergedOptions.autoplay ? "true" : "false",
      "data-mp-loop": mergedOptions.loop ? "true" : "false",
      "data-mp-volume": String(mergedOptions.volume),
      "data-mp-start-index": String(mergedOptions.startIndex),
      "data-mp-show-list": mergedOptions.showList ? "true" : "false",
    };

    if (resolved.url) {
      dataset["data-mp-playlist-url"] = resolved.url;
    }

    const datasetAttrs = Object.entries(dataset)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

    const playlistScript = resolved.data
      ? `\n<script type="application/json" class="mp-data">${safeJsonStringify(resolved.data)}</script>`
      : "";

    return `\n<div class="${options.playerClass}${collapsedClass}" ${datasetAttrs}>
    <div class="mp-shell">
      <div class="mp-cover" aria-hidden="true"></div>
      <div class="mp-meta">
        <div class="mp-title">---</div>
        <div class="mp-artist">---</div>
      </div>
    <div class="mp-controls">
      <button class="mp-btn mp-toggle" type="button" data-mp-toggle="panel" aria-label="Minimize">
        <span aria-hidden="true">▾</span>
      </button>
      <button class="mp-btn mp-prev" type="button" aria-label="Previous">
        <span aria-hidden="true">&#9664;&#9664;</span>
      </button>
      <button class="mp-btn mp-play" type="button" aria-label="Play">
        <span class="mp-icon mp-icon-play" aria-hidden="true">&#9654;</span>
        <span class="mp-icon mp-icon-pause" aria-hidden="true">&#10073;&#10073;</span>
      </button>
      <button class="mp-btn mp-next" type="button" aria-label="Next">
        <span aria-hidden="true">&#9654;&#9654;</span>
      </button>
    </div>
    <div class="mp-progress">
      <span class="mp-time mp-current">0:00</span>
      <div class="mp-bar" role="progressbar" aria-label="Playback progress">
        <div class="mp-bar-fill"></div>
      </div>
      <span class="mp-time mp-duration">0:00</span>
    </div>
  </div>
  <ul class="${options.listClass}" role="list"></ul>
  <button class="mp-btn mp-toggle mp-mini" type="button" data-mp-toggle="mini" aria-label="Expand">
    <span class="mp-mini-icon" aria-hidden="true">♫</span>
    <span class="mp-mini-pulse" aria-hidden="true"></span>
  </button>
  <audio class="mp-audio" preload="metadata"></audio>${playlistScript}
</div>\n`;
  });
}

module.exports = musicPlayerPlugin;
