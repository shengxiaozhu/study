/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/
import axios from 'axios';
import Cookies from 'js-cookie';
import qs from 'qs';
import { loadingApi } from '@/utils/useLoading';
import { getUserToken } from '@/utils/login';
const { search } = window.location;
const wfid = search.indexOf('wfid=5') !== -1 ? '5,6' : '1,2,3,4,7,8,9,10,11'; // 判断自动投放

const LOGIN_URL = import.meta.env.VITE_APP_BASE_LOGIN;
const baseURL = import.meta.env.VITE_APP_BASE_API;
// let userToken =
// 创建请求实例
const instance = axios.create({
  baseURL,
  // 指定请求超时的毫秒数
  timeout: 30000,
  // 请求时是否需要使用凭证 cookies
  withCredentials: true,
});

// 前置拦截器（发起请求之前的拦截）
instance.interceptors.request.use(
  (config) => {
    /**
     * 在这里一般会携带前台的参数发送给后台，比如下面这段代码：
     * const token = getToken()
     * if (token) {
     *  config.headers.token = token
     * }
     */
    if (!config.params) {
      config.params = {};
    }

    const userToken = getUserToken();

    config.params = Object.assign({}, config.params, userToken);
    // if (import.meta.env.MODE === 'production') {
    //   // 正式环境验证方式
    //   config.params = Object.assign({}, config.params, userToken, signT, { wfid });
    // } else {
    //   // 测试环境验证方式
    //   config.headers = Object.assign({}, config.headers, userToken, signT);
    //   config.params = Object.assign({}, config.params, { wfid });
    // }

    return config;
  },
  (error) => {
    if (loadingApi) {
      loadingApi.close();
    }
    return Promise.reject(error);
  },
);

// 后置拦截器（获取到响应时的拦截）
instance.interceptors.response.use(
  (response) => {
    /**
     * 根据你的项目实际情况来对 response 和 error 做处理
     * 这里对 response 和 error 不做任何处理，直接返回
     */
    const res = response.data;
    if (res.code === 401 || response.status === 401) {
      // TODO
      console.log(response, '401');
      const _url = window.location.href;
      const href = `${LOGIN_URL}&_url=${encodeURIComponent(_url)}`;

      Cookies.remove('sso_user_id');
      Cookies.remove('token');
      localStorage.removeItem('workFlowUserInfo');

      // return;
      window.location.href = href;
      return Promise.reject(res);
    }
    if (res.code !== 0 && res.code !== 401) {
      if (loadingApi) {
        loadingApi.close();
      }
      ElMessage.error(res.message || res.comment);
      return Promise.reject(res);
    }
    // console.log('sdasdasdasdasdsads');
    return res;
  },
  (error) => {
    console.log(error, 'error');
    if (loadingApi) {
      loadingApi.close();
    }
    if (error.response.status === 401) {
      console.log('error401');
      Cookies.remove('sso_user_id');
      Cookies.remove('token');
      localStorage.removeItem('workFlowUserInfo');
      const _url = window.location.href;
      const href = `${LOGIN_URL}&_url=${encodeURIComponent(_url)}`;
      // return;
      window.location.href = href;
    } else {
      let { message } = error;
      if (error.response.status('403')) {
        message = '无权限,请连接系统管理员';
      }
      ElMessage.warning(message || '请求超时，请稍后重试');
    }
    // console.log('454545454545');
    return Promise.reject(error);
  },
);

// 导出常用函数

/**
 * @param {string} url
 * @param {object} data
 */
export function post(url: string, data: any = {}, config: any = {}) {
  if(data.env === 'development'){
    config.baseURL = 'http://192.168.1.115:8082/workflow/'
  }
  return instance({
    method: 'post',
    url,
    data: qs.stringify(data),
    ...config,
  });
}

/**
 * @param {string} url
 * @param {object} params
 */
export function get(url: string, params = {}) {
  return instance({
    method: 'get',
    url,
    params,
  });
}

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function put(url: string, data = {}, params = {}) {
  return instance({
    method: 'put',
    url,
    params,
    data,
  });
}

/**
 * @param {string} url
 * @param {object} params
 */
export function _delete(url: string, params = {}) {
  return instance({
    method: 'delete',
    url,
    params,
  });
}

/**
 * @param {string} url
 * @param {string} method
 * @param {object} params
 */
export function service(method: string, url: string, data = {}) {
  const obj: any = {
    method,
    url,
  };
  if (method.toUpperCase() === 'GET') {
    obj.params = data;
  } else {
    obj.data = qs.stringify(data);
  }
  return instance(obj);
}

export default instance;
