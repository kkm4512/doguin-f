export const fetchData = async ():Promise<ApiResponse> => {
  const { public: { baseTest } } = useRuntimeConfig()
  const data = await $fetch<ApiResponse>(`${baseTest}/test/data`) // 전역 baseApi를 사용하여 API 호출
  return data
}

export interface ApiResponse {
  code: number
  message: string
  data: string
}



