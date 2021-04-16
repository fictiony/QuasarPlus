<template>
  <q-page>
    <div class="flex flex-center absolute-full">
      <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" style="margin-bottom: 160px" />
    </div>
    <div class="absolute-bottom">
      <div class="bg-grey-2">
        <q-separator />
        <div class="row">
          <div class="flex flex-center" style="width: 180px">
            <q-icon name="favorite" size="20px" />
            <b>&nbsp; 推荐访问</b>
          </div>
          <q-separator vertical />
          <div class="col-grow flex flex-center" style="height: 160px">
            <q-list class="col-grow">
              <EssentialLink v-for="link in linkList" :key="link.title" v-bind="link" />
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

export default {
  name: 'PageIndex',
  components: { EssentialLink },
  data: () => ({
    linkList: [
      {
        title: 'Quasar Plus 代码仓库',
        caption: 'gitee.com/fictiony/quasar-plus',
        icon: 'code',
        link: 'https://gitee.com/fictiony/quasar-plus'
      },
      {
        title: 'Quasar Framework 中文网',
        caption: 'www.quasarchs.com',
        icon: 'school',
        link: 'http://www.quasarchs.com'
      },
      {
        title: 'Quasar Framework 中文社区',
        caption: 'forum.quasarchs.com',
        icon: 'record_voice_over',
        link: 'http://forum.quasarchs.com'
      }
    ]
  })
}
</script>
