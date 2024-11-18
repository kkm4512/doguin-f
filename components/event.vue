<script lang="ts" setup>
import { ref, onMounted } from 'vue';

// 이벤트 게시글 응답 타입 정의
interface BoardCommonResponse {
  id: number;
  title: string;
}

// ApiResponse 타입 정의
interface ApiResponse<T> {
  message: string;
  data: {
    content: T[];        // 페이지 데이터
    totalPages: number;  // 전체 페이지 수
    totalElements: number; // 전체 데이터 수
    currentPage: number; // 현재 페이지
  };
}

// 이벤트 게시글 데이터 저장
const eventBoards = ref<BoardCommonResponse[]>([]);

// 이벤트 게시글 API 요청 함수
const fetchEventBoards = async () => {
  const { public: { baseApi } } = useRuntimeConfig();
  try {
    const response = await $fetch<ApiResponse<BoardCommonResponse>>('/boards/events', {
      baseURL: baseApi,
      query: {
        page: 1, // 1페이지
        size: 5, // 최대 5개씩 표시
      },
    });

    eventBoards.value = response.data.content; // 이벤트 게시글 데이터 저장
  } catch (error) {
    console.error('Error fetching event boards:', error);
  }
};

// 페이지 로드 시 API 호출
onMounted(() => {
  fetchEventBoards();
});
</script>

<template>
  <div class="fixed right-4 top-16 bg-white shadow-lg rounded-lg p-4 w-64">
    <h3 class="text-lg font-bold mb-2">🎉 이벤트 게시글</h3>
    <ul>
      <li
        v-for="board in eventBoards"
        :key="board.id"
        class="mb-2 bg-gray-100 p-2 rounded hover:bg-gray-200"
      >
        <a :href="'/boards/events/' + board.id" class="text-blue-500 hover:underline">
          {{ board.title }}
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 고정된 이벤트 게시글 상자 스타일 */
.fixed {
  position: fixed;
}
.right-4 {
  right: 1rem;
}
.top-16 {
  top: 4rem;
}
.w-64 {
  width: 16rem;
}

/* 리스트 스타일 */
ul {
  list-style-type: none;
  padding: 0;
}

li {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

li:hover {
  background-color: #e2e8f0; /* hover 효과 */
}
</style>
