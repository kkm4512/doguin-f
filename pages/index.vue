<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';

// 게시글 응답 타입 정의
export interface BoardCommonResponse {
  data: {
    content: {
      id: number;
      title: string;
    }[];
      totalPages: number;
      totalElements: number;
  };
}


// ApiResponse 인터페이스
export interface ApiResponse<T> {
  message: string; // 응답 메시지
  data: T;         // 제네릭 데이터
}

// Page 인터페이스
export interface Page<T> {
  content: T[];       // 페이지의 데이터 리스트
  totalPages: number; // 전체 페이지 수
  totalElements: number; // 전체 데이터 수
  currentPage: number; // 현재 페이지
}

// Long 타입을 기반으로 한 최종 타입
export type Long = number; // Java의 Long 타입을 JavaScript의 number로 매핑

// 최종 타입 정의
export type PopularBoardResponse = ApiResponse<Page<Long>>;

// 게시글 데이터 타입 정의
export interface BoardResponse {
  id: number;
  title: string;
}

// 게시글 데이터를 저장할 배열
const boards = ref<{ id: number; title: string }[]>([]);
const currentPage = ref(1); // 현재 페이지
const totalPages = ref(1); // 전체 페이지 수
const searchQuery = ref(''); // 검색어

// 인기 게시글 데이터 저장
const popularBoards = ref<BoardResponse[]>([]);

// 게시글 API 요청 함수
const fetchBoardTitles = async (page: number, title = '') => {
  const { public: { baseApi } } = useRuntimeConfig();
  try {
    const endpoint = title ? '/boards/bulletins/search' : '/boards/bulletins';
    const response: BoardCommonResponse = await $fetch(endpoint, {
      baseURL: baseApi,
      query: {
        page: page, // API 요청은 0-based page 처리
        size: 10,
        title, // 검색어 추가
      },
    });
    boards.value = response.data.content.map((item) => ({
      id: item.id,
      title: item.title,
    }));
    totalPages.value = response.data.totalPages;
    currentPage.value = page;
  } catch (error) {
    console.error('Error fetching board titles:', error);
  }
};

// 인기 게시글 ID로 제목 가져오기
const fetchPopularBoards = async () => {
  const { public: { baseApi } } = useRuntimeConfig();
  try {
    const response: PopularBoardResponse = await $fetch('/boards/bulletins/popular', {
      baseURL: baseApi,
      query: {
        page: 1, // 1페이지
        size: 3, // 3개씩 가져옴
      },
    });

    const boardIds: number[] = response.data.content; // 인기 게시글 ID 배열
    console.log(boardIds)

    if (boardIds.length >= 1) {}
    // ID를 통해 제목 가져오기, 유효한 게시글만 필터링
    const promises = boardIds.map(async (id) => {
      try {
        const response = await $fetch<ApiResponse<BoardResponse>>(`/boards/bulletins/${id}`, {
          baseURL: baseApi,
        });
        return response.data; // 정상적으로 가져온 게시글 데이터 반환
      } catch (error) {
        console.error(`Failed to fetch board with ID ${id}:`, error);
        return null; // 실패 시 null 반환
      }
    });

    // 모든 요청 완료 후 null이 아닌 데이터만 필터링
    const results = await Promise.all(promises);
    popularBoards.value = results.filter((board) => board !== null); // 유효한 게시글만 저장
  } catch (error) {
    console.error('Error fetching popular boards:', error);
  }
};




// 검색 함수
const searchBoards = () => {
  fetchBoardTitles(1, searchQuery.value);
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
    fetchBoardTitles(currentPage.value + 1, searchQuery.value);
  }
};

// 이전 페이지로 이동
const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    fetchBoardTitles(currentPage.value - 1, searchQuery.value);
  }
};

// 페이지 로드 시 API 요청
onMounted(() => {
  fetchBoardTitles(currentPage.value);
  fetchPopularBoards();
});
</script>

<template>
  <div class="relative">
    <!-- 인기 게시글 상자 -->
    <div class="fixed left-12 top-32 bg-white shadow-lg rounded-lg p-4 w-64">
      <h3 class="text-lg font-bold mb-2">🔥 인기 게시글</h3>
      <ul>
        <li
          v-for="board in popularBoards"
          :key="board.id"
          class="mb-2 bg-gray-100 p-2 rounded hover:bg-gray-200"
        >
          <a :href="'/boards/' + board.id" class="text-blue-500 hover:underline">
            {{ board.title }}
          </a>
        </li>
      </ul>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div class="w-full max-w-md space-y-6">
        <!-- 검색 기능 -->
        <div class="flex items-center mb-4">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="검색어를 입력하세요"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button
            @click="searchBoards"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg"
          >
            검색
          </button>
        </div>

        <!-- 게시글 리스트 렌더링 -->
        <div
          v-for="board in boards"
          :key="board.id"
          class="bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6"
        >
          <a :href="'/boards/' + board.id">
            <h5 class="text-2xl font-bold mb-4 text-gray-900 dark:text-black">
              {{ board.title }}
            </h5>
          </a>
        </div>

        <!-- 페이지네이션 -->
        <div class="flex justify-between items-center mt-6">
          <button
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span class="text-gray-700">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
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
    <Notice />
    <Event />
  </div>
</template>

<style scoped>
/* 기본 레이아웃 스타일 */
.flex {
  display: flex;
}
.justify-center {
  justify-content: center; /* 가로 중앙 정렬 */
}
.items-center {
  align-items: center; /* 세로 중앙 정렬 */
}
.min-h-screen {
  min-height: 100vh; /* 화면 전체 높이 */
}

/* 고정된 인기 게시글 상자 스타일 */
.fixed {
  position: fixed;
}
.left-4 {
  left: 1rem;
}
.top-16 {
  top: 4rem;
}
.w-64 {
  width: 16rem;
}

/* 기본 버튼 스타일과 페이지네이션 관련 스타일 */
button {
  transition: all 0.2s;
}
button:disabled {
  background-color: #d1d5db; /* 비활성화 상태 배경 */
  cursor: not-allowed;
}
</style>
