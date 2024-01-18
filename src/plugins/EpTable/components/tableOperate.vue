<script setup lang="ts">
import type { OperateListItem } from './types';
import ApiMethod from '../models/ApiMethod';
import apiStore, { useApiStore } from '@/store/modules/useApiStore';
const props = withDefaults(
  defineProps<{
    page?: string; // 当前页唯一标识
    operateList: OperateListItem[]; // 操作项数据
    drawer: boolean; // 抽屉是否打开
    env?: string; // 环境变量 development 测试环境 production 生产环境
  }>(),
  {
    page: 'page',
    operateList: () => [],
    drawer: false,
    env: '',
  },
);
const emits = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'closeDrawer', value: OperateListItem[], event?: string): void;
}>();

const currentPage = computed(() => `EpTableCustom${props.page}`); // 当前页唯一标识
const currentCustom = computed(() => `${currentPage.value}operateList`); // 当前设置唯一标识

const copyValue = (text: string) => {
  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);
  textarea.value = text;
  textarea.select();
  if (document.execCommand('Copy')) {
    document.execCommand('Copy');
    ElMessage.success('已复制到粘贴板！');
  }
  document.body.removeChild(textarea);
};

const titleStyle = computed(() => {
  const h = props.operateList.length * 45;
  const H = document.documentElement.clientHeight || document.body.clientHeight;
  return h > H - 330 ? { paddingRight: '4px' } : { paddingRight: 0 };
});
const groupStyle = computed(() => {
  const h = props.operateList.length * 45;
  const H = document.documentElement.clientHeight || document.body.clientHeight;
  return h > H - 330 ? { borderBottom: '1px solid #f2f2f2' } : {};
});

const btnList = ref<OperateListItem[]>([]);
const first = ref(false);

const allChecked = computed(() => {
  const obj = btnList.value.filter((e: any) => {
    return !e.checked;
  });
  return !obj.length;
});
const changeCheckbox = () => {
  if (!allChecked.value) {
    btnList.value.forEach((v: any) => {
      v.checked = true;
    });
  }
};

const checkedNumber = computed(() => {
  let num = 0;
  btnList.value.forEach((v: any) => {
    if (v.checked) {
      num += 1;
    }
  });
  return num;
});

const getBtnList = () => {
  const operate = JSON.parse(JSON.stringify(props.operateList));
  const storeList = JSON.parse(localStorage.getItem(currentCustom.value) || '[]');
  const list: OperateListItem[] = [];
  storeList.forEach((v: OperateListItem) => {
    const index: number = operate.findIndex((h: OperateListItem) => h.event === v.event);
    if (index > -1) {
      const item: OperateListItem = operate.splice(index, 1)[0];
      // 每次更新按钮名称
      list.push({ ...item, ...v, label: item.label });
    }
  });

  btnList.value = [...list, ...operate];
  if (list.length === 0) {
    btnList.value.forEach((v: any) => {
      v.checked = true;
    });
  }
};

// 设置按钮颜色
const setBtnType = (item: OperateListItem, type: string) => {
  item.type = type;
};

const start = ref(null);
const end = ref(null);
// 拖拽开始
const dragstart = (item: any) => {
  start.value = item;
};
// 拖拽过程
const dragenter = (item: any, e: any) => {
  end.value = item;
  e.preventDefault();
};
// 拖拽结束
const dragend = (item: any, e: any) => {
  if (start.value === end.value) return;
  const oldIndex = btnList.value.indexOf(start.value);
  const newIndex = btnList.value.indexOf(end.value);
  const newItems = [...btnList.value];
  // 删除老节点
  newItems.splice(oldIndex, 1);

  // 目标位置新增节点
  newItems.splice(newIndex, 0, start.value);
  btnList.value = [...newItems];
};
// 拖拽事件
const dragover = (e: any) => {
  e.preventDefault();
};

// 关闭抽屉 && 抛出展示按钮
const exportOperate = (event?: string) => {
  const operateList: OperateListItem[] = JSON.parse(JSON.stringify(props.operateList));
  const custom = localStorage.getItem(currentCustom.value);
  const storeList = JSON.parse(custom || '[]');
  let list: OperateListItem[] = [];
  if (storeList.length > 0) {
    storeList.forEach((v: OperateListItem) => {
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

  emits('closeDrawer', list, event);
  emits('update:drawer', false);
};

// 保存设置
const submit = async () => {
  const res: any = await ApiMethod.addCustom(currentPage.value, 'operateList', JSON.stringify(btnList.value), props.env);
  if (res.code === 0) {
    exportOperate('save');
  }
};

// 重置
const reset = () => {
  ElMessageBox.confirm('确定恢复默认操作设置?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      btnList.value = props.operateList;
      btnList.value.forEach((v: any) => {
        v.checked = true;
      });
      getBtnList();
    })
    .catch(() => {});
};
const isApiLoading = computed(() => useApiStore.isApiLoading);
watch(isApiLoading, (value) => {
  if (!value) {
    getBtnList();
    exportOperate();
  }
});

onMounted(async () => {
  if (!localStorage.getItem(currentCustom.value) && !isApiLoading.value) {
    await ApiMethod.getCustom(currentPage.value, props.env);
    return;
  }
  getBtnList();
  exportOperate();
});
</script>

<template>
  <el-drawer
    :model-value="drawer"
    title="自定义按钮"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    size="500px"
    :with-header="false"
  >
    <div class="drawer-title">自定义按钮</div>
    <div class="drawer-alert">
      <div class="num">
        <el-icon><i-ep-info-filled /></el-icon>
        <p>
          已选择 <span>{{ checkedNumber }}</span> 项
          <b class="ml-2 text-[#E6A23C]">点击按钮可修改当前按钮颜色！</b>
        </p>
      </div>
    </div>
    <div id="column">
      <ul
        class="header"
        :style="titleStyle"
      >
        <li class="checked w-[100px]">
          <el-checkbox
            :model-value="allChecked"
            size="large"
            @change="changeCheckbox"
          />
          全选
        </li>
        <li class="flex-1">按钮</li>
        <li class="w-[120px]">拖动调整顺序</li>
      </ul>
      <transition-group
        class="group"
        name="sort"
        tag="div"
        :style="groupStyle"
      >
        <ul
          v-for="item in btnList"
          :key="item.id"
          :draggable="true"
          @dragstart="dragstart(item)"
          @dragenter="dragenter(item, $event)"
          @dragend="dragend(item, $event)"
          @dragover="dragover($event)"
        >
          <li class="w-[100px]">
            <el-checkbox
              v-model="item.checked"
              size="large"
            />
          </li>
          <li class="flex-1">
            <el-popover
              placement="bottom"
              :width="330"
              trigger="click"
            >
              <template #reference>
                <el-button
                  :type="item.type || 'primary'"
                  link
                  size="small"
                >
                  {{ item.label }}
                </el-button>
              </template>
              <div class="p-1">
                <div class="text-[14px] mb-3">点击下列色块可修改按钮颜色</div>
                <el-button
                  type="primary"
                  size="small"
                  @click="setBtnType(item, 'primary')"
                >
                  蓝色
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="setBtnType(item, 'success')"
                >
                  绿色
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="setBtnType(item, 'info')"
                >
                  灰色
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  @click="setBtnType(item, 'warning')"
                >
                  橙色
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="setBtnType(item, 'danger')"
                >
                  红色
                </el-button>
              </div>
            </el-popover>
          </li>
          <li class="w-[120px]">
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
          @click="exportOperate()"
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
      &:last-child {
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
    height: calc(100vh - 270px);
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
  margin: 20px 0 10px;

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
