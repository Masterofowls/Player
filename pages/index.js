import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "/player.js"; // Ensure player.js is in the public directory
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle Volume Control Change
  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  // Handle Progress Bar Change
  const handleProgressChange = (e) => {
    setProgress(e.target.value);
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Audio Player with Song List</title>
        <link rel="stylesheet" href="/styles.css" /> {/* Assuming styles.css is in public folder */}
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
              onChange={handleSearchChange}  // Add onChange handler for search
            />
          </div>
          <div id="search-results" style={{ display: 'none' }}></div>
          <div id="songs-list"></div>
        </div>

        <footer>
          <div id="player" className="player">
            <audio id="audio-player"></audio>
            <div className="track-info">
              <img id="album-art" src="/images/default-album.jpg" alt="Album Art" />
              <div className="track-text">
                <h2 id="track-title">Track Title</h2>
                <p>
                  <a id="artist-name" href="#" target="_self">Artist Name</a>
                </p>
              </div>
            </div>

            <div className="controls">
              <button id="shuffle-btn" className="control-btn" title="Shuffle">
                {/* Shuffle Button SVG */}
              </button>

              <button id="prev-btn" className="control-btn" title="Previous">
                {/* Previous Button SVG */}
              </button>

              <button id="playpausebtn" className="control-btn" title="Play/Pause">
                {/* Play/Pause SVG */}
              </button>

              <button id="next-btn" className="control-btn" title="Next">
                {/* Next Button SVG */}
              </button>

              <button id="repeat-btn" className="control-btn repeat-off" title="Repeat">
                {/* Repeat Button SVG */}
              </button>

              <div className="volume-control-container">
                {/* Volume Control */}
                <input 
                  id="volume-control" 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}  // Add controlled value for volume
                  onChange={handleVolumeChange}  // Add onChange handler for volume
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
              value={progress}  // Add controlled value for progress bar
              onChange={handleProgressChange}  // Add onChange handler for progress bar
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
