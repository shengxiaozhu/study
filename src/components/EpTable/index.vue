<template>
  <el-table
    id="table-page"
    ref="tablePageRef"
    :data="props.tableData"
    :height="height"
    :header-cell-style="headerCellStyle"
    :row-style="rowStyle"
    @handleSelectionChange="handleSelectionChange"
    @sortChange="(sort: Sort) => $emit('sortChange', sort)"
  >
    <el-table-column
      type="selection"
      width="50"
    />
    <!-- 表格插槽 -->
    <template v-for="col in columnList">
      <el-table-column
        v-if="col.slot"
        :prop="col.prop"
        :label="col.label"
        :min-width="col.width"
        :sortable="col.sortable"
        :show-overflow-tooltip="col.tooltip"
        :fixed="col.fixed"
      >
        <!-- 表头插槽 -->
        <template #header>
          <slot
            name="header"
            :prop="col.prop"
          >
            {{ col.label }}
          </slot>
        </template>
        <template #default="{ row }">
          <slot
            name="default"
            :prop="col.prop"
            :row="row"
          >
            {{ row[col.prop] || '--' }}
          </slot>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        :prop="col.prop"
        :label="col.label"
        :min-width="col.width"
        :sortable="col.sortable"
        :show-overflow-tooltip="col.tooltip"
        :formatter="col.formatter || Formatter"
        :fixed="col.fixed"
      >
        <!-- 表头插槽 -->
        <template #header>
          <slot
            name="header"
            :prop="col.prop"
          >
            {{ col.label }}
          </slot>
        </template>
      </el-table-column>
    </template>
    <el-table-column
      :width="operateWidth"
      :fixed="operateFixed ? 'right' : false"
    >
      <template #header>
        <template v-if="!customHeader && !customOperate">
          <div class="text-center">操作</div>
        </template>
        <template v-else>
          <div class="flex justify-center items-center">
            <el-button
              type="primary"
              link
              size="small"
              @click="setHeader"
            >
              表头
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="setOperate"
            >
              操作
            </el-button>
          </div>
        </template>
      </template>
      <template #default="{ row }">
        <template
          v-for="btn in btnList"
          :key="btn.event"
        >
          <el-button
            v-if="decisionBtn(btn, row)"
            :type="btn.type || 'primary'"
            link
            size="small"
            @click="$emit('tableOperate', btn, row)"
          >
            {{ btn.label }}
          </el-button>
        </template>
      </template>
    </el-table-column>
  </el-table>

  <tableHeader
    v-model:drawer="drawer"
    :headerList="headerList"
    :page="page"
  />

  <tableOperate
    v-model:drawer="operateDrawer"
    :operateList="operateList"
    :page="page"
  />
</template>

<script setup lang="ts">
import type { TableInstance, TableColumnCtx, Sort } from 'element-plus';
import { headerListItem, operateListItem, rowStyleItem } from './props';
import tableHeader from './tableHeader.vue';
import tableOperate from './tableOperate.vue';

interface anyObj {
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    page?: string; // 当前页唯一标识
    tableData: Record<string, any>[]; // 表格数据
    headerList: headerListItem[]; // 表头数据
    customHeader?: boolean; // 是否自定义列
    selection?: boolean; // 是否显示多选框
    scrollTop?: boolean; // 刷新数据是否回滚到顶部
    customOperate?: boolean; // 是否自定义操作项
    operateFixed?: boolean; // 操作项是否固定右侧展示
    operateWidth?: number | string; // 操作项宽度
    operateList?: operateListItem[]; // 操作项数据
    headerCellStyle?: Record<string, any>; // 表头样式
    rowStyleList?: rowStyleItem[]; // 特殊表格样式 && 多条样式，根据判断成功最后一条展示
    offsetBottom?: number; // 距离底部距离
  }>(),
  {
    page: 'page',
    tableData: () => [],
    headerList: () => [],
    customHeader: true,
    selection: true,
    scrollTop: true,
    customOperate: true,
    operateFixed: true,
    operateWidth: 100,
    operateList: () => [],
    headerCellStyle: () => {
      // 表头样式
      return { background: '#f5f5f5', fontSize: '14px', color: '#333', padding: '15px 0' };
    },
    rowStyleList: () => [],
    offsetBottom: 40,
  },
);

