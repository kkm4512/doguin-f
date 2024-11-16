<script lang="ts" setup>
import { ref, onMounted, defineEmits } from 'vue';
import { useRuntimeConfig } from '#app';

// 인터페이스 정의
interface PortfolioResponse {
  id: number;
  title: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

type PortfolioResponseApi = ApiResponse<Page<PortfolioResponse>>;

// 데이터 상태
const portfolios = ref<PortfolioResponse[]>([]);
const selectedPortfolioId = ref<number | null>(null);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// 페이징 상태
const currentPage = ref(0);
const totalPages = ref(1);

// emit 정의
const emit = defineEmits(['portfolioSelected']);

// 포트폴리오 데이터를 가져오는 함수
const fetchPortfolios = async (page: number = 0) => {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const response: PortfolioResponseApi = await $fetch<PortfolioResponseApi>('/portfolios/my', {
      baseURL: baseApi,
      headers: {
        Authorization: localStorage.getItem('jwt') || '',
      },
      query: {
        page,
        size: 3,
        sort: 'desc',
      },
    });

    portfolios.value = response.data.content;
    totalPages.value = response.data.totalPages;
    currentPage.value = page;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    errorMessage.value = '포트폴리오 데이터를 가져오는 데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 선택된 포트폴리오 ID를 업데이트하고 부모로 전달
const selectPortfolio = (id: number) => {
  selectedPortfolioId.value = id;
  emit('portfolioSelected', id);
};

// 페이지 변경 함수
const goToPage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    fetchPortfolios(page);
  }
};

// 컴포넌트 초기화
onMounted(() => fetchPortfolios(currentPage.value));
</script>

<template>
  <div class="p-4 border-l bg-gray-50 fixed top-16 right-0 w-1/4 h-full overflow-y-auto shadow-lg">
    <h2 class="text-xl font-bold text-gray-900 mb-4">내 포트폴리오</h2>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-center text-gray-600">
      데이터를 불러오는 중입니다...
    </div>

    <!-- 오류 메시지 -->
    <div v-else-if="errorMessage" class="text-red-500 text-center">
      {{ errorMessage }}
    </div>

    <!-- 포트폴리오 목록 -->
    <div v-else>
      <ul class="space-y-2">
        <li
          v-for="portfolio in portfolios"
          :key="portfolio.id"
          class="p-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100 flex items-center justify-between"
        >
          <h3 class="text-sm font-medium text-gray-800 truncate">{{ portfolio.title }}</h3>
          <input
            type="radio"
            :value="portfolio.id"
            v-model="selectedPortfolioId"
            @change="selectPortfolio(portfolio.id)"
            class="form-radio text-blue-600"
          />
        </li>
      </ul>

      <!-- 데이터가 없을 경우 -->
      <p v-if="!portfolios.length" class="text-gray-500 text-center mt-4">
        등록된 포트폴리오가 없습니다.
      </p>
    </div>

    <!-- 페이지 네비게이션 -->
    <div class="mt-4 flex justify-center items-center space-x-4">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
      >
        이전
      </button>
      <span class="text-sm text-gray-700">페이지 {{ currentPage + 1 }} / {{ totalPages }}</span>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages - 1"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100"
      >
        다음
      </button>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
