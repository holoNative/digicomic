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
* This is the main comic player page.
* It's mostly responsible for deciding which mode (panels/video) to show
* and is containing the overlay / UI logic.
*/

<template>
  <q-page
    v-if="comic && ready"
    class="flex justify-center fixed full-width"
    :class="adjustDesktopHeight
      ? 'items-start'
      : 'items-center'"
  >
    <!-- comic or video is shown depending on isVideoMode var -->
    <div
      :style="`position: relative; width: ${panelSize}px;`"
      class="flex flex-center fixed"
      :class="{'desktop-padding': isDesktop}"
    >
      <keep-alive>
        <comic-swiper
          v-if="!isVideoMode"
          :key="swiperKey"
          ref="comicSwiper"
          :comic="comic"
          :panel-size="panelSize"
          :text-visible="textVisible"
          :panel-id="parseInt(panelId)"
          @slide-change="activeSlide = $event"
          @ready="onSwiperReady($event)"
          @overlay-button-click="overlayEnabled
            ? hideOverlay()
            : showOverlay()"
        />
      </keep-alive>

      <video-player
        v-if="comic.video"
        v-show="isVideoMode"
        ref="videoPlayer"
        :comic="comic"
        :panel-id="parseInt(panelId)"
        @ready="onVideoPlayerReady"
      />
    </div>

    <!-- overlay (panels: @bottom; video: fullscreen) -->
    <div
      class="overlay-zone q-py-xl z-top disable-dbl-tap-zoom"
      :class="{ 'full-height': isVideoMode }"
      @click.stop="overlayEnabled ? hideOverlay() : showOverlay()"
    >
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <!-- when buggy revert isDesktop to
        (isDesktop && adjustDesktopHeight) -->
        <div
          v-if="overlayEnabled ||
            (isVideoMode && videoPlayer.paused) ||
            (isDesktop && !isVideoMode)"
          class="overlay q-pa-xs fixed-bottom z-top"
        >
          <!-- center video controls for video mode -->
          <div
            v-if="isVideoMode"
            id="overlay-video-buttons-wrapper"
            class="row fixed-center justify-around full-width q-px-md"
          >
            <div class="col-auto flex items-center">
              <!-- 10sec rewind button -->
              <q-btn
                icon="replay_10"
                no-shadow
                flat
                padding="md"
                size="md"
                text-color="white"
                round
                :disable="!videoPlayer.videoInitiated
                  || videoPlayer.currentTime < 10"
                class="overlay"
                @click.stop="onOverlayRewindBtn()"
              />
            </div>

            <!-- center play button -->
            <div class="col-auto">
              <q-btn
                :icon="playBtnIcon"
                no-shadow
                flat
                padding="md"
                size="50px"
                text-color="white"
                round
                :disable="!videoPlayer.videoInitiated"
                class="overlay q-mx-md"
                @click.stop="onOverlayPlayBtn()"
              />
            </div>

            <!-- 10sec fast forward button -->
            <div class="col-auto flex items-center">
              <q-btn
                icon="forward_10"
                no-shadow
                flat
                padding="md"
                size="md"
                text-color="white"
                round
                :disable="!videoPlayer.videoInitiated ||
                  videoPlayer.currentTime + 10 >= videoPlayer.duration"
                class="overlay"
                @click.stop="onOverlayForwardBtn()"
              />
            </div>
          </div>

          <!-- bottom controls bar -->
          <div class="row">
            <!-- controls UI for comic panels -->
            <template v-if="!isVideoMode">
              <!-- previous panel button -->
              <div class="col-auto flex items-center">
                <q-btn
                  icon="keyboard_arrow_left"
                  text-color="white"
                  flat
                  size="lg"
                  padding="0"
                  round
                  :disable="activeSlide <= 0"
                  @click.stop="onOverlayPrevClick"
                />
              </div>
              
              <!-- panel slider -->
              <div class="col q-px-md flex items-center">
                <q-slider
                  id="overlay-slider"
                  v-model="activeSlide"
                  color="white"
                  :min="0"
                  :max="comic.panelsCount"
                  :step="1"
                  snap
                  label
                  :label-value="activeSlide + 1"
                  label-text-color="black"
                  @update:model-value="onSliderUpdate"
                  @click.stop=""
                />
              </div>

              <!-- next panel button -->
              <div class="col-auto flex items-center">
                <q-btn
                  icon="keyboard_arrow_right"
                  text-color="white"
                  flat
                  size="lg"
                  padding="0"
                  round
                  :disable="activeSlide > comic.panelsCount - 1"
                  @click.stop="onOverlayNextClick"
                />
              </div>
            </template>

            <!-- controls UI for videos -->
            <template v-else>
              <!-- video time display -->
              <div class="col-auto q-pl-sm text-left flex items-center">
                <span>
                  {{ secondsToMMSS(videoPlayer.currentTime) }}
                  / {{ secondsToMMSS(videoPlayer.duration) }}
                </span>
              </div>
              
              <!-- video seek bar -->
              <div class="col q-px-md flex items-center">
                <q-slider
                  v-if="videoPlayer"
                  id="seek-bar"
                  color="white"
                  :min="0"
                  :max="videoPlayer.videoInitiated
                    ? videoPlayer.duration
                    : 0"
                  :step="0.01"
                  :model-value="videoPlayer.videoInitiated
                    ? videoPlayer.currentTime
                    : 0"
                  :disable="!videoPlayer.videoInitiated"
                  @update:model-value="onSeekBarChange"
                  @click.stop=""
                />
              </div>
            </template>
            
            <!-- controls for both modes -->
            <!-- fullscreen button -->
            <div class="col-auto">
              <q-btn
                v-if="fullscreenSupported"
                :icon="$q.fullscreen.isActive
                  ? 'fullscreen_exit'
                  : 'fullscreen'"
                text-color="white"
                flat
                round
                @click.stop="onOverlayFullscreenClick"
              />
            </div>
            <!-- mode selection button -->
            <div class="col-auto">
              <q-btn
                v-if="comic.video"
                :icon="isVideoMode ? 'image' : 'movie'"
                text-color="white"
                flat
                round
                @click.stop="onOverlayModeClick"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script>
