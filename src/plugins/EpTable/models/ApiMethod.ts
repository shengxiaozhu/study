import { getListCustom, addListCustom } from '@/api/cross';
import { hideLoadingApi, showLoadingApi } from '@/utils/useLoading';
import apiStore from '@/store/modules/useApiStore';

export default class ApiMethod {
  static async getCustom(key_word: string) {
    let res: any = null;
    if (!apiStore().isApiLoading) {
      apiStore().setApiStore(true);
      showLoadingApi();
      res = await getListCustom({ key_word });
      hideLoadingApi();
      if (res.code === 0) {
        Object.entries(res.data).forEach(([key, value]: any) => {
          
          localStorage.setItem(`${key_word}${key}`, value); // 存储本地数据
        });
      }
      apiStore().setApiStore(false);
    }
    return res;
  }

  static async addCustom(key_word: string, type: string, value: string) {
    const params = {
      key_word,
      type,
      value,
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
