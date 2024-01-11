// import type { App } from 'vue';
import EpTable from './index.vue';
import EptHeader from './tableHeader.vue';
import EptOperate from './tableOperate.vue';

// 使用install方式 在app.use挂载
// EpTable.install = (app: App) => {
//   app.component(EpTable.__name as string, EpTable);
//   app.component(TableHeader.__name as string, TableHeader);
//   app.component(TableOperate.__name as string, TableOperate);
// };

export { EpTable, EptHeader, EptOperate };
