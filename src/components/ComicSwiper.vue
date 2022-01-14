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
* This is the swiper that contains the comic images and UI inside them.
*/

<template>
  <div :style="`width: ${panelSize}px; height: ${panelSize}px;`">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <!-- swiper slides containing comic panels or end credits -->
        <div
          v-for="slide in virtualData.slides"
          :key="slide.id"
          class="swiper-slide"
          :class="{'credits-slide': slide.type === 'credits'}"
          :style="{left: `${virtualData.offset}px`}"
        >
          <comic-panel
            v-if="slide.type === 'panel'"
            :key="slide.id"
            :comic="comic"
            :panel="slide.id"
            :text-visible="textVisible"
          />

          <!-- credits panel only shows up at the end -->
          <credits-panel
            v-else
            :comic="comic"
            :panel-size="panelSize"
          />
        </div>
      </div>
      
      <!-- navigation buttons inside swiper -->
      <div class="swiper-button-prev" />
      <div class="swiper-button-next" />

      <!-- center button inside swiper for showing/hiding the overlay -->
      <div
        v-if="activeSlide < comic.panelsCount"
        class="swiper-button-overlay"
        @click="$emit('overlay-button-click')"
      />
    </div>

    <!-- navigation buttons behind & beside comic swiper (especially for desktop) -->
    <q-btn
      id="tap-space-prev"
      :ripple="false"
      flat
      unelevated
      :rounded="false"
      :disable="activeSlide <= 0"
      class="tap-space"
      :class="{'tap-space-disabled': activeSlide <= 0}"
      @click="swiper.slidePrev()"
    >
      <div
        id="tap-space-prev-arrow"
        class="mobile-hide"
        :style="`right: ${panelSize / 2 + 150}px;`"
      >
        ❮
      </div>
    </q-btn>
    <q-btn
      id="tap-space-next"
      :ripple="false"
      flat
      unelevated
      :rounded="false"
      :disable="activeSlide > comic.panelsCount - 1"
      class="tap-space"
      :class="{'tap-space-disabled': activeSlide > comic.panelsCount - 1}"
      @click="swiper.slideNext()"
    >
      <div
        id="tap-space-next-arrow"
        class="mobile-hide"
        :style="`left: ${panelSize / 2 + 150}px;`"
      >
        ❯
      </div>
    </q-btn>
  </div>
</template>

<script>
import Swiper from 'swiper/bundle'
import 'swiper/swiper-bundle.min.css'
import ComicPanel from 'components/ComicPanel'
import CreditsPanel from 'components/CreditsPanel'

export default {
  name: 'ComicSwiper',
  components: {
    ComicPanel,
    CreditsPanel
  },
  props: {
    panelSize: {
      type: Number,
      required: true
    },
    textVisible: {
      type: Boolean,
      required: true
    },
    comic: {
      type: Object,
      required: true
    },
    panelId: {
      type: Number,
      required: true
    }
  },
  emits: ['ready', 'slide-change', 'overlay-button-click'],
  data() {
    return {
      activeSlide: 1,
      swiper: null,
      slides: [],
      virtualData: {
        slides: []
      }
    }
  },
  mounted() {
    // push panels & credits panel in slides array with corresponding type
    for (let i = 1; i <= this.comic.panelsCount; i++) {
      this.slides.push({ type: 'panel', id: i })
    }
    this.slides.push({ type: 'credits', id: this.comic.panelsCount + 1 })
    
    // swiper settings
    // refer to the options in the docs: https://swiperjs.com/swiper-api
    const self = this
    this.swiper = new Swiper('.swiper-container', {
      effect: self.comic.effect,
      fadeEffect: { crossFade: true },
      autoplay: false,
      slidesPerView: 1,
      centeredSlides: true,
      followFinger: self.comic.effect !== 'fade',
      grabCursor: self.comic.effect !== 'fade',
      watchSlidesVisibility: true,
      spaceBetween: 0,
      speed: 500,
      keyboard: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      // there is only 7 slides being rendered at once;
      // new ones will be loaded when needed to save data
      // and guarantee a good performance
      virtual: {
        slides: self.slides,
        renderExternal(data) {
          self.virtualData = data
        },
        addSlidesBefore: 3,
        addSlidesAfter: 3
      },
      initialSlide: this.activeSlide,
      on: {
        slideChange: (ev) => {
          this.$emit('slide-change', ev.activeIndex)
          this.activeSlide = ev.activeIndex
          // refresh the URL in browser address bar with new
          // panel id for when people want to share specific slides
          this.$router.replace({
            params: { panelId: parseInt(this.activeSlide) + 1 },
            query: { ...this.$route.query }
          })
        }
      }
    })
  },
  activated() {
    this.activeSlide = this.panelId ? this.panelId - 1 : 0
    
    // go to correct panel with fix for fade effect bug
    // (blank screen at beginning; slides wrongly positioned)
    this.$nextTick(() => {
      let fix = this.virtualData.slides[this.activeSlide + 1] ? 1 : -1
      this.swiper.slideTo(this.activeSlide + fix, 0, false)
      this.$nextTick(() => {
        this.swiper.slideTo(this.activeSlide - fix, 0, false)
        this.$emit('ready', this.swiper)
      })
    })
  }
}
</script>

<style scoped lang="scss">
:deep(.credits-slide) {
  pointer-events: auto;
}
:deep(.swiper-button-prev) {
  height: 100%;
  width: 30%;
  top: 0;
  left: 0;
  margin-top: 0;
/*   background-color: rgba(245,5,3, 0.5); */ // for debug
}
:deep(.swiper-button-next) {
  height: 100%;
  width: 30%;
  top: 0;
  right: 0;
  margin-top: 0;
/*   background-color: rgba(29,188,96, 0.5); */ // for debug
}
:deep(.swiper-button-prev::after),
:deep(.swiper-button-next::after) {
  content: ''
}

.swiper-button-next:focus,
.swiper-button-prev:focus {
  outline: none
}

.swiper-button-overlay {
  height: 100%;
  width: 40%;
  top: 0;
  left: 30%;
  margin: auto;
  margin-top: 0;
  /* background-color: rgba(73,169,244,0.5); */ // for debug
  position: absolute;
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-container {
  height: 100%;
  z-index: 2;
}

#tap-space-prev, #tap-space-next {
  position: fixed;
  top: 0;
  height: 100%;
  width: 50%;
  background-color: transparent;
  color: #aaa;
  z-index: 1;
  cursor: pointer;
/*   background-color: rgba(245,5,3, 0.5); */ // for debug
}
#tap-space-prev {
  left: 0;
}
#tap-space-next {
  right: 0;
}
.tap-space {
  padding: 0;
}
.tap-space:hover:not(.tap-space-disabled) {
  color: #fff !important;
}
:deep(.tap-space.q-focusable:focus .q-focus-helper),
:deep(.tap-space.q-hoverable:hover .q-focus-helper) {
  background: inherit;
  opacity: 0;
}
:deep(.tap-space.q-hoverable:active .q-focus-helper) {
  background: inherit;
  opacity: 0;
}
#tap-space-prev-arrow, #tap-space-next-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(calc(-50% - 25px));
    border: 0;
    font-size: 130px;
    line-height: 1;
    opacity: .6;
    color: inherit;
    user-select: none;
}
</style>
