<template>
    <div>로그인 처리 중...</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  
  onMounted(() => {
    // 현재 URL의 쿼리 파라미터에서 토큰 추출
    const query = new URLSearchParams(window.location.search);
    const token = query.get('token');
  
    if (token) {
  
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem('jwt', token);
  
      // 홈 페이지로 리다이렉트
      window.location.href = '/';
    } else {
      console.error('토큰을 찾을 수 없습니다.');
    }
  });
  </script>
  