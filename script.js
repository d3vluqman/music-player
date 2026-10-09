// ---------- Song data ----------
// Replace `src` with your own audio files (e.g. "assets/audio/song1.mp3").
// The sample tracks below are SoundHelix demo songs, hosted online.
const songs = [
  {
    title: "Lost in the City Lights",
    author: "Cosmo Sheldrake",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    img: "assets/covers/lost-in-the-city-lights.svg",
  },
  {
    title: "Neon Drift",
    author: "Aurora Lane",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    img: "assets/covers/neon-drift.svg",
  },
  {
    title: "Midnight Bloom",
    author: "The Paper Moons",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    img: "assets/covers/midnight-bloom.svg",
  },
];

// ---------- DOM ----------
const player = document.querySelector(".player");
const coverEl = document.getElementById("cover");
const titleEl = document.getElementById("title");
const authorEl = document.getElementById("author");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const playButton = document.getElementById("playButton");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const statusEl = document.getElementById("status");

// ---------- State ----------
let currentSongIndex = 0;
const audio = new Audio();
audio.preload = "metadata";

// ---------- Helpers ----------
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function setProgressUI(percent) {
  const safe = Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 100) : 0;
  progressBar.value = safe;
  progressBar.style.setProperty("--fill", `${safe}%`);
}

function setPlayingUI(isPlaying) {
  player.classList.toggle("is-playing", isPlaying);
  playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

// ---------- Core functions ----------
function loadSong(index) {
  // Wrap around at both ends of the list
  currentSongIndex = (index + songs.length) % songs.length;
  const song = songs[currentSongIndex];

  audio.src = song.src;
  coverEl.src = song.img;
  coverEl.alt = `Cover art for ${song.title}`;
  titleEl.textContent = song.title;
  authorEl.textContent = song.author;
  document.title = `${song.title} · ${song.author}`;

  statusEl.textContent = "";
  currentTimeEl.textContent = "00:00";
  durationEl.textContent = "00:00";
  setProgressUI(0);
}

async function play() {
  try {
    await audio.play();
  } catch (err) {
    // Ignore the benign case where a new load interrupts a pending play()
    if (err.name !== "AbortError") {
      console.error(err);
      statusEl.textContent = "Couldn't play this song. Check the audio file path.";
    }
    setPlayingUI(false);
  }
}

function playPause() {
  if (audio.paused) {
    play();
  } else {
    audio.pause();
  }
}

function nextSong() {
  loadSong(currentSongIndex + 1);
  play();
}

function prevSong() {
  // Standard player behaviour: restart the song if it's already past 3s
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadSong(currentSongIndex - 1);
  play();
}

function updateProgressBar() {
  if (!Number.isFinite(audio.duration) || audio.duration === 0) return;
  setProgressUI((audio.currentTime / audio.duration) * 100);
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

function seek() {
  if (!Number.isFinite(audio.duration)) return; // metadata not loaded yet
  const percent = Number(progressBar.value);
  audio.currentTime = (percent / 100) * audio.duration;
  progressBar.style.setProperty("--fill", `${percent}%`);
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

// ---------- Events ----------
playButton.addEventListener("click", playPause);
nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);
progressBar.addEventListener("input", seek);

audio.addEventListener("play", () => setPlayingUI(true));
audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("timeupdate", updateProgressBar);
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener("ended", nextSong);
audio.addEventListener("error", () => {
  setPlayingUI(false);
  statusEl.textContent = "Couldn't load this song. Check the audio file path.";
});

// ---------- Init ----------
loadSong(currentSongIndex);
