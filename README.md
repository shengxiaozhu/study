# 安装

```js
npm i e-study
```

# 使用

## 样式引入

```js
import 'e-study/index.css';
```

# 整体组件引入

```js
import { EpTable } from 'e-study';
```

## props

## 表头参数

key? 代表非必传

```js
const headerList = [
   {
      label: string; // 表头名称
      prop: string; // 展示字段 && 唯一标识
      width?: number; // 字段宽度
      slot?: boolean; // 是否开启插槽
      formatter?: (row: Record<string, any>, column: TableColumnCtx<any>) => string; // 格式化内容 开启插槽后无效
      sortable?: boolean | string; // 是否开启排序
      tooltip?: boolean; // 是否开启超出tooltip
      [key: string]: any; // 其他额外参数
   }
]
```

## 按钮参数

```js
const operateList = [
   {
      label: string; // 按钮名称
      event: string; // 唯一标识
      decision: { // 按钮判断条件，可传多个
      'key':{ // key代表当前判断条件的字段
      condition: any[] | string; // 按钮判断条件
      exist: boolean; // 条件 取正 或 取反
      }
      };
      [key: string]: any; // 其他额外参数
   }
]
```

## 表格数据

```js
const tableData = [];
```

## 其他参数

```js
page: string; // 当前页面标识
customHeader?: boolean; // 是否自定义列
selection?: boolean; // 是否显示多选框
scrollTop?: boolean; // 刷新数据是否回滚到顶部
customOperate?: boolean; // 是否自定义操作项
operateFixed?: boolean; // 操作项是否固定右侧展示
operateWidth?: number | string; // 操作项宽度
headerCellStyle?: Record<string, any>; // 表头样式
rowStyleList?: RowStyleItem[]; // 特殊表格样式 && 多条样式，根据判断成功最后一条展示
offsetBottom?: number; // 表格距离底部距离
```

## 表格抛出事件

```js
@selectionChange=(value)=>{} // 多选框选中事件 value: 表格选中数据
@tableOperate=(btn, row)=>{} // 操作项点击事件 btn: 当前按钮传入数据，row: 当前行传入数据
@sortChange=()=>{} // 排序事件
```

## 示例

```vue
<template>
  <EpTable
    page="Eptable"
    :headerList="headerList"
    :tableData="tableData"
    :operateList="operateList"
    @selectionChange="selectionChange"
    @tableOperate="tableOperate"
    @sortChange="sortChange"
  >
  </EpTable>
</template>
```

# 单独使用

## 自定义按钮抽屉

```js
import { EptOperate } from 'e-study';
```

## props

```js
drawer: boolean; // 是否显示抽屉
operateList: object[]; // 按钮参数同上
```

## 抛出事件

```js
@closeDrawer=(value, event?:string)=>{} value: 选中数据， event: 'save' 保存事件
```

## 示例

```vue
<template>
  <EptOperate
    page="Eptable"
    :drawer="drawer"
    :operateList="operateList"
    @closeDrawer="closeDrawer"
  >
  </EptOperate>
</template>
```

## 自定义表头抽屉

```js
import { EptHeader } from 'e-study';
```

## props

```js
drawer: boolean; // 是否显示抽屉
headerList: object[]; // 表头参数同上
```

## 抛出事件

```js
@closeDrawer=(value, event?:string)=>{} value: 选中数据， event: 'save' 保存事件
```

## 示例

```vue
<template>
  <EptHeader
    page="Eptable"
    :drawer="drawer"
    :headerList="headerList"
    @closeDrawer="closeDrawer"
  >
  </EptHeader>
</template>
```
