/*
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
* This is the comic panel, which consists of the actual panel image
* and the text / speech bubbles as separate images, so the latter
* could be turned on and off when needed.
*/

<template>
  <div class="panel">
    <!-- actual panel image without text -->
    <q-img
      :src="panelSource"
      spinner-color="white"
      loading="eager"
      width="100%"
      height="100%"
      :ratio="1"
    >
      <!-- text / speech bubble image with transparent background -->
      <!-- it gets hidden when no text image provided -->
      <img
        v-if="textVisible && textSource"
        :ref="`text-${panel}`"
        :src="textSource"
        class="panel-text-image"
        onerror="this.style.display='none'"
      >
    </q-img>
  </div>
</template>

<script>
export default {
  name: 'ComicPanel',
  props: {
    // current panel number
    panel: {
      type: Number,
      required: true
    },
    // comic object
    comic: {
      type: Object,
      required: true
    },
    // always true right now, but could be turned on and off
    // by button in the future, when sound gets added to panels
    textVisible: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    panelSource() {
      return `${process.env.COMICS_DIR + this.comic.id}/images/${this.comic.panels[this.panel - 1].image}`
    },
    // text image must be png with transparent background, but can also be left out when not needed
    textSource() {
      if (!this.comic.panels[this.panel - 1].text) return
      return `${process.env.COMICS_DIR + this.comic.id}/text/${this.comic.panels[this.panel - 1].text}`
    }
  }
}
</script>

<style scoped>
.panel {
  width: 100%;
  height: 100%;
}
.panel-text-image {
  position: absolute;
  top: 0;
  left: 0;
  vertical-align: bottom;
  width:100%;
  height:100%
}
</style>
