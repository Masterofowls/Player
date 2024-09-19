const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');
const trackTitle = document.getElementById('track-title');
const artistName = document.getElementById('artist-name');
const searchBar = document.getElementById('search-bar');
const usernameEl = document.getElementById('username');

let isPlaying = false;
let currentTrackIndex = 0;

let tracks = [];  
// Функция загрузки треков из JSON
function loadTracks() {
  fetch('tracks.json')
    .then(response => response.json())
    .then(data => {
      tracks = data;
      loadTrack(currentTrackIndex); 
    })
}

// Функция загрузки трека
function loadTrack(index) {
  if (tracks.length > 0) {
    audioPlayer.src = tracks[index].src;
    trackTitle.textContent = tracks[index].title;
    artistName.textContent = tracks[index].artist;
  }
}


// Воспроизведение/пауза
function playTrack() {
  isPlaying = true;
  audioPlayer.play();
  playPauseBtn.textContent = '⏸️';
}

function pauseTrack() {
  isPlaying = false;
  audioPlayer.pause();
  playPauseBtn.textContent = '▶️';
}

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
});

// Переключение треков
prevBtn.addEventListener('click', () => {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  playTrack();
});

nextBtn.addEventListener('click', () => {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(currentTrackIndex);
  playTrack();
});


// Загрузка треков при старте
loadTracks();
