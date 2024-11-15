<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 외주 생성 데이터
const title = ref('');
const content = ref('');
const preferential = ref('');
const workType = ref('');
const price = ref<number | null>(null);
const recruitStartDate = ref('');
const recruitEndDate = ref('');
const workStartDate = ref('');
const workEndDate = ref('');
const area = ref('');
const files = ref<File[]>([]);

// 지역 타입 데이터
const areaOptions = ['SEOUL', 'BUSAN', 'DAEGU', 'INCHEON', 'GWANGJU', 'DAEJEON', 'ULSAN', 'JEJU'];


// 로딩 및 상태 관리
const isSubmitting = ref(false);
const feedbackMessage = ref('');

// 파일 추가 핸들러
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    files.value = Array.from(target.files);
  }
};

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  const randomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const randomDate = (start: Date, end: Date) => {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0]; // yyyy-mm-dd 형식
  };

  title.value = `랜덤 제목 ${randomString(5)}`;
  content.value = `랜덤 내용 ${randomString(20)}`;
  preferential.value = `랜덤 우대사항 ${randomString(10)}`;
  workType.value = ['풀타임', '파트타임', '프리랜서'][Math.floor(Math.random() * 3)];
  price.value = Math.floor(Math.random() * 100000) + 50000; // 50,000 ~ 150,000
  recruitStartDate.value = randomDate(new Date(), new Date(2023, 11, 31));
  recruitEndDate.value = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
  workStartDate.value = randomDate(new Date(2024, 0, 1), new Date(2024, 5, 30));
  workEndDate.value = randomDate(new Date(2024, 6, 1), new Date(2024, 11, 31));
  area.value = areaOptions[Math.floor(Math.random() * areaOptions.length)];
};

// 날짜와 시간을 'yyyy-MM-ddT'HH:mm:ss' 형식으로 반환
const formatDate = (date: string): string => {
  const currentTime = new Date();
  
  // 시간, 분, 초를 두 자릿수로 포맷팅
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const seconds = String(currentTime.getSeconds()).padStart(2, '0');
  
  // 'yyyy-MM-ddT01:30:57' 형식으로 반환
  return `${date}T${hours}:${minutes}:${seconds}`;
};


const createOutsourcing = async () => {
  const token = localStorage.getItem('jwt');

  // 필드 검증
  if (!title.value || !content.value || !preferential.value || !workType.value || !price.value || !recruitStartDate.value || !recruitEndDate.value || !workStartDate.value || !workEndDate.value || !area.value) {
    feedbackMessage.value = '모든 필드를 채워주세요!';
    return;
  }

  isSubmitting.value = true;
  feedbackMessage.value = '';

  try {
    const { public: { baseApi } } = useRuntimeConfig();

    // FormData 객체 생성
    const formData = new FormData();

    // JSON 데이터 생성
    const outsourcingRequestCreate = {
      title: title.value,
      content: content.value,
      preferential: preferential.value,
      work_type: workType.value,
      price: price.value,
      recruit_start_date: formatDate(recruitStartDate.value),  // 날짜 + 현재 시간
      recruit_end_date: formatDate(recruitEndDate.value),      // 날짜 + 현재 시간
      work_start_date: formatDate(workStartDate.value),        // 날짜 + 현재 시간
      work_end_date: formatDate(workEndDate.value),            // 날짜 + 현재 시간
      area: area.value,
    };

    // JSON 데이터를 Blob으로 변환 후 FormData에 추가
    formData.append(
      'outsourcingRequestCreate',
      new Blob([JSON.stringify(outsourcingRequestCreate)], { type: 'application/json' })
    );

    // 파일 데이터를 FormData에 추가
    files.value.forEach(file => formData.append('files', file));

    // API 요청
    await $fetch('/outsourcings', {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined, // Content-Type은 생략 (FormData가 자동 설정)
      body: formData,
    });

    // 성공 메시지 및 페이지 이동
    feedbackMessage.value = '외주가 성공적으로 생성되었습니다!';
    router.push('/'); // 성공 후 목록 페이지로 이동
  } catch (error) {
    console.error('Error creating outsourcing:', error);
    feedbackMessage.value = '외주 생성에 실패했습니다.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex justify-center items-center bg-gray-100">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">외주 생성</h1>

      <!-- 제목 -->
      <label for="title" class="block text-sm font-medium text-gray-700">제목</label>
      <input id="title" v-model="title" type="text" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 내용 -->
      <label for="content" class="block text-sm font-medium text-gray-700">내용</label>
      <textarea id="content" v-model="content" class="w-full border rounded-lg p-2 mb-4"></textarea>

      <!-- 우대사항 -->
      <label for="preferential" class="block text-sm font-medium text-gray-700">우대사항</label>
      <textarea id="preferential" v-model="preferential" class="w-full border rounded-lg p-2 mb-4"></textarea>

      <!-- 근무 형태 -->
      <label for="workType" class="block text-sm font-medium text-gray-700">근무 형태</label>
      <input id="workType" v-model="workType" type="text" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 가격 -->
      <label for="price" class="block text-sm font-medium text-gray-700">가격</label>
      <input id="price" v-model="price" type="number" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 모집 시작일 -->
      <label for="recruitStartDate" class="block text-sm font-medium text-gray-700">모집 시작일</label>
      <input id="recruitStartDate" v-model="recruitStartDate" type="date" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 모집 마감일 -->
      <label for="recruitEndDate" class="block text-sm font-medium text-gray-700">모집 마감일</label>
      <input id="recruitEndDate" v-model="recruitEndDate" type="date" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 작업 시작일 -->
      <label for="workStartDate" class="block text-sm font-medium text-gray-700">작업 시작일</label>
      <input id="workStartDate" v-model="workStartDate" type="date" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 작업 마감일 -->
      <label for="workEndDate" class="block text-sm font-medium text-gray-700">작업 마감일</label>
      <input id="workEndDate" v-model="workEndDate" type="date" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 지역 -->
      <label for="area" class="block text-sm font-medium text-gray-700">지역</label>
      <input id="area" v-model="area" type="text" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 파일 업로드 -->
      <label for="files" class="block text-sm font-medium text-gray-700">파일 업로드</label>
      <input id="files" type="file" multiple @change="handleFileChange" class="w-full border rounded-lg p-2 mb-4" />

      <!-- 랜덤 데이터 버튼 -->
      <button @click="generateRandomData" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4">
        랜덤 데이터 채우기
      </button>

      <!-- 제출 버튼 -->
      <button @click="createOutsourcing" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" :disabled="isSubmitting">
        {{ isSubmitting ? '처리 중...' : '제출' }}
      </button>

      <!-- 상태 메시지 -->
      <p v-if="feedbackMessage" class="text-red-500 mt-4">{{ feedbackMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: background-color 0.3s;
}
</style>
