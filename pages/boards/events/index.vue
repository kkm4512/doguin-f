<script setup>

const title = ref('');
const content = ref('');
const files = ref([]);

const handleFileChange = (event) => {
  files.value = Array.from(event.target.files); // 파일을 배열로 변환하여 저장
  console.log('Selected files:', files.value); // 선택된 파일 확인
};

// form 객체 생성
const { public: { baseApi } } = useRuntimeConfig()

const submitBulletin = async () => {
  const token = localStorage.getItem('jwt');
  try {
    const formData = new FormData();

    // 모든 파일 추가
    files.value.forEach(file => {
      console.log("Added file:", file);
      formData.append('files', file, file.name);
    });

    // boardRequestBlob 생성 후 추가
    const boardRequestBlob = new Blob([JSON.stringify({
      title: title.value,
      content: content.value
    })], { type: 'application/json' });

    formData.append('boardRequest', boardRequestBlob);

    const result = await $fetch('/boards/events', {
      method: 'POST',
      body: formData,
      baseURL: baseApi,
      headers: {
        'Accept': 'application/json',
        "Authorization": token
      },
      mode: 'cors'
    });

    console.log('게시물 작성 성공:', result);
    window.location.href = '/'  // '/'는 홈페이지 경로를 나타냄
  } catch (error) {
    console.error('게시물 전송에 실패했습니다:', error);
  }
};


</script>

<template>
  <div class="container mx-auto p-8 bg-white rounded-lg shadow-lg mt-10">
    <h1 class="text-3xl font-bold text-center mb-8 text-indigo-600">Event 작성</h1>
    <form @submit.prevent="submitBulletin" enctype="multipart/form-data">
      <div class="mb-6">
        <label for="title" class="block text-lg font-medium text-gray-700 mb-2">제목</label>
        <input
          v-model="title"
          type="text"
          id="title"
          placeholder="제목을 입력하세요"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
      </div>

      <div class="mb-6">
        <label for="content" class="block text-lg font-medium text-gray-700 mb-2">내용</label>
        <textarea
          v-model="content"
          id="content"
          rows="5"
          placeholder="내용을 입력하세요"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        ></textarea>
      </div>

      <div class="mb-6">
        <label for="file" class="block text-lg font-medium text-gray-700 mb-2">파일 첨부</label>
        <input
          type="file"
          id="file"
          multiple
          @change="handleFileChange"
          class="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p class="mt-2 text-sm text-gray-500">여러 파일을 선택할 수 있습니다.</p>
      </div>

      <button
        type="submit"
        class="w-full py-3 mt-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        완료
      </button>
    </form>
  </div>
</template>
