<template>
  <q-model-td
    v-bind="$attrs"
    v-on="{ ...$listeners, input: undefined }"
    v-model="editValue"
    :inline="inline"
    :auto-save="autoSave"
    @edit-start="onEditStart"
    @edit-finish="onEditFinish"
    @edit-cancel="onEditCancel"
  >
    <template #default>
      <slot />
    </template>

    <template v-slot:model-view="{ input, save, cancel }">
      <q-select
        ref="select"
        autofocus
        dense
        options-dense
        v-bind="$attrs"
        :value="editValue"
        @input="input($event) || (inline && save())"
        @blur="inline && (autoSave ? save() : cancel())"
        @keyup.enter="save"
        @click.native.stop
      />
    </template>
  </q-model-td>
</template>

<script>
import { QSelect } from 'quasar'
import QModelTd from './QModelTd'
import mixin from './mixin'
import mixin2 from './mixin2'

export default {
  name: 'QSelectableTd',

  components: {
    QSelect,
    QModelTd
  },

  mixins: [mixin, mixin2],

  methods: {
    onEditStart() {
      setTimeout(() => this.$nextTick(this.$refs.select.showPopup))
    }
  }
}
</script>
