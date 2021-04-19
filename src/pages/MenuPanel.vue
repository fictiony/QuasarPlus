<template>
  <q-list>
    <EssentialLink v-for="(link, index) in linkList" :key="'L' + index" v-bind="link" />

    <q-separator />
    <q-item dense>
      <q-item-section>
        <q-item-label class="text-grey-5" lines="1"> 扩展组件列表 </q-item-label>
      </q-item-section>
    </q-item>

    <CustomScroller class="_componentlist">
      <EssentialLink v-for="(link, index) in componentList" :key="'C' + index" v-bind="link" />
    </CustomScroller>
  </q-list>
</template>

<script>
import CustomScroller from 'components/CustomScroller.js'
import EssentialLink from 'components/EssentialLink.vue'

export default {
  name: 'MenuPanel',
  components: {
    CustomScroller,
    EssentialLink
  },
  data: () => ({
    linkList: [
      {
        title: '返回主页',
        icon: 'home',
        to: '/'
      }
    ],
    componentList: [
      {
        title: '扩展分隔条',
        caption: 'MySplitter',
        icon: 'vertical_align_center',
        to: 'MySplitter'
      },
      {
        title: '扩展侧滑栏',
        caption: 'MyDrawer',
        icon: 'input',
        to: 'MyDrawer'
      }
    ]
  })
}
</script>

<style lang="scss" scoped>
._componentlist {
  height: calc(100vh - 81px);
}
</style>
