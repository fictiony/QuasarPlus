# MyDrawer
扩展侧滑栏（MyDrawer）组件，在 **Quasar** 框架自带侧滑栏（QDrawer）组件的基础上，增加了可手动拖拽边缘调整宽度的功能。

## 功能
:::
增加手动拖拽边缘可调整侧滑栏宽度的功能，并可设置最大最小宽度限制。
:::
:::
新增状态属性 `realWidth`，用来记录侧滑栏经手动拖拽调整后的实际宽度，同时支持 `width` 属性的同步绑定：`v-bind:width.sync="something"`。
:::

## 范例
<DemoExample caption="基本用法" file="MyDrawerBasic" import="MyDrawer">

##
