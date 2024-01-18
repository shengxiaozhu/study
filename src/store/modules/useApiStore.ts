import { defineStore } from 'pinia';
import store from '@/store';
const apiMethodsStore = defineStore('apiStore', () => {
  const isApiLoading = ref(false); // 默认请求接口
  const setApiStore = (status: boolean) => {
    isApiLoading.value = status; // 设置api状态
  };
  return { isApiLoading, setApiStore };
});
export default apiMethodsStore;

const useApiStore = apiMethodsStore(store);

export { useApiStore };
