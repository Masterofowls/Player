class AudioPlayer {
  constructor() {
    this.currentTrackIndex = 0;
    this.tracks = [];
    this.allTracks = [];
    this.searchResults = [];
    this.isShuffled = false;
    this.shuffledIndices = [];
    this.repeatMode = 'off'; // 'off', 'one', 'all'
    this.isLoading = true;
    this.isLoadingTrack = false;
    this.debounceTimer = null;
    
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
    this.mainSongsList = document.getElementById('songs-list');
    this.searchResultsList = document.getElementById('search-results');
    this.searchInput = document.getElementById('search-input');

    this.init();
  }

  async init() {
    try {
      await this.loadTracks();
      this.setupEventListeners();
      if (this.tracks.length > 0) {
        await this.loadTrack(0);
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
      this.allTracks = await response.json();
      this.tracks = [...this.allTracks];
      this.displaySongs(this.tracks);
      console.log('Tracks loaded:', this.tracks.length);
    } catch (error) {
      console.error('Error loading songs.json:', error);
      throw error;
    }
  }

  setupEventListeners() {
    this.playPauseButton.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.prevTrack());
    this.nextBtn.addEventListener('click', () => this.nextTrack());
    this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

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

    this.searchInput.addEventListener('input', () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.handleSearch(), 300);
    });
    console.log('Event listeners set up');
  }

  async loadTrack(index) {
    if (index < 0 || index >= this.tracks.length) {
      console.error('Invalid track index');
      return;
    }

    this.isLoadingTrack = true;
    const track = this.tracks[index];
    
    // Остановить текущее воспроизведение перед загрузкой нового трека
    if (!this.audioPlayer.paused) {
      await this.audioPlayer.pause();
    }

    this.audioPlayer.src = track.src;
    this.trackTitle.textContent = track.title;
    this.artistName.textContent = track.artist;
    this.artistName.href = `artists/${track.artist}.html`;
    
    // Предзагрузка изображения обложки
    const img = new Image();
    img.onload = () => {
      this.albumArt.src = img.src;
    };
    img.onerror = () => {
      this.albumArt.src = 'default-album-art.jpg';
    };
    img.src = track.albumArt || 'default-album-art.jpg';

    this.currentTrackIndex = index;
    this.updatePlayPauseButton(false);
    this.highlightCurrentTrack();

    try {
      await this.audioPlayer.load();
      console.log('Track loaded:', track.title);
      this.isLoadingTrack = false;
    } catch (error) {
      console.error('Error loading track:', error);
      this.showErrorMessage('Failed to load the track. Please try again.');
      this.isLoadingTrack = false;
    }
  }

  updatePlayPauseButton(isPlaying) {
    const playIcon = this.playPauseButton.querySelector('.play-icon');
    const pauseIcon = this.playPauseButton.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
      playIcon.style.display = isPlaying ? 'none' : 'block';
      pauseIcon.style.display = isPlaying ? 'block' : 'none';
    } else {
      this.playPauseButton.textContent = isPlaying ? 'Pause' : 'Play';
    }
  }

  async togglePlay() {
    if (this.isLoadingTrack) {
      console.log('Track is still loading, please wait.');
      return;
    }

    try {
      if (this.audioPlayer.paused) {
        await this.audioPlayer.play();
      } else {
        await this.audioPlayer.pause();
      }
      this.updatePlayPauseButton(!this.audioPlayer.paused);
    } catch (error) {
      this.handlePlayError(error);
    }
  }

  async prevTrack() {
    let newIndex;
    if (this.isShuffled) {
      const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrackIndex);
      newIndex = this.shuffledIndices[(currentShuffleIndex - 1 + this.tracks.length) % this.tracks.length];
    } else {
      newIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    }
    await this.loadTrack(newIndex);
    this.audioPlayer.play().catch(this.handlePlayError.bind(this));
  }

  async nextTrack() {
    let newIndex;
    if (this.isShuffled) {
      const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentTrackIndex);
      newIndex = this.shuffledIndices[(currentShuffleIndex + 1) % this.tracks.length];
    } else {
      newIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    }
    await this.loadTrack(newIndex);
    this.audioPlayer.play().catch(this.handlePlayError.bind(this));
  }

  updateProgress() {
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration;

    if (!isNaN(duration)) {
      this.progressBar.value = (currentTime / duration) * 100 || 0;
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }
  }

  async handleTrackEnd() {
    if (this.repeatMode === 'one') {
      this.audioPlayer.currentTime = 0;
      await this.audioPlayer.play().catch(this.handlePlayError.bind(this));
    } else if (this.repeatMode === 'all' || this.isShuffled) {
      await this.nextTrack();
    } else if (this.currentTrackIndex < this.tracks.length - 1) {
      await this.nextTrack();
    } else {
      this.updatePlayPauseButton(false);
    }
  }

  toggleShuffle() {
    this.isShuffled = !this.isShuffled;
    this.shuffleBtn.classList.toggle('active', this.isShuffled);
    
    if (this.isShuffled) {
      this.shuffledIndices = [...Array(this.tracks.length).keys()];
      for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
      }
    }
    console.log('Shuffle toggled:', this.isShuffled);
  }

  toggleRepeat() {
    const modes = ['off', 'one', 'all'];
    this.repeatMode = modes[(modes.indexOf(this.repeatMode) + 1) % modes.length];
    this.repeatBtn.className = `repeat-${this.repeatMode}`;
    console.log('Repeat mode:', this.repeatMode);
  }

  handleSearch() {
    console.log('handleSearch called');
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    console.log('Search term:', searchTerm);

    if (searchTerm === '') {
      this.searchResults = [];
      this.hideSearchResults();
    } else {
      this.searchResults = this.allTracks.filter(track => 
        track.title.toLowerCase().includes(searchTerm) ||
        track.artist.toLowerCase().includes(searchTerm)
      );
      console.log('Search results:', this.searchResults);
      this.displaySearchResults();
    }
  }

  displaySearchResults() {
    console.log('displaySearchResults called');
    this.searchResultsList.innerHTML = '';
    this.searchResultsList.style.display = 'block';
    this.mainSongsList.style.display = 'none';

    if (this.searchResults.length === 0) {
      this.searchResultsList.innerHTML = '<p>No tracks found</p>';
      return;
    }

    this.searchResults.forEach((track, index) => {
      const songCard = document.createElement('div');
      songCard.className = 'song-card';
      songCard.dataset.index = index;

      songCard.innerHTML = `
        <img src="${track.albumArt || 'default-album-art.jpg'}" alt="${track.title}">
        <div class="song-info">
          <h3>${track.title}</h3>
          <p>${track.artist}</p>
        </div>
      `;

      songCard.addEventListener('click', () => {
        this.loadTrackFromSearch(index);
      });

      this.searchResultsList.appendChild(songCard);
    });
    console.log('Search results displayed:', this.searchResults.length);
  }

  hideSearchResults() {
    console.log('hideSearchResults called');
    this.searchResultsList.style.display = 'none';
    this.mainSongsList.style.display = 'block';
  }

  async loadTrackFromSearch(index) {
    console.log('loadTrackFromSearch called with index:', index);
    if (index < 0 || index >= this.searchResults.length) {
      console.error('Invalid search result index');
      return;
    }

    const track = this.searchResults[index];
    const mainIndex = this.tracks.findIndex(t => t.src === track.src);

    if (mainIndex !== -1) {
      this.currentTrackIndex = mainIndex;
    } else {
      this.tracks.push(track);
      this.currentTrackIndex = this.tracks.length - 1;
    }

    await this.loadTrack(this.currentTrackIndex);
    this.audioPlayer.play().catch(this.handlePlayError.bind(this));
    this.hideSearchResults();
    this.searchInput.value = '';
  }

  displaySongs(tracks) {
    this.mainSongsList.innerHTML = '';

    tracks.forEach((track, index) => {
      const songCard = document.createElement('div');
      songCard.className = 'song-card';
      songCard.dataset.index = index;

      songCard.innerHTML = `
        <img src="${track.albumArt || 'default-album-art.jpg'}" alt="${track.title}">
        <div class="song-info">
          <h3>${track.title}</h3>
          <p>${track.artist}</p>
        </div>
      `;

      songCard.addEventListener('click', () => {
        this.loadTrack(index).then(() => {
          this.audioPlayer.play().catch(this.handlePlayError.bind(this));
        });
      });

      this.mainSongsList.appendChild(songCard);
    });

    this.highlightCurrentTrack();
  }

  highlightCurrentTrack() {
    const allCards = this.mainSongsList.querySelectorAll('.song-card');
    allCards.forEach(card => card.classList.remove('playing'));
    const currentCard = this.mainSongsList.querySelector(`.song-card[data-index="${this.currentTrackIndex}"]`);
    if (currentCard) {
      currentCard.classList.add('playing');
      currentCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  handlePlayError(error) {
    console.error('Error playing audio:', error);
    if (error.name === 'AbortError') {
      console.log('Playback was aborted. This is normal when changing tracks quickly.');
    } else {
      this.showErrorMessage('Failed to play the track. Please try again.');
    }
  }

  showErrorMessage(message) {
    console.error(message);
    if (!this.isLoading) {
      alert(message);
    }
  }
}

// Добавьте обработчик ошибок для незагруженных изображений
document.addEventListener('error', function(e) {
  if (e.target.tagName.toLowerCase() === 'img') {
    e.target.src = 'default-album-art.jpg';
  }
}, true);


// Instantiate the audio player when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const player = new AudioPlayer();
  console.log('AudioPlayer instance created');
});