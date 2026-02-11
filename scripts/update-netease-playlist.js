const fs = require("fs");
const path = require("path");

const DEFAULT_OUT = path.join(__dirname, "../src/assets/data/playlist.json");
const DEFAULT_ID = "14271049356";

function parseArgs(argv) {
  const args = { id: null, out: null, pretty: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--id") {
      args.id = argv[i + 1];
      i += 1;
    } else if (arg === "--out") {
      args.out = argv[i + 1];
      i += 1;
    } else if (arg === "--compact") {
      args.pretty = false;
    }
  }
  return args;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://music.163.com/",
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function getPlaylist(id) {
  const endpoints = [
    `https://music.163.com/api/playlist/detail?id=${id}`,
    `https://music.163.com/api/v6/playlist/detail?id=${id}`,
  ];

  let lastError;
  for (const url of endpoints) {
    try {
      return await fetchJson(url);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Unable to load playlist");
}

function toTracks(payload) {
  const tracks = payload?.result?.tracks || payload?.playlist?.tracks || [];
  return tracks.map((track) => ({
    title: track.name,
    artist: (track.ar?.[0]?.name || track.artists?.[0]?.name || "Unknown"),
    url: `https://music.163.com/song/media/outer/url?id=${track.id}.mp3`,
    cover: track.al?.picUrl || track.album?.picUrl || "",
  }));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const id = args.id || DEFAULT_ID;
  const outPath = args.out ? path.resolve(args.out) : DEFAULT_OUT;

  if (!id) {
    console.error("Missing playlist id. Use --id <playlistId>.");
    process.exit(1);
  }

  const payload = await getPlaylist(id);
  const tracks = toTracks(payload);

  if (!tracks.length) {
    console.error("Playlist returned no tracks. Check the playlist id.");
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const json = args.pretty ? JSON.stringify(tracks, null, 2) : JSON.stringify(tracks);
  fs.writeFileSync(outPath, json);

  console.log(`Saved ${tracks.length} tracks to ${outPath}`);
}

main().catch((err) => {
  console.error("Failed to update playlist:", err.message);
  process.exit(1);
});
