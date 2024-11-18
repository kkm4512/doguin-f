<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AnswerResponse } from '../../[id].vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

// 게시글 데이터를 저장할 ref
const boardData = ref({
  title: '',
  content: '',
});

interface BoardWithAnswer {
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

const files = ref<{ id: number; path: string }[]>([]); // 파일 데이터를 id와 path로 저장
const selectedFileIds = ref<number[]>([]); // 체크된 파일들의 id를 저장
const selectedFiles = ref<File[]>([]); // 새로 업로드된 파일들을 저장

// 파일 선택 핸들러
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement; // 타입 캐스팅
  if (target.files) {
    selectedFiles.value = Array.from(target.files); // 파일을 배열로 변환하여 저장
    console.log('Selected files:', selectedFiles.value); // 선택된 파일 확인
  }
};

// API 요청 함수: 기존 게시글 데이터 가져오기
const fetchBoardData = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const { public: { baseApi } } = useRuntimeConfig();
    const data: BoardWithAnswer = await $fetch(`/boards/notices/${id}`, {
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined,
    });

    // 게시글 데이터 저장
    boardData.value.title = data.data.title;
    boardData.value.content = data.data.content;

    // filePaths 데이터를 id와 path로 매핑하여 저장
    files.value = data.data.filePaths.map((path, index) => ({
      id: index + 1, // 각 파일에 고유 id 부여
      path,
    }));
  } catch (error) {
    console.error('Error fetching board data:', error);
  }
};

const getFileIds = async () => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error("JWT token is missing.");
    return;
  }

  try {
    const { public: { baseApi } } = useRuntimeConfig();

    // 파일 경로 추출 및 정리
    const filePaths = files.value.map(file => file.path.trim()); // 앞뒤 공백 제거

    // JSON 형태로 파일 경로를 문자열로 변환 후 URL 인코딩
    const encodedFilePaths = encodeURIComponent(JSON.stringify(filePaths));

    // 서버로 요청 보내기
    const response: number[] = await $fetch(`/attachments`, {
      method: 'GET',
      baseURL: baseApi,
      headers: {
        Authorization: token,
      },
      query: {
        filePaths: encodedFilePaths, // URL 인코딩된 파일 경로 전달
      },
    });

    console.log('파일 PK값:', response);

    // 서버에서 받은 ID를 files에 매핑
    files.value = files.value.map((file, index) => ({
      id: response[index],
      path: file.path,
    }));

    console.log('Updated files with IDs:', files.value);
  } catch (error) {
    console.error('Error fetching file IDs:', error);
  }
};


// 게시글 수정 함수
const updateBoard = async () => {
  const token = localStorage.getItem('jwt');

  // boardRequest 데이터에 fileIds 추가
  const requestPayload = {
    ...boardData.value,
    fileIds: selectedFileIds.value, // 선택된 파일 ID 추가
  };

  const formData = new FormData();
  formData.append(
    'boardRequest',
    new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
  );

  // 새로 업로드된 파일 추가
  selectedFiles.value.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const { public: { baseApi } } = useRuntimeConfig();
    await $fetch(`/boards/notices/${id}`, {
      method: 'PUT',
      baseURL: baseApi,
      headers: token ? { Authorization: token } : undefined, // Content-Type 생략
      body: formData,
    });
    alert('게시글이 수정되었습니다.');
    router.push(`/boards/notices/${id}`);
  } catch (error) {
    console.error('Error updating board:', error);
    alert('게시글 수정에 실패했습니다.');
  }
};

// 파일 선택 상태 변경
const toggleFileSelection = (fileId: number) => {
  const isSelected = selectedFileIds.value.includes(fileId);

  if (isSelected) {
    selectedFileIds.value = selectedFileIds.value.filter(id => id !== fileId);
  } else {
    selectedFileIds.value.push(fileId);
  }
};

// 페이지 로드 시 API 요청
onMounted(async () => {
  await fetchBoardData(); // 게시글 데이터 가져오기 완료 후
  await getFileIds(); // 파일 ID 가져오기
});
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 p-6">
    <div class="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">게시글 수정</h2>
      <form @submit.prevent="updateBoard">
        <div class="mb-4">
          <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">제목</label>
          <input
            v-model="boardData.title"
            id="title"
            type="text"
            class="w-full p-2 border rounded"
            placeholder="제목을 입력하세요"
            required
          />
        </div>
        <div class="mb-4">
          <label for="content" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">내용</label>
          <textarea
            v-model="boardData.content"
            id="content"
            class="w-full p-2 border rounded"
            rows="6"
            placeholder="내용을 입력하세요"
            required
          ></textarea>
        </div>

        <!-- 기존 파일 목록 -->
        <div class="mb-4">
          <h3 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">기존 파일</h3>
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
                <span class="text-sm text-gray-800 dark:text-gray-200">선택</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- 파일 업로드 -->
        <div class="mb-4">
          <label for="files" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">파일 업로드</label>
          <input
            type="file"
            id="file"
            multiple
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="flex justify-between items-center">
          <button
            type="button"
            @click="router.back()"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
