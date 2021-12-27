<template>
  <q-icon
    style="cursor: pointer"
    :name="name"
    :size="size + 'px'"
    :color="!hover ? 'blue-grey' : $q.dark.isActive ? 'yellow' : 'pink'"
    @mouseover="hover = true"
    @mouseout="hover = false"
    @click="onClick"
  >
    <q-tooltip :delay="500">
      <b class="text-grey" style="font-size: 9px" v-if="iconSet">{{ iconSet }}<br /></b>
      {{ name }}
    </q-tooltip>
  </q-icon>
</template>

<script>
// 【图标预览】
export default {
  data: () => ({
    hover: false // 鼠标当前是否指向
  }),

  props: {
    name: {
      // 图标名称
      type: String,
      required: true
    },
    iconSet: {
      // 图标集名称
      type: String,
      default: ''
    },
    size: {
      // 图标大小
      type: Number,
      default: 32
    }
  },

  methods: {
    onClick() {
      this.$emit('click', this.name)
    }
  }
}
</script>
