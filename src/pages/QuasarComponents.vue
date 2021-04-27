<template>
  <q-page style="padding: 70px 20px 50px 20px">
    <q-markup-table class="_components" flat bordered>
      <thead :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-4'">
        <tr>
          <th class="_name">组件名</th>
          <th class="_classname">类名</th>
          <th class="_doc">API</th>
          <th class="_example">范例</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(info, index) in sortType ? sortedComponents : quasarComponents" :key="info.className" v-show="matchFilter(info)">
          <td class="_name">{{ info.name }}</td>
          <td class="_classname">
            <a>{{ info.className }}</a>
          </td>
          <td class="_doc text-center">
            <q-btn round flat dense text-color="primary" icon="menu_book" type="a" target="_blank" :href="info.doc" v-if="info.doc" />
          </td>
          <td class="_example" @click="inspectDemo(index)">
            <q-card flat bordered :style="{ minHeight: info.frame + 'px' }" v-if="info.frame">
              <component :is="getComponent(info, true)" v-bind="makeParams(info, true)" v-if="info.frameClass">
                <template v-for="slot in makeSlots(info, true)" v-slot:[slot.name]>
                  <template v-for="content in slot.contents">
                    <component :is="getComponent(info)" v-bind="makeParams(info)" :key="content" :ref="`demo-${index}`" v-if="!content.name">
                      <template v-for="slot in makeSlots(info)" v-slot:[slot.name]>
                        <component v-for="content in slot.contents" :is="content" :key="content.name" />
                      </template>
                    </component>
                    <component :is="content" :key="content.name" v-else />
                  </template>
                </template>
              </component>
              <component :is="getComponent(info)" v-bind="makeParams(info)" :ref="`demo-${index}`" v-else>
                <template v-for="slot in makeSlots(info)" v-slot:[slot.name]>
                  <component v-for="content in slot.contents" :is="content" :key="content.name" />
                </template>
              </component>
            </q-card>
            <div class="row items-center" v-else>
              <div
                v-for="(demo, demoIndex) in info.demos || [{}]"
                :class="demoIndex > 0 ? 'q-ml-md' : ''"
                @click.stop="inspectDemo(index, demoIndex)"
                :key="`demo-${index}-${demoIndex}`"
              >
                <component
                  :is="getComponent(info, false, demo.demoClass)"
                  v-bind="makeParams(info, false, demo.demoProps || demo)"
                  :ref="`demo-${index}`"
                >
                  <template v-for="slot in makeSlots(info, false, demo.demoSlots)" v-slot:[slot.name]>
                    <component v-for="content in slot.contents" :is="content" :key="content.name" />
                  </template>
                </component>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-page-sticky position="top" expand>
      <q-toolbar class="shadow-3 q-py-sm" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-white'">
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
          <q-list dense style="min-width: 240px">
            <q-item clickable v-for="(info, index) in filteredComponents" :key="index" @click="searchWord = info.className">
              <q-item-section>{{ info.className }}（{{ info.name }}）</q-item-section>
            </q-item>
            <q-item class="text-grey" key="_" v-if="!filteredComponents.length">
              <q-item-section>没有匹配的组件</q-item-section>
            </q-item>
          </q-list>
        </q-menu>

        <q-space />
        <q-btn-dropdown glossy color="primary" :label="categoryOptions.find(i => i.value === category).label">
          <q-list dense>
            <q-item v-for="(option, index) in categoryOptions" :key="index" clickable v-close-popup @click="category = option.value">
              <q-item-section>{{ option.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-toggle class="q-ml-sm" glossy toggle-color="primary" v-model="sortType" :options="sortTypeOptions" />
      </q-toolbar>
    </q-page-sticky>

    <q-page-scroller position="bottom-right" :scroll-offset="400" :offset="[10, 10]" :duration="100">
      <q-btn round color="primary" icon="arrow_upward" glossy />
      <q-tooltip anchor="center left" self="center right">返回顶部</q-tooltip>
    </q-page-scroller>
  </q-page>
</template>

<script>
// 【Quasar 组件清单】
import quasarApi from 'components/api/Quasar.json'
import * as quasar from 'quasar'

const QUASAR_FORMAT = /<q(-[\w-]+)[^>]*>/g
const toCamelCase = str => str.replace(/-\w/g, m => m[1].toUpperCase())

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
    category: 'basic',
    sortTypeOptions: [
      { label: '原顺序', value: '' },
      { label: 'A~Z', value: 'alphabet' }
    ],
    sortType: '',
    quasarComponents: Object.freeze(
      Object.keys(quasarApi)
        .filter(i => !quasarApi[i].isPart)
        .map(i => ({
          className: i,
          ...quasarApi[i]
        }))
    )
  }),

  inject: ['state'],

  computed: {
    // 排序后的组件信息列表
    sortedComponents() {
      return Object.freeze(
        this.quasarComponents.slice().sort((a, b) => {
          return a.className < b.className ? -1 : 1
        })
      )
    },

    // 筛选后的组件信息列表
    filteredComponents() {
      return this.sortedComponents.filter(i => this.matchFilter(i))
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

    // 获取Quasar组件
    getComponent(info, isFrame, demoClass) {
      const className = demoClass || (isFrame ? info.frameClass : null) || info.className
      const component = quasar[className]
      // if ()
      // data: () => quasar.extend(true, {}, data[name])
      return component
    },

    // 自动生成组件参数表
    makeParams(info, isFrame, customProps) {
      let frameProps
      if (isFrame && info.frameClass) {
        // 若指定所属框架，则取框架组件信息
        frameProps = info.demoFrameProps
        info = this.quasarComponents.find(i => i.className === info.frameClass)
        if (!info) return {}
      }
      const params = quasar.extend(true, {}, info.demoProps, frameProps, customProps)

      // 遍历属性定义表，查找必填属性，并自动设置初始值
      const props = quasar[info.className].options.props || {}
      Object.keys(props).forEach(name => {
        if (name in params) return
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

      return params
    },

    // 自动生成插槽列表
    makeSlots(info, isFrame, customSlots) {
      let frameSlots, frameData
      if (isFrame && info.frameClass) {
        // 若指定所属框架，则取框架组件信息
        frameSlots = info.demoFrameSlots
        frameData = info.demoFrameData
        info = this.quasarComponents.find(i => i.className === info.frameClass)
        if (!info) return []
      }

      // 若有指定插槽模板，则采用插槽模板生成插槽内容组件
      if (info.demoSlots || frameSlots || customSlots) {
        const slots = quasar.extend({}, info.demoSlots, frameSlots, customSlots)
        const data = quasar.extend({}, info.demoData, frameData)
        const slotList = []

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
                data: () => quasar.extend(true, {}, data[name])
              }
            })
          })
        })

        return slotList
      }

      // 若无指定，则默认采用组件名称为插槽内容
      return [
        {
          name: 'default',
          contents: [
            {
              name: `${info.className}-default`,
              template: `<div>${info.name}</div>`
            }
          ]
        }
      ]
    },

    // 查找模板中用到的组件
    searchUsedComponents(template) {
      const components = {}
      Array(...template.matchAll(QUASAR_FORMAT)).forEach(block => {
        const className = 'Q' + toCamelCase(block[1])
        components[className] = quasar[className]
      })
      return components
    },

    // 查看范例属性
    inspectDemo(index, demoIndex = 0) {
      this.state.editingComponent = this.$refs[`demo-${index}`][demoIndex]
    }
  }
}
</script>

<style lang="scss" scoped>
._components {
  thead tr {
    height: 20px;
    th {
      font-size: 13px;
      font-weight: 700;
    }
  }
  th,
  td {
    &._name {
      min-width: 100px;
      max-width: 200px;
    }
    &._classname {
      min-width: 100px;
      max-width: 200px;
    }
    &._doc {
      max-width: 40px;
      padding: 0px;
    }
    &._example {
      width: 75%;
      min-width: 200px;
    }
  }
}
</style>
