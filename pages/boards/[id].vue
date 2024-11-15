<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 모달 상태 관리
const isModalOpen = ref(false);
const selectedFile = ref<string | undefined>(undefined);

// 모달 열기
const openModal = (filePath: string) => {
  selectedFile.value = filePath;
  isModalOpen.value = true;
};

// 모달 닫기
const closeModal = () => {
  isModalOpen.value = false;
  selectedFile.value = undefined;
};

interface AnswerResponse {
  content: {
    id: string;
    content: string;
  }[];
}

export interface BoardWithAnswer {
  data: {
    id: number;
    title: string;
    content: string;
    view: number;
    isBookmarked: boolean; // 북마크 상태 추가
    response: AnswerResponse;
    filePaths: string[];
  };
}

// 현재 라우트 정보에서 id 가져오기
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

// API에서 받아온 게시글 데이터를 저장할 ref
const boardData = ref<BoardWithAnswer | null>(null);

// 새로운 댓글 내용을 저장할 ref
const newComment = ref('');

// API 요청 함수: 게시글 데이터 가져오기
const fetchBoardData = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    boardData.value = await $fetch(`/boards/bulletins/${id}`, {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
    });
  } catch (error) {
    console.error('Error fetching board data:', error);
  }
};

// 게시글 삭제 함수
const deleteBoard = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi,baseFrontUrl } } = useRuntimeConfig();
    await $fetch(`/boards/bulletins/${id}`, {
      method: 'DELETE',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
    });
    alert('게시글이 삭제되었습니다.');
    router.push(baseFrontUrl); // 삭제 후 목록 페이지로 이동
  } catch (error) {
    console.error('Error deleting board:', error);
    alert('게시글 삭제에 실패했습니다.');
  }
};

// 게시글 수정 페이지로 이동
const goToEditPage = () => {
  router.push(`/boards/edit/${id}`);
};

// 댓글 작성 함수
const submitComment = async () => {
  const token = localStorage.getItem('jwt');
  if (!newComment.value) return;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/boards/${id}/answer`, {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: JSON.stringify({ content: newComment.value }),
    });

    await fetchBoardData();
    newComment.value = '';
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
};

// 북마크 토글 함수
const toggleBookmark = async (targetId: number, target: string) => {
  const token = localStorage.getItem('jwt');
  if (!boardData.value) return;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/bookmarks`, {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: {
        targetId, // 북마크할 대상 ID
        target,   // 북마크 타겟 타입
      },
    });

    // 북마크 상태를 반전
    boardData.value.data.isBookmarked = !boardData.value.data.isBookmarked;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
  }
};

// 페이지 로드 시 API 요청을 위해 onMounted 훅 사용
onMounted(fetchBoardData);
</script>

<template>
  <div v-if="boardData" class="flex justify-center items-center min-h-screen bg-gray-100 p-6">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <h5 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 text-center">{{ boardData.data.title }}</h5>
      <p class="font-normal text-gray-700 dark:text-gray-400 mb-4 text-justify">{{ boardData.data.content }}</p>

      <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        <span>Views: {{ boardData.data.view }}</span>

        <button
          v-if="boardData && boardData.data.id"
          @click="() => toggleBookmark(boardData?.data.id!, 'BULLETIN')"
          :class="[
            'px-4 py-2 rounded text-white',
            boardData.data.isBookmarked ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-400 hover:bg-gray-500',
          ]"
        >
          {{ boardData.data.isBookmarked ? '북마크 취소' : '북마크' }}
        </button>
      </div>

      <div class="flex justify-between mb-6">
        <button @click="deleteBoard" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>
        <button @click="goToEditPage" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">수정</button>
      </div>

      <div>
        <h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">파일 목록</h2>
        <div class="flex flex-wrap gap-4">
          <div v-for="(filePath, index) in boardData.data.filePaths" :key="index" class="flex-shrink-0">
            <img
              :src="filePath"
              alt="Uploaded Image"
              class="w-24 h-24 object-cover border border-gray-200 rounded shadow cursor-pointer hover:opacity-75"
              @click="openModal(filePath)"
            />
          </div>
        </div>
      </div>

      <div class="mb-6 mt-5">
        <h2 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">댓글목록</h2>
        <ul class="list-disc list-inside space-y-2">
          <li v-for="(response) in boardData.data.response.content" :key="response.id" class="font-normal text-gray-700 dark:text-gray-400">
            {{ response.content }}
          </li>
        </ul>

        <div class="mt-4">
          <input v-model="newComment" type="text" placeholder="댓글을 입력하세요" class="w-full p-2 border rounded mb-2" />
          <button @click="submitComment" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">댓글 달기</button>
        </div>
      </div>

      <!-- 모달 -->
      <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
          <button class="absolute top-2 right-2 text-gray-500 hover:text-gray-700" @click="closeModal">✕</button>
          <img :src="selectedFile" alt="Preview" class="w-full h-auto mb-4" />
          <a :href="selectedFile" target="_blank" class="text-blue-500 hover:underline">원본 파일 보기</a>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center min-h-screen">
    <p>Loading...</p>
  </div>
</template>

<style lang="postcss" scoped>
button {
  transition: background-color 0.2s;
}
</style>
