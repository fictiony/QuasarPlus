<template>
  <q-page padding class="column">
    <q-toolbar class="q-pa-none" style="padding-bottom: 10px">
      <q-btn-dropdown class="q-mr-sm" style="width: 120px" glossy auto-close color="primary" align="between" :label="categoryLabel">
        <q-list dense>
          <q-item v-for="(option, index) in categoryOptions" :key="index" clickable @click="selectCategory(option.value)">
            <q-item-section>{{ option.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-input
        style="width: 240px"
        dense
        outlined
        clearable
        v-model="searchWord"
        placeholder="输入名称或类名搜索"
        :debounce="0"
        @input="searchMenu = !!searchWord"
      >
        <template #prepend>
          <q-icon name="search" id="search" />
        </template>
      </q-input>
      <q-menu no-focus auto-close target="#search" :offset="[12, 8]" v-model="searchMenu">
        <q-list style="min-width: 240px" dense>
          <q-item clickable v-for="(info, index) in filteredComponents" :key="index" @click="searchWord = info.className">
            <q-item-section>{{ info.className }}（{{ info.name }}）</q-item-section>
          </q-item>
          <q-item class="text-grey" key="_" v-if="!filteredComponents.length">
            <q-item-section>没有匹配的组件</q-item-section>
          </q-item>
        </q-list>
      </q-menu>

      <q-space />

      <q-toggle style="min-width: 90px" label="范例" v-model="showDemos" />
      <q-btn style="margin-right: -10px" flat round icon="fullscreen" color="primary" @click="fullscreen = true">
        <q-tooltip>全屏显示</q-tooltip>
      </q-btn>
    </q-toolbar>

    <q-table
      flat
      bordered
      class="_components q-space"
      :style="fullscreen ? 'overflow: hidden' : 'width: 100%; height: 100px'"
      :table-header-class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-4'"
      :fullscreen="fullscreen"
      no-results-label="没有匹配的组件"
      rows-per-page-label="每页条数"
      :rows-per-page-options="[5, 10, 20, 30, 50, 0]"
      :pagination-label="(first, last, total) => `第 ${first} ~ ${last} 条 （共 ${total} 条）`"
      :pagination="{ rowsPerPage: 20 }"
      :columns="tableColumns"
      :data="quasarComponents"
      :filter="category || realSearchWord"
      :filter-method="filterComponents"
    >
      <template #top>
        <q-toolbar style="min-height: 32px" v-if="fullscreen">
          <q-toolbar-title class="text-center">Quasar 组件清单</q-toolbar-title>
          <q-btn flat round style="margin: -5px" icon="fullscreen_exit" color="primary" @click="fullscreen = false">
            <q-tooltip>退出全屏</q-tooltip>
          </q-btn>
        </q-toolbar>
      </template>

      <template #body-cell-api="{ row }">
        <q-td class="text-center" style="max-width: 40px; padding: 0px">
          <q-btn
            round
            flat
            dense
            text-color="primary"
            icon="menu_book"
            type="a"
            target="_blank"
            :href="(inspect.getDocUrl && inspect.getDocUrl(row.className)) || row.doc"
            v-if="row.doc"
          />
          <template v-else>无</template>
        </q-td>
      </template>

      <template #body-cell-demos="props">
        <q-td style="width: 75%; min-width: 200px; white-space: normal" v-bind="props" @click="inspectDemo(props.row)" :key="props.row.className">
          <template v-if="['directive', 'plugin'].includes(props.row.category)"> 暂无 </template>

          <template v-else>
            <div class="row items-center q-mb-sm text-grey" v-if="props.row.incomplete">
              <q-icon class="q-mr-xs" name="error" color="red" size="20px" />
              本组件范例尚未完成
            </div>

            <!-- 带外框容器 -->
            <q-card flat bordered :style="{ minHeight: props.row.frame + 'px', ...props.row.frameStyles }" v-if="props.row.frame" v-show="showDemos">
              <!-- 若含外层组件，则创建公共外层组件 -->
              <DemoComponent :info="props.row" @inspect="inspectDemo(props.row, $event)" v-if="props.row.parent" />

              <!-- 否则直接创建范例组件（不含外层组件） -->
              <DemoComponent
                v-for="index in props.row.demos ? props.row.demos.length : 1"
                :key="index"
                :info="props.row"
                :index="index - 1"
                @inspect="inspectDemo(props.row, $event)"
                v-else
              />
            </q-card>

            <!-- 无外框，则依次创建带独立外层组件的范例组件，并加入间距 -->
            <div class="row items-center q-gutter-md" v-else v-show="showDemos">
              <DemoComponent
                v-for="index in props.row.demos ? props.row.demos.length : 1"
                :key="index"
                :info="props.row"
                :index="index - 1"
                @inspect="inspectDemo(props.row, $event)"
              />
            </div>

            <!-- 范例占位符，用于不看范例时显示 -->
            <div class="row items-center" v-show="!showDemos">
              <q-chip
                v-for="index in props.row.demos ? props.row.demos.length : 1"
                :key="index"
                clickable
                icon="bubble_chart"
                :label="getDemoName(props.row, index - 1)"
                @click.stop="inspectDemo(props.row, index - 1)"
              />
            </div>

            <!-- 范例提示 -->
            <template v-if="props.row.demoTips">
              <q-tooltip v-for="index in props.row.demos ? props.row.demos.length : 1" :key="index" :target="`#${props.row.className}-${index - 1}`">
                {{ getDemoName(props.row, index - 1) }}
              </q-tooltip>
            </template>

            <!-- 组件限制 -->
            <div class="row items-center q-mt-xs text-grey" v-if="props.row.isPart">
              <q-icon class="q-mr-xs" name="warning" color="warning" size="20px" />
              本组件只能用于 {{ props.row.isPart }} 组件内部
            </div>
          </template>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// 【Quasar 组件清单】
import quasarApi from 'components/api/Quasar.json'
import { inspect } from 'components/thirdparty/inspect'

// 分类
const CATEGORIES = [
  { label: '所有组件', value: '' },
  { label: '基本组件', name: '基本', value: 'basic' },
  { label: '容器组件', name: '容器', value: 'container' },
  { label: '表单组件', name: '表单', value: 'form' },
  { label: '工具组件', name: '工具', value: 'tool' },
  { label: '其他组件', name: '其他', value: 'other' },
  { label: '扩展指令', name: '指令', value: 'directive' },
  { label: '扩展插件', name: '插件', value: 'plugin' }
]

export default {
  data: vm => ({
    inspect,

    searchWord: null, // 搜索词
    searchMenu: false, // 搜索提示菜单是否显示

    categoryOptions: CATEGORIES, // 分类选项表
    category: vm.getRouteCategory(), // 当前分类

    showDemos: true, // 是否显示范例
    fullscreen: false, // 是否全屏

    // 表格列定义
    tableColumns: [
      {
        name: 'category',
        label: '分类',
        field: row => vm.getCategoryName(row.category)
      },
      {
        name: 'name',
        label: '名称',
        field: 'name',
        align: 'left',
        sortable: true,
        style: 'min-width: 50px; max-width: 200px; padding-right: 0px'
      },
      {
        name: 'className',
        label: '类名',
        field: 'className',
        align: 'left',
        sortable: true,
        style: 'min-width: 50px; max-width: 200px; padding-right: 0px'
      },
      {
        name: 'api',
        label: 'API'
      },
      {
        name: 'demos',
        label: '范例'
      }
    ],

    // Quasar组件信息列表
    quasarComponents: Object.freeze(
      Object.keys(quasarApi).map(className =>
        Object.freeze({
          className,
          ...quasarApi[className]
        })
      )
    ),

    demoMap: {}, // 组件范例记录表：{ 类名: { 范例序号[-插槽序号]: 范例 } }
    cachedComponents: {}, // 组件定义缓存：{ 类名[-frame][-范例序号]: 组件定义 }
    cachedData: {}, // 组件数据缓存：{ 类名[-frame][-范例序号]: 组件数据 }
    cachedParams: {}, // 组件参数缓存：{ 类名[-frame][-范例序号]: 组件参数表 }
    cachedSlots: {} // 组件插槽缓存：{ 类名[-frame][-范例序号]: 组件插槽列表 }
  }),

  provide() {
    return {
      infoMap: this.infoMap,
      demoMap: this.demoMap,
      cachedComponents: this.cachedComponents,
      cachedData: this.cachedData,
      cachedParams: this.cachedParams,
      cachedSlots: this.cachedSlots
    }
  },

  computed: {
    // 当前分类标题
    categoryLabel() {
      const category = CATEGORIES.find(i => i.value === this.category)
      return (category && category.label) || '未知'
    },

    // 筛选后的组件信息列表
    filteredComponents() {
      return Object.freeze(this.quasarComponents.filter(info => this.matchFilter(info)).sortBy('className'))
    },

    // 处理后的实际搜索词
    realSearchWord() {
      return (this.searchWord || '').trim().toLowerCase()
    },

    // 组件信息检索表
    infoMap() {
      return Object.freeze(this.quasarComponents.toMap('className'))
    }
  },

  watch: {
    $route() {
      this.category = this.getRouteCategory()
    }
  },

  methods: {
    // 获取当前路由分类
    getRouteCategory() {
      const category = CATEGORIES.find(i => i.value === this.$route.params.category)
      return category ? category.value : ''
    },

    // 选择分类
    selectCategory(category) {
      this.category = category
      if (category !== (this.$route.params.category || '')) {
        this.$router.replace(`/QuasarComponents/${category}`)
      }
    },

    // 获取分类名称
    getCategoryName(category) {
      if (!category) return '其他'
      if (category instanceof Array) {
        return category.map(this.getCategoryName).join('|')
      }
      category = CATEGORIES.find(i => i.value === category)
      return (category && category.name) || '未知'
    },

    // 判断是否满足筛选条件
    matchFilter(info) {
      if (this.category) {
        if (this.category === 'other') {
          if (info.category) return false
        } else if (info.category instanceof Array) {
          if (!info.category.includes(this.category)) return false
        } else {
          if (info.category !== this.category) return false
        }
      }
      if (this.realSearchWord) {
        if (info.className.toLowerCase().includes(this.realSearchWord)) return true
        if (info.name.toLowerCase().includes(this.realSearchWord)) return true
        return false
      }
      return true
    },

    // 筛选组件列表
    filterComponents(list) {
      return list.filter(info => this.matchFilter(info))
    },

    // 获取范例名称
    getDemoName(info, index) {
      const demo = (info.demos && info.demos[index]) || {}
      return demo.demoName || `${demo.demoClass || info.name}范例${info.demos ? index + 1 : ''}`
    },

    // 查看组件范例属性
    inspectDemo(info, demoIndex) {
      const demos = this.demoMap[info.className] || {}
      if (demoIndex === undefined && inspect.target) {
        // 若当前已有选中的范例，则忽略选中默认范例的操作
        if (Object.values(demos).includes(inspect.target)) return
      }
      inspect.target = demos[demoIndex || 0] || info
    }
  }
}
</script>

<style lang="scss" scoped>
._components {
  ::v-deep > div > table > thead > tr {
    height: 20px;
    > th {
      font-size: 13px;
      font-weight: 700;
      text-align: center;
      position: sticky;
      z-index: 1;
      top: 0;
    }
  }
  ::v-deep > .q-table__top {
    padding: 0px;
  }
  ::v-deep > .q-table__bottom {
    height: 40px;
    min-height: 40px;
    padding: 0px 10px 0px 10px;
  }
}
</style>
