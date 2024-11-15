<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 로그인 상태 확인: jwt 값이 있는지 여부를 확인하여 상태 설정
const isLoggedIn = computed(() => {
  return process.client && localStorage.getItem('jwt') !== null;
});

// 페이지 이동 함수
const goToSignup = () => {
  router.push('/signup');
};

const goToSignin = () => {
  router.push('/signin');
};

// 로그아웃 함수: jwt 삭제 및 페이지 새로고침
const logout = () => {
  localStorage.removeItem('jwt');
  window.location.reload();
};

// 글 작성 드롭다운 메뉴 상태 및 제어 함수
const showDropdown = ref(false);
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// 글 작성 페이지 이동 함수
const goToWritePage = (type) => {
  showDropdown.value = false; // 드롭다운 닫기
  switch (type) {
    case 'event':
      router.push('/boards/event');
      break;
    case 'inquiry':
      router.push('/boards/inquiry');
      break;
    case 'bulletin':
      router.push('/boards/bulletin');
      break;
      case 'notice':
      router.push('/boards/notice');
      break;      
    default:
      break;
  }
};
</script>

<template>
  <nav class="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="/" class="flex items-center space-x-3 ml-3">
        <img src="/logo.png" />
      </a>
      <button data-collapse-toggle="navbar-dropdown" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-dropdown" aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
      </button>
      <div class="hidden w-full md:block md:w-auto" id="navbar-dropdown">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
          <li>
            <a href="/" class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" aria-current="page">Home</a>
          </li>
          <li>
            <!-- 글 작성 드롭다운 메뉴 토글 버튼 -->
            <button @click="toggleDropdown" class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              글 작성 <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            <!-- Dropdown menu (v-show로 제어) -->
            <div v-show="showDropdown" class="z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-400">
                <li>
                  <a @click="goToWritePage('event')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">이벤트 작성</a>
                </li>
                <li>
                  <a @click="goToWritePage('inquiry')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">문의 작성</a>
                </li>
                <li>
                  <a @click="goToWritePage('bulletin')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">게시글 작성</a>
                </li>
                <li>
                  <a @click="goToWritePage('notice')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">공지글 작성</a>
                </li>                
              </ul>
            </div>
          </li>
          <li>
            <a href="/services" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Services</a>
          </li>
          <li>
            <a href="/pricing" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Pricing</a>
          </li>
          <li>
            <a href="/contact" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Contact</a>
          </li>
        </ul>
      </div>

      <!-- 오른쪽 상단 고정 회원가입 및 로그인/로그아웃 버튼 -->
      <div class="flex space-x-3">
        <!-- 로그인 상태에 따른 조건부 렌더링 -->
        <button v-if="!isLoggedIn" @click="goToSignin" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          로그인
        </button>
        <button v-else @click="logout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          로그아웃
        </button>
        
        <!-- 회원가입 버튼 (항상 표시) -->
        <button @click="goToSignup" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          회원가입
        </button>
      </div>
    </div>
  </nav>

  <!-- 페이지 콘텐츠 -->
  <NuxtPage />
</template>

<style scoped>
/* 추가적인 스타일링이 필요한 경우 여기에 작성할 수 있습니다 */
</style>
