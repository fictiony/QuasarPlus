<template>
  <div class="fit no-scroll column">
    <q-item dense class="full-width _header">
      <q-item-section style="max-width: 24px">
        <q-btn flat dense size="sm" class="text-primary" :icon="state.selecting ? 'my_location' : 'location_searching'" @click="selectClick">
          <q-tooltip ref="selectTip">选择要查看的 Vue 组件</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section class="_toolbtn">
        <q-item-label class="text-grey-6" :lines="1">
          <span v-if="component">{{ component }} 组件参数</span>
          <span v-else>当前未选中任何组件</span>
        </q-item-label>
      </q-item-section>
      <q-item-section side class="_toolbtn" v-if="component">
        <q-btn flat dense size="sm" class="text-primary" :icon="filterProps ? 'text_rotation_none' : 'filter_alt'" @click="filterClick">
          <q-tooltip ref="filterTip">{{ filterProps ? '显示所有参数' : '仅显示有值的参数' }}</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section side class="_toolbtn" v-if="superName && superDoc">
        <q-btn flat dense size="sm" class="text-primary" icon="menu_book" type="a" target="_blank" :href="superDoc">
          <q-tooltip>查看基类 {{ superName }} 的 API 文档</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section side class="_toolbtn" v-if="apiDoc">
        <q-btn flat dense size="sm" class="text-primary" icon="menu_book" type="a" target="_blank" :href="apiDoc">
          <q-tooltip>查看 API 文档</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section side class="_toolbtn">
        <q-btn flat dense size="sm" icon="close" @click="$emit('close')" />
      </q-item-section>
    </q-item>

    <CustomScroller class="full-width q-space _proplist">
      <q-markup-table flat bordered dense>
        <thead>
          <tr>
            <th class="bg-primary text-white _prop">属性名</th>
            <th class="bg-blue-grey-5 text-white _value">属性值</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="filteredPropList.length">
            <PropItem v-for="(prop, index) in filteredPropList" :key="index" v-bind="prop" />
          </template>
          <tr v-else>
            <td colspan="2" class="text-grey-5 text-center">没有可用属性</td>
          </tr>
        </tbody>
      </q-markup-table>
    </CustomScroller>
  </div>
</template>

<script>
// 【属性栏】
import { debounce } from 'quasar'
import plusList from 'components/plusList.js'

export default {
  data: () => ({
    component: '',
    apiDoc: '',
    superName: '',
    superDoc: '',
    propList: [],
    filterProps: true
  }),

  inject: ['state'],

  computed: {
    filteredPropList() {
      return this.filterProps ? this.propList.filter(i => i.value !== undefined) : this.propList
    }
  },

  watch: {
    'state.editingComponent'(val) {
      this.propList.forEach(prop => prop.unwatch()) // 先取消原属性监视
      if (val) {
        this.component = this.$getName(val.$options)
        const api = this.state.apiMap[this.component] || {}
        this.apiDoc = api.doc
        this.superName = (val.$options.extends && this.$getName(val.$options.extends.options)) || ''
        this.superDoc = (this.state.apiMap[this.superName] || {}).doc
        this.propList = Object.keys(val.$props || {})
          .map(name => {
            return this.makePropInfo(val, name, api.props && api.props[name])
          })
          .sort((a, b) => {
            if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
            if (a.isUpdate !== b.isUpdate) return a.isUpdate ? -1 : 1
            return a.name < b.name ? -1 : 1
          })
      } else {
        this.component = ''
        this.superName = ''
        this.superDoc = ''
        this.propList = []
      }
    }
  },

  methods: {
    // 选择组件按钮点击
    selectClick() {
      this.$refs.selectTip.hide() // 解决按钮重绘时，QTooltip无法自动消失的bug
      this.state.selecting = !this.state.selecting
    },

    // 筛选属性按钮点击
    filterClick() {
      this.$refs.filterTip.hide()
      this.filterProps = !this.filterProps
    },

    // 生成一条属性信息
    makePropInfo(component, name, api) {
      if (typeof api !== 'object') {
        api = { desc: api }
      }
      const def = component.$options.props[name]
      const superOptions = component.$options.extends && component.$options.extends.options
      const superProp = superOptions && superOptions.props && superOptions.props[name]
      const extendProps = component.constructor.extendOptions.props
      const propInfo = {
        name,
        value: name in component.$options.propsData ? component.$props[name] : undefined,
        type: def.type instanceof Array ? def.type.map(i => i.name).join(' | ') : def.type && def.type.name,
        validator: def.validator,
        default: api.default !== undefined ? api.default : def.default === undefined ? undefined : this.formatDefault(def.default),
        description: api.desc || (this.apiDoc ? '参见 API 文档' : this.superDoc ? '参见基类 API 文档' : undefined),
        isNew: superOptions && !superProp,
        isUpdate: superProp && extendProps && extendProps[name],
        unwatch: component.$watch(
          name,
          debounce(val => {
            propInfo.value = val
          }, 100),
          { deep: true }
        )
      }
      return propInfo
    },

    // 格式化默认值
    formatDefault(val) {
      if (val instanceof Function) return '<Function>'
      if (typeof val === 'object') return JSON.stringify(val)
      return String(val)
    }
  },

  created() {
    // 加载API表数据
    const apiMap = {}
    Promise.all([
      import('components/api/Quasar.json').then(module => {
        Object.assign(apiMap, module.default)
      }),
      ...plusList.map(item =>
        import('components/api/' + item.caption + '.json').then(module => {
          apiMap[item.caption] = module.default
        })
      )
    ]).then(() => {
      this.state.apiMap = apiMap
    })
  }
}
</script>

<style lang="scss" scoped>
._header {
  padding: 8px 8px 0px 10px;
}
._toolbtn {
  padding-left: 0px;
  margin-left: 4px;
}
._proplist {
  padding: 4px 8px 6px 8px;
  table thead tr {
    height: 25px;
    th._prop {
      min-width: 100px;
      width: 30%;
      padding: 0px;
    }
    th._value {
      padding: 0px;
    }
  }
}
</style>
