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
* These are the app's routes. A 404 page is not required,
* because the user gets redirected to an external 404 page
* as set in PageComic.vue
*/

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // comic page with comic and panel id as params
      {
        name: 'panel',
        path: ':comicId?/:panelId?',
        query: { m: 'comic' }, // mode can be comic or video
        component: () => import('src/pages/PageComic.vue'),
        props: true
      },
      // root redirects to external comic overview
      // can be used for local development purposes
      {
        name: 'index',
        path: '',
        component: () => import('src/pages/PageIndex.vue')
      }
    ]
  }
]

export default routes
