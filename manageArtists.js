const fs = require('fs');
const path = require('path');

const songsFilePath = './songs.json';
const artistsDir = './artists';

function loadSongs() {
    try {
        const data = fs.readFileSync(songsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading songs.json:', err);
        return [];
    }
}

function createArtistPage(artist) {
    const artistPagePath = path.join(artistsDir, `${artist}.html`);
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${artist}</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <h2>Menu</h2>
            <ul>
                <li><a href="../index.html">Home</a></li>
                <li><a href="#">My Playlist</a></li>
                <li><a href="#">Favorites</a></li>
            </ul>
        </div>
        <div class="main-content">
            <h1>${artist}</h1>
            <h2>Description:</h2>
            <p id="artist-description">[Description will be added here]</p>
            <h2>Tracks:</h2>
            <div id="track-list" class="songs-list"></div>
        </div>
    </div>
    <footer>
        <div id="player" class="player">
            <audio id="audio-player"></audio>
            <div class="track-info">
                <img id="album-art" src="default-album.jpg" alt="Album Art">
                <h2 id="track-title">Track Title</h2>
                <p>
                    <a id="artist-name" href="#" target="_self">${artist}</a>
                </p>
            </div>
            <div class="controls">
                <button id="prev-btn">⏮</button>
                <button id="playpausebtn">▶</button>
                <button id="next-btn">⏭</button>
            </div>
        </div>
        <div class="progress-container">
            <span id="current-time">0:00</span> / <span id="duration-time">3:30</span>
            <input type="range" class="progress-bar" value="50" />
        </div>
    </footer>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const tracks = ${JSON.stringify(findTracksByArtist(artist))};
            const trackList = document.getElementById('track-list');

            tracks.forEach(track => {
                const card = document.createElement('div');
                card.className = 'song-card';
                card.innerHTML = \`
                    <img src="\${track.albumArt || 'default-album.jpg'}" alt="\${track.title}">
                    <div>
                        <h3>\${track.title}</h3>
                        <p>\${track.artist}</p>
                    </div>
                \`;
                card.onclick = () => playTrack(track.src);
                trackList.appendChild(card);
            });

            function playTrack(src) {
                const audioPlayer = document.getElementById('audio-player');
                audioPlayer.src = src;
                audioPlayer.play().catch(error => console.error('Error playing audio:', error));
                document.getElementById('track-title').textContent = tracks.find(t => t.src === src).title;
                document.getElementById('album-art').src = tracks.find(t => t.src === src).albumArt || 'default-album.jpg';
            }
        });
    </script>
</body>
</html>
`;
    fs.writeFileSync(artistPagePath, content);
}

function findTracksByArtist(artist) {
    const songs = loadSongs();
    return songs.filter(track => track.artist === artist);
}

function manageArtists() {
    const songs = loadSongs();
    const artists = new Set();

    songs.forEach(track => {
        artists.add(track.artist);
    });

    artists.forEach(artist => {
        const artistPagePath = path.join(artistsDir, `${artist}.html`);
        if (!fs.existsSync(artistPagePath)) {
            createArtistPage(artist);
            console.log(`Created page for artist: ${artist}`);
        }
    });
}

manageArtists();
