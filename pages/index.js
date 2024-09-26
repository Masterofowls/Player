import React, { useState, useEffect } from 'react';
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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // State to hold the current track index
  const [searchTerm, setSearchTerm] = useState('');
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Control play/pause state
  const [audioPlayer, setAudioPlayer] = useState(null);

  // Fetch tracks from songs.json
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/songs.json');
        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        setTracks(data); // Set the list of tracks in state
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
      });

      // Update when a track ends (automatically play the next one)
      audio.addEventListener('ended', () => {
        loadTrack((currentTrackIndex + 1) % tracks.length);
      });
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
      }
    };
  }, [audioPlayer, currentTrackIndex, tracks]);

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

  // Load a specific track by index
  const loadTrack = (index) => {
    const track = tracks[index];
    if (!track || !audioPlayer) return;

    setCurrentTrackIndex(index);
    audioPlayer.src = track.src;
    audioPlayer.play();
    setIsPlaying(true);
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
              <img id="album-art" src={tracks[currentTrackIndex]?.albumArt || "/images/default-album.jpg"} alt="Album Art" />
              <div className="track-text">
                <h2 id="track-title">{tracks[currentTrackIndex]?.title || 'Track Title'}</h2>
                <p>
                  <a id="artist-name" href={`artists/${formatArtistNameForUrl(tracks[currentTrackIndex]?.artist)}/${formatArtistNameForUrl(tracks[currentTrackIndex]?.artist)}.html`} target="_self">
                    {tracks[currentTrackIndex]?.artist || 'Artist Name'}
                  </a>
                </p>
              </div>
            </div>

            <div className="controls">
              <button id="prev-btn" className="control-btn" title="Previous" onClick={() => loadTrack((currentTrackIndex - 1 + tracks.length) % tracks.length)}>
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

              <button id="next-btn" className="control-btn" title="Next" onClick={() => loadTrack((currentTrackIndex + 1) % tracks.length)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 19 22 12 13 5 13 19"></polygon>
    <polygon points="2 19 11 12 2 5 2 19"></polygon>
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
