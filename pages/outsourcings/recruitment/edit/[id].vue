<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { OutsourcingDetail } from '../[id].vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

// 외주 데이터를 저장할 ref
const outsourcingData = ref({
  title: '',
  content: '',
  price: 0,
  area: '',
  recruit_start_date: '',
  recruit_end_date: '',
  work_start_date: '',
  work_end_date: '',
});

// 파일 데이터를 저장할 ref
const files = ref<{ id: number; path: string }[]>([]); // 파일 데이터(id와 path 포함)
const selectedFileIds = ref<number[]>([]); // 선택된 파일 ID 배열

// 새로 업로드된 파일 저장용 ref
const selectedFiles = ref<File[]>([]);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files); // 파일을 배열로 변환
  }
};

// 외주 데이터 가져오기
const fetchOutsourcingData = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const data: OutsourcingDetail = await $fetch(`/outsourcings/${id}`, {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      mode: 'cors'
    });
    console.log(data)

    outsourcingData.value = {
      title: data.data.title,
      content: data.data.content,
      price: data.data.price,
      area: data.data.area,
      recruit_start_date: data.data.recruit_start_date.split('T')[0],
      recruit_end_date: data.data.recruit_end_date.split('T')[0],
      work_start_date: data.data.work_start_date.split('T')[0],
      work_end_date: data.data.work_end_date.split('T')[0],
    };

    // filePaths 데이터를 id와 path로 매핑
    files.value = data.data.filePaths.map((path: string, index: number) => ({
      id: index + 1, // 파일에 고유 ID 할당
      path,
    }));
  } catch (error) {
    console.error('Error fetching outsourcing data:', error);
  }
};

// 파일 ID 가져오기
const getFileIds = async () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('JWT token is missing.');
    return;
  }

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const filePaths = files.value.map((file) => file.path.trim());
    const encodedFilePaths = encodeURIComponent(JSON.stringify(filePaths));

    const response: number[] = await $fetch('/attachments', {
      method: 'GET',
      baseURL: baseApi,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      params: { filePaths: encodedFilePaths },
    });

    files.value = files.value.map((file, index) => ({
      ...file,
      id: response[index], // 서버에서 받은 ID 매핑
    }));
  } catch (error) {
    console.error('Error fetching file IDs:', error);
  }
};

const updateOutsourcing = async () => {
  const token = localStorage.getItem('jwt');

  const convertToLocalDateTime = (date: string): string => {
    return `${date}T00:00:00`; // 날짜 뒤에 시간 추가
  };

  const requestPayload = {
    ...outsourcingData.value,
    recruit_start_date: convertToLocalDateTime(outsourcingData.value.recruit_start_date),
    recruit_end_date: convertToLocalDateTime(outsourcingData.value.recruit_end_date),
    work_start_date: convertToLocalDateTime(outsourcingData.value.work_start_date),
    work_end_date: convertToLocalDateTime(outsourcingData.value.work_end_date),
    fileIds: selectedFileIds.value, // 선택된 파일 ID
  };

  const formData = new FormData();
  formData.append(
    'outsourcingRequestUpdate',
    new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
  );

  selectedFiles.value.forEach((file) => {
    formData.append('files', file); // 새로 업로드된 파일 추가
  });

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/outsourcings/${id}`, {
      method: 'PUT',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
      body: formData,
      mode: 'cors'
    });
    alert('외주가 수정되었습니다.');
    router.push(`/outsourcings/recruitment/${id}`);
  } catch (error) {
    console.error('Error updating outsourcing:', error);
    alert('외주 수정에 실패했습니다.');
  }
};


// 파일 선택 토글
const toggleFileSelection = (fileId: number) => {
  const isSelected = selectedFileIds.value.includes(fileId);
  if (isSelected) {
    selectedFileIds.value = selectedFileIds.value.filter((id) => id !== fileId);
  } else {
    selectedFileIds.value = [...selectedFileIds.value, fileId];
  }
};

onMounted(async () => {
  try {
    await fetchOutsourcingData(); // 데이터 가져오기
    await getFileIds(); // 파일 ID 가져오기
  } catch (error) {
    console.error('Error during mounted:', error);
  }
});

</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 p-6">
    <div class="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">외주 수정</h2>
      <form @submit.prevent="updateOutsourcing">
        <div class="mb-4">
          <label for="title" class="block mb-2 text-sm font-medium">제목</label>
          <input
            v-model="outsourcingData.title"
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
            v-model="outsourcingData.content"
            id="content"
            class="w-full p-2 border rounded"
            rows="6"
            placeholder="내용을 입력하세요"
            required
          ></textarea>
        </div>

        <div class="mb-4">
          <label for="price" class="block mb-2 text-sm font-medium">가격</label>
          <input
            v-model="outsourcingData.price"
            id="price"
            type="number"
            class="w-full p-2 border rounded"
            placeholder="가격을 입력하세요"
            required
          />
        </div>

        <div class="mb-4">
          <label for="area" class="block mb-2 text-sm font-medium">지역</label>
          <input
            v-model="outsourcingData.area"
            id="area"
            type="text"
            class="w-full p-2 border rounded"
            placeholder="지역을 입력하세요"
            required
          />
        </div>

        <!-- 날짜 필드 -->
        <div class="mb-4">
          <label for="recruitStart" class="block mb-2 text-sm font-medium">채용 시작일</label>
          <input
            v-model="outsourcingData.recruit_start_date"
            id="recruitStart"
            type="date"
            class="w-full p-2 border rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label for="recruitEnd" class="block mb-2 text-sm font-medium">채용 종료일</label>
          <input
            v-model="outsourcingData.recruit_end_date"
            id="recruitEnd"
            type="date"
            class="w-full p-2 border rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label for="workStart" class="block mb-2 text-sm font-medium">작업 시작일</label>
          <input
            v-model="outsourcingData.work_start_date"
            id="workStart"
            type="date"
            class="w-full p-2 border rounded"
            required
          />
        </div>

        <div class="mb-4">
          <label for="workEnd" class="block mb-2 text-sm font-medium">작업 종료일</label>
          <input
            v-model="outsourcingData.work_end_date"
            id="workEnd"
            type="date"
            class="w-full p-2 border rounded"
            required
          />
        </div>

        <!-- 기존 파일 목록 -->
        <div class="mb-4">
          <h3 class="mb-2 text-sm font-medium">기존 파일</h3>
          <ul class="grid grid-cols-2 gap-4">
            <li
              v-for="file in files"
              :key="file.id"
              class="flex flex-col items-center text-center"
            >
              <img
                :src="file.path"
                alt="File Preview"
                class="w-20 h-20 object-cover rounded-lg border"
              />
              <label class="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  :value="file.id"
                  @change="toggleFileSelection(file.id)"
                  class="form-checkbox text-blue-600 rounded"
                />
                <span class="text-sm">선택</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- 새 파일 업로드 -->
        <div class="mb-4">
          <label for="files" class="block mb-2 text-sm font-medium">새 파일 업로드</label>
          <input
            type="file"
            id="file"
            multiple
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500 border rounded-lg"
          />
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
            수정 완료
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
