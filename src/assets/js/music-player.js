(function () {
  const SELECTORS = {
    player: ".mp-player",
    cover: ".mp-cover",
    title: ".mp-title",
    artist: ".mp-artist",
    play: ".mp-play",
    prev: ".mp-prev",
    next: ".mp-next",
    toggle: ".mp-toggle",
    audio: ".mp-audio",
    list: ".mp-list",
    bar: ".mp-bar",
    barFill: ".mp-bar-fill",
    currentTime: ".mp-current",
    duration: ".mp-duration",
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getBool(value) {
    return value === "true" || value === true;
  }

  function parseOptions(root) {
    const dataset = root.dataset;
    return {
      autoplay: getBool(dataset.mpAutoplay),
      loop: getBool(dataset.mpLoop),
      volume: clamp(parseFloat(dataset.mpVolume || "0.8"), 0, 1),
      startIndex: Math.max(parseInt(dataset.mpStartIndex || "0", 10), 0),
      showList: getBool(dataset.mpShowList !== "false"),
      playlistUrl: dataset.mpPlaylistUrl || null,
      persist: dataset.mpPersist !== "false",
    };
  }

  function readInlinePlaylist(root) {
    const script = root.querySelector(".mp-data");
    if (!script) return null;
    try {
      return JSON.parse(script.textContent || "[]");
    } catch (err) {
      console.warn("[music-player] invalid playlist json", err);
      return null;
    }
  }

  function setText(node, text) {
    if (node) node.textContent = text || "---";
  }

  function updateMeta(ui, track) {
    if (!track) {
      setText(ui.title, "---");
      setText(ui.artist, "---");
      if (ui.cover) {
        ui.cover.style.backgroundImage = "";
      }
      return;
    }

    setText(ui.title, track.title || track.name || "Untitled");
    setText(ui.artist, track.artist || track.author || "Unknown");
    if (ui.cover) {
      if (track.cover) {
        ui.cover.style.backgroundImage = `url('${track.cover}')`;
      } else {
        ui.cover.style.backgroundImage = "";
      }
    }
  }

  function updatePlayState(ui, isPlaying) {
    if (!ui.play) return;
    ui.play.classList.toggle("is-playing", isPlaying);
    ui.play.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  }

  function updateProgress(ui, current, duration) {
    if (!ui.barFill) return;
    const percent = duration ? (current / duration) * 100 : 0;
    ui.barFill.style.width = `${Math.min(percent, 100)}%`;
    if (ui.currentTime) ui.currentTime.textContent = formatTime(current);
    if (ui.duration) ui.duration.textContent = formatTime(duration);
  }

  function buildList(ui, playlist, activeIndex, onSelect) {
    if (!ui.list) return;
    ui.list.innerHTML = "";
    playlist.forEach((track, index) => {
      const item = document.createElement("li");
      item.className = "mp-item";
      item.dataset.index = String(index);

      const title = document.createElement("span");
      title.className = "mp-item-title";
      title.textContent = track.title || track.name || `Track ${index + 1}`;

      const artist = document.createElement("span");
      artist.className = "mp-item-artist";
      artist.textContent = track.artist || track.author || "Unknown";

      item.append(title, artist);

      if (index === activeIndex) {
        item.classList.add("is-active");
      }

      item.addEventListener("click", () => onSelect(index));
      ui.list.appendChild(item);
    });
  }

  function highlightList(ui, activeIndex) {
    if (!ui.list) return;
    ui.list.querySelectorAll(".mp-item").forEach((item) => {
      item.classList.toggle("is-active", item.dataset.index === String(activeIndex));
    });
  }

  function setupPlayer(root, playlist, options) {
    if (!Array.isArray(playlist) || playlist.length === 0) {
      root.classList.add("mp-empty");
      return;
    }

    const ui = {
      cover: root.querySelector(SELECTORS.cover),
      title: root.querySelector(SELECTORS.title),
      artist: root.querySelector(SELECTORS.artist),
      play: root.querySelector(SELECTORS.play),
      prev: root.querySelector(SELECTORS.prev),
      next: root.querySelector(SELECTORS.next),
      toggle: root.querySelector(SELECTORS.toggle),
      audio: root.querySelector(SELECTORS.audio),
      list: root.querySelector(SELECTORS.list),
      bar: root.querySelector(SELECTORS.bar),
      barFill: root.querySelector(SELECTORS.barFill),
      currentTime: root.querySelector(SELECTORS.currentTime),
      duration: root.querySelector(SELECTORS.duration),
    };

    let currentIndex = clamp(options.startIndex, 0, playlist.length - 1);
    const playlistSignature = playlist.map((track) => track.url || track.src || "").join("|");

    function loadPersistedState() {
      if (!options.persist) return null;
      try {
        const raw = localStorage.getItem("mp-state");
        if (!raw) return null;
        const state = JSON.parse(raw);
        if (!state || state.signature !== playlistSignature) return null;
        return state;
      } catch (err) {
        return null;
      }
    }

    function saveState(isPlaying) {
      if (!options.persist || !ui.audio) return;
      const track = playlist[currentIndex];
      const payload = {
        signature: playlistSignature,
        index: currentIndex,
        time: ui.audio.currentTime || 0,
        playing: Boolean(isPlaying),
        volume: ui.audio.volume,
      };
      try {
        localStorage.setItem("mp-state", JSON.stringify(payload));
      } catch (err) {}
    }

    if (ui.audio) {
      ui.audio.volume = options.volume;
      ui.audio.loop = options.loop;
    }

    if (ui.list) {
      ui.list.hidden = !options.showList;
    }

    function loadTrack(index, autoplay = false) {
      const track = playlist[index];
      if (!track || !ui.audio) return;
      currentIndex = index;
      ui.audio.src = track.url || track.src || "";
      updateMeta(ui, track);
      highlightList(ui, currentIndex);
      if (autoplay) {
        ui.audio.play().catch(() => {});
      }
    }

    function nextTrack() {
      const nextIndex = (currentIndex + 1) % playlist.length;
      loadTrack(nextIndex, true);
    }

    function prevTrack() {
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      loadTrack(prevIndex, true);
    }

    const persisted = loadPersistedState();
    if (persisted) {
      currentIndex = clamp(persisted.index, 0, playlist.length - 1);
    }

    buildList(ui, playlist, currentIndex, (index) => loadTrack(index, true));
    loadTrack(currentIndex, options.autoplay || (persisted && persisted.playing));

    if (persisted && ui.audio) {
      ui.audio.currentTime = Math.max(persisted.time || 0, 0);
      if (Number.isFinite(persisted.volume)) {
        ui.audio.volume = clamp(persisted.volume, 0, 1);
      }
    }

    if (ui.play && ui.audio) {
      ui.play.addEventListener("click", () => {
        if (ui.audio.paused) {
          ui.audio.play().catch(() => {});
        } else {
          ui.audio.pause();
        }
      });
    }

    if (ui.next) ui.next.addEventListener("click", nextTrack);
    if (ui.prev) ui.prev.addEventListener("click", prevTrack);

    if (ui.bar && ui.audio) {
      ui.bar.addEventListener("click", (event) => {
        const rect = ui.bar.getBoundingClientRect();
        const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        ui.audio.currentTime = ratio * (ui.audio.duration || 0);
      });
    }

    if (ui.audio) {
      ui.audio.addEventListener("timeupdate", () => {
        updateProgress(ui, ui.audio.currentTime, ui.audio.duration);
        saveState(!ui.audio.paused);
      });

      ui.audio.addEventListener("durationchange", () => {
        updateProgress(ui, ui.audio.currentTime, ui.audio.duration);
      });

      ui.audio.addEventListener("play", () => {
        updatePlayState(ui, true);
        saveState(true);
      });
      ui.audio.addEventListener("pause", () => {
        updatePlayState(ui, false);
        saveState(false);
      });
      ui.audio.addEventListener("ended", () => {
        if (!ui.audio.loop && playlist.length > 1) {
          nextTrack();
        }
      });
    }
  }

  async function initPlayer(root) {
    if (root.dataset.mpReady === "true") return;
    root.dataset.mpReady = "true";

    const options = parseOptions(root);
    let playlist = readInlinePlaylist(root);

    if (!playlist && options.playlistUrl) {
      try {
        const response = await fetch(options.playlistUrl, { cache: "no-cache" });
        playlist = await response.json();
      } catch (err) {
        console.warn("[music-player] unable to load playlist", err);
      }
    }

    setupPlayer(root, playlist || [], options);
  }

  function initAll() {
    document.querySelectorAll(SELECTORS.player).forEach((root) => {
      initPlayer(root);
      syncFloatState(root);
    });
  }

  function syncFloatState(root) {
    const floatWrap = root.closest(".mp-float");
    if (!floatWrap) return;
    floatWrap.classList.toggle("is-expanded", !root.classList.contains("mp-collapsed"));
    floatWrap.classList.toggle("is-collapsed", root.classList.contains("mp-collapsed"));
  }

  function handleToggleClick(event) {
    const toggle = event.target.closest(SELECTORS.toggle);
    if (!toggle) return;
    const root = toggle.closest(SELECTORS.player);
    if (!root) return;
    root.classList.toggle("mp-collapsed");
    const isCollapsed = root.classList.contains("mp-collapsed");
    syncFloatState(root);
    const panelToggle = root.querySelector(".mp-toggle[data-mp-toggle='panel']");
    const miniToggle = root.querySelector(".mp-toggle[data-mp-toggle='mini']");
    if (panelToggle) {
      panelToggle.setAttribute("aria-label", isCollapsed ? "Expand" : "Minimize");
      const icon = panelToggle.querySelector("span");
      if (icon) icon.textContent = isCollapsed ? "▸" : "▾";
    }
    if (miniToggle) {
      miniToggle.setAttribute("aria-label", isCollapsed ? "Expand" : "Minimize");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  document.addEventListener("click", handleToggleClick);
})();
