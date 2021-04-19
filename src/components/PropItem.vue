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
    <td>{{ name }}</td>
  </tr>
</template>

<script>
// 【属性列表项】
export default {
  name: 'PropItem',
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
    description: {
      type: String,
      default: '参见 API 文档'
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
    nameColor: vm => 'text-' + (vm.isNew ? 'green' : vm.isUpdate ? 'red' : 'primary')
  }
}
</script>
