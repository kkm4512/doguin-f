<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRuntimeConfig } from '#app';
import { useWebSocket } from '~/composables/useWebSocket';

const applicantId = ref<number | null>(null); // 대상 사용자 ID
const chatStarted = ref<boolean>(false);

// WebSocket 유틸리티
const { connect, subscribe, sendMessage: wsSendMessage } = useWebSocket();

// 채팅방 생성 및 종료 관리
const startChat = () => {
  chatStarted.value = true;
  if (selectedMatchingId.value) {
    console.log(`채팅 시작 for Matching ID: ${selectedMatchingId.value}`);
  } else {
    console.error("매칭 ID가 선택되지 않았습니다.");
  }
};

const leaveChat = () => {
  chatStarted.value = false;

  if (selectedMatchingId.value) {
    console.log(`채팅 종료 for Room ID: ${selectedMatchingId.value}`);
    // WebSocket을 통해 "leave" 메시지 전송
    wsSendMessage('/app/chat/leave', { roomId: selectedMatchingId.value });
  }
};

interface RoomResponse {
  roomId: string;
  creatorId: number;
  applicantId: number;
  messages: MessageResponse[];
}

interface MessageResponse {
  messageId: string;
  senderId: number;
  content: string;
}

// 매칭 응답 인터페이스 정의
interface MatchingResponse {
  id: number;
  userId: number;
  portfolioId: number;
  outsourcingId: number;
  status: 'READY' | 'YES' | 'NO'; // 매칭 상태
  username: string;
  portfolioTitle: string;
  outsourcingTitle: string;
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

// 상태 관리
const matchings = ref<MatchingResponse[]>([]);
const selectedMatchingId = ref<number | null>(null); // 선택된 매칭 ID
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const currentPage = ref(0);
const totalPages = ref(1);
const selectedStatus = ref<string | null>(null); // 상태 필터링

watch(selectedMatchingId, (newValue) => {
  applicantId.value = newValue;
});

// API 요청 함수
const fetchMatchings = async (page = 0, status: string | null = null) => {
  isLoading.value = true;
  errorMessage.value = null;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const response: ApiResponse<Page<MatchingResponse>> = await $fetch('/matchings', {
      baseURL: baseApi,
      headers: {
        Authorization: localStorage.getItem('jwt') || '',
      },
      query: {
        page,
        size: 10,
        sort: 'desc',
        status, // 선택된 상태 필터 추가
      },
      mode: 'cors'
    });

    matchings.value = response.data.content;
    totalPages.value = response.data.totalPages;
    currentPage.value = page;
  } catch (error) {
    console.error('Error fetching matchings:', error);
    errorMessage.value = '매칭 데이터를 가져오는 데 실패했습니다.';
  } finally {
    isLoading.value = false;
  }
};

// 매칭 상태 업데이트 함수
const updateMatchingStatus = async (status: 'YES' | 'NO') => {
  if (selectedMatchingId.value === null) {
    alert('먼저 매칭을 선택하세요.');
    return;
  }

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/matchings/${selectedMatchingId.value}`, {
      method: 'PUT',
      baseURL: baseApi,
      headers: {
        Authorization: localStorage.getItem('jwt') || '',
        'Content-Type': 'application/json',
      },
      body: { status },
      mode: 'cors'
    });

    alert(`매칭이 ${status === 'NO' ? '거절' : '수락'}되었습니다.`);
    fetchMatchings(currentPage.value, selectedStatus.value); // 목록 갱신
    selectedMatchingId.value = null; // 선택 초기화
  } catch (error) {
    console.error('Error updating matching status:', error);
    alert('매칭 상태를 업데이트하는 데 실패했습니다.');
  }
};

// 페이지 이동 함수
const goToPage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    fetchMatchings(page, selectedStatus.value);
  }
};

// 상태 필터 변경
const updateStatusFilter = (status: string | null) => {
  selectedStatus.value = status;
  fetchMatchings(0, status); // 상태 변경 시 첫 페이지로 이동
};

// 컴포넌트 초기화
onMounted(() => {
  fetchMatchings();
});
</script>

<template>
  <div class="p-4 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">매칭 목록</h1>

    <!-- 필터 -->
    <div class="mb-4 flex items-center space-x-4">
      <label for="statusFilter" class="text-sm font-medium text-gray-700">상태:</label>
      <select
        id="statusFilter"
        v-model="selectedStatus"
        @change="updateStatusFilter(selectedStatus)"
        class="p-2 border rounded"
      >
        <option value="">전체</option>
        <option value="READY">대기</option>
        <option value="YES">수락됨</option>
        <option value="NO">거절됨</option>
      </select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-center text-gray-600">
      데이터를 불러오는 중입니다...
    </div>

    <!-- 오류 메시지 -->
    <div v-else-if="errorMessage" class="text-red-500 text-center">
      {{ errorMessage }}
    </div>

    <!-- 매칭 목록 -->
    <div v-else>
      <ul class="space-y-2">
        <li
          v-for="matching in matchings"
          :key="matching.id"
          class="p-2 bg-white border rounded shadow hover:bg-gray-100 flex items-center justify-between"
        >
          <input
            type="radio"
            :value="matching.id"
            v-model="selectedMatchingId"
            class="form-radio text-blue-600 mr-2"
          />
          <span class="text-sm text-gray-800">
            <strong>닉네임:</strong> {{ matching.username }}
          </span>
          <span class="text-sm text-gray-800">
            <strong>포트폴리오 제목:</strong> {{ matching.portfolioTitle }}
          </span>
          <span class="text-sm text-gray-800">
            <strong>외주 제목:</strong> {{ matching.outsourcingTitle }}
          </span>
          <span class="text-sm text-gray-800">
            <strong>상태:</strong> {{ matching.status }}
          </span>
        </li>
      </ul>

      <!-- 데이터가 없을 경우 -->
      <p v-if="!matchings.length" class="text-gray-500 text-center mt-4">
        등록된 매칭이 없습니다.
      </p>

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

      <!-- 수락/거절 버튼 -->
      <div class="mt-4 flex justify-center space-x-4">
        <button
          @click="() => updateMatchingStatus('YES')"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          수락
        </button>
        <button
          @click="() => updateMatchingStatus('NO')"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          거절
        </button>
      </div>
    </div>
    <div class="mt-4 flex justify-center space-x-4">
      <button
        @click="startChat"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        :disabled="!selectedMatchingId"
        v-if="!chatStarted"
      >
        채팅 시작
      </button>
      <button
        @click="leaveChat"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        v-if="chatStarted"
      >
        채팅 떠나기
      </button>
    </div>
    <div v-if="chatStarted" class="mt-4">
      <ChatRoom :room-id="applicantId" />
    </div>
  </div>
</template>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>