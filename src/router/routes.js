import { PLUS_LIST } from 'boot/menu.js'
import DemoPage from 'components/DemoPage.vue'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/', component: () => import('pages/Index.vue') },
      {
        path: '/QuasarComponents/:category?',
        component: () => import('pages/QuasarComponents.vue')
      },
      {
        path: '/QuasarIconSets/:iconSet?',
        component: () => import('pages/QuasarIconSets.vue')
      },
      ...PLUS_LIST.map((item, index) => ({
        path: item.to,
        component: () =>
          import('pages/doc/' + item.caption + '.md').then(doc => ({
            extends: DemoPage,
            props: {
              doc: {
                type: String,
                default: () => doc.default
              },
              prevPage: {
                type: String,
                default: (PLUS_LIST[index - 1] || {}).to || '/'
              },
              nextPage: {
                type: String,
                default: (PLUS_LIST[index + 1] || {}).to || '/'
              }
            }
          }))
      }))
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
