<template>
  <q-page padding class="column">
    <q-toolbar class="q-pa-none" style="padding-bottom: 10px">
      <q-btn-dropdown class="q-mr-sm" glossy auto-close color="primary" :label="categoryOptions.find(i => i.value === category).label">
        <q-list dense>
          <q-item v-for="(option, index) in categoryOptions" :key="index" clickable @click="category = option.value">
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
        placeholder="输入组件名或类名搜索"
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
      :rows-per-page-options="[10, 20, 30, 50, 0]"
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

      <template #body-cell-api="props">
        <q-td class="text-center" style="max-width: 40px; padding: 0px" v-bind="props">
          <q-btn round flat dense text-color="primary" icon="menu_book" type="a" target="_blank" :href="props.row.doc" v-if="props.row.doc" />
          <template v-else>无</template>
        </q-td>
      </template>

      <template #body-cell-demos="props">
        <q-td style="width: 75%; min-width: 200px" v-bind="props" @click="inspectDemo(props.row)">
          <!-- 需要加外框容器 -->
          <q-card flat bordered :style="{ minHeight: props.row.frame + 'px' }" v-if="props.row.frame" v-show="showDemos">
            <!-- 若包含外层组件，则先创建外层组件 -->
            <component :is="getComponent(props.row, true)" v-bind="makeParams(props.row, true)" v-if="props.row.frameClass">
              <template v-for="slot in makeSlots(props.row, true)" v-slot:[slot.name]>
                <template v-for="content in slot.contents">
                  <component
                    :is="getComponent(props.row)"
                    v-bind="makeParams(props.row)"
                    :key="content"
                    :ref="`demo-${props.row.className}`"
                    v-if="typeof content === 'string'"
                  >
                    <!-- 内容为字符串表示当前组件 -->
                    <template v-for="slot in makeSlots(props.row)" v-slot:[slot.name]>
                      <component v-for="content in slot.contents" :is="content" :key="content.name" />
                    </template>
                  </component>

                  <!-- 否则为动态构造的辅助组件 -->
                  <component :is="content" :key="content.name" v-else />
                </template>
              </template>
            </component>

            <!-- 否则直接创建当前组件 -->
            <component :is="getComponent(props.row)" v-bind="makeParams(props.row)" :ref="`demo-${props.row.className}`" v-else>
              <template v-for="slot in makeSlots(props.row)" v-slot:[slot.name]>
                <component v-for="content in slot.contents" :is="content" :key="content.name" />
              </template>
            </component>
          </q-card>

          <!-- 无外框时可包含多个范例 -->
          <div class="row items-center" v-show="!props.row.frame || !showDemos">
            <template v-for="(demo, index) in props.row.demos || [{}]">
              <!-- 创建当前组件 -->
              <component
                :is="getComponent(props.row, false, demo.demoClass, index)"
                v-bind="makeParams(props.row, false, demo.demoProps || demo, index)"
                :ref="`demo-${props.row.className}`"
                class="q-mr-md"
                @click.stop="inspectDemo(props.row, index)"
                :key="`demo-${props.row.className}-${index}`"
                v-if="!props.row.frame"
                v-show="showDemos"
              >
                <template v-for="slot in makeSlots(props.row, false, demo.demoSlots, index)" v-slot:[slot.name]>
                  <component v-for="content in slot.contents" :is="content" :key="content.name" />
                </template>
              </component>

              <!-- 创建范例占位符，用于不看范例时显示 -->
              <q-chip
                clickable
                icon="bubble_chart"
                v-show="!showDemos"
                @click.stop="inspectDemo(props.row, index)"
                :key="`tip-${props.row.className}-${index}`"
              >
                {{ demo.demoName || props.row.demoName || `${props.row.className}范例${props.row.demos ? index + 1 : ''}` }}
              </q-chip>
            </template>
          </div>

          <div class="row items-center" v-if="props.row.isPart">
            <q-icon class="q-mr-xs" name="warning" color="warning" size="20px" />
            本组件只能用于 {{ props.row.isPart }} 组件内部
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// 【Quasar 组件清单】
import Vue from 'vue'
import * as quasar from 'quasar'
import quasarApi from 'components/api/Quasar.json'

const QUASAR_FORMAT = /<q(-[\w-]+)[^>]*>/g

