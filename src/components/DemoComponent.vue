<template>
  <!-- 外层组件 -->
  <component :is="getComponent(true)" v-bind="makeParams(true)" @click="$emit('inspect', index)" v-if="parent && !noParent">
    <template v-for="slot in makeSlots(true)" v-slot:[slot.name]>
      <template v-for="(content, slotIndex) in slot.contents">
        <!-- 内容为序号表示第n个范例组件（若已指定index则优先取index） -->
        <DemoComponent
          no-parent
          :info="info"
          :index="index === undefined ? content : index"
          @inspect="$emit('inspect', $event)"
          :key="slotIndex"
          v-if="typeof content === 'number'"
        />

        <!-- 否则为动态构造的辅助组件 -->
        <component :is="content" :key="slotIndex" v-else />
      </template>
    </template>
  </component>

  <!-- 范例组件 -->
  <component :is="getComponent()" v-bind="makeParams()" @click="$emit('inspect', demoIndex)" :id="`${info.className}-${index}`" ref="demo" v-else>
    <template v-for="slot in makeSlots()" v-slot:[slot.name]>
      <component v-for="(content, slotIndex) in slot.contents" :is="content" :key="slotIndex" />
    </template>
  </component>
</template>

<script>
// 【组件范例】
import Vue from 'vue'
import * as quasar from 'quasar'

const QUASAR_FORMAT = /<q(-[\w-]+)[^>]*>/g

