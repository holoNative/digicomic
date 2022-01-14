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
* [DEPRECATED]
* WARNING: this script is not needed anymore,
*   because the create-comic-data.js script stores
*   the original file names in the comics.json file
*
* This script renames all files in a directory numerically
* starting with 1 and keeping the file extension
*
* HOW TO USE:
*
* node rename-files [directory path from util-scripts]
*
* OR
*
* npm run rename-files [directory path from root]
*
*/

const fs = require('fs')
const path = require('path')
const { exit } = require('process')
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const args = process.argv.slice(2)
const fDir = args[0]

if (!fs.existsSync(fDir)) {
  console.error('The requested folder doesn\'t exist: ', fDir)
  process.exit(0)
}
confirmDir(fDir)

function confirmDir(dir) {
  rl.question('Do you really want to rename all files in the directory ' + dir + '? (y/n): ', function (res) {
    res.toLowerCase()
    switch (res) {
      case 'n':
        console.log('Alrighty, see you next time!')
        process.exit(0)
      case 'y':
        renameFilesInDir(dir)
        break
      default:
        console.warn('Wrong input. Please use y for Yes and n for No.')
        confirmDir(dir)
        break
    }
  })
}

function renameFilesInDir(dir) {
  let fileNames = fs.readdirSync(dir)
  let collator = new Intl.Collator([], { numeric: true })
  fileNames.sort((a, b) => collator.compare(a, b))
  for (let i = 0; i < fileNames.length; i++) {
    if (dir.substr(dir.length - 1) !== '/') dir += '/'
    
    const ext = path.parse(fileNames[i]).ext
    const oldName = dir + fileNames[i]
    const newName = dir + (i + 1).toString() + ext

    if (oldName === newName) {
      console.log('File ' + fileNames[i] + ' already has the correct name.')
      if (i === fileNames.length - 1) exit(0)
      else continue
    }
    
    fs.rename(oldName, newName, (err) => {
      if (err) {
        console.error('Error while renaming:', err)
      } else {
        console.log(fileNames[i] + ' successfully renamed to ' + (i + 1).toString() + ext)
      }

      if (i === fileNames.length - 1) {
        console.log('All files successfully renamed! Bye! :)')
        exit(0)
      }
    })
  }
}