const emits = defineEmits<{
  (e: 'selectionChange', value: anyObj[]): void;
  (e: 'sortChange', value: Sort): void;
  (e: 'tableOperate', btn: operateListItem, row: anyObj): void;
}>();

const columnList = ref<headerListItem[]>();
// 计算展示表头
const getColumnList = () => {
  const { headerList, page } = props;
  const current = `EpTableHeaderList${page}`;
  const storeList = JSON.parse(localStorage.getItem(current) || '[]');
  let colunm: headerListItem[] = [];
  if (storeList.length > 0) {
    storeList.forEach((v: headerListItem) => {
      const item = headerList.find((h) => h.prop === v.prop);
      if (item && v.checked) {
        colunm.push({ ...v, ...item, width: v.width || item.width });
      }
    });
  } else {
    colunm = headerList.map((v) => ({ ...v, checked: true }));
  }
  columnList.value = colunm;
};

const height = ref<string>();
const tablePageRef = ref<TableInstance>();
const getTableHeight = async () => {
  const { top } = tablePageRef.value?.$el.getBoundingClientRect();
  height.value = `calc(100vh - ${top + props.offsetBottom}px)`;
};

const Formatter = (row: Record<string, any>, colunm: TableColumnCtx<any>) => {
  return row[colunm.property] || '--';
};

// 多选
const handleSelectionChange = (value: anyObj[]) => {
  emits('selectionChange', value);
};

// 设置某一条件下整行样式
const rowStyle = ({ row }: {row: any; rowIndex: number}) => {
  const { rowStyleList } = props;
  let css = {};
  if (rowStyleList.length) {
    rowStyleList.forEach((v: rowStyleItem) => {
      const { prop, value, style } = v;
      const type = typeof row[prop];
      if (type === 'boolean' || (type === 'number' && row[prop] === value)) {
        css = style;
      } else if (value.includes(row[prop])) {
        css = style;
      }
    });
  }
  return css;
};

const operateDrawer = ref(false);
const btnList = ref<operateListItem[]>([]);
const getOperate = () => {
  const { operateList, page } = props;
  const current = `EpTableOperateList${page}`;
  const storeList = JSON.parse(localStorage.getItem(current) || '[]');
  let list: operateListItem[] = [];
  if (storeList.length > 0) {
    storeList.forEach((v: operateListItem) => {
      const item = operateList.find((h) => h.event === v.event);
      if (item && v.checked) {
        v.label = item.label;
        // 每次更新按钮名称
        list.push({ ...item, ...v, lable: item.label });
      }
    });
  } else {
    list = operateList.map((v) => ({ ...v, checked: true }));
  }
  btnList.value = list;
};

// 判断按钮展示
const decisionBtn = (btn: operateListItem, row: anyObj) => {
  let result = true; // 默认展示按钮
  const { decision } = btn;
  const keys = Object.keys(row).map((k) => k);
  if (decision && keys.length) {
    Object.entries(decision).forEach(([key, value]) => {
      if (keys.includes(key)) {
        const { exist, condition } = value;
        const v = row[key];
        const ext = condition?.includes(row[key]);

        // exist为true时   判断条件不成立则隐藏按钮
        // exist为false时  判断条件成立则隐藏按钮
        if ((exist && !ext) || (!exist && ext)) {
          result = false;
        }
      }
    });
  }
  return result;
};

const drawer = ref(false);
const setHeader = () => {
  drawer.value = true;
};
const setOperate = () => {
  operateDrawer.value = true;
};

// 监听表格数据变化，修改表格高度
watch(
  [() => props.tableData, () => tablePageRef.value],
  ([data, table]) => {
    if (table) {
      tablePageRef.value?.doLayout();
      getTableHeight();
    }
  },
  { immediate: true, deep: true },
);

// 监听表头和按钮设置操作
watch(
  [() => drawer.value, () => operateDrawer.value, () => tablePageRef.value],
  ([drawer, operateDrawer, table]) => {
    if (table) {
      getOperate();
      getColumnList();
    }
  },
  { immediate: true, deep: true },
);
</script>

<style lang="scss" scoped>
#table-page {
  :deep(.cell) {
    white-space: pre-line !important;
  }
  :deep(.el-tooltip) {
    white-space: nowrap !important;
  }
  :deep(.el-scrollbar__bar.is-horizontal) {
    height: 12px;
    border-radius: 12px;
  }
  .el-button {
    margin: 0 3px !important;
  }
}
</style>
