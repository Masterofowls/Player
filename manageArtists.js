const fs = require('fs').promises;
const path = require('path');

const songsFilePath = 'public/songs.json';
const artistsDir = 'public/artists';
const artistInfoFile = 'public/artistInfo.json';

// Функция для нормализации имён артистов
// Убираем пробелы, дефисы, подчёркивания, специальные символы, оставляем только буквы и цифры
const normalizeArtistName = (artist) => {
    return artist
        .normalize("NFD")                             // Нормализуем Unicode, чтобы убрать акценты и диакритические знаки
        .replace(/[\u0300-\u036f]/g, '')              // Убираем диакритические знаки после нормализации
        .replace(/[\s_\-%]+/g, '')                    // Убираем пробелы, подчеркивания, дефисы, %, и другие похожие символы
        .replace(/[^\w]/g, '')                        // Убираем все недопустимые символы (всё кроме букв и цифр)
        .toLowerCase();                               // Приводим к нижнему регистру для унификации
};

async function loadSongs() {
    try {
        const data = await fs.readFile(songsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading songs.json:', err);
        return [];
    }
}

async function loadArtistInfo() {
    try {
        const data = await fs.readFile(artistInfoFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading artistInfo.json:', err);
        return {};
    }
}

async function saveArtistInfo(artistInfo) {
    try {
        await fs.writeFile(artistInfoFile, JSON.stringify(artistInfo, null, 2));
    } catch (err) {
        console.error('Error writing artistInfo.json:', err);
    }
}

// Функция для генерации ссылки на страницу артиста с нормализацией URL
function createArtistLink(artist) {
    const normalizedArtistName = normalizeArtistName(artist);
    return `/artists/${normalizedArtistName}/${normalizedArtistName}.html`;
}

async function createArtistPage(artist, tracks, artistInfo) {
    // Нормализуем имя артиста для файлов и URL
    const mainArtistName = normalizeArtistName(artist.split('/')[0].trim());

    // Путь к директории артиста и файлу страницы
    const artistDir = path.join(artistsDir, mainArtistName); // Применяем нормализацию для имени папки
    const artistPagePath = path.join(artistDir, `${mainArtistName}.html`); // Применяем нормализацию для имени файла

    // Создание директории, если она ещё не существует
    await fs.mkdir(artistDir, { recursive: true });

    // Генерация HTML-содержимого для страницы артиста
    const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${artist} - Artist Page</title>
        <link rel="stylesheet" href="../../styles.css">
        <style>
            .artist-header {
                background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('${artistInfo.headerImage || '../../default-header.jpg'}');
                background-size: cover;
                background-position: center;
                color: white;
                padding: 100px 20px;
                text-align: center;
            }
            .artist-header h1 {
                font-size: 48px;
                margin-bottom: 20px;
            }
            .artist-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-top: 40px;
            }
            .artist-description {
                flex: 2;
                padding-right: 40px;
            }
            .artist-stats {
                flex: 1;
                background-color: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
            }
            .track-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 40px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="sidebar">
                <h2>Menu</h2>
                <ul>
                    <li><a href="/main.html">Home</a></li>
                    <li><a href="#">My Playlist</a></li>
                    <li><a href="#">Favorites</a></li>
                </ul>
            </div>
            <div class="main-content">
                <div class="artist-header">
                    <h1>${artist}</h1>
                    <p>${artistInfo.genre || 'Genre not specified'}</p>
                </div>
                <div class="artist-info">
                    <div class="artist-description">
                        <h2>About ${artist}</h2>
                        <p>${artistInfo.description || 'No description available.'}</p>
                    </div>
                    <div class="artist-stats">
                        <h3>Stats</h3>
                        <p>Followers: ${artistInfo.followers || 'N/A'}</p>
                        <p>Monthly Listeners: ${artistInfo.monthlyListeners || 'N/A'}</p>
                    </div>
                </div>
                <h2>Top Tracks</h2>
                <div id="track-list" class="track-list"></div>
            </div>
        </div>
        <footer></footer>
        <script>
            document.addEventListener("DOMContentLoaded", () => {
                const tracks = ${JSON.stringify(tracks)};
                const trackList = document.getElementById('track-list');

                tracks.forEach(track => {
                    const card = document.createElement('div');
                    card.className = 'song-card';
                    card.innerHTML = \`
                        <img src="\${track.albumArt || '../../default-album.jpg'}" alt="\${track.title}">
                        <div>
                            <h3>\${track.title}</h3>
                            <p>\${track.album || 'Single'}</p>
                        </div>
                    \`;
                    card.onclick = () => playTrack(track.src);
                    trackList.appendChild(card);
                });

                function playTrack(src) {
                    const audioPlayer = document.getElementById('audio-player');
                    audioPlayer.src = src;
                    audioPlayer.play().catch(error => console.error('Error playing audio:', error));
                    const track = tracks.find(t => t.src === src);
                    document.getElementById('track-title').textContent = track.title;
                    document.getElementById('album-art').src = track.albumArt || '../../default-album.jpg';
                }
            });
        </script>
    </body>
    </html>
    `;

    // Записываем сгенерированную страницу в файл
    await fs.writeFile(artistPagePath, content);
}

async function manageArtists() {
    const songs = await loadSongs();
    const artistInfo = await loadArtistInfo();
    const artists = new Set();

    songs.forEach(track => {
        artists.add(track.artist);
    });

    for (const artist of artists) {
        const tracks = songs.filter(track => track.artist === artist);

        // Используем информацию об артисте или дефолтную, если информация отсутствует
        if (!artistInfo[artist]) {
            console.log(`Using local info for ${artist}...`);
            artistInfo[artist] = {
                description: 'No description available.',
                genre: 'Unknown genre',
                followers: 'N/A',
                monthlyListeners: 'N/A',
                headerImage: '../default-header.jpg'
            };
        }

        // Создаём или обновляем страницу артиста
        await createArtistPage(artist, tracks, artistInfo[artist]);
        console.log(`Created/Updated page for artist: ${artist}`);
    }

    await saveArtistInfo(artistInfo);
}

// Запуск функции
manageArtists().catch(console.error);
