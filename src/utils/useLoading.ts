import { ElLoading } from "element-plus";

// option参数
type OptionParameter<T extends (option: any) => any> = T extends (option: infer P) => any ? P : never
// 输入参数
type LoadingOption = OptionParameter<typeof ElLoading.service>
// 返回参数
type LoadingResult = ReturnType<typeof ElLoading.service>

let loadingApi: LoadingResult

const showLoadingApi = (config: LoadingOption = { body: true, lock: true, text: 'Loading', spinner: '', background: 'rgba(0,0,0,0.7)' }) => {
  loadingApi = ElLoading.service(config)
}

const hideLoadingApi = () => {
  if (loadingApi) {
    loadingApi.close()
  }
}

export { showLoadingApi, hideLoadingApi, loadingApi }