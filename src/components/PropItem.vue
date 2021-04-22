<template>
  <tr>
    <td class="bg-blue-1" :class="nameColor">
      {{ name }}
      <q-tooltip max-width="200px" anchor="top left" self="top right">
        <q-badge color="accent" label="类型" />
        &nbsp;{{ type }}
        <q-separator spaced="5px" color="grey" />
        <div>
          <q-badge color="accent" label="说明" />
          &nbsp;{{ description }} &nbsp;
          <q-badge rounded color="green" label="新增" v-if="isNew" />
          <q-badge rounded color="red" label="更新" v-if="isUpdate" />
        </div>
      </q-tooltip>
    </td>
    <td>
      {{ value }}
      <q-popup-edit v-model="curValue" :validate="validate">
        <q-input v-model="curValue" dense autofocus counter v-if="editor == 'String'" />
        <q-input type="number" v-model.number="curValue" dense autofocus v-else-if="editor == 'Number'" />
        <q-input v-model="curValue" dense autofocus v-else />
      </q-popup-edit>
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
      default: 'String'
    },
    validate: {
      type: Function,
      default: () => true
    },
    description: {
      type: String,
      default: '参见 API 文档'
    },
    editor: {
      type: String,
      default: 'String'
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
    nameColor() {
      return `text-${this.isNew ? 'green' : this.isUpdate ? 'red' : 'primary'}`
    }
  },
  watch: {},
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
