import React, {
  useEffect,
  useState,
} from 'react';

import Head from 'next/head';

// Функция для преобразования имени артиста в формат URL
const formatArtistNameForUrl = (name) => {
  if (!name) {
    return ''; // Возвращаем пустую строку, если имя артиста отсутствует
  }
  return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/gi, ''); // Убираем пробелы и лишние символы
};

const Home = () => {
  const [tracks, setTracks] = useState([]); // State to hold the list of tracks
  const [shuffledTracks, setShuffledTracks] = useState([]); // State to hold shuffled tracks
  const [currentTrack, setCurrentTrack] = useState(null); // State to hold the current track object
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // State to hold the current track index
  const [searchTerm, setSearchTerm] = useState('');
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Control play/pause state
  const [isShuffled, setIsShuffled] = useState(false); // State for shuffle mode
  const [audioPlayer, setAudioPlayer] = useState(null);

  // Fetch tracks from songs.json
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/songs.json');
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        setTracks(data); // Set the list of tracks in state
        setCurrentTrack(data[0]); // Set the first track as current track initially
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    };
    fetchTracks();
  }, []);

  // Initialize the AudioPlayer after the page loads
  useEffect(() => {
    const audio = document.getElementById('audio-player');
    setAudioPlayer(audio); // Set audio player in state

    if (audio) {
      // Update progress bar as the track plays
      audio.addEventListener('timeupdate', () => {
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
        document.getElementById('current-time').textContent = formatTime(audio.currentTime);
        document.getElementById('duration-time').textContent = formatTime(audio.duration);
      });

      // Update when a track ends (automatically play the next one)
      audio.addEventListener('ended', () => {
        nextTrack();
      });

      // Load track metadata for duration
      audio.addEventListener('loadedmetadata', () => {
        document.getElementById('duration-time').textContent = formatTime(audio.duration);
      });
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('loadedmetadata', () => {});
      }
    };
  }, [audioPlayer, currentTrack]);

  // Форматирование времени в минуты:секунды
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle volume control change
  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
    if (audioPlayer) {
      audioPlayer.volume = e.target.value / 100;
    }
  };

  // Handle progress bar change
  const handleProgressChange = (e) => {
    setProgress(e.target.value);
    if (audioPlayer) {
      audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
    }
  };

  // Shuffle logic
  const shuffleArray = (array) => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  // Toggle shuffle mode
  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffled = shuffleArray(tracks);
      setShuffledTracks(shuffled);
    }
    setIsShuffled(!isShuffled); // Тоггл перемешивания
  };

  // Load a specific track by index
  const loadTrack = (index) => {
    const trackList = isShuffled ? shuffledTracks : tracks;
    const track = trackList[index];
    if (!track || !audioPlayer) return;

    setCurrentTrack(track); // Update the current track object
    setCurrentTrackIndex(index);
    audioPlayer.src = track.src;
    audioPlayer.play();
    setIsPlaying(true);
  };

  // Next track logic
  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % (isShuffled ? shuffledTracks.length : tracks.length);
    loadTrack(nextIndex);
  };

  // Previous track logic
  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + (isShuffled ? shuffledTracks.length : tracks.length)) % (isShuffled ? shuffledTracks.length : tracks.length);
    loadTrack(prevIndex);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
        setIsPlaying(false);
      } else {
        audioPlayer.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />
          <link rel="apple-touch-icon" href="/images/icon192.jpg" />
        <title>Audio Player with Song List</title>
      </Head>

      <div className="container">
        <div className="sidebar">
          <h2>Menu</h2>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">My Playlist</a></li>
            <li><a href="#">Favorites</a></li>
          </ul>
        </div>

        <div className="main-content">
          <div className="searchbar">
            <input 
              type="text" 
              id="search-input" 
              placeholder="Search for tracks..." 
              value={searchTerm} 
              onChange={handleSearchChange} 
            />
          </div>

          <div id="songs-list">
            {tracks
              .filter((track) =>
                track.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                track.artist?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((track, index) => (
                <div key={index} className="song-card" onClick={() => loadTrack(index)}>
                  <img src={track.albumArt || "/images/default-album.jpg"} alt="Album Art" />
                  <div className="song-info">
                    <h3>{track.title}</h3>
                    <p>
                      <a 
                        href={`artists/${formatArtistNameForUrl(track.artist)}/${formatArtistNameForUrl(track.artist)}.html`} 
                        target="_self">
                        {track.artist || 'Unknown Artist'}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <footer>
          <div id="player" className="player">
            <audio id="audio-player"></audio>
            <div className="track-info">
              <img id="album-art" src={currentTrack?.albumArt || "/images/default-album.jpg"} alt="Album Art" />
              <div className="track-text">
                <h2 id="track-title">{currentTrack?.title || 'Track Title'}</h2>
                <p>
                  <a id="artist-name" href={`artists/${formatArtistNameForUrl(currentTrack?.artist)}/${formatArtistNameForUrl(currentTrack?.artist)}.html`} target="_self">
                    {currentTrack?.artist || 'Artist Name'}
                  </a>
                </p>
              </div>
            </div>

            <div className="controls">
              <button id="prev-btn" className="control-btn" title="Previous" onClick={prevTrack}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 19 2 12 11 5 11 19"></polygon>
                  <polygon points="22 19 13 12 22 5 22 19"></polygon>
                </svg>
              </button>

              <button id="playpausebtn" className="control-btn" title="Play/Pause" onClick={togglePlayPause}>
                {isPlaying ? (
                  <svg className="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg className="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <button id="next-btn" className="control-btn" title="Next" onClick={nextTrack}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 19 22 12 13 5 13 19"></polygon>
                  <polygon points="2 19 11 12 2 5 2 19"></polygon>
                </svg>
              </button>

              {/* Shuffle Button */}
              <button id="shuffle-btn" className={`control-btn ${isShuffled ? 'active' : ''}`} title="Shuffle" onClick={toggleShuffle}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
              </button>

              <div className="volume-control-container">
                <input 
                  id="volume-control" 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={handleVolumeChange} 
                  step="1" 
                />
              </div>
            </div>
          </div>

          <div className="progress-container">
            <span id="current-time">0:00</span>
            <input 
              type="range" 
              className="progress-bar" 
              value={progress} 
              onChange={handleProgressChange} 
              min="0" 
              max="100" 
            />
            <span id="duration-time">0:00</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
