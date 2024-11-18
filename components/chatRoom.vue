<template>
  <div class="chat-room">
    <h2 class="text-xl font-bold mb-2">채팅방: {{ roomId }}</h2>

    <!-- 메시지 리스트 -->
    <div
      class="messages p-4 border rounded h-64 overflow-y-scroll mb-4"
      ref="messageContainer"
    >
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="mb-2 p-2 rounded"
        :class="{
          'bg-green-100 text-right self-end': message.senderId === localSenderId,
          'bg-blue-100 text-left self-start': message.senderId !== localSenderId,
        }"
      >
        <p v-if="message.senderId !== localSenderId" class="text-sm font-bold">{{ message.senderName }}</p>
        <p class="text-sm">{{ message.content }}</p>
        <p class="text-xs text-gray-500">{{ message.timestamp }}</p>
      </div>
    </div>

    <!-- 메시지 입력 -->
    <div class="flex items-center">
      <input
        v-model="newMessage"
        @keyup.enter="sendMessage"
        type="text"
        class="flex-grow p-2 border rounded"
        placeholder="메시지를 입력하세요..."
      />
      <button
        @click="sendMessage"
        class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        전송
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useWebSocket } from "~/composables/useWebSocket";

// Props로 채팅방 ID를 전달받음
const props = defineProps<{ roomId: number | null }>();

// WebSocket 유틸리티
const { connect, subscribe, sendMessage: wsSendMessage } = useWebSocket();

// 로컬에서 사용자의 senderId를 저장 (서버에서 전달받음)
const localSenderId = ref<number | null>(null);

// 서버에서 전달받은 메시지 저장
const messages = ref<MessageResponse[]>([]);

// 새로운 메시지 입력 필드
const newMessage = ref("");

// DOM 요소 참조 (스크롤 관리)
const messageContainer = ref<HTMLDivElement | null>(null);

// WebSocket 연결 및 초기화
onMounted(async () => {
  await connect().then(() => console.log("WebSocket 연결 성공")).catch((error) => console.error("WebSocket 연결 실패:", error));

  // 서버에서 localSenderId를 브로드캐스트로 수신
  subscribe("/topic/senderId", (response: { senderId: number }) => {
    console.log("Received senderId:", response.senderId);
    // 각 사용자가 자신의 senderId를 설정할 수 있도록 처리
    if (localSenderId.value === null) {
      localSenderId.value = response.senderId;
    }
  });

  // 채팅 메시지 수신
  subscribe(`/topic/chat/${props.roomId}`, (message: MessageResponse) => {
    console.log("Received message:", message); // 디버깅용
    messages.value.push(message);
    scrollToBottom(); // 스크롤 맨 아래로 이동
  });

  // 고유 senderId 요청
  wsSendMessage("/app/chat/senderId", {});
});

// 메시지 전송
const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const messagePayload = {
    roomId: props.roomId,
    senderId: localSenderId.value,
    content: newMessage.value,
  };

  // WebSocket을 통해 메시지 전송
  wsSendMessage("/app/chat/send", messagePayload);
  console.log("Sending message:", messagePayload); // 디버깅용

  // 입력창 초기화
  newMessage.value = "";
};

// 스크롤을 맨 아래로 이동
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 메시지 배열 변화 감지 후 스크롤 이동
watch(messages, () => {
  scrollToBottom();
});

// 메시지 응답 타입 정의
interface MessageResponse {
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
}

</script>

<style scoped>
.messages {
  max-height: 300px;
  overflow-y: auto;
}

/* 왼쪽 정렬과 오른쪽 정렬을 위한 CSS */
.text-left {
  align-self: flex-start;
}

.text-right {
  align-self: flex-end;
}
</style>
