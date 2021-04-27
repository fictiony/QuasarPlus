<template>
  <tr>
    <td class="_prop ellipsis bg-blue-1" :class="nameColor">
      {{ name }}
      <q-tooltip max-width="300px" anchor="top left" self="top right">
        <div>
          <span class="text-h6">{{ name }}</span>
          <q-badge class="q-ml-md float-right" rounded color="green" label="新增" v-if="isNew" />
          <q-badge class="q-ml-md float-right" rounded color="red" label="更新" v-if="isUpdate" />
        </div>
        <q-separator spaced="5px" color="grey" />
        <div>
          <q-badge class="q-mr-sm" color="accent" label="类型" />
          {{ type }}
        </div>
        <q-separator spaced="3px" color="transparent" />
        <q-markdown class="q-ma-none" :src="description" />
        <q-separator spaced="3px" color="transparent" v-if="hasDefault" />
        <div v-if="hasDefault">
          <q-badge class="q-mr-sm" color="secondary" label="默认值" />
          {{ this.default }}
        </div>
      </q-tooltip>
    </td>
    <td class="_value">
      <div class="ellipsis" v-if="value !== undefined">{{ value }}</div>
      <div class="ellipsis text-grey-4" v-else-if="hasDefault">{{ this.default }}</div>
      <!-- <q-popup-edit v-model="curValue" :validate="validator">
        <q-input v-model="curValue" dense autofocus counter v-if="editor == 'String'" />
        <q-input type="number" v-model.number="curValue" dense autofocus v-else-if="editor == 'Number'" />
        <q-input v-model="curValue" dense autofocus v-else />
      </q-popup-edit> -->
    </td>
  </tr>
</template>

<script>
// 【属性列表项】
export default {
  data: vm => ({
    curValue: vm.stringify(vm.value)
  }),

  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    type: {
      type: String,
      default: 'any'
    },
    validator: {
      type: Function,
      default: () => true
    },
    default: {
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
    },
    editor: {
      type: String,
      default: 'String'
    }
  },

  computed: {
    nameColor() {
      return `text-${this.isNew ? 'green' : this.isUpdate ? 'red' : 'primary'}`
    },

    hasDefault() {
      return this.default !== undefined
    }
  },

  methods: {
    stringify(val) {
      switch (this.editor) {
        case 'String':
          return val ? String(val) : ''
        case 'Number':
          return val.toString()
      }
      return JSON.stringify(val)
    },

    parse(val) {
      switch (this.editor) {
        case 'String':
          return JSON.stringify(val)
        case 'Number':
          return val.toString()
      }
      return val
    }
  }
}
</script>
