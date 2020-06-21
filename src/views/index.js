import Vue from 'vue'
import VueRouter from 'vue-router'

import ViewLogin from '@/views/VLogin'

import ViewList from '@/views/VList'

import ViewEditCase from '@/views/VEditCase'
import ViewEditItemDiagnosis from '@/views/VEditItemDiagnosis'
import ViewEditItemProcedure from '@/views/VEditItemProcedure'
import ViewEditItemAE from '@/views/VEditItemAE'

import ViewUtilites from '@/views/VUtilities'
import ViewAbout from '@/views/VAbout'
import ViewSettings from '@/views/VSettings'
import ViewExport from '@/views/VExport'
import ViewImport from '@/views/VImport'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: ViewLogin
  },
  {
    name: 'list',
    path: '/list',
    component: ViewList
  },
  {
    name: 'edit',
    path: '/edit/:uid',
    component: ViewEditCase,
    props: true,
    children: [
      {
        name: 'diagnosis',
        path: 'diagnosis',
        component: ViewEditItemDiagnosis,
        props: true
      },
      {
        name: 'procedure',
        path: 'procedure',
        component: ViewEditItemProcedure,
        props: true
      },
      {
        name: 'AE',
        path: 'AE',
        component: ViewEditItemAE,
        props: true
      }
    ]
  },
  {
    name: 'utilities',
    path: '/utilities',
    component: ViewUtilites,
    children: [
      {
        name: 'settings',
        path: '/utilities/settings',
        component: ViewSettings,
        alias: ''
      },
      {
        name: 'exportdata',
        path: '/utilities/exportdata',
        component: ViewExport
      },
      {
        name: 'importdata',
        path: '/utilities/importdata',
        component: ViewImport
      },
      {
        name: 'about',
        path: '/utilities/about',
        component: ViewAbout
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
