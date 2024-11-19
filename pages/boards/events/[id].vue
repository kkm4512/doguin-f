<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AnswerResponse, BoardWithAnswer } from '../[id].vue';

// 현재 라우트 정보에서 ID 가져오기
const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

// API에서 받아온 게시글 데이터를 저장할 ref
const eventBoardData = ref<BoardEnvetWithAnswer | null>(null);



export interface ApiResponse<T> {
  code: number
  message: string
  data: T;
}

export interface BoardEnvetWithAnswer {
    id: number;
    title: string;
    content: string;
    view: number;
    isBookmarked: boolean; // 북마크 상태 추가
    response: AnswerResponse;
    filePaths: string[];
};

// 새로운 댓글 내용을 저장할 ref
const newComment = ref('');

// API 요청 함수: 게시글 데이터 가져오기
const fetchEventBoardData = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const response: ApiResponse<BoardEnvetWithAnswer> = await $fetch(`/boards/events/${id}`, {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      mode: 'cors'
    });
    eventBoardData.value = response.data;
  } catch (error) {
    console.error('Error fetching event board data:', error);
  }
};

// 게시글 삭제 함수
const deleteEventBoard = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/boards/events/${id}`, {
      method: 'DELETE',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      mode: 'cors'
    });
    alert('게시글이 삭제되었습니다.');
    router.push("/"); // 삭제 후 이벤트 게시글 목록 페이지로 이동
  } catch (error) {
    console.error('Error deleting event board:', error);
    alert('게시글 삭제에 실패했습니다.');
  }
};

// 게시글 수정 페이지로 이동
const goToEditEventPage = () => {
  router.push(`/boards/events/edit/${id}`);
};

// 댓글 작성 함수
const submitComment = async () => {
  const token = localStorage.getItem('jwt');
  if (!newComment.value) return;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/events/${id}/answer`, {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: { content: newComment.value },
      mode: 'cors'
    });

    await fetchEventBoardData(); // 댓글 작성 후 게시글 데이터 다시 불러오기
    newComment.value = '';
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
};

// 페이지 로드 시 API 요청
onMounted(fetchEventBoardData);
</script>

<template>
  <div v-if="eventBoardData" class="flex justify-center items-center min-h-screen bg-gray-100 p-6">
    <div class="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100">
      <h5 class="text-3xl font-bold tracking-tight text-gray-900 mb-4 text-center">{{ eventBoardData.title }}</h5>
      <p class="font-normal text-gray-700 mb-4 text-justify">{{ eventBoardData.content }}</p>

      <div class="flex justify-between items-center text-sm text-gray-500 mb-6">
        <span>Views: {{ eventBoardData.view }}</span>
      </div>

      <div class="flex justify-between mb-6">
        <button @click="deleteEventBoard" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>
        <button @click="goToEditEventPage" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">수정</button>
      </div>

      <div>
        <h2 class="text-xl font-semibold tracking-tight text-gray-900 mb-2">파일 목록</h2>
        <div class="flex flex-wrap gap-4">
          <div v-for="(filePath, index) in eventBoardData.filePaths" :key="index" class="flex-shrink-0">
            <img
              :src="filePath"
              alt="Uploaded Image"
              class="w-24 h-24 object-cover border border-gray-200 rounded shadow cursor-pointer hover:opacity-75"
            />
          </div>
        </div>
      </div>

      <div class="mb-6 mt-5">
        <h2 class="text-xl font-semibold tracking-tight text-gray-900 mb-2">댓글 목록</h2>
        <ul class="list-disc list-inside space-y-2">
          <li v-for="(response) in eventBoardData.response.content" :key="response.id" class="font-normal text-gray-700">
            {{ response.content }}
          </li>
        </ul>

        <div class="mt-4">
          <input v-model="newComment" type="text" placeholder="댓글을 입력하세요" class="w-full p-2 border rounded mb-2" />
          <button @click="submitComment" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">댓글 달기</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center min-h-screen">
    <p>Loading...</p>
  </div>
</template>

<style scoped>
button {
  transition: background-color 0.2s;
}
</style>
