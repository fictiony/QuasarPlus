<template>
  <q-item clickable v-bind="link">
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
    url: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  },
  computed: {
    link() {
      if (this.to) {
        return { to: this.to }
      }
      return {
        tag: 'a',
        target: '_blank',
        href: this.url
      }
    }
  }
}
</script>
