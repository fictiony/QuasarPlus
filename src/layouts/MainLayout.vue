<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title> Quasar 组件扩展 </q-toolbar-title>
        <q-toolbar-title>Quasar Plus</q-toolbar-title>
        version 0.0.1 - by
        <q-item tag="a" href="mailto:ficitony@qq.com" style="padding: 14px 5px 14px 5px">
          Fictiony
          <q-tooltip>ficitony@qq.com</q-tooltip>
        </q-item>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="bg-grey-1">
      <q-list>
        <EssentialLink v-for="link in linkList" :key="link.title" v-bind="link" />
        <q-separator />
        <q-item-label header class="text-grey-8"> 扩展组件列表 </q-item-label>
        <EssentialLink v-for="link in componentList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

export default {
  name: 'MainLayout',
  components: { EssentialLink },
  data: () => ({
    leftDrawerOpen: false,
    linkList: [
      {
        title: '返回主页',
        icon: 'home',
        to: '/'
      }
    ],
    componentList: [
      {
        title: '分隔条 - MySplitter',
        caption: '<my-splitter>',
        icon: 'vertical_align_center',
        to: 'MySplitter'
      },
      {
        title: '侧滑栏 - MyDrawer',
        caption: '<my-drawer>',
        icon: 'input',
        to: 'MyDrawer'
      }
    ]
  })
}
</script>
