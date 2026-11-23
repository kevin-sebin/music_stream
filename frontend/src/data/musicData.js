export const INITIAL_PLAYLISTS = [
  {
    _pid: 1,
    name: "Late night",
    genre: "Indie · Chill",
    displayGenre: "Indie",
    songsCount: 6,
    durationText: "22 min",
    created_at: "2026-11-12",
    createdAtDisplay: "Nov 12, 2026",
    color: "#923c38", // Brick red
    accentColor: "rgba(146, 60, 56, 0.5)",
    textColor: "#f3a5a1",
    img: ""
  },
  {
    _pid: 2,
    name: "Slow mornings",
    genre: "Acoustic · Warm",
    displayGenre: "Acoustic",
    songsCount: 6,
    durationText: "21 min",
    created_at: "2026-11-08",
    createdAtDisplay: "Nov 8, 2026",
    color: "#ad8a32", // Golden ochre / mustard
    accentColor: "rgba(173, 138, 50, 0.5)",
    textColor: "#f0d48b",
    img: ""
  },
  {
    _pid: 3,
    name: "After hours",
    genre: "Electronic · Pulse",
    displayGenre: "Electronic",
    songsCount: 6,
    durationText: "25 min",
    created_at: "2026-11-01",
    createdAtDisplay: "Nov 1, 2026",
    color: "#356e3f", // Forest green
    accentColor: "rgba(53, 110, 63, 0.5)",
    textColor: "#95e0a0",
    img: ""
  },
  {
    _pid: 4,
    name: "Rainy days",
    genre: "Indie · Atmospheric",
    displayGenre: "Indie",
    songsCount: 6,
    durationText: "23 min",
    created_at: "2026-10-24",
    createdAtDisplay: "Oct 24, 2026",
    color: "#306975", // Deep teal
    accentColor: "rgba(48, 105, 117, 0.5)",
    textColor: "#8ee2f1",
    img: ""
  },
  {
    _pid: 5,
    name: "Soft focus",
    genre: "Lo-fi · Beats",
    displayGenre: "Lo-fi",
    songsCount: 6,
    durationText: "19 min",
    created_at: "2026-10-15",
    createdAtDisplay: "Oct 15, 2026",
    color: "#593671", // Deep violet / purple
    accentColor: "rgba(89, 54, 113, 0.5)",
    textColor: "#d8a6fc",
    img: ""
  },
  {
    _pid: 6,
    name: "City lights",
    genre: "Indie · Synth",
    displayGenre: "Indie",
    songsCount: 6,
    durationText: "24 min",
    created_at: "2026-10-04",
    createdAtDisplay: "Oct 4, 2026",
    color: "#6d3753", // Plum / berry
    accentColor: "rgba(109, 55, 83, 0.5)",
    textColor: "#f39ec5",
    img: ""
  }
];

export const INITIAL_SONGS = [
  {
    _sid: 1,
    name: "Night Drive",
    artist: "Luna Bay",
    duration: "3:42",
    durationSecs: 222,
    color: "#356e3f", // Green like in Now Playing mockup!
    discColor: "#4f3d7a",
    playlistId: 1,
    url: "https://actions.google.com/sounds/v1/weather/light_rain.ogg"
  },
  {
    _sid: 2,
    name: "Midnight City",
    artist: "Neon Coast",
    duration: "4:08",
    durationSecs: 248,
    color: "#306975", // Teal
    discColor: "#26545e",
    playlistId: 1,
    url: ""
  },
  {
    _sid: 3,
    name: "Nightfall",
    artist: "Arlo Vale",
    duration: "3:26",
    durationSecs: 206,
    color: "#356e3f", // Forest Green
    discColor: "#25532d",
    playlistId: 1,
    url: ""
  },
  {
    _sid: 4,
    name: "Late Night Radio",
    artist: "The Paper Moons",
    duration: "3:51",
    durationSecs: 231,
    color: "#ad8a32", // Mustard
    discColor: "#7e6321",
    playlistId: 1,
    url: ""
  },
  {
    _sid: 5,
    name: "A Quiet Night",
    artist: "June Atlas",
    duration: "3:18",
    durationSecs: 198,
    color: "#923c38", // Brick Red
    discColor: "#6c2b28",
    playlistId: 1,
    url: ""
  },
  {
    _sid: 6,
    name: "Into the Night",
    artist: "Northbound",
    duration: "3:35",
    durationSecs: 215,
    color: "#374868", // Slate Blue
    discColor: "#27344d",
    playlistId: 1,
    url: ""
  },
  // Additional songs for other playlists
  {
    _sid: 7,
    name: "Golden Hour Glow",
    artist: "Sunrise Collective",
    duration: "3:15",
    durationSecs: 195,
    color: "#ad8a32",
    discColor: "#7e6321",
    playlistId: 2,
    url: ""
  },
  {
    _sid: 8,
    name: "Morning Mist",
    artist: "Cedar & Pine",
    duration: "3:50",
    durationSecs: 230,
    color: "#ad8a32",
    discColor: "#7e6321",
    playlistId: 2,
    url: ""
  },
  {
    _sid: 9,
    name: "Club Echoes",
    artist: "Prism Void",
    duration: "4:12",
    durationSecs: 252,
    color: "#356e3f",
    discColor: "#25532d",
    playlistId: 3,
    url: ""
  },
  {
    _sid: 10,
    name: "Window Raindrop",
    artist: "Blue Horizon",
    duration: "3:40",
    durationSecs: 220,
    color: "#306975",
    discColor: "#26545e",
    playlistId: 4,
    url: ""
  },
  {
    _sid: 11,
    name: "Study Session Chill",
    artist: "Komorebi Beats",
    duration: "2:55",
    durationSecs: 175,
    color: "#593671",
    discColor: "#3e2450",
    playlistId: 5,
    url: ""
  },
  {
    _sid: 12,
    name: "Neon Boulevard",
    artist: "Velvet Static",
    duration: "3:44",
    durationSecs: 224,
    color: "#6d3753",
    discColor: "#4f273c",
    playlistId: 6,
    url: ""
  }
];
