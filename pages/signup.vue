<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold text-center text-gray-800">회원가입</h2>
        <form @submit.prevent="handleSignup" class="space-y-4">
          <!-- 이메일, 비밀번호, 닉네임 등의 필수 입력 필드 -->
          <div v-for="(field, index) in requiredFields" :key="index">
            <label :for="field.id" class="block text-sm font-medium text-gray-600">{{ field.label }}</label>
            <input
              v-model="form[field.model]"
              :type="field.type"
              :id="field.id"
              :placeholder="field.placeholder"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              :required="field.required"
            />
          </div>
  
          <!-- 파일 업로드 (선택 사항) -->
          <div>
            <label class="block text-sm font-medium text-gray-600" for="files">프로필 이미지 (선택)</label>
            <input type="file" @change="handleFileChange" multiple class="w-full text-gray-600" />
          </div>
  
          <!-- 회원가입 버튼 -->
          <button type="submit" class="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
            회원가입
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  const { public: { baseApi } } = useRuntimeConfig()
  
  const form = ref({
  email: '',
  password: '',
  nickname: '',
  userType: '',
  userRole: '',
  profileImage: '',
  introduce: '',
  homeAddress: '',
  gitAddress: '',
  blogAddress: ''
})
  
  // 업로드할 파일 리스트
  const files = ref(null)

  const requiredFields = [
  { id: 'email', label: '이메일', model: 'email', type: 'email', placeholder: '이메일을 입력해주세요', required: true },
  { id: 'password', label: '비밀번호', model: 'password', type: 'password', placeholder: '비밀번호를 입력해주세요', required: true },
  { id: 'nickname', label: '닉네임', model: 'nickname', type: 'text', placeholder: '닉네임을 입력해주세요', required: true },
  { id: 'userType', label: '유저 타입', model: 'userType', type: 'text', placeholder: '유저 타입을 입력해주세요', required: true },
  { id: 'userRole', label: '유저 역할', model: 'userRole', type: 'text', placeholder: '유저 역할을 입력해주세요', required: true },
  { id: 'profileImage', label: '프로필 이미지', model: 'profileImage', type: 'text', placeholder: '프로필 이미지 URL을 입력해주세요 옵션' },
  { id: 'introduce', label: '소개', model: 'introduce', type: 'text', placeholder: '소개를 입력해주세요 옵션' },
  { id: 'homeAddress', label: '집 주소', model: 'homeAddress', type: 'text', placeholder: '집 주소를 입력해주세요 옵션' },
  { id: 'gitAddress', label: 'Git 주소', model: 'gitAddress', type: 'text', placeholder: 'Git 주소를 입력해주세요 옵션' },
  { id: 'blogAddress', label: '블로그 주소', model: 'blogAddress', type: 'text', placeholder: '블로그 주소를 입력해주세요 옵션' },
]

  
  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    const target = event.target
    files.value = target.files
  }
  
  // 서버로 회원가입 요청을 보내는 함수
  const handleSignup = async () => {
  const formData = new FormData()

  // JSON 데이터를 문자열로 변환하여 formData에 추가
  formData.append('signupRequest', new Blob([JSON.stringify(form.value)], { type: 'application/json' }))

  // 파일이 있을 경우 formData에 추가
  if (files.value) {
    for (const file of files.value) {
      formData.append('files', file)
    }
  }

  try {
  const response = await $fetch('/auth/signup', {
    method: 'POST',
    body: formData,
    baseURL: baseApi,
    headers: {
      'Accept': 'application/json' // JSON 응답을 기대하는 경우
    },
    mode: 'cors'
  })
  console.log('회원가입 성공:', response)
  
  // 회원가입 성공 시 홈페이지로 리다이렉트
  window.location.href = '/'  // '/'는 홈페이지 경로를 나타냄
} catch (error) {
  console.error('회원가입 실패:', error)
}
}

  </script>
  
  <style scoped>
  /* 추가 스타일 필요 시 여기에 추가 */
  </style>
  