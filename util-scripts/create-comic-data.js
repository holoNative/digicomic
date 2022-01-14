/*
*
* Copyright (C) 2021 holoNative GbR
*
* @Author: Dennis Przytarski, holoNative
* @Email: dennis@holonative.de
*
* @License:
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.

* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.

* You should have received a copy of the GNU General Public License
* along with this program (see LICENSE file in root).
* If not, see https://www.gnu.org/licenses/.
*
* @Description:
* This script returns a comic data object to copy
*
* HOW TO USE (when in root):
*
* 1. Create a directory in public/comics
* 2. In there, create the directories images, text and video
* 3. Put the panel images into the images directory, the images with speech bubbles into the text directory
*    and optionally the video (mp4 + m3u8 playlist) in the video directory
*
* 4. Run one of the following commands and follow the steps to create you comic data
*
* node util-scripts/create-comic-data
*
* OR
*
* npm run create-comic-data
*
*/

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const root = path.join(__dirname, '../')
const comicsPath = path.join(root, 'public/comics/')
const imagesDir = '/images/'
const textDir = '/text/'
const videoDir = '/video/'
let videoDirPath = ''

let comic = {
  id: '',
  name: '',
  panelsCount: undefined,
  panels: [],
  video: '',
  effect: '',
  credits: {
    artist: '',
    website: ''
  }
}
go()

