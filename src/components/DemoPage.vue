<template>
  <q-page class="doc">
    <template v-for="(part, index) in docParts">
      <q-markdown no-heading-anchor-links :src="part" :key="'M' + index" v-if="part.trim()" />
      <component :is="components[index].tag" v-bind="components[index].attrs" :key="'C' + index" v-if="components[index]" />
    </template>

    <div class="q-pa-md">
      <q-btn color="primary" :to="prevPage">{{ prevPage == '/' ? '回主页' : '上一篇' }}</q-btn>
      <q-btn color="primary" :to="nextPage" class="q-ml-md">{{ nextPage == '/' ? '回主页' : '下一篇' }}</q-btn>
    </div>

    <q-page-scroller position="bottom-right" :scroll-offset="20" :offset="[15, 15]" :duration="100">
      <q-btn round color="primary" icon="arrow_upward" glossy />
      <q-tooltip anchor="center left" self="center right">返回顶部</q-tooltip>
    </q-page-scroller>
  </q-page>
</template>

<script>
// 【演示页面】
const COMPONENT_FORMAT = /<DemoExample(?:\s+\w+="[^"]+")+\s*\/?>/g
const TAG_FORMAT = /^<(\w+)/
const ATTR_FORMAT = /\s+(?<name>\w+)="(?<value>[^"]+)"/g

export default {
  props: {
    doc: {
      type: String,
      require: true
    },
    prevPage: {
      type: String,
      default: '/'
    },
    nextPage: {
      type: String,
      default: '/'
    }
  },

  computed: {
    docParts() {
      return this.doc.split(COMPONENT_FORMAT)
    },
    components() {
      return (this.doc.match(COMPONENT_FORMAT) || []).map(i => {
        const tag = i.match(TAG_FORMAT)[1]
        const attrs = {}
        Array(...i.matchAll(ATTR_FORMAT)).forEach(i => {
          attrs[i.groups.name] = i.groups.value
        })
        return { tag, attrs }
      })
    }
  }
}
</script>
