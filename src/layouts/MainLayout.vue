<template>
  <q-layout view="lHh LpR fff">
    <q-header elevated>
      <q-toolbar class="q-pr-xs">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftOpen = !leftOpen" />
        <q-toolbar-title>{{ title }} <span class="text-subtitle1">v0.0.3</span></q-toolbar-title>
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
        <q-btn flat dense size="sm" label="联系作者" icon="email" type="a" href="mailto:ficitony@qq.com">
          <q-tooltip>ficitony@qq.com</q-tooltip>
        </q-btn>
        <div class="q-ml-md">Quasar v{{ $q.version }}</div>
        <q-btn class="q-ml-xs" flat round icon="more_vert">
          <q-menu auto-close>
            <q-list style="width: 160px">
              <q-item clickable @click="$q.dark.toggle()">
                <q-item-section avatar>
                  <q-icon :name="!$q.dark.isActive ? 'brightness_2' : 'brightness_5'" />
                </q-item-section>
                <q-item-section>{{ !$q.dark.isActive ? '暗色模式' : '亮色模式' }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="rightOpen = !rightOpen">
                <q-item-section avatar>
                  <q-icon :name="rightOpen ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>
                <q-item-section>属性栏</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <my-drawer v-model="leftOpen" show-if-above bordered elevated :content-class="drawerBgColor" :width="200" :limits="[150, 300]">
      <MenuPanel />
    </my-drawer>

    <my-drawer v-model="rightOpen" side="right" :breakpoint="700" bordered :content-class="drawerBgColor" :width="300" :limits="[200, 500]">
      <PropPanel @close="propPanelClose" />
    </my-drawer>

    <q-page-container>
      <ComponentSelector />
      <router-view ref="page" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { pageList, plusList } from 'components/menu.js'
import MenuPanel from 'pages/MenuPanel.vue'
import PropPanel from 'pages/PropPanel.vue'

export default {
  components: {
    MenuPanel,
    PropPanel
  },

  data: () => ({
    title: 'Quasar 组件扩展',
    leftOpen: false,
    rightOpen: true,
    pageTitle: '',
    state: {
      apiMap: {},
      selecting: false,
      selectingComponents: null,
      editingComponent: null
    }
  }),

  computed: {
    drawerBgColor() {
      return this.$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'
    }
  },

  provide() {
    return {
      state: this.state
    }
  },

  methods: {
    // 更新标题
    updateTitle(route) {
      if (route.path !== '/') {
        const page = pageList.find(i => i.to === route.path)
        if (page) {
          this.pageTitle = page.title
          document.title = `${page.title} | ${this.title}`
          return
        }
        const plus = plusList.find(i => i.to === route.path)
        if (plus) {
          this.pageTitle = `${plus.title}（${plus.caption}）`
          document.title = `${plus.caption} | ${this.title}`
          return
        }
      }
      this.pageTitle = ''
      document.title = `在线演示 | ${this.title}`
    },

    // 属性栏关闭
    propPanelClose() {
      this.rightOpen = false
      this.state.editingComponent = null
    }
  },

  mounted() {
    // 路由切换时自动更新标题
    this.$router.beforeEach((to, from, next) => {
      this.updateTitle(to)
      next()
    })
    this.updateTitle(this.$route)
  }
}
</script>
