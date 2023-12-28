// 表头
interface headerListItem {
  label: string; // 表头名称
  prop: string; // 展示字段 && 唯一标识
  width?: number; // 字段宽度
  slot?: boolean; // 是否开启插槽
  formatter?: Function; // 格式化内容 开启插槽后无效
  sortable?: boolean; // 是否开启排序
  tooltip?: boolean; // 是否开启超出tooltip
  [key: string]: any; // 表头额外参数
}

interface decisionItem {
  condition: any[] | string; // 按钮判断条件
  exist: boolean; // 条件 取正 或 取反
}
interface decisionObj {
  [key: string]: decisionItem;
}
interface operateListItem {
  label: string; // 按钮名称
  event: string; // 唯一标识
  decision: decisionObj; // 按钮判断条件
  [key: string]: any; // 按钮额外参数
}

interface rowStyleItem {
  prop: string; // 唯一标识
  value: any[] | string; // 判断条件
  style: object; // 样式
  [key: string]: any; // 额外参数
}

export { headerListItem, operateListItem, rowStyleItem };
