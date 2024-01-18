<script setup lang="ts">
import type { HeaderListItem } from './types';
import ApiMethod from '../models/ApiMethod';
import apiStore, { useApiStore } from '@/store/modules/useApiStore';
const props = withDefaults(
  defineProps<{
    page?: string; // 当前页唯一标识
    headerList: HeaderListItem[]; // 表头数据
    drawer: boolean; // 抽屉是否打开
    env?: string; // 环境变量 development 测试环境 production 生产环境
  }>(),
  {
    page: 'page',
    headerList: () => [],
    drawer: false,
    env: '',
  },
);

const emits = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'closeDrawer', value: HeaderListItem[], event?: string): void;
}>();

const currentPage = computed(() => `EpTableCustom${props.page}`); // 当前页唯一标识
const currentCustom = computed(() => `${currentPage.value}headerList`); // 当前设置唯一标识
const titleStyle = computed(() => {
  const h = props.headerList.length * 45;
  const H = document.documentElement.clientHeight || document.body.clientHeight;
  return h > H - 280 ? { paddingRight: '4px' } : { paddingRight: 0 };
});
const groupStyle = computed(() => {
  const h = props.headerList.length * 45;
  const H = document.documentElement.clientHeight || document.body.clientHeight;
  return h > H - 280 ? { borderBottom: '1px solid #f2f2f2' } : {};
});

const columnList = ref<HeaderListItem[]>([]);
const fixed = ref(false);

const allChecked = computed(() => {
  const obj = columnList.value.filter((e) => {
    return !e.checked;
  });
  return !obj.length;
});
const changeCheckbox = () => {
  if (!allChecked.value) {
    columnList.value.forEach((v) => {
      v.checked = true;
    });
  }
};

const checkedNumber = computed(() => {
  let num = 0;
  columnList.value.forEach((v) => {
    if (v.checked) {
      num += 1;
    }
  });
  return num;
});

// 抽屉展示数据
const getColumnList = () => {
  const column = JSON.parse(JSON.stringify(props.headerList));
  const storeList = JSON.parse(localStorage.getItem(currentCustom.value) || '[]');
  const list: HeaderListItem[] = [];
  storeList.forEach((v: HeaderListItem) => {
    const index: number = column.findIndex((h: HeaderListItem) => h.prop === v.prop);
    if (index > -1) {
      const item: HeaderListItem = column.splice(index, 1)[0];
      // 每次更新表头名称
      list.push({ ...item, ...v, label: item.label });
    }
  });

  columnList.value = [...list, ...column];
  if (list.length === 0) {
    columnList.value.forEach((v: any) => {
      v.checked = true;
    });
  }

  // 首列是否固定
  fixed.value = columnList.value.some((v) => v.checked && v.fixed);
};

// 抛出展示数据
const exportColumn = (event?: string) => {
  let headerList: HeaderListItem[] = JSON.parse(JSON.stringify(props.headerList));
  const custom = localStorage.getItem(currentCustom.value);
  const storeList = JSON.parse(custom || '[]');

  let column: HeaderListItem[] = [];
  if (storeList.length > 0) {
    storeList.forEach((v: HeaderListItem) => {
      const item = headerList.find((h) => h.prop === v.prop);
      if (item && v.checked) {
        column.push({ ...v, ...item, width: v.width || item.width });
      }
    });
  } else {
    column = headerList.map((v) => ({ ...v, checked: true }));
  }
  emits('closeDrawer', column, event);
};

const start = ref<HeaderListItem>();
const end = ref<HeaderListItem>();
// 拖拽开始
const dragstart = (item: HeaderListItem) => {
  start.value = item;
};
// 拖拽过程
const dragenter = (item: HeaderListItem, e: DragEvent) => {
  end.value = item;
  e.preventDefault();
};
// 拖拽结束
const dragend = (item: HeaderListItem, e: DragEvent) => {
  if (start.value === end.value) return;
  if (start.value && end.value) {
    const oldIndex: number = columnList.value.findIndex((v) => v.prop === start.value?.prop);
    const newIndex: number = columnList.value.findIndex((v) => v.prop === end.value?.prop);
    const newItems = [...columnList.value];
    // 删除老节点
    newItems.splice(oldIndex, 1);

    // 目标位置新增节点
    newItems.splice(newIndex, 0, start.value);
    columnList.value = [...newItems];
  }
};
// 拖拽事件
const dragover = (e: DragEvent) => {
  e.preventDefault();
};

// 保存设置
const submit = async () => {
  const index = columnList.value.findIndex((item) => item.checked);
  columnList.value.forEach((e) => {
    delete e.fixed;
  });
  columnList.value[index].fixed = fixed.value;
  const res: any = await ApiMethod.addCustom(currentPage.value, 'headerList', JSON.stringify(columnList.value), props.env);
  if (res.code === 0) {
    exportColumn('save');
    emits('update:drawer', false);
  }
};

