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

// 날짜 포맷 함수
const formatDate = (dateTimeArray: number[]): string => {
  // 배열에서 각 값을 추출
  const [year, month, day] = dateTimeArray;

  // "YYYY-MM-DD" 형식으로 변환
  // month는 0부터 시작하지 않는 형식이므로 그대로 사용 가능
  const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return formattedDate;
};

// 인터페이스 정의
export interface OutsourcingDetail {
  data: {
    id: number;
    title: string;
    content: string;
    price: number;
    area: string;
    recruit_start_date: number[];
    recruit_end_date: number[];
    work_start_date: number[];
    work_end_date: number[];
    isBookmarked: boolean;
    filePaths: string[];
  };
}

// 외주 데이터 상태
const outsourcingData = ref<OutsourcingDetail | null>(null);
const selectedPortfolioId = ref<number | null>(null); // 선택된 포트폴리오 ID
const outsourcingId = ref<number | null>(null); // 외주 ID

// 라우터 설정
const route = useRoute();
const router = useRouter();

// API 요청 함수: 외주 데이터 가져오기
const fetchOutsourcingData = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();

    // 외주 데이터 가져오기
    outsourcingData.value = await $fetch(`/outsourcings/${route.params.id}`, {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
    });

    // 북마크 상태 가져오기
    const isBookmarked: boolean = await $fetch('/bookmarks/status', {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      params: {
        targetId: route.params.id,
        target: 'OUTSOURCING',
      },
    });

    if (outsourcingData.value?.data) {
      outsourcingData.value.data.isBookmarked = isBookmarked;
    }
  } catch (error) {
    console.error('Error fetching outsourcing data:', error);
  }
};

// 외주 삭제 함수
const deleteOutsourcing = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/outsourcings/${route.params.id}`, {
      method: 'DELETE',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
    });
    alert('외주가 삭제되었습니다.');
    router.push("/outsourcings/recruitment"); // 삭제 후 외주 목록 페이지로 이동
  } catch (error) {
    console.error('Error deleting outsourcing:', error);
    alert('외주 삭제에 실패했습니다.');
  }
};

// 외주 수정 페이지로 이동
const goToEditPage = () => {
  router.push(`/outsourcings/recruitment/edit/${route.params.id}`);
};

// 북마크 토글 함수
const toggleBookmark = async (targetId: number, target: string) => {
  const token = localStorage.getItem('jwt');
  if (!outsourcingData.value) return;

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/bookmarks`, {
      method: 'POST',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: {
        targetId,
        target,
      },
    });

    outsourcingData.value.data.isBookmarked = !outsourcingData.value.data.isBookmarked;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
  }
};

// 매칭 생성 함수
const createMatching = async () => {
  if (!selectedPortfolioId.value || !outsourcingId.value) {
    alert('포트폴리오를 선택하고 다시 시도하세요.');
    return;
  }

  try {
    const token = localStorage.getItem('jwt');
    const { public: { baseApi } } = useRuntimeConfig();

    await $fetch('/matchings', {
      method: 'POST',
      baseURL: baseApi,
      headers: {
        Authorization: token || '',
      },
      body: {
        portfolioId: selectedPortfolioId.value,
        outsourcingId: outsourcingId.value,
      },
    });

    alert('매칭이 성공적으로 요청되었습니다.');
    router.push("/outsourcings/recruitment")
  } catch (error) {
    console.error('Error creating matching:', error);
    alert('매칭 요청에 실패했습니다.');
  }
};

// 포트폴리오 선택 시 호출
const handlePortfolioSelected = (portfolioId: number) => {
  selectedPortfolioId.value = portfolioId;
};

// 컴포넌트 초기화
onMounted(() => {
  outsourcingId.value = Number(route.params.id);
  fetchOutsourcingData();
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- 외주 상세 내용 -->
    <div class="flex-1 p-6">
      <div v-if="outsourcingData" class="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100">
        <h5 class="text-3xl font-bold tracking-tight text-gray-900 mb-4 text-center">{{ outsourcingData.data.title }}</h5>
        <p class="font-normal text-gray-700 mb-4 text-justify">{{ outsourcingData.data.content }}</p>
        <p class="text-gray-700 mb-2"><strong>예상임금:</strong> {{ outsourcingData.data.price }} 원</p>
        <p class="text-gray-700 mb-2"><strong>지역:</strong> {{ outsourcingData.data.area }}</p>
        <p class="text-gray-700 mb-2"><strong>채용일:</strong> {{ formatDate(outsourcingData.data.recruit_start_date) }} ~ {{ formatDate(outsourcingData.data.recruit_end_date) }}</p>
        <p class="text-gray-700 mb-6"><strong>기간:</strong> {{ formatDate(outsourcingData.data.work_start_date) }} ~ {{ formatDate(outsourcingData.data.work_end_date) }}</p>

        <div class="flex justify-between items-center text-sm text-gray-500 mb-6">
          <button
            @click="() => toggleBookmark(outsourcingData?.data.id!, 'OUTSOURCING')"
            :class="[
              'px-4 py-2 rounded text-white',
              outsourcingData.data.isBookmarked ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-400 hover:bg-gray-500',
            ]"
          >
            {{ outsourcingData.data.isBookmarked ? '북마크 취소' : '북마크' }}
          </button>
        </div>

        <div class="flex justify-between mb-6">
          <button @click="deleteOutsourcing" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">삭제</button>
          <button @click="goToEditPage" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">수정</button>
        </div>

        <div>
          <h2 class="text-xl font-semibold tracking-tight text-gray-900 mb-2">파일 목록</h2>
          <div class="flex flex-wrap gap-4">
            <div v-for="(filePath, index) in outsourcingData.data.filePaths" :key="index" class="flex-shrink-0">
              <img
                :src="filePath"
                alt="Uploaded Image"
                class="w-24 h-24 object-cover border border-gray-200 rounded shadow cursor-pointer hover:opacity-75"
                @click="openModal(filePath)"
              />
            </div>
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

    <!-- 포트폴리오 목록 -->
    <GetMyPortfolios @portfolioSelected="handlePortfolioSelected" />

    <!-- 매칭 버튼 -->
    <div class="fixed bottom-4 right-4">
      <button
        @click="createMatching"
        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg"
      >
        매칭하기
      </button>
    </div>
  </div>
</template>

<style scoped>
button {
  transition: background-color 0.2s;
}
</style>
