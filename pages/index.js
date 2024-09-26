import React, { useEffect } from 'react';
import Head from 'next/head';

const Home = () => {
  useEffect(() => {
    // Initialize your AudioPlayer class after the page loads
    const script = document.createElement('script');
    script.src = "/player.js"; // Make sure player.js is in your public directory
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup script on component unmount
    };
  }, []);

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
            <input type="text" id="search-input" placeholder="Search for tracks..." />
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
              </button>

              <button id="prev-btn" className="control-btn" title="Previous">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 19 2 12 11 5 11 19"></polygon>
                  <polygon points="22 19 13 12 22 5 22 19"></polygon>
                </svg>
              </button>

              <button id="playpausebtn" className="control-btn" title="Play/Pause">
                <svg className="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg className="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'none' }}>
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </button>

              <button id="next-btn" className="control-btn" title="Next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 19 22 12 13 5 13 19"></polygon>
                  <polygon points="2 19 11 12 2 5 2 19"></polygon>
                </svg>
              </button>

              <button id="repeat-btn" className="control-btn repeat-off" title="Repeat">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
              </button>

              <div className="volume-control-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
                <input id="volume-control" type="range" min="0" max="100" value="50" step="1" />
              </div>
            </div>
          </div>

          <div className="progress-container">
            <span id="current-time">0:00</span>
            <input type="range" className="progress-bar" value="0" min="0" max="100" />
            <span id="duration-time">0:00</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
