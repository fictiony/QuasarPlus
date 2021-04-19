<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Quasar Plus - {{ component }}</q-toolbar-title>
        Quasar 组件扩展 v0.0.1 &nbsp; &nbsp;
        <q-btn flat dense size="sm" label="联系方式" icon="email" type="a" href="mailto:ficitony@qq.com">
          <q-tooltip>ficitony@qq.com</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <my-drawer v-model="leftDrawerOpen" show-if-above bordered elevated content-class="bg-grey-1" :width="200" :limits="[150, 300]">
      <MenuPanel />
    </my-drawer>

    <my-drawer v-model="rightDrawerOpen" side="right" show-if-above bordered elevated content-class="bg-grey-1" :width="300" :limits="[200, 500]">
      <PropPanel />
    </my-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import MyDrawer from 'components/MyDrawer.js'
import MenuPanel from 'pages/MenuPanel.vue'
import PropPanel from 'pages/PropPanel.vue'

export default {
  name: 'MainLayout',
  components: {
    MyDrawer,
    MenuPanel,
    PropPanel
  },
  data: () => ({
    leftDrawerOpen: false,
    rightDrawerOpen: false,
    component: 'MySplitter'
  })
}
</script>
