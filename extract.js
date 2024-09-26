const fs = require('fs');
const path = require('path');
const jsmediatags = require('jsmediatags');

// Directory containing MP3 files
const mediaDir = 'public/media';
const jsonFilePath = 'public/songs.json';

// Read existing songs from songs.json if it exists
let existingSongs = [];
if (fs.existsSync(jsonFilePath)) {
  existingSongs = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
}

// Read the list of MP3 files from the /media folder
fs.readdir(mediaDir, (err, files) => {
  if (err) {
    return console.error('Error reading media directory:', err);
  }

  const songs = [];
  const mp3Files = files.filter(file => path.extname(file) === '.mp3');

  mp3Files.forEach((file, index) => {
    const filePath = path.join(mediaDir, file);

    // Check if the file already exists in existingSongs to avoid duplicates
    if (!existingSongs.some(song => song.src === filePath)) {
      // Extract metadata using jsmediatags
      jsmediatags.read(filePath, {
        onSuccess: function(tag) {
          const tags = tag.tags;

          // Base64 encode album art if available
          let albumArt = null;
          if (tags.picture) {
            const base64String = Buffer.from(tags.picture.data).toString('base64');
            albumArt = `data:${tags.picture.format};base64,${base64String}`;
          }

          const trackData = {
            title: tags.title || `Track ${existingSongs.length + index + 1}`,
            artist: tags.artist || 'Unknown Artist',
            src: filePath,
            albumArt: albumArt
          };

          songs.push(trackData);

          // After processing all files, write to songs.json
          if (songs.length + existingSongs.length === mp3Files.length) {
            const allSongs = existingSongs.concat(songs);
            fs.writeFile(jsonFilePath, JSON.stringify(allSongs, null, 2), (err) => {
              if (err) {
                return console.error('Error writing to songs.json:', err);
              }
              console.log('songs.json has been updated with metadata.');
            });
          }
        },
        onError: function(error) {
          console.error('Error extracting metadata from file:', file, error);
        }
      });
    }
  });
});
