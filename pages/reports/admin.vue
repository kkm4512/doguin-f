<template>
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-4">전체 신고 내역 (관리자)</h1>
  
      <div v-if="isLoading" class="text-center py-10">
        <p>신고 내역을 불러오는 중입니다...</p>
      </div>
  
      <div v-else>
        <div v-if="reports.length === 0" class="text-center py-10">
          <p>신고 내역이 없습니다.</p>
        </div>
  
        <div v-else>
          <table class="table-auto w-full border-collapse border border-gray-200 shadow-md">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2">ID</th>
                <th class="border border-gray-300 px-4 py-2">제목</th>
                <th class="border border-gray-300 px-4 py-2">닉네임</th>
                <th class="border border-gray-300 px-4 py-2">유형</th>
                <th class="border border-gray-300 px-4 py-2">작업</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in reports" :key="report.id">
                <td class="border border-gray-300 px-4 py-2 text-center">{{ report.id }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ report.title }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ report.nickName }}</td>
                <td class="border border-gray-300 px-4 py-2">{{ report.reportType }}</td>
                <td class="border border-gray-300 px-4 py-2 text-center space-x-2">
                  <button
                    @click="approveReport(report.id)"
                    class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    승인
                  </button>
                  <button
                    @click="rejectReport(report.id)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    반려
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
  
          <div class="flex justify-between items-center mt-4">
            <button
              @click="fetchReports(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <p>페이지 {{ currentPage }} / {{ totalPages }}</p>
            <button
              @click="fetchReports(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRuntimeConfig } from '#app';
  
  interface Report {
    id: number;
    title: string;
    nickName: string;
    reportType: string;
  }

  // Page 인터페이스 (페이징 정보를 포함)
export interface Page<T> {
  content: T[];          // 현재 페이지의 데이터
  totalPages: number;    // 총 페이지 수
  totalElements: number; // 총 데이터 수
  size: number;          // 페이지 크기
  number: number;        // 현재 페이지 (0부터 시작)
  first: boolean;        // 첫 번째 페이지 여부
  last: boolean;         // 마지막 페이지 여부
}

// ApiResponse 인터페이스 (응답 구조)
export interface ApiResponse<T> {
  code: string;          // 응답 코드
  message: string;       // 응답 메시지
  data: T;               // 실제 데이터
}

// ReportView 인터페이스 (신고 데이터)
export interface ReportView {
  id: number;            // 신고 ID
  title: string;         // 신고 제목
  nickName: string;      // 신고자 닉네임
  reportType: string;    // 신고 유형
}
  
  const reports = ref<Report[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const pageSize = 10;
  
  const fetchReports = async (page: number) => {
    const config = useRuntimeConfig();
    const token = localStorage.getItem('jwt');
  
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    try {
      isLoading.value = true;
  
      const response:ApiResponse<Page<ReportView>> = await $fetch('/reports/admin', {
        method: 'GET',
        baseURL: config.public.baseApi,
        headers: token ? { Authorization: token } : undefined,
        params: { page, size: pageSize },
      });
  
      reports.value = response.data.content;
      currentPage.value = response.data.number + 1;
      totalPages.value = response.data.totalPages;
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('신고 내역을 가져오지 못했습니다.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const approveReport = async (reportId: number) => {
    const config = useRuntimeConfig();
    const token = localStorage.getItem('jwt');
  
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    try {
      await $fetch(`/reports/${reportId}/accept`, {
        method: 'PUT',
        baseURL: config.public.baseApi,
        headers: token ? { Authorization: token } : undefined,
      });
  
      alert('신고가 승인되었습니다.');
      fetchReports(currentPage.value);
    } catch (error) {
      console.error('Error approving report:', error);
      alert('신고 승인이 실패했습니다.');
    }
  };
  
  const rejectReport = async (reportId: number) => {
    const config = useRuntimeConfig();
    const token = localStorage.getItem('jwt');
  
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    try {
      await $fetch(`/reports/${reportId}/inject`, {
        method: 'PUT',
        baseURL: config.public.baseApi,
        headers: token ? { Authorization: token } : undefined,
      });
  
      alert('신고가 반려되었습니다.');
      fetchReports(currentPage.value);
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('신고 반려가 실패했습니다.');
    }
  };
  
  onMounted(() => {
    fetchReports(currentPage.value);
  });
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
  }
  </style>
  