// main function
async function go() {
  let gotId = false
  let gotPanels = false
  let gotVideo = false
  let gotVtt = false
  let gotEffect = false

  console.log('Welcome! Please answer the following questions to create your comic data object.')
  comic.name = await getName()
  do {
    do {
      comic.id = await getId()
    } while (!gotId)

    do {
      comic.panels = await getPanelImages()
    } while (!gotPanels)

    comic.panelsCount = comic.panels.length
    comic.video = await getVideo()
  } while (!gotVideo)
  
  if (comic.video) {
    do {
      comic.vtt = await getVtt()
    } while (!gotVtt)
  }
  
  do {
    comic.effect = await getEffect()
  } while (!gotEffect)
  comic.credits.artist = await getArtist()
  comic.credits.website = await getWebsite()
  
  const outputPath = root + 'src/data/comics.json'
  const obj = await saveToDataObj()
  const json = JSON.stringify(obj)
  try {
    fs.writeFileSync(outputPath, json, 'utf8')
  } catch (e) {
    console.error('Couldn\'t create or edit comics.json: ', e)
    console.log('But you still can simply copy the data :)')
    process.exit(3)
  }
  console.log('Your comic data looks as follows: \r\n', comic)
  console.log('Successfully saved the new comic to comics.json!')
  process.exit(0)

  function getName() {
    return new Promise((resolve) => {
      rl.question('What\'s the name of the comic?\r\n', function (res) {
        resolve(res)
      })
    })
  }
  function getId() {
    return new Promise((resolve) => {
      rl.question('What\'s the name of the comic directory in public/comics?\r\n', function (res) {
        console.log(comicsPath + res)
        if (!fs.existsSync(path.join(comicsPath, res))) {
          console.warn('The requested directory doesn\'t exist in the public/comics directory: ' + res + '. Please try again.')
          resolve()
          return
        }
        if (!fs.existsSync(path.join(comicsPath, res, imagesDir))) {
          console.warn('The requested directory doesn\'t contain a directory called images: ' + res + '. Please try again.')
          resolve()
          return
        }
        gotId = true
        resolve(res)
      })
    })
  }
  function getArtist() {
    return new Promise((resolve) => {
      rl.question('What\'s the artist\'s name?\r\n', function (res) {
        resolve(res)
      })
    })
  }
  function getWebsite() {
    return new Promise((resolve) => {
      rl.question('What\'s the artist\'s website (format: www.***.**)?\r\n', function (res) {
        resolve(res)
      })
    })
  }
  function getVideo() {
    return new Promise((resolve) => {
      rl.question('Does the comic have a video version in public/' + comic.id + '/video?\r\n(y/n): ', function (res) {
        res.toLowerCase()
        switch (res) {
          case 'n':
            gotVideo = true
            resolve('')
            break
          case 'y': {
            videoDirPath = path.join(comicsPath, comic.id, videoDir)
            if (!fs.existsSync(videoDirPath)) {
              console.warn('The requested directory doesn\'t contain a directory called video: ' + comic.id + '. Please try again.')
              resolve()
              return
            }
            let vFiles = fs.readdirSync(videoDirPath)
            if (vFiles.length === 0) {
              console.warn('The video directory is empty. Please put a .mp4 video and a m3u8 playlist with corresponding ts files inside first.')
              resolve()
              return
            }
            vFiles = sortCorrectly(vFiles)
            const m3u8 = vFiles.find(file => file.indexOf('.m3u8') !== -1)
            if (!m3u8) {
              console.warn('The video directory doesn\'t contain a m3u8 playlist. Please put it inside with corresponding ts files.')
              resolve()
              return
            }
            const mp4 = vFiles.find(file => file.indexOf('.mp4') !== -1)
            if (!mp4) {
              console.warn('The video directory doesn\'t contain an mp4 file. Please put it inside first.')
              resolve()
              return
            }
            const video = [
              {
                name: m3u8,
                type: 'application/x-mpegURL'
              },
              {
                name: mp4,
                type: 'video/mp4'
              }
            ]
            gotVideo = true
            resolve(video)
            break
          }
          default:
            console.warn('Wrong input. Please use y for Yes and n for No.')
            resolve()
            break
        }
      })
    })
  }
  function getVtt() {
    return new Promise((resolve) => {
      rl.question(`Do you have a VTT file with timecodes for each panel to switch correctly between video and panels and is it inside public/${comic.id}/video/vtt?\r\n(y/n): `, function (res) {
        res.toLowerCase()
        switch (res) {
          case 'n':
            gotVtt = true
            resolve()
            break
          case 'y': {
            const vttFile = fs.readdirSync(videoDirPath).find(file => file.indexOf('.m3u8') !== -1)
            if (!vttFile) {
              console.warn('The video directory doesn\'t contain a vtt file. Please put it inside first.')
              resolve()
              return
            }
            gotVtt = true
            resolve(vttFile)
            break
          }
        }
      })
    })
  }
  function getEffect() {
    return new Promise((resolve) => {
      rl.question('As transition between slides, do you want a fade or slide effect?\r\n(fade/slide): ', function (res) {
        res.toLowerCase()
        if (res === 'fade' || res === 'slide') {
          gotEffect = true
          resolve(res)
        } else {
          console.warn('Wrong input. Please chose fade or slide.')
          resolve()
        }
      })
    })
  }
  function getPanelImages() {
    return new Promise((resolve) => {
      const imagesPath = path.join(comicsPath, comic.id, imagesDir)
      let panels = sortCorrectly(fs.readdirSync(imagesPath))
      panels = panels.map((panel) => {
        return {
          image: panel,
          text: ''
        }
      })
      
      rl.question('Does the comic have text images in public/' + comic.id + '/text?\r\n(y/n): ', function (res) {
        res.toLowerCase()
        switch (res) {
          case 'n':
            gotPanels = true
            resolve(panels)
            break
          case 'y': {
            const textPath = path.join(comicsPath, comic.id, textDir)

            if (!fs.existsSync(textPath)) {
              console.warn('The comic directory doesn\'t contain a directory called text. Please try again.')
              process.exit()
            }

            const textFiles = fs.readdirSync(textPath)
            
            for (let i = 0; i < textFiles.length; i++) {
              const textNum = textFiles[i].match(/\d+/)[0]
              if (!textNum) {
                console.error('Process terminated, because the following text image name contains no number: ', textFiles[i])
                process.exit()
              }
              for (const panel of panels) {
                const imageNum = panel.image.match(/\d+/)[0]
                if (!imageNum) {
                  console.error('Process terminated, because the following image name contains no number: ', panel.image)
                  process.exit(2)
                }
                if (imageNum === textNum) {
                  panel.text = textFiles[i]
                  break
                }
              }
            }
            gotPanels = true
            resolve(panels)
            break
          }
          default:
            console.warn('Wrong input. Please use y for Yes and n for No.')
            resolve()
            break
        }
      })
    })
  }

  function saveToDataObj() {
    return new Promise((resolve) => {
      let obj = {}
      if (fs.existsSync(outputPath)) {
        fs.readFile(outputPath, 'utf8', (err, data) => {
          if (err) {
            console.error('Couldn\'t read file comics.json: ', err)
            process.exit()
          }
          let obj = JSON.parse(data)
          obj.comics.push(comic)
          obj.edited = new Date()
          resolve(obj)
        })
      } else {
        obj.created = new Date()
        obj.comics = []
        obj.comics.push(comic)
        resolve(obj)
      }
    })
  }
}

// util funcs
function sortCorrectly(array) {
  let collator = new Intl.Collator([], { numeric: true })
  return array.sort((a, b) => collator.compare(a, b))
}
