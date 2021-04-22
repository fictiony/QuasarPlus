# MyDrawer
扩展侧滑栏（MyDrawer）组件，在 **Quasar** 框架自带侧滑栏（QDrawer）组件的基础上，增加了可手动拖拽边缘调整宽度的功能。

## 功能
:::
增加手动拖拽边缘可调整侧滑栏宽度的功能，并可设置最大最小宽度限制。
:::
:::
新增状态属性 `realWidth`，用来记录侧滑栏经手动拖拽调整后的实际宽度，并可用 `width` 属性来指定初始宽度。
:::
:::
`width` 属性还支持 **同步绑定**：`v-bind:width.sync="someVar"`，能自动同步为当前实际宽度。
:::

## 范例
<DemoExample caption="基本用法" file="MyDrawerBasic" import="MyDrawer.js">
<DemoExample caption="宽度同步绑定" file="MyDrawerSync" import="MyDrawer.js">
<DemoExample caption="定制拖拽条样式" file="MyDrawerCustom" import="MyDrawer.js">

##