export default {
  data: () => ({
    searchWord: null,
    searchMenu: false,

    categoryOptions: [
      { label: '所有组件', value: '' },
      { label: '基本组件', value: 'basic' },
      { label: '容器组件', value: 'container' },
      { label: '表单组件', value: 'form' },
      { label: '工具组件', value: 'tool' },
      { label: '其他组件', value: 'other' }
    ],
    category: '',

    showDemos: true,
    fullscreen: false,

    quasarComponents: Object.freeze(
      Object.keys(quasarApi).map(className => ({
        className,
        ...quasarApi[className]
      }))
    ),

    tableColumns: [
      {
        name: 'name',
        label: '组件名',
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

    cachedComponents: {},
    cachedParams: {},
    cachedSlots: {}
  }),

  inject: ['state'],

  computed: {
    // 筛选后的组件信息列表
    filteredComponents() {
      return Object.freeze(
        this.quasarComponents
          .filter(info => this.matchFilter(info))
          .sort((a, b) => {
            return a.className < b.className ? -1 : 1
          })
      )
    },

    // 处理后的实际搜索词
    realSearchWord() {
      return (this.searchWord || '').trim().toLowerCase()
    }
  },

  methods: {
    // 判断是否满足筛选条件
    matchFilter(info) {
      if (this.category) {
        if (this.category === 'other') {
          if (info.category) return false
        } else if (info.category instanceof Array) {
          if (info.category.indexOf(this.category) < 0) return false
        } else {
          if (info.category !== this.category) return false
        }
      }
      if (this.realSearchWord) {
        if (info.className.toLowerCase().indexOf(this.realSearchWord) >= 0) return true
        if (info.name.toLowerCase().indexOf(this.realSearchWord) >= 0) return true
        return false
      }
      return true
    },

    // 筛选组件列表
    filterComponents(rows) {
      return rows.filter(info => this.matchFilter(info))
    },

    // 获取缓存名称
    getCacheName(info, isFrame, index) {
      return info.className + (isFrame ? '-frame' : '') + (index === undefined ? '' : '-' + index)
    },

    // 获取Quasar组件
    getComponent(info, isFrame, demoClass, index) {
      const cacheName = this.getCacheName(info, isFrame, index)
      if (this.cachedComponents[cacheName]) {
        return this.cachedComponents[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let frameData, frameBinds
      if (isFrame) {
        frameData = info.demoFrameData
        frameBinds = info.demoFrameBinds
        info = this.quasarComponents.find(i => i.className === info.frameClass)
        if (!info) return {}
      }
      let component = quasar[demoClass || info.className]

      // 若有数据或绑定，则动态构造一个扩展组件，并把数据和绑定带进去
      if (!this.$isEmpty(info.demoData) || !this.$isEmpty(frameData) || info.demoBinds || frameBinds) {
        const binds = Object.assign({}, info.demoBinds, frameBinds)
        const watch = {}
        Object.keys(binds).forEach(name => {
          watch[binds[name]] = {
            immediate: true,
            handler: val => {
              this.cachedParams[cacheName][name] = val
            }
          }
          // 反向绑定
          watch[name] = function (val) {
            const names = binds[name].split('.')
            let obj = this
            while (names.length > 1) {
              obj = obj[names.shift()]
            }
            obj[names[0]] = val
          }
        })
        component = {
          extends: component,
          data: () => quasar.extend(true, {}, info.demoData, frameData),
          provide() {
            return {
              [isFrame ? '$frame' : '$self']: this
            }
          },
          inject: {
            $frame: { default: null }
          },
          watch
        }
      }

      this.cachedComponents[cacheName] = component
      return component
    },

    // 自动生成组件参数表
    makeParams(info, isFrame, customProps, index) {
      const cacheName = this.getCacheName(info, isFrame, index)
      if (this.cachedParams[cacheName]) {
        return this.cachedParams[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let frameProps, frameBinds
      if (isFrame) {
        frameProps = info.demoFrameProps
        frameBinds = info.demoFrameBinds
        info = this.quasarComponents.find(i => i.className === info.frameClass)
        if (!info) return {}
      }
      const params = quasar.extend(true, {}, info.demoProps, frameProps, customProps)
      const binds = Object.assign({}, info.demoBinds, frameBinds)

      // 遍历属性定义表，查找必填属性，并自动设置初始值
      const props = quasar[info.className].options.props || {}
      Object.keys(props).forEach(name => {
        if (name in params) return
        if (name in binds) {
          params[name] = undefined // 绑定属性自动加入参数表
        }
        const prop = props[name]
        if (!prop.required || prop.default !== undefined) return
        const types = prop.type instanceof Array ? prop.type : [prop.type || Number]
        if (types.includes(Boolean)) {
          params[name] = true
        } else if (types.includes(Number)) {
          params[name] = 50
        } else if (types.includes(String)) {
          params[name] = info.name
        }
      })

      const reactiveParams = Vue.observable(params)
      this.cachedParams[cacheName] = reactiveParams
      return reactiveParams
    },

    // 自动生成插槽列表
    makeSlots(info, isFrame, customSlots, index) {
      const cacheName = this.getCacheName(info, isFrame, index)
      if (this.cachedSlots[cacheName]) {
        return this.cachedSlots[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let frameSlots
      if (isFrame) {
        frameSlots = info.demoFrameSlots
        info = this.quasarComponents.find(i => i.className === info.frameClass)
        if (!info) return []
      }
      const slotList = []

      // 若有指定插槽模板，则采用插槽模板生成插槽内容组件
      if (info.demoSlots || frameSlots || customSlots) {
        const slots = Object.assign({}, info.demoSlots, frameSlots, customSlots)

        Object.keys(slots).forEach(name => {
          let templates = slots[name]
          if (templates === null) return
          if (!(templates instanceof Array)) {
            templates = [templates] // 可为模板字符串或数组，统一转为数组来处理
          }
          slotList.push({
            name,
            contents: templates.map((template, index) => {
              if (isFrame && template === true) {
                return `${info.className}-${name}` // 模板为true表示插入当前组件（仅用于框架插槽定义）
              }
              return {
                name: `${info.className}-${name}-${index}`,
                template: template.charAt(0) === '<' ? template : `<div>${template}</div>`,
                components: this.searchUsedComponents(template),
                inject: {
                  $frame: { default: null },
                  $self: { default: null }
                }
              }
            })
          })
        })

        // 若无指定，则默认采用组件名称为插槽内容
      } else {
        slotList.push({
          name: 'default',
          contents: [
            {
              name: `${info.className}-default`,
              template: `<div>${info.name}</div>`
            }
          ]
        })
      }

      this.cachedSlots[cacheName] = slotList
      return slotList
    },

    // 查找模板中用到的组件
    searchUsedComponents(template) {
      const components = {}
      Array(...template.matchAll(QUASAR_FORMAT)).forEach(block => {
        const className = 'Q' + this.$toCamelCase(block[1])
        components[className] = quasar[className]
      })
      return components
    },

    // 查看组件范例属性
    inspectDemo(info, index = 0) {
      const demos = this.$refs[`demo-${info.className}`]
      this.state.editingComponent = demos instanceof Array ? demos[index] : demos
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
