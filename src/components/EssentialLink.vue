<template>
  <q-item clickable :tag="tag" :target="target" :href="link" :to="to">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label lines="1">{{ title }}</q-item-label>
      <q-item-label caption lines="1" v-if="caption">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
// 【菜单链接】
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
