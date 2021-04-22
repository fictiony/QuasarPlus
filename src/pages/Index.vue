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
              <EssentialLink v-for="link in linkList" :key="link.to" v-bind="link" />
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data: () => ({
    linkList: [
      {
        title: 'Quasar Plus 代码仓库',
        caption: 'https://gitee.com/fictiony/quasar-plus',
        icon: 'code',
        url: 'https://gitee.com/fictiony/quasar-plus'
      },
      {
        title: 'Quasar Framework 官网',
        caption: 'https://quasar.dev',
        icon: 'camera',
        url: 'https://quasar.dev'
      },
      {
        title: 'Quasar Framework 中文网',
        caption: 'http://www.quasarchs.com',
        icon: 'school',
        url: 'http://www.quasarchs.com'
      },
      {
        title: 'Quasar Framework 中文社区',
        caption: 'http://forum.quasarchs.com',
        icon: 'record_voice_over',
        url: 'http://forum.quasarchs.com'
      }
    ]
  })
}
</script>
