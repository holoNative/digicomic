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
* This is the credits panel.
* It's always the last panel after the comic panels.
* It contains the comic title, artist infos and buttons
* for writing an email and going back to comic overview.
*/

<template>
  <div class="credits-panel">
    <!-- comic title -->
    <p :style="`font-size: ${titleSize}; margin-top: 2%; font-weight: 900`">
      {{ comic.name }}
    </p>
    
    <p :style="`font-size: ${labelSize}`" class="margin-start-big">
      Gezeichnet von
    </p>
    <!-- artist name -->
    <p
      :style="`font-size: ${textSize}; margin-top: 1%; font-weight: 600`"
      class="margin-start-small"
    >
      {{ comic.credits.artist }}
    </p>
    <!-- artist website -->
    <p
      :style="`font-size: ${smallSize}; margin-top: 2%`"
      class="margin-start-small"
    >
      <a :href="`https://${comic.credits.website}`" target="_blank">
        {{ comic.credits.website }}
      </a>
    </p>
    <div class="row justify-center margin-start-big">
      <!-- email feedback button -->
      <!-- TODO: set your feedback email -->
      <q-btn
        type="a"
        :href="`mailto:[your email]?subject=Kommentar zu ${comic.name}`"
        rounded
        no-caps
        label="Schreib uns"
        color="grey-9"
        text-color="white"
        icon="mail"
        :padding="btnPadding"
        :size="btnSize"
        class="credits-btn"
      />
      <!-- back to overview button -->
      <!-- TODO: set href to your overview page or the like -->
      <q-btn
        type="a"
        href="[your overview page]"
        rounded
        no-caps
        label="Weitere Comics"
        color="grey-9"
        text-color="white"
        icon="photo_library"
        :padding="btnPadding"
        :size="btnSize"
        class="credits-btn"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreditsPanel',
  props: {
    comic: {
      type: Object,
      required: true
    },
    panelSize: {
      type: Number,
      required: true
    }
  },
  computed: {
    // The text sizes are calculated relative to panel size
    // in order to look like a prerendered panel image
    titleSize() {
      return this.panelSize / 10 + 'px'
    },
    labelSize() {
      return this.panelSize / 32 + 'px'
    },
    textSize() {
      return this.panelSize / 17 + 'px'
    },
    smallSize() {
      return this.panelSize / 30 + 'px'
    },
    btnSize() {
      return this.panelSize / 40 + 'px'
    },
    btnPadding() {
      return this.panelSize / 30 + 'px ' + this.panelSize / 20 + 'px'
    }
  }
}
</script>

<style scoped>
p {
  margin-bottom: 0;
}
.credits-panel {
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  line-height: 1.2;
}
.margin-start-big {
  margin-block-start: 10%;
}
.margin-start-small {
  margin-block-start: 1%;
}
.credits-btn {
  margin: 3% 3% 0;
  max-width: 50%;
  max-height: 10%;
  border-radius: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 7001;
}
:deep(.credits-btn .q-btn__content) {
  width: 100%;
  flex-wrap: nowrap;
}
:deep(.credits-btn .q-btn__content span) {
  white-space: nowrap;
}
:deep(.credits-btn i.on-left) {
  margin-right: 8%;
}
</style>
