// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      baseFrontUrl: 'http://localhost:3000',
      baseWebSocketUrl: 'doguin-alb-1242367005.ap-northeast-2.elb.amazonaws.com',
      baseApi: 'https://dogu-in.com/api/v1', // API 베이스 URL 등도 여기에 정의할 수 있어
      baseTest: 'https://dogu-in.com',
      kakaoLoginUrl: 'https://kauth.kakao.com/oauth/authorize?client_id=4c20fa460462cdcce6dc2f520464610e&redirect_uri=http://doguin-alb-1242367005.ap-northeast-2.elb.amazonaws.com/api/v1/auth/oauth2/authorize/kakao&response_type=code',
      naverLoginUrl: 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=105NIEggD1Vv4xj2p90y&state=YOUR_GENERATED_STATE&redirect_uri=http://doguin-alb-1242367005.ap-northeast-2.elb.amazonaws.com/api/v1/auth/oauth2/authorize/naver',
      githubLoginUrl: 'https://github.com/login/oauth/authorize?client_id=Ov23liUpy59bQXa5zJZj&redirect_uri=http://doguin-alb-1242367005.ap-northeast-2.elb.amazonaws.com/api/v1/auth/oauth2/authorize/github&scope=user:email',
      googleLoginUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=528619377683-a9ut4qmd1s1jm9s1mplvcbpnf63bb70r.apps.googleusercontent.com&redirect_uri=http://doguin-alb-1242367005.ap-northeast-2.elb.amazonaws.com/api/v1/auth/oauth2/authorize/google&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'
    }
  },

  compatibilityDate: '2024-11-14',
})