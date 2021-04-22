<template>
  <q-layout view="lHh LpR fff">
    <q-header elevated>
      <q-toolbar class="q-pr-sm">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftOpen = !leftOpen" />
        <q-toolbar-title>Quasar 组件扩展 <span class="text-subtitle1">v0.0.2</span></q-toolbar-title>
        <q-toolbar-title>{{ title }}</q-toolbar-title>
        <q-btn flat dense size="sm" label="联系作者" icon="email" type="a" href="mailto:ficitony@qq.com">
          <q-tooltip>ficitony@qq.com</q-tooltip>
        </q-btn>
        <div class="q-ml-md">Quasar v{{ $q.version }}</div>
        <q-btn class="q-ml-sm" flat round @click="$q.dark.toggle()" :icon="darkIcon" />
      </q-toolbar>
    </q-header>

    <my-drawer v-model="leftOpen" show-if-above bordered elevated :content-class="drawerBgColor" :width="200" :limits="[150, 300]">
      <MenuPanel />
    </my-drawer>

    <my-drawer v-model="rightOpen" side="right" :breakpoint="700" bordered :content-class="drawerBgColor" :width="300" :limits="[200, 500]">
      <PropPanel />
    </my-drawer>

    <q-page-container>
      <router-view ref="page" />
    </q-page-container>
  </q-layout>
</template>

<script>
import plusList from 'components/plus/list.js'
import MenuPanel from 'pages/MenuPanel.vue'
import PropPanel from 'pages/PropPanel.vue'

export default {
  components: {
    MenuPanel,
    PropPanel
  },

  data: () => ({
    leftOpen: false,
    rightOpen: false,
    title: ''
  }),

  computed: {
    darkIcon() {
      return this.$q.dark.isActive ? 'brightness_2' : 'brightness_5'
    },
    drawerBgColor() {
      return this.$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'
    }
  },

  methods: {
    updateTitle(route) {
      const plus = plusList.find(i => i.to === route.path)
      this.title = plus ? `${plus.title}（${plus.caption}）` : ''
    }
  },

  mounted() {
    this.$router.beforeEach((to, from, next) => {
      this.updateTitle(to)
      next()
    })
    this.updateTitle(this.$route)
  }
}
</script>
