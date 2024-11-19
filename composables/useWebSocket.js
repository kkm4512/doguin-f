import { Client } from "@stomp/stompjs";

const { public: { baseWebSocketUrl } } = useRuntimeConfig();

export const useWebSocket = () => {
  const client = new Client({
    brokerURL: `wss://${baseWebSocketUrl}/ws`, // WebSocket 엔드포인트
    connectHeaders: {
      Authorization: localStorage.getItem('jwt') || '',
    },
    debug: (str) => {
      console.log(str); // 디버그 메시지 출력
    },
    onStompError: (frame) => {
      console.error("WebSocket Error:", frame.headers['message']);
    },
  });

  // WebSocket 연결
  const connect = () => {
    return new Promise ((resolve, reject) => {
      if (!client.active) {
        client.onConnect = () => {
          console.log("WebSocket Connected!");
          resolve();
        };
        client.onDisconnect = () => {
          console.log("WebSocket Disconnected!");
        };
        client.onWebSocketClose = (closeEvent) => {
          console.error("WebSocket Closed:", closeEvent);
          reject(new Error("WebSocket connection closed"));
        };
        client.activate();
      } else {
        resolve(); // 이미 활성화된 경우 바로 완료 처리
      }
    });
  };

  // WebSocket 연결 해제
  const disconnect = () => {
    return new Promise((resolve) => {
      if (client.active) {
        client.onDisconnect = () => {
          console.log("WebSocket Disconnected!");
          resolve();
        };
        client.deactivate();
      } else {
        resolve(); // 이미 비활성화된 경우 바로 완료 처리
      }
    });
  };

  // WebSocket 메시지 전송
  const sendMessage = (destination, body) => {
    console.log(`destination: ${destination}`)
    if (client.active) {
      client.publish({
        destination,
        body: JSON.stringify(body),
        headers: {
          Authorization: localStorage.getItem("jwt") || "", // 헤더에 JWT 추가
        },
      });
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const subscribe = (destination, callback) => {
    if (client.connected) {
      console.log(`Subscribing to: ${destination}`);
  
      client.subscribe(
        destination,
        (message) => {
          try {
            const parsedMessage = JSON.parse(message.body);
            console.log("Parsed message:", parsedMessage);
            callback(parsedMessage);
          } catch (error) {
            console.error("Failed to parse message:", error);
          }
        },
        {
          Authorization: localStorage.getItem("jwt") || "", // 헤더에 JWT 추가
        }
      );
    } else {
      console.error("WebSocket is not connected.");
    }
  };
  
  

  return { connect, disconnect, sendMessage, subscribe };
};
