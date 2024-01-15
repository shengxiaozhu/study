import { post } from './request';

/** 添加列表及按钮自定义配置
 *
 * @param {string} key_word 每个列表的唯一key
 * @param {string} type 存储类型
 * @param {string} value JSON字符串
 * @returns
 *
 */
export const addListCustom = (data: any) => post('/service?name=cross&action=addListCustom', data);

/** 获取列表及按钮自定义配置信息
 *
 * @param {string} key_word 每个列表的唯一key
 * @returns
 *
 */
export const getListCustom = (data: any) => post('/service?name=cross&action=getListCustom', data);
