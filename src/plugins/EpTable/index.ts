import type { App } from 'vue';
import EpTable from './index.vue';

// 使用install方式 在app.use挂载
EpTable.install = (app: App) => {
  app.component(EpTable.__name as string, EpTable);
};

export default EpTable;
