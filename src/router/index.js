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
        name: 'about',
        path: 'about',
        component: ViewAbout,
        alias: ''
      },
      {
        name: 'settings',
        path: 'settings',
        component: ViewSettings
      },
      {
        name: 'export',
        path: 'export',
        component: ViewExport
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
