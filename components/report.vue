<template>
  <button
    @click="reportContent"
    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    :disabled="isReporting"
  >
    {{ isReporting ? '신고 중...' : '신고' }}
  </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRuntimeConfig } from '#app';
import type { AnswerResponse } from '~/pages/boards/[id].vue';

// User 정보 인터페이스
interface UserInfo {
  data: {
    id: number;
    email: string;
    nickname: string;
    userType: string;
    userRole: string;
    profileImage: string;
    introduce: string;
    homeAddress: string;
    gitAddress: string;
    blogAddress: string;
    userGrade: string;
  }
}

// ReportPayload 인터페이스 정의
interface ReportPayload {
  title: string;
  content: string;
  reporteeNickname: string;
}

const props = defineProps<{
  data: {
    id: number;
    userId: number;
    title: string;
    content: string;
    view: number;
    isBookmarked: boolean;
    response: AnswerResponse;
    filePaths: string[];
  };
  targetType: "BULLETIN"  // 허용된 문자열만 포함
}>();



const isReporting = ref(false);

const reportContent = async () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    alert('로그인이 필요합니다.');
    return;
  }

  isReporting.value = true;

  try {
    const { public: { baseApi } } = useRuntimeConfig();

    // 1. 유저 정보 가져오기
    const userInfo: UserInfo = await $fetch(`/users/${props.data.userId}`, {
      method: 'GET',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      mode: 'cors'
    });

  
    // 2. 신고 요청 payload 생성
    const payload: ReportPayload = {
      title: props.data.title,
      content: props.data.content,
      reporteeNickname: userInfo.data.nickname,
    };

    console.log(payload)

    // 3. 신고 요청 보내기
    await $fetch('/reports', {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: payload,
      mode: 'cors'
    });

    alert('신고가 접수되었습니다.');
  } catch (error) {
    console.error('Error reporting content:', error);
    alert('신고에 실패했습니다.');
  } finally {
    isReporting.value = false;
  }
};
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
