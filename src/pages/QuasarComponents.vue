<template>
  <q-page padding>
    <q-markup-table class="_components">
      <thead :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-4'">
        <tr>
          <th class="_name">组件</th>
          <th class="_classname">类名</th>
          <th class="_doc">API</th>
          <th class="_example">范例</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(info, index) in quasarComponents" :key="info.className">
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
                v-for="(demo, demoIndex) in info.demos || [undefined]"
                :class="demoIndex > 0 ? 'q-ml-md' : ''"
                @click.stop="inspectDemo(index, demoIndex)"
                :key="`demo-${index}-${demoIndex}`"
              >
                <component :is="getComponent(info)" v-bind="makeParams(info, false, demo)" :ref="`demo-${index}`">
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
    quasarComponents: Object.keys(quasarApi)
      .map(className => ({
        className,
        ...quasarApi[className]
      }))
      .filter(i => !i.isPart)
  }),

  inject: ['state'],

  methods: {
    // 获取Quasar组件
    getComponent(info, isFrame) {
      return quasar[(isFrame ? info.frameClass : null) || info.className]
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
      const component = quasar[info.className]
      const params = quasar.extend(true, {}, info.demoProps, frameProps, customProps ? customProps.demoProps || customProps : undefined)

      // 遍历属性定义表，查找必填属性，并自动设置初始值
      Object.keys(component.options.props).forEach(name => {
        if (name in params) return
        const prop = component.options.props[name]
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
