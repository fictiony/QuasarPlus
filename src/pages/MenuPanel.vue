<template>
  <q-list class="fit no-scroll column">
    <EssentialLink v-for="(link, index) in linkList" :key="`link-${index}`" v-bind="link" />

    <q-separator />
    <q-item dense>
      <q-item-section>
        <q-item-label class="text-grey-5" lines="1"> 扩展组件列表 </q-item-label>
      </q-item-section>
    </q-item>

    <CustomScroller class="q-space">
      <EssentialLink v-for="(link, index) in plusList" :key="`plus-${index}`" v-bind="link" />
    </CustomScroller>
  </q-list>
</template>

<script>
// 【菜单栏】
import plusList from 'components/plusList.js'

export default {
  data: () => ({
    linkList: [
      {
        title: '返回主页',
        icon: 'home',
        to: '/'
      }
    ],
    plusList
  })
}
</script>
