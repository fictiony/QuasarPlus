<template>
  <q-page>
    <div class="flex flex-center absolute-full" style="padding-bottom: 160px">
      <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" />
    </div>
    <div class="absolute-bottom">
      <div :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-2'">
        <q-separator />
        <div class="row">
          <div class="flex items-center justify-end q-pa-xl text-primary" style="width: 30%">
            推荐链接 <q-icon name="navigate_next" size="20px" />
          </div>
          <q-separator vertical />
          <div class="col-grow flex flex-center" style="height: 210px">
            <q-list class="col-grow">
              <EssentialLink v-for="(link, index) in linkList" :key="index" v-bind="link" />
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
// 【主页】
import { linkList } from 'components/menu.js'

export default {
  data: () => ({
    linkList
  })
}
</script>
