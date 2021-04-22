# MySplitter
扩展分隔条（MySplitter）组件，主要是用于解决 **Quasar** 框架自带分隔条（QSplitter）组件无法同时对两侧区域的最小范围进行限制的问题，而进行的扩展。

## 功能
:::
支持同时对 **两侧区域** 进行最小像素范围的限制，并仍保留原单侧区域范围最小范围限制的功能。
:::
:::
组件整体大小改变后，能够实时响应并调整两侧区域的大小。
:::
:::
通过新增模式属性 `position`，并重定义原模式属性 `value` 为状态属性，从而提高了组件的 **封装性**（即不再需要强制绑定 `v-model` 参数）。
:::

## 范例
<DemoExample caption="基本用法" file="MySplitterBasic" import="MySplitter">

## 更多
参考教程：[Vue组件继承实践：扩展分隔条（MySplitter）组件](https://www.yuque.com/fictiony/cs6lwq/nzrxtl)

##
