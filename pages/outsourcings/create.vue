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

  // 현실적인 데이터 풀
  const randomTitles = [
    '웹사이트 리뉴얼 프로젝트',
    '모바일 앱 개발',
    'API 서버 구축',
    '쇼핑몰 기능 추가',
    '데이터베이스 최적화 작업',
  ];

  const randomContents = [
    '기존 웹사이트를 최신 디자인 트렌드에 맞춰 리뉴얼합니다.',
    'iOS 및 Android용 모바일 애플리케이션 개발을 진행합니다.',
    'RESTful API 서버를 설계 및 개발합니다.',
    '전자상거래 플랫폼에 새로운 결제 기능을 추가합니다.',
    'MySQL 데이터베이스 성능을 최적화합니다.',
  ];

  const randomPreferentials = [
    'React와 Vue.js 경험자 우대',
    'Node.js 및 Spring Boot 경험자 우대',
    'Docker 및 Kubernetes 활용 경험 우대',
    'MongoDB 및 Redis 사용 경험 우대',
    '클라우드 배포 경험자 우대 (AWS, Azure)',
  ];

  const randomWorkTypes = ['풀타임', '파트타임', '프리랜서'];
  const randomAreas = ['SEOUL', 'BUSAN', 'DAEGU', 'INCHEON', 'GWANGJU', 'DAEJEON', 'ULSAN', 'JEJU'];

  title.value = randomTitles[Math.floor(Math.random() * randomTitles.length)];
  content.value = randomContents[Math.floor(Math.random() * randomContents.length)];
  preferential.value = randomPreferentials[Math.floor(Math.random() * randomPreferentials.length)];
  workType.value = randomWorkTypes[Math.floor(Math.random() * randomWorkTypes.length)];
  price.value = Math.floor(Math.random() * 1000000) + 100000; // 100,000 ~ 1,100,000
  recruitStartDate.value = randomDate(new Date(), new Date(2023, 11, 31));
  recruitEndDate.value = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
  workStartDate.value = randomDate(new Date(2024, 0, 1), new Date(2024, 5, 30));
  workEndDate.value = randomDate(new Date(2024, 6, 1), new Date(2024, 11, 31));
  area.value = randomAreas[Math.floor(Math.random() * randomAreas.length)];
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
    console.log(outsourcingRequestCreate)

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
      mode: 'cors'
    });

    // 성공 메시지 및 페이지 이동
    feedbackMessage.value = '외주가 성공적으로 생성되었습니다!';
    router.push('/outsourcings/recruitment'); // 성공 후 목록 페이지로 이동
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
