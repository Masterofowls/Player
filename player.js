document.addEventListener("DOMContentLoaded", function() {
  let currentTrackIndex = 0;
  let tracks = [];

  // Load tracks from songs.json
  fetch('songs.json')
    .then(response => response.json())
    .then(data => {
      tracks = data;
      loadTrack(currentTrackIndex); // Load the first track
      displaySongs(data);           // Display all songs on the page
    })
    .catch(error => console.error('Error loading songs.json:', error));

  // Load the current track into the player and autoplay
  function loadTrack(index) {
    const track = tracks[index];
    const audioPlayer = document.getElementById('audio-player');
    const trackTitle = document.getElementById('track-title');
    const artistName = document.getElementById('artist-name');

    if (audioPlayer && track) {
      // Set audio source and metadata
      audioPlayer.src = track.src;
      trackTitle.textContent = track.title;
      artistName.textContent = track.artist;

      // Autoplay the song
      audioPlayer.play();
      document.getElementById('play-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
    }
  }

  // Move to the previous track
  window.prevTrack = function() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
  };

  // Move to the next track
  window.nextTrack = function() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
  };

  // Display all songs as smaller containers with icons and text
  function displaySongs(tracks) {
    const songsList = document.getElementById('songs-list');
    if (songsList) {
      songsList.innerHTML = ''; // Clear existing songs

      tracks.forEach((track, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';

        // Song image
        const img = document.createElement('img');
        img.src = track.albumArt || 'default-album.jpg';
        img.alt = track.title;

        // Song text container
        const textContainer = document.createElement('div');
        const title = document.createElement('h2');
        title.textContent = track.title;

        const artist = document.createElement('p');
        artist.textContent = track.artist;

        textContainer.appendChild(title);
        textContainer.appendChild(artist);

        // Add image and text container to song card
        songCard.appendChild(img);
        songCard.appendChild(textContainer);

        // Add click event to play the selected song
        songCard.onclick = () => {
          currentTrackIndex = index;
          loadTrack(currentTrackIndex);
        };

        songsList.appendChild(songCard);
      });
    }
  }

  // Search function for the search bar
  function searchTrack() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filteredTracks = tracks.filter(track =>
      track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query)
    );
  
    // Re-display the filtered songs
    displaySongs(filteredTracks);
  }

  // Event listeners for play/pause, volume, and progress
  const audioPlayer = document.getElementById('audio-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeEl = document.getElementById('current-time');
  const durationTimeEl = document.getElementById('duration-time');
  const volumeSlider = document.getElementById('volume-slider');

  // Play/Pause functionality
  if (playPauseBtn && audioPlayer) {
    playPauseBtn.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });
  }

  // Previous track button
  if (prevBtn) {
    prevBtn.addEventListener('click', prevTrack);
  }

  // Next track button
  if (nextBtn) {
    nextBtn.addEventListener('click', nextTrack);
  }

  // Update progress bar as the audio plays
  if (audioPlayer) {
    audioPlayer.addEventListener('loadedmetadata', () => {
      const duration = audioPlayer.duration;
      if (!isNaN(duration)) {
        durationTimeEl.textContent = formatTime(duration);
      }
    });

    audioPlayer.addEventListener('timeupdate', () => {
      const currentTime = audioPlayer.currentTime;
      const duration = audioPlayer.duration;

      if (!isNaN(duration)) {
        progressBar.value = (currentTime / duration) * 100 || 0;
        currentTimeEl.textContent = formatTime(currentTime);
      }
    });
  }

  // Change audio progress when user interacts with progress bar
  if (progressBar && audioPlayer) {
    progressBar.addEventListener('input', () => {
      const duration = audioPlayer.duration;
      audioPlayer.currentTime = (progressBar.value / 100) * duration;
    });
  }

  // Volume control
  if (volumeSlider && audioPlayer) {
    volumeSlider.addEventListener('input', () => {
      audioPlayer.volume = volumeSlider.value / 100;
    });
  }

  // Format time into mm:ss
  function formatTime(time) {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
});
