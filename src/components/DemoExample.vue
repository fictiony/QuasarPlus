<template>
  <q-card flat bordered>
    <q-card-section class="row justify-between q-pa-none q-pt-sm">
      <q-ribbon color="grey-7" background-color="grey-4" leaf-color="grey-5" decoration="rounded-out" class="q-py-none q-mb-sm">
        <div class="q-mx-md" style="font-size: 17px">{{ caption }}</div>
      </q-ribbon>

      <div class="row">
        <q-tabs v-model="curTab" dense active-color="primary" indicator-color="primary" class="text-grey self-end" v-show="showCode">
          <q-tab v-for="tab in codeTabs" :name="tab" :label="tab" :key="`tab-${tab}`" />
        </q-tabs>

        <q-btn flat round :icon="showCode ? 'browser_not_supported' : 'code'" color="primary" class="self-end" @click="showCode = !showCode">
          <q-tooltip>{{ showCode ? '隐藏代码' : '查看代码' }}</q-tooltip>
        </q-btn>
        <q-btn flat round icon="open_in_new" color="primary" class="self-end" type="a" target="_blank" :href="giteeUrl">
          <q-tooltip>访问gitee上的源码</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>
    <q-separator />

    <q-slide-transition>
      <div v-show="showCode">
        <q-tab-panels v-model="curTab" animated>
          <q-tab-panel class="q-pa-none overflow-hidden" v-for="tab in codeTabs" :name="tab" :key="`panel-${tab}`">
            <q-markdown class="fit" show-copy copy-tooltip-text="复制代码" :src="code[tab]" />
          </q-tab-panel>
        </q-tab-panels>
        <q-separator />
      </div>
    </q-slide-transition>

    <q-linear-progress indeterminate v-if="loading" />
    <component :is="demo" v-else />
  </q-card>
</template>

<script>
// 【演示代码】
const VUE_FORMAT = /<(\w+)[^>/]*>[\w\W]*<\/\1>/g

export default {
  props: {
    caption: {
      type: String,
      default: ''
    },
    file: {
      type: String,
      required: true
    },
    import: {
      type: String,
      default: ''
    }
  },

  data: () => ({
    loading: true,
    demo: null,
    code: {},
    codeTabs: [],
    curTab: '',
    showCode: false
  }),

  computed: {
    giteeUrl() {
      return `https://gitee.com/fictiony/quasar-plus/blob/master/src/components/plus/${this.file}.js`
    }
  },

  methods: {
    parseCode(source) {
      const code = {}
      Array(...source.matchAll(VUE_FORMAT)).forEach(block => {
        code[block[1]] = '```html\n' + block[0] + '\n```'
      })
      return code
    }
  },

  mounted() {
    Promise.all([
      import('src/examples/' + this.file + '.vue').then(module => {
        this.demo = module.default
      }),
      import('!raw-loader!src/examples/' + this.file + '.vue').then(module => {
        this.code = this.parseCode(module.default)
        this.codeTabs = Object.keys(this.code)
        this.curTab = this.codeTabs[0]
      })
    ]).then(() => {
      this.loading = false
    })
  }
}
</script>
