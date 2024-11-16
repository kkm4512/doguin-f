<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 포트폴리오 데이터
const portfolioData = ref<{
  title: string;
  content: string;
  work_experience: number | null; // number와 null을 모두 허용
  work_type: string;
  project_history: string;
  area: string;
}>({
  title: '',
  content: '',
  work_experience: null, // 초기값은 null
  work_type: '',
  project_history: '',
  area: '',
});


// 업로드할 파일
const selectedFiles = ref<File[]>([]);

// 파일 선택 핸들러
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files); // 파일을 배열로 저장
  }
};

// 랜덤 데이터 생성 함수
const generateRandomData = () => {
  const randomTitles = ['웹 개발자', '프론트엔드 전문가', '백엔드 엔지니어', '풀스택 개발자', '데이터 분석가'];
  const randomContents = [
    '이 프로젝트는 웹 개발 기술을 활용하여 만들어졌습니다.',
    '효율적인 API 설계와 데이터 모델링을 적용했습니다.',
    'React와 Vue.js를 기반으로 인터페이스를 개발했습니다.',
    '대규모 트래픽을 처리하기 위한 Redis 캐싱을 사용했습니다.',
    'Docker를 활용한 컨테이너 기반 배포 환경을 구축했습니다.',
  ];
  const randomWorkTypes = ['정규직', '프리랜서', '계약직'];
  const randomProjectHistories = [
    '커머스 플랫폼 구축, 블로그 시스템 개발',
    '실시간 채팅 애플리케이션, 공공 데이터 분석 프로젝트',
    'IoT 기반 스마트 홈 프로젝트, 교육 관리 시스템 개발',
  ];
  const randomAreas = ['SEOUL', 'BUSAN', 'DAEGU', 'INCHEON', 'GWANGJU'];


  portfolioData.value = {
    title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
    content: randomContents[Math.floor(Math.random() * randomContents.length)],
    work_experience: Math.floor(Math.random() * 10) + 1, // 1~10년 경력
    work_type: randomWorkTypes[Math.floor(Math.random() * randomWorkTypes.length)],
    project_history: randomProjectHistories[Math.floor(Math.random() * randomProjectHistories.length)],
    area: randomAreas[Math.floor(Math.random() * randomAreas.length)],
  };
};

// 포트폴리오 생성 API 호출
const createPortfolio = async () => {
  const token = localStorage.getItem('jwt'); // 인증 토큰
  const { public: { baseApi } } = useRuntimeConfig();

  const formData = new FormData();

  // 포트폴리오 데이터 추가
  formData.append(
    'portfolioRequest',
    new Blob([JSON.stringify(portfolioData.value)], { type: 'application/json' })
  );

  // 파일 추가
  selectedFiles.value.forEach((file) => {
    formData.append('files', file);
  });

  try {
    await $fetch('/portfolios', {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: formData,
    });
    alert('포트폴리오가 성공적으로 생성되었습니다.');
    router.push('/'); // 생성 후 목록 페이지로 이동
  } catch (error) {
    console.error('Error creating portfolio:', error);
    alert('포트폴리오 생성에 실패했습니다.');
  }
};
</script>


<template>
    <div class="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div class="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">포트폴리오 작성</h2>
        <form @submit.prevent="createPortfolio">
          <div class="mb-4">
            <label for="title" class="block mb-2 text-sm font-medium">제목</label>
            <input
              v-model="portfolioData.title"
              id="title"
              type="text"
              class="w-full p-2 border rounded"
              placeholder="제목을 입력하세요"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="content" class="block mb-2 text-sm font-medium">내용</label>
            <textarea
              v-model="portfolioData.content"
              id="content"
              class="w-full p-2 border rounded"
              rows="6"
              placeholder="내용을 입력하세요"
              required
            ></textarea>
          </div>
  
          <div class="mb-4">
            <label for="workExperience" class="block mb-2 text-sm font-medium">경력 (년)</label>
            <input
              v-model.number="portfolioData.work_experience"
              id="workExperience"
              type="number"
              class="w-full p-2 border rounded"
              placeholder="예: 3"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="workType" class="block mb-2 text-sm font-medium">근무 형태</label>
            <input
              v-model="portfolioData.work_type"
              id="workType"
              type="text"
              class="w-full p-2 border rounded"
              placeholder="예: 정규직, 프리랜서"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="projectHistory" class="block mb-2 text-sm font-medium">프로젝트 이력</label>
            <textarea
              v-model="portfolioData.project_history"
              id="projectHistory"
              class="w-full p-2 border rounded"
              rows="4"
              placeholder="프로젝트 이력을 입력하세요"
              required
            ></textarea>
          </div>
  
          <div class="mb-4">
            <label for="area" class="block mb-2 text-sm font-medium">지역</label>
            <input
              v-model="portfolioData.area"
              id="area"
              type="text"
              class="w-full p-2 border rounded"
              placeholder="예: 서울, 부산"
              required
            />
          </div>
  
          <div class="mb-4">
            <label for="files" class="block mb-2 text-sm font-medium">파일 업로드</label>
            <input
              type="file"
              id="files"
              multiple
              @change="handleFileChange"
              class="block w-full text-sm text-gray-500 border rounded-lg"
            />
          </div>
  
          <!-- 랜덤 데이터 생성 버튼 -->
          <div class="mb-6">
            <button
              type="button"
              @click="generateRandomData"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
            >
              랜덤 데이터 생성
            </button>
          </div>
  
          <div class="flex justify-between items-center">
            <button
              type="button"
              @click="router.back()"
              class="px-4 py-2 bg-gray-500 text-white rounded"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded"
            >
              작성 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  
<style scoped>
    button {
        transition: background-color 0.2s;
    }
</style>

