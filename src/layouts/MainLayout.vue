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
* This is the layout wrapper containing the pages.
* If you want dialogues or anything to appear globally
* in the whole app, you can add them here.
*/

<template>
  <q-layout view="lHh Lpr lFf" style="overflow: hidden;">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>
