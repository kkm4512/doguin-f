<template>
  <nav class="border-gray-200 dark:bg-gray-900 dark:border-gray-700">
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
            <button @click="toggleDropdown" class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              글 작성 <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
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
                  <a @click="goToWritePage('notices')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">공지글 작성</a>
                </li>                
              </ul>
            </div>
          </li>
          <li>
            <button @click="toggleOutsourcingDropdown" class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              외주/공고 <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            <div v-show="showOutsourcingDropdown" class="z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-400">
                <li>
                  <a @click="goToOutsourcingPage('create')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">외주 작성</a>
                </li>
                <li>
                  <a @click="goToOutsourcingPage('portfolio')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">포트폴리오 작성</a>
                </li>
                <li>
                  <a @click="goToOutsourcingPage('recruitment')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">채용/공고 확인</a>
                </li>
                <li>
                  <a @click="goToOutsourcingPage('matching')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">매칭 목록</a>
                </li>                
              </ul>
            </div>
          </li>
          <button @click="toggleReportDropdown" class="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
              신고 <svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
              </svg>
          </button>            
          <div v-show="showReportDropdown" class="z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600 mt-2">
              <ul class="py-2 text-sm text-gray-700 dark:text-gray-400">
                <li>
                  <a @click="goToReportPage('user')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">내 신고내역 확인</a>
                </li>
                <li>
                  <a @click="goToReportPage('admin')" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer">관리자 확인 (신고내역)</a>
                </li>
              </ul>
            </div>   
        </ul>
      </div>

      <div class="flex space-x-3 items-center">
        <button v-if="!isLoggedIn" @click="goToSignin" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          로그인 
        </button>
        <button v-else @click="logout" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          로그아웃
        </button>
        <button @click="goToSignup" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          회원가입
        </button>
        <span v-if="isLoggedIn && nickname" class="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-full shadow-md font-medium">
          <img 
            v-if="providerLogo" 
            :src="providerLogo" 
            alt="Provider Logo" 
            class="w-5 h-5 rounded-full"
          />
          <span>{{ nickname }}</span>
        </span>
      </div>
    </div>
  </nav>
  <NuxtPage />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();
const token = ref(null);
const nickname = ref(null);
const providerLogo = ref(null);

const isLoggedIn = computed(() => token.value !== null);

const getProviderLogo = (email) => {
  if (email.endsWith('kakao.com')) {
    return '/kakao-logo.png';
  } else if (email.endsWith('naver.com')) {
    return '/naver-logo.png';
  } else if (email.endsWith('gmail.com')) {
    return '/google-logo.png';
  } else if (email.endsWith('github.com')) {
    return '/github-logo.png';
  } else {
    return '/default-logo.png';
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      const decoded = jwtDecode(jwt);
      token.value = jwt;
      nickname.value = decoded.nickname;
      providerLogo.value = getProviderLogo(decoded.email || '');
    }
  }
});

const showDropdown = ref(false);
const showOutsourcingDropdown = ref(false);
const showReportDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const toggleOutsourcingDropdown = () => {
  showOutsourcingDropdown.value = !showOutsourcingDropdown.value;
};

const toggleReportDropdown = () => {
  showReportDropdown.value = !showReportDropdown.value;
};

const goToWritePage = (type) => {
  showDropdown.value = false;
  router.push(`/boards/${type}`);
};

const goToOutsourcingPage = (type) => {
  showOutsourcingDropdown.value = false;
  switch (type) {
    case 'create':
      router.push('/outsourcings/create');
      break;
    case 'portfolio':
      router.push('/outsourcings/portfolio');
      break;
    case 'recruitment':
      router.push('/outsourcings/recruitment');
      break;
    case 'matching':
      router.push('/outsourcings/matching');
      break;      
    default:
      break;
  }
};

const goToReportPage = (type) => {
  showReportDropdown.value = false;
  switch (type) {
    case 'user':
      router.push('/reports/user');
      break;
    case 'admin':
      router.push('/reports/admin');
      break;    
    default:
      break;
  }
};

const logout = () => {
  localStorage.removeItem('jwt');
  window.location.reload();
};

const goToSignin = () => router.push('/signin');
const goToSignup = () => router.push('/signup');
</script>
