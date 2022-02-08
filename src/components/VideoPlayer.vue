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
* This is the video player component.
*/

<template>
  <div class="video-player" style="width:100%; height: 100%">
    <video
      id="video-player"
      class="video-js vjs-default-skin"
      playsinline
      :muted="false"
      preload="auto"
      crossorigin="anonymous"
      style="width:100%; height: 100%"
      :poster="posterSource"
    >
      <source
        v-for="vSrc in videoSources"
        :key="vSrc.src"
        :src="vSrc.src"
        :type="vSrc.type"
      >
      <p class="vjs-no-js">
        Aktiviere bitte JavaScript, um dieses Video zu sehen oder wähle einen anderen Browser aus, der
        <a href="https://videojs.com/html5-video-support/" target="_blank">
          HTML5-Videos unterstützt
        </a>.
      </p>
    </video>
  </div>
</template>

<script>
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'

export default {
  name: 'VideoPlayer',
  props: {
    comic: {
      type: Object,
      required: true
    },
    panelId: {
      type: Number,
      required: true
    }
  },
  emits: ['ready', 'reactivated', 'paused'],
  data() {
    return {
      player: null,
      metaDataLoaded: false,
      videoInitiated: false,
      videoStarted: false,
      loading: false,
      paused: true,
      ended: false,
      duration: 0,
      currentTime: 0,
      realtimePanelIndex: null,
      // video.js options: https://docs.videojs.com/tutorial-options.html
      options: {
        language: 'de',
        userActions: {
          hotkeys: 'true'
        },
        html5: {
          vhs: {
            overrideNative: false,
            smoothQualityChange: true
          }
        },
        aspectRatio: '1:1'
      }
    }
  },
  computed: {
    // poster is used to avoid first black video frame,
    // but disappears when changing panelId or playing video
    posterSource() {
      let panelInd
      if (!this.comic.vtt || !this.comic.panels[this.panelId - 1] ||
        !this.comic.panels[this.panelId - 1].startTime
      ) panelInd = 0
      else {
        panelInd = this.panelId < this.comic.panelsCount
          ? this.panelId - 1
          : this.comic.panelsCount - 1
      }
      return `${process.env.COMICS_DIR + this.comic.id}/images/${this.comic.panels[panelInd].image}`
    },
    videoSources() {
      return this.comic.video.map(source => {
        source.src = `${process.env.COMICS_DIR + this.comic.id}/video/${source.name}`
        return source
      })
    }
  },
  watch: {
    panelId(newVal, oldVal) {
      if (!oldVal || !this.paused) return
      
      // set video time to corresponding panel time
      if (this.comic.video && this.comic.panels[this.panelId - 1] && this.comic.panels[this.panelId - 1].startTime) {
        this.setTime(this.comic.panels[this.panelId - 1].startTime)
      }
      
      // if user haven't started the video yet but changed video time
      // we want to remove the poster and show the actual frame
      if (!this.videoStarted) {
        this.play()
        this.$nextTick(() => {
          this.pause()
        })
      }
    }
  },
  methods: {
    play() {
      this.player.play()
      if (!this.videoStarted) this.videoStarted = true
    },
    pause() {
      this.player.pause()
    },
    // time (especially) on iOS can't be set before play,
    // so it's saved before video initialized
    setTime(val) {
      if (val === undefined || val === null) return
      this.currentTime = val
      if (this.videoInitiated) this.player.currentTime(val)
    }
  },
  mounted() {
    // init player
    this.player = videojs('video-player', this.options, () => {
      this.$emit('ready')
    })
    // on iOS, video needs to be loaded extra
    if (this.$q.platform.is.ios) this.player.load()

    // video events
    this.player.on('loadedmetadata', () => {
      this.duration = this.player.duration()
      this.metaDataLoaded = true
    })
    this.player.on('canplaythrough', () => {
      // video time can be manipulated after
      // canplaythrough event emitted
      if (!this.videoInitiated) {
        this.videoInitiated = true
        this.setTime(this.currentTime)
      }
    })
    this.player.on('playing', () => {
      this.paused = false
    })
    this.player.on('pause', () => {
      this.paused = true
      this.$emit('paused')
    })
    this.player.on('timeupdate', () => {
      if (!this.videoInitiated) return
      this.currentTime = this.player.currentTime()
      
      // get the realtime panel index
      const curIndex = this.comic.panels.findIndex(panel => {
        return this.currentTime >= panel.startTime &&
          this.currentTime < panel.endTime
      })
      if (curIndex >= 0 && this.realtimePanelIndex !== null &&
        curIndex !== this.realtimePanelIndex
      ) {
        // refresh the URL in browser address bar with new
        // panel id for when people want to share specific slides
        this.$router.replace({
          params: { panelId: curIndex + 1 },
          query: { ...this.$route.query }
        })
      }

      this.realtimePanelIndex = curIndex
    })
    this.player.on('ended', () => {
      this.ended = true
    })

    // set aspect ratio to default ratio
    this.player.aspectRatio(this.ratio)
    
    // set init time
    if (this.comic.panels[this.panelId - 1] && this.comic.panels[this.panelId - 1].startTime) {
      this.setTime(this.comic.panels[this.panelId - 1].startTime)
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.video-js) {
  background-color: transparent;
}
:deep(.vjs-loading-spinner) {
  z-index: 9999;
}
</style>
