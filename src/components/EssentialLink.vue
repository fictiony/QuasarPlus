<template>
  <q-item clickable :tag="tag" :target="target" :href="link" :to="to">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label v-if="caption" caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: '#'
    },
    to: {
      type: String,
      default: ''
    }
  },
  computed: {
    tag: vm => (vm.to ? 'label' : 'a'),
    target: vm => (vm.to ? '' : '_blank')
  }
}
</script>
