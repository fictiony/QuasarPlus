<template>
  <q-list class="fit no-scroll column">
    <EssentialLink v-for="(link, index) in PAGE_LIST" :key="index" v-bind="link" />

    <q-separator />
    <q-item dense>
      <q-item-section>
        <q-item-label class="text-grey-5" lines="1"> 扩展组件列表 </q-item-label>
      </q-item-section>
    </q-item>

    <CustomScroller class="q-space">
      <EssentialLink v-for="(link, index) in PLUS_LIST" :key="index" v-bind="link" />
    </CustomScroller>
  </q-list>
</template>

<script>
// 【菜单栏】
import { PAGE_LIST, PLUS_LIST } from 'boot/menu.js'

export default {
  data: () => ({
    PAGE_LIST,
    PLUS_LIST
  })
}
</script>
