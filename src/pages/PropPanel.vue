<template>
  <div class="fit no-scroll column">
    <q-item dense class="_header full-width">
      <q-item-section style="max-width: 24px">
        <q-btn flat dense size="sm" class="text-primary" :icon="state.selecting ? 'my_location' : 'location_searching'" @click="selectClick">
          <q-tooltip ref="selectTip">选择要查看的 Vue 组件</q-tooltip>
        </q-btn>
      </q-item-section>
      <q-item-section class="_toolbtn">
        <q-item-label class="text-grey-6" :lines="1">
          <span v-if="component">{{ component }} 组件属性</span>
          <span v-else>当前未选中任何组件</span>
        </q-item-label>
      </q-item-section>
      <q-item-section side class="_toolbtn" v-if="component">
        <q-btn flat dense size="sm" class="text-primary" :icon="filterProps ? 'text_rotation_none' : 'filter_alt'" @click="filterClick">
          <q-tooltip ref="filterTip">{{ filterProps ? '显示所有属性' : '仅显示有值的属性' }}</q-tooltip>
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

    <CustomScroller class="_proplist full-width q-space">
      <q-markup-table flat bordered dense>
        <thead>
          <tr style="height: 25px">
            <th class="_prop bg-primary text-white">属性名</th>
            <th class="_value bg-blue-grey-5 text-white">属性值</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="filteredPropList.length">
            <PropItem v-for="prop in filteredPropList" :key="prop.name" v-bind="prop" />
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
import { debounce, extend } from 'quasar'
import { plusList } from 'components/menu.js'
import quasarApi from 'components/api/Quasar.json'

export default {
  data: () => ({
    component: '',
    apiDoc: '',
    superName: '',
    superDoc: '',
    propList: [],
    filterProps: false
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
        const superApi = this.state.apiMap[this.superName] || {}
        this.superDoc = superApi.doc
        this.propList = Object.keys(val.$props || {})
          .map(name => {
            const apiProp = (api.props && api.props[name]) || (superApi.props && superApi.props[name])
            return this.makePropInfo(val, name, apiProp)
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
    makePropInfo(component, name, apiProp) {
      if (typeof apiProp !== 'object') {
        apiProp = { desc: apiProp }
      }
      const prop = (component.$options.props && component.$options.props[name]) || {}
      const superOptions = component.$options.extends && component.$options.extends.options
      const superProp = superOptions && superOptions.props && superOptions.props[name]
      const extendProps = component.constructor.extendOptions.props
      if (prop.required) {
        apiProp.required = true
      }

      const propInfo = {
        component,
        name,
        value: name in component.$options.propsData ? component.$props[name] : undefined,
        type: this.getPropType(prop.type, apiProp),
        editType: apiProp.editType,
        validator: prop.validator,
        default: prop.default,
        defaultDesc: apiProp.default !== undefined ? String(apiProp.default) : undefined,
        description: this.getPropDescription(apiProp),
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

    // 获取属性类型
    getPropType(type, apiProp) {
      if (type instanceof Array) return type.map(i => i.name).join(' | ')
      if (type) return type.name
      if (apiProp.type instanceof Array) return apiProp.type.join(' | ')
      return apiProp.type
    },

    // 获取属性说明
    getPropDescription(apiProp) {
      if (apiProp.desc) {
        if (!apiProp.combinedDesc) {
          const sections = [apiProp.desc, '']
          if (apiProp.type === 'Function') {
            sections.push(this.makeFunctionDesc(apiProp))
          }
          if (apiProp.definition) {
            sections.push(this.makeObjectDesc(apiProp.definition))
          }
          if (apiProp.values) {
            sections.push('**可取值**：' + apiProp.values.join(' &nbsp; '))
          }
          sections.push('')
          if (apiProp.addedIn) {
            sections.push(`🆕 *${apiProp.addedIn}* 版新增`)
          }
          if (apiProp.required) {
            sections.push('⚠️ 必需提供')
          }
          if (apiProp.sync) {
            sections.push('⚠️ 需使用 `.sync` 修饰符来绑定')
          }
          apiProp.combinedDesc = sections.join('\n').trim()
        }
        return apiProp.combinedDesc
      }
      return this.apiDoc ? '参见 API 文档' : this.superDoc ? '参见基类 API 文档' : undefined
    },

    // 生成参数说明
    makeParamDesc(name, apiParam, level = 0) {
      const indent = '  '.repeat(level) + '- '
      const type = apiParam.type ? `(${apiParam.type instanceof Array ? apiParam.type.join(' | ') : apiParam.type}) ` : ''
      const lines = [`${indent}${name} - ${type}${apiParam.desc || ''}`]
      if (apiParam.type === 'Function') {
        lines.push(this.makeFunctionDesc(apiParam, level + 1))
      }
      if (apiParam.definition) {
        lines.push(this.makeObjectDesc(apiParam.definition, level + 1))
      }
      if (apiParam.values) {
        lines.push('**可取值**：' + apiParam.values.join(' &nbsp; '))
      }
      if (apiParam.default !== undefined) {
        lines.push('**默认值**：' + String(apiParam.default))
      }
      return lines.join('\n')
    },

    // 生成对象说明
    makeObjectDesc(apiObj, level = 0) {
      const lines = ['**对象结构**：', ...Object.keys(apiObj).map(name => this.makeParamDesc('`' + name + '`', apiObj[name], level))]
      return lines.join('\n')
    },

    // 生成函数说明
    makeFunctionDesc(apiFunc, level = 0) {
      const params = apiFunc.params ? Object.keys(apiFunc.params) : []
      const returns = (apiFunc.returns && apiFunc.returns.type) || 'void'
      const lines = [
        `**函数格式**：(${params.join(', ')}) => ${returns}`,
        ...params.map(name => this.makeParamDesc('`@' + name + '`', apiFunc.params[name], level))
      ]
      if (apiFunc.returns) {
        lines.push(this.makeParamDesc('`@return`', apiFunc.returns, level))
      }
      return lines.join('\n')
    }
  },

  created() {
    // 加载API表数据
    const apiMap = { ...quasarApi }
    Promise.all([
      ...plusList.map(item =>
        import('components/api/' + item.caption + '.json').then(module => {
          apiMap[item.caption] = module.default
        })
      ),
      ...Object.keys(quasarApi).map(className =>
        import('quasar/dist/api/' + className + '.json').then(module => {
          const api = module.default
          const props = {}
          Object.keys(api.props || {}).forEach(name => {
            props[this.$toCamelCase(name)] = api.props[name] // 将文档中串式命名的属性名统一成驼峰命名
          })
          apiMap[className].props = extend(props, apiMap[className].props)
        })
      )
    ]).then(() => {
      this.state.apiMap = Object.freeze(apiMap)
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
  th._prop,
  th._value {
    padding: 2px 0 0 0 !important;
  }
  th._prop,
  tbody ::v-deep ._prop {
    width: 30%;
    min-width: 100px;
    max-width: 160px;
  }
  th._value,
  tbody ::v-deep ._value {
    min-width: 60px;
    max-width: 1px; // 能使最后一列填满剩余宽度的神奇设置
  }
}
</style>
