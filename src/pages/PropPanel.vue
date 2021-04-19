<template>
  <q-list>
    <q-item dense class="_header">
      <q-item-section>
        <q-item-label class="text-grey-5" :lines="1">{{ component }} 组件参数</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn flat dense size="sm" class="text-primary" label="API" icon="menu_book" type="a" target="_blank" :href="api">
          <q-tooltip>查看 API 文档</q-tooltip>
        </q-btn>
      </q-item-section>
    </q-item>

    <CustomScroller class="_proplist">
      <q-markup-table flat bordered dense>
        <thead>
          <tr>
            <th class="bg-primary text-white _prop">属性名</th>
            <th class="bg-blue-grey-5 text-white _value">属性值</th>
          </tr>
        </thead>
        <tbody>
          <PropItem v-for="(prop, index) in propList" :key="'P' + index" v-bind="prop" />
        </tbody>
      </q-markup-table>
    </CustomScroller>
  </q-list>
</template>

<script>
import CustomScroller from 'components/CustomScroller.js'
import PropItem from 'components/PropItem.vue'

export default {
  name: 'PropPanel',
  components: {
    CustomScroller,
    PropItem
  },
  data: () => ({
    component: 'MySplitter',
    api: 'http://www.quasarchs.com/vue-components/splitter#QSplitter-API',
    propList: [
      {
        name: 'horizontal',
        value: true
      },
      {
        name: 'limits',
        value: [10, 200],
        isUpdate: true
      },
      {
        name: 'limits2',
        value: [10, 200],
        isNew: true
      }
    ]
  })
}
</script>

<style lang="scss" scoped>
._header {
  padding: 8px 8px 0px 10px;
}
._proplist {
  margin: 2px 5px 0px 5px;
  height: calc(100vh - 92px);
  table thead tr {
    height: 25px;
    th._prop {
      min-width: 100px;
      width: 30%;
      padding: 0px;
    }
    th._value {
      padding: 0px;
    }
  }
}
</style>
