# Digicomic - A comic book player for the digital world.

A comic book reader and player for digital comics. Optimized for smartphones, but also usable on desktop.

This was a project for the Comic Center Kiel. 
For more information, please send an email to <info@holonative.de>.


## How to use

### Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
npm run build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

### Comic files
You will need to create a comics directory with a directory per comic and the corresponding subdirectories and files. The structure looks as follows: 
```
root /
    comics/
        [comic-name]/
            images/
                [panel1].png
                ...
            text/
                [text1].png
                ...
            video/
                [master-playlist].m3u8
                [fallback-video].mp4
                [name].vtt
                hls/
                    [1080p-playlist].m3u8
                    [1080p-0].ts
                    [1080p-1].ts
                    ...
        
```
- *images:* contains the squared panel images
- *text:* contains the optional text or speech bubble images with transparent background
- *video:* contains the optional video files; the player uses HLS, so you'll need to split your video in multiple .ts files and provide a m3u8-playlist. Moreover, it also contains an optional vtt file, which contains the timecodes for each panel for switching correctly between panels and video; the subtitle text is currently not used.
  - *hls:* contains the .ts files and subplaylists for different resolutions

### Comic Data
You will also need to create a correct comic data JSON file with the *create-comic-data.js* found in the *util-scripts* directory. That is going to generate a *comics.json* file with the following data structure:
```bash
{
  "created": String,
  "comics": [
    {
      "id": String,
      "name": String,
      "panelsCount": Number,
      "panels": [
        {
          "image": String,
          "text": String
        }
      ],
      "video": [
        {
          "name": String,
          "type": "application/x-mpegURL"
        },
        {
          "name": String,
          "type": "video/mp4"
        }
      ],
      "vtt": String,
      "effect": String,
      "credits": {
        "artist": String,
        "website": String
      }
    }
  ],
  "edited": String
}
```

## License
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program (see LICENSE file in root).
If not, see <https://www.gnu.org/licenses/>.

Copyright (C) 2021 holoNative GbR