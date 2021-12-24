import Vue from 'vue'

// 第三方组件
import { QEditableTd, QSelectableTd } from 'components/thirdparty/qmodeltd'
import { MyDrawer } from 'components/plus'
import CustomScroller from 'components/thirdparty/inspect/CustomScroller'

// 功能组件
import EssentialLink from 'components/EssentialLink.vue'
import DemoComponent from 'components/DemoComponent.vue'
import DemoExample from 'components/DemoExample.vue'
import DemoPage from 'components/DemoPage.vue'

// 注册组件
const components = {
  QEditableTd,
  QSelectableTd,
  MyDrawer,
  CustomScroller,

  EssentialLink,
  DemoComponent,
  DemoExample,
  DemoPage
}
Object.keys(components).forEach(name => {
  Vue.component(components[name].name || name, components[name])
})
