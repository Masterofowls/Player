class AudioPlayer {
  constructor() {
    this.currentTrackIndex = 0;
    this.tracks = [];
    this.audioPlayer = document.getElementById('audio-player');
    this.trackTitle = document.getElementById('track-title');
    this.artistName = document.getElementById('artist-name');
    this.albumArt = document.getElementById('album-art');
    this.playPauseButton = document.getElementById('playpausebtn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.progressBar = document.querySelector('.progress-bar');
    this.currentTimeEl = document.getElementById('current-time');
    this.durationTimeEl = document.getElementById('duration-time');
    this.volumeControl = document.getElementById('volume-control');

    this.init();
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.loadTracks();
      this.setupEventListeners();
    });
  }

  loadTracks() {
    fetch('songs.json')
      .then(response => response.json())
      .then(data => {
        this.tracks = data;
        this.displaySongs(data);
      })
      .catch(error => console.error('Error loading songs.json:', error));
  }

  loadTrack(index) {
    const track = this.tracks[index];
    if (track) {
      this.audioPlayer.src = track.src;

      // Устанавливаем информацию о треке
      this.trackTitle.textContent = track.title;
      this.artistName.textContent = track.artist;
      this.artistName.href = `artists/${track.artist}.html`;
      this.albumArt.src = track.albumArt || ''; // Оставляем пустым, если нет изображения

      // Играть трек только после пользовательского взаимодействия
      this.audioPlayer.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }

  updatePlayPauseButton(isPlaying) {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');

    playIcon.style.display = isPlaying ? 'none' : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(this.currentTrackIndex);
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.loadTrack(this.currentTrackIndex);
  }

  displaySongs(tracks) {
    const songsList = document.getElementById('songs-list');
    songsList.innerHTML = '';

    tracks.forEach((track, index) => {
      const songCard = document.createElement('div');
      songCard.className = 'song-card';

      const img = document.createElement('img');
      img.src = track.albumArt || ''; // Оставляем пустым, если нет изображения
      img.alt = track.title;

      const textContainer = document.createElement('div');
      const title = document.createElement('h2');
      title.textContent = track.title;

      const artistLink = document.createElement('a');
      artistLink.textContent = track.artist;
      artistLink.href = `artists/${track.artist}.html`;
      artistLink.onclick = (event) => {
        event.preventDefault();
        this.loadArtistPage(track.artist);
      };

      textContainer.appendChild(title);
      textContainer.appendChild(artistLink);
      songCard.appendChild(img);
      songCard.appendChild(textContainer);
      songsList.appendChild(songCard);

      songCard.onclick = () => {
        this.currentTrackIndex = index;
        this.loadTrack(this.currentTrackIndex);
      };
    });
  }

  loadArtistPage(artist) {
    fetch(`artists/${artist}.html`)
      .then(response => response.text())
      .then(html => {
        document.querySelector('.main-content').innerHTML = html;
        document.title = artist;
      })
      .catch(error => console.error('Error loading artist page:', error));
  }

  setupEventListeners() {
    this.playPauseButton.addEventListener('click', () => {
      if (this.audioPlayer.paused) {
        this.audioPlayer.play().then(() => this.updatePlayPauseButton(true));
      } else {
        this.audioPlayer.pause();
        this.updatePlayPauseButton(false);
      }
    });

    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());

    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.durationTimeEl.textContent = this.formatTime(this.audioPlayer.duration);
    });

    this.audioPlayer.addEventListener('timeupdate', () => {
      const currentTime = this.audioPlayer.currentTime;
      const duration = this.audioPlayer.duration;

      if (!isNaN(duration)) {
        this.progressBar.value = (currentTime / duration) * 100 || 0;
        this.currentTimeEl.textContent = this.formatTime(currentTime);
      }
    });

    this.progressBar.addEventListener('input', () => {
      const duration = this.audioPlayer.duration;
      this.audioPlayer.currentTime = (this.progressBar.value / 100) * duration;
    });

    // Добавление контроля громкости
    this.volumeControl.addEventListener('input', () => {
      this.audioPlayer.volume = this.volumeControl.value / 100;
    });
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}

// Instantiate the audio player
new AudioPlayer();
