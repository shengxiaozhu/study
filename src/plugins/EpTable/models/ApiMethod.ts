import { getListCustom, addListCustom } from '@/api/cross';
import { hideLoadingApi, showLoadingApi } from '@/utils/useLoading';
import apiStore, { useApiStore } from '@/store/modules/useApiStore';

export default class ApiMethod {
  static async getCustom(key_word: string, env?: string) {
  let res: any = null;
    if (!useApiStore.isApiLoading) {
      useApiStore.setApiStore(true);
      showLoadingApi();
      res = await getListCustom({ key_word, env });
      hideLoadingApi();
      if (res.code === 0) {
        Object.entries(res.data).forEach(([key, value]: any) => {
          localStorage.setItem(`${key_word}${key}`, value); // 存储本地数据
        });
      }
      useApiStore.setApiStore(false);
    }
    return res;
  }

  static async addCustom(key_word: string, type: string, value: string, env?: string) {
    const params = {
      key_word,
      type,
      value,
      env,
    };
    showLoadingApi();
    const res: any = await addListCustom(params);
    hideLoadingApi();
    if (res.code === 0) {
      localStorage.setItem(`${key_word}${type}`, value); // 存储本地数据
      ElMessage.success('设置成功');
    }

    return res;
  }
}
