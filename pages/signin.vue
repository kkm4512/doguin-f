<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6 text-center">로그인</h2>
      <form @submit.prevent="signin">
        <!-- Email Field -->
        <div class="mb-4">
          <label for="email" class="block text-gray-600 mb-2">이메일</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이메일을 입력해주세요."
          />
        </div>
        <!-- Password Field -->
        <div class="mb-6">
          <label for="password" class="block text-gray-600 mb-2">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 입력해주세요."
          />
        </div>
        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          로그인
        </button>
      </form>
      <p v-if="errorMessage" class="text-red-500 mt-4 text-center">{{ errorMessage }}</p>

      <!-- Social Login Buttons -->
      <div class="mt-6 flex justify-around">
        <!-- Kakao Login -->
        <button
          @click="kakaoLogin"
          class="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-500 transition duration-200"
          aria-label="카카오 로그인"
        >
          <img src="/kakao-logo.png" alt="Kakao" class="w-6 h-6" />
        </button>
        <!-- Naver Login -->
        <button
          @click="naverLogin"
          class="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 transition duration-200"
          aria-label="네이버 로그인"
        >
          <img src="/naver-logo.png" alt="Naver" class="w-6 h-6" />
        </button>
        <!-- Github Login -->
        <button
          @click="githubLogin"
          class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-900 transition duration-200"
          aria-label="깃허브 로그인"
        >
          <img src="/github-logo.png" alt="Github" class="w-6 h-6" />
        </button>
        <!-- Google Login -->
        <button
          @click="googleLogin"
          class="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-300 hover:bg-gray-100 transition duration-200"
          aria-label="구글 로그인"
        >
          <img src="/google-logo.png" alt="Google" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const signin = async () => {
  const { public: { baseApi } } = useRuntimeConfig();
  try {
    const response = await fetch(`${baseApi}/auth/signin`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    const token = response.headers.get('Authorization');
    if (token) {
      console.log('토큰:', token);
      localStorage.setItem('jwt', token);
      window.location.href = '/';
    } else {
      errorMessage.value = 'JWT 토큰을 받을 수 없습니다.';
    }
  } catch (error) {
    console.error('로그인 실패:', error);
    errorMessage.value = '로그인 실패. 이메일과 비밀번호를 확인해주세요.';
  }
};

// 각 플랫폼 로그인 함수
const kakaoLogin = () => {
  const { public: { kakaoLoginUrl } } = useRuntimeConfig();
  window.location.href = kakaoLoginUrl + `&state=${window.location.origin}`;
};

const naverLogin = () => {
  const { public: { naverLoginUrl } } = useRuntimeConfig();
  window.location.href = naverLoginUrl + `&state=${window.location.origin}`;
};

const githubLogin = () => {
  const { public: { githubLoginUrl } } = useRuntimeConfig();
  window.location.href = githubLoginUrl + `&state=${window.location.origin}`;
};

const googleLogin = () => {
  const { public: { googleLoginUrl } } = useRuntimeConfig();
  window.location.href = googleLoginUrl + `&state=${window.location.origin}`;
};
</script>

<style scoped>
/* Social button hover transition */
button[aria-label] img {
  transition: transform 0.2s;
}

button[aria-label]:hover img {
  transform: scale(1.1);
}
</style>