export default {
  props: {
    info: Object,
    index: Number,
    noParent: Boolean
  },

  inject: ['infoMap', 'demoMap', 'cachedComponents', 'cachedData', 'cachedParams', 'cachedSlots'],

  computed: {
    // 范例信息
    demo() {
      return (this.info.demos && this.info.demos[this.index]) || {}
    },

    // 外层组件
    parent() {
      return this.demo.parent || this.info.parent
    },

    // 范例编号
    demoIndex() {
      return this.index + '-' + this.$vnode.key
    }
  },

  methods: {
    // 获取缓存名称
    getCacheName(isFrame) {
      return this.info.className + (isFrame ? '-frame' : '') + (this.index === undefined ? '' : '-' + this.index) + '-' + this.$vnode.key
    },

    // 获取Quasar组件
    getComponent(isFrame) {
      const cacheName = this.getCacheName(isFrame)
      if (this.cachedComponents[cacheName]) {
        return this.cachedComponents[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let info = this.info
      let frameData, frameBinds, customClass, customData, customBinds
      if (isFrame) {
        frameData = info.demoFrameData
        frameBinds = info.demoFrameBinds
        info = this.infoMap[this.parent] || { className: this.parent }
        customData = this.demo.demoFrameData
        customBinds = this.demo.demoFrameBinds
      } else {
        customClass = this.demo.demoClass
        customData = this.demo.demoData
        customBinds = this.demo.demoBinds
      }
      let component = quasar[customClass || info.className] || { template: `<${this.parent}><slot/></${this.parent}>` }

      // 若有数据或绑定，则动态构造一个扩展组件，并把数据和绑定带进去
      if (!this.$isEmpty(info.demoData) || !this.$isEmpty(frameData) || !this.$isEmpty(customData) || info.demoBinds || frameBinds || customBinds) {
        component = {
          extends: component,
          data: () => {
            if (this.cachedData[cacheName]) {
              return this.cachedData[cacheName]
            }
            const data = quasar.extend(true, {}, info.demoData, frameData, customData)
            this.cachedData[cacheName] = data
            return data
          },
          provide() {
            return {
              [isFrame ? '$frame' : '$self']: this // 提供依赖给子组件或插槽模板用
            }
          },
          inject: {
            $frame: { default: null } // 注入外层组件依赖
          }
        }

        // 添加属性绑定
        const binds = Object.assign({}, info.demoBinds, frameBinds, customBinds)
        const bindProps = Object.keys(binds)
        if (bindProps.length > 0) {
          component.watch = {}
          const params = this.cachedParams
          bindProps.forEach(name => {
            component.watch[binds[name]] = {
              handler: val => {
                params[cacheName][name] = val
              },
              immediate: true
            }
            // 反向绑定
            component.watch[name] = function (val) {
              const names = binds[name].split('.')
              let obj = this
              while (names.length > 1) {
                obj = obj[names.shift()]
              }
              obj[names[0]] = val
            }
          })
          // 添加事件处理
          component.created = function () {
            const modelName = (this.$options.model || {}).prop || 'value'
            bindProps.forEach(name => {
              let event
              if (name === modelName) {
                event = (this.$options.model || {}).event || 'input'
              } else {
                event = 'update:' + name
              }
              this.$on(event, val => {
                params[cacheName][name] = val
              })
            })
          }
        }
      }

      this.cachedComponents[cacheName] = component
      return component
    },

    // 自动生成组件参数表
    makeParams(isFrame) {
      const cacheName = this.getCacheName(isFrame)
      if (this.cachedParams[cacheName]) {
        return this.cachedParams[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let info = this.info
      let frameProps, frameBinds, customProps, customBinds
      if (isFrame) {
        frameProps = info.demoFrameProps
        frameBinds = info.demoFrameBinds
        info = this.infoMap[this.parent] || { className: this.parent }
        customProps = this.demo.demoFrameProps
        customBinds = this.demo.demoFrameBinds
      } else {
        customProps = this.demo.demoProps || this.demo
        customBinds = this.demo.demoBinds
      }
      const params = quasar.extend(true, {}, info.demoProps, frameProps, customProps)
      const binds = Object.assign({}, info.demoBinds, frameBinds, customBinds)

      // 遍历属性定义表，查找必填属性，并自动设置初始值
      const props = (quasar[info.className] && quasar[info.className].options.props) || {}
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

      // 参数表转为响应式，以便能动态修改
      const reactiveParams = Vue.observable(params)
      this.cachedParams[cacheName] = reactiveParams
      return reactiveParams
    },

    // 自动生成插槽列表
    makeSlots(isFrame) {
      const cacheName = this.getCacheName(isFrame)
      if (this.cachedSlots[cacheName]) {
        return this.cachedSlots[cacheName]
      }

      // 若指定所属框架，则取框架组件信息
      let info = this.info
      let frameSlots, customSlots
      if (isFrame) {
        frameSlots = this.normalizeDemoSlots(info.demoFrameSlots || 0)
        info = this.infoMap[this.parent] || { className: this.parent }
        customSlots = this.normalizeDemoSlots(this.demo.demoFrameSlots)
      } else {
        customSlots = this.normalizeDemoSlots(this.demo.demoSlots)
      }
      const demoSlots = this.normalizeDemoSlots(info.demoSlots)
      const slotList = []

      // 若有指定插槽模板，则采用插槽模板生成插槽内容组件
      if (demoSlots || frameSlots || customSlots) {
        const slots = Object.assign({}, demoSlots, frameSlots, customSlots)

        Object.keys(slots).forEach(name => {
          let templates = slots[name]
          if (templates === null) return
          if (!(templates instanceof Array)) {
            templates = [templates] // 可为模板字符串或数组，统一转为数组来处理
          }
          slotList.push({
            name,
            contents: templates.map((template, index) => {
              let tag = ''
              if (isFrame && typeof template === 'number') {
                return template // 模板为序号表示插入第n个范例组件（仅用于框架插槽定义）
              } else if (typeof template === 'object') {
                tag = template.tag // 可手动指定插槽元素名称标记，以解决一些特殊需求
                template = template.template
              }
              return {
                name: `${info.className}-${name}-${index}` + tag,
                template: template.charAt(0) === '<' ? template : `<div>${template}</div>`,
                components: this.searchUsedComponents(template),
                inject: {
                  $frame: { default: null }, // 注入外层组件和范例组件依赖
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
              template: `<div>${this.demo.demoName || info.name}</div>`
            }
          ]
        })
      }

      this.cachedSlots[cacheName] = slotList
      return slotList
    },

    // 矫正范例插槽定义
    normalizeDemoSlots(slots) {
      if (slots == null) return
      if (typeof slots === 'object' && !(slots instanceof Array)) return slots
      return { default: slots }
    },

    // 查找模板中用到的Quasar组件
    searchUsedComponents(template) {
      const components = {}
      Array(...template.matchAll(QUASAR_FORMAT)).forEach(block => {
        const className = 'Q' + this.$toCamelCase(block[1])
        components[className] = quasar[className]
      })
      return components
    }
  },

  mounted() {
    // 记录范例
    if (this.$refs.demo) {
      let demos = this.demoMap[this.info.className]
      if (!demos) {
        this.demoMap[this.info.className] = demos = {}
      }
      demos[this.index] = this.$refs.demo
      demos[this.demoIndex] = this.$refs.demo
    }
  }
}
</script>
