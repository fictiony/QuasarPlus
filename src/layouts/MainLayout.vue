<template>
  <q-layout view="lHh LpR lfr" ref="layout">
    <q-header elevated>
      <q-toolbar class="q-pr-xs">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftOpen = !leftOpen" />

        <q-toolbar-title v-show="subTitleShow || !pageTitle">
          {{ title }}
          <span class="text-subtitle1">v{{ version }}</span>
        </q-toolbar-title>
        <q-toolbar-title v-show="pageTitle">
          {{ pageTitle }}
        </q-toolbar-title>

        <div class="row items-center" v-show="subTitleShow">
          <q-btn flat dense size="sm" label="联系站长" icon="email" type="a" href="mailto:ficitony@qq.com">
            <q-tooltip>ficitony@qq.com</q-tooltip>
          </q-btn>
          <div class="q-ml-md">Quasar v{{ $q.version }}</div>
        </div>

        <q-btn class="q-ml-xs" flat round icon="more_vert">
          <q-menu auto-close>
            <q-list style="width: 160px">
              <q-item clickable @click="rightOpen = !rightOpen">
                <q-item-section class="_icon" avatar>
                  <q-icon :name="rightOpen ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>
                <q-item-section>属性栏</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-for="lang in Object.keys(API_LANG)" :key="lang" clickable @click="setApiLang(lang)">
                <q-item-section class="_icon" avatar>
                  <q-icon :name="apiLang === lang ? 'done' : ''" />
                </q-item-section>
                <q-item-section>{{ lang }} API</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable @click="toggleDark">
                <q-item-section class="_icon" avatar>
                  <q-icon :name="!$q.dark.isActive ? 'brightness_2' : 'brightness_5'" />
                </q-item-section>
                <q-item-section>{{ !$q.dark.isActive ? '暗色模式' : '亮色模式' }}</q-item-section>
              </q-item>
              <q-item clickable tag="a" href="mailto:ficitony@qq.com">
                <q-item-section class="_icon" avatar>
                  <q-icon name="email" />
                </q-item-section>
                <q-item-section>联系站长</q-item-section>
              </q-item>
              <q-separator />
              <q-item dense disable>
                <q-item-section>Quasar v{{ $q.version }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-footer class="q-pa-sm bg-transparent text-primary row justify-center" bordered>
      {{ name }}
      <div class="q-px-sm">|</div>
      <q-btn flat dense size="sm" label="MIT LICENSE" type="a" href="https://gitee.com/fictiony/quasar-plus/blob/master/LICENSE" target="_blank" />
      <div class="q-px-sm">|</div>
      <q-btn flat dense size="sm" label="浙ICP备2021015824号-1" type="a" href="https://beian.miit.gov.cn/" target="_blank" />
      <div class="q-px-sm">|</div>
      <q-btn flat dense size="sm" label="联系站长" type="a" href="mailto:ficitony@qq.com" />
    </q-footer>

    <my-drawer v-model="leftOpen" show-if-above bordered elevated :content-class="drawerBgColor" :width="200" :limits="[150, 300]">
      <MenuPanel />
    </my-drawer>

    <my-drawer ref="rightDrawer" v-model="rightOpen" side="right" show-if-above :breakpoint="720" bordered :width="300" :limits="[200, 500]">
      <PropPanel @close="propPanelClose" />
    </my-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// 【主框架】
import { PAGE_LIST, PLUS_LIST, API_LANG } from 'boot/menu.js'
import MenuPanel from 'pages/MenuPanel.vue'
import { inspect, PropPanel } from 'components/thirdparty/inspect'
import quasarApi from 'components/api/Quasar.json'
import * as plusComponents from 'components/plus'
import cfg from '../../package.json'

const QUASAR_EXTRA_API = {
  QRibbon: import('@quasar/quasar-ui-qribbon/dist/api/QRibbon.json'),
  QMarkdown: import('@quasar/quasar-ui-qmarkdown/dist/api/QMarkdown.json')
}

export default {
  components: {
    MenuPanel,
    PropPanel
  },

  data: () => ({
    API_LANG,
    inspect,
    name: cfg.productName,
    title: cfg.description,
    version: cfg.version,
    leftOpen: false,
    rightOpen: false,
    pageTitle: '',
    apiLang: ''
  }),

  computed: {
    // 副标题是否显示
    subTitleShow() {
      return this.$refs.layout && this.$refs.layout.totalWidth > 720
    },

    // 侧滑栏背景色
    drawerBgColor() {
      return this.$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-1'
    }
  },

  watch: {
    $route: {
      handler: 'updateTitle',
      immediate: true
    },

    // 小屏下选择时自动隐藏属性栏
    'inspect.selecting'(val) {
      if (!this.$refs.rightDrawer.belowBreakpoint) return
      this.rightOpen = !val
    }
  },

  methods: {
    // 设置API语言
    setApiLang(lang) {
      this.apiLang = lang
      this.$saveConfig('apiLang', lang)

      // 切换API
      Object.keys(quasarApi)
        .filter(i => !QUASAR_EXTRA_API[i])
        .forEach(name => {
          inspect.extraApi[name] = lang === '中文' ? import('components/api/' + name + '.json') : import('quasar/dist/api/' + name + '.json')
          delete inspect.apiCache[name]
        })

      // 清除监视器当前目标，不然语言不会刷新
      inspect.target = null
    },

    // 切换暗色模式
    toggleDark() {
      this.$q.dark.toggle()
      this.$saveConfig('dark', this.$q.dark.isActive)
    },

    // 更新标题
    updateTitle(route) {
      if (route.path !== '/') {
        const page = PAGE_LIST.find(i => i.to === '/' + route.path.split('/')[1])
        if (page) {
          this.pageTitle = page.title
          document.title = `${page.title} | ${this.title}`
          return
        }
        const plus = PLUS_LIST.find(i => i.to === route.path)
        if (plus) {
          this.pageTitle = `${plus.title}（${plus.caption}）`
          document.title = `${plus.caption} | ${this.title}`
          return
        }
      }
      this.pageTitle = ''
      document.title = `在线演示 | ${this.title}`
    },

    // 手动关闭属性栏
    propPanelClose() {
      this.rightOpen = false
      inspect.target = null
    }
  },

  mounted() {
    this._computedWatchers.subTitleShow.update() // 强制重算

    // 读取配置
    this.apiLang = this.$loadConfig('apiLang') || '中文'
    this.$q.dark.isActive = this.$loadConfig('dark') || false

    // 定位API网址
    inspect.getDocUrl = className => {
      const api = quasarApi[className]
      if (api && api.doc) {
        return api.doc.replace('https://quasar.dev', API_LANG[this.apiLang])
      }
    }

    // 添加额外API文档
    Object.assign(inspect.extraApi, {
      ...Object.fromEntries([
        ...Object.keys(quasarApi)
          .filter(i => !QUASAR_EXTRA_API[i])
          .map(name => [name, this.apiLang === '中文' ? import('components/api/' + name + '.json') : import('quasar/dist/api/' + name + '.json')]),
        ...Object.keys(plusComponents).map(name => [name, import('components/api/' + name + '.json')])
      ]),
      ...QUASAR_EXTRA_API
    })

    // 不隐藏关闭按钮
    inspect.hideClose = false
  }
}
</script>

<style lang="scss" scoped>
._icon {
  min-width: 32px;
  padding: 0px;
  margin-left: -2px;
}
</style>
