<template>
  <tr>
    <td class="_prop ellipsis" :class="nameColor" @dblclick="clickPropName">
      {{ name }}
      <q-icon class="float-right" name="info_outline" v-if="api.required || api.sync" />
      <q-tooltip max-width="400px" anchor="top left" self="top right" :hide-delay="pinTooltip ? 99999999 : 0" ref="tooltip">
        <div>
          <span class="text-h6">{{ name }}</span>
          <q-btn
            flat
            round
            dense
            class="float-right all-pointer-events"
            style="margin-top: -8px; margin-right: -12px"
            icon="close"
            size="xs"
            v-if="pinTooltip"
            @click="closeTooltip"
          />
          <q-badge class="q-ml-md float-right" rounded color="green" label="新增" v-if="isNew" />
          <q-badge class="q-ml-md float-right" rounded color="red" label="更新" v-if="isUpdate" />
        </div>

        <q-separator spaced="5px" color="grey" />
        <div>
          <q-badge class="q-mr-sm" color="accent" label="类型" />
          {{ type }}
        </div>

        <q-separator spaced="3px" color="transparent" />
        <q-markdown class="q-ma-none all-pointer-events" :src="description" />

        <div v-if="hasDefault">
          <q-badge class="q-mr-sm" color="secondary" label="默认值" />
          {{ defaultDesc === undefined ? defaultStr : defaultDesc }}
        </div>
      </q-tooltip>
    </td>

    <td class="_value">
      <div class="ellipsis" v-if="value !== undefined">{{ valueStr }}</div>
      <div class="ellipsis" :class="$q.dark.isActive ? 'text-grey-7' : 'text-grey-5'" v-else>{{ defaultStr }}</div>
      <!-- <q-popup-edit v-model="editValue" :validate="validator" v-if="editable">
        <q-input v-model="editValue" dense autofocus counter v-if="editType == 'String'" />
        <q-input type="number" v-model.number="editValue" dense autofocus v-else-if="editType == 'Number'" />
        <q-input v-model="editValue" dense autofocus v-else />
      </q-popup-edit> -->
    </td>
  </tr>
</template>

<script>
// 【属性列表项】
export default {
  data: vm => ({
    editValue: vm.valueStr,
    pinTooltip: false
  }),

  props: {
    component: {},
    name: {
      type: String,
      required: true
    },
    api: {
      required: true
    },
    value: {
      required: true
    },
    type: {
      type: String,
      default: 'any'
    },
    editType: {
      type: String,
      default: 'String'
    },
    validator: {
      type: Function,
      default: () => true
    },
    default: {},
    defaultDesc: {
      type: String
    },
    description: {
      type: String,
      default: '暂无说明'
    },
    isNew: {
      type: Boolean,
      default: false
    },
    isUpdate: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    // 属性名颜色
    nameColor() {
      return [`text-${this.isNew ? 'green' : this.isUpdate ? 'red' : 'primary'}`, this.$q.dark.isActive ? 'bg-blue-grey-10' : 'bg-blue-1']
    },

    // 属性值显示字符串
    valueStr() {
      return this.stringify(this.value)
    },

    // 是否有默认值
    hasDefault() {
      return this.defaultDesc !== undefined || this.default !== undefined
    },

    // 默认值显示字符串
    defaultStr() {
      return this.stringify(this.default)
    },

    // 是否可编辑
    editable() {
      switch (this.editType) {
        // case 'String':
        // case 'Number':
        case 'Boolean':
          return true
      }
      return false
    }
  },

  methods: {
    // 属性值转字符串
    stringify(val, editType) {
      switch (editType) {
        case 'String':
          return val != null ? String(val) : ''
      }
      if (val === undefined) return ''
      if (val instanceof Function) {
        if (this.type.split(' | ').includes('Function')) return '<Function>'
        val = val.call(this.component)
        if (val instanceof Function) return '<Function>'
      }
      if (typeof val === 'object') {
        return JSON.stringify(val, null, 1)
      }
      return String(val)
    },

    // 字符串转属性值
    parse(val) {
      try {
        switch (this.editType) {
          case 'String':
            return val
        }
        return JSON.parse(val)
      } catch (e) {}
    },

    // 点击属性名
    clickPropName() {
      this.pinTooltip = !this.pinTooltip
      this.$refs.tooltip.show()
    },

    // 关闭工具提示
    closeTooltip() {
      this.pinTooltip = false
      this.$refs.tooltip.hide()
    }
  }
}
</script>
