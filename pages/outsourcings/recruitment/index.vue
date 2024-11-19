<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

// 외주 응답 타입 정의
export interface OutsourcingCommonResponse {
  data: {
    content: {
      id: number;
      title: string;
      price: number;
      area: string;
    }[];
    page: {
      totalPages: number;
      totalElements: number;
    }
  }
}

// 외주 데이터를 저장할 배열
const outsourcings = ref<{ id: number; title: string; price: number; area: string }[]>([]);
const currentPage = ref(1); // 현재 페이지
const totalPages = ref(1); // 전체 페이지 수

// API 요청 함수
const fetchOutsourcings = async (page: number) => {
  const { public: { baseApi } } = useRuntimeConfig();
  try {
    // API 요청
    const response: OutsourcingCommonResponse = await $fetch('/outsourcings', {
      baseURL: baseApi,
      query: {
        page: page - 1, // API는 0-based page 처리
        size: 10,
        sort: 'desc',
      },
      mode: 'cors'
    });
    outsourcings.value = response.data.content.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      area: item.area,
    }));
    totalPages.value = response.data.page.totalPages;
    currentPage.value = page;
  } catch (error) {
    console.error('Error fetching outsourcing data:', error);
  }
};

// 페이지네이션 범위 계산
const pageRange = computed(() => {
  const range = [];
  for (let i = 1; i <= totalPages.value; i++) {
    range.push(i);
  }
  return range;
});

// 다음 페이지로 이동
const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchOutsourcings(currentPage.value + 1);
  }
};

// 이전 페이지로 이동
const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    fetchOutsourcings(currentPage.value - 1);
  }
};

// 페이지 로드 시 API 요청
onMounted(() => fetchOutsourcings(currentPage.value));
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100 py-8">
    <div class="w-full max-w-md space-y-6">
      <!-- 외주 리스트 렌더링 -->
      <div
        v-for="outsourcing in outsourcings"
        :key="outsourcing.id"
        class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6"
      >
        <a :href="'/outsourcings/recruitment/' + outsourcing.id">
          <h5 class="text-2xl font-bold mb-4 text-gray-900 dark:text-black">{{ outsourcing.title }}</h5>
          <p class="text-gray-700">Price: {{ outsourcing.price }}</p>
          <p class="text-gray-700">Area: {{ outsourcing.area }}</p>
        </a>
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-between items-center mt-6">
        <!-- 이전 페이지 버튼 -->
        <button
          :disabled="currentPage === 1"
          @click="goToPreviousPage"
          class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>

        <!-- 현재 페이지와 전체 페이지 -->
        <span class="text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>

        <!-- 다음 페이지 버튼 -->
        <button
          :disabled="currentPage === totalPages"
          @click="goToNextPage"
          class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 기본 버튼 스타일과 페이지네이션 관련 스타일 */
button {
  transition: all 0.2s;
}
button:disabled {
  background-color: #d1d5db; /* 비활성화 상태 배경 */
  cursor: not-allowed;
}
</style>
