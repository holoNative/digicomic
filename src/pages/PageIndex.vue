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
* This page is only for local development.
* The actual comic overview can be found on the digicomic website.
* The links there lead directly to the comic pages.
*/

<template>
  <div v-if="!isProd" id="index-wrapper">
    <h2 class="text-center">
      Digitale Comics
    </h2>
    <h4 id="heading">
      Unsere Comics
    </h4>
    <div class="q-col-gutter-md row">
      <div
        v-for="comic in comics"
        :key="comic.id"
        class="col-6 col-md-4"
      >
        <q-card
          :dark="false"
          class="text-dark"
          @click="onCardClick(comic)"
        >
          <q-img
            :src="getPanelSource(comic, 0)"
            :ratio="1"
          />

          <q-card-section>
            <div class="text-h6">
              {{ comic.name }}
            </div>
            <div class="text-subtitle2">
              von {{ comic.credits.artist }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import data from 'src/data/comics.json'
import { useMeta } from 'quasar'

export default {
  name: 'PageIndex',
  
  // redirect to digicomic page, when in production
  beforeRouteEnter() {
    if (process.env.NODE_ENV === 'production') {
      window.location.href = '' // TODO: fill in your overview page or the like
    }
  },
  data() {
    return {
      comics: data.comics,
      
      // page meta data
      meta: {
        title: 'Comic-Übersicht'
      }
    }
  },
  computed: {
    isProd() {
      return process.env.NODE_ENV === 'production'
    }
  },

  methods: {
    getPanelSource(comic, panelId) {
      return `${process.env.COMICS_DIR + comic.id}/images/${comic.panels[panelId].image}`
    },
    onCardClick(comic) {
      this.$router.push(`/${comic.id}/1`)
    }
  },
  created() {
    // set specific page meta
    useMeta(() => this.meta)
  }
}
</script>

<style lang="scss" scoped>
#index-wrapper {
  width: 100%;
  max-width: $breakpoint-md-min;
  margin: auto;
  padding: 16px;
}
#cc-logo {
  width: 80%;
  height: auto;
  max-width: 500px;
  margin: 28px auto;
  display: block;
}
#heading {
  color: #e2e2e4;
}
.text-h6 {
  font-weight: bold;
}
.q-card {
  background-color: #eee;
  cursor: pointer;
}
</style>
