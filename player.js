class AudioPlayer {
  constructor() {
    this.currentTrackIndex = 0;
    this.tracks = [];
    this.isShuffled = false;
    this.shuffledIndices = [];
    this.repeatMode = 'off'; // 'off', 'one', 'all'
    this.isLoading = true;
    
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
    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.repeatBtn = document.getElementById('repeat-btn');
    this.songsList = document.getElementById('songs-list');

    this.init();
  }

  async init() {
    try {
      await this.loadTracks();
      this.setupEventListeners();
      if (this.tracks.length > 0) {
        this.loadTrack(0);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.showErrorMessage('Failed to initialize the player. Please refresh the page.');
    } finally {
      this.isLoading = false;
    }
  }

  async loadTracks() {
    try {
      const response = await fetch('songs.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.tracks = await response.json();
      this.displaySongs(this.tracks);
    } catch (error) {
      console.error('Error loading songs.json:', error);
      throw error; // Re-throw to be caught in init()
    }
  }

  loadTrack(index) {
    if (index < 0 || index >= this.tracks.length) {
      console.error('Invalid track index');
      return;
    }

    const track = this.tracks[index];
    this.audioPlayer.src = track.src;
    this.trackTitle.textContent = track.title;
    this.artistName.textContent = track.artist;
    this.artistName.href = `artists/${track.artist}.html`;
    this.albumArt.src = track.albumArt || 'default-album-art.jpg';

    this.currentTrackIndex = index;
    this.updatePlayPauseButton(false);
    this.highlightCurrentTrack();

    // Preload the audio
    this.audioPlayer.load();
  }

  updatePlayPauseButton(isPlaying) {
    const playIcon = this.playPauseButton.querySelector('.play-icon');
    const pauseIcon = this.playPauseButton.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
      playIcon.style.display = isPlaying ? 'none' : 'block';
      pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
  }

  prevTrack() {
    let newIndex;
    if (this.isShuffled) {
      const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrackIndex);
      newIndex = this.shuffledIndices[(currentShuffleIndex - 1 + this.tracks.length) % this.tracks.length];
    } else {
      newIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    }
    this.loadTrack(newIndex);
    this.audioPlayer.play().catch(this.handlePlayError.bind(this));
  }

  nextTrack() {
    let newIndex;
    if (this.isShuffled) {
      const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrackIndex);
      newIndex = this.shuffledIndices[(currentShuffleIndex + 1) % this.tracks.length];
    } else {
      newIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    }
    this.loadTrack(newIndex);
    this.audioPlayer.play().catch(this.handlePlayError.bind(this));
  }

  displaySongs(tracks) {
    this.songsList.innerHTML = '';

    tracks.forEach((track, index) => {
      const songCard = document.createElement('div');
      songCard.className = 'song-card';
      songCard.dataset.index = index;

      songCard.innerHTML = `
        <img src="${track.albumArt || 'default-album-art.jpg'}" alt="${track.title}">
        <div class="song-info">
          <h3>${track.title}</h3>
          <a href="artists/${track.artist}.html">${track.artist}</a>
        </div>
      `;

      songCard.addEventListener('click', () => {
        this.loadTrack(index);
        this.audioPlayer.play().catch(this.handlePlayError.bind(this));
      });

      this.songsList.appendChild(songCard);
    });
  }

  setupEventListeners() {
    this.playPauseButton.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());
    if (this.shuffleBtn) this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    if (this.repeatBtn) this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    this.audioPlayer.addEventListener('loadedmetadata', () => {
      this.durationTimeEl.textContent = this.formatTime(this.audioPlayer.duration);
    });

    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('ended', () => this.handleTrackEnd());

    this.progressBar.addEventListener('input', () => {
      const duration = this.audioPlayer.duration;
      this.audioPlayer.currentTime = (this.progressBar.value / 100) * duration;
    });

    this.volumeControl.addEventListener('input', () => {
      this.audioPlayer.volume = this.volumeControl.value / 100;
    });
  }

  togglePlay() {
    if (this.audioPlayer.paused) {
      this.audioPlayer.play().catch(this.handlePlayError.bind(this));
    } else {
      this.audioPlayer.pause();
    }
    this.updatePlayPauseButton(!this.audioPlayer.paused);
  }

  updateProgress() {
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration;

    if (!isNaN(duration)) {
      this.progressBar.value = (currentTime / duration) * 100 || 0;
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }
  }

  handleTrackEnd() {
    if (this.repeatMode === 'one') {
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.play().catch(this.handlePlayError.bind(this));
    } else if (this.repeatMode === 'all' || this.isShuffled) {
      this.nextTrack();
    } else if (this.currentTrackIndex < this.tracks.length - 1) {
      this.nextTrack();
    } else {
      this.updatePlayPauseButton(false);
    }
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    if (this.shuffleBtn) this.shuffleBtn.classList.toggle('active', this.isShuffled);
    
    if (this.isShuffled) {
      this.shuffledIndices = [...Array(this.tracks.length).keys()];
      for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
      }
    }
  }

  toggleRepeat() {
    const modes = ['off', 'one', 'all'];
    this.repeatMode = modes[(modes.indexOf(this.repeatMode) + 1) % modes.length];
    if (this.repeatBtn) this.repeatBtn.className = `repeat-${this.repeatMode}`;
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  highlightCurrentTrack() {
    document.querySelectorAll('.song-card').forEach(card => {
      card.classList.toggle('playing', parseInt(card.dataset.index) === this.currentTrackIndex);
    });
  }

  handlePlayError(error) {
    console.error('Error playing audio:', error);
    this.showErrorMessage('Failed to play the track. Please try again.');
  }

  showErrorMessage(message) {
    // Implement a user-friendly way to show error messages
    console.error(message);
    // You can replace this with a more user-friendly notification system
    if (!this.isLoading) {
      alert(message);
    }
  }
}

// Instantiate the audio player when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => new AudioPlayer());