import data from 'src/data/comics.json'
import ComicSwiper from 'components/ComicSwiper'
import VideoPlayer from 'components/VideoPlayer'
/* import { createMetaMixin } from 'quasar' */
import { useMeta } from 'quasar'
import webvtt from 'node-webvtt'

export default {
  name: 'PageComic',
  components: {
    ComicSwiper,
    VideoPlayer
  },
  props: {
    comicId: {
      type: String,
      default: 'motivation'
    },
    panelId: {
      type: [String, Number],
      default: 1
    }
  },
  data() {
    return {
      comic: null,
      ready: false,
      panelSize: 0,
      isVideoMode: false,
      comicSwiper: false,
      swiperKey: 0,
      overlayEnabled: false,
      overlayTimeout: null,
      overlayDuration: 3000,
      textVisible: true,
      activeSlide: 0,
      videoPlayer: false,
      adjustDesktopHeight: false
    }
  },
  computed: {
    // set page specific meta
    meta() {
      return {
        title: `Panel ${this.activeSlide + 1} - ${this.comic.name}`
      }
    },
    // check if fullscreen supported
    // iOS returns falls but has a fullscreen method itself
    fullscreenSupported() {
      return document.fullscreenEnabled ||
        (this.isVideoMode && this.$q.platform.is.ios)
    },
    isDesktop() {
      return this.$q.platform.is.desktop
    },
    playBtnIcon() {
      if (this.videoPlayer.ended &&
        this.videoPlayer.currentTime >=
        this.videoPlayer.duration) return 'replay'
      return this.videoPlayer.paused
        ? 'play_arrow'
        : 'pause'
    },
    vttSource() {
      return this.comic.vtt
        ? `${process.env.COMICS_DIR + this.comic.id}/video/${this.comic.vtt}`
        : false
    }
  },
  watch: {
    isVideoMode(val) {
      // resize panel / video size, because desktop
      // needs bottom margin on desktop
      if (this.isDesktop) this.getPanelSize()
      if (val) this.videoPlayer = this.$refs.videoPlayer
    }
  },
  methods: {
    onSwiperReady(swiper) {
      this.comicSwiper = swiper
      this.showOverlay(1000)
    },
    onVideoPlayerReady() {
      if (this.isVideoMode) {
        this.videoPlayer = this.$refs.videoPlayer
        
        // the overlay needs to be made persistent
        // at the beginning when video not played yet
        this.showOverlay()
        this.stopOverlayTimeout()
      }
    },
    /** overlay UI **/
    onOverlayModeClick() {
      if (this.isVideoMode) {
        this.videoPlayer.pause()
        this.hideOverlay(800)
        this.videoPlayer = false
        
        // refresh the URL accordingly to reflect the state
        this.$router.replace({
          path: this.$route.path,
          query: { m: 'comic' }
        })
      } else {
        // set video time to corresponding panel time
        if (this.comic.panels[this.activeSlide] && this.comic.panels[this.activeSlide].startTime) {
          this.$refs.videoPlayer.setTime(this.comic.panels[this.activeSlide].startTime)
        }
        
        this.stopOverlayTimeout()
        // refresh the URL accordingly to reflect the state
        this.$router.replace({
          path: this.$route.path,
          query: { m: 'video' }
        })
      }
    },
    // this method and the corresponding
    // button are currently not in use
    /* onOverlayTextVisibleClick() {
      this.textVisible = !this.textVisible
      this.resetOverlayTimeout()
    }, */
    onOverlayFullscreenClick() {
      if (this.isVideoMode && this.$q.platform.is.ios) {
        document.getElementsByTagName('video')[0]
          .webkitEnterFullScreen()
      } else {
        this.$q.fullscreen.toggle()
        this.resetOverlayTimeout()
      }
    },
    onOverlayPrevClick() {
      this.$refs.comicSwiper.swiper.slideTo(this.activeSlide - 1)
      this.resetOverlayTimeout()
    },
    onOverlayNextClick() {
      this.$refs.comicSwiper.swiper.slideTo(this.activeSlide + 1)
      this.resetOverlayTimeout()
    },
    onSliderUpdate(slide) {
      this.$refs.comicSwiper.swiper.slideTo(slide)
      this.$nextTick(() => {
        this.$refs.comicSwiper.swiper.update()
      })
      this.resetOverlayTimeout()
    },
    onSeekBarChange(val) {
      this.videoPlayer.setTime(val)
      this.resetOverlayTimeout()
    },
    onOverlayPlayBtn() {
      if (this.videoPlayer.ended) this.videoPlayer.ended = false
      if (this.videoPlayer.paused) {
        this.videoPlayer.play()
        setTimeout(() => {
          this.hideOverlay(500)
        }, 10)
      } else {
        this.videoPlayer.pause()
        this.stopOverlayTimeout()
      }
    },
    onOverlayRewindBtn() {
      if (this.videoPlayer.currentTime >= 10) {
        this.videoPlayer.setTime(this.videoPlayer.currentTime - 10)
      }
      this.resetOverlayTimeout()
    },
    onOverlayForwardBtn() {
      if (this.videoPlayer.currentTime + 10 < this.videoPlayer.duration) {
        this.videoPlayer.setTime(this.videoPlayer.currentTime + 10)
      }
      this.resetOverlayTimeout()
    },

    /** overlay logic **/
    // when activated, the overlay get a timeout set,
    // so it can fade away after given time
    showOverlay(delay = 0) {
      if (this.isVideoMode && this.videoPlayer.paused) return
      setTimeout(() => {
        this.overlayEnabled = true
        if (this.overlayTimeout) {
          clearTimeout(this.overlayTimeout)
          this.overlayTimeout = null
        }
        this.overlayTimeout = setTimeout(() => {
          this.overlayEnabled = false
          this.overlayTimeout = null
        }, this.overlayDuration)
      }, delay)
    },
    // use this to let the overlay fade out instantly
    hideOverlay(delay = 0) {
      if (this.isVideoMode &&
        this.videoPlayer.paused &&
        this.videoPlayer.videoInitiated) return
      if (this.overlayTimeout) {
        clearTimeout(this.overlayTimeout)
        this.overlayTimeout = null
      }
      this.overlayTimeout = setTimeout(() => {
        this.overlayEnabled = false
        this.overlayTimeout = null
      }, delay)
    },
    // use this, if you want the overlay to keep activated
    // for the given time and then fade away
    resetOverlayTimeout() {
      if (this.isVideoMode && this.videoPlayer.paused) return
      if (this.overlayTimeout) {
        clearTimeout(this.overlayTimeout)
      }
      this.overlayTimeout = setTimeout(() => {
        this.overlayEnabled = false
        this.overlayTimeout = null
      }, this.overlayDuration)
    },
    // use this, if you want to stop the timeout
    // to let the overlay persist
    stopOverlayTimeout() {
      if (this.overlayTimeout) clearTimeout(this.overlayTimeout)
      if (!this.overlayEnabled) this.overlayEnabled = true
    },

    /** util methods **/
    secondsToMMSS(seconds) {
      return typeof (seconds) !== 'number' || seconds === Infinity
        ? '??:??'
        : new Date(seconds * 1000)
          .toISOString()
          .substr(14, 5)
    },
    // the longest side is required to ensure that
    // the 1:1 panels always cover the biggest space possible
    getPanelSize() {
      this.adjustDesktopHeight = this.isDesktop && !this.isVideoMode && window.innerWidth > window.innerHeight - 50
      if (this.adjustDesktopHeight) this.panelSize = innerHeight - 50
      else if (window.innerWidth < window.innerHeight) this.panelSize = innerWidth
      else this.panelSize = innerHeight
    }
  },
  created() {
    // check if comic exists and get comic from JSON
    // if not redirect to 404
    this.comic = data.comics
      .find(comic => comic.id === this.comicId)
    if (!this.comic) window.location.href = '' // TODO: fill in your 404 page or create a new route

    // load the vtt video timestamps
    if (this.comic.vtt) {
      let xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const res = webvtt.parse(xhr.responseText)
            for (let i = 0; i < this.comic.panelsCount; i++) {
              if (!res.cues[i]) continue
              this.comic.panels[i].startTime = res.cues[i].start
              this.comic.panels[i].endTime = res.cues[i].end
            }
          } else {
            console.warn('XHR failed')
          }

          // when finished loading vtt, show content
          this.ready = true
        }
      }.bind(this)
      xhr.open('GET', this.vttSource)
      xhr.send()
    } else this.ready = true
    
    // set activeSlide according to route param
    this.activeSlide = this.panelId ? this.panelId - 1 : 0

    // get shorter side for panel size
    this.getPanelSize()
    
    // reinit swiper with new size on window resize & orientation change
    let func = null
    this.swiperKey = Date.now()
    window.addEventListener('resize', () => {
      clearTimeout(func)
      func = setTimeout(function () {
        this.getPanelSize()
      
        // reinit the swiper
        this.swiperKey = Date.now()
      }.bind(this), 70)
    })

    // change meta data accordingly to comic and panel
    useMeta(() => this.meta)

    // mode check fix for when no vtt is available
    if (!this.comic.vtt) {
      this.$nextTick(() => {
        this.isVideoMode = this.$route.query.m === 'video'
      })
    }
  },
  updated() {
    // listen for mode changes
    // (must be in updated because of initial mode check for vtt)
    this.$nextTick(() => {
      this.isVideoMode = this.$route.query.m === 'video'
    })
  }
}
</script>

<style scoped lang="scss">
.overlay {
  background-color: rgba(0,0,0,0.9);
}
.overlay-zone {
  cursor: pointer;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 25%;
  z-index: 1;
/*   background-color: rgba(73,169,244,0.5); */ // for debug
}

#overlay-slider {
  height: 20px;
}

#overlay-video-buttons-wrapper {
  max-width: 400px;
}

#video-player {
  width: 100%;
}

.desktop-padding {
  padding-bottom: 40px;
}

.disable-dbl-tap-zoom {
  touch-action: manipulation;
}
</style>
