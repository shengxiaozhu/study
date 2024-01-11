import type { App } from 'vue';
import EpTable from './components/index.vue';
import EptHeader from './components/tableHeader.vue';
import EptOperate from './components/tableOperate.vue';

const components = [EpTable, EptHeader, EptOperate];

// 使用install方式 在app.use挂载
const install = (app: App) => {
  components.forEach((component) => {
    app.component(component.__name as string, EpTable);
  });
};

export default install;
export { EpTable, EptHeader, EptOperate };
export type { HeaderListItem, OperateListItem, RowStyleItem } from './components/types';
