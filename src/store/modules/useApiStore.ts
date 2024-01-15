import { defineStore } from 'pinia';
const useApiMethodsStore = defineStore('apiStore', () => {
  const isApiLoading = ref(false); // 默认不请求接口
  const setApiStore = (status: boolean) => {
    isApiLoading.value = status; // 设置api状态
  };
  return { isApiLoading, setApiStore };
});
export default useApiMethodsStore;
