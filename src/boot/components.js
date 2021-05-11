import Vue from 'vue'

// 第三方组件
import { QEditableTd, QSelectableTd } from 'components/thirdparty/qmodeltd'
import { MyDrawer } from 'components/plus'

// 功能组件
import CustomScroller from 'components/CustomScroller.js'
import EssentialLink from 'components/EssentialLink.vue'
import DemoComponent from 'components/DemoComponent.vue'
import DemoExample from 'components/DemoExample.vue'
import DemoPage from 'components/DemoPage.vue'
import PropItem from 'components/PropItem.vue'
import OtherApiItem from 'components/OtherApiItem.vue'
import ComponentSelector from 'components/ComponentSelector.vue'

// 注册组件
const components = {
  QEditableTd,
  QSelectableTd,
  MyDrawer,
  CustomScroller,
  EssentialLink,
  DemoComponent,
  DemoExample,
  DemoPage,
  PropItem,
  OtherApiItem,
  ComponentSelector
}
Object.keys(components).forEach(name => {
  Vue.component(components[name].name || name, components[name])
})