// 重置
const reset = () => {
  ElMessageBox.confirm('确定恢复表格默认设置?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      columnList.value = props.headerList;
      columnList.value.forEach((v) => {
        v.checked = true;
      });
      getColumnList();
    })
    .catch(() => {});
};

const isApiLoading = computed(() => useApiStore.isApiLoading);

watch(isApiLoading, (value) => {
  if (!value) {
    getColumnList();
    exportColumn();
  }
});

onMounted(async () => {
  if (!localStorage.getItem(currentCustom.value) && !isApiLoading.value) {
    await ApiMethod.getCustom(currentPage.value, props.env);
    return;
  }
  getColumnList();
  exportColumn();
});
</script>

<template>
  <el-drawer
    :model-value="drawer"
    title="自定义表格"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    size="600px"
    :with-header="false"
    destroy-on-close
  >
    <div class="drawer-title">自定义表格</div>
    <div class="drawer-alert">
      <div class="num">
        <el-icon><i-ep-info-filled /></el-icon>
        <p>
          已选择 <span>{{ checkedNumber }}</span> 项
        </p>
      </div>
      <div class="first">
        <el-checkbox
          v-model="fixed"
          size="large"
        />
        首列固定显示
      </div>
    </div>
    <div id="column">
      <ul
        class="header"
        :style="titleStyle"
      >
        <li class="checked">
          <el-checkbox
            :model-value="allChecked"
            size="large"
            @change="changeCheckbox"
          />
          全选
        </li>
        <li>列名</li>
        <li>列宽</li>
        <li>拖动调整顺序</li>
      </ul>
      <transition-group
        class="group"
        name="sort"
        tag="div"
        :style="groupStyle"
      >
        <ul
          v-for="item in columnList"
          :key="item.id"
          :draggable="true"
          @dragstart="dragstart(item)"
          @dragenter="dragenter(item, $event)"
          @dragend="dragend(item, $event)"
          @dragover="dragover($event)"
        >
          <li>
            <el-checkbox
              v-model="item.checked"
              size="large"
            />
          </li>
          <li>{{ item.label }}</li>
          <li>
            <el-input
              v-model="item.width"
              placeholder="设置宽度"
              clearable
            ></el-input>
          </li>
          <li>
            <el-button
              type="primary"
              size="small"
              text
            >
              <el-icon><i-ep-rank /></el-icon>
            </el-button>
          </li>
        </ul>
      </transition-group>
    </div>
    <div class="drawer-footer">
      <el-button
        type="primary"
        size="default"
        @click="reset"
      >
        重置
      </el-button>
      <div>
        <el-button
          size="default"
          @click="$emit('update:drawer', false)"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          size="default"
          @click="submit"
        >
          保存
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<style lang="scss" scoped>
#column {
  ul {
    display: flex;
    height: 45px;
    line-height: 45px;
    font-size: 14px;
    text-align: center;
    border: 1px solid #f2f2f2;
    border-top: none;

    .checked {
      display: flex;
      align-items: center;
      justify-content: center;

      .el-checkbox {
        margin: 0 10px 0 0;
      }
    }

    .el-checkbox {
      margin-left: -39px;
    }

    li {
      border-right: 1px solid #f2f2f2;

      &:first-child {
        flex: 1;
      }

      &:nth-child(2) {
        width: 200px;
      }

      &:nth-child(3) {
        width: 120px;
      }

      &:last-child {
        width: 130px;
        border-right: none;
      }
    }

    &:last-child {
      li {
        border-bottom: none;
      }
    }
  }

  .header {
    background-color: #f2f2f2;
    font-weight: bold;
    color: #888;
    padding-right: 4px;

    li {
      border-right-color: #fff;
    }
  }

  .el-input {
    width: auto;
    margin: 0 15px;
    padding: 0;

    :deep(.el-input__wrapper) {
      box-shadow: none;
    }
  }

  .group {
    height: calc(100vh - 280px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      /*滚动条整体样式*/
      width: 4px;
      /*高宽分别对应横竖滚动条的尺寸*/
      height: 1px;
    }

    &::-webkit-scrollbar-thumb {
      /*滚动条里面小方块*/
      border-radius: 10px;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
      background: #999;
    }

    &::-webkit-scrollbar-track {
      /*滚动条里面轨道*/
      box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      background: #eee;
    }
  }
}

.drawer-title {
  font-size: 14px;
  border-bottom: 2px solid #f2f2f2;
  margin: 0 -20px;
  padding: 0 20px 20px;
}

.drawer-alert {
  height: 44px;
  padding: 0 20px;
  font-size: 14px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  margin: 20px 0;

  .el-icon {
    line-height: 44px;
    margin-right: 5px;
  }

  .num,
  .first {
    display: flex;
    align-items: center;
  }

  .num {
    color: #999;

    p {
      span {
        color: #108ee9;
      }
    }
  }

  .first {
    display: flex;
    align-items: center;
    font-size: 12px;

    .el-checkbox {
      margin-right: 5px;
    }
  }
}

.drawer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2px solid #f2f2f2;
  margin: 0 -20px;
  padding: 20px;
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
